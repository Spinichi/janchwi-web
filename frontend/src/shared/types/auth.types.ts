// 백엔드 User 엔티티와 매칭되는 사용자 타입
export interface User {
  id: number;
  email: string;
  nickname: string;
  birthDate: string; // ISO 8601 format (YYYY-MM-DD)
  profileImageUrl?: string;
  gender: 'male' | 'female' | 'other';
  bio?: string;
  isEmailVerified: boolean;
  isActive: boolean;
  createdAt: string; // ISO 8601 format
  updatedAt: string; // ISO 8601 format
}

// 로그인 요청
export interface LoginRequest {
  email: string;
  password: string;
}

// 회원가입 요청
export interface SignupRequest {
  email: string;
  password: string;
  nickname: string;
  birthDate: string; // YYYY-MM-DD
  profileImageUrl?: string;
  gender: 'male' | 'female' | 'other';
  bio?: string;
}

// 이메일 인증 코드 검증 요청
export interface VerifyEmailRequest {
  email: string;
  code: string;
}

// 이메일 인증 코드 발송 요청
export interface SendVerificationRequest {
  email: string;
}

// 로그인 응답 (백엔드 LoginResponse)
export interface LoginResponse {
  userId: number;
}

// 회원가입 응답 (백엔드 LoginResponse 재사용)
export interface SignupResponse {
  userId: number;
}

// 이메일 중복 체크 응답
export interface CheckEmailResponse {
  available: boolean;
}

// 메시지 응답
export interface MessageResponse {
  message: string;
}

// Access Token 재발급 응답
export interface RefreshTokenResponse {
  accessToken: string;
}

// 에러 응답
export interface ErrorResponse {
  message: string;
  status: number;
  timestamp?: string;
}

// Zustand Auth Store 상태
export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (user: User, accessToken: string) => void;
  setAccessToken: (token: string) => void;
  logout: () => void;
}
