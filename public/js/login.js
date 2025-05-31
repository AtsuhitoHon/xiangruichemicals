// Import Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import {
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    updateProfile,
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";
import { 
    getFirestore, 
    doc, 
    setDoc 
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
auth.languageCode = 'zh-TW';
const db = getFirestore(app);

// Email 登入
document.getElementById("loginForm").addEventListener("submit", async e => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;
    
    try {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        const user = cred.user;
        
        // 儲存用戶資料到 localStorage
        localStorage.setItem("user", JSON.stringify({ 
            name: user.displayName || "會員", 
            email: user.email,
            uid: user.uid
        }));
        
        window.showSuccess("登入成功，即將跳轉...");
        setTimeout(() => {
            window.location.href = "index.html"; // 跳轉到首頁
        }, 1500);
    } catch (err) {
        console.error("登入錯誤:", err);
        let msg = "登入失敗";
        if (err.code === "auth/invalid-email") msg = "電子郵件格式不正確";
        else if (err.code === "auth/user-not-found") msg = "此電子郵件尚未註冊";
        else if (err.code === "auth/wrong-password") msg = "密碼錯誤";
        else if (err.code === "auth/too-many-requests") msg = "嘗試次數過多，請稍後再試";
        else if (err.code === "auth/invalid-credential") msg = "登入資訊無效，請檢查郵件和密碼";
        window.showError(msg);
    }
});

// 註冊功能
document.getElementById("registerForm").addEventListener("submit", async e => {
    e.preventDefault();
    const name = document.getElementById("registerName").value;
    const company = document.getElementById("registerCompany").value;
    const phone = document.getElementById("registerPhone").value;
    const email = document.getElementById("registerEmail").value;
    const password = document.getElementById("registerPassword").value;
    const confirm = document.getElementById("confirmPassword").value;
    
    if (password !== confirm) {
        return window.showError("兩次密碼不一致");
    }
    if (password.length < 6) {
        return window.showError("密碼長度需至少6字元");
    }
    
    // 驗證電話格式（可選）
    const phoneRegex = /^[\d\-\(\)\s\+]+$/;
    if (!phoneRegex.test(phone)) {
        return window.showError("聯絡電話格式不正確");
    }
    
    try {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        
        // 更新用戶顯示名稱
        await updateProfile(cred.user, { displayName: name });
        
        // 將用戶資料存到 Firestore（包含新欄位）
        await setDoc(doc(db, "users", cred.user.uid), { 
            name, 
            company,
            phone,
            email, 
            createdAt: new Date(),
            role: "member"
        });
        
        // 儲存用戶資料到 localStorage（包含新欄位）
        localStorage.setItem("user", JSON.stringify({ 
            name, 
            company,
            phone,
            email,
            uid: cred.user.uid
        }));
        
        window.showSuccess("註冊成功，即將跳轉...");
        setTimeout(() => {
            window.location.href = "index.html"; // 跳轉到首頁
        }, 2000);
    } catch (err) {
        console.error("註冊錯誤:", err);
        let msg = "註冊失敗";
        if (err.code === "auth/email-already-in-use") msg = "此電子郵件已被註冊";
        else if (err.code === "auth/invalid-email") msg = "電子郵件格式不正確";
        else if (err.code === "auth/weak-password") msg = "密碼強度不足";
        window.showError(msg);
    }
});

// 忘記密碼
document.getElementById("forgotPasswordLink").addEventListener("click", async e => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value;
    
    if (!email) {
        return window.showError("請先輸入電子郵件");
    }
    
    try { 
        await sendPasswordResetEmail(auth, email); 
        window.showSuccess("密碼重設信已發送至您的信箱"); 
    } catch (err) { 
        console.error("重設密碼錯誤:", err);
        window.showError("重設失敗：" + err.message); 
    }
});