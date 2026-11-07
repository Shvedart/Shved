// Скретч-карточка в ленте: голографическая фольга с коронами переливается при скролле,
// её стирают пальцем — летят кусочки, под ней приз. Перенесено из прототипа ленты «Гаджеты».

import { h } from '../core/dom.js';
import { animate, EASE, reducedMotion } from '../core/motion.js';
import { haptics } from '../core/haptics.js';

const CROWN_PATH = new Path2D('M6 9.5L9 18.5H17.5L20 9.5L15.5 13L13 7.5L10.5 13L6 9.5Z');
// Корона над подписью — Path2D, чтобы на любом dpr оставалась векторной (viewBox 0 0 24 24)
const CROWN_BODY = new Path2D('M12.001 3.00195L18.9018 19.002C18.5465 19.313 18.0829 19.497 17.585 19.4971H12.001H6.41504C5.50802 19.4969 4.71487 18.8865 4.48242 18.0098L1.5 6.76172L8.56836 10.9463L8.57324 10.9482L11.999 3.00195L12 3L12.001 3.00195Z');
const CROWN_SHADE = new Path2D('M19.5176 18.0098C19.4127 18.4054 19.1925 18.7454 18.9004 19.001L15.4277 10.9473L22.5 6.76172L19.5176 18.0098Z');

const BRUSH_RADIUS = 10;
const REVEAL_THRESHOLD = 0.65;
const DEBRIS_COLORS = ['#b8b8c0', '#c4c4cc', '#d0d0d8', '#c0c0c8', '#d8d8de'];
const dpr = Math.min(window.devicePixelRatio || 1, 3);
const fontStack = () => getComputedStyle(document.documentElement).getPropertyValue('--font-display').trim() || 'system-ui, sans-serif';

// Зернистость фольги — одна текстура на все карточки.
let noise = null;
function noiseTexture() {
  if (noise) return noise;
  const size = 180;
  noise = document.createElement('canvas');
  noise.width = noise.height = size;
  const nctx = noise.getContext('2d');
  const img = nctx.createImageData(size, size);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = Math.floor(Math.random() * 256);
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  nctx.putImageData(img, 0, 0);
  return noise;
}

