import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/api', () => ({
  authAPI: {
    login: vi.fn(),
    register: vi.fn(),
    me: vi.fn(),
  },
}));

import { useAuthStore } from '@/lib/store/authStore';
import { authAPI } from '@/lib/api';
import type { AxiosResponse } from 'axios';
import type { TokenResponse, User } from '@/types';

beforeEach(() => {
  localStorage.clear();
  useAuthStore.setState({ user: null, token: null, isLoading: false });
  vi.clearAllMocks();
});

describe('authStore.login', () => {
  it('persists the token before calling /me', async () => {
    vi.mocked(authAPI.login).mockResolvedValue({
      data: { access_token: 'tok-123' },
    } as unknown as AxiosResponse<TokenResponse>);

    let tokenSeenByMe: string | null = null;
    vi.mocked(authAPI.me).mockImplementation(async () => {
      // 请求拦截器从 localStorage 读取 token；若先调 /me 再落盘，这里会是 null，
      // 线上表现为登录后立刻 401。
      tokenSeenByMe = localStorage.getItem('metanutri-token');
      return { data: { id: 1, username: 'demo' } } as unknown as AxiosResponse<User>;
    });

    const result = await useAuthStore.getState().login('demo', 'pw');

    expect(result.success).toBe(true);
    expect(tokenSeenByMe).toBe('tok-123');
    expect(useAuthStore.getState().user).toEqual({ id: 1, username: 'demo' });
    expect(useAuthStore.getState().token).toBe('tok-123');
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
    expect(useAuthStore.getState().token).toBeNull();
  });
});
