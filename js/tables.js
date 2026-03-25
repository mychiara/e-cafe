// Mock data for tables status, can be expanded to fetch from Firestore later
const totalTables = 20;

export function loadTables() {
  const grid = document.getElementById("tables-status-grid");
  if (!grid) return;

  grid.innerHTML = "";

  // Generate 20 sample tables
  for (let i = 1; i <= totalTables; i++) {
    const isOccupied = i % 3 === 0 || i === 7;
    const box = document.createElement("div");
    box.className = `table-box ${isOccupied ? "occupied" : ""}`;
    box.innerHTML = `
            <i class="fas fa-chair" style="font-size: 2rem; margin-bottom: 10px; color: ${isOccupied ? "var(--danger)" : "var(--success)"}"></i>
            <h4>${i}</h4>
            <p>${isOccupied ? "Terisi" : "Tersedia"}</p>
        `;
    box.addEventListener("click", () => {
      if (!isOccupied) {
        // Quick switch to POS with this table number
        const posNav = document.querySelector('.nav-item[data-view="pos"]');
        posNav.click();
        setTimeout(() => {
          const tableInput = document.getElementById("pos-table-number");
          if (tableInput) tableInput.value = i;
        }, 100);
      }
    });
    grid.appendChild(box);
  }
}

// Nav handling
document.addEventListener("click", (e) => {
  const navItem = e.target.closest(".nav-item");
  if (navItem && navItem.dataset.view === "tables") {
    loadTables();
  }
});
