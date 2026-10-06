/**
 * Auth / user domain types.
 * Shapes mirror backend pydantic models in backend/app/schemas/user.py.
 */

export interface User {
  id: string;
  username: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterPayload extends LoginCredentials {
  email: string;
}

/**
 * Login/refresh response. The JWTs live in httpOnly cookies, so the body only
 * carries metadata — there is no token for JavaScript to read.
 */
export interface LoginResponse {
  token_type: string;
  expires_in: number;
}

export type AuthResult = { success: true; user: User } | { success: false; error: string };
