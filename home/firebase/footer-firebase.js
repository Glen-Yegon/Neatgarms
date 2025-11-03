 import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
  import {
    getFirestore,
    doc, getDoc,
    setDoc, serverTimestamp
  } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

  /* ---------- Firebase Config ---------- */
  const firebaseConfig = {
    apiKey: "AIzaSyCLC4Dz-qxNOPtRFhybiBA5SqCDJgvKqMY",
    authDomain: "neat-53fa9.firebaseapp.com",
    projectId: "neat-53fa9",
    storageBucket: "neat-53fa9.appspot.com",
    messagingSenderId: "857317417173",
    appId: "1:857317417173:web:6b84a45c96ebe56fce425c"
  };

  /* ---------- Initialize Firebase ---------- */
  const app = initializeApp(firebaseConfig);
  const db  = getFirestore(app);

  /* ---------- DOM Elements ---------- */
  const emailInput = document.querySelector("#footer-email");
  const subscribeBtn = document.querySelector("#subscribe-btn");
  const alertBox = document.querySelector("#customAlert");

  /* ---------- Helper: Alert Message ---------- */
  function showAlert(msg, ms = 2500) {
    if (!alertBox) return;
    alertBox.textContent = msg;
    alertBox.classList.add("show");
    setTimeout(() => alertBox.classList.remove("show"), ms);
  }

  /* ---------- Firestore Logic ---------- */
  async function saveEmailIfNew(email) {
    const docRef = doc(db, "email", email); // Use email as document ID
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { already: true }; // email already exists
    }

    await setDoc(docRef, { email, timestamp: serverTimestamp() });
    return { already: false }; // new email added
  }

  /* ---------- Click Event ---------- */
  subscribeBtn.addEventListener("click", async () => {
    const email = emailInput.value.trim().toLowerCase();
    if (!email || !email.includes("@")) {
      showAlert("Please enter a valid email address.");
      return;
    }

    try {
      showAlert("Please wait, saving your details…");
      const { already } = await saveEmailIfNew(email);

      if (already) {
        showAlert("Confirmed: You're Part of the Vision.", 3500);
      } else {
        showAlert("NEAT VIP UNLOCKED", 3500);
        emailInput.value = ""; // clear input
      }
    } catch (err) {
      console.error("Firestore error →", err);
      showAlert("Sorry — couldn’t save your email. Please try again.");
    }
  });