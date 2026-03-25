// Switch between different views (Dashboard, POS, Tables, etc.)
export function switchView(viewId) {
  const views = document.querySelectorAll(".content-view");
  const navItems = document.querySelectorAll(".nav-item:not(.divider)");

  views.forEach((view) => {
    if (view.id === `view-${viewId}`) {
      view.classList.remove("hidden");
    } else {
      view.classList.add("hidden");
    }
  });

  navItems.forEach((item) => {
    if (item.getAttribute("data-view") === viewId) {
      item.classList.add("active");
      const title = item.querySelector("span").textContent;
      document.getElementById("current-view-title").textContent = title;
    } else {
      item.classList.remove("active");
    }
  });
}

// Format currency to IDR
export function formatIDR(amount) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

// Update local date display
export function updateDateDisplay() {
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  const dateStr = new Date().toLocaleDateString("id-ID", options);
  document.getElementById("current-date").textContent = dateStr;
}
