import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";
import { db, auth } from "./firebase-config.js";
import { formatIDR } from "./ui.js";

let cart = [];
let products = [];
let selectedCategory = "semua";

// Initialize POS view
export async function initPOS() {
  await fetchProducts();
  renderProducts();
  updateCartUI();
}

// Fetch products from Firestore
async function fetchProducts() {
  const q = query(collection(db, "products"), where("active", "==", true));
  const querySnapshot = await getDocs(q);
  products = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

// Render product list based on category
function renderProducts() {
  const container = document.getElementById("pos-product-list");
  if (!container) return;

  container.innerHTML = "";
  const filtered =
    selectedCategory === "semua"
      ? products
      : products.filter((p) => p.category === selectedCategory);

  filtered.forEach((product) => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <div class="product-img">
        <img src="${product.imageUrl || "img/placeholder.png"}" alt="${product.name}">
      </div>
      <div class="product-info">
        <h4>${product.name}</h4>
        <p class="product-price">${formatIDR(product.price)}</p>
      </div>
    `;
    card.addEventListener("click", () => addToCart(product));
    container.appendChild(card);
  });
}

// Cart mechanisms
function addToCart(product) {
  const existing = cart.find((item) => item.id === product.id);
  if (existing) {
    existing.quantity++;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  updateCartUI();
}

function removeFromCart(productId) {
  cart = cart.filter((item) => item.id !== productId);
  updateCartUI();
}

function updateQuantity(productId, delta) {
  const item = cart.find((i) => i.id === productId);
  if (item) {
    item.quantity += delta;
    if (item.quantity <= 0) {
      removeFromCart(productId);
    } else {
      updateCartUI();
    }
  }
}

// Update Cart UI
function updateCartUI() {
  const list = document.getElementById("cart-items-list");
  if (!list) return;

  list.innerHTML = "";
  let subtotal = 0;

  cart.forEach((item) => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;

    const div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
      <div class="cart-item-details">
        <h5>${item.name}</h5>
        <span>${formatIDR(item.price)} x ${item.quantity}</span>
      </div>
      <div class="cart-item-actions">
        <button class="btn-qty" data-id="${item.id}" data-action="decrease"><i class="fas fa-minus"></i></button>
        <span class="qty-count">${item.quantity}</span>
        <button class="btn-qty" data-id="${item.id}" data-action="increase"><i class="fas fa-plus"></i></button>
      </div>
    `;
    list.appendChild(div);
  });

  // Attach qty button events
  list.querySelectorAll(".btn-qty").forEach((btn) => {
    btn.onclick = () => {
      const id = btn.dataset.id;
      const action = btn.dataset.action;
      updateQuantity(id, action === "increase" ? 1 : -1);
    };
  });

  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  document.getElementById("cart-item-count").textContent =
    `${cart.length} items`;
  document.getElementById("cart-subtotal").textContent = formatIDR(subtotal);
  document.getElementById("cart-tax").textContent = formatIDR(tax);
  document.getElementById("cart-total").textContent = formatIDR(total);
}

// Checkout Process
export async function processCheckout() {
  if (cart.length === 0) return alert("Pilih produk terlebih dahulu!");

  const btn = document.getElementById("btn-checkout");
  btn.disabled = true;
  btn.textContent = "Memproses...";

  try {
    const tableNumber =
      document.getElementById("pos-table-number").value || "1";

    // Calculate totals
    const subtotal = cart.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0,
    );
    const tax = subtotal * 0.1;
    const finalTotal = subtotal + tax;

    const transaction = {
      items: cart.map((i) => ({
        id: i.id,
        name: i.name,
        quantity: i.quantity,
        price: i.price,
      })),
      subtotal: subtotal,
      tax: tax,
      totalAmount: finalTotal,
      createdAt: serverTimestamp(),
      createdBy: auth.currentUser?.uid,
      tableNumber: parseInt(tableNumber),
      status: "paid",
    };

    const docRef = await addDoc(collection(db, "transactions"), transaction);

    // Trigger Print Receipt
    printReceipt(transaction, docRef.id);

    alert("Transaksi berhasil! Struk sedang dicetak.");
    cart = [];
    updateCartUI();
  } catch (error) {
    console.error("Kesalahan checkout:", error);
    alert("Gagal memproses transaksi.");
  } finally {
    btn.disabled = false;
    btn.textContent = "Proses Bayar";
  }
}

function printReceipt(t, id) {
  const printWindow = window.open("", "_blank");
  const itemsHtml = t.items
    .map(
      (i) => `
        <tr>
            <td>${i.name} x${i.quantity}</td>
            <td style="text-align:right">${formatIDR(i.price * i.quantity)}</td>
        </tr>
    `,
    )
    .join("");

  printWindow.document.write(`
        <html>
        <head>
            <title>Struk Pembayaran - ${id}</title>
            <style>
                body { font-family: 'Courier New', monospace; width: 80mm; padding: 10px; font-size: 12px; }
                .header { text-align: center; margin-bottom: 20px; }
                table { width: 100%; border-top: 1px dashed #000; border-bottom: 1px dashed #000; margin: 10px 0; }
                .total { text-align: right; font-weight: bold; font-size: 14px; }
                .footer { text-align: center; margin-top: 20px; font-size: 10px; }
            </style>
        </head>
        <body>
            <div class="header">
                <h3>E-CAFE SUMBA</h3>
                <p>Jl. Niaga No. 10, Sumba</p>
                <p>ID: ${id.substring(0, 8)}</p>
                <p>${new Date().toLocaleString("id-ID")}</p>
            </div>
            <table>${itemsHtml}</table>
            <div class="total">
                <p>Subtotal: ${formatIDR(t.subtotal)}</p>
                <p>Pajak (10%): ${formatIDR(t.tax)}</p>
                <hr>
                <p>TOTAL: ${formatIDR(t.totalAmount)}</p>
            </div>
            <div class="footer">
                <p>Terima Kasih Atas Kunjungan Anda</p>
                <p>Build with Love by Masandigital.com</p>
            </div>
            <script>window.onload = function() { window.print(); window.close(); }</script>
        </body>
        </html>
    `);
  printWindow.document.close();
}

export function cancelOrder() {
  if (cart.length > 0 && confirm("Batalkan seluruh pesanan?")) {
    cart = [];
    updateCartUI();
  }
}

// Listen for checkout button
document.addEventListener("click", (e) => {
  if (e.target && e.target.id === "btn-checkout") {
    processCheckout();
  }
});

// Category filtering click
document.addEventListener("click", (e) => {
  if (e.target && e.target.classList.contains("cat-pill")) {
    document
      .querySelectorAll(".cat-pill")
      .forEach((p) => p.classList.remove("active"));
    e.target.classList.add("active");
    selectedCategory = e.target.textContent.toLowerCase();
    renderProducts();
  }
});

// Initial load for POS if view is changed
document.addEventListener("click", (e) => {
  const navItem = e.target.closest(".nav-item");
  if (navItem && navItem.dataset.view === "pos") {
    initPOS();
  }
});
