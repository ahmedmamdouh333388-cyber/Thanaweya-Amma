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

import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  onSnapshot,
  query,
  orderBy,
  limit,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// ==========================================
// 1. إعدادات المطورين (تم إضافة الإيميلين)
// ==========================================
const DEVELOPER_EMAILS = [
  "ahmedmamdouh333388@gmail.com",
  "homooszizo@gmail.com"
]
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

const USERNAME_PREFIX = "Thana-";

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
const db = getFirestore(app);

// Google Provider
const provider = new GoogleAuthProvider();
provider.setCustomParameters({
  prompt: "select_account"
});

// ==========================================
// 2. عناصر الواجهة
// ==========================================
const loginButton = document.getElementById("googleLogin");
const buttonText = document.getElementById("buttonText");
const loading = document.getElementById("loading");
const loadingText = document.getElementById("loadingText");
const message = document.getElementById("message");

const userProfile = document.getElementById("userProfile");
const userPhoto = document.getElementById("userPhoto");
const userName = document.getElementById("userName");
const userEmail = document.getElementById("userEmail");
const userHandleDisplay = document.getElementById("userHandleDisplay");
const logoutButton = document.getElementById("logoutButton");

const accessGateBanner = document.getElementById("accessGateBanner");
const gateBadge = document.getElementById("gateBadge");
const gateTitle = document.getElementById("gateTitle");
const gateDescription = document.getElementById("gateDescription");
const gateUsername = document.getElementById("gateUsername");

const developerWorkspace = document.getElementById("developerWorkspace");
const devActiveUsername = document.getElementById("devActiveUsername");

// الإعدادات والرسائل
const settingsToggle = document.getElementById("settingsToggle");
const settingsDrawer = document.getElementById("settingsDrawer");
const closeDrawer = document.getElementById("closeDrawer");
const roleBadge = document.getElementById("roleBadge");
const drawerPhoto = document.getElementById("drawerPhoto");
const drawerName = document.getElementById("drawerName");
const drawerEmail = document.getElementById("drawerEmail");
const drawerUsername = document.getElementById("drawerUsername");
const copyUsernameBtn = document.getElementById("copyUsernameBtn");
const drawerLogoutBtn = document.getElementById("drawerLogoutBtn");

const inboxWrapper = document.getElementById("inboxWrapper");
const inboxButton = document.getElementById("inboxButton");
const inboxPanel = document.getElementById("inboxPanel");
const closeInbox = document.getElementById("closeInbox");
const inboxList = document.getElementById("inboxList");
const unreadDot = document.getElementById("unreadDot");

// أدوات المطور / المشرف
const staffControls = document.getElementById("staffControls");
const onlineCountEl = document.getElementById("onlineCount");
const totalUsersCountEl = document.getElementById("totalUsersCount");
const maintenanceStatusText = document.getElementById("maintenanceStatusText");
const toggleMaintenanceBtn = document.getElementById("toggleMaintenanceBtn");
const modUsernameInput = document.getElementById("modUsernameInput");
const addModBtn = document.getElementById("addModBtn");
const modsList = document.getElementById("modsList");
const broadcastTitleInput = document.getElementById("broadcastTitleInput");
const broadcastBodyInput = document.getElementById("broadcastBodyInput");
const sendBroadcastBtn = document.getElementById("sendBroadcastBtn");
const usersAdminList = document.getElementById("usersAdminList");
const bannedAdminList = document.getElementById("bannedAdminList");

// حالة النظام الحالية
let currentUser = null;
let currentUserProfile = null;
let allUsersCache = [];
let siteConfig = {
  maintenanceMode: true
};
let latestMessages = [];
let unsubUsers = null;
let unsubConfig = null;
let unsubMessages = null;
let presenceInterval = null;

