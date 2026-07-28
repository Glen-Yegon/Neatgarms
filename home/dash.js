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