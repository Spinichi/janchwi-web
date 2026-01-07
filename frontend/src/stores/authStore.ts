import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { setAccessToken, removeAccessToken } from '../shared/api/client';
import type { User } from '../shared/types/auth.types';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;
  login: (user: User, accessToken: string) => void;
  setUser: (user: User) => void;
  setAccessToken: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      accessToken: null,

      login: (user, accessToken) => {
        setAccessToken(accessToken); // localStorage에 토큰 저장
        set({ isAuthenticated: true, user, accessToken });
      },

      setUser: (user) => {
        set({ user });
      },

      setAccessToken: (token) => {
        setAccessToken(token); // localStorage에 토큰 저장
        set({ accessToken: token });
      },

      logout: () => {
        removeAccessToken(); // localStorage에서 토큰 제거
        set({ isAuthenticated: false, user: null, accessToken: null });
      },
    }),
    {
      name: 'auth-store', // localStorage 키 이름
      partialize: (state) => ({
        // accessToken은 localStorage에서 직접 관리하므로 제외
        isAuthenticated: state.isAuthenticated,
        user: state.user,
      }),
    }
  )
);
