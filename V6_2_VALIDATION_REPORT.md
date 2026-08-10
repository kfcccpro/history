# V6.2 검증 보고서

점검일: 2026-08-10

## 결과

- Day 학생 파일: 6개
- 문제: 140문항
- 개념: 55개
- 구조 오류: 0건
- 경고: 0건
- 독립 JS 구문 검사: 51개 / 오류 0건
- V6.1 대비 문제·정답·키워드·개념 본문 변경 없음
- Day 1 실제 렌더: 1600×900, 1180×720, 1024×768에서 body overflow 0
- Day 1 오답 Depth 마지막 직접입력 완료 → 로그 기록 정상
- Day 6 실제 렌더 및 오답 Depth 완료 → 런타임 오류 0, 로그 기록 정상
- Depth 엔진 내부 단계 메타데이터 `소개념` → `세부 개념` 용어 통일

## V6.2에서 의도적으로 바뀐 학습 지도 메타데이터

- Day 1 첫 큰 가지: `국제 정세` → `국제 배경·해외 동포`
- 힌트: `제1차 세계 대전 · 러시아 혁명 · 하와이 이주`
- 목적: 같은 가지 아래 들어 있던 `하와이 이주 동포`가 국제 정세만으로 보이는 분류 불일치 해소

## 런타임 보정

- 공통 Depth 모듈이 학생형에서 없는 `metacogFor()`를 직접 호출하던 의존성 제거
- Day 6 학생형에 누락된 `resetRuntimeForQuestion`, `nextProblem`, `retryCurrent` 복구
- 닫힌 용어 카드가 화면 오른쪽 바깥에 위치하는 것은 의도된 off-canvas drawer이며 body 스크롤을 만들지 않음

## 파일별

### korean_history2_day1_student_flow_app.html
- 문제 14 / 개념 12
- 오류 0 / 경고 0
- V6.1 학습 콘텐츠 동일: 예

### korean_history2_day2_student_flow_app.html
- 문제 21 / 개념 8
- 오류 0 / 경고 0
- V6.1 학습 콘텐츠 동일: 예

### korean_history2_day3_student_flow_app.html
- 문제 31 / 개념 9
- 오류 0 / 경고 0
- V6.1 학습 콘텐츠 동일: 예

### korean_history2_day4_student_flow_app.html
- 문제 26 / 개념 8
- 오류 0 / 경고 0
- V6.1 학습 콘텐츠 동일: 예

### korean_history2_day5_student_flow_app.html
- 문제 23 / 개념 8
- 오류 0 / 경고 0
- V6.1 학습 콘텐츠 동일: 예

### korean_history2_day6_student_flow_app.html
- 문제 25 / 개념 10
- 오류 0 / 경고 0
- V6.1 학습 콘텐츠 동일: 예
