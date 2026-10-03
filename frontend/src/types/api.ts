import type { AxiosError } from 'axios';

/**
 * FastAPI returns `detail` as a string for explicit HTTPExceptions but as an
 * array of `{ msg, loc, type }` objects for request-validation (422) failures.
 */
export type ApiErrorDetail =
  | string
  | { msg?: string }
  | Array<string | { msg?: string }>;

/**
 * Shape the axios response interceptor in `lib/api.ts` attaches to every
 * rejected request, so callers can render a user-facing message.
 */
export type ApiErrorLike = AxiosError<{ detail?: ApiErrorDetail; message?: string }> & {
  userMessage?: string;
  statusCode?: number;
  isNetworkError?: boolean;
  isTimeout?: boolean;
};
