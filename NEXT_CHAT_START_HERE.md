# 새 채팅 시작점 — 한국사Ⅱ 학습 웹앱

사용자가 **`진행`**, **`다음 작업 진행`**이라고 입력하면 질문하지 말고 아래 기준으로 바로 이어간다.

## 1. 먼저 읽을 파일

GitHub `kfcccpro/history`의 `main`에서 다음 두 파일을 먼저 읽는다.

1. `NEXT_CHAT_START_HERE.md`
2. `CURRENT_RELEASE_STATE.json`

필요할 때만 다음 파일을 추가 확인한다.

- `QUESTION_QUALITY_AUDIT_2026-08-17.json`
- `CONTENT_ACCURACY_AUDIT_2026-08-17.json`
- `fast_question_quality_patch.js`
- `fast_content_accuracy_patch.js`
- `fast_boost_hook.js`
- `fast_day_engine.js`
- `adaptive_fast_review.js`
- `sync_local_hook.js`

## 2. 프로젝트 핵심 목적

고1 ADHD적 특성을 고려한 **문제 중심 한국사Ⅱ 학습 웹앱**이다.

- 맞고 틀림만 표시하지 않는다.
- 오답이면 학생이 어디서부터 모르는지 확인한다.
- 필요한 개념 깊이만 복구한다.
- 복구 후 같은 원문제를 다시 푼다.
- 학생 화면은 큰 글씨, 한 화면 한 행동, 낮은 시각 분산을 우선한다.

## 3. 현재 배포 기준

- repo: `kfcccpro/history`
- branch: `main`
- 학생 시작: `https://kfcccpro.github.io/history/fast_index.html`
- 배포: GitHub Pages from `main`
- Firebase: 진도·오답·학습 이력 동기화만 담당
- Firebase Hosting / Cloud Shell 배포는 사용하지 않는다.
- build mode: `release`

## 4. 현재 완료 상태

### Day 1~6

- 총 140개의 문제집/교재 기반 원문 문제.
- 원문 발문과 보기를 임의로 난도 조절용 재작성하지 않는다.
- 보기별 오답 이유, 개념 Depth 복구, 최종 객관식 확인, 같은 원문제 재도전 구조가 적용되어 있다.
- 주요 D2/D3/D4 오진은 이전 감사에서 보정했다.

### Day 7~18

- 일반 빠른 학습 + 실제 오답만 복습하는 적응형 복습 구조.
- `fast_content_accuracy_patch.js`에서 역사적 표현 정밀 보정.
- `fast_question_quality_patch.js`에서 문제 품질 보정.
- 선택된 30문항은 지나치게 쉬운 보기, 단순 암기 발문 등을 개선했다.
- 모든 fast 문항은 문항 ID 기반으로 정답 위치를 안정적으로 분산한다. 정답 내용과 answer index는 함께 이동한다.
- 문제별 `qualityDiagnosis`가 있으면 D2/D3/D4 자동 키워드 추정보다 우선한다.
- 일반 학습과 취약 복습 모두 같은 보정 콘텐츠와 진단 규칙을 사용한다.

### 시인성

- `student_visibility_boost.css`, `student_visibility_refine.css`가 학생 화면에 적용되어 있다.
- parent/admin 페이지에는 해당 학생용 확대 CSS가 적용되지 않도록 범위를 제한했다.

## 5. 현재 가장 먼저 할 작업

**새 문제 품질 레이어의 런타임 회귀검증**이다.

확인 순서:

1. Day 7~18 일반 문제에서 보기 순서가 바뀌어도 정답 판정이 정확한지.
2. 같은 문제를 취약 복습에서 열었을 때 보기와 정답이 동일한지.
3. D4로 지정한 비교·적용 문제를 틀렸을 때 D4로 표시되는지.
4. `오답 → 개념 복구 → O/X → 같은 원문제 재도전`이 유지되는지.
5. GitHub Pages 최신 빌드가 성공했는지.

구체적인 오류가 발견된 경우에만 최소 수정한다. 새로운 기능을 임의로 확장하지 않는다.

## 6. 중요한 원칙

- GitHub `main`이 최신 소스의 기준점이다.
- 오래된 V6 ZIP을 전체 덮어쓰기하지 않는다.
- 전체 백업 ZIP은 사용자가 명시적으로 요청할 때만 만든다.
- 사용자의 로컬 GitHub Desktop이 뒤처져 있을 수 있다. 안정 시점에는 **Pull origin만** 안내한다. 로컬에서 Commit/Push하지 않는다.
