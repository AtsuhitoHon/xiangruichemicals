
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  getDoc,
  doc,
  setDoc
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

      if (loginNavItem) loginNavItem.style.display = "none";
      if (userNavItem) userNavItem.style.display = "block";

      if (userRole === "member") {
        enableFavoriteButtons(user.uid);
      }
    }
  });
});

async function enableFavoriteButtons(uid) {
  const favDocRef = doc(db, "favorites", uid);
  let currentFavorites = [];

  try {
    const favSnap = await getDoc(favDocRef);
    if (favSnap.exists()) {
      currentFavorites = favSnap.data().items || [];
    }
  } catch (e) {
    console.warn("無法讀取目前收藏清單：", e);
  }

  const cards = document.querySelectorAll(".product-card");

  cards.forEach((card) => {
    const title = card.querySelector(".product-title")?.textContent?.trim();
    const desc = card.querySelector(".product-description")?.textContent?.trim();
    const isFavorited = currentFavorites.some(fav => fav.title === title);

    const btn = document.createElement("button");
    btn.className = "favorite-btn";
    btn.textContent = isFavorited ? "💔 取消收藏" : "❤️ 收藏";
    btn.style.marginTop = "10px";
    btn.style.border = "none";
    btn.style.background = "transparent";
    btn.style.cursor = "pointer";
    btn.title = "收藏或取消收藏這項產品";

    btn.addEventListener("click", async () => {
      try {
        let updatedList;
        if (btn.textContent.includes("取消")) {
          // ❌ 取消收藏：過濾掉該項目（以 title 為準）
          updatedList = currentFavorites.filter(fav => fav.title !== title);
          await setDoc(favDocRef, { items: updatedList }, { merge: true });
          btn.textContent = "❤️ 收藏";
          alert("已取消收藏！");
        } else {
          // ✅ 新增收藏
          const newItem = { title, description: desc, addedAt: new Date() };
          updatedList = [...currentFavorites, newItem];
          await setDoc(favDocRef, { items: updatedList }, { merge: true });
          btn.textContent = "💔 取消收藏";
          alert("已加入收藏！");
        }
        currentFavorites = updatedList;
      } catch (err) {
        console.error("更新收藏失敗：", err);
        alert("操作失敗，請稍後再試。");
      }
    });

    card.querySelector(".product-info").appendChild(btn);
  });
}
