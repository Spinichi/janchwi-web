import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000, // 30초 - 자주 바뀌지 않는 데이터에 무난
      gcTime: 5 * 60_000, // 5분 - 캐시 보관 시간
      retry: 1, // 실패 시 1번만 재시도
      refetchOnWindowFocus: false, // 창 포커스 시 자동 재조회 비활성화
    },
    mutations: {
      retry: 0, // mutation은 재시도 안 함
    },
  },
});
