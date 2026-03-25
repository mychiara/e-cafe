import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";
import { db } from "./firebase-config.js";
import { initAuth, logout } from "./auth.js";
import { switchView, updateDateDisplay, formatIDR } from "./ui.js";

document.addEventListener("DOMContentLoaded", async () => {
  initAuth();
  updateDateDisplay();

  // Mobile Sidebar Toggle
  const btnToggle = document.getElementById("btn-sidebar-toggle");
  const sidebar = document.getElementById("sidebar-nav");
  const overlay = document.getElementById("sidebar-overlay");

  if (btnToggle) {
    btnToggle.onclick = () => {
      sidebar.classList.toggle("show-sidebar");
      overlay.classList.toggle("show");
    };
  }

  if (overlay) {
    overlay.onclick = () => {
      sidebar.classList.remove("show-sidebar");
      overlay.classList.remove("show");
    };
  }

  // Sidebar Menu Clicks
  const navItems = document.querySelectorAll(".nav-item");
  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      const viewId = item.getAttribute("data-view");
      if (viewId) switchView(viewId);

      // Close sidebar on mobile after clicking
      sidebar.classList.remove("show-sidebar");
      overlay.classList.remove("show");
    });
  });

  // Recent Orders Real-time Listener
  const recentOrdersList = document.getElementById("recent-orders-list");
  if (recentOrdersList) {
    const q = query(
      collection(db, "transactions"),
      orderBy("createdAt", "desc"),
      limit(5),
    );
    onSnapshot(q, (snapshot) => {
      recentOrdersList.innerHTML = "";
      if (snapshot.empty) {
        recentOrdersList.innerHTML =
          "<p style='text-align:center; padding:20px; color:var(--text-secondary);'>Belum ada pesanan.</p>";
        return;
      }
      snapshot.forEach((doc) => {
        const data = doc.data();
        const time = data.createdAt
          ? data.createdAt.toDate().toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "...";
        const div = document.createElement("div");
        div.className = "activity-item";
        div.style =
          "display:flex; justify-content:space-between; padding:12px; border-bottom:1px solid rgba(255,255,255,0.05);";
        div.innerHTML = `
                <div>
                    <h5 style="margin:0">Meja ${data.tableNumber || "?"}</h5>
                    <small style="color:var(--text-secondary)">${time} • ${data.items?.length || 0} item</small>
                </div>
                <div style="text-align:right">
                    <div style="font-weight:700; color:var(--primary-color)">${formatIDR(data.totalAmount)}</div>
                    <span class="status-badge paid">Berhasil</span>
                </div>
            `;
        recentOrdersList.appendChild(div);
      });
    });
  }

  // Logout Click
  const btnLogout = document.getElementById("btn-logout");
  if (btnLogout) {
    btnLogout.addEventListener("click", async () => {
      if (confirm("Apakah Anda yakin ingin keluar?")) await logout();
    });
  }
});
