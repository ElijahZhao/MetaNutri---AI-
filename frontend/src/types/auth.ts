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

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export type AuthResult =
  { success: true; user: User; token: string } | { success: false; error: string };
