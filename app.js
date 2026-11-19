import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc, collection, query, orderBy, limit, getDocs, onSnapshot, runTransaction, serverTimestamp, where, addDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAHTveEKsoh6DrDmk_x4xgPIGIY9vH-6S0",
  authDomain: "thanaweya-amma.firebaseapp.com",
  projectId: "thanaweya-amma",
  storageBucket: "thanaweya-amma.firebasestorage.app",
  messagingSenderId: "1019176732586",
  appId: "1:1019176732586:web:0be6e4dd10eacfb37e4dd3",
  measurementId: "G-EV64Y4DW5H"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });

// Add the two developers' Firebase Auth UIDs here after retrieving them from Firebase Console.
// A developer username by itself never grants admin access.
const AUTHORIZED_ADMIN_UIDS = [
  // "PASTE_AHMED_FIREBASE_UID_HERE",
  // "PASTE_MOHAMED_FIREBASE_UID_HERE"
];
const DEVELOPER_NAMES = ["Ahmed_admin_2009", "Mohamed_admin_2008"];
const $ = (id) => document.getElementById(id);
const ui = {
  login: $("googleLogin"), buttonText: $("buttonText"), loading: $("loading"), loadingText: $("loadingText"),
  message: $("message"), profile: $("userProfile"), photo: $("userPhoto"), name: $("userName"),
  email: $("userEmail"), logout: $("logoutButton"), language: $("languageToggle"), card: $("loginCard")
};
let currentUser = null;
let currentLanguage = localStorage.getItem("siteLanguage") === "en" ? "en" : "ar";
let unsubscribeInbox = null;
let isDeveloperFlow = sessionStorage.getItem("developerFlow") === "1";
let selectedDeveloperName = sessionStorage.getItem("developerName") || "";

