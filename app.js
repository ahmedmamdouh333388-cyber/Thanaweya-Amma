
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

// Language system: Arabic is the default; the selected language is remembered.
const translations = {
  ar: {
    brandSubtitle:"منصة الثانوية العامة", eyebrow:"رحلتك نحو المستقبل تبدأ هنا",
    welcome:"أهلاً بك", student:"طالبنا", intro:"سجّل دخولك وابدأ رحلتك نحو التفوق والنجاح.",
    feature1:"شرح مبسط", feature2:"مراجعات شاملة", feature3:"نماذج امتحانات",
    startNow:"ابدأ الآن", googleLogin:"تسجيل الدخول باستخدام Google",
    loading:"جاري تسجيل الدخول...", waiting:"يرجى الانتظار...",
    signedIn:"تم تسجيل الدخول بنجاح", logout:"تسجيل الخروج",
    security:"🔒 بياناتك محمية ويتم تسجيل الدخول بأمان عبر Google",
    footer:"معاً نحو التفوق والنجاح ✦", userPhotoAlt:"صورة المستخدم",
    defaultUser:"طالبنا العزيز", welcomeBack:"أهلاً بك في منصة الثانوية العامة!",
    loginSuccess:"تم تسجيل الدخول بنجاح!", logoutSuccess:"تم تسجيل الخروج بنجاح.",
    logoutError:"تعذر تسجيل الخروج. حاول مرة أخرى.",
    errors:{
      "auth/popup-closed-by-user":"تم إغلاق نافذة تسجيل الدخول قبل إكمال العملية.",
      "auth/popup-blocked":"المتصفح منع نافذة الدخول. حاول مرة أخرى.",
      "auth/cancelled-popup-request":"هناك عملية تسجيل دخول أخرى قيد التنفيذ.",
      "auth/network-request-failed":"تحقق من اتصال الإنترنت وحاول مرة أخرى.",
      "auth/unauthorized-domain":"هذا النطاق غير مضاف إلى النطاقات المسموح بها في Firebase.",
      "auth/operation-not-allowed":"تسجيل الدخول باستخدام Google غير مفعّل في Firebase.",
      "auth/account-exists-with-different-credential":"هذا البريد مرتبط بطريقة تسجيل دخول مختلفة.",
      "auth/too-many-requests":"محاولات كثيرة، يرجى الانتظار والمحاولة لاحقاً."
    },
    genericError:"حدث خطأ أثناء تسجيل الدخول. حاول مرة أخرى."
  },
  en: {
    brandSubtitle:"Thanaweya Amma Platform", eyebrow:"Your journey to the future starts here",
    welcome:"Welcome", student:"Student", intro:"Sign in and start your journey toward excellence and success.",
    feature1:"Simple Lessons", feature2:"Comprehensive Reviews", feature3:"Exam Models",
    startNow:"Get Started", googleLogin:"Continue with Google",
    loading:"Signing in...", waiting:"Please wait...", signedIn:"Successfully signed in",
    logout:"Sign out", security:"🔒 Your data is protected. Sign in securely with Google.",
    footer:"Together toward excellence and success ✦", userPhotoAlt:"User photo",
    defaultUser:"Dear student", welcomeBack:"Welcome to Thanaweya Amma Platform!",
    loginSuccess:"Signed in successfully!", logoutSuccess:"You have signed out successfully.",
    logoutError:"Could not sign out. Please try again.",
    errors:{
      "auth/popup-closed-by-user":"The sign-in window was closed before completing the process.",
      "auth/popup-blocked":"Your browser blocked the sign-in window. Please try again.",
      "auth/cancelled-popup-request":"Another sign-in request is already in progress.",
      "auth/network-request-failed":"Check your internet connection and try again.",
      "auth/unauthorized-domain":"This domain is not authorized in Firebase.",
      "auth/operation-not-allowed":"Google sign-in is not enabled in Firebase.",
      "auth/account-exists-with-different-credential":"This email is linked to a different sign-in method.",
      "auth/too-many-requests":"Too many attempts. Please wait and try again later."
    },
    genericError:"Something went wrong while signing in. Please try again."
  }
};

let currentLanguage = localStorage.getItem("siteLanguage") === "en" ? "en" : "ar";
const languageToggle = document.getElementById("languageToggle");
function t(key) { return translations[currentLanguage][key]; }

function applyLanguage(language) {
  currentLanguage = language;
  localStorage.setItem("siteLanguage", language);
  document.documentElement.lang = language;
  document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-alt]").forEach((el) => {
    el.alt = t(el.dataset.i18nAlt);
  });
  languageToggle.textContent = language === "ar" ? "EN" : "عربي";
  languageToggle.setAttribute("aria-label",
    language === "ar" ? "Switch to English" : "التغيير إلى العربية");
  buttonText.textContent = loginButton.disabled ? t("waiting") : t("googleLogin");
  loadingText.textContent = t("loading");
}
languageToggle.addEventListener("click", () =>
  applyLanguage(currentLanguage === "ar" ? "en" : "ar")
);

// Loading State
function setLoading(active, text = t("loading")) {
  loading.hidden = !active;
  loginButton.disabled = active;
  buttonText.textContent = active
    ? t("waiting")
    : t("googleLogin");

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
  return translations[currentLanguage].errors[error.code] || t("genericError");
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
      showMessage(t("loginSuccess"), "success");
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

    userName.textContent = user.displayName || t("defaultUser");
    userEmail.textContent = user.email || "";

    userPhoto.src = user.photoURL ||
      "https://www.gstatic.com/images/branding/product/1x/avatar_circle_blue_512dp.png";

    userPhoto.onerror = () => {
      userPhoto.onerror = null;
      userPhoto.src =
        "https://www.gstatic.com/images/branding/product/1x/avatar_circle_blue_512dp.png";
    };

    showMessage(t("welcomeBack"), "success");

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

    showMessage(t("logoutSuccess"), "success");

  } catch (error) {
    console.error("Logout Error:", error);
    showMessage(t("logoutError"));
  } finally {
    logoutButton.disabled = false;
  }
});
    

// Apply the saved language on first load.
applyLanguage(currentLanguage);