// ==========================================
// 3. الترجمة واللغة
// ==========================================
const translations = {
  ar: {
    brandSubtitle: "منصة الثانوية العامة",
    eyebrow: "رحلتك نحو المستقبل تبدأ هنا",
    welcome: "أهلاً بك",
    student: "طالبنا",
    intro: "سجّل دخولك وابدأ رحلتك نحو التفوق والنجاح.",
    feature1: "شرح مبسط",
    feature2: "مراجعات شاملة",
    feature3: "نماذج امتحانات",
    startNow: "ابدأ الآن",
    googleLogin: "تسجيل الدخول باستخدام Google",
    loading: "جاري تسجيل الدخول...",
    waiting: "يرجى الانتظار...",
    signedIn: "تم تسجيل الدخول بنجاح",
    logout: "تسجيل الخروج",
    security: "🔒 بياناتك محمية ويتم تسجيل الدخول بأمان عبر Google",
    footer: "معاً نحو التفوق والنجاح ✦",
    userPhotoAlt: "صورة المستخدم",
    defaultUser: "طالبنا العزيز",
    welcomeBack: "تم تسجيل الدخول بنجاح!",
    loginSuccess: "تم تسجيل الدخول بنجاح!",
    logoutSuccess: "تم تسجيل الخروج بنجاح.",
    logoutError: "تعذر تسجيل الخروج. حاول مرة أخرى.",
    errors: {
      "auth/popup-closed-by-user": "تم إغلاق نافذة تسجيل الدخول قبل إكمال العملية.",
      "auth/popup-blocked": "المتصفح منع نافذة الدخول. حاول مرة أخرى.",
      "auth/cancelled-popup-request": "هناك عملية تسجيل دخول أخرى قيد التنفيذ.",
      "auth/network-request-failed": "تحقق من اتصال الإنترنت وحاول مرة أخرى.",
      "auth/unauthorized-domain": "هذا النطاق غير مضاف إلى النطاقات المسموح بها في Firebase.",
      "auth/operation-not-allowed": "تسجيل الدخول باستخدام Google غير مفعّل في Firebase.",
      "auth/account-exists-with-different-credential": "هذا البريد مرتبط بطريقة تسجيل دخول مختلفة.",
      "auth/too-many-requests": "محاولات كثيرة، يرجى الانتظار والمحاولة لاحقاً."
    },
    genericError: "حدث خطأ أثناء تسجيل الدخول. حاول مرة أخرى."
  },
  en: {
    brandSubtitle: "Thanaweya Amma Platform",
    eyebrow: "Your journey to the future starts here",
    welcome: "Welcome",
    student: "Student",
    intro: "Sign in and start your journey toward excellence and success.",
    feature1: "Simple Lessons",
    feature2: "Comprehensive Reviews",
    feature3: "Exam Models",
    startNow: "Get Started",
    googleLogin: "Continue with Google",
    loading: "Signing in...",
    waiting: "Please wait...",
    signedIn: "Successfully signed in",
    logout: "Sign out",
    security: "🔒 Your data is protected. Sign in securely with Google.",
    footer: "Together toward excellence and success ✦",
    userPhotoAlt: "User photo",
    defaultUser: "Dear student",
    welcomeBack: "Signed in successfully!",
    loginSuccess: "Signed in successfully!",
    logoutSuccess: "You have signed out successfully.",
    logoutError: "Could not sign out. Please try again.",
    errors: {
      "auth/popup-closed-by-user": "The sign-in window was closed before completing the process.",
      "auth/popup-blocked": "Your browser blocked the sign-in window. Please try again.",
      "auth/cancelled-popup-request": "Another sign-in request is already in progress.",
      "auth/network-request-failed": "Check your internet connection and try again.",
      "auth/unauthorized-domain": "This domain is not authorized in Firebase.",
      "auth/operation-not-allowed": "Google sign-in is not enabled in Firebase.",
      "auth/account-exists-with-different-credential": "This email is linked to a different sign-in method.",
      "auth/too-many-requests": "Too many attempts. Please wait and try again later."
    },
    genericError: "Something went wrong while signing in. Please try again."
  }
};

