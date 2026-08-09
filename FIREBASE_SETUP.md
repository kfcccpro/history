# Firebase 연결 — 단일 학생 자동 동기화

이 빌드는 `history-698f7` Firebase Web App 설정이 포함되어 있습니다.

## Firebase Console에서 필요한 설정

1. Authentication > 로그인 방법에서 **익명(Anonymous)** 제공자를 사용 설정합니다.
2. Firestore > 규칙에 이 패키지의 `firestore.rules` 내용을 붙여넣고 게시합니다.
3. `firebase_deploy/public`을 Firebase Hosting에 배포합니다.

학생에게는 로그인 화면이 나타나지 않습니다. 각 기기는 Firebase Anonymous Auth로 자동 인증되지만, 학습 상태는 UID별이 아니라 고정된 단일 학생 경로 `history2SingleStudent/main/history2State/*`에 저장되어 모든 기기에서 공유됩니다.

관리자/학부모 화면 잠금은 앱 내부 PIN `2007`을 그대로 사용합니다. 이것은 서버 보안 인증이 아니라 로컬 관리자 화면 잠금입니다.

## Firestore 규칙

```text
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /history2SingleStudent/main/history2State/{stateId} {
      allow read, create, update, delete: if request.auth != null;
    }
  }
}
```

## Hosting 배포

Firebase CLI가 있는 환경에서 `firebase_deploy` 폴더를 기준으로:

```bash
firebase login
firebase use history-698f7
firebase deploy --only hosting,firestore:rules
```

브라우저 기반 Cloud Shell을 사용하면 Firebase CLI가 미리 설치되어 있어 로컬 설치 없이도 배포할 수 있습니다.
