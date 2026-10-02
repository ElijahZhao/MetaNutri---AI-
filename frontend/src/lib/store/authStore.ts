import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ApiErrorLike, AuthResult, User } from '@/types';

const USER_STORAGE_KEY = 'metanutri-user';

const getStoredUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(USER_STORAGE_KEY);
    return stored ? (JSON.parse(stored) as User) : null;
  } catch {
    return null;
  }
};

interface AuthState {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<AuthResult>;
  register: (username: string, email: string, password: string) => Promise<AuthResult>;
  logout: () => void;
  /** Drop the local session without calling the API (used from the 401 path). */
  clearSession: () => void;
  setUser: (user: User | null) => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: getStoredUser(),
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

          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
          set({ user, isLoading: false });
          return { success: true, user };
        } catch (err) {
          set({ isLoading: false });
          const apiError = err as ApiErrorLike;
          const message = apiError.userMessage || apiError.response?.data?.detail || 'Login failed';
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

          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
          set({ user, isLoading: false });
          return { success: true, user };
        } catch (err) {
          set({ isLoading: false });
          const apiError = err as ApiErrorLike;
          const message =
            apiError.userMessage || apiError.response?.data?.detail || 'Registration failed';
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

      clearSession: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem(USER_STORAGE_KEY);
        }
        set({ user: null });
      },

      setUser: (user) => {
        if (typeof window !== 'undefined') {
          if (user) {
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
          } else {
            localStorage.removeItem(USER_STORAGE_KEY);
          }
        }
        set({ user });
      },

      isAuthenticated: () => !!get().user,
    }),
    {
      name: 'metanutri-auth',
      partialize: (state) => ({ user: state.user }),
    }
  )
);