let currentLanguage = localStorage.getItem("siteLanguage") === "en" ? "en" : "ar";
const languageToggle = document.getElementById("languageToggle");
function t(key) {
  return translations[currentLanguage][key];
}

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
  languageToggle.textContent = language === "ar" ? "EN" : "AR";
  languageToggle.setAttribute(
    "aria-label",
    language === "ar" ? "Switch to English" : "التغيير إلى العربية"
  );
  buttonText.textContent = loginButton.disabled ? t("waiting") : t("googleLogin");
  loadingText.textContent = t("loading");
}

languageToggle.addEventListener("click", () =>
  applyLanguage(currentLanguage === "ar" ? "en" : "ar")
);

function setLoading(active, text = t("loading")) {
  loading.hidden = !active;
  loginButton.disabled = active;
  buttonText.textContent = active ? t("waiting") : t("googleLogin");
  loadingText.textContent = text;
}

function showMessage(text, type = "error") {
  message.textContent = text;
  message.style.color = type === "success" ? "#9bffc5" : "#ffd0d0";
}

function getArabicError(error) {
  return translations[currentLanguage].errors[error.code] || t("genericError");
}

// ==========================================
// 4. توليد يوزر فريد يبدأ بـ Thana-
// ==========================================
function generateRandomHandle() {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let suffix = "";
  for (let i = 0; i < 5; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  return `${USERNAME_PREFIX}${suffix}`;
}

async function ensureUniqueHandle(preferredHandle = null) {
  let candidate = preferredHandle || generateRandomHandle();
  for (let attempt = 0; attempt < 10; attempt++) {
    try {
      const ref = doc(db, "handles", candidate);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        return candidate;
      }
    } catch {
      return candidate;
    }
    candidate = generateRandomHandle();
  }
  return `${USERNAME_PREFIX}${Date.now().toString(36).slice(-5)}`;
}

function isDeveloperEmail(email) {
  if (!email) return false;
  return DEVELOPER_EMAILS.includes(email.trim().toLowerCase());
}

function isModeratorUser(profile) {
  return Boolean(profile && profile.role === "moderator");
}

function isStaffUser(email, profile) {
  return isDeveloperEmail(email) || isModeratorUser(profile);
}

// ==========================================
// 5. تسجيل وحفظ ملف المستخدم في Firestore (مع حماية من أي تعليق)
// ==========================================
async function syncUserProfile(user) {
  const normalizedEmail = (user.email || "").trim().toLowerCase();
  const isDev = isDeveloperEmail(normalizedEmail);
  const fallbackHandle = generateRandomHandle();

  const fallbackProfile = {
    uid: user.uid,
    email: normalizedEmail,
    displayName: user.displayName || t("defaultUser"),
    photoURL: user.photoURL || "",
    username: fallbackHandle,
    role: isDev ? "developer" : "user",
    banned: false,
    lastSeen: Date.now()
  };

  try {
    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);

    if (!snap.exists()) {
      const assignedHandle = await ensureUniqueHandle();
      const newProfile = {
        ...fallbackProfile,
        username: assignedHandle,
        createdAt: serverTimestamp()
      };

      await setDoc(userRef, newProfile);
      await setDoc(doc(db, "handles", assignedHandle), {
        uid: user.uid,
        email: normalizedEmail
      }).catch(() => {});

      return newProfile;
    }

    const existing = snap.data();
    const updatedFields = {
      email: normalizedEmail,
      displayName: user.displayName || existing.displayName || t("defaultUser"),
      photoURL: user.photoURL || existing.photoURL || "",
      lastSeen: Date.now()
    };

    if (isDev && existing.role !== "developer") {
      updatedFields.role = "developer";
    }

    if (!existing.username || !existing.username.startsWith(USERNAME_PREFIX)) {
      const newHandle = await ensureUniqueHandle();
      updatedFields.username = newHandle;
      await setDoc(doc(db, "handles", newHandle), {
        uid: user.uid,
        email: normalizedEmail
      }).catch(() => {});
    }

    await updateDoc(userRef, updatedFields);
    return { ...existing, ...updatedFields };
  } catch (err) {
    console.error("Firestore sync error (using fallback profile):", err);
    return fallbackProfile;
  }
}

