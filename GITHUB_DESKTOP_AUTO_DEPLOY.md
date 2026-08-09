# GitHub Desktop → Firebase Hosting 자동 배포

이 폴더는 GitHub 저장소의 **루트**로 사용하도록 구성되어 있습니다.

## 최종 동작

1. GitHub Desktop에서 수정 파일을 Commit
2. `Push origin`
3. GitHub Actions가 자동 실행
4. Firebase 프로젝트 `history-698f7`의 **live Hosting**으로 자동 배포

워크플로 파일:

- `.github/workflows/firebase-hosting-deploy.yml`

## 최초 1회만 필요한 연결

GitHub Actions가 Firebase에 배포하려면 GitHub 저장소의 Actions secret에 다음 이름의 Firebase 서비스 계정 JSON이 있어야 합니다.

`FIREBASE_SERVICE_ACCOUNT_HISTORY_698F7`

Firebase 공식 권장 방법은 Firebase CLI에서 Hosting이 이미 설정된 프로젝트 루트에서 다음을 실행하여 GitHub 연동을 초기화하는 것입니다.

`firebase init hosting:github`

이 단계는 GitHub 저장소가 정해진 뒤 **한 번만** 진행합니다. 서비스 계정 JSON 파일을 저장소에 직접 넣거나 커밋하면 안 됩니다.

## 현재 프로젝트 배포 대상

- Firebase project ID: `history-698f7`
- Hosting public directory: `public`
- live URL: `https://history-698f7.web.app`

## 참고

현재 자동화 워크플로는 **Hosting 파일 자동 배포**용입니다. 이미 게시한 Firestore 보안 규칙은 그대로 유지됩니다. Firestore 규칙 자체를 수정할 때만 별도 규칙 배포 절차를 사용합니다.
