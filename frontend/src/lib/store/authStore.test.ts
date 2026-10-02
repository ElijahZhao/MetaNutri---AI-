import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/api', () => ({
  authAPI: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    me: vi.fn(),
  },
}));

import { useAuthStore } from '@/lib/store/authStore';
import { authAPI } from '@/lib/api';
import type { AxiosResponse } from 'axios';
import type { LoginResponse, User } from '@/types';

beforeEach(() => {
  localStorage.clear();
  useAuthStore.setState({ user: null, isLoading: false });
  vi.clearAllMocks();
});

describe('authStore.login', () => {
  it('authenticates via cookies, calls /me afterwards and never persists a token', async () => {
    const callOrder: string[] = [];

    vi.mocked(authAPI.login).mockImplementation(async () => {
      callOrder.push('login');
      return {
        data: { token_type: 'bearer', expires_in: 1800 },
      } as unknown as AxiosResponse<LoginResponse>;
    });

    vi.mocked(authAPI.me).mockImplementation(async () => {
      callOrder.push('me');
      return { data: { id: 1, username: 'demo' } } as unknown as AxiosResponse<User>;
    });

    const result = await useAuthStore.getState().login('demo', 'pw');

    expect(result.success).toBe(true);
    // /me needs the cookie that login() set, so it must run second.
    expect(callOrder).toEqual(['login', 'me']);
    expect(useAuthStore.getState().user).toEqual({ id: 1, username: 'demo' });
    // Regression guard: the JWT lives in an httpOnly cookie, never in localStorage.
    expect(localStorage.getItem('metanutri-token')).toBeNull();
  });

  it('returns an error and stays logged out when login fails', async () => {
    vi.mocked(authAPI.login).mockRejectedValue({
      response: { data: { detail: 'invalid credentials' } },
    });

    const result = await useAuthStore.getState().login('demo', 'wrong');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('invalid credentials');
    }
    expect(useAuthStore.getState().user).toBeNull();
  });
});

describe('authStore.logout', () => {
  it('clears the local session immediately and tells the server', async () => {
    useAuthStore.setState({ user: { id: 1, username: 'demo' } as unknown as User });
    vi.mocked(authAPI.logout).mockResolvedValue({} as unknown as AxiosResponse<{ message: string }>);

    useAuthStore.getState().logout();

    expect(useAuthStore.getState().user).toBeNull();
    expect(localStorage.getItem('metanutri-user')).toBeNull();
  });
});