async function pingPresence(uid) {
  if (!uid) return;
  try {
    await updateDoc(doc(db, "users", uid), {
      lastSeen: Date.now()
    });
  } catch (err) {
    console.warn("Presence update failed:", err);
  }
}

// ==========================================
// 6. تحديث الواجهة حسب الصلاحيات وحالة الموقع
// ==========================================
function renderAccessAndUI() {
  if (!currentUser) {
    settingsToggle.hidden = true;
    settingsDrawer.hidden = true;
    inboxWrapper.hidden = true;
    inboxPanel.hidden = true;
    accessGateBanner.hidden = true;
    developerWorkspace.hidden = true;
    userProfile.hidden = true;
    loginButton.hidden = false;
    return;
  }

  const profile = currentUserProfile || {
    uid: currentUser.uid,
    email: (currentUser.email || "").toLowerCase(),
    username: `${USERNAME_PREFIX}-----`,
    role: isDeveloperEmail(currentUser.email) ? "developer" : "user",
    banned: false
  };

  const staff = isStaffUser(currentUser.email, profile);
  const banned = Boolean(profile.banned) && !isDeveloperEmail(currentUser.email);
  const maintenance = Boolean(siteConfig.maintenanceMode);

  settingsToggle.hidden = false;
  inboxWrapper.hidden = banned;

  const handle = profile.username || `${USERNAME_PREFIX}-----`;
  const avatarUrl =
    currentUser.photoURL ||
    "https://www.gstatic.com/images/branding/product/1x/avatar_circle_blue_512dp.png";

  drawerPhoto.src = avatarUrl;
  drawerName.textContent = currentUser.displayName || t("defaultUser");
  drawerEmail.textContent = currentUser.email || "";
  drawerUsername.textContent = handle;

  loginButton.hidden = true;
  userProfile.hidden = false;
  userName.textContent = currentUser.displayName || t("defaultUser");
  userEmail.textContent = currentUser.email || "";
  userHandleDisplay.textContent = `اليوزر الخاص بك: ${handle}`;
  userPhoto.src = avatarUrl;
  userPhoto.onerror = () => {
    userPhoto.onerror = null;
    userPhoto.src =
      "https://www.gstatic.com/images/branding/product/1x/avatar_circle_blue_512dp.png";
  };

  if (isDeveloperEmail(currentUser.email)) {
    roleBadge.textContent = "مطور";
    roleBadge.className = "role-badge is-dev";
  } else if (isModeratorUser(profile)) {
    roleBadge.textContent = "مشرف";
    roleBadge.className = "role-badge is-mod";
  } else {
    roleBadge.textContent = "طالب";
    roleBadge.className = "role-badge";
  }

  staffControls.hidden = !staff;

  const canEnterSite = staff || (!banned && !maintenance);

  if (canEnterSite) {
    accessGateBanner.hidden = true;
    developerWorkspace.hidden = !staff;
    if (staff) {
      devActiveUsername.textContent = handle;
      showMessage("أهلاً بك يا مطور! الموقع مفتوح لك للتجربة.", "success");
    } else {
      showMessage("تم تسجيل الدخول بنجاح!", "success");
    }
  } else {
    developerWorkspace.hidden = true;
    accessGateBanner.hidden = false;
    gateUsername.textContent = handle;

    if (banned) {
      gateBadge.textContent = "⛔ الحساب محظور";
      gateTitle.textContent = "تم إيقاف حسابك مؤقتاً";
      gateDescription.textContent =
        "تم حظر هذا الحساب من الدخول إلى المنصة. يمكنك مراجعة صندوق الرسائل أعلى الشاشة.";
      showMessage("هذا الحساب محظور حالياً.", "error");
    } else {
      gateBadge.textContent = "🚧 الموقع تحت الإنشاء";
      gateTitle.textContent = "الموقع قيد التطوير والصيانة حالياً";
      gateDescription.textContent =
        "لا يمكن الدخول حالياً إلا للمطورين لتجربة الموقع. تم حفظ يوزرك تلقائياً لحين فتح المنصة.";
      showMessage("الموقع تحت الإنشاء حالياً ولا يفتح للمستخدمين العاديين.", "error");
    }
  }

  renderMaintenanceStatus();
  renderUnreadDot();
}

