// firebaseAuth.js
// 集中管理使用者認證、個資設定與操作功能
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification,
  updatePassword,
  signOut,
  deleteUser,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 初始化 Firebase
// const firebaseConfig = {
//   apiKey: "AIzaSyBbfIAA8DQ-UUdIV5Vmxs-4dIdyylS9h8s",
//   authDomain: "midworksever.firebaseapp.com",
//   projectId: "midworksever",
//   storageBucket: "midworksever.firebasestorage.app",
//   messagingSenderId: "140424851250",
//   appId: "1:140424851250:web:7e09ec558a41565b2cf12b",
//   measurementId: "G-G5TEDKYR0L"
// };
const firebaseConfig = {
  apiKey: "AIzaSyC75hTAQjOd9ELa-zEKebtAjbBUG3LhOQQ",
  authDomain: "xiangrui.firebaseapp.com",
  projectId: "xiangrui",
  storageBucket: "xiangrui.firebasestorage.app",
  messagingSenderId: "283398071894",
  appId: "1:283398071894:web:4350f34027a73d8a853df7"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
auth.languageCode = 'zh-TW';


// 第三方登入提供者
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

// ====== 認證 & 註冊 ======
export async function registerWithEmail(name, email, password) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  // 註冊完成後更新 displayName
  await updateProfile(userCredential.user, { displayName: name });
  // 將使用者資料存至 Firestore，方便後續寫入遊戲資料
  await setDoc(doc(db, 'profiles', userCredential.user.uid), {
    name,
    email,
    createdAt: new Date()
  });
  // 寄送驗證信
  await sendEmailVerification(userCredential.user);
  return userCredential.user;
}

export async function loginWithEmail(email, password) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function signInWithFacebook() {
  const result = await signInWithPopup(auth, facebookProvider);
  return result.user;
}

// ====== 帳號管理功能 ======
export async function changeDisplayName(newName) {
  if (!auth.currentUser) throw new Error('未登入');
  await updateProfile(auth.currentUser, { displayName: newName });
  // 同步更新 Firestore 中的 profile
  await updateDoc(doc(db, 'profiles', auth.currentUser.uid), { name: newName });
}

export async function changeUserPassword(newPassword) {
  if (!auth.currentUser) throw new Error('未登入');
  await updatePassword(auth.currentUser, newPassword);
}

export async function sendVerificationEmailToUser() {
  if (!auth.currentUser) throw new Error('未登入');
  await sendEmailVerification(auth.currentUser);
}

export async function resetPassword(email) {
  await sendPasswordResetEmail(auth, email);
}

export async function logoutUser() {
  await signOut(auth);
}

export async function deleteCurrentUser() {
  if (!auth.currentUser) throw new Error('未登入');
  // 刪除 Firestore profile
  await deleteDoc(doc(db, 'profiles', auth.currentUser.uid));
  // 刪除 Firebase Auth 帳號
  await deleteUser(auth.currentUser);
}

// ====== 實時監聽使用者狀態 ======
onAuthStateChanged(auth, user => {
  if (user) {
    // 登入後自動 redirect 或顯示名稱
    const storedName = user.displayName || '使用者';
    localStorage.setItem('userName', storedName);
  } else {
    localStorage.removeItem('userName');
  }
});
export { auth, db };

// ====== 在 game.html 顯示使用者名稱 ======
// 在 game.html 頁面中，只需在 <body> 中引入這段或透過 DOMContentLoaded 取得並顯示：
//
// <script type="module">
//   import { auth } from './firebaseAuth.js';
//   import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
//   document.addEventListener('DOMContentLoaded', () => {
//     const nameEl = document.getElementById('playerName');
//     onAuthStateChanged(auth, user => {
//       if (user) nameEl.textContent = user.displayName || '玩家';
//       else nameEl.textContent = '訪客';
//     });
//   });
// </script>

// HTML 範例插入點 (game.html):
// <div class="welcome">
//   <h1>歡迎，<span id="playerName"></span>！</h1>
// </div>
