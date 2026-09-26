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


/* =========================================================
   NEATGARMS / SHOOTING STAR CURSOR
   ========================================================= */

/*
  Only enable custom cursor on devices
  with a real mouse / fine pointer.
*/

const finePointer =
  window.matchMedia(
    "(hover: hover) and (pointer: fine)"
  ).matches;


const neatCursor =
  document.getElementById(
    "neatCursor"
  );


if (
  neatCursor &&
  finePointer
) {

  /* -------------------------------------------------------
     POSITION
     ------------------------------------------------------- */

  let cursorX =
    window.innerWidth * 0.5;

  let cursorY =
    window.innerHeight * 0.5;


  let targetCursorX =
    cursorX;

  let targetCursorY =
    cursorY;


  /* -------------------------------------------------------
     SCALE
     ------------------------------------------------------- */

  let cursorScale = 1;

  let targetCursorScale = 1;


  /* -------------------------------------------------------
     DIRECTION / ROTATION
     ------------------------------------------------------- */

  let cursorRotation = 0;

  let targetCursorRotation = 0;


  /* -------------------------------------------------------
     SPEED / TAIL
     ------------------------------------------------------- */

  let tailScale = 0.65;

  let targetTailScale = 0.65;


  let lastPointerX = cursorX;
  let lastPointerY = cursorY;


  let cursorVisible = false;


  /* -------------------------------------------------------
     POINTER MOVEMENT
     ------------------------------------------------------- */

  window.addEventListener(
    "pointermove",
    event => {

      const newX =
        event.clientX;

      const newY =
        event.clientY;


      /*
        Calculate direction of travel.
      */

      const deltaX =
        newX - lastPointerX;

      const deltaY =
        newY - lastPointerY;


      /*
        Calculate mouse speed.
      */

      const speed =
        Math.sqrt(
          deltaX * deltaX +
          deltaY * deltaY
        );


      /*
        Only update direction when there
        is meaningful movement.

        This prevents tiny mouse movements
        from making the star jitter.
      */

      if (speed > 1.5) {

        targetCursorRotation =
          Math.atan2(
            deltaY,
            deltaX
          ) *
          (180 / Math.PI);

      }


      /*
        Tail grows as mouse moves faster.
      */

      targetTailScale =
        Math.min(
          1.65,
          Math.max(
            0.55,
            0.55 + speed * 0.035
          )
        );


      targetCursorX = newX;
      targetCursorY = newY;


      lastPointerX = newX;
      lastPointerY = newY;


      /*
        First movement:
        immediately position cursor so it
        doesn't fly in from the centre.
      */

      if (!cursorVisible) {

        cursorX =
          targetCursorX;

        cursorY =
          targetCursorY;

        cursorVisible = true;

        neatCursor.style.opacity =
          "1";

      }

    },
    {
      passive: true
    }
  );


  /* -------------------------------------------------------
     LEAVE / RETURN
     ------------------------------------------------------- */

  document.addEventListener(
    "mouseleave",
    () => {

      neatCursor.style.opacity =
        "0";

    }
  );


  document.addEventListener(
    "mouseenter",
    () => {

      if (cursorVisible) {

        neatCursor.style.opacity =
          "1";

      }

    }
  );


  /* -------------------------------------------------------
     INTERACTIVE ELEMENTS
     ------------------------------------------------------- */

  const interactiveSelector =
    [
      "a",
      "button",
      "input",
      "label",
      ".object-zone",
      "[role='button']"
    ].join(",");


  document.addEventListener(
    "pointerover",
    event => {

      const interactive =
        event.target.closest?.(
          interactiveSelector
        );


      if (!interactive) {
        return;
      }


      neatCursor.classList.add(
        "is-interactive"
      );


      /*
        Slight enlargement over links/buttons.
      */

      targetCursorScale =
        1.18;


      /*
        Slightly longer tail.
      */

      targetTailScale =
        Math.max(
          targetTailScale,
          1
        );

    }
  );


  document.addEventListener(
    "pointerout",
    event => {

      const interactive =
        event.target.closest?.(
          interactiveSelector
        );


      if (!interactive) {
        return;
      }


      /*
        Don't trigger when moving between
        children of the same element.
      */

      if (
        event.relatedTarget &&
        interactive.contains(
          event.relatedTarget
        )
      ) {

        return;

      }


      neatCursor.classList.remove(
        "is-interactive"
      );


      targetCursorScale =
        1;

    }
  );


  /* -------------------------------------------------------
     CLICK
     ------------------------------------------------------- */

  window.addEventListener(
    "pointerdown",
    () => {

      targetCursorScale =
        0.72;

      targetTailScale =
        0.45;

    }
  );


  window.addEventListener(
    "pointerup",
    event => {

      const interactive =
        event.target.closest?.(
          interactiveSelector
        );


      targetCursorScale =
        interactive
          ? 1.18
          : 1;


      targetTailScale =
        0.7;

    }
  );


  /* -------------------------------------------------------
     ANIMATION LOOP
     ------------------------------------------------------- */

  function updateNeatCursor() {

    /*
      Smooth follow.
    */

    cursorX +=
      (
        targetCursorX -
        cursorX
      ) * 0.28;


    cursorY +=
      (
        targetCursorY -
        cursorY
      ) * 0.28;


    /*
      Smooth scale.
    */

    cursorScale +=
      (
        targetCursorScale -
        cursorScale
      ) * 0.16;


    /*
      Smooth rotation.

      This calculation uses the shortest
      rotational path so the star doesn't
      randomly spin 300+ degrees.
    */

    let rotationDifference =
      targetCursorRotation -
      cursorRotation;


    rotationDifference =
      (
        (
          rotationDifference + 180
        ) % 360 +
        360
      ) % 360 -
      180;


    cursorRotation +=
      rotationDifference * 0.18;


    /*
      Tail gradually returns to normal
      even after mouse movement stops.
    */

    targetTailScale +=
      (
        0.62 -
        targetTailScale
      ) * 0.035;


    tailScale +=
      (
        targetTailScale -
        tailScale
      ) * 0.18;


    /*
      Position + direction.
    */

    neatCursor.style.left =
      `${cursorX}px`;


    neatCursor.style.top =
      `${cursorY}px`;


    neatCursor.style.transform =
      `
        translate3d(
          -50%,
          -50%,
          0
        )
        rotate(${cursorRotation}deg)
        scale(${cursorScale})
      `;


    /*
      Send tail length to CSS.
    */

    neatCursor.style.setProperty(
      "--tail-scale",
      tailScale
    );


    requestAnimationFrame(
      updateNeatCursor
    );

  }


  requestAnimationFrame(
    updateNeatCursor
  );

}