// ==========================================
// 7. مستمعات Firestore الحية
// ==========================================
function subscribeRealtimeData() {
  if (unsubConfig) unsubConfig();
  if (unsubUsers) unsubUsers();
  if (unsubMessages) unsubMessages();

  unsubConfig = onSnapshot(
    doc(db, "config", "site"),
    (snap) => {
      if (snap.exists()) {
        siteConfig = { ...siteConfig, ...snap.data() };
      } else {
        siteConfig = { maintenanceMode: true };
      }
      renderAccessAndUI();
    },
    (err) => console.warn("Config listener warning:", err)
  );

  unsubUsers = onSnapshot(
    collection(db, "users"),
    (snapshot) => {
      const now = Date.now();
      const onlineWindowMs = 2 * 60 * 1000;

      allUsersCache = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

      if (currentUser) {
        const me = allUsersCache.find((u) => u.uid === currentUser.uid);
        if (me) {
          currentUserProfile = me;
          renderAccessAndUI();
        }
      }

      const activeUsers = allUsersCache.filter(
        (u) => typeof u.lastSeen === "number" && now - u.lastSeen <= onlineWindowMs
      );

      totalUsersCountEl.textContent = String(allUsersCache.length);
      onlineCountEl.textContent = String(activeUsers.length);

      if (currentUser && isStaffUser(currentUser.email, currentUserProfile)) {
        renderStaffLists();
      }
    },
    (err) => console.warn("Users listener warning:", err)
  );

  const qMessages = query(collection(db, "announcements"), orderBy("createdAt", "desc"), limit(20));
  unsubMessages = onSnapshot(
    qMessages,
    (snapshot) => {
      latestMessages = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      renderInboxList();
      renderUnreadDot();
    },
    (err) => console.warn("Messages listener warning:", err)
  );
}

function unsubscribeRealtimeData() {
  if (unsubConfig) unsubConfig();
  if (unsubUsers) unsubUsers();
  if (unsubMessages) unsubMessages();
  if (presenceInterval) clearInterval(presenceInterval);
}

// ==========================================
// 8. صندوق الرسائل والنقطة الحمراء
// ==========================================
function getSeenMessageTimestamp() {
  if (!currentUser) return 0;
  return Number(localStorage.getItem(`seenMsgAt_${currentUser.uid}`) || 0);
}

function markMessagesAsSeen() {
  if (!currentUser) return;
  localStorage.setItem(`seenMsgAt_${currentUser.uid}`, String(Date.now()));
  renderUnreadDot();
}

function renderUnreadDot() {
  if (!currentUser || !latestMessages.length) {
    unreadDot.hidden = true;
    return;
  }
  const lastSeenMsg = getSeenMessageTimestamp();
  const hasNew = latestMessages.some((m) => (m.clientTime || 0) > lastSeenMsg);
  unreadDot.hidden = !hasNew;
}

function renderInboxList() {
  if (!latestMessages.length) {
    inboxList.innerHTML = `<div class="empty-note">لا توجد رسائل جديدة حالياً.</div>`;
    return;
  }

  inboxList.innerHTML = latestMessages
    .map((msg) => {
      const safeTitle = escapeHtml(msg.title || "رسالة من الإدارة");
      const safeBody = escapeHtml(msg.body || "");
      return `
        <div class="inbox-item">
          <strong>${safeTitle}</strong>
          <p>${safeBody}</p>
        </div>
      `;
    })
    .join("");
}

