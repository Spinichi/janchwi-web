import { HTTPError } from 'ky';

// 에러 응답 본문 타입
interface ErrorBody {
  success?: boolean;
  message?: string;
  status?: number;
  code?: string; // 에러 코드 (ACCOUNT_LOCKED, EMAIL_NOT_VERIFIED 등)
  timestamp?: string;
  errors?: Array<{ field: string; message: string }>;
}

// 에러 응답 본문 캐시 (Promise로 저장해서 동시 호출 시 중복 파싱 방지)
const errorBodyCache = new WeakMap<HTTPError, Promise<ErrorBody>>();

// HTTPError의 응답 본문을 파싱 (캐시 사용, 절대 throw 하지 않음)
const getErrorBody = async (error: HTTPError): Promise<ErrorBody> => {
  // 이미 캐시된 Promise가 있으면 재사용
  if (errorBodyCache.has(error)) {
    return errorBodyCache.get(error)!;
  }

  // 파싱 Promise를 생성하고 즉시 캐시에 저장 (동시 호출 방지)
  const parsePromise = (async (): Promise<ErrorBody> => {
    try {
      // Response를 복제해서 읽기 (원본 유지)
      const clonedResponse = error.response.clone();
      const errorBody = await clonedResponse.json();
      return errorBody as ErrorBody;
    } catch {
      // JSON 파싱 실패 시 빈 객체 반환 (절대 throw 하지 않음)
      return {};
    }
  })();

  errorBodyCache.set(error, parsePromise);
  return parsePromise;
};

// HTTPError에서 사용자 친화적 메시지 추출
export const getErrorMessage = async (error: unknown): Promise<string> => {
  if (error instanceof HTTPError) {
    const errorBody = await getErrorBody(error);
    if (errorBody.message) {
      return errorBody.message;
    }

    // JSON 파싱 실패 시 상태 코드별 기본 메시지
    switch (error.response.status) {
      case 400:
        return '잘못된 요청입니다.';
      case 401:
        return '인증이 필요합니다.';
      case 403:
        return '권한이 없습니다.';
      case 404:
        return '요청한 리소스를 찾을 수 없습니다.';
      case 409:
        return '이미 존재하는 데이터입니다.';
      case 429:
        return '너무 많은 요청을 보냈습니다. 잠시 후 다시 시도해주세요.';
      case 500:
        return '서버 오류가 발생했습니다.';
      case 502:
        return '게이트웨이 오류가 발생했습니다.';
      case 503:
        return '서비스를 일시적으로 사용할 수 없습니다.';
      default:
        return `오류가 발생했습니다. (${error.response.status})`;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return '알 수 없는 오류가 발생했습니다.';
};

// 계정 잠김 예외 확인 (에러 코드 우선, 메시지 문자열은 fallback)
export const isAccountLockedException = async (error: unknown): Promise<boolean> => {
  if (error instanceof HTTPError && error.response.status === 403) {
    const errorBody = await getErrorBody(error);

    // 1순위: 에러 코드로 판별 (안정적)
    if (errorBody.code === 'ACCOUNT_LOCKED') {
      return true;
    }

    // 2순위: 메시지 문자열로 판별 (fallback, 추후 제거 가능)
    const message = errorBody.message || '';
    return message.includes('차단') || message.includes('잠금') || message.includes('잠겼습니다');
  }
  return false;
};

// 이메일 미인증 예외 확인 (에러 코드 우선, 메시지 문자열은 fallback)
export const isEmailNotVerifiedException = async (error: unknown): Promise<boolean> => {
  if (error instanceof HTTPError && error.response.status === 403) {
    const errorBody = await getErrorBody(error);

    // 1순위: 에러 코드로 판별 (안정적)
    if (errorBody.code === 'EMAIL_NOT_VERIFIED') {
      return true;
    }

    // 2순위: 메시지 문자열로 판별 (fallback, 추후 제거 가능)
    const message = errorBody.message || '';
    return message.includes('이메일 인증');
  }
  return false;
};

// 네트워크 에러 확인
export const isNetworkError = (error: unknown): boolean => {
  if (error instanceof Error) {
    return error.message.includes('fetch') || error.message.includes('network');
  }
  return false;
};
