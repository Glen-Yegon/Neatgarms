
import { initializeApp }     from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getFirestore,
         collection,
         addDoc,
         serverTimestamp }   from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

/* ---------- 1.  Firebase config ---------- */
const firebaseConfig = {
  apiKey:            "AIzaSyCLC4Dz-qxNOPtRFhybiBA5SqCDJgvKqMY",
  authDomain:        "neat-53fa9.firebaseapp.com",
  projectId:         "neat-53fa9",
  storageBucket:     "neat-53fa9.appspot.com",
  messagingSenderId: "857317417173",
  appId:             "1:857317417173:web:6b84a45c96ebe56fce425c"
};

/* ---------- 2.  Init Firebase ----------- */
const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);

/* ---------- 3.  DOM references ---------- */
const form       = document.querySelector("#subscribeForm");
const emailInput = document.querySelector("#email");
const alertBox   = document.querySelector("#customAlert"); // “Please wait …” div

/* ---------- 4.  Helper: toggle mini alert ---------- */
function showAlert(msg, ms = 2500) {
  if (!alertBox) return;
  alertBox.textContent = msg;
  alertBox.classList.add("show");          // .show { opacity:1; pointer-events:auto; }
  setTimeout(() => alertBox.classList.remove("show"), ms);
}

/* ---------- 5.  Firestore write ---------- */
async function saveEmailToFirestore(email) {
  // Add to “emails” collection with timestamp
  await addDoc(collection(db, "email"), {
    email,
    timestamp: serverTimestamp()
  });
}

/* ---------- 6.  Hook into the existing form ---------- */
form.addEventListener("submit", async (e) => {
  // IMPORTANT: let your existing listener (if any) keep doing its thing.
  // We just tap into the same event and run *after* preventDefault().
  // If your other code calls preventDefault() first, that’s fine; if not,
  // we’ll do it here to be safe:
  e.preventDefault();

  const email = emailInput.value.trim();
  if (!email) {
    alert("Please enter a valid email address.");
    return;
  }

  try {
    showAlert("Please wait, saving your details...");
    await saveEmailToFirestore(email);
    showAlert("✨ Email saved – welcome to the Neat Family!", 3500);
    // Let your other code show the thank‑you message, animate, etc.
  } catch (err) {
    console.error("Firestore error →", err);
    alert("Sorry — couldn’t save your email. Please try again.");
  }
});