inboxButton.addEventListener("click", () => {
  const willOpen = inboxPanel.hidden;
  inboxPanel.hidden = !willOpen;
  if (willOpen) {
    markMessagesAsSeen();
  }
});

closeInbox.addEventListener("click", () => {
  inboxPanel.hidden = true;
});

// ==========================================
// 9. صلاحيات المطور والمشرف
// ==========================================
function renderMaintenanceStatus() {
  const isClosed = Boolean(siteConfig.maintenanceMode);
  maintenanceStatusText.textContent = isClosed ? "تحت الإنشاء / صيانة" : "مفتوح";
  maintenanceStatusText.className = isClosed
    ? "status-pill is-closed"
    : "status-pill is-open";
}

toggleMaintenanceBtn.addEventListener("click", async () => {
  if (!currentUser || !isStaffUser(currentUser.email, currentUserProfile)) return;
  try {
    toggleMaintenanceBtn.disabled = true;
    const nextState = !Boolean(siteConfig.maintenanceMode);
    await setDoc(
      doc(db, "config", "site"),
      {
        maintenanceMode: nextState,
        updatedBy: currentUser.email,
        updatedAt: serverTimestamp()
      },
      { merge: true }
    );
  } catch (err) {
    console.error("Maintenance toggle error:", err);
    showMessage("تعذر تغيير حالة الموقع. تأكد من تفعيل Firestore Rules.", "error");
  } finally {
    toggleMaintenanceBtn.disabled = false;
  }
});

addModBtn.addEventListener("click", async () => {
  if (!currentUser || !isStaffUser(currentUser.email, currentUserProfile)) return;
  const targetHandle = modUsernameInput.value.trim();
  if (!targetHandle) {
    showMessage("اكتب اليوزر المراد ترقيته لمشرف.", "error");
    return;
  }

  const targetUser = allUsersCache.find(
    (u) => (u.username || "").toLowerCase() === targetHandle.toLowerCase()
  );

  if (!targetUser) {
    showMessage("لم يتم العثور على مستخدم بهذا اليوزر.", "error");
    return;
  }

  try {
    addModBtn.disabled = true;
    await updateDoc(doc(db, "users", targetUser.uid), {
      role: isDeveloperEmail(targetUser.email) ? "developer" : "moderator"
    });
    modUsernameInput.value = "";
    showMessage(`تمت ترقية ${targetUser.username} إلى مشرف.`, "success");
  } catch (err) {
    console.error("Add moderator error:", err);
    showMessage("حدث خطأ أثناء إضافة المشرف.", "error");
  } finally {
    addModBtn.disabled = false;
  }
});

sendBroadcastBtn.addEventListener("click", async () => {
  if (!currentUser || !isStaffUser(currentUser.email, currentUserProfile)) return;
  const title = broadcastTitleInput.value.trim();
  const body = broadcastBodyInput.value.trim();

  if (!body) {
    showMessage("اكتب نص الرسالة أولاً.", "error");
    return;
  }

  try {
    sendBroadcastBtn.disabled = true;
    const nowMs = Date.now();
    await setDoc(doc(db, "announcements", String(nowMs)), {
      title: title || "تنبيه من المطور",
      body,
      senderHandle: (currentUserProfile && currentUserProfile.username) || USERNAME_PREFIX + "dev",
      clientTime: nowMs,
      createdAt: serverTimestamp()
    });
    broadcastTitleInput.value = "";
    broadcastBodyInput.value = "";
    markMessagesAsSeen();
    showMessage("تم إرسال الرسالة وتفعيل النقطة الحمراء للمستخدمين.", "success");
  } catch (err) {
    console.error("Broadcast error:", err);
    showMessage("تعذر إرسال الرسالة.", "error");
  } finally {
    sendBroadcastBtn.disabled = false;
  }
});

