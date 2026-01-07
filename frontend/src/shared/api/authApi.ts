import { apiClient, extractAccessToken, getJSON, postJSON } from './client';
import type {
  LoginRequest,
  LoginResponse,
  SignupRequest,
  SignupResponse,
  VerifyEmailRequest,
  SendVerificationRequest,
  CheckEmailResponse,
  MessageResponse,
} from '../types/auth.types';

// 로그인
export const login = async (request: LoginRequest): Promise<{ response: LoginResponse; accessToken: string }> => {
  const response = await apiClient.post('v1/auth/login', { json: request });
  const data = await response.json<LoginResponse>();
  const accessToken = extractAccessToken(response);

  if (!accessToken) {
    throw new Error('Access token not found in response');
  }

  return { response: data, accessToken };
};

// 회원가입 (이메일 인증 전이므로 토큰 발급 안함, userId만 반환)
export const signup = async (request: SignupRequest): Promise<SignupResponse> => {
  return postJSON<SignupResponse>('v1/auth/signup', request);
};

// 이메일 중복 체크
export const checkEmail = async (email: string): Promise<CheckEmailResponse> => {
  return getJSON<CheckEmailResponse>('v1/auth/check-email', {
    searchParams: { email },
  });
};

// 이메일 인증 코드 발송
export const sendVerificationCode = async (request: SendVerificationRequest): Promise<MessageResponse> => {
  return postJSON<MessageResponse>('v1/auth/send-verification', request);
};

// 이메일 인증 코드 검증 (인증 성공 시 자동 로그인)
export const verifyEmail = async (request: VerifyEmailRequest): Promise<{ response: LoginResponse; accessToken: string }> => {
  const response = await apiClient.post('v1/auth/verify-email', { json: request });
  const data = await response.json<LoginResponse>();
  const accessToken = extractAccessToken(response);

  if (!accessToken) {
    throw new Error('Access token not found in response');
  }

  return { response: data, accessToken };
};

// 로그아웃
export const logout = async (): Promise<MessageResponse> => {
  return postJSON<MessageResponse>('v1/auth/logout', {});
};
