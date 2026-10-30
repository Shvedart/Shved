'use strict';

/* ============================== иконки ============================== */

const ICONS = {
  chevronLeft: `<svg viewBox="0 0 24 24" fill="none"><path d="M15 5l-7 7 7 7" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  heart: `<svg viewBox="0 0 24 24" fill="none"><path d="M21.428 7.463C22.581 10.019 21.953 13.04 19.883 14.904L12.01 21.992V22L12.006 21.996L12 22V21.992L4.12 14.903C2.047 13.04 1.419 10.018 2.57 7.461C4.239 3.761 8.979 2.843 11.869 5.608C11.913 5.65 11.956 5.692 11.999 5.736C12.042 5.692 12.085 5.65 12.129 5.608C15.019 2.844 19.76 3.762 21.428 7.463Z" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linejoin="round" stroke-linecap="round"/></svg>`,
  heartFilled: `<svg viewBox="0 0 24 24"><path d="M21.428 7.463C22.581 10.019 21.953 13.04 19.883 14.904L12.01 21.992V22L12.006 21.996L12 22V21.992L4.12 14.903C2.047 13.04 1.419 10.018 2.57 7.461C4.239 3.761 8.979 2.843 11.869 5.608C11.913 5.65 11.956 5.692 11.999 5.736C12.042 5.692 12.085 5.65 12.129 5.608C15.019 2.844 19.76 3.762 21.428 7.463Z" fill="currentColor"/></svg>`,
  crown: `<svg viewBox="0 0 16 16" fill="#333"><path d="M8.00065 2.0013L12.6012 12.668C12.3643 12.8753 12.0553 12.998 11.7233 12.998H8.00065H4.27669C3.67202 12.9979 3.14325 12.591 2.98828 12.0065L1 4.50781L5.71224 7.29753L5.7155 7.29883L7.99935 2.0013L8 2L8.00065 2.0013Z"/><path d="M13.0117 12.0065C12.9418 12.2702 12.795 12.4969 12.6003 12.6673L10.2852 7.29818L15 4.50781L13.0117 12.0065Z"/></svg>`,
  check: `<svg class="check" viewBox="0 0 16 16" fill="none"><path d="M3.5 8.5l3 3 6-7" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  bell: `<svg viewBox="0 0 24 24" fill="none"><path d="M12 3a5 5 0 0 0-5 5v3.2c0 .6-.2 1.1-.6 1.6L5 15h14l-1.4-2.2a2.6 2.6 0 0 1-.6-1.6V8a5 5 0 0 0-5-5z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M9.5 18a2.6 2.6 0 0 0 5 0" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`,
  coin: `<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" fill="#333" opacity="0.12"/><path d="M12 6.5v11M9 9.2c0-1 1.1-1.8 3-1.8s3 .8 3 1.8c0 2.4-6 1.2-6 3.7 0 1 1.1 1.9 3 1.9s3-.8 3-1.9" stroke="#333" stroke-width="1.6" stroke-linecap="round"/></svg>`,
  percent: `<svg viewBox="0 0 24 24" fill="none"><circle cx="7" cy="7" r="2.6" stroke="#333" stroke-width="2"/><circle cx="17" cy="17" r="2.6" stroke="#333" stroke-width="2"/><path d="M18 6L6 18" stroke="#333" stroke-width="2" stroke-linecap="round"/></svg>`,
  bigCheck: `<svg viewBox="0 0 24 24" fill="none"><path d="M5 12.5l4.5 4.5L19 7" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
};

/* ============================== данные ============================== */

const UNTIL_TEXT = 'На покупки онлайн до 6 ноября';

const CATEGORIES = [
  {
    id: 'food', label: 'Еда', type: 'list', nextLabel: 'Одежда',
    items: [
      { percent: '28%', name: 'Самокат в Городе', icon: 'assets/icons/food/0.png' },
      { percent: '40%', name: 'Лента Доставка', icon: 'assets/icons/food/1.png' },
      { percent: '12%', name: 'Яндекс Лавка', icon: 'assets/icons/food/2.png' },
      { percent: '300 ₽', name: 'ВкусВилл', icon: 'assets/icons/food/3.png' },
      { percent: 'до 53%', name: 'Пятёрочка', icon: 'assets/icons/food/4.png' },
      { percent: 'до 47%', name: 'Перекрёсток', icon: 'assets/icons/food/5.png' },
      { percent: 'до 32%', name: 'Магнит Доставка', icon: 'assets/icons/food/6.png' },
      { percent: '15%', name: 'METRO Online', icon: 'assets/icons/food/7.png' },
      { percent: '400 ₽', name: 'Купер', icon: 'assets/icons/food/8.png' },
      { percent: 'до 20%', name: 'Ашан', icon: 'assets/icons/food/9.png' },
      { percent: '+500 ₽', name: 'Гипер Лента', icon: 'assets/icons/food/10.png' },
    ],
  },
  {
    id: 'clothes', label: 'Одежда', type: 'list', nextLabel: 'Электроника',
    items: [
      { percent: '20%', name: 'Lamoda', icon: 'assets/icons/clothes/0.png' },
      { percent: '15%', name: 'NO ONE', icon: 'assets/icons/clothes/1.png' },
      { percent: '10%', name: 'Спортмастер', icon: 'assets/icons/clothes/2.png' },
      { percent: '7%', name: 'Детский мир', icon: 'assets/icons/clothes/3.png' },
      { percent: '10%', name: 'NO ONE', icon: 'assets/icons/clothes/4.png' },
      { percent: '30%', name: 'Шопинг в Городе', icon: 'assets/icons/clothes/5.png' },
      { percent: '30%', name: 'Одежда и обувь в Шопинге', icon: 'assets/icons/clothes/6.png' },
      { percent: '3%', name: 'Т-Банк Шоп', icon: 'assets/icons/clothes/7.png' },
    ],
  },
  {
    id: 'electronics', label: 'Электроника', type: 'list', nextLabel: 'Товары с кешбэком',
    items: [
      { percent: '5%', name: 'Ситилинк', icon: 'assets/icons/electronics/0.png' },
      { percent: '10%', name: 'М.Видео в Шопинге', icon: 'assets/icons/electronics/1.png' },
      { percent: '3%', name: 'restore:', icon: 'assets/icons/electronics/2.png' },
      { percent: '7%', name: 'AliExpress', icon: 'assets/icons/electronics/3.png' },
      { percent: '10%', name: 'Braun', icon: 'assets/icons/electronics/4.png' },
      { percent: 'до 10 000 ₽', name: 'Смартфоны в МегаФон', icon: 'assets/icons/electronics/5.png' },
      { percent: '4%', name: 'МегаФон', icon: 'assets/icons/electronics/6.png' },
    ],
  },
  {
    id: 'goods', label: 'Товары с кешбэком', type: 'grid', nextLabel: null,
    items: [
      { badge: '5%', name: 'Дрип-пакеты Tasty Coffee', icon: 'assets/goods/0.png' },
      { badge: '30%', name: 'Кофе Carte Noire', icon: 'assets/goods/1.png' },
      { badge: '30%', name: 'Hochland «Для кулинарии»', icon: 'assets/goods/2.png' },
      { badge: '30%', name: 'Hochland Grünländer «Классический»', icon: 'assets/goods/3.png' },
      { badge: 'до 50%', name: 'GOLD в Чижике', icon: 'assets/goods/4.png' },
      { badge: '5 000 ₽', name: 'Кофемашины Delonghi', icon: 'assets/goods/5.png' },
      { badge: '90%', name: 'Творожные сырки «Савушкин»', icon: 'assets/goods/6.png' },
      { badge: 'до 15%', name: 'PERFECT FIT™', icon: 'assets/goods/7.png' },
      { badge: 'до 35%', name: 'Bruto', icon: 'assets/goods/8.png' },
      { badge: '3 000 ₽', name: 'Кухонная машина от Kenwood', icon: 'assets/goods/9.png' },
    ],
  },
];

const PICKER_MAX = 4;
const PICKER_CATEGORIES = [
  { name: 'Жд билеты', icon: 'assets/icons/picker/0.png', percent: 15 },
  { name: 'Аптеки', icon: 'assets/icons/picker/1.png', percent: 10 },
  { name: 'Ремонт и стройка', icon: 'assets/icons/picker/2.png', percent: 12 },
  { name: 'Ювелирные украшения', icon: 'assets/icons/picker/3.png', percent: 8 },
  { name: 'Шопинг', icon: 'assets/icons/picker/4.png', percent: 10 },
  { name: 'Путешествия', icon: 'assets/icons/picker/5.png', percent: 20 },
  { name: 'Общественный транспорт', icon: 'assets/icons/picker/6.png', percent: 15 },
  { name: 'АЗС и авто', icon: 'assets/icons/picker/7.png', percent: 10 },
  { name: 'Рестораны', icon: 'assets/icons/picker/8.png', percent: 12 },
  { name: 'Красота', icon: 'assets/icons/picker/9.png', percent: 15 },
  { name: 'Дом и мебель', icon: 'assets/icons/picker/10.png', percent: 10 },
  { name: 'Одежда и обувь', icon: 'assets/icons/picker/11.png', percent: 10 },
  { name: 'Продукты', icon: 'assets/icons/picker/12.png', percent: 5 },
  { name: 'Автосервис', icon: 'assets/icons/picker/13.png', percent: 10 },
  { name: 'Развлечения', icon: 'assets/icons/picker/14.png', percent: 20 },
  { name: 'Детские товары', icon: 'assets/icons/picker/15.png', percent: 15 },
];
const OCT_AVATARS = ['assets/icons/avatars/0.png', 'assets/icons/avatars/1.png', 'assets/icons/avatars/2.png', 'assets/icons/avatars/3.png'];

/* ============================== утилиты ============================== */

function haptic(pattern) {
  try { if ('vibrate' in navigator) navigator.vibrate(pattern); } catch (e) { /* no-op */ }
}

function esc(str) {
  return str.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function triggerAnim(el) {
  if (!el) return;
  el.classList.remove('anim-in');
  void el.offsetWidth;
  el.classList.add('anim-in');
}

/* ============================== состояние ============================== */

const state = {
  step: 0,
  likes: [new Set(), new Set(), new Set(), new Set()],
  novemberChosen: false,
};

let pickerSelected = new Set();
let cashbackRoot = null;

function resetState() {
  state.step = 0;
  state.likes = [new Set(), new Set(), new Set(), new Set()];
  state.novemberChosen = false;
}

function totalLikedCount() {
  return state.likes.reduce((a, s) => a + s.size, 0);
}

/* ============================== стек экранов (push/pop как в iOS) ============================== */

const stackEl = document.getElementById('stack');
const screens = [];

function pushScreen(el) {
  const prev = screens[screens.length - 1];
  el.style.transition = 'none';
  el.style.transform = 'translateX(100%)';
  stackEl.appendChild(el);
  void el.offsetWidth;
  el.style.transition = '';
  if (prev) prev.el.classList.add('behind');

  requestAnimationFrame(() => {
    if (prev) prev.el.style.transform = 'translateX(-25%)';
    el.style.transform = 'translateX(0)';
  });

  screens.push({ el });
}

function popScreen() {
  if (screens.length <= 1) return;
  const top = screens.pop();
  const newTop = screens[screens.length - 1];

  requestAnimationFrame(() => {
    top.el.style.transform = 'translateX(100%)';
    newTop.el.style.transform = 'translateX(0)';
    newTop.el.classList.remove('behind');
  });

  const cleanup = (e) => {
    if (e.target !== top.el || e.propertyName !== 'transform') return;
    top.el.removeEventListener('transitionend', cleanup);
    top.el.remove();
  };
  top.el.addEventListener('transitionend', cleanup);
}

function popToRoot() {
  if (screens.length <= 1) return;
  while (screens.length > 2) {
    const mid = screens.splice(1, 1)[0];
    mid.el.remove();
  }
  const top = screens.pop();
  const bottom = screens[0];

  requestAnimationFrame(() => {
    top.el.style.transform = 'translateX(100%)';
    bottom.el.style.transform = 'translateX(0)';
    bottom.el.classList.remove('behind');
  });

  const cleanup = (e) => {
    if (e.target !== top.el || e.propertyName !== 'transform') return;
    top.el.removeEventListener('transitionend', cleanup);
    top.el.remove();
  };
  top.el.addEventListener('transitionend', cleanup);
}

/* ============================== старт-экран ============================== */

function buildStartScreen() {
  const el = document.createElement('div');
  el.className = 'screen screen-start';
  el.innerHTML = `
    <div class="dim"></div>
    <div class="start-badge">${ICONS.percent}</div>
    <button class="btn-start" id="startBtn">Кэшбэки и бонусы</button>
  `;
  el.querySelector('#startBtn').addEventListener('click', () => {
    haptic(10);
    openCashbackScreen();
  });
  return el;
}

/* ============================== экран категорий кэшбэка ============================== */

function buildCashbackScreen() {
  const el = document.createElement('div');
  el.className = 'screen screen-cashback';
  el.innerHTML = `
    <div class="dim"></div>
    <div class="scroll" id="cbScroll">
      <div class="navbar">
        <button class="glass-pill nav-back" id="cbBack" aria-label="Назад">${ICONS.chevronLeft}</button>
        <div class="progress-track"><div class="progress-fill" id="progressFill"></div></div>
        <button class="glass-pill nav-heart" id="navHeart" aria-label="Избранное">${ICONS.heartFilled}</button>
      </div>
      <div class="tiles-row">
        <div class="tile" id="tileNovember">
          <div class="tile-top">
            <div class="tile-label">Повышенный кэшбэк в ноябре</div>
            <div class="tile-badge" id="novBadge">1</div>
          </div>
          <button class="tile-pick-btn" id="novPickBtn">Выбрать</button>
        </div>
        <div class="tile">
          <div class="tile-label">Повышенный кэшбэк в октябре</div>
          <div class="avatars" id="octAvatars"></div>
        </div>
      </div>
      <div class="headline-block">
        <div class="headline">До хуя кэшбэка,<br>отметь, что нравится</div>
        <div class="headline-sub">В конце подарим +500 бонусов</div>
      </div>
      <div class="chips-sticky-wrap"><div class="chips-row" id="chipsRow"></div></div>
      <div class="offers-wrap" id="offersWrap"></div>
      <div class="scroll-bottom-spacer"></div>
    </div>
    <div class="bottom-fixed">
      <button class="btn-primary" id="nextBtn"></button>
      <div class="bottom-caption">${ICONS.heartFilled}<span class="bottom-caption-text-wrap" id="bottomCaptionWrap"><span class="bottom-caption-text" id="bottomCaptionText">Можно выбрать без ограничений</span></span></div>
    </div>
  `;
  return el;
}

function renderNovTile(root) {
  const badge = root.querySelector('#novBadge');
  const btn = root.querySelector('#novPickBtn');
  if (state.novemberChosen) {
    badge.classList.add('hidden');
    btn.textContent = 'Изменить';
  } else {
    badge.classList.remove('hidden');
    btn.textContent = 'Выбрать';
  }
}

function buildOctAvatars(root) {
  const wrap = root.querySelector('#octAvatars');
  wrap.innerHTML = OCT_AVATARS.map((src, i) =>
    `<img class="avatar" style="z-index:${4 - i}" src="${src}" alt="">`
  ).join('');
}

function offerListItemHTML(stepIndex, i, it) {
  return `
    <div class="offer-item">
      <div class="offer-item-main">
        <img class="offer-icon" src="${it.icon}" alt="" loading="lazy">
        <div class="offer-info">
          <div class="offer-top-line">
            <span class="offer-percent">${esc(it.percent)}</span>
            <span class="offer-dot">•</span>
            <span class="offer-name">${esc(it.name)}</span>
          </div>
          <div class="offer-until">${UNTIL_TEXT}</div>
        </div>
      </div>
      <button class="heart-btn" data-idx="${i}" aria-label="Нравится">${ICONS.heart}</button>
    </div>
  `;
}

function offerCardHTML(stepIndex, i, it) {
  return `
    <div class="offer-card">
      <div class="offer-card-image">
        <img src="${it.icon}" alt="" loading="lazy">
        <button class="heart-btn" data-idx="${i}" aria-label="Нравится">${ICONS.heart}</button>
      </div>
      <div class="offer-card-info">
        <div class="offer-card-price-row">
          <span class="offer-card-cashback-label">Кэшбэк</span>
          <span class="cashback-pill-wrap">
            <span class="cashback-pill">
              <span class="cashback-pill-icon">${ICONS.crown}</span>
              <span class="cashback-pill-label">${esc(it.badge)}</span>
            </span>
          </span>
        </div>
        <div class="offer-card-name">${esc(it.name)}</div>
      </div>
    </div>
  `;
}

function renderOffers(root, stepIndex, animate) {
  const wrap = root.querySelector('#offersWrap');
  const cat = CATEGORIES[stepIndex];

  if (cat.type === 'list') {
    wrap.innerHTML = `<div class="offer-list">${cat.items.map((it, i) => offerListItemHTML(stepIndex, i, it)).join('')}</div>`;
  } else {
    wrap.innerHTML = `<div class="offer-grid">${cat.items.map((it, i) => offerCardHTML(stepIndex, i, it)).join('')}</div>`;
  }

  wrap.querySelectorAll('.heart-btn').forEach((btn) => {
    const idx = parseInt(btn.dataset.idx, 10);
    if (state.likes[stepIndex].has(idx)) btn.classList.add('liked');
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleLike(root, stepIndex, idx, btn);
    });
  });

  if (animate) triggerAnim(wrap);
}

function toggleLike(root, stepIndex, idx, btn) {
  const set = state.likes[stepIndex];
  const wasLiked = set.has(idx);
  if (wasLiked) {
    set.delete(idx);
    btn.classList.remove('liked');
    haptic(8);
  } else {
    set.add(idx);
    btn.classList.add('liked');
    btn.classList.remove('pop');
    void btn.offsetWidth;
    btn.classList.add('pop');
    haptic([10, 20, 10]);
    flashNavHeart(root);
  }
}

let navHeartFlashTimer = null;

function flashNavHeart(root) {
  const navHeart = root.querySelector('#navHeart');
  clearTimeout(navHeartFlashTimer);
  navHeart.classList.remove('pulse');
  void navHeart.offsetWidth;
  navHeart.classList.add('liked', 'pulse');
  navHeartFlashTimer = setTimeout(() => {
    navHeart.classList.remove('liked', 'pulse');
  }, 1000);
}

function jitterHearts(root) {
  const hearts = root.querySelectorAll('#offersWrap .heart-btn');
  hearts.forEach((h, i) => {
    setTimeout(() => {
      h.classList.remove('jitter');
      void h.offsetWidth;
      h.classList.add('jitter');
      setTimeout(() => h.classList.remove('jitter'), 500);
    }, i * 70);
  });
}

function buildChipsRow(root) {
  const row = root.querySelector('#chipsRow');
  row.innerHTML = CATEGORIES.map((c, i) =>
    `<button class="chip${i === state.step ? ' active' : ''}" data-step="${i}">${esc(c.label)}</button>`
  ).join('');
  row.querySelectorAll('.chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      haptic(8);
      const idx = parseInt(chip.dataset.step, 10);
      if (idx === state.step) return;
      state.step = idx;
      advanceToStep(root);
    });
  });
}

function updateChipsActive(root) {
  root.querySelectorAll('.chip').forEach((c) => {
    c.classList.toggle('active', parseInt(c.dataset.step, 10) === state.step);
  });
}

function scrollActiveChipIntoView(root) {
  const active = root.querySelector('.chip.active');
  if (active) active.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
}

function updateProgress(root) {
  root.querySelector('#progressFill').style.width = (((state.step + 1) / CATEGORIES.length) * 100) + '%';
}

function updateNextBtn(root) {
  const btn = root.querySelector('#nextBtn');
  const cat = CATEGORIES[state.step];
  btn.textContent = cat.nextLabel ? ('Дальше ' + cat.nextLabel) : 'Забрать награду';
}

const STEP_CAPTIONS = [
  'Можно выбрать без ограничений',
  'Отличное начало, двигаемся дальше',
  'Ещё немного — ты почти у цели',
  'Совсем чуть-чуть — подарок уже твой',
];

function updateBottomCaption(root, animate) {
  const wrap = root.querySelector('#bottomCaptionWrap');
  const newText = STEP_CAPTIONS[state.step] || STEP_CAPTIONS[STEP_CAPTIONS.length - 1];
  const existing = wrap.querySelectorAll('.bottom-caption-text');
  const old = existing[existing.length - 1];

  if (!animate || !old) {
    wrap.innerHTML = `<span class="bottom-caption-text" id="bottomCaptionText">${esc(newText)}</span>`;
    wrap.style.width = '';
    return;
  }
  if (old.textContent === newText) return;

  // drop any stale, already-finished exit spans left over from a previous transition
  for (let i = 0; i < existing.length - 1; i++) existing[i].remove();

  const probe = document.createElement('span');
  probe.className = 'bottom-caption-text';
  probe.style.visibility = 'hidden';
  probe.style.position = 'absolute';
  probe.textContent = newText;
  wrap.appendChild(probe);
  wrap.style.width = Math.max(old.offsetWidth, probe.offsetWidth) + 'px';
  probe.remove();

  old.removeAttribute('id');
  old.classList.remove('slide-in-up');
  old.classList.add('slide-out-up');
  old.addEventListener('animationend', () => old.remove(), { once: true });

  const next = document.createElement('span');
  next.className = 'bottom-caption-text slide-in-up';
  next.id = 'bottomCaptionText';
  next.textContent = newText;
  wrap.appendChild(next);
}

function advanceToStep(root) {
  updateProgress(root);
  updateChipsActive(root);
  scrollActiveChipIntoView(root);
  renderOffers(root, state.step, true);
  updateNextBtn(root);
  updateBottomCaption(root, true);
}

function onNextClick(root) {
  const likedCount = state.likes[state.step].size;

  if (likedCount === 0) {
    haptic([15, 40, 15]);
    jitterHearts(root);
    return;
  }

  haptic(10);
  if (state.step < CATEGORIES.length - 1) {
    state.step++;
    advanceToStep(root);
  } else {
    openSuccessScreen();
  }
}

function setupNavbarScrollBg(root) {
  const scrollEl = root.querySelector('#cbScroll');
  const navbar = root.querySelector('.navbar');
  const chipsWrap = root.querySelector('.chips-sticky-wrap');
  function update() {
    const stuck = chipsWrap.getBoundingClientRect().top <= navbar.getBoundingClientRect().bottom;
    navbar.classList.toggle('solid', stuck);
  }
  scrollEl.addEventListener('scroll', update, { passive: true });
  update();
}

function mountCashbackScreen(root) {
  cashbackRoot = root;

  buildChipsRow(root);
  renderNovTile(root);
  buildOctAvatars(root);
  updateProgress(root);
  updateNextBtn(root);
  updateBottomCaption(root);
  renderOffers(root, state.step, false);
  setupNavbarScrollBg(root);

  root.querySelectorAll('.tile').forEach((t, i) => {
    setTimeout(() => t.classList.add('anim-in'), i * 40);
  });
  setTimeout(() => root.querySelector('.headline-block').classList.add('anim-in'), 110);
  setTimeout(() => root.querySelector('.chips-row').classList.add('anim-in'), 190);
  setTimeout(() => root.querySelector('#offersWrap').classList.add('anim-in'), 260);

  setTimeout(() => jitterHearts(root), 2000);

  root.querySelector('#cbBack').addEventListener('click', () => {
    haptic(8);
    popScreen();
  });
  root.querySelector('#navHeart').addEventListener('click', () => haptic(8));
  root.querySelector('#novPickBtn').addEventListener('click', (e) => {
    e.stopPropagation();
    haptic(10);
    openPickerScreen();
  });
  root.querySelector('#nextBtn').addEventListener('click', () => onNextClick(root));
}

function openCashbackScreen() {
  resetState();
  const el = buildCashbackScreen();
  pushScreen(el);
  mountCashbackScreen(el);
}

/* ============================== экран выбора кэшбэка на ноябрь ============================== */

function buildPickerScreen() {
  const el = document.createElement('div');
  el.className = 'screen screen-picker';
  el.innerHTML = `
    <div class="dim"></div>
    <div class="picker-header">
      <button class="glass-pill" id="pickBack" aria-label="Назад">${ICONS.chevronLeft}</button>
      <div class="picker-header-title">Кэшбэк на ноябрь</div>
    </div>
    <div class="picker-scroll">
      <div class="picker-title">Выбери категории<br>с доп. кэшбэком</div>
      <div class="picker-sub">Можно выбрать до ${PICKER_MAX} категорий — кэшбэк по ним будет повышен весь ноябрь</div>
      <div class="picker-list" id="pickerGrid"></div>
    </div>
    <div class="bottom-fixed">
      <button class="btn-primary" id="pickerDone">Выбрать</button>
    </div>
  `;
  return el;
}

function updatePickerDoneState(root) {
  root.querySelector('#pickerDone').classList.toggle('disabled', pickerSelected.size === 0);
}

function updatePickerCap(root) {
  const atMax = pickerSelected.size >= PICKER_MAX;
  root.querySelectorAll('.picker-list-item').forEach((item) => {
    const i = parseInt(item.dataset.i, 10);
    item.classList.toggle('disabled', atMax && !pickerSelected.has(i));
  });
}

function mountPickerScreen(root) {
  const grid = root.querySelector('#pickerGrid');
  grid.innerHTML = PICKER_CATEGORIES.map((cat, i) => `
    <button class="picker-list-item" data-i="${i}">
      <img class="picker-item-icon" src="${cat.icon}" alt="" loading="lazy">
      <span class="picker-item-label"><b>${cat.percent}%</b> ${esc(cat.name)}</span>
      <span class="picker-checkbox">${ICONS.check}</span>
    </button>
  `).join('');

  grid.querySelectorAll('.picker-list-item').forEach((item) => {
    item.addEventListener('click', () => {
      if (item.classList.contains('disabled')) return;
      const i = parseInt(item.dataset.i, 10);
      if (pickerSelected.has(i)) {
        pickerSelected.delete(i);
        item.classList.remove('selected');
        haptic(8);
      } else {
        if (pickerSelected.size >= PICKER_MAX) return;
        pickerSelected.add(i);
        item.classList.add('selected');
        haptic([10, 20, 10]);
      }
      updatePickerCap(root);
      updatePickerDoneState(root);
    });
  });

  updatePickerCap(root);
  updatePickerDoneState(root);

  root.querySelector('#pickBack').addEventListener('click', () => {
    haptic(8);
    popScreen();
  });

  root.querySelector('#pickerDone').addEventListener('click', () => {
    if (pickerSelected.size === 0) return;
    haptic([10, 30, 10]);
    state.novemberChosen = true;
    if (cashbackRoot) renderNovTile(cashbackRoot);
    popScreen();
  });
}

function openPickerScreen() {
  pickerSelected = new Set();
  const el = buildPickerScreen();
  pushScreen(el);
  mountPickerScreen(el);
}

/* ============================== success-экран ============================== */

function buildSuccessScreen() {
  const reminderNeeded = !state.novemberChosen;
  const el = document.createElement('div');
  el.className = 'screen screen-success';
  el.innerHTML = `
    <div class="dim"></div>
    <div class="success-scroll">
      <div class="success-ring">${ICONS.bigCheck}</div>
      <div class="success-title">Готово!</div>
      <div class="success-points">${ICONS.coin}<span>+500 баллов кэшбэка</span></div>
      <div class="success-sub">Баллы уже зачислены на счёт. Выбранные категории можно поменять в любой момент.</div>
      ${reminderNeeded ? `
      <div class="reminder-card">
        <div class="reminder-title">${ICONS.bell}<span>Не забудь про ноябрь</span></div>
        <div class="reminder-text">Ты ещё не выбрал повышенный кэшбэк на ноябрь — успей сделать это, пока категории доступны.</div>
        <button class="reminder-btn" id="reminderBtn">Выбрать сейчас</button>
      </div>` : ''}
    </div>
    <div class="success-bottom">
      <button class="btn-primary" id="successDone">Готово</button>
    </div>
  `;
  return el;
}

function mountSuccessScreen(root) {
  haptic([10, 50, 10, 50, 20]);

  const reminderBtn = root.querySelector('#reminderBtn');
  if (reminderBtn) {
    reminderBtn.addEventListener('click', () => {
      haptic(10);
      openPickerScreen();
    });
  }

  root.querySelector('#successDone').addEventListener('click', () => {
    haptic(10);
    popToRoot();
  });
}

function openSuccessScreen() {
  const el = buildSuccessScreen();
  pushScreen(el);
  mountSuccessScreen(el);
}

/* ============================== инициализация ============================== */

function init() {
  const start = buildStartScreen();
  stackEl.appendChild(start);
  screens.push({ el: start });
}

init();