function renderStaffLists() {
  const moderators = allUsersCache.filter((u) => u.role === "moderator");
  if (!moderators.length) {
    modsList.innerHTML = `<div class="empty-note">لا يوجد مشرفون إضافيون حالياً.</div>`;
  } else {
    modsList.innerHTML = moderators
      .map(
        (m) => `
        <div class="user-row">
          <div class="user-row-info">
            <strong>${escapeHtml(m.username || "")}</strong>
            <small>${escapeHtml(m.email || "")}</small>
          </div>
          <button type="button" class="small-btn neutral-btn" data-demote-uid="${escapeHtml(m.uid)}">إزالة إشراف</button>
        </div>
      `
      )
      .join("");
  }

  const activeOrUnbanned = allUsersCache.filter((u) => !u.banned);
  const bannedUsers = allUsersCache.filter((u) => Boolean(u.banned));

  if (!activeOrUnbanned.length) {
    usersAdminList.innerHTML = `<div class="empty-note">لا يوجد مستخدمون مسجلون بعد.</div>`;
  } else {
    usersAdminList.innerHTML = activeOrUnbanned
      .map((u) => {
        const isDev = isDeveloperEmail(u.email);
        return `
          <div class="user-row">
            <div class="user-row-info">
              <strong>${escapeHtml(u.username || "")}</strong>
              <small>${escapeHtml(u.email || "")} • ${escapeHtml(u.role || "user")}</small>
            </div>
            <div class="row-actions">
              <button type="button" class="small-btn edit-btn" data-edit-uid="${escapeHtml(u.uid)}">تعديل اليوزر</button>
              ${
                isDev
                  ? ""
                  : `<button type="button" class="small-btn danger-btn" data-ban-uid="${escapeHtml(u.uid)}">حظر</button>`
              }
            </div>
          </div>
        `;
      })
      .join("");
  }

  if (!bannedUsers.length) {
    bannedAdminList.innerHTML = `<div class="empty-note">قائمة المحظورين فارغة.</div>`;
  } else {
    bannedAdminList.innerHTML = bannedUsers
      .map(
        (u) => `
        <div class="user-row">
          <div class="user-row-info">
            <strong>${escapeHtml(u.username || "")}</strong>
            <small>${escapeHtml(u.email || "")}</small>
          </div>
          <button type="button" class="small-btn success-btn" data-unban-uid="${escapeHtml(u.uid)}">إزالة الحظر</button>
        </div>
      `
      )
      .join("");
  }
}

