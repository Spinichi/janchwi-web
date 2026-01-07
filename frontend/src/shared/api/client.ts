import ky, { HTTPError } from 'ky';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// Access Token을 localStorage에서 가져오는 함수
const getAccessToken = (): string | null => {
  return localStorage.getItem('accessToken');
};

// Access Token을 localStorage에 저장하는 함수
export const setAccessToken = (token: string): void => {
  localStorage.setItem('accessToken', token);
};

// Access Token을 localStorage에서 제거하는 함수
export const removeAccessToken = (): void => {
  localStorage.removeItem('accessToken');
};

// Refresh Token으로 Access Token 재발급
let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;

const refreshAccessToken = async (): Promise<string> => {
  // 이미 갱신 중이면 기존 Promise 반환
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const response = await ky.post(`${API_BASE_URL}/v1/auth/refresh`, {
        credentials: 'include', // httpOnly 쿠키 포함
      });

      const authHeader = response.headers.get('Authorization');
      if (!authHeader) {
        throw new Error('Authorization header not found');
      }

      const newAccessToken = authHeader.replace('Bearer ', '');
      setAccessToken(newAccessToken);

      return newAccessToken;
    } catch (error) {
      // 갱신 실패 시 로그아웃 처리
      removeAccessToken();
      window.location.href = '/login';
      throw error;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

// ky 인스턴스 생성
export const apiClient = ky.create({
  prefixUrl: API_BASE_URL,
  credentials: 'include', // httpOnly 쿠키 포함
  timeout: 30000, // 30초
  retry: {
    limit: 2,
    methods: ['get', 'put', 'head', 'delete', 'options', 'trace'],
    statusCodes: [408, 413, 429, 500, 502, 503, 504],
  },
  hooks: {
    beforeRequest: [
      (request) => {
        // Access Token을 Authorization 헤더에 자동 첨부
        const token = getAccessToken();
        if (token) {
          request.headers.set('Authorization', `Bearer ${token}`);
        }
      },
    ],
    afterResponse: [
      async (request, _options, response) => {
        // 401 Unauthorized - Access Token 만료
        if (response.status === 401) {
          // 로그인/회원가입 요청은 토큰 갱신 시도하지 않음
          const url = request.url;
          if (url.includes('/auth/login') || url.includes('/auth/signup')) {
            return response; // 그대로 반환
          }

          try {
            // Refresh Token으로 Access Token 재발급
            const newAccessToken = await refreshAccessToken();

            // 원래 요청에 새 토큰 적용하여 재시도
            request.headers.set('Authorization', `Bearer ${newAccessToken}`);
            return ky(request);
          } catch (error) {
            // 갱신 실패 시 에러 전파
            throw error;
          }
        }

        return response;
      },
    ],
  },
});

// Authorization 헤더에서 Access Token 추출 (로그인/회원가입 응답용)
export const extractAccessToken = (response: Response): string | null => {
  const authHeader = response.headers.get('Authorization');
  if (!authHeader) return null;
  return authHeader.replace('Bearer ', '');
};

// HTTPError를 사용자 친화적 메시지로 변환
export const getErrorMessage = async (error: unknown): Promise<string> => {
  if (error instanceof HTTPError) {
    try {
      const errorBody = await error.response.json();
      return errorBody.message || '요청 처리 중 오류가 발생했습니다.';
    } catch {
      return `서버 오류: ${error.response.status} ${error.response.statusText}`;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return '알 수 없는 오류가 발생했습니다.';
};

// 자주 쓰는 래퍼 함수 (타입/코드 가독성 향상)
export const getJSON = <T>(url: string, options?: Parameters<typeof apiClient.get>[1]) =>
  apiClient.get(url, options).json<T>();

export const postJSON = <T>(url: string, json: unknown, options?: Parameters<typeof apiClient.post>[1]) =>
  apiClient.post(url, { json, ...options }).json<T>();

export const putJSON = <T>(url: string, json: unknown, options?: Parameters<typeof apiClient.put>[1]) =>
  apiClient.put(url, { json, ...options }).json<T>();

export const deleteJSON = <T>(url: string, options?: Parameters<typeof apiClient.delete>[1]) =>
  apiClient.delete(url, options).json<T>();
