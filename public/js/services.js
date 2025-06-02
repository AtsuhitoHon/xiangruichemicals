
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  getDoc,
  doc,
  setDoc,
  updateDoc,
  arrayUnion
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { db, auth } from "./firebaseAuth.js";

document.addEventListener('DOMContentLoaded', () => {
  const loginNavItem = document.getElementById("loginNavItem");
  const userNavItem = document.getElementById("userNavItem");

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);
      const userData = userDocSnap.exists() ? userDocSnap.data() : {};
      const userRole = userData.role || null;

      console.log(`[角色檢查] 使用者 ${user.uid} 角色：${userRole}`);

      // 顯示會員選單
      if (loginNavItem) loginNavItem.style.display = "none";
      if (userNavItem) userNavItem.style.display = "block";

      if (userRole === "member") {
        enableFavoriteButtons(user.uid);
      }
    }
  });
});

function enableFavoriteButtons(uid) {
  // 對所有產品卡片加入愛心按鈕
  const cards = document.querySelectorAll(".product-card");

  cards.forEach((card, index) => {
    const btn = document.createElement("button");
    btn.className = "favorite-btn";
    btn.innerHTML = "❤️ 收藏";
    btn.style.marginTop = "10px";
    btn.style.border = "none";
    btn.style.background = "transparent";
    btn.style.cursor = "pointer";
    btn.title = "收藏這項產品";

    btn.addEventListener("click", async () => {
      const productTitle = card.querySelector(".product-title")?.textContent?.trim();
      const productDesc = card.querySelector(".product-description")?.textContent?.trim();

      try {
        const favRef = doc(db, "favorites", uid);
        await setDoc(favRef, {
          items: arrayUnion({
            title: productTitle,
            description: productDesc,
            addedAt: new Date()
          })
        }, { merge: true });

        alert("已加入收藏！");
      } catch (err) {
        console.error("收藏失敗：", err);
        alert("加入收藏失敗，請稍後再試。");
      }
    });

    card.querySelector(".product-info").appendChild(btn);
  });
}