export function scratchCard({ prize, label = 'Скретч-карточка: сотрите, чтобы открыть подарок', onReveal } = {}) {
  const canvas = h('canvas', { class: 'scard-canvas', 'aria-hidden': 'true' });
  const particlesCanvas = h('canvas', { class: 'scard-particles', 'aria-hidden': 'true' });
  const video = h('video', { class: 'scard-prize-logo', src: 'assets/video/scratch-crown.mp4', loop: true, muted: true, playsinline: true, preload: 'auto', 'aria-hidden': 'true' });
  video.muted = true;
  const prizeEl = h('div', { class: 'scard-prize' },
    video,
    h('div', { class: 'scard-prize-percent' }, prize.percent),
    h('div', { class: 'scard-prize-title' }, prize.title),
    h('div', { class: 'scard-prize-sub' }, prize.sub));
  const check = h('span', { class: 'scard-check', 'aria-hidden': 'true' }, '✓');
  const zone = h('div', { class: 'scard-zone' }, prizeEl, check, canvas, particlesCanvas);
  // подпись как у карточки оффера, чтобы ряд ленты выглядел ровно
  const descEl = h('div', { class: 'ocard-desc' }, 'Сотрите, чтобы открыть');
  const caption = h('div', { class: 'ocard-caption', 'aria-hidden': 'true' }, h('div', { class: 'ocard-name' }, 'Подарок'), descEl);
  // клавиатура и скринридер открывают карточку без стирания
  const root = h('div', { class: 'scard', role: 'button', tabindex: '0', 'aria-label': label }, zone, caption);

  const ctx = canvas.getContext('2d');
  const mask = document.createElement('canvas');
  const maskCtx = mask.getContext('2d');
  const pCtx = particlesCanvas.getContext('2d');

  let shimmer = 0;
  let waveTime = 0; // растёт без % 1, чтобы волна не прыгала
  let crowns = [];
  let revealed = false;
  let pointerId = null;
  let lastPoint = null;
  let particles = [];
  let pRaf = 0;
  let cancelHint = null;
  let scrollEl = null;
  let prevScroll = 0;
  let scrollRaf = 0;
  let idleRaf = 0;
  let lastIdle = 0;
  let visible = false;
  let io = null;
  let ro = null;

  for (let i = 0; i < 120; i++) {
    crowns.push({ hueBase: Math.random() * 360 });
  }

  function drawCrownAt(cx, cy, size) {
    const sc = size / 14; // путь короны по x занимает 6→20 = 14 единиц
    ctx.save();
    ctx.translate(cx - 13 * sc, cy - 13 * sc);
    ctx.scale(sc, sc);
    ctx.fill(CROWN_PATH);
    ctx.restore();
  }

  function drawFoil() {
    const w = canvas.width;
    const hgt = canvas.height;
    if (!w || !hgt) return;

    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#e8e8ea';
    ctx.fillRect(0, 0, w, hgt);
    const gloss = ctx.createLinearGradient(0, 0, 0, hgt * 0.3);
    gloss.addColorStop(0, 'rgba(255,255,255,0.32)');
    gloss.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gloss;
    ctx.fillRect(0, 0, w, hgt * 0.3);

    // шахматка корон, повёрнутая на 10°: по ней бежит световая волна
    const crownSize = w * 0.14;
    const cell = w * 0.16;
    const cols = Math.ceil(w / cell) + 4;
    const rows = Math.ceil(hgt / cell) + 4;
    ctx.save();
    ctx.translate(w / 2, hgt / 2);
    ctx.rotate((10 * Math.PI) / 180);
    ctx.globalCompositeOperation = 'screen';
    let idx = 0;
    for (let row = -rows; row <= rows; row++) {
      for (let col = -cols; col <= cols; col++) {
        if ((row + col) % 2 !== 0) continue;
        const c = crowns[idx++ % crowns.length];
        const brightness = Math.abs(Math.sin(waveTime * Math.PI * 2 * 1.3 - (col + row) * 0.13)) ** 3;
        ctx.globalAlpha = brightness * 0.85;
        ctx.fillStyle = `hsl(${(c.hueBase + shimmer * 140) % 360}, 95%, 68%)`;
        drawCrownAt(col * cell, row * cell, crownSize);
      }
    }
    ctx.restore();

    // корона и надпись «тут спрятан подарок»
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    const font = fontStack();
    const crownSz = Math.round(28 * dpr);
    const gap = Math.round(10 * dpr);
    const lh = Math.round(22 * dpr);
    const blockY = Math.round((hgt - (crownSz + gap + 3 * lh)) / 2);
    ctx.save();
    ctx.translate(Math.round((w - crownSz) / 2), blockY);
    ctx.scale(crownSz / 24, crownSz / 24);
    ctx.fillStyle = '#333333';
    ctx.fill(CROWN_BODY);
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fill(CROWN_SHADE);
    ctx.restore();

    ctx.fillStyle = 'rgba(0,0,0,0.48)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    try { ctx.letterSpacing = '-0.41px'; } catch (_) { /* старый Safari */ }
    ctx.font = `600 ${Math.round(17 * dpr)}px ${font}`;
    ['тут', 'спрятан', 'подарок'].forEach((line, i) => ctx.fillText(line, w / 2, blockY + crownSz + gap + i * lh));
    try { ctx.letterSpacing = '0px'; } catch (_) { /* старый Safari */ }
    ctx.font = `400 ${Math.round(13 * dpr)}px ${font}`;
    ctx.fillText('сотри пальцем', w / 2, hgt - Math.round(28 * dpr));

    ctx.globalCompositeOperation = 'overlay';
    ctx.globalAlpha = 0.09;
    ctx.drawImage(noiseTexture(), 0, 0, w, hgt);
    ctx.globalAlpha = 1;

    // стёртое — прозрачно
    ctx.globalCompositeOperation = 'destination-in';
    ctx.drawImage(mask, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
  }

  function resize() {
    const rect = zone.getBoundingClientRect();
    const w = Math.round(rect.width * dpr);
    const hgt = Math.round(rect.height * dpr);
    // iOS шлёт resize при скролле (панель браузера), размер карточки не меняется — пропускаем
    if (!w || !hgt || (canvas.width === w && canvas.height === hgt)) return;
    canvas.width = mask.width = particlesCanvas.width = w;
    canvas.height = mask.height = particlesCanvas.height = hgt;
    maskCtx.globalCompositeOperation = 'source-over';
    maskCtx.fillStyle = '#fff';
    maskCtx.fillRect(0, 0, w, hgt);
    drawFoil();
  }

  function toCanvas(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    return { x: (clientX - rect.left) * (mask.width / rect.width), y: (clientY - rect.top) * (mask.height / rect.height) };
  }

  function eraseAt(clientX, clientY) {
    const { x, y } = toCanvas(clientX, clientY);
    maskCtx.globalCompositeOperation = 'destination-out';
    maskCtx.beginPath();
    maskCtx.arc(x, y, BRUSH_RADIUS * dpr, 0, Math.PI * 2);
    maskCtx.fill();
  }

  function eraseSegment(x0, y0, x1, y1) {
    const steps = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / (BRUSH_RADIUS * 0.5)));
    for (let i = 0; i <= steps; i++) eraseAt(x0 + ((x1 - x0) * i) / steps, y0 + ((y1 - y0) * i) / steps);
  }

  function scratchedRatio() {
    const { data } = maskCtx.getImageData(0, 0, mask.width, mask.height);
    let total = 0;
    let cleared = 0;
    for (let i = 3; i < data.length; i += 16) {
      total++;
      if (data[i] < 40) cleared++;
    }
    return total ? cleared / total : 0;
  }

  // Кусочки фольги разлетаются из-под пальца и падают.
  function spawnParticles(clientX, clientY) {
    if (reducedMotion()) return;
    const { x, y } = toCanvas(clientX, clientY);
    if (Math.random() > 0.5 && particles.length < 80) {
      particles.push({
        x: x + (Math.random() - 0.5) * BRUSH_RADIUS * dpr * 1.2,
        y: y + (Math.random() - 0.5) * BRUSH_RADIUS * dpr * 0.4,
        vx: (Math.random() - 0.5) * 3.5 * dpr,
        vy: -(0.8 + Math.random() * 2.5) * dpr,
        w: (1.5 + Math.random() * 3) * dpr,
        h: (0.6 + Math.random() * 1.0) * dpr,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.3,
        opacity: 0.65 + Math.random() * 0.35,
        color: DEBRIS_COLORS[Math.floor(Math.random() * DEBRIS_COLORS.length)],
      });
    }
    if (!pRaf) pRaf = requestAnimationFrame(tickParticles);
  }

  function tickParticles() {
    pCtx.clearRect(0, 0, particlesCanvas.width, particlesCanvas.height);
    particles = particles.filter((p) => p.opacity > 0.02);
    for (const p of particles) {
      p.vy += 0.3 * dpr; // гравитация
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.rotSpeed;
      p.opacity -= 0.028;
      pCtx.save();
      pCtx.globalAlpha = Math.max(0, p.opacity);
      pCtx.translate(p.x, p.y);
      pCtx.rotate(p.rot);
      pCtx.fillStyle = p.color;
      pCtx.beginPath();
      pCtx.ellipse(0, 0, p.w, p.h, 0, 0, Math.PI * 2);
      pCtx.fill();
      pCtx.restore();
    }
    pRaf = particles.length ? requestAnimationFrame(tickParticles) : 0;
  }

  function reveal() {
    if (revealed) return;
    revealed = true;
    cancelHint?.();
    zone.classList.add('is-revealed');
    descEl.textContent = 'Подарок открыт';
    root.setAttribute('aria-label', `${prize.percent}. ${prize.title} ${prize.sub}`);
    root.removeAttribute('role');
    root.tabIndex = -1;
    particles = [];
    pCtx.clearRect(0, 0, particlesCanvas.width, particlesCanvas.height);
    video.play().catch(() => {});
    stopIdle();
    // приз «вспыхивает» чуть позже, когда фольга растворилась
    setTimeout(() => {
      haptics.success();
      zone.classList.add('is-glow');
      animate(root, [{ transform: 'scale(1)' }, { transform: 'scale(1.038)', offset: 0.55 }, { transform: 'scale(1)' }], { duration: 450, easing: EASE.spring, fill: 'none' });
      onReveal?.();
      root.dispatchEvent(new CustomEvent('scratchreveal'));
    }, 500);
  }

  function onDown(e) {
    if (revealed || pointerId !== null) return;
    if (cancelHint) {
      // пользователь начал сам — подсказку убираем и даём чистую фольгу
      cancelHint();
      maskCtx.globalCompositeOperation = 'source-over';
      maskCtx.fillStyle = '#fff';
      maskCtx.fillRect(0, 0, mask.width, mask.height);
    }
    pointerId = e.pointerId;
    canvas.setPointerCapture?.(e.pointerId);
    lastPoint = { x: e.clientX, y: e.clientY };
    eraseAt(e.clientX, e.clientY);
    drawFoil();
    haptics.selection();
  }

  function onMove(e) {
    if (e.pointerId !== pointerId || revealed) return;
    e.preventDefault();
    const p = { x: e.clientX, y: e.clientY };
    if (lastPoint) eraseSegment(lastPoint.x, lastPoint.y, p.x, p.y);
    spawnParticles(p.x, p.y);
    lastPoint = p;
    drawFoil();
    if (scratchedRatio() > REVEAL_THRESHOLD) reveal();
  }

  function onUp(e) {
    if (e.pointerId !== pointerId) return;
    pointerId = null;
    lastPoint = null;
  }

  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerup', onUp);
  canvas.addEventListener('pointercancel', onUp);
  root.addEventListener('keydown', (e) => {
    if (revealed || (e.key !== 'Enter' && e.key !== ' ')) return;
    e.preventDefault();
    reveal();
  });

  // Подсказка: «невидимый палец» стирает волной полосу, через 2 секунды фольга затягивается справа налево.
  function playHint() {
    if (revealed || cancelHint || !mask.width) return;
    let cancelled = false;
    cancelHint = () => { cancelled = true; cancelHint = null; };
    const rect = canvas.getBoundingClientRect();
    const sx = mask.width / rect.width;
    const sy = mask.height / rect.height;
    const cx = rect.width * 0.5;
    const cy = rect.height * 0.5;
    const halfW = rect.width * 0.36;
    const amp = rect.height * 0.13;
    const STEPS = 100;
    const pts = [];
    for (let i = 0; i <= STEPS; i++) {
      const t = i / STEPS;
      const e = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      pts.push([(cx - halfW + e * halfW * 2) * sx, (cy + Math.sin(e * 3 * Math.PI * 2) * amp) * sy]);
    }
    const TOTAL = 950;
    let cursor = 0;
    let t0 = 0;

    const tick = (ts) => {
      if (revealed || cancelled) return;
      if (!t0) t0 = ts;
      const target = Math.min(Math.ceil(((ts - t0) * (STEPS + 1)) / TOTAL), pts.length);
      if (target > cursor) {
        maskCtx.lineWidth = 50 * dpr;
        maskCtx.lineCap = 'round';
        maskCtx.lineJoin = 'round';
        maskCtx.strokeStyle = '#000';
        maskCtx.globalCompositeOperation = 'destination-out';
        maskCtx.beginPath();
        maskCtx.moveTo(...pts[Math.max(cursor - 1, 0)]);
        for (let i = Math.max(cursor, 1); i < target; i++) maskCtx.lineTo(...pts[i]);
        maskCtx.stroke();
        const fr = canvas.getBoundingClientRect();
        const step = Math.max(1, Math.floor((target - cursor) / 2));
        for (let i = cursor; i < target; i += step) spawnParticles(pts[i][0] / sx + fr.left, pts[i][1] / sy + fr.top);
        cursor = target;
      }
      maskCtx.globalCompositeOperation = 'source-over';
      drawFoil();
      if (cursor < pts.length) requestAnimationFrame(tick);
      else setTimeout(restore, 2000);
    };
    requestAnimationFrame(tick);

    function restore() {
      if (revealed || cancelled) return;
      maskCtx.globalCompositeOperation = 'source-over';
      const snap = document.createElement('canvas');
      snap.width = mask.width;
      snap.height = mask.height;
      snap.getContext('2d').drawImage(mask, 0, 0);
      const dur = 1100;
      const feather = mask.width * 0.14; // мягкий край затягивания
      const r0 = performance.now();
      const step = (ts) => {
        if (revealed || cancelled) return;
        const t = Math.min((ts - r0) / dur, 1);
        const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        const wipeX = mask.width * (1 - ease);
        maskCtx.clearRect(0, 0, mask.width, mask.height);
        maskCtx.drawImage(snap, 0, 0);
        maskCtx.fillStyle = '#fff';
        maskCtx.fillRect(wipeX + feather, 0, mask.width, mask.height);
        const grad = maskCtx.createLinearGradient(wipeX, 0, wipeX + feather, 0);
        grad.addColorStop(0, 'rgba(255,255,255,0)');
        grad.addColorStop(1, 'rgba(255,255,255,1)');
        maskCtx.fillStyle = grad;
        maskCtx.fillRect(wipeX, 0, feather, mask.height);
        drawFoil();
        if (t < 1) requestAnimationFrame(step);
        else {
          maskCtx.fillStyle = '#fff';
          maskCtx.fillRect(0, 0, mask.width, mask.height);
          drawFoil();
          cancelHint = null;
        }
      };
      requestAnimationFrame(step);
    }
  }

  // Скролл страницы двигает перелив корон.
  function onScroll() {
    if (revealed || !visible || scrollRaf) return;
    scrollRaf = requestAnimationFrame(() => {
      scrollRaf = 0;
      const y = scrollEl.scrollTop;
      waveTime += (y - prevScroll) * 0.0009;
      prevScroll = y;
      shimmer = (y * 0.0009) % 1;
      drawFoil();
    });
  }

  // В покое перелив медленно дрейфует (~10 кадров в секунду), только пока карточку видно.
  function idle(ts) {
    if (ts - lastIdle >= 100) {
      shimmer = (shimmer + 0.003) % 1;
      waveTime += 0.003;
      drawFoil();
      lastIdle = ts;
    }
    idleRaf = requestAnimationFrame(idle);
  }
  function startIdle() {
    if (!idleRaf && !revealed && !reducedMotion()) idleRaf = requestAnimationFrame(idle);
  }
  function stopIdle() {
    cancelAnimationFrame(idleRaf);
    idleRaf = 0;
  }

  // Подключение к скролл-контейнеру страницы после вставки в DOM.
  root.mount = (page) => {
    scrollEl = page;
    prevScroll = page.scrollTop;
    page.addEventListener('scroll', onScroll, { passive: true });
    io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) { resize(); startIdle(); } else stopIdle();
    }, { root: page });
    io.observe(root);
    ro = new ResizeObserver(() => resize());
    ro.observe(zone);
    // iOS не рисует первый кадр видео, пока не вызван play()
    video.play().then(() => { if (!revealed) video.pause(); }).catch(() => {});
  };

  root.destroy = () => {
    scrollEl?.removeEventListener('scroll', onScroll);
    io?.disconnect();
    ro?.disconnect();
    stopIdle();
    cancelAnimationFrame(pRaf);
    cancelHint?.();
  };

  root.playHint = playHint;
  root.reveal = reveal;
  Object.defineProperty(root, 'revealed', { get: () => revealed });
  return root;
}
