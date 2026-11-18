
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyAHTveEKsoh6DrDmk_x4xgPIGIY9vH-6S0",
  authDomain: "thanaweya-amma.firebaseapp.com",
  projectId: "thanaweya-amma",
  storageBucket: "thanaweya-amma.firebasestorage.app",
  messagingSenderId: "1019176732586",
  appId: "1:1019176732586:web:0be6e4dd10eacfb37e4dd3",
  measurementId: "G-EV64Y4DW5H"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Google Provider
const provider = new GoogleAuthProvider();

provider.setCustomParameters({
  prompt: "select_account"
});

// Elements
const loginButton = document.getElementById("googleLogin");
const buttonText = document.getElementById("buttonText");
const loading = document.getElementById("loading");
const loadingText = document.getElementById("loadingText");
const message = document.getElementById("message");

const userProfile = document.getElementById("userProfile");
const userPhoto = document.getElementById("userPhoto");
const userName = document.getElementById("userName");
const userEmail = document.getElementById("userEmail");
const logoutButton = document.getElementById("logoutButton");

// Loading State
function setLoading(active, text = "جاري تسجيل الدخول...") {
  loading.hidden = !active;
  loginButton.disabled = active;
  buttonText.textContent = active
    ? "يرجى الانتظار..."
    : "تسجيل الدخول باستخدام Google";

  loadingText.textContent = text;
}

// Messages
function showMessage(text, type = "error") {
  message.textContent = text;
  message.style.color =
    type === "success" ? "#9bffc5" : "#ffd0d0";
}

// Firebase Error Handler
function getArabicError(error) {
  const errors = {
    "auth/popup-closed-by-user":
      "تم إغلاق نافذة تسجيل الدخول قبل إكمال العملية.",

    "auth/popup-blocked":
      "المتصفح منع نافذة الدخول. حاول مرة أخرى.",

    "auth/cancelled-popup-request":
      "هناك عملية تسجيل دخول أخرى قيد التنفيذ.",

    "auth/network-request-failed":
      "تحقق من اتصال الإنترنت وحاول مرة أخرى.",

    "auth/unauthorized-domain":
      "هذا النطاق غير مضاف إلى النطاقات المسموح بها في Firebase.",

    "auth/operation-not-allowed":
      "تسجيل الدخول باستخدام Google غير مفعّل في Firebase.",

    "auth/account-exists-with-different-credential":
      "هذا البريد مرتبط بطريقة تسجيل دخول مختلفة.",

    "auth/too-many-requests":
      "محاولات كثيرة، يرجى الانتظار والمحاولة لاحقاً."
  };

  return errors[error.code] ||
    "حدث خطأ أثناء تسجيل الدخول. حاول مرة أخرى.";
}

// Google Login
loginButton.addEventListener("click", async () => {
  if (loginButton.disabled) return;

  showMessage("");
  setLoading(true);

  try {
    // Redirect is more suitable for mobile browsers
    const isMobile = window.matchMedia(
      "(max-width: 768px), (pointer: coarse)"
    ).matches;

    if (isMobile) {
      await signInWithRedirect(auth, provider);
      return;
    }

    await signInWithPopup(auth, provider);

  } catch (error) {
    console.error("Google Login Error:", error);

    // Try redirect if popup is blocked
    if (
      error.code === "auth/popup-blocked" ||
      error.code === "auth/web-storage-unsupported"
    ) {
      try {
        await signInWithRedirect(auth, provider);
        return;
      } catch (redirectError) {
        console.error("Redirect Error:", redirectError);
        showMessage(getArabicError(redirectError));
      }
    } else {
      showMessage(getArabicError(error));
    }

    setLoading(false);
  }
});

// Handle Google Redirect Result
getRedirectResult(auth)
  .then((result) => {
    if (result && result.user) {
      showMessage("تم تسجيل الدخول بنجاح!", "success");
    }
  })
  .catch((error) => {
    console.error("Redirect Result Error:", error);
    showMessage(getArabicError(error));
    setLoading(false);
  });

// Monitor Authentication State
onAuthStateChanged(auth, (user) => {
  setLoading(false);

  if (user) {
    loginButton.hidden = true;
    userProfile.hidden = false;

    userName.textContent = user.displayName || "طالبنا العزيز";
    userEmail.textContent = user.email || "";

    userPhoto.src = user.photoURL ||
      "https://www.gstatic.com/images/branding/product/1x/avatar_circle_blue_512dp.png";

    userPhoto.onerror = () => {
      userPhoto.onerror = null;
      userPhoto.src =
        "https://www.gstatic.com/images/branding/product/1x/avatar_circle_blue_512dp.png";
    };

    showMessage("أهلاً بك في منصة الثانوية العامة!", "success");

  } else {
    loginButton.hidden = false;
    userProfile.hidden = true;
    userPhoto.src = "";
  }
});

// Logout
logoutButton.addEventListener("click", async () => {
  try {
    logoutButton.disabled = true;

    await signOut(auth);

    showMessage("تم تسجيل الخروج بنجاح.", "success");

  } catch (error) {
    console.error("Logout Error:", error);
    showMessage("تعذر تسجيل الخروج. حاول مرة أخرى.");
  } finally {
    logoutButton.disabled = false;
  }
});
    
