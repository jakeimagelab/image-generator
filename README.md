# 포토클리닉 AI 이미지 디렉터

병원 담당자가 원하는 이미지 방향을 선택하면 포토클리닉 스타일의 병원 브랜딩 이미지 컨셉을 AI로 생성하고, 실제 촬영 상담으로 전환하는 Next.js MVP입니다.

## 주요 기능

- 랜딩페이지와 단계형 입력 플로우
- 기본 정보, 병원 유형, 이미지 유형, 무드, 참고자료 입력
- localStorage 기반 단계별 입력값 복구
- 포토클리닉 스타일 규칙을 반영한 프롬프트 자동 생성
- OpenAI 이미지 생성 API로 4장 생성
- Supabase DB 저장 및 Storage 업로드
- 결과 페이지와 상담 신청 폼
- 모바일 반응형 Tailwind UI

## 기술 스택

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase DB + Storage
- OpenAI Images API
- Vercel 배포 대응

## 설치

```bash
npm install
cp .env.example .env.local
```

## 환경변수

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_STORAGE_BUCKET=photoclinic-references
OPENAI_API_KEY=
OPENAI_IMAGE_MODEL=gpt-image-1.5
```

`OPENAI_API_KEY`가 없으면 개발 확인용 placeholder 이미지가 반환됩니다. Supabase 환경변수가 없으면 로컬 임시 ID와 data URL로 프론트 플로우를 확인할 수 있습니다.

## Supabase 설정

1. Supabase SQL Editor에서 `supabase/schema.sql`을 실행합니다.
2. Storage에서 `photoclinic-references` 버킷을 생성합니다.
3. 현재 구현은 `getPublicUrl`을 사용하므로 MVP에서는 public bucket을 권장합니다.
4. Vercel 배포 시 위 환경변수를 Project Settings에 등록합니다.

## 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:3000`을 엽니다.

## 페이지 구조

- `/` 랜딩페이지
- `/director/start` 기본 정보 입력
- `/director/style` 병원 유형 / 이미지 유형 / 분위기 선택
- `/director/reference` 참고 이미지 / URL / 고민 입력
- `/director/generate` 생성 중 페이지
- `/director/result` 생성 결과 페이지
- `/director/consult` 상담 신청 페이지

## API Routes

- `POST /api/save-lead`
- `POST /api/save-request`
- `POST /api/upload-reference`
- `POST /api/generate-image`
- `POST /api/save-consultation`

OpenAI 이미지 생성은 공식 Images API의 generation 엔드포인트를 사용합니다. 기본 모델은 `gpt-image-1.5`이며, `.env.local`의 `OPENAI_IMAGE_MODEL`로 변경할 수 있습니다.
