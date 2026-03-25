import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  deleteDoc,
  addDoc,
  setDoc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";
import { auth, db } from "./firebase-config.js";
import { formatIDR } from "./ui.js";

// Load Inventory
export async function loadInventory() {
  const listTable = document.getElementById("inventory-list");
  if (!listTable) return;
  listTable.innerHTML =
    "<tr><td colspan='5' style='text-align:center;'>Memuat inventaris...</td></tr>";

  try {
    // Get user role for permission check
    const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
    const userRole = userDoc.data()?.role || "waiter";
    const canEdit = ["admin", "manager"].includes(userRole);

    const q = query(collection(db, "products"), orderBy("name"));
    const snaps = await getDocs(q);
    listTable.innerHTML = "";
    snaps.forEach((d) => {
      const p = d.data();
      const tr = document.createElement("tr");
      tr.innerHTML = `
                <td>
                    <div style="display:flex; align-items:center; gap:10px;">
                        <img src="${p.imageUrl || "img/placeholder.png"}" style="width:35px; height:35px; border-radius:6px; object-fit:cover;">
                        <strong>${p.name}</strong>
                    </div>
                </td>
                <td style="text-transform: capitalize;">${p.category}</td>
                <td>${formatIDR(p.price)}</td>
                <td><span class="status-badge ${p.active ? "paid" : "pending"}">${p.active ? "Tersedia" : "Habis"}</span></td>
                <td>
                    ${
                      canEdit
                        ? `
                        <button class="btn-text" onclick="window.editProduct('${d.id}')"><i class="fas fa-pen-to-square"></i></button>
                        <button class="btn-text" style="color:var(--danger); margin-left:10px;" onclick="window.deleteProduct('${d.id}')"><i class="fas fa-trash-can"></i></button>
                    `
                        : '<span style="font-size:0.7rem; color:var(--text-secondary);">Read-only</span>'
                    }
                </td>
            `;
      listTable.appendChild(tr);
    });
  } catch (e) {
    console.error(e);
  }
}

// Global functions for inline calls
window.deleteProduct = async (id) => {
  if (!confirm("Hapus produk ini?")) return;
  await deleteDoc(doc(db, "products", id));
  loadInventory();
};

window.editProduct = async (id) => {
  const d = await getDoc(doc(db, "products", id));
  if (d.exists()) {
    const p = d.data();
    document.getElementById("product-id").value = id;
    document.getElementById("product-name").value = p.name;
    document.getElementById("product-category").value = p.category;
    document.getElementById("product-price").value = p.price;
    document.getElementById("product-image").value = p.imageUrl || "";
    document.getElementById("product-modal-title").textContent = "Edit Produk";
    document.getElementById("modal-product").classList.remove("hidden");
  }
};

// Form handling
document.getElementById("btn-add-product")?.addEventListener("click", () => {
  document.getElementById("product-form").reset();
  document.getElementById("product-id").value = "";
  document.getElementById("product-modal-title").textContent = "Tambah Produk";
  document.getElementById("modal-product").classList.remove("hidden");
});

document
  .getElementById("product-form")
  ?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = document.getElementById("product-id").value;
    const data = {
      name: document.getElementById("product-name").value,
      category: document.getElementById("product-category").value,
      price: parseInt(document.getElementById("product-price").value),
      imageUrl: document.getElementById("product-image").value,
      active: true,
    };

    if (id) {
      await setDoc(doc(db, "products", id), data, { merge: true });
    } else {
      await addDoc(collection(db, "products"), data);
    }
    document.getElementById("modal-product").classList.add("hidden");
    loadInventory();
  });

// Nav switch
document.addEventListener("click", (e) => {
  if (e.target.closest(".nav-item")?.dataset.view === "inventory")
    loadInventory();
});
