'use strict';

/* ============ иконки табов (в духе SF Symbols) ============ */

const ICONS = {
  home: `<svg viewBox="0 0 24 24"><path d="M3 11.5L12 4l9 7.5"/><path d="M5.5 10v9a1 1 0 0 0 1 1H9.5v-5.5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1V20h3a1 1 0 0 0 1-1v-9"/></svg>`,
  catalog: `<svg viewBox="0 0 24 24"><rect x="3.5" y="3.5" width="7" height="7" rx="1.6"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.6"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.6"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.6"/></svg>`,
  favorites: `<svg viewBox="0 0 24 24"><path d="M12 20.3S3.8 15.3 3.8 9.8C3.8 6.6 6 4.5 8.7 4.5c1.9 0 3.4 1.1 3.3 3-.1-1.9 1.4-3 3.3-3 2.7 0 4.9 2.1 4.9 5.3 0 5.5-8.2 10.5-8.2 10.5z"/></svg>`,
  orders: `<svg viewBox="0 0 24 24"><path d="M9 8.3V6.6a3 3 0 0 1 6 0V8.3"/><path d="M5.8 8.3h12.4l-1.1 11a1.6 1.6 0 0 1-1.6 1.4H8.5a1.6 1.6 0 0 1-1.6-1.4l-1.1-11z"/></svg>`,
  profile: `<svg viewBox="0 0 24 24"><circle cx="12" cy="8.3" r="3.6"/><path d="M4.5 20c1.3-4 4-6 7.5-6s6.2 2 7.5 6"/></svg>`,
};

const TABS = [
  { id: 'home', label: 'Главная', icon: ICONS.home },
  { id: 'catalog', label: 'Каталог', icon: ICONS.catalog },
  { id: 'favorites', label: 'Избранное', icon: ICONS.favorites },
  { id: 'orders', label: 'Заказы', icon: ICONS.orders },
  { id: 'profile', label: 'Профиль', icon: ICONS.profile },
];
const DEFAULT_TAB = TABS[0].id;
const TAB_IDS = new Set(TABS.map((t) => t.id));

/* Базовый путь страницы на GitHub Pages (/tabbar),
   чтобы роутинг не уезжал в корень сайта. */
const BASE = (() => {
  const parts = location.pathname.split('/').filter(Boolean);
  let i = parts.length;
  while (i > 0 && /^\d+$/.test(parts[i - 1])) i--;
  if (i > 0 && TAB_IDS.has(parts[i - 1])) i--;
  // index.html в конце пути тоже отбрасываем
  if (i > 0 && parts[i - 1] === 'index.html') i--;
  return i > 0 ? '/' + parts.slice(0, i).join('/') : '';
})();

/* ============ состояние ============ */

const tabStacks = {};      // tabId -> [{ segs, el }, ...]
const tabContainers = {};  // tabId -> DOM-контейнер стека
let activeTabId = null;

/* ============ утилиты роутинга ============ */

function stripBase(pathname) {
  if (BASE && pathname.startsWith(BASE)) {
    return pathname.slice(BASE.length) || '/';
  }
  return pathname;
}

function parsePath(pathname) {
  const parts = stripBase(pathname).split('/').filter(Boolean);
  let tabId = parts[0];
  if (!TAB_IDS.has(tabId)) tabId = DEFAULT_TAB;
  const segs = parts
    .slice(1)
    .map((v) => parseInt(v, 10))
    .filter((n) => !Number.isNaN(n));
  return { tabId, segs };
}

function pathFor(tabId, segs) {
  return BASE + '/' + [tabId, ...segs].join('/');
}

function segsEqual(a, b) {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

function isPrefix(short, long) {
  return short.length <= long.length && short.every((v, i) => v === long[i]);
}

function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h;
}

function tileHue(seed, i) {
  return (Math.abs(hashStr(seed)) + i * 61) % 360;
}

/* ============ построение экрана ============ */

