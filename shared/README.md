# Shared Types

백엔드와 프론트엔드에서 공유하는 타입 정의입니다.

## 디렉토리 구조

```
shared/
└── types/
    ├── index.ts         # 모든 타입을 re-export
    ├── auth.types.ts    # 인증 관련 타입
    ├── user.types.ts    # 사용자 관련 타입
    └── common.types.ts  # 공통 타입
```

## 사용 방법

### 프론트엔드에서 사용

1. `tsconfig.json`에 path alias 추가:

```json
{
  "compilerOptions": {
    "paths": {
      "@shared/*": ["../shared/*"]
    }
  }
}
```

2. import해서 사용:

```typescript
import { LoginRequest, LoginResponse } from '@shared/types';

const loginData: LoginRequest = {
  email: 'user@example.com',
  password: 'password123',
};
```

## 주의사항

- 백엔드 DTO 변경 시 이 파일들도 함께 업데이트 필요
- 타입 불일치 방지를 위해 주기적으로 동기화 확인
- OpenAPI 스펙에서 자동 생성하는 방법도 고려 가능
