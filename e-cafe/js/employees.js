import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  deleteDoc,
  updateDoc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";
import { db } from "./firebase-config.js";
import { registerNewUser } from "./auth.js";

// Load Employees Table
export async function loadEmployees() {
  const listTable = document.getElementById("employees-list-table");
  if (!listTable) return;
  listTable.innerHTML =
    "<tr><td colspan='5' style='text-align:center;'>Memuat data karyawan...</td></tr>";

  try {
    const q = query(collection(db, "users"), orderBy("displayName"));
    const snaps = await getDocs(q);
    listTable.innerHTML = "";
    snaps.forEach((d) => {
      const user = d.data();
      const tr = document.createElement("tr");
      tr.innerHTML = `
                <td><div class="user-avatar" style="width:30px; height:30px; font-size:0.7rem;">${user.displayName?.charAt(0) || "U"}</div></td>
                <td><strong>${user.displayName}</strong></td>
                <td>${user.email}</td>
                <td><span class="badge" style="background:rgba(99,102,241,0.1); color:var(--primary-color); padding:2px 8px; border-radius:4px; text-transform:capitalize;">${user.role}</span></td>
                <td>
                    <button class="btn-text" onclick="window.editEmployee('${d.id}')"><i class="fas fa-user-pen"></i></button>
                    <button class="btn-text" style="color:var(--danger); margin-left:10px;" onclick="window.deleteEmployee('${d.id}')"><i class="fas fa-user-minus"></i></button>
                </td>
            `;
      listTable.appendChild(tr);
    });
  } catch (e) {
    console.error(e);
  }
}

// Inline functions
window.deleteEmployee = async (id) => {
  if (!confirm("Hapus akses karyawan ini?")) return;
  await deleteDoc(doc(db, "users", id));
  loadEmployees();
};

window.editEmployee = async (id) => {
  const d = await getDoc(doc(db, "users", id));
  if (d.exists()) {
    const u = d.data();
    document.getElementById("employee-id").value = id;
    document.getElementById("emp-name").value = u.displayName;
    document.getElementById("emp-email").value = u.email;
    document.getElementById("emp-role").value = u.role;
    document.getElementById("emp-pass-group").classList.add("hidden");
    document.getElementById("emp-email-group").style.opacity = "0.6";
    document.getElementById("emp-email").readOnly = true;
    document.getElementById("employee-modal-title").textContent =
      "Edit Karyawan";
    document.getElementById("modal-employee").classList.remove("hidden");
  }
};

// Handle Open Registration Modal
document.addEventListener("click", (e) => {
  const btnAdd = e.target.closest(".btn-primary");
  // Look for button in Employees view
  if (btnAdd && btnAdd.innerText.includes("Pendaftaran")) {
    e.preventDefault();
    document.getElementById("employee-form").reset();
    document.getElementById("employee-id").value = "";
    document.getElementById("employee-modal-title").textContent =
      "Daftar Karyawan Baru";
    document.getElementById("modal-employee").classList.remove("hidden");
    document.getElementById("emp-pass-group").classList.remove("hidden");
    document.getElementById("emp-email-group").style.opacity = "1";
    document.getElementById("emp-email").readOnly = false;
  }
});

document
  .getElementById("employee-form")
  ?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = document.getElementById("employee-id").value;
    const name = document.getElementById("emp-name").value;
    const role = document.getElementById("emp-role").value;
    const email = document.getElementById("emp-email").value;
    const pass = document.getElementById("emp-password").value;

    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = "Processing...";

    try {
      if (id) {
        await updateDoc(doc(db, "users", id), {
          role: role,
          displayName: name,
        });
        alert("Data karyawan berhasil diperbarui!");
      } else {
        const result = await registerNewUser(email, pass, name, role);
        if (result.success) {
          alert("Karyawan Baru Berhasil Didaftarkan!");
        } else {
          alert("Gagal Daftar: " + result.error);
          return;
        }
      }
      document.getElementById("modal-employee").classList.add("hidden");
      loadEmployees();
    } catch (err) {
      alert(err.message);
    } finally {
      btn.disabled = false;
      btn.textContent = "Simpan Karyawan";
    }
  });

document.addEventListener("click", (e) => {
  if (e.target.closest(".nav-item")?.dataset.view === "employees")
    loadEmployees();
});
