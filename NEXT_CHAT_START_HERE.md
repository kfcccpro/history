# 새 채팅 시작점 — 한국사Ⅱ 학습 웹앱

사용자가 **`진행`**, **`다음 작업 진행`**이라고 입력하면 질문하지 말고 GitHub `kfcccpro/history`의 `main`을 기준으로 바로 이어간다.

## 먼저 읽을 파일

1. `CURRENT_RELEASE_STATE.json`
2. `WRONG_ANSWER_BOOK_GATE_AUDIT_2026-08-17.json`
3. 필요할 때만 `QUESTION_SOURCE_MAPPING_AUDIT.json`

## 프로젝트 핵심 목적

고1 ADHD적 특성을 고려한 문제 중심 한국사Ⅱ 학습 웹앱이다.

- 문제를 먼저 풀고 이론을 찾아간다.
- 단순 맞고/틀림 표시로 끝내지 않는다.
- 틀리면 어디서부터 모르는지 D1~D4로 확인한다.
- 필요한 부분만 복구한 뒤 같은 원문제를 다시 푼다.
- 학생 화면은 큰 글씨, 한 화면 한 행동, 낮은 시각 분산을 우선한다.

## 현재 배포 기준

- repo: `kfcccpro/history`
- branch: `main`
- 학생 시작: `https://kfcccpro.github.io/history/fast_index.html`
- GitHub Pages from `main`
- Firebase는 진도·오답·학습 이력 동기화만 담당
- build mode: `release`
- GitHub main이 소스의 기준점이며 오래된 ZIP으로 덮어쓰지 않는다.

## 현재 핵심 구조

### Day 1~6

- 140개의 문제집/교재 기반 원문 문제를 유지한다.
- 원문 발문·보기를 임의 재작성하지 않는다.
- 정밀 D2/D3/D4 오답 진단과 원문제 재도전 구조가 있다.
- 문제별 교재 위치는 `QUESTION_SOURCE_MAPPING_AUDIT.json`의 문제 ID → 문제편 페이지/문제 번호 매핑을 우선 사용한다.

### Day 7~18

- 빠른 문제 흐름 + 취약 문제 적응형 복습.
- 정확도 패치와 문제 품질 패치가 일반 학습/복습 양쪽에 동일하게 적용된다.
- 페이지가 검증되지 않은 문제에 페이지 번호를 추측하지 않는다. 대단원 → 챕터 → 목록 기준으로 책을 찾게 한다.

## 새로 구현된 가장 중요한 구조

### 한 번 틀린 문제는 영구 오답 등록부에 편입

- `wrong_answer_registry.js`
- storage: `history2-wrong-answer-registry-v1`
- 맞힌 뒤에도 레코드를 삭제하지 않는다.
- 상태만 `open / book-retry / recurring / resolved`로 바뀐다.
- Day1~6 `wrongNotes`, Day7~18 answer history에서 등록부를 재구성할 수 있다.

### 다음 챕터 전 이전 오답 관문

- `pre_chapter_gate_guard.js`
- `pre_chapter_wrong_gate.html`
- `pre_chapter_wrong_gate.js`
- Day 2~18 실제 진입 직전에 이전 Day의 오답을 최대 3개 꺼낸다.
- 현재 챕터와 관계없는 과거 오답도 출제한다.

### 관문에서 또 틀렸을 때

**정답과 해설을 바로 보여주지 않는다.**

`재오답 → 교재 위치 안내 → 학생이 실제 책에서 찾음 → 같은 문제 재도전 → 맞힌 뒤에만 짧은 정리`

재오답 화면에서 금지:
- 정답 보기 공개
- `why` 해설 공개
- recovery clue 공개
- O/X 복구 공개
- 정답 핵심어 공개

교재 위치만 보여 준다.

### 교재 위치 엔진

- `textbook_locator_engine.js`
- Day1~6: 감사 자료의 정확 페이지가 있으면 페이지 + 문제 번호 사용
- Day7~18: 페이지를 추측하지 않고 `페이지 미검증 · 챕터/목록 기준 탐색 안내`
- 관문 재오답에서는 `includeKeywords=false`로 정답 핵심어를 숨긴다.

### 원문 문제 재사용

- Day1~6: `unit1_book_gate.html` + `unit1_book_gate_addon.js`가 기존 problem-specific metacog 원문 문제를 그대로 사용한다.
- Day7~18: `fast_book_gate_engine.js`가 기존 fast 콘텐츠 파이프라인을 그대로 사용한다.
- 문제를 관문용으로 별도 복제하지 않는다.

## 다음 작업 우선순위

새 기능 추가보다 **실제 저장된 오답으로 click-through QA**가 우선이다.

확인할 것:
1. Day1~6 오답이 다음 챕터 전 관문에 실제로 뜨는가.
2. 원문 문제 ID가 맞는 문제를 여는가.
3. 재오답에서 해설이 차단되고 감사된 페이지/챕터 위치만 나오는가.
4. Day7~18에서는 페이지를 만들어내지 않고 챕터/목록만 나오는가.
5. 책을 보고 맞히면 관문으로 돌아와 다음 오답으로 넘어가는가.
6. 관문을 끝내면 원래 들어가려던 새 Day가 시작되는가.
7. 오답 등록부가 mastery 이후에도 남고 Firebase reconciliation 뒤에도 유지되는가.
8. GitHub Pages 최신 빌드가 성공하는가.

실제 결함이 확인된 경우에만 수정한다.

## 로컬 작업 원칙

안정 시점에 사용자의 GitHub Desktop에서는 **Pull origin만** 한다. 로컬 stale 파일을 Commit/Push하지 않는다. 전체 ZIP 백업은 사용자가 명시적으로 요청할 때만 만든다.
