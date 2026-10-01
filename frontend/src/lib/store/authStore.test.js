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

beforeEach(() => {
  localStorage.clear();
  useAuthStore.setState({ user: null, token: null, isLoading: false });
  vi.clearAllMocks();
});

describe('authStore.login', () => {
  it('persists the token before calling /me', async () => {
    authAPI.login.mockResolvedValue({ data: { access_token: 'tok-123' } });

    let tokenSeenByMe = null;
    authAPI.me.mockImplementation(async () => {
      // 请求拦截器从 localStorage 读取 token；若先调 /me 再落盘，这里会是 null，
      // 线上表现为登录后立刻 401。
      tokenSeenByMe = localStorage.getItem('metanutri-token');
      return { data: { id: 1, username: 'demo' } };
    });

    const result = await useAuthStore.getState().login('demo', 'pw');

    expect(result.success).toBe(true);
    expect(tokenSeenByMe).toBe('tok-123');
    expect(useAuthStore.getState().user).toEqual({ id: 1, username: 'demo' });
    expect(useAuthStore.getState().token).toBe('tok-123');
  });

  it('returns an error and stays logged out when login fails', async () => {
    authAPI.login.mockRejectedValue({ response: { data: { detail: 'invalid credentials' } } });

    const result = await useAuthStore.getState().login('demo', 'wrong');

    expect(result.success).toBe(false);
    expect(result.error).toBe('invalid credentials');
    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().token).toBeNull();
  });
});
