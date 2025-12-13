# Frontend

잔취 서비스의 프론트엔드 애플리케이션입니다.  
와인바의 공간감과 여운을 살린 UI/UX를 목표로 설계되었습니다.

## 기술 스택
- React
- TypeScript
- Tailwind CSS

## 주요 역할
- 술 목록 / 상세 / 리뷰 / 댓글 UI
- 커뮤니티 게시판 및 실시간 채팅 UI
- 이미지 및 영상 업로드 UI
- 다크 와인바 컨셉의 배경 및 레이어링 구현

## 설계 포인트
- Feature-based folder structure
- Barrel pattern(`index.ts`)을 통한 export 관리
- UI 요소가 페이지가 아닌 **공간 위에 부유하는 느낌**을 주도록 레이아웃 설계
- 확장성과 유지보수를 고려한 컴포넌트 분리

## 실행 방법
```bash
npm install
npm run dev
```
