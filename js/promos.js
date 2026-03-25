import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";
import { db } from "./firebase-config.js";

// Load Promos for Dashboard
export async function loadPromos() {
  const listTable = document.getElementById("promos-list");
  if (!listTable) return;
  listTable.innerHTML =
    "<tr><td colspan='4' style='text-align:center;'>Memuat data promosi...</td></tr>";

  try {
    const snaps = await getDocs(collection(db, "promos"));
    listTable.innerHTML = "";
    snaps.forEach((d) => {
      const p = d.data();
      const tr = document.createElement("tr");
      tr.innerHTML = `
                <td><strong>${p.title}</strong></td>
                <td style="font-size: 0.85rem; color: var(--text-secondary); max-width: 250px;">${p.description}</td>
                <td><span class="status-badge ${p.active ? "paid" : "pending"}">${p.active ? "Aktif" : "Nonaktif"}</span></td>
                <td>
                    <button class="btn-text" onclick="window.editPromo('${d.id}')"><i class="fas fa-pen-to-square"></i></button>
                    <button class="btn-text" style="color:var(--danger); margin-left:10px;" onclick="window.deletePromo('${d.id}')"><i class="fas fa-trash-can"></i></button>
                </td>
            `;
      listTable.appendChild(tr);
    });
  } catch (e) {
    console.error(e);
  }
}

// Global functions for inline calls
window.deletePromo = async (id) => {
  if (!confirm("Hapus promosi ini?")) return;
  await deleteDoc(doc(db, "promos", id));
  loadPromos();
};

window.editPromo = async (id) => {
  const d = await getDoc(doc(db, "promos", id));
  if (d.exists()) {
    const p = d.data();
    document.getElementById("promo-id").value = id;
    document.getElementById("promo-title").value = p.title;
    document.getElementById("promo-desc").value = p.description;
    document.getElementById("promo-active").value = p.active ? "true" : "false";
    document.getElementById("promo-modal-title").textContent = "Edit Promosi";
    document.getElementById("modal-promo").classList.remove("hidden");
  }
};

// Form handling
document.getElementById("btn-add-promo")?.addEventListener("click", () => {
  document.getElementById("promo-form").reset();
  document.getElementById("promo-id").value = "";
  document.getElementById("promo-modal-title").textContent = "Tambah Promosi";
  document.getElementById("modal-promo").classList.remove("hidden");
});

document.getElementById("promo-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = document.getElementById("promo-id").value;
  const data = {
    title: document.getElementById("promo-title").value,
    description: document.getElementById("promo-desc").value,
    active: document.getElementById("promo-active").value === "true",
    createdAt: new Date(),
  };

  if (id) {
    await updateDoc(doc(db, "promos", id), data);
  } else {
    await addDoc(collection(db, "promos"), data);
  }
  document.getElementById("modal-promo").classList.add("hidden");
  loadPromos();
});

// Sidebar listener
document.addEventListener("click", (e) => {
  if (e.target.closest(".nav-item")?.dataset.view === "promos") loadPromos();
});

// Load Active Promos for Landing Page
export async function getActivePromos() {
  const q = query(collection(db, "promos"), where("active", "==", true));
  const snaps = await getDocs(q);
  return snaps.docs.map((d) => ({ id: d.id, ...d.data() }));
}
