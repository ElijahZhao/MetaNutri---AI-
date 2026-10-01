import type { AxiosError, AxiosResponse } from 'axios';

/**
 * Shape the axios response interceptor in `lib/api.ts` attaches to every
 * rejected request, so callers can render a user-facing message.
 */
export type ApiErrorLike = AxiosError<{ detail?: string; message?: string }> & {
  userMessage?: string;
  statusCode?: number;
  isNetworkError?: boolean;
  isTimeout?: boolean;
};

/** Convenience alias for the resolved `data` of an axios call. */
export type ApiResult<T> = AxiosResponse<T>;
