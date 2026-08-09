/*
  Firebase Web App configuration for the single-student History2 app.
  This config identifies the Firebase web app; access is controlled by Auth + Firestore Rules.
*/
window.HISTORY2_FIREBASE_CONFIG = {
  apiKey: "AIzaSyBdetL7bMX7Gg0WkThebuG4toUIXwH1SHs",
  authDomain: "history-698f7.firebaseapp.com",
  projectId: "history-698f7",
  storageBucket: "history-698f7.firebasestorage.app",
  messagingSenderId: "692522343797",
  appId: "1:692522343797:web:e04de597b273fe4ef4873c"
};
window.HISTORY2_SYNC_OPTIONS = Object.assign({
  collectionName: "history2State",
  sharedRootCollection: "history2SingleStudent",
  sharedRootDocument: "main",
  sdkVersion: "12.16.0",
  syncPrefix: "history2-",
  schema: 2,
  autoAnonymousAuth: true
}, window.HISTORY2_SYNC_OPTIONS || {});
