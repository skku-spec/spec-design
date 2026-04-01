# GitHub + Vercel 배포 가이드
<!-- new -->

> **내 컴퓨터에서만 보이던 프로젝트를, 링크 하나로 누구나 볼 수 있게 만드는 방법을 안내합니다.** GitHub에 코드를 올리고, Vercel로 인터넷에 배포하는 전체 과정을 다룹니다.
>
> 이 챕터에서 배우실 내용은 다음과 같습니다.
> 1. 배포란 무엇인지, 왜 필요한지
> 2. GitHub에 코드 올리기 (Git 기초)
> 3. Vercel로 인터넷에 배포하기
> 4. 코드 수정 후 자동 재배포
> 5. 배포 에러 해결법

## 배포란?

`npm run dev`로 보이는 `localhost` 주소는 **내 컴퓨터에서만 보입니다.** 이 주소를 다른 사람에게 보내도 볼 수 없습니다. 다른 사람도 볼 수 있게 인터넷에 올리는 것을 **배포(Deploy)**라고 합니다.

| 구분 | 배포 전 | 배포 후 |
|------|--------|--------|
| 접속 | 내 컴퓨터에서만 보임 | 누구나 볼 수 있음 |
| 서버 | 컴퓨터 끄면 사라짐 | 24시간 켜져 있음 |
| 주소 | localhost:3000 | mysite.vercel.app |

---

## 전체 흐름

배포는 4단계로 이루어집니다.

```
내 컴퓨터 (코드 작성)
  ↓
GitHub (코드 저장소)
  ↓
Vercel (배포 서비스)
  ↓
배포 URL (mysite.vercel.app)
```

| 단계 | 하는 일 |
|------|--------|
| 내 컴퓨터 | 코드 작성, 수정, 테스트 |
| GitHub | 코드 저장, 버전 관리 |
| Vercel | 코드를 가져가서 웹사이트로 변환 |
| 배포 URL | 전 세계 누구나 접속 가능 |

---

## GitHub란?

**GitHub은 코드용 구글 드라이브**입니다. 구글 드라이브에 문서를 저장하듯이, GitHub에는 코드를 저장합니다.

### 왜 GitHub에 올려야 하나요?

1. **백업** — 컴퓨터가 고장나도 코드가 안 사라집니다.
2. **배포 연결** — Vercel이 GitHub에서 코드를 가져가서 배포합니다.
3. **버전 관리** — 수정하기 전의 버전으로 되돌릴 수 있습니다.

GitHub에서 프로젝트를 담는 폴더를 **레포지토리(Repository)**라고 부릅니다. 줄여서 "레포"라고도 합니다.

### Git vs GitHub

| 구분 | 설명 | 비유 |
|------|------|------|
| **Git** | 내 컴퓨터에서 돌아가는 버전 관리 프로그램 | 카메라 |
| **GitHub** | Git으로 관리한 코드를 인터넷에 저장하는 서비스 | 사진 클라우드 |

Git은 Ctrl+Z의 강화판이라고 생각하면 됩니다. Ctrl+Z는 한 단계씩만 돌아가지만, Git은 "어제 오후 3시 상태"로 한 번에 돌아갈 수 있습니다.

---

## GitHub 가입 & Git 초기화

### GitHub 가입하기

