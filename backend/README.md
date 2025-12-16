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

### Database

* **PostgreSQL 16**
* JPA / Hibernate 기반 ORM
* Docker 기반 DB 운영

### Infra / Ops

* Docker / Docker Compose
* Nginx (Reverse Proxy)
* Let’s Encrypt (HTTPS)
* AWS EC2 (Ubuntu)

### Observability / Management

* Spring Boot Actuator
* (향후) OpenTelemetry 연동 검토

### 예정

* Redis (캐시 / 세션 / 분산락)
* 메시지 브로커 (RabbitMQ 또는 Kafka, 검토 중)

---

## 🎯 주요 역할

* 사용자 인증 및 권한 관리 (JWT 기반 예정)
* 술 정보, 리뷰, 댓글, 게시글 API 제공
* 사용자 활동 기록 및 통계 처리
* 이미지 / 영상 업로드 연동을 위한 API 제공
* (예정) 비동기 이벤트 처리 및 알림 시스템

---

## 🧱 아키텍처 방향

* **REST API 기반 설계**
* **도메인 단위 패키지 구조**

  ```
  domain
   ├─ user
   ├─ drink
   ├─ review
   └─ common
  ```
* 비즈니스 로직과 인프라 계층 분리
* 컨트롤러 → 서비스 → 도메인 모델 중심 구조
* 환경(dev / prod) 분리된 설정 관리
* 운영 환경을 고려한 설정 및 로그 구조

---

## 🗄 데이터베이스

* **PostgreSQL 기반 RDB 설계**
* 관계 중심 모델링

    * 사용자
    * 술
    * 리뷰
    * 댓글
    * (예정) 알림, 이벤트 로그
* 시간 컬럼은 **`Instant` / `OffsetDateTime` 기준으로 통일**
* 운영 DB는 서버 내 Docker 컨테이너로 독립 관리

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

---

## 🚀 실행 확인

애플리케이션이 정상 실행되면 다음 로그가 출력됩니다.

* PostgreSQL JDBC URL 인식
* Hibernate Dialect 자동 설정
* Tomcat 11 (8080) 포트 기동

```text
Started JanchwiBackendApplication in X.XXX seconds
```

---

## 🔒 보안 관련 참고

* 현재 개발 단계에서는 Spring Security 기본 설정 사용
* 기본 인증 해제 및 JWT 기반 인증은 추후 적용 예정
* 운영 환경에서는 반드시 보안 설정을 강화해야 합니다.

---

## ⏭ 향후 작업

* Backend Dockerfile 작성
* Backend 전용 docker-compose 구성
* Nginx ↔ Backend API 연동
* JWT 인증/인가 구현
* Redis 연동
* 비동기 이벤트 처리 구조 설계

---

## 📌 한 줄 요약

> **잔취 백엔드는 PostgreSQL 기반의 Spring Boot 애플리케이션으로,
> 로컬·운영 환경 분리를 완료하고 실제 배포를 앞둔 상태입니다.**
