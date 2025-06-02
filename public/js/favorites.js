
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { db, auth } from "./firebaseAuth.js";

document.addEventListener("DOMContentLoaded", () => {
  const userInfo = document.getElementById("userInfo");
  const favoritesList = document.getElementById("favoritesList");

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      userInfo.textContent = "請先登入以查看您的收藏清單。";
      favoritesList.innerHTML = "";
      return;
    }

    try {
      const userDocRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userDocRef);
      const userData = userSnap.exists() ? userSnap.data() : {};
      const userName = userData.name || "未命名使用者";

      userInfo.textContent = `這是 ${userName} 的收藏清單：`;

      const favRef = doc(db, "favorites", user.uid);
      const favSnap = await getDoc(favRef);

      if (!favSnap.exists() || !favSnap.data().items || favSnap.data().items.length === 0) {
        favoritesList.innerHTML = "<li>目前尚未收藏任何產品。</li>";
        return;
      }

      const items = favSnap.data().items;
      favoritesList.innerHTML = "";

      items.forEach(item => {
        const li = document.createElement("li");
        li.innerHTML = `<strong>${item.title}</strong><br><small>${item.description}</small>`;
        favoritesList.appendChild(li);
      });

    } catch (error) {
      console.error("讀取收藏清單錯誤：", error);
      userInfo.textContent = "載入使用者資訊失敗";
      favoritesList.innerHTML = "<li>無法取得資料，請稍後再試。</li>";
    }
  });
});
