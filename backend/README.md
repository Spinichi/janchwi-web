## 📁 `backend/README.md`

# Backend

**잔취(janchwi)** 서비스의 백엔드 애플리케이션입니다.
도메인 중심 설계(Domain-Driven Design)를 기반으로,
확장 가능하고 운영을 고려한 구조를 목표로 합니다.

본 백엔드는 **프론트엔드와 API 도메인을 분리한 환경**에서
HTTPS 기반으로 운영되도록 설계되었습니다.

---

## 🛠 기술 스택

### Core

* **Java 25**
* **Spring Boot 4.0.0**
* Gradle (Groovy DSL)
* Spring Web (REST API)
* Spring Data JPA (Hibernate)
* Spring Security 7.0.1
* Spring Validation

### Authentication & Security

* **JWT (JSON Web Token)** - JJWT 0.12.6
* Access Token (15분) + Refresh Token (7일) 방식
* HttpOnly Cookie 기반 Refresh Token 저장
* SHA-256 토큰 해싱
* BCrypt 비밀번호 암호화

### Email

* **Spring Mail (SMTP)**
* 이메일 인증 코드 발송 (6자리 숫자)
* 15분 만료 시간, 5회 시도 제한

### Database

* **PostgreSQL 16**
* JPA / Hibernate 기반 ORM
* Docker 기반 DB 운영

### API Documentation

* **SpringDoc OpenAPI 3** (Swagger UI 2.7.0)
* http://localhost:8080/swagger-ui/index.html

### Infra / Ops

* Docker / Docker Compose
* Nginx (Reverse Proxy)
* Let's Encrypt (HTTPS)
* AWS EC2 (Ubuntu)

### Observability / Management

* Spring Boot Actuator
* (향후) OpenTelemetry 연동 검토

### 예정

* Redis (캐시 / 세션 / 분산락)
* 메시지 브로커 (RabbitMQ 또는 Kafka, 검토 중)

---

## 🎯 주요 기능

### ✅ 구현 완료

#### 인증/인가 시스템
* **회원가입** (`POST /v1/auth/signup`)
  - 이메일 중복 체크
  - 닉네임 중복 체크
  - 만 19세 이상 검증
  - BCrypt 비밀번호 암호화
  - JWT 토큰 자동 발급

* **로그인** (`POST /v1/auth/login`)
  - 이메일/비밀번호 인증
  - 계정 잠금 (5회 실패 시 30분)
  - 이메일 미인증 사용자 차단
  - Access Token + Refresh Token 발급

* **이메일 인증**
  - 인증 코드 발송 (`POST /v1/auth/send-verification`)
  - 인증 코드 검증 (`POST /v1/auth/verify-email`)
  - 6자리 숫자 코드, 15분 만료
  - 5회 시도 제한

* **토큰 관리**
  - Access Token 재발급 (`POST /v1/auth/refresh`)
  - 로그아웃 (`POST /v1/auth/logout`)
  - Refresh Token 해시 저장 (보안 강화)

* **보안 필터**
  - JWT 인증 필터 (JwtAuthenticationFilter)
  - Spring Security 통합
  - 비인증 엔드포인트 화이트리스트

### 🔜 예정

* 술 정보, 리뷰, 댓글, 게시글 API 제공
* 사용자 활동 기록 및 통계 처리
* 이미지 / 영상 업로드 연동을 위한 API 제공
* 비동기 이벤트 처리 및 알림 시스템

---

## 🧱 아키텍처 방향

* **REST API 기반 설계**
* **도메인 단위 패키지 구조**

  ```
  domain
   ├─ auth         (인증/인가)
   ├─ users        (사용자)
   ├─ refreshtokens (리프레시 토큰)
   └─ (예정) drink, review, comment
  global
   ├─ config       (설정)
   ├─ exception    (예외 처리)
   ├─ util         (유틸리티)
   └─ security     (보안)
  ```
* 비즈니스 로직과 인프라 계층 분리
* 컨트롤러 → 서비스 → 도메인 모델 중심 구조
* 환경(dev / prod) 분리된 설정 관리
* 운영 환경을 고려한 설정 및 로그 구조

---

## 🗄 데이터베이스

### 엔티티 설계

#### User 테이블
* **타입 안정성 강화**
  - `id`: `Long` (Integer 대신 사용, ~9경 사용자 지원)
  - `gender`: `Gender` Enum (MALE, FEMALE, OTHER)
  - `isEmailVerified`, `isActive`: `boolean` primitive (null 불가)
  - `password`: `VARCHAR(60)` (BCrypt 해시 길이 최적화)

* **보안 필드**
  - `emailVerificationCodeHash`: SHA-256 해시
  - `verificationAttempts`: 인증 시도 횟수 (최대 5회)
  - `failedLoginAttempts`: 로그인 실패 횟수 (5회 시 잠금)
  - `accountLockedUntil`: 계정 잠금 해제 시간

* **제약 조건**
  - 이메일 UNIQUE
  - 닉네임 UNIQUE
  - Gender CHECK 제약조건

#### RefreshToken 테이블
* `id`: `Long`
* `user`: User 엔티티 참조 (FK)
* `tokenHash`: SHA-256 해시 (UNIQUE)
* `expiresAt`: 만료 시간

### 시간 처리
* 모든 시간 필드: **`Instant` 기준 (UTC)**
* `created_at`, `updated_at`: BaseEntity 자동 관리

---

## ⚙️ 환경 구성 (Profiles)

Spring Profile을 활용하여 환경을 분리합니다.

