
# 🍷 잔취 (Janchwi)

> **한 잔의 여운을 기록하다**
> 조용한 밤, 술의 향과 취향, 그리고 대화를 남기는 공간

---

## 📌 프로젝트 소개

**잔취**는 술을 단순히 소비하거나 평가하는 서비스가 아니라,
한 잔 이후에 남는 **취향·감정·대화의 여운**을 기록하는 커뮤니티 웹 서비스입니다.

와인바에 앉아 조용히 술 이야기를 나누는 경험을 웹 환경으로 옮기는 것을 목표로 하였으며,
과한 상업성이나 판매 중심 UI를 지양하고
**공간감 있는 다크 UI와 차분한 카피**를 중심으로 설계했습니다.

본 레포지토리는 프론트엔드, 백엔드, 인프라를 하나의 맥락으로 관리하는
**모노레포 구조**를 기반으로 합니다.

---

## 🎯 기획 의도

* 기존 술 리뷰 서비스가 **상품 정보·가격·판매 중심 UI**에 치우쳐 있는 문제
* "무엇을 마셨는가"보다 **어떤 밤에, 어떤 감정으로 마셨는가**에 집중
* 리뷰, 댓글, 실시간 대화를 통해
  **혼자가 아닌, 느슨하게 연결된 커뮤니티 경험**을 지향

---

## 🧩 주요 기능 및 구현 현황

### ✅ Frontend (구현 완료)

#### 기본 UI/UX
* **온보딩 페이지**: 서비스 소개 및 핵심 기능 안내
* **헤더 네비게이션**: 로고, 검색바, 메시지, 프로필, 로그인
* **술 목록 그리드**: 카테고리 필터 및 카드 레이아웃
* **술 카드 컴포넌트**: 이미지, 평점, 리뷰 수, 태그 표시
* **커스텀 라우터**: Context API 기반 SPA 라우팅
* **다크 와인바 테마**: 글래스모피즘 및 부드러운 인터랙션
* **Noto Serif KR 폰트**: 세련된 한글 서체 적용

#### 인증 UI (2025-12-31 구현)
* **회원가입 페이지**: 이메일, 비밀번호, 닉네임, 생년월일, 성별, 자기소개 입력 폼
* **로그인 페이지**: 이메일/비밀번호 입력 및 인증 처리

### ✅ Backend (구현 완료 - 2025-12-31)

#### 인증/인가 시스템
* **JWT 기반 인증**: Access Token (15분) + Refresh Token (7일)
* **회원가입 API**: 이메일/닉네임 중복 체크, 만 19세 이상 검증, BCrypt 암호화
* **로그인 API**: 계정 잠금 (5회 실패 시 30분), 이메일 미인증 차단
* **이메일 인증**: 6자리 코드 발송, 15분 만료, 5회 시도 제한
* **토큰 관리**: Access Token 재발급, 로그아웃, Refresh Token SHA-256 해싱
* **보안 필터**: JWT 인증 필터, Spring Security 통합

#### 기술 스택
* **Java 25** + **Spring Boot 4.0.0**
* **PostgreSQL 16** (Docker)
* **Spring Security 7.0.1** + **JJWT 0.12.6**
* **Spring Mail (SMTP)** - 이메일 발송
* **SpringDoc OpenAPI 2.7.0** - Swagger UI
* **26개 Unit Test 통과** (Mockito)

#### 엔티티 설계
* **User 테이블**: Long ID, Gender Enum, boolean primitives, BCrypt password (60자)
* **RefreshToken 테이블**: SHA-256 해시 저장
* **타입 안정성 강화**: Integer→Long, String→Enum, Boolean→boolean

#### API 엔드포인트
* `POST /v1/auth/signup` - 회원가입
* `POST /v1/auth/login` - 로그인
* `POST /v1/auth/logout` - 로그아웃
* `POST /v1/auth/send-verification` - 인증 코드 발송
* `POST /v1/auth/verify-email` - 이메일 인증
* `POST /v1/auth/refresh` - Access Token 재발급
* `GET /v1/auth/check-email` - 이메일 중복 체크

### 🔄 Shared Types (구현 완료 - 2025-12-31)
* **auth.types.ts**: 인증 관련 Request/Response 타입 정의
* **user.types.ts**: 사용자 엔티티 타입 정의
* **Gender 타입**: 백엔드 Enum과 동기화

### 📋 Frontend (예정)

* 술 상세 페이지
* 별점 및 리뷰 작성 UI
* 댓글 기반 대화 흐름
* 커뮤니티 게시판 UI
* 실시간 채팅 UI
* 이미지 및 동영상 업로드 UI
* **API 연동** (회원가입, 로그인, 이메일 인증)
* **JWT 토큰 관리** (자동 갱신)

### 📋 Backend (예정)

* 술 정보 API
* 리뷰/댓글 API
* 게시판 API
* WebSocket 실시간 채팅
* 이미지 업로드 (S3 연동)
* Redis 캐싱

---

## 🎨 UI / UX 컨셉

