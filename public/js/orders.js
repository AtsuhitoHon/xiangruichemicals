
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { collection, query, orderBy, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { db, auth } from "./firebaseAuth.js";

document.addEventListener('DOMContentLoaded', () => {
  const questionList = document.getElementById('questionList');
  const qaTableBody = document.querySelector('#qaTable tbody');

  onAuthStateChanged(auth, (user) => {
    if (user) {
      loadQuestions();
    } else {
      if (questionList) {
        questionList.innerHTML = '<li>請登入以查看您的提問紀錄。</li>';
      }
    }
  });
});

async function loadQuestions() {
  const questionList = document.getElementById('questionList');
  const qaTableBody = document.querySelector('#qaTable tbody');

  questionList.innerHTML = '<li>載入中...</li>';
  qaTableBody.innerHTML = '';

  try {
    const q = query(collection(db, "QA"), orderBy("timestamp", "desc"));
    const snapshot = await getDocs(q);

    questionList.innerHTML = '';
    if (snapshot.empty) {
      questionList.innerHTML = '<li>您目前沒有提問紀錄。</li>';
      return;
    }

    snapshot.forEach(doc => {
      const data = doc.data();
      const li = document.createElement('li');
      li.innerHTML = `
        <h4>主旨：${data.subject || '無主旨'}</h4>
        <p><strong>提問內容：</strong> ${data.messge || '無內容'}</p>
        <p><strong>時間：</strong> ${data.timestamp ? new Date(data.timestamp.seconds * 1000).toLocaleString() : '無'}</p>
        <p><strong>姓名：</strong> ${data.name || '無'}</p>
        <p><strong>Email：</strong> ${data.Email || '無'}</p>
        <hr>`;
      questionList.appendChild(li);

      // const row = document.createElement('tr');
      // row.innerHTML = `
      //   <td>${data.name || ''}</td>
      //   <td>${data.Email || ''}</td>
      //   <td>${data.subject || ''}</td>
      //   <td>${data.message || data.messge || ''}</td>`;
      // qaTableBody.appendChild(row);
    });
  } catch (err) {
    questionList.innerHTML = '<li>載入提問紀錄時發生錯誤。</li>';
    console.error("載入錯誤：", err);
  }
}
