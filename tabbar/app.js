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

function randomTileSpanClass() {
  const r = Math.random();
  if (r < 0.12) return 'tile-span-3';
  if (r < 0.5) return 'tile-span-2';
  return '';
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
  const TILE_COUNT = 20;
  for (let i = 0; i < TILE_COUNT; i++) {
    const tile = document.createElement('button');
    const spanClass = randomTileSpanClass();
    tile.className = 'tile' + (spanClass ? ' ' + spanClass : '');
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
    }, baseDelay + i * 30);
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

/* Очередь для push/pop-анимаций: нативный жест "назад" (трекпад/свайп) в
   браузере иногда роняет popstate чаще, чем успевает доиграть наша
   анимация — без очереди второй doPop() стартовал поверх ещё не
   доигравшего первого, и переход визуально "срабатывал дважды". Теперь
   каждая анимация ждёт, пока предыдущая полностью не закончится
   (transitionend), и только потом стартует следующая. */
let screenAnimating = false;
const pendingScreenActions = [];

function queueScreenAnimation(action) {
  if (screenAnimating) {
    pendingScreenActions.push(action);
    return;
  }
  screenAnimating = true;
  action(() => {
    screenAnimating = false;
    const next = pendingScreenActions.shift();
    if (next) queueScreenAnimation(next);
  });
}

function doPush(tabId, newSegs, onDone) {
  const stack = tabStacks[tabId];
  const prev = stack[stack.length - 1];

  const el = createScreenEl(tabId, newSegs);
  el.style.transition = 'none';
  el.style.transform = 'translateX(100%)';
  tabContainers[tabId].appendChild(el);
  void el.offsetWidth; // force reflow

  el.style.transition = '';
  if (prev) prev.el.classList.add('behind');

  const finish = (e) => {
    if (e && (e.target !== el || e.propertyName !== 'transform')) return;
    el.removeEventListener('transitionend', finish);
    if (onDone) onDone();
  };
  el.addEventListener('transitionend', finish);

  requestAnimationFrame(() => {
    if (prev) prev.el.style.transform = 'translateX(-25%)';
    el.style.transform = 'translateX(0)';
  });

  stack.push({ segs: newSegs, el });
}

function doPop(onDone) {
  const stack = tabStacks[activeTabId];
  if (stack.length <= 1) {
    if (onDone) onDone();
    return;
  }

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
    if (onDone) onDone();
  };
  top.el.addEventListener('transitionend', cleanup);
}

/* ============ обработчики действий пользователя ============ */

function onTileClick(tabId, curSegs, tileIndex) {
  const newSegs = [...curSegs, tileIndex];
  history.pushState({ tabId, segs: newSegs }, '', pathFor(tabId, newSegs));
  queueScreenAnimation((done) => doPush(tabId, newSegs, done));
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
    queueScreenAnimation((done) => doPop(done));
  } else if (segs.length === curSegs.length + 1 && isPrefix(curSegs, segs)) {
    queueScreenAnimation((done) => doPush(tabId, segs, done));
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

/* ============ Liquid Glass: настоящее преломление через карту смещения ============
 * Вместо шумового feTurbulence — физически рассчитанная (закон Снеллиуса)
 * карта смещения для выпуклого профиля стекла, как в
 * https://kube.io/blog/liquid-glass-css-svg/. Считаем один раз 1D-профиль
 * преломления по радиусу бортика, затем для каждого пикселя таб-бара
 * (через SDF скруглённого прямоугольника) берём расстояние до края,
 * смотрим в профиль и кодируем направление+величину смещения в
 * красный/зелёный каналы картинки — её и подставляем в feDisplacementMap.
 */

let liquidGlassProfileCache = null;

function computeRefractionProfile(samples = 96, n1 = 1, n2 = 1.5) {
  // выпуклый профиль бортика (четверть окружности): 0 у самого края, 1 на
  // границе плоской середины
  const height = (t) => Math.sqrt(Math.max(0, 1 - (1 - t) * (1 - t)));
  const delta = 1 / samples;
  const profile = [];
  for (let i = 0; i < samples; i++) {
    const t = i / (samples - 1);
    const t0 = Math.max(0, t - delta);
    const t1 = Math.min(1, t + delta);
    const deriv = (height(t1) - height(t0)) / (t1 - t0 || 1);
    const theta1 = Math.atan(Math.abs(deriv));
    const sinTheta2 = Math.min(1, (n1 / n2) * Math.sin(theta1));
    const theta2 = Math.asin(sinTheta2);
    const bend = Math.max(0, theta1 - theta2);
    profile.push(height(t) * Math.tan(bend));
  }
  const max = Math.max(...profile, 1e-6);
  return { profile, max };
}

function roundedBoxSDF(x, y, w, h, radius) {
  const cx = w / 2;
  const cy = h / 2;
  const halfW = w / 2;
  const halfH = h / 2;
  const dx = Math.abs(x - cx) - (halfW - radius);
  const dy = Math.abs(y - cy) - (halfH - radius);
  const ox = Math.max(dx, 0);
  const oy = Math.max(dy, 0);
  const outside = Math.hypot(ox, oy);
  const inside = Math.min(Math.max(dx, dy), 0);
  return outside + inside - radius;
}

function buildDisplacementDataURL(w, h, radius, bezelPx, refraction) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  const imgData = ctx.createImageData(w, h);
  const { profile, max } = refraction;
  const e = 1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const sdf = roundedBoxSDF(x, y, w, h, radius);
      const distIn = -sdf;
      let r = 128;
      let g = 128;
      if (distIn > 0) {
        const t = Math.min(1, distIn / bezelPx);
        const idx = Math.min(profile.length - 1, Math.round(t * (profile.length - 1)));
        const magNorm = profile[idx] / max;
        const gx1 = roundedBoxSDF(x + e, y, w, h, radius);
        const gx0 = roundedBoxSDF(x - e, y, w, h, radius);
        const gy1 = roundedBoxSDF(x, y + e, w, h, radius);
        const gy0 = roundedBoxSDF(x, y - e, w, h, radius);
        let gx = gx1 - gx0;
        let gy = gy1 - gy0;
        const glen = Math.hypot(gx, gy) || 1;
        gx /= glen;
        gy /= glen;
        r = 128 + gx * magNorm * 127;
        g = 128 + gy * magNorm * 127;
      }
      const i = (y * w + x) * 4;
      imgData.data[i] = r;
      imgData.data[i + 1] = g;
      imgData.data[i + 2] = 128;
      imgData.data[i + 3] = 255;
    }
  }
  ctx.putImageData(imgData, 0, 0);
  return canvas.toDataURL();
}

