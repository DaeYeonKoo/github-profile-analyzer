# GitHub Profile Analyzer

GitHub 사용자명을 입력하면 AI(Claude)가 해당 개발자의 기여 패턴, 기술 스택, 개발자 페르소나를 분석해 게임 캐릭터 카드 스타일로 보여주는 웹앱입니다.

**🚀 배포**: https://github-profile-analyzer-iota.vercel.app

## 기술 스택

- **프론트엔드**: Next.js 14 (App Router, `src/app` 구조), TypeScript (strict mode), Tailwind CSS
- **AI 엔진**: Claude API (`claude-opus-5`, structured outputs)
- **데이터 소스**: GitHub REST API (프로필, 레포, 최근 활동 이벤트)
- **OG 이미지**: `next/og` (Satori) + Google Fonts Noto Sans KR

## 주요 기능

- GitHub 프로필 · 레포 · 최근 활동을 조회해 실제 데이터 기반으로 분석
- AI가 산출하는 페르소나 타이틀, 수치화된 스탯(꾸준함/다양성/영향력/협업), 뱃지
- 실제 레포 언어 통계로 계산한 주요 언어 (AI 추측이 아닌 결정론적 계산)
- 그라데이션 보더 + 호버 글로우의 페르소나 카드 UI, 로딩 스켈레톤
- `?user=username` 쿼리로 결과 공유 + 링크 복사
- 공유 링크 접속 시 동적으로 생성되는 OG 이미지 (Claude 재호출 없이 GitHub 데이터만 사용)

## 시작하기

```bash
npm install
cp .env.local.example .env.local
# .env.local에 ANTHROPIC_API_KEY(필수), GITHUB_TOKEN(선택) 입력
npm run dev
```

`http://localhost:3000`에서 확인할 수 있습니다.

## 환경 변수

| 변수 | 필수 | 설명 |
| --- | --- | --- |
| `ANTHROPIC_API_KEY` | ✅ | Claude API 키 ([console.anthropic.com](https://console.anthropic.com/settings/keys)) |
| `GITHUB_TOKEN` | ❌ | GitHub Personal Access Token. 미설정 시 시간당 60회, 설정 시 5,000회로 rate limit 완화 |
| `NEXT_PUBLIC_SITE_URL` | ❌ | OG 이미지/메타데이터의 절대 URL 생성에 사용. 배포 시 실제 도메인으로 변경 |

## 스크립트

```bash
npm run dev     # 개발 서버
npm run build   # 프로덕션 빌드
npm run start   # 프로덕션 서버 실행
npm run lint    # ESLint 검사
```

## 프로젝트 구조

```
src/
├── app/
│   ├── page.tsx           # 메인 페이지 (?user= 쿼리 처리, OG 메타데이터)
│   ├── layout.tsx
│   └── api/
│       ├── analyze/       # GitHub 조회 + Claude 분석
│       └── og/            # 동적 OG 이미지 생성
├── components/
│   ├── AnalyzerForm.tsx    # 클라이언트: 입력/상태/공유
│   ├── PersonaCard.tsx     # 페르소나 카드 UI
│   ├── StatBar.tsx
│   ├── Badge.tsx
│   └── SkeletonCard.tsx
├── lib/
│   ├── github.ts           # GitHub API 클라이언트
│   └── claude.ts           # Claude API 클라이언트
└── types/                  # interface 정의
```

프로젝트 컨벤션 및 상세 가이드는 [`CLAUDE.md`](./CLAUDE.md)를 참고하세요.

