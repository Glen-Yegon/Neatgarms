import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCLC4Dz-qxNOPtRFhybiBA5SqCDJgvKqMY",
  authDomain: "neat-53fa9.firebaseapp.com",
  projectId: "neat-53fa9",
  storageBucket: "neat-53fa9.firebasestorage.app",
  messagingSenderId: "857317417173",
  appId: "1:857317417173:web:6b84a45c96ebe56fce425c",
  measurementId: "G-5MQNYZF3E2",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore(app);

const loader = document.getElementById("loader");
const loaderFill = document.getElementById("loaderFill");
const loaderText = document.getElementById("loaderText");
const dashApp = document.getElementById("dashApp");

// Tier thresholds — based on lifetime points. Adjust as the program evolves.
const TIERS = [
  { name: "Bronze", min: 0 },
  { name: "Silver", min: 1000 },
  { name: "Gold",   min: 3000 },
];

const RING_CIRCUMFERENCE = 540.3; // 2 * PI * 86

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}

function formatDate(value) {
  if (!value) return "—";
  const d = value.toDate ? value.toDate() : new Date(value);
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function computeTierProgress(lifetimePoints) {
  let current = TIERS[0];
  let next = null;

  for (let i = 0; i < TIERS.length; i++) {
    if (lifetimePoints >= TIERS[i].min) {
      current = TIERS[i];
      next = TIERS[i + 1] || null;
    }
  }

  if (!next) {
    return { current, next: null, percent: 1, remaining: 0 };
  }

  const span = next.min - current.min;
  const progressInTier = lifetimePoints - current.min;
  const percent = Math.max(0, Math.min(1, progressInTier / span));
  const remaining = next.min - lifetimePoints;

  return { current, next, percent, remaining };
}

function animateCount(el, target, duration = 900) {
  const start = 0;
  const startTime = performance.now();
  function tick(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(start + (target - start) * eased).toLocaleString();
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function hideLoader() {
  loaderFill.style.width = "100%";
  setTimeout(() => {
    loader.classList.add("hidden");
    dashApp.classList.add("visible");
  }, 250);
}

function renderDashboard(userData, pointsData, uid) {
  const fullName = `${userData?.firstName || ""} ${userData?.lastName || ""}`.trim() || "Neat Member";
  document.getElementById("greeting").textContent = `Welcome back, ${userData?.firstName || "there"}`;
  document.getElementById("userName").textContent = fullName;
  document.getElementById("accName").textContent = fullName;
  document.getElementById("accEmail").textContent = userData?.email || "—";

  const balance = pointsData?.balance ?? 0;
  const lifetimePoints = pointsData?.lifetimePoints ?? 0;
  const tierStored = pointsData?.tier || "Bronze";

  document.getElementById("tierBadge").textContent = tierStored;
  animateCount(document.getElementById("balanceText"), balance);
  animateCount(document.getElementById("lifetimePoints"), lifetimePoints);
  document.getElementById("memberSince").textContent = formatDate(pointsData?.createdAt);

  // Ring + next-tier progress
  const { next, percent, remaining } = computeTierProgress(lifetimePoints);
  const ring = document.getElementById("ringProgress");
  const offset = RING_CIRCUMFERENCE * (1 - percent);
  requestAnimationFrame(() => { ring.style.strokeDashoffset = offset; });

  if (next) {
    document.getElementById("nextTierGap").textContent = remaining.toLocaleString();
    document.getElementById("nextTierLabel").textContent = `To ${next.name}`;
  } else {
    document.getElementById("nextTierGap").textContent = "Max";
    document.getElementById("nextTierLabel").textContent = "Top Tier Reached";
  }

  // Activity
  document.getElementById("lastEarned").textContent = formatDate(pointsData?.lastPointsEarnedAt);
  document.getElementById("lastRedeemed").textContent = formatDate(pointsData?.lastRedemptionAt);
  document.getElementById("birthdayStatus").textContent = pointsData?.birthdayRewardClaimed ? "Claimed" : "Not claimed yet";

  // Birthday field
  const birthdayInput = document.getElementById("birthdayInput");
  const birthdayNote = document.getElementById("birthdayNote");
  if (pointsData?.birthday) {
    const d = pointsData.birthday.toDate ? pointsData.birthday.toDate() : new Date(pointsData.birthday);
    birthdayInput.value = d.toISOString().split("T")[0];
    birthdayNote.textContent = "We'll send your birthday reward automatically.";
  } else {
    birthdayNote.textContent = "Add your birthday to unlock a yearly reward.";
  }

  document.getElementById("birthdaySave").addEventListener("click", async () => {
    const value = birthdayInput.value;
    if (!value) {
      showToast("Please choose a date first.");
      return;
    }
    try {
      await updateDoc(doc(db, "points", uid), {
        birthday: new Date(value),
        updatedAt: new Date(),
      });
      showToast("Birthday saved.");
      birthdayNote.textContent = "We'll send your birthday reward automatically.";
    } catch (err) {
      console.error(err);
      showToast("Couldn't save your birthday. Try again.");
    }
  });

  // Reward cards — lock visually if balance is short; redemption logic lands later
  document.querySelectorAll(".reward-card").forEach((card) => {
    const cost = parseInt(card.dataset.cost, 10);
    if (balance < cost) card.classList.add("locked");

    card.querySelector(".reward-btn").addEventListener("click", () => {
      if (balance < cost) {
        showToast(`You need ${(cost - balance).toLocaleString()} more points for this reward.`);
      } else {
        showToast("Redemption is launching soon — stay tuned!");
      }
    });
  });
}

// ── Auth guard + data load ──────────────────────
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "sign.html";
    return;
  }

  loaderFill.style.width = "35%";

  try {
    const [userSnap, pointsSnap] = await Promise.all([
      getDoc(doc(db, "users", user.uid)),
      getDoc(doc(db, "points", user.uid)),
    ]);

    loaderFill.style.width = "75%";

    const userData = userSnap.exists() ? userSnap.data() : { email: user.email };
    const pointsData = pointsSnap.exists() ? pointsSnap.data() : {};

    renderDashboard(userData, pointsData, user.uid);
  } catch (err) {
    console.error("Error loading dashboard:", err);
    loaderText.textContent = "Something went wrong. Please refresh.";
    return;
  }

  hideLoader();
});

// ── Logout ───────────────────────────────────────
document.getElementById("logoutBtn").addEventListener("click", async () => {
  try {
    await signOut(auth);
    localStorage.removeItem("loggedInUserId");
    window.location.href = "sign.html";
  } catch (err) {
    console.error(err);
    showToast("Error logging out.");
  }
});


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