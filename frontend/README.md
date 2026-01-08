# Frontend

잔취 서비스의 프론트엔드 애플리케이션입니다.
와인바의 공간감과 여운을 살린 UI/UX를 목표로 설계되었습니다.

## 기술 스택
- React 19
- TypeScript
- Vite
- Tailwind CSS
- Lucide React (아이콘)

## 주요 구현 기능
- **온보딩 페이지**: 서비스 소개 및 핵심 기능 안내
- **술 목록 그리드**: 와인, 위스키, 칵테일 등 프리미엄 셀렉션
- **술 카드 컴포넌트**: 평점, 리뷰, 태그 정보 표시
- **헤더 네비게이션**: 검색, 메시지, 프로필, 로그인
- **React Router**: 클라이언트 사이드 라우팅 (v6)
- **인증 시스템** (2026-01-08 구현):
  - 회원가입 페이지 (이메일, 비밀번호, 닉네임, 생년월일, 성별, 자기소개)
  - 로그인 페이지 (이메일/비밀번호 인증)
  - 이메일 인증 페이지 (6자리 코드 입력)
  - Axios API 클라이언트 (토큰 관리, 자동 갱신)
  - Zustand 전역 상태 관리 (Auth Store)

## 디자인 컨셉
- **다크 와인바 테마**: 깊은 어두운 배경과 따뜻한 베이지/앰버 톤
- **글래스모피즘**: backdrop-filter와 반투명 배경으로 부유하는 느낌
- **Noto Serif KR 폰트**: 세련되고 고급스러운 서체
- **부드러운 인터랙션**: 섬세한 hover 효과와 transition

## 프로젝트 구조
```
src/
├── features/           # 기능별 모듈
│   └── alcohol/        # 술 관련 기능
│       ├── components/ # AlcoholCard, AlcoholGrid
│       └── types/      # 타입 정의
├── pages/              # 페이지 컴포넌트
│   ├── Home.tsx        # 메인 페이지
│   └── Onboarding.tsx  # 온보딩 페이지
├── router/             # 라우팅 시스템
│   ├── Router.tsx
│   ├── RouterContext.tsx
│   └── useRouter.ts
├── shared/             # 공유 리소스
│   ├── components/     # Header 등 공통 컴포넌트
│   ├── ui/             # Button, Badge, Card 등 UI 컴포넌트
│   └── utils/          # 유틸리티 함수
└── styles/             # 전역 스타일
    └── globals.css     # Tailwind 설정 및 커스텀 스타일
```

## 설계 포인트
- **Feature-based folder structure**: 기능별로 응집도 높은 모듈화
- **Barrel pattern** (`index.ts`): export 관리 및 import 경로 단순화
- **Inline Styles**: CSS 충돌 방지 및 컴포넌트 독립성 보장
- **타입 안전성**: TypeScript strict mode 활성화
- **확장 가능한 아키텍처**: 새로운 기능 추가 용이

## 개발 서버 실행
```bash
npm install
npm run dev
```

## 빌드
```bash
npm run build
```

## 배포 (Vercel)
- **프로덕션 URL**: https://www.janchwi.site
- **API 엔드포인트**: https://api.janchwi.site/api
- **환경변수**: `VITE_API_BASE_URL`
- **SPA 라우팅**: `vercel.json` 설정 완료
