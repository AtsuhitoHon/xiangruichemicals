// Import Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import {
    getAuth,
    updateProfile,
    updatePassword,
    reauthenticateWithCredential,
    EmailAuthProvider
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";
import { 
    getFirestore, 
    doc, 
    updateDoc,
    getDoc
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";

// Firebase 配置
const firebaseConfig = {
    apiKey: "AIzaSyC75hTAQjOd9ELa-zEKebtAjbBUG3LhOQQ",
    authDomain: "xiangrui.firebaseapp.com",
    projectId: "xiangrui",
    storageBucket: "xiangrui.firebasestorage.app",
    messagingSenderId: "283398071894",
    appId: "1:283398071894:web:4350f34027a73d8a853df7"
};

// 初始化 Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 載入用戶資料
async function loadUserProfile() {
  const user = JSON.parse(localStorage.getItem('user'));
  
  if (!user || !user.uid) {
    // 如果未登入，重定向到登入頁面
    window.location.href = 'login.html';
    return;
  }

  try {
    // 從 Firestore 讀取最新的用戶資料
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      
      // 填充表單
      document.getElementById('name').value = userData.name || '';
      document.getElementById('email').value = userData.email || '';
      document.getElementById('phone').value = userData.phone || '';
      document.getElementById('mobile').value = userData.mobile || '';
      document.getElementById('company').value = userData.company || '';
      document.getElementById('position').value = userData.position || '';
      document.getElementById('address').value = userData.address || '';
      document.getElementById('profileDisplayName').textContent = userData.name || '會員';
      
      // 更新 localStorage 中的資料
      const updatedUser = { ...user, ...userData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } else {
      // 使用 localStorage 中的資料作為備用
      document.getElementById('name').value = user.name || '';
      document.getElementById('email').value = user.email || '';
      document.getElementById('phone').value = user.phone || '';
      document.getElementById('mobile').value = user.mobile || '';
      document.getElementById('company').value = user.company || '';
      document.getElementById('position').value = user.position || '';
      document.getElementById('address').value = user.address || '';
      document.getElementById('profileDisplayName').textContent = user.name || '會員';
    }
  } catch (error) {
    console.error('載入用戶資料錯誤:', error);
    alert('載入資料時發生錯誤，請重新登入');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
  }
}

// 儲存個人資料
async function saveProfile() {
  const user = JSON.parse(localStorage.getItem('user'));
  
  if (!user || !user.uid) {
    alert('用戶資訊無效，請重新登入');
    window.location.href = 'login.html';
    return;
  }

  // 收集表單資料
  const formData = {
    name: document.getElementById('name').value.trim(),
    email: document.getElementById('email').value.trim(),
    phone: document.getElementById('phone').value.trim(),
    mobile: document.getElementById('mobile').value.trim(),
    company: document.getElementById('company').value.trim(),
    position: document.getElementById('position').value.trim(),
    address: document.getElementById('address').value.trim()
  };

  // 驗證必填欄位
  if (!formData.name || !formData.email) {
    alert('姓名和電子信箱為必填欄位！');
    return;
  }

  const currentPassword = document.getElementById('currentPassword').value;
  const newPassword = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  
  // 檢查密碼變更
  if (newPassword || confirmPassword) {
    if (newPassword !== confirmPassword) {
      alert('新密碼與確認密碼不符！');
      return;
    }
    if (newPassword.length < 6) {
      alert('密碼長度至少需要6個字元！');
      return;
    }
    if (!currentPassword) {
      alert('變更密碼時必須輸入目前密碼！');
      return;
    }
  }

  try {
    // 顯示載入中
    const saveBtn = document.querySelector('.btn-primary');
    const originalText = saveBtn.innerHTML;
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 儲存中...';
    saveBtn.disabled = true;

    // 如果需要更新密碼
    if (newPassword && currentPassword) {
      const currentUser = auth.currentUser;
      if (currentUser) {
        // 重新驗證用戶
        const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
        await reauthenticateWithCredential(currentUser, credential);
        
        // 更新密碼
        await updatePassword(currentUser, newPassword);
      }
    }

    // 更新 Firebase Auth 中的顯示名稱
    if (auth.currentUser && formData.name !== auth.currentUser.displayName) {
      await updateProfile(auth.currentUser, { displayName: formData.name });
    }

    // 更新 Firestore 中的用戶資料
    await updateDoc(doc(db, "users", user.uid), {
      ...formData,
      updatedAt: new Date()
    });

    // 更新 localStorage
    const updatedUser = { ...user, ...formData };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    // 更新顯示的姓名
    document.getElementById('profileDisplayName').textContent = formData.name;
    
    // 顯示成功訊息
    const successMessage = document.getElementById('successMessage');
    successMessage.style.display = 'block';
    
    // 清空密碼欄位
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
    
    // 3秒後隱藏成功訊息
    setTimeout(() => {
      successMessage.style.display = 'none';
    }, 3000);
    
    // 更新導航列中的會員名稱
    if (typeof checkLoginStatus === 'function') {
      checkLoginStatus();
    }

    // 恢復按鈕
    saveBtn.innerHTML = originalText;
    saveBtn.disabled = false;

  } catch (error) {
    console.error('儲存資料錯誤:', error);
    
    let errorMessage = '儲存失敗，請稍後再試';
    if (error.code === 'auth/wrong-password') {
      errorMessage = '目前密碼不正確';
    } else if (error.code === 'auth/requires-recent-login') {
      errorMessage = '請重新登入後再嘗試變更密碼';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = '新密碼強度不足';
    }
    
    alert(errorMessage);
    
    // 恢復按鈕
    const saveBtn = document.querySelector('.btn-primary');
    saveBtn.innerHTML = '<i class="fas fa-save"></i> 儲存變更';
    saveBtn.disabled = false;
  }
}

// 重置表單
function resetForm() {
  if (confirm('確定要重置所有變更嗎？')) {
    loadUserProfile();
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
  }
}

// 將函數設為全域變數
window.saveProfile = saveProfile;
window.resetForm = resetForm;

// 頁面載入時執行
document.addEventListener('DOMContentLoaded', function() {
  loadUserProfile();
});