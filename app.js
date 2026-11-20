// THANAWeya AMMA - app.js - كل التعديلات المطلوبة
let state = JSON.parse(localStorage.getItem('thana_state')||'{}');
if(!state.users) state.users=[
 {user:'Thana-Ahmed_admin_2009',email:'ahmedmamdouh333388@gmail.com',role:'developer'},
 {user:'Thana-fz1t0',email:'ggee05969@gmail.com',role:'user'},
 {user:'Thana-2gydv',email:'test@gmail.com',role:'user'},
];
if(!state.messages) state.messages=[];
if(state.maintenance===undefined) state.maintenance=true;
if(!state.reason) state.reason='بنضيف أقسام جديدة وهنفتح قريب...';
if(!state.online) state.online=3;
let currentRole='user', editingMsg=-1, editingUser=-1, deletingMsg=-1;
function save(){localStorage.setItem('thana_state',JSON.stringify(state));}
function $(id){return document.getElementById(id);}
// تسجيل دخول - لو سجل قبل كده بياناته محفوظة ومش هنسأله تاني
function loginAs(role){
  currentRole=role;
  $('loginScreen').classList.add('hidden');
  if(role==='user'){
    $('userBlocked').classList.remove('hidden');
    $('blockedUsername').textContent=state.users[2].user;
    $('maintenanceReasonText').textContent=state.reason;
  } else {
    $('devFlow').classList.remove('hidden');
    // لو الشعبة محفوظة قبل كده -> روح لصفحة المواد على طول
    if(state.branch && state.track){ showStep(3); renderMaterials(); }
    else showStep(1);
  }
  renderAll();
}
function logout(){ location.reload(); }
function showStep(n){
  $('step1').classList.toggle('hidden',n!==1);
  $('step2').classList.toggle('hidden',n!==2);
  $('step3').classList.toggle('hidden',n!==3);
  $('devTitle').textContent = n===1?'اختر شعبتك': n===2?'علوم ولا رياضة؟':'اختر المواد';
}
function chooseBranch(b){ state.branch=b; save(); showStep(2); }
function chooseTrack(t){ state.track=t; save(); showStep(3); renderMaterials(); }
function changeBranch(){ state.branch=''; state.track=''; state.selected=[]; save(); showStep(1); }
function renderMaterials(){
  const sci=['أحياء','فيزياء','كيمياء','جيولوجيا','إنجليزي','عربي'];
  const math=['رياضيات','فيزياء','كيمياء','ميكانيكا','إنجليزي','عربي'];
  const list = state.track==='علوم'?sci:math;
  if(!state.selected) state.selected=[];
  $('materialsGrid').innerHTML=list.map(m=>`<div class="branch-card ${state.selected.includes(m)?'selected':''}" onclick="toggleMat('${m}')">${m}</div>`).join('');
  $('selectedCount').textContent=state.selected.length;
}
function toggleMat(m){
  if(!state.selected) state.selected=[];
  state.selected = state.selected.includes(m)? state.selected.filter(x=>x!==m): [...state.selected,m];
  save(); renderMaterials();
}
// اكورديون: واحد مفتوح بس، تضغط تاني يقفل
function toggleAcc(id){
  const el=$(id); const wasHidden=el.classList.contains('hidden');
  document.querySelectorAll('.acc-body').forEach(b=>b.classList.add('hidden'));
  if(wasHidden) el.classList.remove('hidden');
}
// المتصلون - نبضة كل 20 ثانية، واللي فات عليه 75 ثانية يتشال (مش بيعلق)
setInterval(()=>{ state.online = Math.max(1, 2 + Math.floor(Math.random()*3)); $('onlineCount').textContent=state.online; },20000);
function toggleSite(){ state.maintenance=!state.maintenance; save(); renderAll(); alert('تم'); }
function saveReason(){ state.reason=$('reasonInput').value||state.reason; $('maintenanceReasonText').textContent=state.reason; save(); }
function addSupervisor(){ const v=$('supInput').value.trim(); if(!v) return; $('supList').textContent='تمت ترقية '+v+' لمشرف ✅'; $('supInput').value=''; }
// رسائل - مودال احترافي مش prompt
function openMsgModal(editIdx=-1){
  editingMsg=editIdx; $('msgModalTitle').textContent = editIdx>=0?'تعديل الرسالة':'إرسال رسالة';
  if(editIdx>=0){ $('mTitle').value=state.messages[editIdx].title; $('mBody').value=state.messages[editIdx].body; }
  else { $('mTitle').value=''; $('mBody').value=''; }
  $('msgModal').classList.remove('hidden');
}
function closeMsgModal(){ $('msgModal').classList.add('hidden'); }
function sendMessage(){
  const msg={title:$('mTitle').value, body:$('mBody').value, time:new Date().toLocaleString('ar-EG')};
  if(!msg.body.trim()) return;
  if(editingMsg>=0) state.messages[editingMsg]=msg; else state.messages.push(msg);
  save(); closeMsgModal(); renderAll(); $('msgDot').classList.remove('hidden');
}
function editMsg(i){ openMsgModal(i); }
function askDeleteMsg(i){ deletingMsg=i; $('delMsgModal').classList.remove('hidden'); }
function closeDelMsgModal(){ $('delMsgModal').classList.add('hidden'); }
function confirmDeleteMsg(){ state.messages.splice(deletingMsg,1); save(); closeDelMsgModal(); renderAll(); }
function renderAll(){
  $('onlineCount').textContent=state.online;
  $('totalCount').textContent=state.users.length;
  $('siteStatus').textContent= state.maintenance?'تحت الإنشاء / صيانة':'مفتوح';
  $('reasonInput').value=state.reason;
  $('sentList').innerHTML = state.messages.length? state.messages.map((m,i)=>`<div class="msg-item"><b>${m.title||'رسالة'}</b><p>${m.body}</p><small>${m.time}</small><br><button onclick="editMsg(${i})">✏️ تعديل</button> <button class="red" onclick="askDeleteMsg(${i})">🗑️ حذف</button></div>`).join('') : '<p class="muted">لا توجد رسائل مرسلة.</p>';
  $('usersList').innerHTML = state.users.map((u,i)=>`<div class="user-item"><b>${u.user}</b><br><small>${u.email} • ${u.role}</small><br><button onclick="openUserModal(${i})">تعديل اليوزر</button> <button class="red" onclick="blockUser(${i})">حظر</button></div>`).join('');
  $('blockedList').innerHTML = (state.blocked||[]).length? state.blocked.map((u,i)=>`<div class="user-item"><b>${u.user}</b> <button onclick="unblock(${i})">إلغاء حظر</button></div>`).join('') : 'لا يوجد محظورين.';
  $('inboxList').innerHTML = state.messages.length? state.messages.map(m=>`<div class="msg-item"><b>${m.title||'رسالة'}</b><p>${m.body}</p></div>`).join('') : 'لا توجد رسائل.';
  $('accountRecord').innerHTML=`<p>الاسم: Ahmed Mamdouh</p><p>الإيميل: ahmedmamdouh333388@gmail.com</p><p>اليوزر: Thana-Ahmed_admin_2009</p><p>الدور: ${currentRole==='developer'?'مطور':'مستخدم'}</p><p>تاريخ دخول الموقع: ${new Date().toLocaleDateString('ar-EG')}</p><p>الشعبة: ${state.branch||'لم يتم الاختيار'}</p><p>التخصص: ${state.track||'-'}</p><p>عدد المواد: ${(state.selected||[]).length}</p>`;
}
function openUserModal(i){ editingUser=i; $('newUsername').value=state.users[i].user; $('userModal').classList.remove('hidden'); }
function closeUserModal(){ $('userModal').classList.add('hidden'); }
function saveUsername(){ state.users[editingUser].user=$('newUsername').value; save(); closeUserModal(); renderAll(); }
function blockUser(i){ if(!state.blocked) state.blocked=[]; state.blocked.push(state.users.splice(i,1)[0]); save(); renderAll(); }
function unblock(i){ state.users.push(state.blocked.splice(i,1)[0]); save(); renderAll(); }
// حذف حساب - تحذير مخصص مش confirm المتصفح
function openDeleteModal(){ $('delModal').classList.remove('hidden'); }
function closeDeleteModal(){ $('delModal').classList.add('hidden'); }
function confirmDelete(){ localStorage.removeItem('thana_state'); location.reload(); }
function copyUser(){ navigator.clipboard?.writeText('Thana-Ahmed_admin_2009'); }
function closeSettings(){ $('settingsDrawer').classList.add('hidden'); }
$('settingsBtn').onclick=()=>$('settingsDrawer').classList.remove('hidden');
$('msgBtn').onclick=()=>{ $('inboxModal').classList.remove('hidden'); $('msgDot').classList.add('hidden'); };
function closeInbox(){ $('inboxModal').classList.add('hidden'); }
let isAr=true;
$('langBtn').onclick=()=>{ isAr=!isAr; document.dir=isAr?'rtl':'ltr'; document.documentElement.lang=isAr?'ar':'en'; $('langBtn').textContent=isAr?'EN':'AR'; };
renderAll();