| Profile | 용도       |
| ------- | -------- |
| `dev`   | 로컬 개발 환경 |
| `prod`  | 서버 운영 환경 |

### 설정 파일 구조

```
src/main/resources/
 ├─ application.yml
 ├─ application-dev.yml
 └─ application-prod.yml
```

* 기본 프로파일: `dev`
* 민감 정보는 `.env` 파일을 통해 주입
* `.env` 파일은 Git에 포함하지 않음

```yaml
spring:
  config:
    import: optional:file:.env[.properties]
  profiles:
    default: dev
```

### 주요 환경 변수

```properties
# Database
POSTGRES_HOST=127.0.0.1
POSTGRES_PORT=15432
POSTGRES_DB=janchwi
POSTGRES_USER=janchwi
POSTGRES_PASSWORD=your_password

# JWT
JWT_SECRET=your-secret-key-min-256-bits
JWT_ACCESS_TOKEN_EXPIRY=900000      # 15분
JWT_REFRESH_TOKEN_EXPIRY=604800000  # 7일

# Email (SMTP)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
```

---

## 🧪 로컬 개발 환경

### 1️⃣ PostgreSQL 연결

* 서버의 PostgreSQL 컨테이너에 **SSH 터널링**으로 접근

### 2️⃣ 애플리케이션 실행

```bash
./gradlew bootRun
```

또는 IntelliJ에서 실행 시:

* Active Profile: `dev`
* Working Directory: `backend`

### 3️⃣ 테스트 실행

```bash
./gradlew test
```

* **26개 Unit Test 통과** ✅
* Mockito 기반 서비스 레이어 테스트
* 로그인, 회원가입, 이메일 인증, 토큰 관리 등 전체 검증

---

## 🚀 실행 확인

애플리케이션이 정상 실행되면 다음 로그가 출력됩니다.

* PostgreSQL JDBC URL 인식
* Hibernate Dialect 자동 설정
* Tomcat 11 (8080) 포트 기동
* Swagger UI 초기화

```text
Started JanchwiBackendApplication in X.XXX seconds
```

### API 문서 확인

http://localhost:8080/swagger-ui/index.html

---

## 🔒 보안

### 인증 흐름

1. **회원가입/로그인**
   - Access Token (Header: `Authorization: Bearer {token}`)
   - Refresh Token (HttpOnly Cookie)

2. **API 요청**
   - Access Token으로 인증
   - JWT 필터에서 자동 검증

3. **토큰 만료**
   - Access Token 만료 시 Refresh Token으로 재발급
   - Refresh Token 만료 시 재로그인 필요

### 보안 정책

* 비밀번호: BCrypt 암호화 (strength 10)
* 토큰: SHA-256 해싱 저장
* 계정 잠금: 5회 실패 시 30분
* 이메일 인증: 5회 시도 제한
* CORS: 프론트엔드 도메인만 허용

---

## 📊 타입 안정성 개선 이력

### 2025-12-31 업데이트

1. **ID 타입 마이그레이션** (Integer → Long)
   - User, RefreshToken 엔티티
   - 모든 DTO, Service, Controller
   - JwtTokenProvider
   - 최대 사용자 수: 21억 → 9경

2. **Gender Enum 도입**
   - String → Gender Enum (MALE, FEMALE, OTHER)
   - DB CHECK 제약조건 자동 생성
   - 타입 안정성 보장

3. **Boolean 타입 최적화**
   - Boolean wrapper → boolean primitive
   - null 불가능, 3-state 문제 해결

4. **Password 컬럼 최적화**
   - VARCHAR(255) → VARCHAR(60)
   - BCrypt 해시 길이 정확히 일치

---

## 🚀 CI/CD & 배포 (2026-01-08 구축 완료)

### GitHub Actions 파이프라인
* **3단계 워크플로우**: build-and-test → build-and-push → deploy
* **브랜치 전략**:
  - `dev`: 빌드 및 테스트만 실행
  - `main`: Docker Hub 푸시 + EC2 자동 배포
* **파일**: `.github/workflows/backend-deploy.yml`

### Docker 컨테이너화
* **Multi-stage Build**:
  - Build: `eclipse-temurin:25-jdk` + Gradle 9.2.1
  - Runtime: `eclipse-temurin:25-jre-alpine`
* **이미지 레지스트리**: Docker Hub (`spinichi/janchwi-backend`)
* **네트워크**: `janchwi-db_janchwi_net` (PostgreSQL 컨테이너와 통신)

### TestContainers 통합 테스트
* **PostgreSQL 16** TestContainer
* SSH 터널링 의존성 제거
* CI/CD 환경에서 자동화된 통합 테스트
* **파일**: `AbstractIntegrationTest.java`, `application-test.yml`

### 프로덕션 환경
* **배포 대상**: AWS EC2
* **환경변수 관리**: GitHub Secrets
* **Nginx 리버스 프록시**: `api.janchwi.site` → `localhost:8080`
* **HTTPS**: Let's Encrypt SSL/TLS

---

## ⏭ 향후 작업

* Redis 연동 (Refresh Token 저장소)
* 비동기 이벤트 처리 구조 설계
* 소셜 로그인 (Google, Kakao)
* 술 정보, 리뷰, 댓글 API 구현

---

## 📌 한 줄 요약

> **잔취 백엔드는 PostgreSQL + JWT 기반의 Spring Boot 애플리케이션으로,
> CI/CD 파이프라인과 함께 EC2에 자동 배포되는 프로덕션 환경을 구축했습니다.**
