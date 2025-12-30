/**
 * 사용자 관련 타입 정의
 * 백엔드 User 엔티티와 동기화 필요
 */

import { Gender } from './auth.types';

export interface User {
  id: number; // Long (백엔드)
  email: string;
  nickname: string;
  birthDate: string; // ISO 8601 format (YYYY-MM-DD)
  profileImageUrl?: string;
  gender?: Gender;
  bio?: string;
  isEmailVerified: boolean;
  isActive: boolean;
  lastLoginAt?: string; // ISO 8601 format
  createdAt: string; // ISO 8601 format
  updatedAt: string; // ISO 8601 format
}

export interface UserProfile {
  id: number; // Long (백엔드)
  email: string;
  nickname: string;
  birthDate: string;
  profileImageUrl?: string;
  gender?: Gender;
  bio?: string;
}
