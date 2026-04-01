# Supabase 백엔드 입문
<!-- new -->

> **지금까지 만든 사이트는 새로고침하면 데이터가 사라집니다.** Supabase를 연결하면 데이터 저장, 로그인, 회원가입이 가능해집니다. 코드를 몰라도 Claude에게 요청하면 됩니다.
>
> 이 챕터에서 배우실 내용은 다음과 같습니다.
> 1. 프론트엔드와 백엔드의 차이
> 2. Supabase 가입과 프로젝트 생성
> 3. 데이터베이스와 테이블 개념
> 4. RLS(보안 정책) 이해하기
> 5. 프로젝트에 Supabase 연결하기
> 6. 인증(로그인/회원가입) 기능
> 7. 자주 나오는 에러 해결법

## 프론트엔드 vs 백엔드

| 구분 | 프론트엔드 | 백엔드 |
|------|---------|------|
| 역할 | 눈에 보이는 화면 (버튼, 글자, 이미지) | 눈에 안 보이지만 뒤에서 일하는 것 (데이터 저장, 로그인) |
| 비유 | 식당의 **홀** (테이블, 메뉴판, 인테리어) | 식당의 **주방** (요리, 재료 보관) |

지금까지 배운 것(Claude Code로 화면 만들기, GitHub에 올리기, Vercel로 배포하기)은 전부 **프론트엔드** 작업입니다. 지금 상태는 "홀만 있고 주방이 없는 식당"과 같습니다.

### 백엔드가 있으면 뭘 할 수 있나요?

- **데이터 저장** — 글을 쓰면 저장되고, 다음에 들어와도 그대로 있고, 다른 사람도 볼 수 있습니다.
- **로그인/회원가입** — 이메일/비밀번호 가입, 구글/카카오 간편 로그인
- **사용자별 화면** — 로그인 여부에 따라 다른 화면을 보여줄 수 있습니다.

---

## 왜 Supabase인가?

| 장점 | 설명 |
|------|------|
| **무료** | 프로젝트 2개까지 무료, 사이드 프로젝트에 충분 |
| **쉬움** | 클릭만으로 테이블 생성, 대시보드에서 데이터 확인 가능 |
| **Claude와 궁합** | "Supabase로 로그인 만들어줘"라고 하면 바로 구현 가능 |
| **확장성** | PostgreSQL 기반이라 나중에 복잡한 것도 가능 |

---

## Supabase 시작하기

### 가입