function buildSpecularDataURL(w, h, radius, bezelPx) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  const imgData = ctx.createImageData(w, h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const sdf = roundedBoxSDF(x, y, w, h, radius);
      const distIn = -sdf;
      let v = 0;
      if (distIn > 0) {
        const t = Math.min(1, distIn / bezelPx);
        // рим-блик: ярче у самого края, быстро гаснет к середине
        v = Math.pow(1 - t, 3);
      }
      const i = (y * w + x) * 4;
      const c = Math.round(v * 255);
      imgData.data[i] = c;
      imgData.data[i + 1] = c;
      imgData.data[i + 2] = c;
      imgData.data[i + 3] = 255;
    }
  }
  ctx.putImageData(imgData, 0, 0);
  return canvas.toDataURL();
}

function setFeImageHref(el, url) {
  el.setAttribute('href', url);
  el.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', url);
}

function buildLiquidGlass() {
  const glass = document.getElementById('tabbar-glass');
  const filterEl = document.getElementById('liquid-glass-distortion');
  const dispImg = document.getElementById('liquid-glass-displacement-map');
  const dispMap = document.getElementById('liquid-glass-displace');
  const specImg = document.getElementById('liquid-glass-specular-map');
  if (!glass || !filterEl) return;

  const rect = glass.getBoundingClientRect();
  const w = Math.max(1, Math.round(rect.width));
  const h = Math.max(1, Math.round(rect.height));
  const radius = 29;
  const bezel = Math.min(22, h / 2);

  if (!liquidGlassProfileCache) liquidGlassProfileCache = computeRefractionProfile();

  filterEl.setAttribute('x', '0');
  filterEl.setAttribute('y', '0');
  filterEl.setAttribute('width', w);
  filterEl.setAttribute('height', h);
  filterEl.setAttribute('filterUnits', 'userSpaceOnUse');
  filterEl.setAttribute('primitiveUnits', 'userSpaceOnUse');

  [dispImg, specImg].forEach((img) => {
    img.setAttribute('x', '0');
    img.setAttribute('y', '0');
    img.setAttribute('width', w);
    img.setAttribute('height', h);
  });

  setFeImageHref(dispImg, buildDisplacementDataURL(w, h, radius, bezel, liquidGlassProfileCache));
  setFeImageHref(specImg, buildSpecularDataURL(w, h, radius, bezel));
  dispMap.setAttribute('scale', Math.round(bezel * 1.3));
}

function initLiquidGlass() {
  buildLiquidGlass();
  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(buildLiquidGlass, 120);
  });
}

/* блик на стекле таб-бара следует за курсором/пальцем, как будто это
   настоящая жидкая поверхность, ловящая свет */
function initTabBarSheen() {
  const tabbar = document.getElementById('tabbar');
  const glass = document.getElementById('tabbar-glass');
  let raf = null;

  const setSheen = (clientX, clientY) => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = null;
      const rect = tabbar.getBoundingClientRect();
      const x = ((clientX - rect.left) / rect.width) * 100;
      const y = ((clientY - rect.top) / rect.height) * 100;
      glass.style.setProperty('--sheen-x', x + '%');
      glass.style.setProperty('--sheen-y', y + '%');
    });
  };

  tabbar.addEventListener('pointermove', (e) => setSheen(e.clientX, e.clientY));
  tabbar.addEventListener('pointerdown', (e) => setSheen(e.clientX, e.clientY));
  tabbar.addEventListener('pointerleave', () => {
    glass.style.removeProperty('--sheen-x');
    glass.style.removeProperty('--sheen-y');
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
  initTabBarSheen();
  initLiquidGlass();

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
