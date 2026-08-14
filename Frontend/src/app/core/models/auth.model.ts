// =============================================================================
// Authentication related models.
// =============================================================================
import type { User } from './user.model';

export type { User } from './user.model';

/** Current session token pair. */
export interface AuthTokens {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
}

export interface AuthResponse {
  tokens: AuthTokens;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  gender?: 'male' | 'female' | 'other';
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface VerifyEmailRequest {
  token: string;
}
