/**
 * 인증 관련 타입 정의
 * 백엔드 DTO와 동기화 필요
 */

// ============================================
// Request Types
// ============================================

export interface LoginRequest {
  email: string;
  password: string;
}

export type Gender = 'male' | 'female' | 'other';

export interface SignupRequest {
  email: string;
  password: string;
  nickname: string;
  birthDate: string; // ISO 8601 format (YYYY-MM-DD)
  profileImageUrl?: string;
  gender?: Gender;
  bio?: string;
}

export interface SendVerificationRequest {
  email: string;
}

export interface VerifyEmailRequest {
  email: string;
  code: string; // 6자리 숫자
}

export interface RefreshTokenRequest {
  // RefreshToken은 HttpOnly 쿠키로 전송되므로 body는 비어있음
}

// ============================================
// Response Types
// ============================================

export interface LoginResponse {
  userId: number; // Long (백엔드)
}

export interface CheckEmailResponse {
  available: boolean;
}

export interface MessageResponse {
  message: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
}

export interface ErrorResponse {
  message: string;
  statusCode: number;
  fieldErrors?: FieldError[];
}

export interface FieldError {
  field: string;
  message: string;
}
