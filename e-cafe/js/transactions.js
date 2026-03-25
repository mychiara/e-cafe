import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";
import { db } from "./firebase-config.js";
import { formatIDR } from "./ui.js";

// Load Recent Transactions to Dashboard
export async function loadRecentActivity() {
  const container = document.getElementById("recent-orders-list");
  if (!container) return;

  container.innerHTML =
    "<p style='text-align:center; padding: 20px;'>Memuat aktivitas...</p>";

  const q = query(
    collection(db, "transactions"),
    orderBy("createdAt", "desc"),
    limit(5),
  );
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    container.innerHTML =
      "<p style='text-align:center; padding: 20px; color: var(--text-secondary);'>Belum ada transaksi.</p>";
    return;
  }

  container.innerHTML = "";
  querySnapshot.forEach((docSnap) => {
    const trx = docSnap.data();
    const date = trx.createdAt ? trx.createdAt.toDate() : new Date();
    const timeStr = date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const item = document.createElement("div");
    item.className = "activity-item";
    item.style.cssText =
      "display: flex; justify-content: space-between; padding: 12px; border-bottom: 1px solid var(--border-color);";
    item.innerHTML = `
      <div class="activity-info">
        <h5 style="font-size: 0.9rem; margin-bottom: 2px;">Meja No. ${trx.tableNumber || "-"}</h5>
        <span style="font-size: 0.75rem; color: var(--text-secondary);">${timeStr} • ${trx.status}</span>
      </div>
      <div class="activity-amount" style="font-weight: 600; color: var(--success);">
        + ${formatIDR(trx.totalAmount)}
      </div>
    `;
    container.appendChild(item);
  });
}

// Load Full Transaction History Table
export async function loadFullHistory() {
  const list = document.getElementById("transactions-history-list");
  if (!list) return;

  list.innerHTML =
    "<tr><td colspan='6' style='text-align:center;'>Memuat riwayat...</td></tr>";

  const q = query(collection(db, "transactions"), orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    list.innerHTML =
      "<tr><td colspan='6' style='text-align:center;'>Belum ada data.</td></tr>";
    return;
  }

  list.innerHTML = "";
  querySnapshot.forEach((docSnap) => {
    const trx = docSnap.data();
    const date = trx.createdAt ? trx.createdAt.toDate() : new Date();
    const dateStr =
      date.toLocaleDateString("id-ID") +
      " " +
      date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

    const tr = document.createElement("tr");
    tr.innerHTML = `
            <td style="font-size: 0.8rem; color: var(--text-secondary);">${docSnap.id.substring(0, 8)}...</td>
            <td>${dateStr}</td>
            <td>Meja ${trx.tableNumber || "-"}</td>
            <td style="font-weight: 600;">${formatIDR(trx.totalAmount)}</td>
            <td><span class="status-badge ${trx.status}">${trx.status}</span></td>
            <td><button class="btn-text" onclick="alert('Fitur Print Nota menyusul!')"><i class="fas fa-print"></i></button></td>
        `;
    list.appendChild(tr);
  });
}

// Initial Dashboard load
document.addEventListener("click", (e) => {
  const navItem = e.target.closest(".nav-item");
  if (navItem && navItem.dataset.view === "dashboard") {
    loadRecentActivity();
  }
  if (navItem && navItem.dataset.view === "transactions") {
    loadFullHistory();
  }
});
// Also auto-load on first entry
window.addEventListener("load", () => {
  setTimeout(loadRecentActivity, 1000);
});
