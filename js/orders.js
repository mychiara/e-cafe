import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";
import { db } from "./firebase-config.js";
import { formatIDR } from "./ui.js";

// Load Active Orders as individual cards
export async function loadActiveOrders() {
  const grid = document.getElementById("active-orders-grid");
  if (!grid) return;

  grid.innerHTML =
    "<p style='padding: 40px; text-align:center;'>Memuat pesanan aktif...</p>";

  try {
    const q = query(
      collection(db, "transactions"),
      orderBy("createdAt", "desc"),
      limit(12),
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      grid.innerHTML =
        "<p style='padding: 40px; text-align:center; color: var(--text-secondary);'>Belum ada pesanan aktif saat ini.</p>";
      return;
    }

    grid.innerHTML = "";
    grid.style.cssText =
      "display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px;";

    querySnapshot.forEach((docSnap) => {
      const trx = docSnap.data();
      const date = trx.createdAt ? trx.createdAt.toDate() : new Date();
      const timeStr = date.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      });

      const card = document.createElement("div");
      card.className = "stat-card"; // Reusing card design
      card.style.flexDirection = "column";
      card.style.alignItems = "stretch";

      card.innerHTML = `
                <div style="display:flex; justify-content:space-between; margin-bottom:15px; border-bottom:1px solid var(--border-color); padding-bottom:10px;">
                    <h5 style="font-size: 1rem;">Meja No. ${trx.tableNumber}</h5>
                    <span style="font-size:0.8rem; color: var(--text-secondary);">${timeStr}</span>
                </div>
                <div style="margin-bottom:15px; font-size:0.85rem;">
                    ${trx.items.map((i) => `<div style="display:flex; justify-content:space-between;"><span>${i.name} x${i.quantity}</span><span>${formatIDR(i.price * i.quantity)}</span></div>`).join("")}
                </div>
                <div style="display:flex; justify-content:space-between; font-weight:700; color: var(--primary-color);">
                    <span>Total</span>
                    <span>${formatIDR(trx.totalAmount)}</span>
                </div>
                <div style="margin-top:15px;">
                    <span class="status-badge paid" style="padding: 5px 15px; display: block; text-align:center;">Lunas (Selesai)</span>
                </div>
            `;
      grid.appendChild(card);
    });
  } catch (error) {
    console.error("Gagal memuat pesanan:", error);
  }
}

// Nav handling
document.addEventListener("click", (e) => {
  const navItem = e.target.closest(".nav-item");
  if (navItem && navItem.dataset.view === "orders") {
    loadActiveOrders();
  }
});
