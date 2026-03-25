import { login, resetPassword } from "./auth.js";

document.addEventListener("DOMContentLoaded", () => {
  console.log("App initialized");

  // Sticky Header Logic
  const mainNav = document.getElementById("main-nav");
  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      mainNav.classList.add("scrolled");
    } else {
      mainNav.classList.remove("scrolled");
    }
  });

  const loginForm = document.getElementById("login-form");
  const errorEl = document.getElementById("error-message");

  // Login logic
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      console.log("Login submitted");

      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
      const btn = document.getElementById("btn-login");

      btn.disabled = true;
      btn.textContent = "Sedang Masuk...";
      errorEl.classList.add("hidden");

      try {
        const result = await login(email, password);
        if (result.success) {
          window.location.href = "dashboard.html";
        } else {
          errorEl.textContent = result.error;
          errorEl.classList.remove("hidden");
        }
      } catch (err) {
        errorEl.textContent = "Kesalahan teknis. Coba lagi.";
        errorEl.classList.remove("hidden");
      } finally {
        btn.disabled = false;
        btn.textContent = "Masuk";
      }
    });
  }

  // Modal Control: Show Login
  const btnShowLogin = document.getElementById("btn-show-login");
  const modalLogin = document.getElementById("modal-login");
  const btnCloseLogin = document.getElementById("btn-close-login");

  if (btnShowLogin) {
    btnShowLogin.addEventListener("click", () => {
      console.log("Opening login modal");
      modalLogin.classList.remove("hidden");
    });
  }
  if (btnCloseLogin) {
    btnCloseLogin.addEventListener("click", () => {
      console.log("Closing login modal");
      modalLogin.classList.add("hidden");
      errorEl.classList.add("hidden");
    });
  }

  // Reset Password UI Logic
  const linkForgot = document.getElementById("link-forgot-password");
  const modalReset = document.getElementById("modal-reset");
  const btnCloseReset = document.getElementById("btn-close-reset");
  const btnSendReset = document.getElementById("btn-send-reset");
  const resetStatus = document.getElementById("reset-status");

  if (linkForgot) {
    linkForgot.addEventListener("click", (e) => {
      e.preventDefault();
      console.log("Opening reset modal");
      modalReset.classList.remove("hidden");
    });
  }

  if (btnCloseReset) {
    btnCloseReset.addEventListener("click", () => {
      modalReset.classList.add("hidden");
      resetStatus.textContent = "";
    });
  }

  if (btnSendReset) {
    btnSendReset.addEventListener("click", async () => {
      const email = document.getElementById("reset-email").value;
      if (!email) return alert("Masukkan email!");

      btnSendReset.disabled = true;
      btnSendReset.textContent = "Mengirim...";

      try {
        const res = await resetPassword(email);
        if (res.success) {
          resetStatus.innerHTML =
            "<span style='color: #10b981'>Tautan reset berhasil dikirim! Silakan periksa email Anda.</span>";
        } else {
          resetStatus.innerHTML =
            "<span style='color: #ef4444'>" + res.error + "</span>";
        }
      } catch (err) {
        resetStatus.innerHTML =
          "<span style='color: #ef4444'>Gagal mengirim email reset.</span>";
      } finally {
        btnSendReset.disabled = false;
        btnSendReset.textContent = "Kirim Tautan";
      }
    });
  }
});