const words = {
 ar: { brandSubtitle:"منصة الثانوية العامة", eyebrow:"رحلتك نحو المستقبل تبدأ هنا", welcome:"أهلاً بك", student:"طالبنا", intro:"سجّل دخولك وابدأ رحلتك نحو التفوق والنجاح.", feature1:"شرح مبسط", feature2:"مراجعات شاملة", feature3:"نماذج امتحانات", startNow:"ابدأ الآن", googleLogin:"تسجيل الدخول باستخدام Google", loading:"جاري تسجيل الدخول...", waiting:"يرجى الانتظار...", signedIn:"تم تسجيل الدخول بنجاح", logout:"تسجيل الخروج", security:"🔒 بياناتك محمية ويتم تسجيل الدخول بأمان عبر Google", footer:"معاً نحو التفوق والنجاح ✦", userPhotoAlt:"صورة المستخدم", defaultUser:"طالبنا العزيز", welcomeBack:"أهلاً بك في منصة الثانوية العامة!", loginSuccess:"تم تسجيل الدخول بنجاح!", logoutSuccess:"تم تسجيل الخروج بنجاح.", logoutError:"تعذر تسجيل الخروج. حاول مرة أخرى.", genericError:"حدث خطأ. حاول مرة أخرى.", usernameTitle:"اختار يوزرك الخاص", usernameHint:"اكتب اسم المستخدم الذي سيظهر داخل المنصة", usernamePlaceholder:"اكتب اليوزر هنا", saveUsername:"حفظ اليوزر", usernameTaken:"الاسم مستخدم بالفعل، اختار اسم تاني.", usernameSaved:"تم حفظ اليوزر. لا يمكن تغييره إلا عن طريق المطور.", confirm:"تأكيد", copy:"نسخ اليوزر", underConstruction:"الموقع تحت الإنشاء", developer:"دخول المطور", developerHint:"اكتب اسم المطور ثم سجّل بحساب Google المصرح به", developerPlaceholder:"اسم المطور", continueGoogle:"المتابعة باستخدام Google", developerDenied:"الحساب ده مش مصرح له بدخول لوحة المطورين.", branchTitle:"اختار الشعبة", science:"علمي علوم", maths:"علمي رياضة", inbox:"الرسائل", adminTitle:"لوحة تحكم المطور", users:"المستخدمون", online:"المتصلون الآن تقريباً", maintenance:"وضع الصيانة", maintenanceReason:"سبب الصيانة", save:"حفظ", broadcast:"إرسال رسالة للجميع", send:"إرسال", userSearch:"ابحث باليوزر أو البريد", ban:"حظر", unban:"إلغاء الحظر", changeUsername:"تغيير اليوزر", noMessages:"لا توجد رسائل حالياً", maintenanceMessage:"الموقع تحت الصيانة", back:"رجوع", contact:"تواصل مع المطورين", messagePlaceholder:"اكتب رسالتك هنا", user:"المستخدم", status:"الحالة", actions:"إجراءات", banned:"محظور", active:"نشط", branch:"الشعبة", inboxNew:"رسالة جديدة" },
 en: { brandSubtitle:"Thanaweya Amma Platform", eyebrow:"Your journey to the future starts here", welcome:"Welcome", student:"Student", intro:"Sign in and start your journey toward excellence and success.", feature1:"Simple Lessons", feature2:"Comprehensive Reviews", feature3:"Exam Models", startNow:"Get Started", googleLogin:"Continue with Google", loading:"Signing in...", waiting:"Please wait...", signedIn:"Successfully signed in", logout:"Sign out", security:"🔒 Your data is protected. Sign in securely with Google.", footer:"Together toward excellence and success ✦", userPhotoAlt:"User photo", defaultUser:"Dear student", welcomeBack:"Welcome to Thanaweya Amma!", loginSuccess:"Signed in successfully!", logoutSuccess:"Signed out successfully.", logoutError:"Could not sign out.", genericError:"Something went wrong. Please try again.", usernameTitle:"Choose your username", usernameHint:"This is the name that will appear on the platform", usernamePlaceholder:"Enter username", saveUsername:"Save username", usernameTaken:"This username is already taken.", usernameSaved:"Username saved. Only a developer can change it.", confirm:"Confirm", copy:"Copy username", underConstruction:"Website under construction", developer:"Developer access", developerHint:"Enter your developer name, then sign in with its authorized Google account", developerPlaceholder:"Developer username", continueGoogle:"Continue with Google", developerDenied:"This Google account is not authorized for the developer dashboard.", branchTitle:"Choose your track", science:"Science", maths:"Mathematics", inbox:"Inbox", adminTitle:"Developer dashboard", users:"Users", online:"Approx. online", maintenance:"Maintenance mode", maintenanceReason:"Maintenance reason", save:"Save", broadcast:"Broadcast message", send:"Send", userSearch:"Search username or email", ban:"Ban", unban:"Unban", changeUsername:"Change username", noMessages:"No messages yet", maintenanceMessage:"The website is under maintenance", back:"Back", contact:"Contact developers", messagePlaceholder:"Write your message", user:"User", status:"Status", actions:"Actions", banned:"Banned", active:"Active", branch:"Track", inboxNew:"New message" }
};
const t = (key) => words[currentLanguage][key] || key;
function applyLanguage(lang) {
 currentLanguage = lang; localStorage.setItem("siteLanguage", lang);
 document.documentElement.lang = lang; document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
 document.querySelectorAll("[data-i18n]").forEach(el => { const value = t(el.dataset.i18n); if (value) el.textContent = value; });
 document.querySelectorAll("[data-i18n-alt]").forEach(el => el.alt = t(el.dataset.i18nAlt));
 ui.language.textContent = lang === "ar" ? "EN" : "AR";
 if (ui.login && !ui.login.disabled) ui.buttonText.textContent = t("googleLogin");
}
ui.language.addEventListener("click", () => applyLanguage(currentLanguage === "ar" ? "en" : "ar"));
function setLoading(active) { ui.loading.hidden = !active; ui.login.disabled = active; ui.buttonText.textContent = active ? t("waiting") : t("googleLogin"); ui.loadingText.textContent = t("loading"); }
function say(text, type="error") { ui.message.textContent = text || ""; ui.message.style.color = type === "success" ? "#9bffc5" : "#ffd0d0"; }
function showPanel(markup) { document.querySelector("#dynamicPanel")?.remove(); const panel=document.createElement("section"); panel.id="dynamicPanel"; panel.className="dynamic-panel"; panel.innerHTML=markup; ui.card.append(panel); return panel; }
function safe(value="") { return String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
function isAdmin(user=currentUser) { return !!user && AUTHORIZED_ADMIN_UIDS.includes(user.uid); }

async function googleSignIn() {
  setLoading(true); say("");
  try {
    if (matchMedia("(max-width:768px), (pointer:coarse)").matches) await signInWithRedirect(auth, provider);
    else await signInWithPopup(auth, provider);
  } catch (err) { console.error(err); say(err.message || t("genericError")); setLoading(false); }
}
ui.login.addEventListener("click", () => { isDeveloperFlow=false; googleSignIn(); });
getRedirectResult(auth).catch(err => { console.error(err); say(t("genericError")); setLoading(false); });

function renderUsernameForm() {
 const p=showPanel(`<h2>${t("usernameTitle")}</h2><p>${t("usernameHint")}</p><input id="usernameInput" maxlength="24" placeholder="${t("usernamePlaceholder")}" autocomplete="off"><button class="primary-action" id="saveUsername">${t("saveUsername")}</button>`);
 p.querySelector("#saveUsername").onclick=saveUsername;
}
async function saveUsername() {
 const input=$("usernameInput"), username=input.value.trim();
 if (!/^[\p{L}\p{N}_.]{3,24}$/u.test(username)) return say(currentLanguage==="ar"?"اليوزر من 3 إلى 24 حرفًا، ويسمح بالحروف والأرقام و _ و .":"Use 3–24 letters, numbers, _ or .");
 const normalized=username.toLowerCase();
 try {
  await runTransaction(db, async tx => {
   const userRef=doc(db,"users",currentUser.uid), nameRef=doc(db,"usernames",normalized);
   const [userSnap,nameSnap]=await Promise.all([tx.get(userRef),tx.get(nameRef)]);
   if (nameSnap.exists() && nameSnap.data().uid !== currentUser.uid) throw new Error("USERNAME_TAKEN");
   if (userSnap.exists() && userSnap.data().username) throw new Error("USERNAME_LOCKED");
   tx.set(nameRef,{uid:currentUser.uid,username,createdAt:serverTimestamp()});
   tx.set(userRef,{uid:currentUser.uid,username,usernameLower:normalized,email:currentUser.email||"",displayName:currentUser.displayName||"",photoURL:currentUser.photoURL||"",banned:false,createdAt:serverTimestamp(),lastSeen:serverTimestamp()},{merge:true});
  });
  showUsernameConfirm(username);
 } catch(err) { console.error(err); if(err.message==="USERNAME_TAKEN") say(t("usernameTaken")); else say(err.message==="USERNAME_LOCKED"?t("usernameSaved"):t("genericError")); }
}
function showUsernameConfirm(username) {
 const p=showPanel(`<h2>${t("usernameSaved")}</h2><div class="username-display">@${safe(username)}</div><button class="secondary-action" id="copyUsername">${t("copy")}</button><button class="primary-action" id="confirmUsername">${t("confirm")}</button>`);
 p.querySelector("#copyUsername").onclick=()=>navigator.clipboard?.writeText(username).then(()=>say(currentLanguage==="ar"?"تم النسخ":"Copied","success"));
 p.querySelector("#confirmUsername").onclick=()=>renderStudentHome(username);
}
function renderStudentHome(username) {
 showPanel(`<div class="student-welcome"><div class="avatar-small">${safe((currentUser.displayName||"ط").slice(0,1))}</div><h2>${safe(username)}</h2><p>${t("underConstruction")}</p><button class="secondary-action" id="inboxButton">✉ ${t("inbox")} <i id="unreadDot" class="unread-dot" hidden></i></button><div id="studentInbox" hidden></div><div class="contact-area"><h3>${t("contact")}</h3><a href="https://wa.me/201225428692" target="_blank" rel="noopener">Ahmed.Mamdouh · 01225428692</a><a href="https://wa.me/201096106820" target="_blank" rel="noopener">Mohamed.Zayed · 01096106820</a></div></div>`);
 const btn=$("inboxButton"); btn.onclick=()=>toggleInbox(username);
}
async function toggleInbox(username) {
 const box=$("studentInbox"); box.hidden=!box.hidden; if(box.hidden)return;
 try { const snap=await getDocs(query(collection(db,"users",currentUser.uid,"inbox"),orderBy("createdAt","desc"),limit(30))); box.innerHTML=snap.empty?`<p>${t("noMessages")}</p>`:snap.docs.map(d=>`<article class="inbox-item"><strong>${safe(d.data().title||"رسالة من الإدارة")}</strong><p>${safe(d.data().body||"")}</p></article>`).join(""); $("unreadDot").hidden=true; } catch(e){console.error(e);box.textContent=t("genericError");}
}
function renderBranchChoice() {
 const p=showPanel(`<h2>${t("branchTitle")}</h2><div class="branch-grid"><button class="primary-action" id="science">${t("science")}</button><button class="primary-action" id="maths">${t("maths")}</button></div>`);
 p.querySelector("#science").onclick=()=>saveBranch("علمي علوم"); p.querySelector("#maths").onclick=()=>saveBranch("علمي رياضة");
}
async function saveBranch(branch) { await setDoc(doc(db,"admins",currentUser.uid),{branch,updatedAt:serverTimestamp()},{merge:true}); renderAdminDashboard(); }
function renderDeveloperGate() {
 const p=showPanel(`<h2>🔒 ${t("developer")}</h2><p>${t("developerHint")}</p><input id="developerName" placeholder="${t("developerPlaceholder")}" autocomplete="off"><button class="primary-action" id="developerContinue">${t("continueGoogle")}</button>`);
 p.querySelector("#developerContinue").onclick=async()=>{
  const name=p.querySelector("#developerName").value.trim();
  if(!DEVELOPER_NAMES.includes(name)) return say(t("developerDenied"));
  selectedDeveloperName=name; isDeveloperFlow=true; sessionStorage.setItem("developerFlow","1"); sessionStorage.setItem("developerName",name); await googleSignIn();
  if(currentUser && isAdmin(currentUser)) { sessionStorage.removeItem("developerFlow"); sessionStorage.removeItem("developerName"); isDeveloperFlow=false; const a=await getDoc(doc(db,"admins",currentUser.uid)); if(!a.exists()||!a.data().branch) renderBranchChoice(); else renderAdminDashboard(); }
 };
}
async function renderAdminDashboard() {
 const adminRef=doc(db,"admins",currentUser.uid), adminSnap=await getDoc(adminRef);
 if(!adminSnap.exists()||!adminSnap.data().branch) return renderBranchChoice();
 const p=showPanel(`<h2>${t("adminTitle")}</h2><div class="stats-row"><div><strong id="userCount">—</strong><span>${t("users")}</span></div><div><strong id="onlineCount">—</strong><span>${t("online")}</span></div></div><div class="admin-section"><label><input type="checkbox" id="maintenanceToggle"> ${t("maintenance")}</label><input id="maintenanceReason" placeholder="${t("maintenanceReason")}"><button class="secondary-action" id="saveMaintenance">${t("save")}</button></div><div class="admin-section"><h3>${t("broadcast")}</h3><textarea id="broadcastText" placeholder="${t("messagePlaceholder")}"></textarea><button class="primary-action" id="sendBroadcast">${t("send")}</button></div><div class="admin-section"><input id="userSearch" placeholder="${t("userSearch")}"><div id="usersList" class="users-list"></div></div>`);
 const settings=await getDoc(doc(db,"settings","global")); if(settings.exists()){ $("maintenanceToggle").checked=!!settings.data().maintenance; $("maintenanceReason").value=settings.data().reason||""; }
 $("saveMaintenance").onclick=async()=>{await setDoc(doc(db,"settings","global"),{maintenance:$("maintenanceToggle").checked,reason:$("maintenanceReason").value,updatedAt:serverTimestamp(),updatedBy:currentUser.uid},{merge:true});say(t("save"),"success");};
 $("sendBroadcast").onclick=sendBroadcast;
 $("userSearch").oninput=loadUsers;
 await loadUsers();
}
async function loadUsers() {
 const list=$("usersList"); if(!list)return;
 const snap=await getDocs(query(collection(db,"users"),orderBy("createdAt","desc"),limit(200)));
 const term=$("userSearch").value.trim().toLowerCase(); const users=snap.docs.map(d=>({id:d.id,...d.data()})).filter(u=>(u.username||"").toLowerCase().includes(term)||(u.email||"").toLowerCase().includes(term));
 $("userCount").textContent=snap.size;
 const online=users.filter(u=>u.lastSeen?.toDate && Date.now()-u.lastSeen.toDate().getTime()<120000).length; $("onlineCount").textContent=online;
 list.innerHTML=users.map(u=>`<article class="user-row"><div><strong>${safe(u.username||u.displayName||u.id)}</strong><small>${safe(u.email||"")}</small><small>${u.banned?t("banned"):t("active")}</small></div><div class="user-actions"><button data-action="username" data-id="${safe(u.id)}">${t("changeUsername")}</button><button data-action="ban" data-id="${safe(u.id)}">${u.banned?t("unban"):t("ban")}</button></div></article>`).join("")||`<p>${t("noMessages")}</p>`;
 list.querySelectorAll("button").forEach(b=>b.onclick=()=>manageUser(b.dataset.id,b.dataset.action,users));
}
async function manageUser(uid,action,users) {
 const u=users.find(x=>x.id===uid); if(!u)return;
 if(action==="ban") { await updateDoc(doc(db,"users",uid),{banned:!u.banned}); await loadUsers(); return; }
 const next=prompt(currentLanguage==="ar"?"اكتب اليوزر الجديد":"Enter the new username",u.username||""); if(!next)return;
 const normalized=next.trim().toLowerCase(); if(!/^[\p{L}\p{N}_.]{3,24}$/u.test(next.trim()))return alert(t("genericError"));
 await runTransaction(db,async tx=>{const newRef=doc(db,"usernames",normalized),oldRef=u.usernameLower?doc(db,"usernames",u.usernameLower):null;const taken=await tx.get(newRef);if(taken.exists()&&taken.data().uid!==uid)throw new Error("USERNAME_TAKEN");tx.set(newRef,{uid,username:next.trim()});if(oldRef&&u.usernameLower!==normalized)tx.delete(oldRef);tx.update(doc(db,"users",uid),{username:next.trim(),usernameLower:normalized});}); await loadUsers();
}
async function sendBroadcast() {
 const body=$("broadcastText").value.trim(); if(!body)return;
 const users=await getDocs(collection(db,"users"));
 await Promise.all(users.docs.map(u=>addDoc(collection(db,"users",u.id,"inbox"),{title:currentLanguage==="ar"?"رسالة من الإدارة":"Message from admin",body,createdAt:serverTimestamp(),read:false})));
 $("broadcastText").value="";say(t("send"),"success");
}
async function handleSignedIn(user) {
 currentUser=user; ui.login.hidden=true; ui.profile.hidden=false;
 ui.name.textContent=user.displayName||t("defaultUser");ui.email.textContent=user.email||"";ui.photo.src=user.photoURL||"https://www.gstatic.com/images/branding/product/1x/avatar_circle_blue_512dp.png";
 ui.photo.onerror=()=>{ui.photo.src="https://www.gstatic.com/images/branding/product/1x/avatar_circle_blue_512dp.png";};
 const userRef=doc(db,"users",user.uid); const snap=await getDoc(userRef);
 if(isDeveloperFlow) {
  if(!DEVELOPER_NAMES.includes(selectedDeveloperName) || !isAdmin(user)){say(t("developerDenied"));showPanel(`<p>${t("developerDenied")}</p>`);sessionStorage.removeItem("developerFlow");sessionStorage.removeItem("developerName");return;}
  sessionStorage.removeItem("developerFlow"); sessionStorage.removeItem("developerName");
  const adminSnap=await getDoc(doc(db,"admins",user.uid)); if(!adminSnap.exists()||!adminSnap.data().branch)renderBranchChoice();else renderAdminDashboard();return;
 }
 if(isAdmin(user)){renderStudentHome((await getDoc(userRef)).data()?.username || user.displayName || "Developer");return;}
 if(snap.exists()&&snap.data().banned){say(currentLanguage==="ar"?"تم إيقاف حسابك. تواصل مع الإدارة.":"Your account has been suspended.");return;}
 if(!snap.exists()||!snap.data().username){renderUsernameForm();return;}
 await updateDoc(userRef,{lastSeen:serverTimestamp()});
 const settings=await getDoc(doc(db,"settings","global"));
 if(settings.exists()&&settings.data().maintenance){showPanel(`<h2>${t("maintenanceMessage")}</h2><p>${safe(settings.data().reason||"")}</p>`);return;}
 renderStudentHome(snap.data().username);
}
onAuthStateChanged(auth,async user=>{
 setLoading(false);
 if(user){try{await handleSignedIn(user);}catch(e){console.error(e);say(t("genericError"));}}
 else {currentUser=null;ui.login.hidden=false;ui.profile.hidden=true;document.querySelector("#dynamicPanel")?.remove();}
});
ui.logout.addEventListener("click",async()=>{try{await signOut(auth);say(t("logoutSuccess"),"success");}catch(e){say(t("logoutError"));}});

// Lock button opens a developer-name gate; Google identity is verified separately.
const lock=document.createElement("button");lock.type="button";lock.id="developerLock";lock.className="developer-lock";lock.textContent="🔒";lock.title=t("developer");document.body.append(lock);lock.onclick=()=>{if(!currentUser){isDeveloperFlow=false;renderDeveloperGate();}else { renderDeveloperGate(); }};
applyLanguage(currentLanguage);
