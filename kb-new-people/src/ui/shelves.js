// Две «чужие» полки ленты, перенесённые из прототипа «parallax афиша» (feed/components-slow.js):
// «Путешествия» — билет с направлениями в раскрытом виде (alwaysOpen, без раскрытия при скролле)
// и «События для вас» — карусель афиши с параллаксом, закольцованная.
// Логика и геометрия сохранены; вместо window-скролла — скролл страницы прототипа.

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function el(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

// корона 14px (чип кэшбэка)
const CROWN14 = '<svg viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg"><path d="M7 1.75087L8.99937 6.38575L13.125 3.9445L11.3855 10.5061C11.3232 10.7569 11.1778 10.9791 10.973 11.1366C10.7681 11.2941 10.516 11.3775 10.2576 11.3733H3.74237C3.48506 11.3734 3.23492 11.2884 3.03092 11.1316C2.82692 10.9747 2.68052 10.7548 2.6145 10.5061L0.875 3.94362L4.998 6.38487L7 1.75087Z" fill="#333333"/></svg>';

const sectionHeader = (title) => `
  <div class="fc-section-header">
    <h2>${esc(title)}</h2>
    <button type="button" class="fc-all-link">Все</button>
  </div>`;

// ---------- Афиша: большие карточки 343×428 с параллаксом ----------

const heroCardHtml = (m) => `
  <div class="fc-snap">
    <article class="fc-hero-card fc-par-box">
      <img src="${esc(m.img)}" alt="${esc(m.title)}" loading="lazy" draggable="false">
      <div class="fc-shade"></div>
      <div class="fc-chip">${esc(m.category)}</div>
      <div class="fc-content">
        <div class="fc-texts">
          <div class="fc-title">${esc(m.title)}</div>
          <div class="fc-desc"><div>${esc(m.place)}</div><div>${esc(m.date)}</div></div>
        </div>
        <div class="fc-actions">
          <span class="fc-btn-buy">${esc(m.price)}</span>
          <div class="fc-cashback">${CROWN14}<span>${esc(m.cashback)}</span></div>
        </div>
      </div>
    </article>
  </div>`;

export function afishaShelf({ title = 'События для вас', items }) {
  const section = el(`
    <section class="fc-shelf fc-hero">
      ${sectionHeader(title)}
      <div class="fc-scroller fc-scroller--center" data-hero data-loop="1">
        ${items.map(heroCardHtml).join('')}
      </div>
    </section>`);
  section.mount = () => initHeroCarousel(section.querySelector('[data-hero]'));
  return section;
}

/* Карточка в фокусе стоит по центру в полный размер, соседние чуть меньше,
   фотография внутри отстаёт от карточки, лента закольцована. Листание — нативный
   scroll-snap; скрипт только читает scrollLeft и раздаёт трансформы. */
function initHeroCarousel(scroller) {
  if (!scroller || scroller.dataset.heroReady) return () => {};
  scroller.dataset.heroReady = '1';
  const SHRINK = 0.06; // насколько меньше соседние карточки
  const LAG = 85; // на столько пикселей отстаёт фотография
  const CLONES = 3; // дубликатов по краям для зацикливания
  const SETTLE = 120; // мс тишины, после которых считаем, что встали

  // зацикливание: по краям — дубликаты; докрутив до дубликата, скролл перескакивает на такую же настоящую
  const realCount = scroller.children.length;
  const looped = scroller.dataset.loop === '1' && realCount > CLONES;
  if (looped) {
    const orig = [...scroller.children];
    for (let i = 0; i < CLONES; i++) {
      const head = orig[i].cloneNode(true);
      const tail = orig[realCount - 1 - i].cloneNode(true);
      head.dataset.clone = tail.dataset.clone = '1';
      scroller.append(head);
      scroller.prepend(tail);
    }
  }
  const first = looped ? CLONES : 0;
  const slots = [...scroller.children];
  const cards = slots.map((sl) => sl.querySelector('.fc-hero-card'));
  const imgs = cards.map((c) => c?.querySelector('img'));
  // декодируем заранее: дубликаты попадают в кадр только на стыке
  for (const im of imgs) {
    if (!im) continue;
    im.loading = 'eager';
    im.decode?.().catch(() => {});
  }

  // геометрия из offsetLeft/offsetWidth — её не искажают наши трансформы
  let step = 0;
  let cardW = 0;
  const snapOf = (i) => slots[i].offsetLeft + slots[i].offsetWidth / 2 - scroller.clientWidth / 2;
  function measure() {
    cardW = slots[first].offsetWidth;
    step = slots.length > 1 ? slots[1].offsetLeft - slots[0].offsetLeft : cardW;
  }

  const parked = new Array(slots.length).fill(null);
  function paint() {
    if (!step) measure();
    const p = scroller.scrollLeft;
    for (let i = 0; i < cards.length; i++) {
      const rel = (p - snapOf(i)) / step;
      const a = Math.max(-1, Math.min(1, rel));
      const far = Math.abs(rel) > 1.5;
      if (far && parked[i] === 'far') continue;
      parked[i] = far ? 'far' : null;
      const scale = 1 - SHRINK * Math.abs(a);
      // уменьшаясь, соседка отходит от центральной — возвращаем её на половину съеденной ширины
      const dx = (SHRINK * a * cardW) / 2;
      cards[i].style.transform = `translateX(${dx.toFixed(2)}px) scale(${scale.toFixed(4)})`;
      if (imgs[i]) imgs[i].style.transform = `translateX(${(a * LAG).toFixed(2)}px)`;
    }
  }

  // перескок на стыке — только когда лента встала: подмена позиции на лету сбивает инерцию
  let settleTimer = 0;
  let jumpedThisFling = false;
  const indexAt = (p) => Math.round((p - snapOf(first)) / step);
  function jump(exact) {
    const i = indexAt(scroller.scrollLeft);
    let to = i;
    if (i < 0) to = i + realCount;
    else if (i > realCount - 1) to = i - realCount;
    if (to === i) return;
    const from = first + i;
    const dest = first + to;
    if (!slots[dest]) return;
    if (exact) {
      const prev = scroller.style.scrollSnapType;
      scroller.style.scrollSnapType = 'none';
      scroller.scrollLeft = snapOf(dest);
      void scroller.offsetWidth;
      scroller.style.scrollSnapType = prev;
    } else {
      scroller.scrollLeft += snapOf(dest) - snapOf(from);
    }
  }

  // пока палец на экране, перескакивать нельзя — лента выдёргивается из-под пальца
  let touching = false;
  const holdStart = () => { touching = true; clearTimeout(settleTimer); };
  const holdEnd = () => {
    touching = false;
    clearTimeout(settleTimer);
    settleTimer = setTimeout(settled, SETTLE);
  };
  scroller.addEventListener('pointerdown', holdStart, { passive: true });
  scroller.addEventListener('touchstart', holdStart, { passive: true });
  for (const ev of ['pointerup', 'pointercancel', 'touchend', 'touchcancel']) scroller.addEventListener(ev, holdEnd, { passive: true });

  let ticking = false;
  let lastPos = -1;
  function onScroll() {
    if (looped && !jumpedThisFling && !touching) {
      // у самой стенки перескакиваем сразу, иначе лента упрётся в край
      const max = scroller.scrollWidth - scroller.clientWidth;
      if (scroller.scrollLeft < step * 0.25 || scroller.scrollLeft > max - step * 0.25) {
        jumpedThisFling = true;
        jump(false);
      }
    }
    clearTimeout(settleTimer);
    lastPos = scroller.scrollLeft;
    settleTimer = setTimeout(settled, SETTLE);
    if (!ticking) { ticking = true; requestAnimationFrame(() => { ticking = false; paint(); }); }
  }
  function settled() {
    if (touching || scroller.scrollLeft !== lastPos) {
      lastPos = scroller.scrollLeft;
      settleTimer = setTimeout(settled, SETTLE);
      return;
    }
    jumpedThisFling = false;
    if (looped) jump(true);
    paint();
  }

  scroller.addEventListener('scroll', onScroll, { passive: true });
  scroller.addEventListener('scrollend', () => {
    if (touching) return;
    clearTimeout(settleTimer);
    lastPos = scroller.scrollLeft;
    settled();
  });
  // полка строится до того, как страница попала на экран: размеры появляются позже —
  // тогда и ставим ленту на первую карточку
  let placed = false;
  const onResize = () => {
    measure();
    if (!scroller.clientWidth) return;
    if (!placed && looped) { placed = true; scroller.scrollLeft = snapOf(first); }
    paint();
  };
  const ro = new ResizeObserver(onResize);
  ro.observe(scroller);
  onResize();
  return () => ro.disconnect();
}

// ---------- Путешествия: «посадочный талон» с направлениями, раскрытый ----------

export function travelShelf({ items }) {
  const section = el(`
    <section class="fc-shelf fc-trip fc-trip--scale fc-trip--open">
      <div class="fc-trip-band">
        <div class="fc-trip-canvas">
          <div class="fc-trip-hero">
            <div class="fc-trip-press"><div class="fc-trip-bgwrap"></div></div>
            <div class="fc-trip-shade"></div>
            <div class="fc-trip-topshade"></div>
            <div class="fc-trip-press"><div class="fc-trip-col"></div></div>
          </div>
          <div class="fc-trip-card" data-role="next">
            <div class="fc-trip-shade fc-trip-shade--card"></div>
            <div class="fc-trip-cardtop"></div>
            <div class="fc-trip-col"></div>
          </div>
          <div class="fc-trip-card" data-role="incoming">
            <div class="fc-trip-shade fc-trip-shade--card"></div>
            <div class="fc-trip-cardtop"></div>
            <div class="fc-trip-col"></div>
          </div>
          <div class="fc-trip-scroller">${items.map(() => '<div class="fc-trip-slot"></div>').join('')}</div>
        </div>
      </div>
      <div class="fc-trip-edge fc-trip-edge--t"></div>
      <div class="fc-trip-edge fc-trip-edge--b"></div>
    </section>`);
  section.mount = (page) => initTravelTicket(section, items, page);
  return section;
}

function initTravelTicket(section, items, page) {
  const canvas = section.querySelector('.fc-trip-canvas');
  const scroller = section.querySelector('.fc-trip-scroller');
  /* Каждому направлению — свой <img> на всю жизнь блока: слои забирают себе готовый узел,
     смена src даже у закэшированной картинки даёт кадр пустоты. */
  const pool = items.map(() => {
    const im = new Image();
    im.alt = '';
    im.draggable = false;
    const ready = () => { im.dataset.ready = '1'; };
    im.addEventListener('load', () => (im.decode ? im.decode() : Promise.resolve()).then(ready, ready), { once: true });
    return im;
  });
  const requested = new Set();
  function want(idx) {
    if (idx < 0 || idx >= items.length || requested.has(idx)) return;
    requested.add(idx);
    pool[idx].src = items[idx].img;
  }
  const mountImg = (host, idx, cls) => {
    const node = pool[idx];
    if (node.parentNode === host) return node;
    host.style.backgroundColor = items[idx].color || '';
    node.style.cssText = '';
    node.className = cls;
    host.prepend(node);
    for (const other of Array.from(host.children)) if (other !== node && other.tagName === 'IMG') other.remove();
    return node;
  };

  const CARD_TOP = 40; // рамка контента внутри блока
  const PARK = -70; // боковая карточка выглядывает из-за правого края
  const hero = section.querySelector('.fc-trip-hero');
  const bgwrap = section.querySelector('.fc-trip-bgwrap');
  const heroShade = hero.querySelector('.fc-trip-shade');
  const heroCol = section.querySelector('.fc-trip-hero .fc-trip-col');
  const next = section.querySelector('[data-role="next"]');
  const incoming = section.querySelector('[data-role="incoming"]');

  // колонка карточки: сверху направление с триггером, снизу бейдж кэшбэка и цена
  const colHtml = (it) => `
    <div class="fc-trip-head" data-role="head">${esc(it.place)}${it.trigger ? `<br>${esc(it.trigger)}` : ''}</div>
    <div class="fc-trip-bottom">
      <div class="fc-trip-chip">${CROWN14}<span>${esc(it.cashback)}</span></div>
      <div class="fc-trip-lines">
        <div class="fc-trip-kind">${esc(it.kind || 'Авиабилеты')}</div>
        <div class="fc-trip-price-row">
          <span class="fc-trip-price">${esc(it.price)}</span>
          ${it.oldPrice ? `<span class="fc-trip-old">${esc(it.oldPrice)}</span>` : ''}
        </div>
      </div>
    </div>`;
  // финальная карточка-переход в сервис
  const ctaHtml = (it) => `
    <div class="fc-trip-cta">
      <div class="fc-trip-cta-title">${it.title.split('\n').map(esc).join('<br>')}</div>
      ${it.desc ? `<div class="fc-trip-cta-desc">${esc(it.desc)}</div>` : ''}
      <button class="fc-trip-cta-button" type="button">${esc(it.button || 'Смотреть')}</button>
    </div>`;
  const fillCol = (col, it) => {
    col.classList.toggle('fc-trip-col--cta', !!it.cta);
    col.innerHTML = it.cta ? ctaHtml(it) : colHtml(it);
  };
  const headOf = (col) => col.querySelector('[data-role="head"]');
  const chipOf = (col) => col.querySelector('.fc-trip-chip');
  const fillCard = (card, it, idx) => {
    mountImg(card, idx, '');
    fillCol(card.querySelector('.fc-trip-col'), it);
  };

  // фон заранее увеличен на величину, обратную нажатию: при нажатии он приходит ровно к краям блока
  const PRESS = 0.95;
  const PRESS_COMP = 1 / PRESS;
  const glue = (card, top, cardH) => {
    card.querySelector('img').style.transform = `scale(${PRESS_COMP.toFixed(4)})`;
    // градиент тянется от 126px (компактная) до 166px (герой) — иначе на подстановке героя он прыгал бы
    const kk = Math.min(1, Math.max(0, (cardH - 280) / (H - 280)));
    card.querySelector('.fc-trip-shade').style.height = `${(126 + 40 * kk).toFixed(1)}px`;
    card.querySelector('.fc-trip-cardtop').style.height = `${(126 + 40 * kk).toFixed(1)}px`;
    // контент стоит на своей линии в блоке независимо от того, где сейчас карточка
    card.querySelector('.fc-trip-col').style.transform = `translateY(${(-top).toFixed(1)}px)`;
  };

  let heroIdx = -1;
  let nextIdx = -1;
  let incIdx = -1;
  let W = 0;
  let H = 0;
  function measure() {
    W = scroller.clientWidth;
    H = canvas.clientHeight;
  }

  // карусель: следующая карточка расширяется до героя, на её место въезжает новая
  function update() {
    tickingX = false;
    if (!W) { measure(); if (!W) return; }
    const p = Math.max(0, scroller.scrollLeft / W);
    const i = Math.min(items.length - 1, Math.floor(p + 1e-4));
    want(i); want(i + 1); want(i + 2);
    const t = Math.min(1, Math.max(0, p - i));

    if (heroIdx !== i) {
      heroIdx = i;
      fillCol(heroCol, items[i]);
    }
    // контент карточки-перехода держит ширину блока, иначе строки перекомпоновываются
    for (const c of [heroCol, next.querySelector('.fc-trip-col'), incoming.querySelector('.fc-trip-col')]) {
      c.style.width = c.classList.contains('fc-trip-col--cta') ? `${W}px` : '';
    }

    // текущая карточка чуть уезжает влево под наезжающую; фон подрастает на величину сдвига
    const bg = mountImg(bgwrap, i, 'fc-trip-bg');
    const shift = W * 0.18 * t;
    const zoom = 1 + 0.18 * t;
    bg.style.transform = `translateX(${(-shift).toFixed(1)}px) scale(${zoom.toFixed(4)})`;
    heroShade.style.transform = `translateX(${(-shift).toFixed(1)}px) scaleX(${zoom.toFixed(4)})`;
    heroCol.style.transform = `translateX(${(-shift).toFixed(1)}px)`;

    const nx = items[i + 1];
    next.style.display = nx ? '' : 'none';
    if (nx) {
      if (nextIdx !== i + 1) { nextIdx = i + 1; fillCard(next, nx, i + 1); } else mountImg(next, i + 1, '');
      const left = (W + PARK) * (1 - t);
      const top = CARD_TOP * (1 - t);
      const w = 232 + (W - 232) * t;
      const hh = 280 + (H - 280) * t;
      next.style.transform = `translate(${left.toFixed(1)}px, ${top.toFixed(1)}px)`;
      next.style.width = `${w.toFixed(1)}px`;
      next.style.height = `${hh.toFixed(1)}px`;
      next.style.borderRadius = `${(26 * (1 - t)).toFixed(1)}px`;
      // заголовок и бейдж появляются, пока карточка занимает место героя
      const col = next.querySelector('.fc-trip-col');
      if (headOf(col)) headOf(col).style.opacity = t.toFixed(3);
      if (chipOf(col)) chipOf(col).style.opacity = t.toFixed(3);
      glue(next, top, hh);
    }

    const inc = items[i + 2];
    const IN_FROM = 0.55;
    incoming.style.display = inc && t > 0.05 ? '' : 'none';
    if (inc) {
      if (incIdx !== i + 2) { incIdx = i + 2; fillCard(incoming, inc, i + 2); } else mountImg(incoming, i + 2, '');
      // из-за края экрана ровно на место компактной карточки — без отскока
      const u = Math.min(1, Math.max(0, (t - IN_FROM) / (1 - IN_FROM)));
      const left = W + 16 - 86 * u;
      incoming.style.transform = `translate(${left.toFixed(1)}px, ${CARD_TOP}px)`;
      const col = incoming.querySelector('.fc-trip-col');
      if (headOf(col)) headOf(col).style.opacity = '0';
      if (chipOf(col)) chipOf(col).style.opacity = '0';
      glue(incoming, CARD_TOP, 280);
    }
  }

  // нажатие: раскрытая карточка слегка поджимается; ждём паузу и порог сдвига, чтобы не путать со свайпом
  let pressed = false;
  const pressLayers = [...section.querySelectorAll('.fc-trip-press')];
  function setPress(on) {
    if (pressed === on) return;
    pressed = on;
    for (const l of pressLayers) l.style.transform = on ? `scale(${PRESS})` : '';
  }
  const PRESS_DELAY = 110;
  const PRESS_SLOP = 8;
  let pressTimer = 0;
  let pressX = 0;
  let pressY = 0;
  const pointOf = (e) => (e.touches && e.touches[0]) || e;
  function pressDown(e) {
    const p = pointOf(e);
    pressX = p.clientX;
    pressY = p.clientY;
    clearTimeout(pressTimer);
    pressTimer = setTimeout(() => { pressTimer = 0; setPress(true); }, PRESS_DELAY);
  }
  function pressMove(e) {
    if (!pressTimer && !pressed) return;
    const p = pointOf(e);
    if (Math.abs(p.clientX - pressX) > PRESS_SLOP || Math.abs(p.clientY - pressY) > PRESS_SLOP) pressUp();
  }
  function pressUp() {
    clearTimeout(pressTimer);
    pressTimer = 0;
    setPress(false);
  }
  for (const ev of ['pointerdown', 'touchstart']) scroller.addEventListener(ev, pressDown, { passive: true });
  for (const ev of ['pointermove', 'touchmove']) scroller.addEventListener(ev, pressMove, { passive: true });
  for (const ev of ['pointerup', 'pointercancel', 'pointerleave', 'touchend', 'touchcancel', 'scroll']) scroller.addEventListener(ev, pressUp, { passive: true });

  // подсказка про горизонтальный скролл: блок на экране, а карусель не тронули —
  // карточки слегка отъезжают и возвращаются (через 5 с, потом раз в 10 с)
  const HINT_FIRST = 5000;
  const HINT_REPEAT = 10000;
  const HINT_SHIFT = 44;
  const HINT_TIME = 1100;
  let hintTimer = 0;
  let hintRaf = 0;
  let hintCount = 0;
  let userSwiped = false;
  let onScreen = false;
  function planHint() {
    clearTimeout(hintTimer);
    if (userSwiped || !onScreen) return;
    hintTimer = setTimeout(playHint, hintCount ? HINT_REPEAT : HINT_FIRST);
  }
  function dropHint() {
    userSwiped = true;
    clearTimeout(hintTimer);
    if (hintRaf) {
      cancelAnimationFrame(hintRaf);
      hintRaf = 0;
      scroller.style.scrollSnapType = '';
    }
  }
  function playHint() {
    if (userSwiped || !onScreen || scroller.scrollLeft > 1) return;
    hintCount++;
    scroller.style.scrollSnapType = 'none';
    const t0 = performance.now();
    const stepFn = (now) => {
      const p = Math.min(1, (now - t0) / HINT_TIME);
      scroller.scrollLeft = HINT_SHIFT * Math.sin(p * Math.PI);
      if (p < 1) { hintRaf = requestAnimationFrame(stepFn); return; }
      scroller.scrollLeft = 0;
      scroller.style.scrollSnapType = '';
      hintRaf = 0;
      planHint();
    };
    hintRaf = requestAnimationFrame(stepFn);
  }
  const io = new IntersectionObserver(([e]) => {
    onScreen = e.isIntersecting;
    if (onScreen) planHint(); else clearTimeout(hintTimer);
  }, { root: page, threshold: 0.6 });
  io.observe(section);

  let tickingX = false;
  function onScrollX() {
    if (!hintRaf && scroller.scrollLeft > 2) dropHint();
    if (!tickingX) { tickingX = true; requestAnimationFrame(update); }
  }
  scroller.addEventListener('scroll', onScrollX, { passive: true });
  scroller.addEventListener('pointerdown', dropHint, { passive: true });
  scroller.addEventListener('touchstart', dropHint, { passive: true });
  // размеры появляются, когда страница попала на экран, — тогда и раскладываем карточки
  const ro = new ResizeObserver(() => { measure(); update(); });
  ro.observe(scroller);
  measure();
  update();
  return () => {
    io.disconnect();
    ro.disconnect();
    clearTimeout(hintTimer);
    cancelAnimationFrame(hintRaf);
  };
}