document.addEventListener("click", async (e) => {
  if (!currentUser || !isStaffUser(currentUser.email, currentUserProfile)) return;

  const target = e.target.closest("button");
  if (!target) return;

  if (target.dataset.editUid) {
    const uid = target.dataset.editUid;
    const targetUser = allUsersCache.find((u) => u.uid === uid);
    if (!targetUser) return;

    const currentHandle = targetUser.username || USERNAME_PREFIX;
    const nextInput = prompt(
      `تعديل اليوزر الخاص بـ (${targetUser.email})
يجب أن يبدأ بـ ${USERNAME_PREFIX}:`,
      currentHandle
    );
    if (!nextInput) return;

    let cleanHandle = nextInput.trim();
    if (!cleanHandle.startsWith(USERNAME_PREFIX)) {
      cleanHandle = `${USERNAME_PREFIX}${cleanHandle.replace(/^thana-?/i, "")}`;
    }

    if (cleanHandle.length < USERNAME_PREFIX.length + 2) {
      showMessage("اليوزر قصير جداً.", "error");
      return;
    }

    try {
      const handleSnap = await getDoc(doc(db, "handles", cleanHandle));
      if (handleSnap.exists() && handleSnap.data().uid !== uid) {
        showMessage("هذا اليوزر مستخدم بالفعل لحساب آخر.", "error");
        return;
      }

      if (targetUser.username && targetUser.username !== cleanHandle) {
        await deleteDoc(doc(db, "handles", targetUser.username)).catch(() => {});
      }

      await setDoc(doc(db, "handles", cleanHandle), {
        uid,
        email: targetUser.email || ""
      });
      await updateDoc(doc(db, "users", uid), {
        username: cleanHandle
      });
      showMessage(`تم تحديث اليوزر إلى ${cleanHandle}`, "success");
    } catch (err) {
      console.error("Edit handle error:", err);
      showMessage("تعذر تعديل اليوزر.", "error");
    }
  }

  if (target.dataset.banUid) {
    const uid = target.dataset.banUid;
    try {
      await updateDoc(doc(db, "users", uid), { banned: true });
      showMessage("تم حظر المستخدم بنجاح.", "success");
    } catch (err) {
      console.error("Ban error:", err);
      showMessage("تعذر حظر المستخدم.", "error");
    }
  }

  if (target.dataset.unbanUid) {
    const uid = target.dataset.unbanUid;
    try {
      await updateDoc(doc(db, "users", uid), { banned: false });
      showMessage("تمت إزالة الحظر بنجاح.", "success");
    } catch (err) {
      console.error("Unban error:", err);
      showMessage("تعذر إزالة الحظر.", "error");
    }
  }

  if (target.dataset.demoteUid) {
    const uid = target.dataset.demoteUid;
    try {
      await updateDoc(doc(db, "users", uid), { role: "user" });
      showMessage("تمت إزالة صلاحية الإشراف.", "success");
    } catch (err) {
      console.error("Demote error:", err);
      showMessage("تعذر تعديل الصلاحية.", "error");
    }
  }
});

// ==========================================
// 10. فتح وإغلاق قائمة الإعدادات ونسخ اليوزر
// ==========================================
settingsToggle.addEventListener("click", () => {
  settingsDrawer.hidden = false;
});

closeDrawer.addEventListener("click", () => {
  settingsDrawer.hidden = true;
});

copyUsernameBtn.addEventListener("click", async () => {
  const handle = drawerUsername.textContent.trim();
  if (!handle) return;
  try {
    await navigator.clipboard.writeText(handle);
    copyUsernameBtn.textContent = "تم النسخ ✓";
    setTimeout(() => {
      copyUsernameBtn.textContent = "نسخ";
    }, 1500);
  } catch {
    showMessage("تعذر النسخ تلقائياً.", "error");
  }
});

// ==========================================
// 11. تسجيل الدخول والخروج عبر Google
// ==========================================
loginButton.addEventListener("click", async () => {
  if (loginButton.disabled) return;

  showMessage("");
  setLoading(true);

  try {
    await signInWithPopup(auth, provider);
  } catch (error) {
    console.error("Google Login Error:", error);

    if (
      error.code === "auth/popup-blocked" ||
      error.code === "auth/web-storage-unsupported" ||
      error.code === "auth/operation-not-supported-in-this-environment"
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

onAuthStateChanged(auth, async (user) => {
  setLoading(false);
  currentUser = user;

  if (user) {
    currentUserProfile = await syncUserProfile(user);
    renderAccessAndUI();
    subscribeRealtimeData();

    presenceInterval = setInterval(() => {
      pingPresence(user.uid);
    }, 45000);
  } else {
    currentUserProfile = null;
    allUsersCache = [];
    unsubscribeRealtimeData();
    renderAccessAndUI();
  }
});

async function handleSignOut() {
  try {
    logoutButton.disabled = true;
    drawerLogoutBtn.disabled = true;
    await signOut(auth);
    showMessage(t("logoutSuccess"), "success");
  } catch (error) {
    console.error("Logout Error:", error);
    showMessage(t("logoutError"));
  } finally {
    logoutButton.disabled = false;
    drawerLogoutBtn.disabled = false;
  }
}

logoutButton.addEventListener("click", handleSignOut);
drawerLogoutBtn.addEventListener("click", handleSignOut);

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

applyLanguage(currentLanguage);