* **와인바 인테리어를 연상시키는 배경 구성**
* 단순한 검은색 배경이 아닌,
  공간감 있는 배경 + 블러 + 조명 레이어 조합
* 텍스트와 카드가 "페이지 위에 배치된 요소"가 아니라
  **공간 안에 자연스럽게 부유하는 느낌**을 주도록 설계
* 과도한 강조, 마케팅성 문구, 박스형 레이아웃 최소화

---

## 🛠 기술 스택

### Frontend

* React 19
* TypeScript (strict mode)
* Vite
* Tailwind CSS
* Lucide React (아이콘)

### Backend

* Java 25
* Spring Boot 4.0.0
* Spring Security 7.0.1
* Spring Data JPA (Hibernate)
* PostgreSQL 16
* JWT (JJWT 0.12.6)
* Spring Mail (SMTP)
* SpringDoc OpenAPI 3

### 상태 및 데이터 관리

* Context API (커스텀 라우터)
* React Query (예정)
* Zustand (예정)

### Infra (예정)

* Docker / Docker Compose
* Nginx (Reverse Proxy)
* AWS EC2
* Let's Encrypt (HTTPS)
* GitHub Actions (CI/CD)

### 구조 및 설계

* Feature-based folder structure
* Barrel pattern (`index.ts`) 기반 export 관리
* Inline styles로 CSS 충돌 방지
* 타입 안전성 강화 (type-only imports)
* 반응형 UI 고려
* Domain-Driven Design (백엔드)

---

## 📁 프로젝트 구조

```bash
janchwi-web/
├─ frontend/              # React + TypeScript + Vite
│  ├─ src/
│  │  ├─ features/        # 기능별 모듈
│  │  │  ├─ alcohol/      # 술 관련 기능
│  │  │  │  ├─ components/ # AlcoholCard, AlcoholGrid
│  │  │  │  └─ types/      # 타입 정의
│  │  │  └─ auth/         # 인증 관련 기능 (회원가입, 로그인)
│  │  ├─ pages/           # 페이지 컴포넌트
│  │  │  ├─ Home.tsx      # 메인 페이지
│  │  │  ├─ Onboarding.tsx # 온보딩 페이지
│  │  │  ├─ Signup.tsx    # 회원가입 페이지
│  │  │  └─ Login.tsx     # 로그인 페이지
│  │  ├─ router/          # 커스텀 라우팅 시스템
│  │  │  ├─ Router.tsx
│  │  │  ├─ RouterContext.tsx
│  │  │  └─ useRouter.ts
│  │  ├─ shared/          # 공유 리소스
│  │  │  ├─ components/   # Header 등 공통 컴포넌트
│  │  │  ├─ ui/           # Button, Badge, Card 등
│  │  │  └─ utils/        # 유틸리티 함수
│  │  └─ styles/          # 전역 스타일
│  │     └─ globals.css   # Tailwind + 커스텀 스타일
│  └─ public/             # 정적 파일 (이미지, 폰트 등)
│
├─ backend/               # Spring Boot API Server
│  ├─ src/main/java/site/janchwi/
│  │  ├─ domain/          # 도메인 단위 패키지
│  │  │  ├─ auth/         # 인증/인가 (Controller, Service, DTO)
│  │  │  ├─ users/        # 사용자 (Entity, Repository)
│  │  │  └─ refreshtokens/ # Refresh Token (Entity, Repository)
│  │  ├─ global/          # 전역 설정
│  │  │  ├─ config/       # JWT, Security, Swagger
│  │  │  ├─ exception/    # 예외 처리
│  │  │  └─ util/         # 유틸리티
│  │  └─ test/            # 테스트 코드 (26개 Unit Test)
│  └─ README.md           # 백엔드 상세 문서
│
├─ shared/                # 프론트/백엔드 공통 타입 정의
│  └─ types/
│     ├─ auth.types.ts    # 인증 관련 타입
│     └─ user.types.ts    # 사용자 관련 타입
│
├─ infra/                 # Docker / CI / IaC (예정)
└─ TODOLIST.md            # 프로젝트 전체 작업 목록
```

> 기능 단위로 분리하여 **확장성과 유지보수성을 고려한 구조**를 목표로 합니다.

---

## 💡 네이밍 설명

**잔취**는

* *잔의 향기*
* *잔에 취하다*

라는 두 가지 의미를 동시에 담고 있습니다.

술 그 자체보다,
그 이후에 남는 **향·기억·여운**을 기록하는 서비스라는 방향성을
이름에 반영했습니다.

---

## 📝 Commit Message Convention

본 레포지토리는 **변경 이력을 명확하게 관리하기 위해**
아래의 커밋 메시지 컨벤션을 따릅니다.

### 📌 기본 형식

```text
<type>(<scope>): <summary>
```

---

### 🔖 Type (변경 유형)

