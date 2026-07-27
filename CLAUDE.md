# GitHub Profile Analyzer

## 프로젝트 개요
GitHub 유저명을 입력하면 AI가 기여 패턴, 기술 스택, 개발자 성향을 분석하는 웹앱.

## 기술 스택
- Next.js 14 (App Router, src/app 구조)
- TypeScript (strict mode)
- Tailwind CSS
- Claude API (분석 엔진)
- GitHub REST API

## 컨벤션
- 컴포넌트: PascalCase, 파일명도 PascalCase
- 유틸/훅: camelCase
- API 응답 타입: interface로 정의, type 보다 interface 선호
- 에러 핸들링: try-catch + 사용자 친화적 에러 메시지

## 주의사항
- Claude API만 사용한다. OpenAI API 사용 금지.
- 서버 컴포넌트와 클라이언트 컴포넌트를 명확히 분리한다.

## 빌드/실행
- npm run dev: 개발 서버
- npm run build: 프로덕션 빌드
- npm run lint: 린트 체크