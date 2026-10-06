import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ApiErrorLike, AuthResult, User } from '@/types';

interface AuthState {
  /** Display-only copy of the signed-in user. The JWT itself is an httpOnly cookie. */
  user: User | null;
  /**
   * False until `persist` has read localStorage. Guards must wait on this: the
   * very first client render (and SSR) always has `user: null`, so acting on it
   * early would bounce a signed-in user back to /login on a direct page load.
   */
  hydrated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<AuthResult>;
  register: (username: string, email: string, password: string) => Promise<AuthResult>;
  logout: () => void;
  /** Drop the local session without calling the API (used from the 401 path). */
  clearSession: () => void;
  setUser: (user: User | null) => void;
  setHydrated: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      hydrated: false,
      isLoading: false,

      login: async (username, password) => {
        const { authAPI } = await import('@/lib/api');
        set({ isLoading: true });
        try {
          // The server responds with httpOnly cookies; nothing is persisted here
          // except the display-only user object.
          await authAPI.login({ username, password });

          const meRes = await authAPI.me();
          const user = meRes.data;

          set({ user, isLoading: false });
          return { success: true, user };
        } catch (err) {
          set({ isLoading: false });
          const apiError = err as ApiErrorLike;
          // `detail` may be an array (422 validation errors); only a string here.
          const detail = apiError.response?.data?.detail;
          const message =
            apiError.userMessage ||
            (typeof detail === 'string' ? detail : undefined) ||
            'Login failed';
          return { success: false, error: message };
        }
      },

      register: async (username, email, password) => {
        const { authAPI } = await import('@/lib/api');
        set({ isLoading: true });
        try {
          await authAPI.register({ username, email, password });
          await authAPI.login({ username, password });

          const meRes = await authAPI.me();
          const user = meRes.data;

          set({ user, isLoading: false });
          return { success: true, user };
        } catch (err) {
          set({ isLoading: false });
          const apiError = err as ApiErrorLike;
          // See login: validation errors carry an array, not a string.
          const detail = apiError.response?.data?.detail;
          const message =
            apiError.userMessage ||
            (typeof detail === 'string' ? detail : undefined) ||
            'Registration failed';
          return { success: false, error: message };
        }
      },

      logout: () => {
        // Clear locally first so the UI reacts immediately; the API call only
        // needs to revoke the server-side session and clear the cookies.
        get().clearSession();
        void import('@/lib/api').then(({ authAPI }) =>
          authAPI.logout().catch(() => {
            // Already signed out / offline — local state is cleared either way.
          })
        );
      },

      clearSession: () => set({ user: null }),

      setUser: (user) => set({ user }),

      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: 'metanutri-auth',
      // Only the display object is persisted — never a token (that lives in an
      // httpOnly cookie). `hydrated` is runtime state and must not be stored.
      partialize: (state) => ({ user: state.user }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);