1. [supabase.com](https://supabase.com) 접속

![Supabase 메인 페이지](vibe/supabase-01.png)

2. **Start your project** 클릭
3. **Continue with GitHub** 클릭 (GitHub 계정 사용)

![GitHub 로그인](vibe/supabase-02.png)

4. 권한 허용

![Authorize Supabase](vibe/supabase-03.png)

### 프로젝트 만들기

1. **New organization** 생성 — Name: 본인 이름, Type: Personal, Plan: Free

![New organization 생성](vibe/supabase-04.png)

2. **New Project** 생성:

| 항목 | 입력할 것 |
|------|---------|
| Project name | 프로젝트명 (예: `my-guestbook`) |
| Database password | 자동 생성 추천 ("Generate a password" 클릭). **꼭 메모해두세요** |
| Region | **Northeast Asia (Seoul)** 선택 |

![New Project 생성 화면](vibe/supabase-05.png)

3. **Create new project** 클릭

### API Key 발급받기

API Key는 **Supabase와 대화하는 열쇠**입니다. 열쇠 없이는 데이터를 가져오거나 저장할 수 없습니다.

1. 왼쪽 사이드바 맨 아래 톱니바퀴 (Project Settings) 클릭

![Project Settings 위치](vibe/supabase-06.png)

2. **Data API** 메뉴에서 **Project URL** 복사

![Data API에서 Project URL 복사](vibe/supabase-07.png)

3. **API Keys** 메뉴에서 **anon public** 키 복사

![API Keys - anon key와 service_role key](vibe/supabase-10.png)

두 가지를 메모장에 저장해두세요.

| 키 종류 | 용도 | 공개 여부 |
|--------|------|---------|
| **anon key** | 일반 사용자용 (브라우저에서 사용) | 코드에서 사용 가능 |
| **service_role key** | 관리자용 (서버에서만 사용) | **절대 공개 금지** |

### 대시보드 핵심 메뉴

| 메뉴 | 역할 |
|------|------|
| **Table Editor** | 엑셀처럼 데이터를 보고 편집. 가장 많이 사용 |
| **Authentication** | 회원가입/로그인 설정, 사용자 목록 확인 |
| **SQL Editor** | SQL 명령어 입력·실행. Claude가 만들어준 SQL을 여기서 Run |
| **Storage** | 이미지, PDF 같은 파일 저장 (이 챕터에서는 다루지 않음) |

![Table Editor 화면](vibe/supabase-11.png)

![Authentication - Users 화면](vibe/supabase-12.png)

![SQL Editor 화면](vibe/supabase-13.png)

![Storage 화면](vibe/supabase-14.png)

---

## 데이터베이스 기초

### 데이터베이스와 테이블

| 비유 | 데이터베이스 개념 |
|------|------------|
| 서랍장 | 데이터베이스 |
| 각 서랍 | 테이블 (users, posts, orders...) |
| 서랍 안의 양식 항목 (이름, 전화번호) | 컬럼 (Column) |
| 양식에 적힌 한 사람의 정보 | 로우 (Row) |

각 서랍에는 같은 종류의 정보만 넣습니다. 양말 서랍에 양말만 넣듯이, 회원 테이블에는 회원 정보만 넣습니다.

### RLS (Row Level Security)

RLS는 **"누가 이 데이터를 볼 수 있는가" 규칙**입니다.

| 비유 | 개념 |
|------|------|
| 아파트 공동 현관문 잠금 장치 | **RLS** (보안 잠금) |
| 각 집에 들어갈 수 있는 열쇠 | **Policy** (허용 규칙) |

- RLS를 켜면 → 기본적으로 아무도 데이터에 접근 불가
- Policy를 추가하면 → "이 조건의 사람은 접근 OK" 규칙 설정

***자주 하는 실수: RLS만 켜고 Policy를 안 만들면 모든 문이 잠긴 상태가 됩니다.*** "new row violates row-level security policy" 에러가 나면 Policy를 추가해야 합니다.

Claude에게 이렇게 요청하면 RLS 정책을 만들어줍니다:

```
RLS 정책 만들어줘.
- 누구나 읽기는 가능하게
- 글쓰기는 로그인한 사람만
- 수정/삭제는 본인 글만 가능하게
SQL 코드로 만들어줘.
```

만들어준 SQL을 Supabase **SQL Editor**에 붙여넣고 **Run** 버튼만 누르면 적용됩니다.

---

## 프로젝트에 Supabase 연결하기

### .env.local 파일

API Key를 코드에 직접 쓰면 GitHub에 올렸을 때 전 세계가 볼 수 있습니다. 그래서 **환경 변수**를 사용합니다.

`.env.local` 파일은 내 컴퓨터에만 있고, GitHub에 올라가지 않는 **비밀 정보 보관함**입니다.

프로젝트 최상위 폴더에 `.env.local` 파일을 만들고 아래처럼 작성합니다:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1...
```

`NEXT_PUBLIC_` 접두사는 "브라우저에서도 쓸 수 있게 해줘"라는 의미입니다. `=` 앞뒤에 공백 없이 작성하세요.

### Supabase 패키지 설치 & 연결

Claude Code에게 이렇게 요청하세요:

```
Supabase 패키지 설치하고, 내 프로젝트에 Supabase 연결하는 코드 만들어줘.
lib/supabase.ts 파일 만들고, 환경변수는 NEXT_PUBLIC_SUPABASE_URL과
NEXT_PUBLIC_SUPABASE_ANON_KEY 사용해.
```

---

## 인증 (로그인/회원가입)

**인증(Authentication)은 "너 누구야?"를 확인하는 것**입니다. Supabase Auth가 회원가입, 로그인, 로그아웃, 이메일 인증, 비밀번호 암호화, 로그인 상태 유지를 모두 처리해줍니다.

### 세션과 토큰

| 개념 | 비유 | 설명 |
|------|------|------|
| 세션 | 놀이공원 입장 스탬프 | 로그인 상태를 유지하는 표식 |
| 토큰 | 회사 사원증 | "나 로그인한 사람이야"를 증명하는 암호화된 문자열 |

Supabase가 세션과 토큰을 **자동으로 관리**해주므로 직접 다룰 필요 없습니다.

### Claude에게 로그인 페이지 요청하기

```
Supabase Auth로 로그인/회원가입 페이지 만들어줘.
- 이메일, 비밀번호 입력 폼
- 로그인/회원가입 버튼
- 성공하면 메인 페이지로 이동
- 실패하면 에러 메시지 표시
- 로그인 안 했으면 "로그인 후 작성 가능합니다" 표시
- 로그인 했으면 헤더에 사용자 이메일 + "로그아웃" 버튼
```

Supabase 대시보드에서 **Authentication → Providers**에서 Email이 Enabled 상태인지 확인하세요.

![Authentication Providers - Email Enabled 확인](vibe/supabase-20.png)

---

## Vercel 배포 시 추가 설정

Supabase를 사용하는 프로젝트를 Vercel에 배포할 때는 **2가지 추가 설정**이 필요합니다.

### 1. Vercel에 환경 변수 등록

`.env.local`은 GitHub에 올라가지 않으므로 Vercel에 직접 등록해야 합니다.

1. Vercel 대시보드 → 프로젝트 선택
2. **Settings → Environment Variables** 클릭
3. `NEXT_PUBLIC_SUPABASE_URL`과 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 추가
4. **Save** 클릭

![Vercel 환경 변수 등록 화면](vibe/supabase-21.png)

### 2. Supabase에 Site URL 설정

Supabase가 "이 사이트에서 오는 요청은 진짜야"라고 알아야 로그인이 작동합니다.

1. Supabase 대시보드 → **Authentication → URL Configuration** 클릭
2. **Site URL**에 Vercel 배포 URL 입력 (예: `https://my-guestbook.vercel.app`)
3. **Save** 클릭

![Site URL 설정 화면](vibe/supabase-22.png)

설정 후 Vercel에서 **Redeploy**하면 완료입니다.

---

## 자주 나오는 에러

| 에러 | 원인 | 해결 방법 |
|------|------|---------|
| "Invalid API Key" | API Key가 잘못됨 | `.env.local` 확인, `=` 앞뒤 공백 제거, 서버 재시작 |
| "new row violates row-level security policy" | RLS 정책 없음 | INSERT Policy 추가 (Claude에게 요청) |
| "User not found" | 회원가입 안 된 상태 | 회원가입 먼저 하기, Authentication → Users에서 확인 |
| 데이터가 안 불러와짐 | SELECT 정책 없음 | "누구나 읽기 가능" Policy 추가 |
| 환경 변수가 undefined | `.env.local` 위치나 이름 오류 | 프로젝트 최상위에 있는지, `NEXT_PUBLIC_`으로 시작하는지 확인 후 서버 재시작 |

---

## 무료 플랜 제한 사항

| 항목 | 제한 |
|------|------|
| 프로젝트 | 2개까지 |
| 데이터베이스 | 500MB |
| 스토리지 | 1GB |
| 월 대역폭 | 5GB |
| 동시 접속 | 200명 |

**7일간 활동 없으면 프로젝트가 일시 정지됩니다.** Supabase 대시보드에서 "Restore project"를 클릭하면 복구됩니다. 데이터는 삭제되지 않습니다.
