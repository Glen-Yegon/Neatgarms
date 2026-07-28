// Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

const signUpButton = document.getElementById("signUpButton");
const signInButton = document.getElementById("signInButton");
const signInForm = document.getElementById("signIn");
const signUpForm = document.getElementById("signup");

signUpButton.addEventListener("click", () => {
  signInForm.style.display = "none";
  signUpForm.style.display = "block";
});

signInButton.addEventListener("click", () => {
  signInForm.style.display = "block";
  signUpForm.style.display = "none";
});

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyCLC4Dz-qxNOPtRFhybiBA5SqCDJgvKqMY",
  authDomain: "neat-53fa9.firebaseapp.com",
  projectId: "neat-53fa9",
  storageBucket: "neat-53fa9.firebasestorage.app",
  messagingSenderId: "857317417173",
  appId: "1:857317417173:web:6b84a45c96ebe56fce425c",
  measurementId: "G-5MQNYZF3E2",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore(app);

// Function to Show Messages
function showMessage(message, divId) {
  const messageDiv = document.getElementById(divId);
  messageDiv.style.display = "block";
  messageDiv.innerHTML = message;
  messageDiv.style.opacity = 1;

  setTimeout(() => {
    messageDiv.style.opacity = 0;
  }, 5000);
}

// ==========================
// SIGN UP
// ==========================

const signUp = document.getElementById("submitSignUp");

signUp.addEventListener("click", async (event) => {
  event.preventDefault();

  const email = document.getElementById("rEmail").value;
  const password = document.getElementById("rPassword").value;
  const firstName = document.getElementById("fName").value;
  const lastName = document.getElementById("lName").value;

  try {

    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user = userCredential.user;

    // Save user profile
    await setDoc(doc(db, "users", user.uid), {
      userId: user.uid,
      email,
      firstName,
      lastName,
      createdAt: new Date()
    });

// Create points document — 100pt welcome bonus
    await setDoc(doc(db, "points", user.uid), {
      userId: user.uid,
      balance: 100,
      lifetimePoints: 100,
      tier: "Bronze",
      birthday: null,
      birthdayRewardClaimed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastPointsEarnedAt: new Date(),
      lastRedemptionAt: null
    });

    console.log("User created successfully.");

    showMessage("Account Created Successfully", "signUpMessage");

    localStorage.setItem("loggedInUserId", user.uid);

    window.location.href = "dashboard.html";

  } catch (error) {

    console.error(error);

    switch (error.code) {

      case "auth/email-already-in-use":
        showMessage("Email Address Already Exists!", "signUpMessage");
        break;

      case "auth/invalid-email":
        showMessage("Invalid Email Address.", "signUpMessage");
        break;

      case "auth/weak-password":
        showMessage("Password should be at least 6 characters.", "signUpMessage");
        break;

      default:
        showMessage("Unable to create account.", "signUpMessage");
    }
  }
});

// ==========================
// SIGN IN
// ==========================

const signIn = document.getElementById("submitSignIn");

signIn.addEventListener("click", async (event) => {

  event.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {

    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user = userCredential.user;

    localStorage.setItem("loggedInUserId", user.uid);

    // Ensure points document exists
    const pointsRef = doc(db, "points", user.uid);
    const pointsSnap = await getDoc(pointsRef);

if (!pointsSnap.exists()) {

      await setDoc(pointsRef, {
        userId: user.uid,
        balance: 100,
        lifetimePoints: 100,
        tier: "Bronze",
        birthday: null,
        birthdayRewardClaimed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastPointsEarnedAt: new Date(),
        lastRedemptionAt: null
      });

      console.log("Created missing points document — 100pt welcome bonus backfilled.");
    }

    showMessage("Login Successful", "signInMessage");

    window.location.href = "dashboard.html";

  } catch (error) {

    switch (error.code) {

      case "auth/invalid-credential":
        showMessage("Incorrect Email or Password.", "signInMessage");
        break;

      case "auth/user-disabled":
        showMessage("This account has been disabled.", "signInMessage");
        break;

      default:
        showMessage("Account does not exist.", "signInMessage");
    }
  }

});

// ==========================
// PASSWORD RESET
// ==========================

document.querySelector(".recover a").addEventListener("click", async (e) => {

  e.preventDefault();

  const email = prompt("Enter your email:");

  if (!email) {
    alert("Email is required.");
    return;
  }

  try {

    await sendPasswordResetEmail(auth, email);

    alert("Password reset email sent.");

  } catch (error) {

    switch (error.code) {

      case "auth/user-not-found":
        alert("No account found.");
        break;

      case "auth/invalid-email":
        alert("Invalid email.");
        break;

      default:
        alert("Something went wrong.");
    }
  }

});

// ==========================
// LOGOUT
// ==========================

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {

  logoutBtn.addEventListener("click", async () => {

    try {

      await signOut(auth);

      localStorage.removeItem("loggedInUserId");

      showMessage(
        "You have been logged out successfully.",
        "logoutMessage"
      );

    } catch (error) {

      console.error(error);

      showMessage(
        "Error logging out.",
        "logoutMessage"
      );
    }

  });

}

// Tab active-state indicator (visual only)
function setActiveTab(activeId) {
  document.getElementById("signInButton").setAttribute("aria-selected", activeId === "signInButton");
  document.getElementById("signUpButton").setAttribute("aria-selected", activeId === "signUpButton");
}
setActiveTab("signInButton"); // default: sign in visible on load
signUpButton.addEventListener("click", () => setActiveTab("signUpButton"));
signInButton.addEventListener("click", () => setActiveTab("signInButton"));