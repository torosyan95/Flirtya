// Подключение Firebase SDK (не забудь вставить свой реальный конфиг!)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "flirtya-app.firebaseapp.com",
  projectId: "flirtya-app",
  storageBucket: "flirtya-app.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
