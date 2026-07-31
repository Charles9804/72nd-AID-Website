// js/firebase-config.js

const firebaseConfig = {
  apiKey: "AIzaSyBPZufJ6lt7RcZoNvQNNgiQEEg8JE6ywZo",
  authDomain: "nd-aid-website.firebaseapp.com",
  projectId: "nd-aid-website",
  storageBucket: "nd-aid-website.firebasestorage.app",
  messagingSenderId: "182805578751",
  appId: "1:182805578751:web:bdb941953840c597cc5dca"
};

// 初始化 Firebase (v8 CDN 專用寫法)
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// 建立全域變數提供給 auth.js 與 auth-logic.js 使用
const auth = firebase.auth();
const db = firebase.firestore();