function createScreenEl(tabId, segs) {
  const tab = TABS.find((t) => t.id === tabId);
  const isRoot = segs.length === 0;
  const title = isRoot ? tab.label : `Плитка ${segs[segs.length - 1] + 1}`;

  const el = document.createElement('div');
  el.className = 'screen';

  const dim = document.createElement('div');
  dim.className = 'dim';
  el.appendChild(dim);

  const navbar = document.createElement('div');
  navbar.className = 'screen-navbar';
  if (!isRoot) {
    const back = document.createElement('button');
    back.className = 'navbar-back';
    back.innerHTML =
      '<svg viewBox="0 0 12 20"><path d="M10 1L2 10l8 9" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg><span>Назад</span>';
    back.addEventListener('click', () => history.back());
    navbar.appendChild(back);
  }
  const titleEl = document.createElement('div');
  titleEl.className = 'navbar-title';
  titleEl.textContent = title;
  navbar.appendChild(titleEl);
  el.appendChild(navbar);

  const content = document.createElement('div');
  content.className = 'screen-content';

  const heading = document.createElement('div');
  heading.className = 'page-heading';
  heading.textContent = title;
  content.appendChild(heading);

  const sub = document.createElement('div');
  sub.className = 'page-sub';
  sub.textContent = isRoot
    ? 'Нажмите на плитку, чтобы открыть новый экран'
    : pathFor(tabId, segs);
  content.appendChild(sub);

  const grid = document.createElement('div');
  grid.className = 'tile-grid';
  const seed = tabId + ':' + segs.join('.');
  const tiles = [];
  for (let i = 0; i < 6; i++) {
    const tile = document.createElement('button');
    tile.className = 'tile';
    tile.disabled = true;
    const hue = tileHue(seed, i);
    tile.style.background = `linear-gradient(135deg, hsl(${hue} 85% 62%), hsl(${(hue + 35) % 360} 85% 42%))`;
    tile.innerHTML =
      `<span class="tile-index">${i + 1}</span>` +
      `<span class="tile-label">Плитка ${i + 1}</span>` +
      '<svg class="tile-chevron" viewBox="0 0 12 20"><path d="M2 1l8 9-8 9" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
      '<span class="tile-skeleton"></span>';
    tile.addEventListener('click', () => onTileClick(tabId, segs, i));
    grid.appendChild(tile);
    tiles.push(tile);
  }
  content.appendChild(grid);
  el.appendChild(content);

  scheduleSkeletonReveal(tiles);

  return el;
}

function scheduleSkeletonReveal(tiles) {
  const baseDelay = 500 + Math.random() * 200;
  tiles.forEach((tile, i) => {
    setTimeout(() => {
      const skeleton = tile.querySelector('.tile-skeleton');
      if (!skeleton) return;
      skeleton.classList.add('hide');
      tile.disabled = false;
      skeleton.addEventListener(
        'transitionend',
        () => skeleton.remove(),
        { once: true }
      );
    }, baseDelay + i * 60);
  });
}

/* ============ рендер стеков ============ */

function rebuildStackInstant(tabId, segs) {
  const container = tabContainers[tabId];
  container.innerHTML = '';
  const stack = [];
  for (let d = 0; d <= segs.length; d++) {
    const curSegs = segs.slice(0, d);
    const el = createScreenEl(tabId, curSegs);
    el.style.transition = 'none';
    if (d < segs.length) {
      el.classList.add('behind');
      el.style.transform = 'translateX(-25%)';
    }
    container.appendChild(el);
    stack.push({ segs: curSegs, el });
  }
  tabStacks[tabId] = stack;
  requestAnimationFrame(() => {
    stack.forEach((s) => {
      s.el.style.transition = '';
    });
  });
}

function getOrInitTabStack(tabId) {
  if (!tabStacks[tabId]) rebuildStackInstant(tabId, []);
  return tabStacks[tabId];
}

function switchTabInstant(tabId) {
  Object.keys(tabContainers).forEach((id) => {
    tabContainers[id].classList.toggle('active', id === tabId);
  });
  activeTabId = tabId;
  updateTabBarActive(tabId);
}

/* ============ push / pop анимации (внутри активного таба) ============ */

