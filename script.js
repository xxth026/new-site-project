const app = document.getElementById('app');
const STORAGE = 'tasks-app-state-v1';
const defaultOperations = [
  { amount: -6300, date: '16 июня 2025' },
  { amount: -5100, date: '15 июня 2025' },
  { amount: -7000, date: '14 июня 2025' },
  { amount: -4300, date: '13 июня 2025' },
  { amount: -5300, date: '12 июня 2025' },
];
let state = loadState();
let input = '';
let holdTimer = null;
let holdDone = false;
function loadState(){
  try{
    const saved = JSON.parse(localStorage.getItem(STORAGE));
    if(saved) return saved;
  }catch(e){}
  return { nickname:'@poloten4ik', balance:3200, operations:defaultOperations };
}
function saveState(){ localStorage.setItem(STORAGE, JSON.stringify(state)); }
function go(path){ history.pushState({},'',path); render(); }
function rub(n){ return `${n} ₽`; }
function opRub(n){ return `${n < 0 ? '-' : ''}${Math.abs(n)}₽`; }
const months = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
const monthNames = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
function dateRu(d){ return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`; }
function weekDays(){
  const now = new Date();
  const day = (now.getDay()+6)%7;
  const monday = new Date(now); monday.setDate(now.getDate()-day);
  const labels = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];
  return labels.map((label,i)=>{ const d = new Date(monday); d.setDate(monday.getDate()+i); return {label, num:d.getDate(), today:i===day}; });
}
function hero(){ return `<img class="hero" src="assets/hero.png" alt="avatar">`; }
function nav(active='home'){
  return `<nav class="bottom-nav">
    <button class="nav-item ${active==='home'?'active':''}" onclick="go('/1')">⌂</button>
    <button class="nav-item ${active==='tasks'?'active':''}" onclick="go('/3')">▤</button>
    <button class="nav-item">♧</button>
    <button class="nav-item">♡</button>
  </nav>`;
}
function nicknameBlock(){
  return `<div class="nickname-row">
    <span class="nickname" contenteditable="true" spellcheck="false" onblur="updateNick(this.textContent)">${state.nickname}</span>
    <button class="nickname-edit" onclick="focusNick()" aria-label="edit nickname"></button>
  </div>`;
}
function updateNick(v){ state.nickname = (v.trim() || '@poloten4ik'); saveState(); }
function focusNick(){ const n=document.querySelector('.nickname'); if(n){n.focus(); const r=document.createRange(); r.selectNodeContents(n); r.collapse(false); const s=window.getSelection(); s.removeAllRanges(); s.addRange(r);} }
const tasks = [
  ['Яндекс Карта','Написать отзыв о магазине цветов',300],
  ['Капс','Написать расшифровку 10 капсов',400],
  ['Нейросеть','Создать обложку для книги с помощью нейросети',500],
  ['Капс','Сделать 3 фотографии переходных переходов',400],
];
function renderCards(){
  return tasks.map(t=>`<article class="task-card-small"><h3>${t[0]}</h3><p>${t[1]}</p><div class="price">${t[2]}₽</div><button class="round-arrow">→</button></article>`).join('');
}
function renderMain(){
  app.innerHTML = `<section class="page page-main">
    <div class="decor light big-left"></div><div class="decor light dot-left"></div><div class="decor dark big-right"></div><div class="decor dark dot-bottom"></div>
    <header class="top"><button class="menu"><span></span><span></span></button>${hero()}</header>
    ${nicknameBlock()}<div class="subtitle">Доступны новые задания!</div>
    <div class="balance-block"><div class="balance-label">ВАШ БАЛАНС</div><div class="balance-amount">${rub(state.balance)}</div><button class="primary-btn withdraw-btn" onclick="go('/2')"><span>вывести</span></button></div>
    <h2 class="section-title">Задания на день</h2><div class="section-desc">Начисления за задания проходит<br>в течение 15 минут</div>
    <div class="cards-scroller">${renderCards()}</div>
    <button class="primary-btn more-btn" onclick="go('/3')"><span>перейти к остальным<br>заданиям</span></button>
    ${nav('home')}
  </section>`;
}
function addDigit(d){ if(input.length<8){ input += String(d); renderWithdraw(); } }
function showLoader(){
  const o=document.createElement('div'); o.className='loader-overlay'; o.innerHTML='<div class="loader"></div>'; document.body.appendChild(o); return o;
}
function processWithdraw(isAdd=false){
  const value = Math.floor(Number(input)||0); if(!value) return;
  const overlay = showLoader();
  setTimeout(()=>{
    state.balance = isAdd ? state.balance + value : state.balance - value;
    state.operations.unshift({ amount: isAdd ? value : -value, date: dateRu(new Date()) });
    state.operations = state.operations.slice(0,5); input=''; saveState(); overlay.remove(); renderWithdraw();
  },3000);
}
function renderWithdraw(){
  app.innerHTML = `<section class="page page-withdraw">
    <div class="decor light big-left" style="top:355px"></div><div class="decor light dot-left" style="top:350px"></div><div class="decor dark big-right"></div>
    <header class="top"><button class="back" onclick="go('/1')">←</button>${hero()}</header>
    ${nicknameBlock()}
    <h2 class="input-title">ВВЕДИТЕ СУММУ</h2>
    <div class="amount-display ${input?'has-value':''}">${input || 'не менее 1000₽'}</div>
    <div class="numpad">${[1,2,3,4,5,6,7,8,9].map(n=>`<button class="digit" onclick="addDigit(${n})">${n}</button>`).join('')}<button class="digit zero" onclick="addDigit(0)">0</button></div>
    <button class="primary-btn more-btn" id="withdrawButton"><span>ВЫВЕСТИ</span></button>
    <div class="cards-mini"><div class="pill-card">карта*4950</div><div class="pill-card">Добавить карту</div></div>
    <h2 class="operations-title">Операции</h2>
    ${state.operations.map(op=>`<div class="operation"><div><div class="operation-date">${op.date}</div><div class="operation-amount">${opRub(op.amount)}</div></div><div class="operation-card">карта*4950</div></div>`).join('')}
    <div class="empty-bottom"></div>
  </section>`;
  const btn=document.getElementById('withdrawButton');
  btn.addEventListener('pointerdown',()=>{ holdDone=false; holdTimer=setTimeout(()=>{holdDone=true; processWithdraw(true)},750); });
  ['pointerup','pointerleave','pointercancel'].forEach(ev=>btn.addEventListener(ev,()=>{ if(holdTimer) clearTimeout(holdTimer); }));
  btn.addEventListener('click',(e)=>{ e.preventDefault(); if(!holdDone) processWithdraw(false); });
}
const taskRows = [
 ['Яндекс Карта','Написать отзыв о ресторане',300],['Капс','Сделать 5 фотографий переходных переходов',400],['Капс','Написать расшифровку капса',300],['Текст','Написать пост о знаках зодиака',700],['Яндекс Карта','Написать отзыв о магазине цветов',300],['Текст','Написать отрывок из книги',700]
];
function renderTasks(){
  const now=new Date(); const days=weekDays();
  app.innerHTML = `<section class="page page-tasks">
    <div class="decor light big-left" style="top:395px"></div><div class="decor light dot-left" style="top:382px"></div><div class="decor dark big-right" style="bottom:300px"></div>
    <header class="top"><button class="back" onclick="go('/1')">←</button>${hero()}</header>
    <h1 class="month-title">${monthNames[now.getMonth()]} ${now.getFullYear()}</h1>
    <div class="week-strip">${days.map(d=>`<div class="day ${d.today?'today':''}">${d.label}<span>${d.num}</span></div>`).join('')}</div>
    <h2 class="tasks-list-title">Задания на день</h2>
    ${taskRows.map(t=>`<article class="task-row"><h3>${t[0]}</h3><p>${t[1]}</p><div class="price">${t[2]}₽</div><button class="go">→</button></article>`).join('')}
  </section>`;
}
function renderLanding() {
  app.innerHTML = `
    <div class="screen landing">
      <div class="decor decor-left"></div>
      <div class="decor-dot dot-left"></div>
      <div class="decor decor-right"></div>
      <div class="decor-dot dot-right"></div>

      <div class="landing-logo-wrap">
        <img src="assets/zyabrik-logo.png" class="landing-logo" />
        <div class="landing-title">Zyabrik</div>
      </div>

      <div class="landing-loading">
        <div class="loading-text">Загрузка</div>
        <div class="landing-spinner"></div>
      </div>

      <div class="landing-content">
        <div class="landing-info">
          Чтобы начать работу,<br>
          перейдите в бот для<br>
          регистрации и получите<br>
          первые 3.000 на баланс<br>
          для вывода
        </div>

        <a class="landing-button" href="https://t.me/zyabrik_bot">
          Зарегистрироваться
        </a>
      </div>
    </div>
  `;

  setTimeout(() => {
    const landing = document.querySelector(".landing");
    if (landing) landing.classList.add("loaded");
  }, 4000);
}
function render() {
  const p = location.pathname;

  if (p === "/") return renderLanding();
  if (p === "/1") return renderMain();
  if (p === "/2") return renderWithdraw();
  if (p === "/3") return renderTasks();

  history.replaceState({}, "", "/");
  renderLanding();
}
