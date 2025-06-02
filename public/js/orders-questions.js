
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { app } from "./firebaseAuth.js";

const auth = getAuth(app);
const db = getFirestore(app);

onAuthStateChanged(auth, async (user) => {
  if (!user) {
  // 未登入處理

    alert("請先登入查看提問紀錄");
    window.location.href = "login.html";
    return;
  }

  const questionList = document.getElementById("questionList");
  questionList.innerHTML = "";

  
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const userNameElem = document.getElementById("userName");
      if (userNameElem) {
        userNameElem.textContent = userData.name || "會員";
      }
    }

  const q = query(
    collection(db, "questions", user.uid, "userQuestions"),
    orderBy("timestamp", "desc")
  );

  const snapshot = await getDocs(q);
  if (snapshot.empty) {
    questionList.innerHTML = "<p>尚未提問任何問題。</p>";
    return;
  }

  snapshot.forEach(doc => {
    const data = doc.data();
    const div = document.createElement("div");
    div.className = "question-card";
    div.innerHTML = `
      <p><strong>問題：</strong>${data.question}</p>
      <p><strong>姓名：</strong>${data.name}</p>
      <p><strong>電話：</strong>${data.phone}</p>
      <p><small>${data.timestamp?.toDate().toLocaleString() || '無時間'}</small></p>
    `;
    questionList.appendChild(div);
  });
});