function doPush(tabId, newSegs) {
  const stack = tabStacks[tabId];
  const prev = stack[stack.length - 1];

  const el = createScreenEl(tabId, newSegs);
  el.style.transition = 'none';
  el.style.transform = 'translateX(100%)';
  tabContainers[tabId].appendChild(el);
  void el.offsetWidth; // force reflow

  el.style.transition = '';
  if (prev) prev.el.classList.add('behind');

  requestAnimationFrame(() => {
    if (prev) prev.el.style.transform = 'translateX(-25%)';
    el.style.transform = 'translateX(0)';
  });

  stack.push({ segs: newSegs, el });
}

function doPop() {
  const stack = tabStacks[activeTabId];
  if (stack.length <= 1) return;

  const top = stack.pop();
  const newTop = stack[stack.length - 1];

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

/* ============ обработчики действий пользователя ============ */

function onTileClick(tabId, curSegs, tileIndex) {
  const newSegs = [...curSegs, tileIndex];
  history.pushState({ tabId, segs: newSegs }, '', pathFor(tabId, newSegs));
  doPush(tabId, newSegs);
}

function onTabClick(tabId) {
  if (tabId === activeTabId) return;
  const stack = getOrInitTabStack(tabId);
  const segs = stack[stack.length - 1].segs;
  // replaceState, а не pushState: переключение таба само по себе не должно
  // становиться отдельным шагом истории — иначе кнопка "Назад" на запушенном
  // экране могла бы вести не в свой таб, а на состояние соседнего таба.
  history.replaceState({ tabId, segs }, '', pathFor(tabId, segs));
  switchTabInstant(tabId);
}

window.addEventListener('popstate', () => {
  const { tabId, segs } = parsePath(location.pathname);

  if (tabId !== activeTabId) {
    getOrInitTabStack(tabId);
    const topSegs = tabStacks[tabId][tabStacks[tabId].length - 1].segs;
    if (!segsEqual(topSegs, segs)) rebuildStackInstant(tabId, segs);
    switchTabInstant(tabId);
    return;
  }

  const stack = tabStacks[tabId];
  const curSegs = stack[stack.length - 1].segs;
  if (segsEqual(curSegs, segs)) return;

  if (segs.length === curSegs.length - 1 && isPrefix(segs, curSegs)) {
    doPop();
  } else if (segs.length === curSegs.length + 1 && isPrefix(curSegs, segs)) {
    doPush(tabId, segs);
  } else {
    rebuildStackInstant(tabId, segs);
  }
});

/* ============ таб-бар ============ */

function buildTabBar() {
  const items = document.getElementById('tabbar-items');
  TABS.forEach((tab) => {
    const btn = document.createElement('button');
    btn.className = 'tab-btn';
    btn.dataset.tab = tab.id;
    btn.innerHTML = tab.icon + `<span class="tab-label">${tab.label}</span>`;
    btn.addEventListener('click', () => onTabClick(tab.id));
    items.appendChild(btn);
  });
}

function updateTabBarActive(tabId) {
  document.querySelectorAll('.tab-btn').forEach((b) => {
    b.classList.toggle('active', b.dataset.tab === tabId);
  });
}

function buildTabContainers() {
  const root = document.getElementById('screens');
  TABS.forEach((tab) => {
    const c = document.createElement('div');
    c.className = 'tab-stack';
    c.dataset.tab = tab.id;
    root.appendChild(c);
    tabContainers[tab.id] = c;
  });
}

/* ============ инициализация ============ */

function init() {
  buildTabBar();
  buildTabContainers();

  // восстановление deep-link после 404.html fallback на GitHub Pages
  const redirected = sessionStorage.getItem('tabbar-redirect');
  if (redirected) {
    sessionStorage.removeItem('tabbar-redirect');
    history.replaceState(null, '', redirected);
  }

  let { tabId, segs } = parsePath(location.pathname);
  const path = stripBase(location.pathname);
  if (path === '/' || path === '' || path === '/index.html') {
    tabId = DEFAULT_TAB;
    segs = [];
  }

  rebuildStackInstant(tabId, segs);
  switchTabInstant(tabId);
  history.replaceState({ tabId, segs }, '', pathFor(tabId, segs));
}

init();
