import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const USER_STORAGE_KEY = 'metanutri-user';
const TOKEN_STORAGE_KEY = 'metanutri-token';

const getStoredUser = () => {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(USER_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const getStoredToken = () => {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY) || null;
  } catch {
    return null;
  }
};

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: getStoredUser(),
      token: getStoredToken(),
      isLoading: false,

      login: async (username, password) => {
        const { authAPI } = await import('@/lib/api');
        set({ isLoading: true });
        try {
          const res = await authAPI.login({ username, password });
          const token = res.data.access_token;
          
          const meRes = await authAPI.me();
          const user = meRes.data;
          
          localStorage.setItem(TOKEN_STORAGE_KEY, token);
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
          
          set({ user, token, isLoading: false });
          return { success: true, user, token };
        } catch (err) {
          set({ isLoading: false });
          const message = err.response?.data?.detail || 'Login failed';
          return { success: false, error: message };
        }
      },

      register: async (username, email, password) => {
        const { authAPI } = await import('@/lib/api');
        set({ isLoading: true });
        try {
          await authAPI.register({ username, email, password });
          const res = await authAPI.login({ username, password });
          const token = res.data.access_token;
          
          const meRes = await authAPI.me();
          const user = meRes.data;
          
          localStorage.setItem(TOKEN_STORAGE_KEY, token);
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
          
          set({ user, token, isLoading: false });
          return { success: true, user, token };
        } catch (err) {
          set({ isLoading: false });
          const message = err.response?.data?.detail || 'Registration failed';
          return { success: false, error: message };
        }
      },

      logout: () => {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        localStorage.removeItem(USER_STORAGE_KEY);
        set({ user: null, token: null });
      },

      setUser: (user) => {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
        set({ user });
      },

      setToken: (token) => {
        localStorage.setItem(TOKEN_STORAGE_KEY, token);
        set({ token });
      },

      isAuthenticated: () => !!get().token,
    }),
    {
      name: 'metanutri-auth',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);
