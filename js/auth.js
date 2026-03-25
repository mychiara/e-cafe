import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  createUserWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import {
  doc,
  getDoc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { auth, db, firebaseConfig } from "./firebase-config.js";

// Secondary App for registering others without Logging out current user
const secondaryApp = initializeApp(firebaseConfig, "Secondary");
const secondaryAuth = getAuth(secondaryApp);

// Register New User (Admin Only Action)
export async function registerNewUser(email, password, displayName, role) {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      secondaryAuth,
      email,
      password,
    );
    const newUser = userCredential.user;

    // Create Profile in Firestore
    await setDoc(doc(db, "users", newUser.uid), {
      uid: newUser.uid,
      displayName: displayName,
      email: email,
      role: role,
      createdAt: new Date(),
    });

    // Sign out secondary auth so it doesn't persist
    await signOut(secondaryAuth);
    return { success: true };
  } catch (error) {
    return { success: false, error: translateError(error.code) };
  }
}

// Login function
export async function login(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );
    const user = userCredential.user;

    // Get user role from Firestore
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists()) {
      return { success: true, user: { ...user, ...userDoc.data() } };
    } else {
      throw new Error("Data karyawan tidak ditemukan!");
    }
  } catch (error) {
    return { success: false, error: translateError(error.code) };
  }
}

// Reset Password function
export async function resetPassword(email) {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    return { success: false, error: translateError(error.code) };
  }
}

// Logout function
export async function logout() {
  try {
    await signOut(auth);
    window.location.href = "index.html";
  } catch (error) {
    console.error("Kesalahan keluar:", error);
  }
}

// Translate Firebase Error messages
function translateError(code) {
  switch (code) {
    case "auth/invalid-email":
      return "Format email tidak valid.";
    case "auth/user-not-found":
      return "Pengguna tidak ditemukan.";
    case "auth/wrong-password":
      return "Kata sandi salah.";
    case "auth/invalid-credential":
      return "Email atau kata sandi salah.";
    default:
      return "Gagal masuk. Silakan coba lagi.";
  }
}

// Check Auth State on Page Load
export function initAuth() {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        updateUserProfileUI(userData);
        filterSidebarByRole(userData.role);
      }
    } else {
      if (
        !window.location.pathname.includes("index.html") &&
        window.location.pathname !== "/"
      ) {
        window.location.href = "index.html";
      }
    }
  });
}

function updateUserProfileUI(userData) {
  const nameEl = document.getElementById("user-display-name");
  const roleEl = document.getElementById("user-display-role");
  const avatarEl = document.getElementById("user-avatar-initial");

  if (nameEl) nameEl.textContent = userData.displayName || "User";
  if (roleEl) roleEl.textContent = userData.role || "Staff";
  if (avatarEl)
    avatarEl.textContent = userData.displayName
      ? userData.displayName.charAt(0)
      : "U";
}

function filterSidebarByRole(role) {
  const navItems = document.querySelectorAll(".nav-item[data-role]");
  navItems.forEach((item) => {
    const allowedRoles = item.getAttribute("data-role").split(",");
    if (!allowedRoles.includes(role)) {
      item.classList.add("hidden");
    } else {
      item.classList.remove("hidden");
    }
  });
}
