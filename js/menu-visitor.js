import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";
import { db } from "./firebase-config.js";
import { formatIDR } from "./ui.js";
import { getActivePromos } from "./promos.js";

let allProducts = [];
let currentCategory = "semua";

// Initialize Visitor Menu
export async function initVisitorMenu() {
  const list = document.getElementById("visitor-product-list");
  if (!list) return;

  try {
    const q = query(
      collection(db, "products"),
      where("active", "==", true),
      orderBy("name"),
    );
    const querySnapshot = await getDocs(q);

    allProducts = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    renderMenu();
    renderPromos();
  } catch (error) {
    console.error("Gagal memuat menu:", error);
    list.innerHTML = `<div class="error-msg" style="text-align:center; padding: 50px; color: var(--danger);">Gagal memuat katalog menu. Cek koneksi Anda.</div>`;
  }
}

async function renderPromos() {
  const container = document.getElementById("visitor-promo-list");
  if (!container) return;

  try {
    const promos = await getActivePromos();
    container.innerHTML = "";
    promos.forEach((p) => {
      const div = document.createElement("div");
      div.className = "promo-card-mini";
      div.innerHTML = `
                <h4><i class="fas fa-tag"></i> ${p.title}</h4>
                <p>${p.description}</p>
            `;
      container.appendChild(div);
    });
  } catch (e) {
    console.error("Gagal memuat promo:", e);
  }
}

function renderMenu() {
  const list = document.getElementById("visitor-product-list");
  if (!list) return;

  const filtered =
    currentCategory === "semua"
      ? allProducts
      : allProducts.filter((p) => p.category === currentCategory);

  if (filtered.length === 0) {
    list.innerHTML = `<div style="text-align:center; padding: 50px; color: var(--text-secondary); width: 100%;">Belum ada menu di kategori ini.</div>`;
    return;
  }

  list.innerHTML = "";
  filtered.forEach((p) => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.style.animation = "fadeIn 0.5s ease-out";

    card.innerHTML = `
            <div class="product-img" style="aspect-ratio: 1; border-radius: 12px; overflow: hidden; background: var(--glass);">
                <img src="${p.imageUrl || "img/placeholder.png"}" alt="${p.name}" style="width:100%; height:100%; object-fit:cover;">
            </div>
            <div class="product-info" style="margin-top: 15px;">
                <h3 style="font-size: 1.1rem; margin-bottom: 5px;">${p.name}</h3>
                <p style="color: var(--text-secondary); font-size: 0.85rem; margin-bottom: 10px; min-height: 40px;">${p.description || "Pilihan terbaik untuk hari Anda yang spesial."}</p>
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="font-size:1.1rem; font-weight:700; color: var(--primary-color);">${formatIDR(p.price)}</span>
                    <i class="fas fa-heart" style="color: var(--danger); opacity: 0.5; cursor:pointer;"></i>
                </div>
            </div>
        `;
    list.appendChild(card);
  });
}

// Category Filtering
document.addEventListener("click", (e) => {
  if (
    e.target &&
    e.target.classList.contains("cat-pill") &&
    e.target.closest("#menu-category-filter")
  ) {
    document
      .querySelectorAll("#menu-category-filter .cat-pill")
      .forEach((p) => p.classList.remove("active"));
    e.target.classList.add("active");
    currentCategory = e.target.textContent.toLowerCase();
    renderMenu();
  }
});

// Initial load
window.addEventListener("load", initVisitorMenu);
