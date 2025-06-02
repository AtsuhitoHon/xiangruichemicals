// contact-form.js
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { db } from "./firebaseAuth.js";

// 等待 DOM 載入完成後再執行
document.addEventListener('DOMContentLoaded', () => {
  // 獲取具有 id "questionForm" 的表單元素
  const questionForm = document.getElementById("questionForm");

  // 檢查是否找到了表單元素
  if (questionForm) {
    questionForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      // 從輸入欄位獲取值
      const name = document.getElementById("name").value.trim();
      const email = document.getElementById("email").value.trim();
      const number = document.getElementById("phone").value.trim(); // 注意這裡的 id 是 "phone"
      const subject = document.getElementById("subject").value.trim(); // 保持主題字段，雖然你提供的 Firebase 結構沒有這個字段，但 HTML 表單有
      const message = document.getElementById("message").value.trim();

      // 確保所有必填欄位都有值
      // 根據你的 HTML，姓名、電子信箱、主旨、詳細需求是必填
      if (!name || !email || !subject || !message) {
          alert("請填寫所有必填欄位（姓名、電子信箱、主旨、詳細需求）！");
          return;
      }

      // 將電話號碼轉換為數字類型（如果輸入的是數字）
      const numberValue = number ? parseInt(number) : null;
      if (number && isNaN(numberValue)) {
          alert("電話號碼格式不正確！");
          return;
      }


      try {
        // 將 QA 問題儲存到 Firestore 的 'QA' 集合中
        const docRef = await addDoc(collection(db, "QA"), { // **將集合名稱改為 "QA"**
          name: name,
          Email: email,      // 使用 "Email" 字段名
          number: numberValue, // 使用 "number" 字段名並儲存為數字
          subject: subject,
          messge: message,   // 使用 "messge" 字段名 (注意拼寫)
          timestamp: new Date() // 記錄提交時間
        });

        console.log("Document written with ID: ", docRef.id);
        alert("感謝您的提問！我們會盡快回覆您。");

        // 清空表單欄位
        questionForm.reset();

      } catch (e) {
        console.error("Error adding document: ", e);
        alert("提交問題時發生錯誤，請稍後再試。");
      }
    });
  } else {
    console.error("找不到 id 為 'questionForm' 的元素！請檢查 contact.html 文件中的 <form> 標籤 ID。");
  }
});
