// QueryKey 팩토리 - 키 통일 관리로 실수 방지
export const queryKeys = {
  // 인증 관련
  auth: {
    me: () => ['auth', 'me'] as const,
    checkEmail: (email: string) => ['auth', 'check-email', email] as const,
  },

  // 사용자 관련 (추후 확장)
  user: {
    detail: (id: number) => ['user', id] as const,
    list: () => ['user', 'list'] as const,
  },

  // 게시글 관련 (추후 확장)
  posts: {
    list: (page: number) => ['posts', 'list', page] as const,
    detail: (id: number) => ['posts', id] as const,
  },
} as const;
