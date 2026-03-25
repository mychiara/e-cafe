// Firebase Configuration - Replace with your own Firebase Project details
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCLRv2tVcsuHgRMFFkZ5A3v3U4luN1Hqo8",
  authDomain: "sipandaiv2.firebaseapp.com",
  projectId: "sipandaiv2",
  storageBucket: "sipandaiv2.firebasestorage.app",
  messagingSenderId: "867432621811",
  appId: "1:867432621811:web:b2fe1f8bc1a7e08c7bb986",
  measurementId: "G-T4KHLT6Q8G",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db, firebaseConfig };