| Type       | 설명                      |
| ---------- | ----------------------- |
| `feat`     | 새로운 기능 추가               |
| `fix`      | 버그 수정                   |
| `docs`     | 문서 변경 (README, 설계 문서 등) |
| `chore`    | 프로젝트 설정, 초기 구성, 인프라성 작업 |
| `build`    | 빌드 시스템, 의존성 설정 변경       |
| `refactor` | 리팩토링 (기능 변화 없음)         |
| `test`     | 테스트 코드 추가 또는 수정         |

---

### 🧭 Scope (변경 영역)

Scope는 **변경이 발생한 기술 영역**을 의미합니다.
도메인(user, review 등)은 scope로 사용하지 않습니다.

#### 사용 가능한 scope 예시

| Scope      | 설명                   |
| ---------- | -------------------- |
| `backend`  | 백엔드 애플리케이션           |
| `frontend` | 프론트엔드 애플리케이션         |
| `infra`    | 서버, Nginx, AWS 등 인프라 |
| `db`       | 데이터베이스, 마이그레이션       |
| `auth`     | 인증 / 보안 관련           |
| `docs`     | 문서                   |

> ⚠️ **도메인 명(user, review, comment 등)은 scope로 사용하지 않습니다.**
> 도메인 관련 내용은 summary에서 설명합니다.

---

### ✏️ Summary (요약)

* **한글로 작성**
* 변경의 목적과 내용을 명확히 표현
* 명령문 형태로 작성

#### 예시

```text
feat(backend): 사용자 로그인 API 추가
feat(frontend): 로그인 화면 및 입력 폼 구현
chore(infra): EC2 Nginx 서버 설정 추가
docs(backend): 백엔드 환경 구성 문서 정리
```

---

### ✅ 올바른 커밋 메시지 예시

```text
chore(backend): Spring Boot 백엔드 초기 프로젝트 구성
feat(backend): 사용자 도메인 기본 CRUD API 구현
fix(backend): 로그인 토큰 만료 처리 오류 수정
docs: 프로젝트 전체 진행 상황 문서 업데이트
```

---

### ❌ 잘못된 커밋 메시지 예시

```text
feat(user): 로그인 구현
update backend
fix: bug
```

* scope가 모호하거나
* 변경 범위가 드러나지 않거나
* 의미 없는 요약은 지양합니다.

---

### 🎯 컨벤션 적용 목적

* 커밋 로그의 가독성 향상
* 변경 이력 추적 용이
* 프론트엔드 / 백엔드 / 인프라 변경 명확화
* 향후 협업 및 유지보수 비용 감소

---

### 📌 한 줄 요약

> **Scope는 "어디에서 변경되었는지",
> Summary는 "무엇을 변경했는지"를 설명합니다.**

---

## 🚀 개발 현황 및 계획

### ✅ 완료된 작업 (2025-12-31 기준)

#### Backend
- [x] JWT 인증/인가 시스템 구현 완료
- [x] 회원가입, 로그인, 이메일 인증 API
- [x] 26개 Unit Test 작성 및 통과
- [x] Swagger UI 통합
- [x] 타입 안정성 강화 (Long ID, Gender Enum, boolean primitives)
- [x] PostgreSQL 연동 및 엔티티 설계

#### Frontend
- [x] 온보딩 페이지
- [x] 메인 페이지 (술 목록 그리드)
- [x] 헤더 네비게이션
- [x] 회원가입 페이지
- [x] 로그인 페이지
- [x] 커스텀 라우터
- [x] 다크 와인바 테마

#### Shared
- [x] Auth/User 타입 정의 동기화

### 🔴 긴급 (다음 단계)

#### Frontend
- [ ] 회원가입/로그인/이메일 인증 API 연동
- [ ] Axios 인스턴스 설정
- [ ] JWT 토큰 관리 (자동 갱신)
- [ ] 이메일 미인증 사용자 안내 페이지

#### Infra
- [ ] Gmail SMTP 설정 및 이메일 발송 테스트

### 🟡 중요 (곧 해야 할 것)

#### Frontend
- [ ] 로딩 상태 관리
- [ ] 에러 핸들링
- [ ] 전역 상태 관리 (Zustand/Jotai)

#### Backend
- [ ] 술 정보 API
- [ ] 리뷰/댓글 API

#### Infra
- [ ] Docker & Docker Compose
- [ ] Nginx 설정

### 🟢 추후 (여유 있을 때)

#### Frontend
- [ ] 술 상세 페이지
- [ ] 리뷰 작성 UI
- [ ] 커뮤니티 게시판
- [ ] 실시간 채팅 UI

#### Infra
- [ ] GitHub Actions CI/CD
- [ ] AWS EC2 자동 배포

---

## 🙋‍♂️ 개발자 한마디

이 프로젝트는 단순히 기술 스택을 나열하기 위한 과제가 아니라,
**하나의 분위기와 사용자 경험을 끝까지 밀어붙이는 것**을 목표로 하고 있습니다.

"무엇을 만들었는가"보다
"왜 이런 구조와 디자인을 선택했는가"가 분명한 프로젝트를 지향합니다.

---

**최종 업데이트**: 2025-12-31
