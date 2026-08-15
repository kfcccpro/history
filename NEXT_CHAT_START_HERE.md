# 새 채팅 시작점 — 한국사Ⅱ 학습 웹앱

새 프로젝트 채팅에서 사용자가 **`다음 작업 진행`**이라고만 입력하면, 질문하지 말고 아래 순서로 바로 진행한다.

## 1. 먼저 읽을 파일

GitHub 저장소 `kfcccpro/history`의 `main`에서 다음 두 파일을 먼저 읽는다.

1. `NEXT_CHAT_START_HERE.md` — 현재 문서
2. `CURRENT_RELEASE_STATE.json` — 기계 판독용 최신 상태

그 다음 필요한 경우 아래 핵심 런타임 파일만 확인한다.

- `app_mode_config.js`
- `sync_local_hook.js`
- `firebase_sync_engine.js`
- `fast_index.html`
- `fast_day.html`
- `fast_day_engine.js`
- `fast_sync_boot.js`

## 2. 현재 프로젝트 상태

이 프로젝트는 고1 ADHD적 특성을 고려한 **문제 중심 한국사Ⅱ 학습 웹앱**이다.

핵심 목적:

- 맞고 틀림만 보여주지 않는다.
- 오답이 나오면 학생이 **어디서부터 모르는지** 확인하게 한다.
- 개념 경로를 따라 필요한 부분만 복구한다.
- 복구 후 O/X 판단을 거쳐 같은 원문제를 다시 풀게 한다.
- 수동 읽기보다 선택/판단/회상을 요구한다.

현재 전체 학습 범위는 **Day 1~18**이며 교재 공식 순서와 맞춰져 있다.

- Day 1~6: 기존 깊은 학생 흐름 완성판
- Day 7~18: 빠른 경량 학습 흐름
- 전체 시작 페이지: `https://kfcccpro.github.io/history/fast_index.html`

## 3. 현재 배포 상태

- GitHub repo: `kfcccpro/history`
- branch: `main`
- GitHub Pages: `https://kfcccpro.github.io/history/`
- 배포 방식: `main` → GitHub Pages
- Firebase Hosting / Cloud Shell / GitHub Actions Firebase 배포는 사용하지 않는다.
- Firebase는 **진도·오답·학습 이력의 기기 간 동기화만** 담당한다.

현재 앱 모드는 **release**다.

Release 설정:

- 진도 영구 저장 ON
- 학습 이력 저장 ON
- Firebase 동기화 ON
- 개발용 자유 이동 OFF
- 관리자 개발 콘솔 자동 진입 OFF

학생 PIN: `8081`
관리자 PIN: `2007`

## 4. 직전 완료 작업

직전 마감 작업에서 다음을 완료했다.

1. Day 7~18 저장을 공통 `history2-` 키 체계로 통합
2. 문제별 정답/오답, 복구 OX, 오답 분야, 마지막 문제, 완료 시점 저장
3. 경량판을 `app_mode_config.js`, `sync_local_hook.js`, `firebase_sync_engine.js`와 연결
4. 다른 PC에서 Day 7~18을 바로 열 때 클라우드 진도를 먼저 받은 뒤 엔진을 시작하도록 `fast_sync_boot.js` 사용
5. Day 1~6도 다른 PC에서 직접 열었을 때 초기 클라우드 진도가 화면에 반영되도록 `sync_local_hook.js`에 **초기 동기화 변경 시 1회 새로고침** 보정 추가
6. Release 모드 전환 완료
7. 최신 런타임 수정 커밋: `88efea0d491b6c23ce12d242de293af3fd93efab`
8. 그 커밋의 GitHub Pages 빌드는 `built` 성공 확인

## 5. 다음에 해야 할 일 — 이것만 한다

**새 기능을 만들지 않는다.**

남은 일은 최종 실사용 QA뿐이다.

대표 경로만 검사한다.

1. Day 1 기존 완성판 시작/문제 풀이
2. Day 7 경량판 시작/문제 풀이
3. Day 16 TEST 시작/문제 풀이
4. 일부 문제에서 일부러 오답 선택
5. `오답 → 복구 경로 → O/X → 같은 원문제 재도전`이 정상인지 확인
6. 새로고침 후 진도가 유지되는지 확인
7. `fast_index.html`에서 완료 Day가 `✓ 완료`로 표시되는지 확인
8. 가능하면 다른 기기/새 브라우저에서 같은 Firebase 진도가 복원되는지 확인

### 종료 기준

- 치명적 결함 없음 → **개발 종료 / 완성 상태로 취급**
- 결함 발견 → **그 결함만 최소 수정** → JS 구문/구조 검사 → GitHub Pages `built` 확인 → 종료

새 UX, 새 콘텐츠, 새 관리자 기능, 새 데이터 구조를 임의로 추가하지 않는다.

## 6. 작업 스타일 고정

사용자는 속도를 중요하게 생각한다.

- 사용자가 `진행`, `다음 작업 진행`이라고 하면 바로 실행한다.
- 불필요한 확인 질문을 하지 않는다.
- 한 번에 2~3단계를 묶어 검토하고 진행한다.
- 결과 보고는 짧고 명확하게 한다.
- 기술 설명이 사용자 행동을 요구할 때는 **중학생도 따라할 수 있도록** 클릭 위치와 이유를 단계별로 설명한다.

## 7. 백업 규칙

**매 버전마다 전체 ZIP 백업을 만들지 않는다.**

전체 백업은 다음 경우에만 만든다.

- 사용자가 명시적으로 요청
- 최종 완성이라는 큰 마일스톤

현재 새 채팅 인계를 위해 별도의 ZIP 업로드는 필요 없다. GitHub `main` 자체가 최신 소스의 기준점이다.

## 8. 중요한 금지 사항

- Firebase Hosting 재도입 금지
- Cloud Shell 재도입 금지
- Firebase 배포용 GitHub Actions 재도입 금지
- 서비스 계정 secret 작업 재도입 금지
- 상용 문제집 장문 원문을 공개 웹에 그대로 대량 복제하지 않기
- 이미 완성된 엔진을 콘텐츠별 이유로 불필요하게 다시 설계하지 않기

## 새 채팅에서의 첫 행동

사용자가 `다음 작업 진행`이라고 입력하면:

> `course-mindmap-builder` 스킬을 먼저 읽고, 이 문서와 `CURRENT_RELEASE_STATE.json`을 GitHub에서 읽은 뒤, 최종 실사용 QA를 즉시 진행한다.

사용자에게 "무엇을 할까요?"라고 되묻지 않는다.
