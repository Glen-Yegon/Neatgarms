// Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import { getFirestore, doc, getDoc, updateDoc, setDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";


const signUpButton = document.getElementById("signUpButton");
const signInButton = document.getElementById("signInButton");
const signInForm = document.getElementById("signIn");
const signUpForm = document.getElementById("signup");

signUpButton.addEventListener("click", function () {
  signInForm.style.display = "none";
  signUpForm.style.display = "block";
});

signInButton.addEventListener("click", function () {
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
  var messageDiv = document.getElementById(divId);
  messageDiv.style.display = "block";
  messageDiv.innerHTML = message;
  messageDiv.style.opacity = 1;
  setTimeout(function () {
    messageDiv.style.opacity = 0;
  }, 5000);
}

// Sign Up Event
const signUp = document.getElementById("submitSignUp");
signUp.addEventListener("click", async (event) => {
  event.preventDefault();
  const email = document.getElementById("rEmail").value;
  const password = document.getElementById("rPassword").value;
  const firstName = document.getElementById("fName").value;
  const lastName = document.getElementById("lName").value;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // User Data
    const userData = {
      email: email,
      firstName: firstName,
      lastName: lastName,
      userId: user.uid, // Store userId
    };

    // Store in "users" collection
    await setDoc(doc(db, "users", user.uid), userData);
    console.log("User saved in 'users' collection");

    // Create an empty document in "designs" collection with the user ID
    await setDoc(doc(db, "designs", user.uid), {
      userId: user.uid,
      designs: [], // Empty array for future designs
      createdAt: new Date(),
    });
    console.log("Empty document created in 'designs' collection");

    showMessage("Account Created Successfully", "signUpMessage");

    // Redirect to home page
    window.location.href = "home.html";

    
  } catch (error) {
    console.error("Error:", error);
    const errorCode = error.code;
    if (errorCode === "auth/email-already-in-use") {
      showMessage("Email Address Already Exists !!!", "signUpMessage");
    } else {
      showMessage("Unable to create user", "signUpMessage");
    }
  }
});


// Sign In Event
const signIn = document.getElementById("submitSignIn");
signIn.addEventListener("click", async (event) => {
  event.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    showMessage("Login is successful", "signInMessage");

    // Store the user ID in local storage
    localStorage.setItem("loggedInUserId", user.uid);

    // Redirect to home page
    window.location.href = "home.html";
  } catch (error) {
    const errorCode = error.code;
    if (errorCode === "auth/invalid-credential") {
      showMessage("Incorrect Email or Password", "signInMessage");
    } else {
      showMessage("Account does not exist", "signInMessage");
    }
  }
});
