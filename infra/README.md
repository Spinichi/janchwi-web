## 📁 `infra/README.md`

# Infra

잔취 서비스의 배포 및 운영 환경을 관리하는 인프라 구성입니다.

## 기술 스택
- Docker
- Nginx
- Jenkins (CI/CD)
- AWS S3 (연동 예정)

## 주요 구성
- Docker를 활용한 애플리케이션 컨테이너화
- Nginx를 통한 Reverse Proxy 및 정적 리소스 서빙
- Jenkins 기반 CI/CD 파이프라인 구축
- 환경 변수 및 설정 분리 관리

## CI/CD 방향
- GitHub → Jenkins 연동
- 빌드 / 테스트 / 배포 자동화
- 프론트엔드, 백엔드 독립적 배포 고려

## 스토리지
- AWS S3를 활용한 이미지 및 영상 업로드 관리 (검토 중)

## 목표
- 로컬 / 개발 / 운영 환경의 일관성 유지
- 배포 과정 자동화 및 안정성 확보