1. [github.com](https://github.com) 접속

![GitHub 메인 페이지](vibe/deploy-01.png)

2. 오른쪽 상단 **Sign up** 클릭

![Sign up 버튼 클릭](vibe/deploy-02.png)

3. 정보 입력 (구글 로그인 추천)

![GitHub 가입 정보 입력](vibe/deploy-03.png)

4. 이메일 인증 코드 입력하면 가입 완료

![GitHub 가입 완료 - 대시보드](vibe/deploy-04.png)

### 프로젝트에 Git 초기화하기

터미널에서 프로젝트 폴더로 이동한 뒤 아래 명령어를 입력합니다.

`git init`

이 명령어는 "이 폴더를 버전 관리 시작할게"라는 의미입니다. Claude Code를 쓰고 있다면 "git 초기화해줘"라고 말해도 됩니다.

### GitHub에 레포지토리 만들기

1. [github.com](https://github.com) 접속 후 로그인

![GitHub 대시보드](vibe/deploy-05.png)

2. 오른쪽 상단 "+" 버튼 → **New repository** 클릭

![New repository 버튼](vibe/deploy-06.png)

3. 레포 정보 입력

| 항목 | 입력할 것 |
|------|---------|
| Repository name | 프로젝트 이름 (예: my-project) |
| Description | 설명 (선택, 비워두어도 됨) |
| Public / Private | **Private 추천** (나만 볼 수 있게, 나중에 변경 가능) |

![레포지토리 이름 입력](vibe/deploy-07.png)

![Private 선택 및 Create repository](vibe/deploy-08.png)

4. **Create repository** 클릭

![Create repository 버튼 클릭](vibe/deploy-09.png)

![레포지토리 생성 완료 - Quick setup 화면](vibe/deploy-10.png)

프로젝트 폴더 이름과 GitHub 레포 이름을 같게 해두면 헷갈리지 않습니다.

---

## GitHub에 코드 올리기

코드를 GitHub에 올리는 과정은 **3단계**입니다.

| 단계 | 명령어 | 의미 | 비유 |
|------|--------|------|------|
| 1. 담기 | `git add .` | "이 파일들을 올릴 거야" | 파일 선택 |
| 2. 저장 | `git commit -m "첫 번째 커밋"` | "이 상태를 기록할게" | 저장 버튼 |
| 3. 업로드 | `git push origin main` | "GitHub에 올려" | 클라우드 업로드 |

Claude Code를 쓰고 있다면 **"커밋하고 푸시해줘"**라고 말해도 됩니다.

### 처음 GitHub에 연결할 때

레포를 처음 만들면 GitHub에서 연결 명령어가 나옵니다. 그 명령어를 터미널에 복사해서 붙여넣으면 됩니다.

```
git remote add origin https://github.com/내아이디/my-project.git
git branch -M main
git push -u origin main
```

처음 push할 때 브라우저가 열리면서 GitHub 로그인을 요청합니다. 로그인하고 "권한 허용"을 누르면 됩니다.

GitHub 레포지토리 페이지를 새로고침해서 내 코드 파일들이 보이면 성공입니다.

![GitHub에 코드가 올라간 모습](vibe/deploy-11.png)

---

## Vercel로 배포하기

### Vercel이란?

**Vercel은 웹사이트를 인터넷에 올려주는 서비스**입니다. GitHub에서 코드를 가져와서, 웹사이트로 변환(빌드)하고, 인터넷에 올려주고, 나만의 주소를 만들어줍니다.

- **무료** — 개인 프로젝트는 무료로 배포 가능
- **쉬움** — 클릭 몇 번이면 배포 완료
- **자동 배포** — GitHub 코드를 수정하면 자동으로 적용

### Vercel 가입 & GitHub 연동

1. [vercel.com](https://vercel.com) 접속

![Vercel 메인 페이지](vibe/deploy-12.png)

2. **Sign Up** 클릭

![Sign Up 버튼](vibe/deploy-13.png)

3. Plan Type에서 **Hobby(무료)** 선택

![Hobby 플랜 선택](vibe/deploy-15.png)

4. 이름 입력 후 **Continue** 클릭

![이름 입력 및 Continue](vibe/deploy-16.png)

![Continue 클릭](vibe/deploy-17.png)

5. **Continue with GitHub** 클릭

![Continue with GitHub 선택](vibe/deploy-18.png)

6. GitHub 로그인 후 **Authorize Vercel** 클릭

![Authorize Vercel 권한 허용](vibe/deploy-19.png)

### 프로젝트 Import & 배포

1. Vercel 대시보드에서 **Install** 클릭 (GitHub 앱 설치)

![Install 버튼 클릭](vibe/deploy-20.png)

2. 내 GitHub 레포지토리 목록에서 배포할 프로젝트를 찾아 **Import** 클릭

![레포지토리 선택 및 Import](vibe/deploy-21.png)

3. 프레임워크가 자동 인식되는지 확인 (모르겠으면 Claude에게 물어보기)

![프레임워크 자동 인식 확인](vibe/deploy-22.png)

4. **Deploy** 버튼 클릭

![Deploy 버튼 클릭](vibe/deploy-23.png)

Deploy를 누르면 Vercel이 자동으로: GitHub에서 코드 가져오기 → 패키지 설치 → 빌드 → 인터넷에 올리기를 수행합니다. 보통 1~2분 걸립니다.

### 배포 성공 확인

배포가 성공하면 status에 초록색 **Ready**가 표시됩니다. 도메인 링크를 클릭하면 내 사이트를 볼 수 있습니다.

![배포 성공 - Ready 표시 및 도메인 링크](vibe/deploy-24.png)

배포 URL 구조: `https://` + 프로젝트명 + `.vercel.app`

이 주소는 **누구나 접속 가능**합니다. 복사해서 다른 사람에게 보내면 됩니다.

---

## 코드 수정 후 재배포

한 번 Vercel에 연결하면, 코드를 수정하고 push만 하면 **자동으로** 새 버전이 배포됩니다.

```
코드 수정 → git add . → git commit → git push → Vercel 자동 감지 → 새 버전 배포
```

따로 "배포" 버튼을 안 눌러도 됩니다. Vercel이 GitHub을 계속 지켜보고 있어서, 새 코드가 push되면 자동으로 다시 빌드하고 배포합니다.

---

## 배포 에러 해결

### Build Failed

빌드 과정에서 문제가 생겨 배포가 실패한 것입니다.

1. 로컬에서 먼저 `npm run build`를 실행해서 에러가 나는지 확인합니다.
2. Vercel 대시보드 → 프로젝트 → Deployments 탭에서 실패한 배포의 로그를 확인합니다.
3. 에러 메시지를 복사해서 Claude에게 "이 에러 해결해줘"라고 보냅니다.

### Module not found

필요한 파일이나 패키지를 찾지 못한 것입니다.

- 파일 이름 **대소문자** 확인 (`Button.tsx` vs `button.tsx`)
- import **경로** 확인 (`./components` vs `../components`)
- `npm install`로 패키지 재설치

### Environment variable 에러

환경 변수(API 키 등)가 Vercel에 설정되지 않아서 생기는 에러입니다. `.env.local` 파일은 내 컴퓨터에만 있고 GitHub에 올라가지 않으므로, **Vercel에 따로 등록**해야 합니다.

1. Vercel 대시보드 → 프로젝트 선택
2. **Settings** 탭 → **Environment Variables** 클릭
3. `.env.local`에 있는 값들을 하나씩 입력
4. 저장 후 **Redeploy** (Deployments → 최근 배포 → "..." → Redeploy)

---

## 명령어 & 체크리스트

### Git 명령어 모음

| 명령어 | 하는 일 | 자연어로 말하면 |
|--------|--------|------------|
| `git init` | Git 초기화 | "git 초기화해줘" |
| `git add .` | 모든 파일 추가 | "파일 추가해줘" |
| `git commit -m "메시지"` | 변경사항 저장 | "커밋해줘" |
| `git push origin main` | GitHub에 업로드 | "푸시해줘" |
| `git status` | 현재 상태 확인 | "상태 확인해줘" |

### 배포 전 체크리스트

- `npm run dev`로 로컬에서 잘 돌아가는지 확인
- `npm run build`로 빌드 에러 없는지 확인
- 환경 변수가 필요하면 Vercel에 등록했는지 확인
- GitHub에 코드가 잘 올라갔는지 확인

### 배포 후 체크리스트

- 메인 페이지가 잘 뜨는가?
- 다른 페이지로 이동이 되는가?
- 이미지가 잘 보이는가?
- 버튼이나 링크가 작동하는가?
- PC와 모바일에서 모두 확인
