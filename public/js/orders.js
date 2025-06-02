
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  collection,
  query,
  orderBy,
  getDocs,
  getDoc,
  doc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { db, auth } from "./firebaseAuth.js";

document.addEventListener('DOMContentLoaded', () => {
  const questionList = document.getElementById('questionList');

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);
      const userData = userDocSnap.exists() ? userDocSnap.data() : {};
      const userRole = userData.role || null;
      const userEmail = userData.email || null;

      window.currentUserRole = userRole;
      window.currentUserEmail = userEmail;

      console.log(`[角色檢查] 使用者 ${user.uid} 的角色是：${userRole}, Email: ${userEmail}`);

      if (userRole === "admin" || userRole === "member") {
        loadQuestions();
      } else {
        questionList.innerHTML = '<li>您沒有檢視提問紀錄的權限。</li>';
      }
    } else {
      questionList.innerHTML = '<li>請登入以查看您的提問紀錄。</li>';
    }
  });
});

async function loadQuestions() {
  const questionList = document.getElementById('questionList');
  questionList.innerHTML = '<li>載入中...</li>';

  try {
    const q = query(collection(db, "QA"), orderBy("timestamp", "desc"));
    const snapshot = await getDocs(q);

    questionList.innerHTML = '';
    if (snapshot.empty) {
      questionList.innerHTML = '<li>您目前沒有提問紀錄。</li>';
      return;
    }

    snapshot.forEach(docSnap => {
      const data = docSnap.data();

      const qaEmail = typeof data.Email === 'string' ? data.Email.toLowerCase() : '';
      const userEmail = typeof window.currentUserEmail === 'string' ? window.currentUserEmail.toLowerCase() : '';
      const matched = qaEmail === userEmail;

      console.log(`[比對] QA.Email: ${qaEmail}, 使用者 Email: ${userEmail}, 是否相符: ${matched}`);

      const shouldShow = window.currentUserRole === "admin" || matched;
      if (!shouldShow) return;

      const li = document.createElement('li');
      li.innerHTML = `
        <h4>主旨：${data.subject || '無主旨'}</h4>
        <p><strong>提問內容：</strong> ${data.messge || '無內容'}</p>
        <p><strong>時間：</strong> ${data.timestamp ? new Date(data.timestamp.seconds * 1000).toLocaleString() : '無'}</p>
        <p><strong>姓名：</strong> ${data.name || '無'}</p>
        <p><strong>Email：</strong> ${data.Email || '無'}</p>
        <hr>`;

      if (window.currentUserRole === "admin") {
        li.innerHTML += `<button class="delete-btn" data-id="${docSnap.id}">🗑️ 刪除</button>`;
      }

      questionList.appendChild(li);
    });

    setTimeout(() => {
      document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const docId = e.target.dataset.id;
          const confirmDelete = confirm("確定要刪除這筆提問紀錄嗎？");
          if (!confirmDelete) return;

          await deleteDoc(doc(db, "QA", docId));
          alert("已刪除！");
          location.reload();
        });
      });
    }, 0);

  } catch (err) {
    questionList.innerHTML = '<li>載入提問紀錄時發生錯誤。</li>';
    console.error("載入錯誤：", err);
  }
}
