// Модули — живые сцены, которые не описать набором состояний.
const MODS = {};

// Поле влияния: элементы отталкиваются по закону Кулона (F ~ m1·m2 / r²) и от краёв рамки,
// пока система не придёт в равновесие. Элементы можно таскать мышью.
MODS.field = (mode, opt = {}) => {
  const L = layer();
  const cv = document.createElement('canvas');
  cv.width = W * 2; cv.height = H * 2; cv.style.width = W + 'px'; cv.style.height = H + 'px';
  L.appendChild(cv);
  const g = cv.getContext('2d'); g.scale(2, 2);
  // full — поле на весь слайд (без заголовка слева)
  const F = opt.full ? { x0: 140, y0: 110, x1: 1780, y1: 990 } : { x0: 640, y0: 120, x1: 1800, y1: 960 };
  const ox = opt.full ? -260 : 0;
  const mk = (w, h, sh, col, k, x, y) => ({ w, h, tw: w, th: h, sh, col, k, x: x + ox, y, vx: 0, vy: 0, a: 1, ta: 1 });
  const B = [
    mk(220, 220, 'c', C.ink, 1, 1180, 520),
    mk(130, 130, 'r', C.ink, 1, 1260, 470),
    mk(320, 90, 'r', C.bl, .8, 1210, 600),
    mk(100, 100, 'c', C.or, .75, 1150, 450),
    mk(170, 170, 'r', C.ink, 1, 1290, 560),
  ];
  const extra = mk(200, 200, 'c', C.or, .8, 1220, -150); extra.ta = 0; extra.a = 0;
  B.push(extra);
  const mass = b => (b.w * b.h) / 12000 * b.k * b.a;
  let drag = null, raf, t0 = performance.now();

  function setMode(m) {
    B[0].tw = B[0].th = m >= 2 ? 400 : 220;
    if (m >= 3) { if (extra.ta === 0) { extra.x = 1240 + ox; extra.y = -120; extra.vx = 0; extra.vy = 18; } extra.ta = 1; }
    else extra.ta = 0;
  }
  setMode(mode);

  function step() {
    const K = 60000, KW = 3200;
    for (const b of B) {
      b.w += (b.tw - b.w) * .06; b.h += (b.th - b.h) * .06; b.a += (b.ta - b.a) * .08;
    }
    const act = B.filter(b => b.a > .02);
    for (const b of act) {
      if (b === drag) continue;
      const m = mass(b); let fx = 0, fy = 0;
      for (const o of act) {
        if (o === b) continue;
        const dx = b.x - o.x, dy = b.y - o.y; const d = Math.max(Math.hypot(dx, dy), 60);
        const f = K * m * mass(o) / (d * d);
        fx += f * dx / d; fy += f * dy / d;
      }
      const hw = b.w / 2, hh = b.h / 2;
      const wl = Math.max(b.x - hw - F.x0, 8), wr = Math.max(F.x1 - b.x - hw, 8);
      const wt = Math.max(b.y - hh - F.y0, 8), wb = Math.max(F.y1 - b.y - hh, 8);
      const km = KW * m;
      fx += km / (wl * wl) * 60 - km / (wr * wr) * 60;
      fy += km / (wt * wt) * 60 - km / (wb * wb) * 60;
      const inv = 1 / Math.max(m, .2);
      b.vx = (b.vx + fx * inv * .12) * .88; b.vy = (b.vy + fy * inv * .12) * .88;
      const sp = Math.hypot(b.vx, b.vy); if (sp > 26) { b.vx *= 26 / sp; b.vy *= 26 / sp; }
      b.x += b.vx; b.y += b.vy;
      if (b.y > -50) {
        b.x = Math.min(Math.max(b.x, F.x0 + hw), F.x1 - hw);
        b.y = Math.min(Math.max(b.y, F.y0 + hh), F.y1 - hh);
      }
    }
  }

  function draw() {
    const t = (performance.now() - t0) / 1000;
    g.clearRect(0, 0, W, H);
    g.strokeStyle = 'rgba(13,13,13,.18)'; g.lineWidth = 1.5;
    g.strokeRect(F.x0, F.y0, F.x1 - F.x0, F.y1 - F.y0);
    const act = B.filter(b => b.a > .02);
    // линии взаимодействия
    for (let i = 0; i < act.length; i++) for (let j = i + 1; j < act.length; j++) {
      const a = act[i], b = act[j]; const d = Math.hypot(a.x - b.x, a.y - b.y);
      const f = Math.min(1, 900 * mass(a) * mass(b) / (d * d));
      g.strokeStyle = `rgba(255,46,138,${(.08 + f * .5) * Math.min(a.a, b.a)})`; g.lineWidth = 1 + f * 3;
      g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke();
    }
    // поля
    for (const b of act) {
      const R = 90 + Math.sqrt(mass(b)) * 120;
      const gr = g.createRadialGradient(b.x, b.y, 0, b.x, b.y, R);
      gr.addColorStop(0, hexA(b.col, .16 * b.a)); gr.addColorStop(1, hexA(b.col, 0));
      g.fillStyle = gr; g.beginPath(); g.arc(b.x, b.y, R, 0, 7); g.fill();
      for (let k = 1; k <= 3; k++) {
        const rr = R * (k / 3) * (.92 + .08 * Math.sin(t * 2 + k));
        g.strokeStyle = hexA(b.col, .14 * b.a); g.lineWidth = 1.2;
        g.beginPath(); g.arc(b.x, b.y, rr, 0, 7); g.stroke();
      }
    }
    for (const b of act) {
      g.globalAlpha = b.a; g.fillStyle = b.col;
      if (b.sh === 'c') { g.beginPath(); g.arc(b.x, b.y, b.w / 2, 0, 7); g.fill(); }
      else g.fillRect(b.x - b.w / 2, b.y - b.h / 2, b.w, b.h);
      g.globalAlpha = 1;
    }
  }
  function loop() { step(); step(); draw(); raf = requestAnimationFrame(loop); }
  loop();

  const down = e => {
    const p = toStage(e);
    drag = B.find(b => b.a > .5 && Math.abs(p.x - b.x) < b.w / 2 && Math.abs(p.y - b.y) < b.h / 2) || null;
  };
  const move = e => { if (!drag) return; const p = toStage(e); drag.x = p.x; drag.y = p.y; drag.vx = drag.vy = 0; };
  const up = () => { drag = null; };
  addEventListener('pointerdown', down); addEventListener('pointermove', move); addEventListener('pointerup', up);

  return {
    update: setMode, bodies: B,
    destroy() {
      L.kill(); setTimeout(() => cancelAnimationFrame(raf), 900);
      removeEventListener('pointerdown', down); removeEventListener('pointermove', move); removeEventListener('pointerup', up);
    }
  };
};
function hexA(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`;
}

// Звуковые волны: три чистых тона и их сумма — аккорд.
MODS.waves = () => {
  const L = layer();
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('width', W); svg.setAttribute('height', H);
  svg.style.position = 'absolute';
  L.appendChild(svg);
  const waves = [
    { f: 2, a: 34, y: 360, c: C.or, w: 3 },
    { f: 3, a: 34, y: 470, c: C.mg, w: 3 },
    { f: 4, a: 34, y: 580, c: C.bl, w: 3 },
    { f: 0, a: 1, y: 760, c: C.ink, w: 5, sum: true },
  ];
  const paths = waves.map(wv => {
    const p = document.createElementNS(NS, 'path');
    p.setAttribute('fill', 'none'); p.setAttribute('stroke', wv.c); p.setAttribute('stroke-width', wv.w);
    p.setAttribute('stroke-linecap', 'round');
    svg.appendChild(p); return p;
  });
  const X0 = 140, X1 = 860; let raf, t0 = performance.now();
  function loop() {
    const t = (performance.now() - t0) / 1000;
    const grow = Math.min(1, t / 1.4);
    waves.forEach((wv, i) => {
      let d = '';
      const xe = X0 + (X1 - X0) * Math.min(1, Math.max(0, grow * 1.3 - i * .1));
      for (let x = X0; x <= xe; x += 4) {
        const u = (x - X0) / (X1 - X0) * Math.PI * 2;
        let v;
        if (wv.sum) v = waves.slice(0, 3).reduce((s, q) => s + q.a * Math.sin(u * q.f - t * 2 * q.f / 2), 0) * .8;
        else v = wv.a * Math.sin(u * wv.f - t * wv.f);
        d += (x === X0 ? 'M' : 'L') + x + ' ' + (wv.y + v);
      }
      paths[i].setAttribute('d', d);
    });
    raf = requestAnimationFrame(loop);
  }
  loop();
  return { update() {}, destroy() { L.kill(); setTimeout(() => cancelAnimationFrame(raf), 900); } };
};

// Стена из 150 реальных офферов.
MODS.wall = (mode) => {
  const L = layer('wall');
  const cols = 25, rows = 6, sx = 72, sy = 116;
  const x0 = (W - (cols - 1) * sx - 66) / 2, y0 = 210;
  const hot = new Set([3, 17, 22, 31, 44, 58, 63, 77, 86, 98, 104, 119, 127, 133, 146]);
  const tiles = [];
  for (let i = 0; i < cols * rows; i++) {
    const im = cardEl(i, true, 62, 'tile' + (hot.has(i) ? ' hot-c' : ''));
    const c = i % cols, r = Math.floor(i / cols);
    im.style.left = (x0 + c * sx) + 'px'; im.style.top = (y0 + r * sy) + 'px';
    im.style.transitionDelay = ((c + r * 2) * 28) + 'ms';
    L.appendChild(im); tiles.push(im);
  }
  const cnt = document.createElement('div'); cnt.className = 'cnt'; cnt.textContent = '0';
  L.appendChild(cnt);
  let n = 0;
  const iv = setInterval(() => { n = Math.min(150, n + 3); cnt.textContent = n; if (n >= 150) clearInterval(iv); }, 22);
  function setMode(m) {
    L.classList.toggle('judge', m === 2);
    tiles.forEach((t, i) => t.classList.toggle('hot', m === 2 && hot.has(i)));
  }
  setTimeout(() => setMode(mode), 30);
  return { update: setMode, destroy() { clearInterval(iv); L.kill(); } };
};

// Горизонтальные полки, которые едут с разной скоростью.
MODS.shelves = () => {
  const L = layer();
  const rows = [
    { t: 'Кэшбэк рядом', list: [...Array(14).keys()], pic: true, sp: 70 },
    { t: 'Промокоды', list: [...ASSETS.promo, ...ASSETS.promo, ...ASSETS.promo].slice(0, 14), sp: 52 },
    { t: 'Для вас', list: [...Array(14).keys()].map(k => k + 20), pic: false, sp: 86 },
  ];
  rows.forEach((r, i) => {
    const s = document.createElement('div'); s.className = 'shelf';
    s.style.top = (180 + i * 290) + 'px';
    s.innerHTML = `<h3>${r.t}</h3>`;
    const trk = document.createElement('div'); trk.className = 'trk';
    trk.style.setProperty('--t', r.sp + 's');
    if (i % 2) trk.style.animationDirection = 'reverse';
    [...r.list, ...r.list].forEach(src => {
      if (typeof src === 'number') { trk.appendChild(cardEl(src, r.pic, 230 * CARD_W / CARD_H)); return; }
      const im = document.createElement('img'); im.src = enc(src); trk.appendChild(im);
    });
    s.appendChild(trk); L.appendChild(s);
    s.animate([{ opacity: 0, transform: 'translateX(300px)' }, { opacity: 1, transform: 'none' }],
      { duration: 1100, delay: 150 + i * 140, easing: 'cubic-bezier(.16,.84,.12,1)', fill: 'backwards' });
  });
  return { update() {}, destroy() { L.kill(); } };
};

// Живой сайт внутри слайда. iframe лежит вне масштабируемой сцены (position: fixed, реальные пиксели),
// иначе мышь внутри CSS-масштабированного iframe работает ненадёжно.
// Когда курсор уходит с iframe, фокус возвращается презентации, чтобы стрелки снова листали слайды.
MODS.iframe = (mode, opt = {}) => {
  const box = opt.box || [56, 96, 1808, 916];
  const f = document.createElement('iframe');
  f.src = opt.src;
  f.allow = 'fullscreen';
  f.style.cssText = 'position:fixed;border:0;background:#fff;z-index:40;opacity:0;transition:opacity .9s cubic-bezier(.77,0,.18,1);box-shadow:0 30px 60px -30px rgba(0,0,0,.35)';
  const place = () => {
    const r = stage.getBoundingClientRect(), k = r.width / W;
    Object.assign(f.style, { left: r.left + box[0] * k + 'px', top: r.top + box[1] * k + 'px',
      width: box[2] * k + 'px', height: box[3] * k + 'px', borderRadius: 24 * k + 'px' });
  };
  place(); addEventListener('resize', place);
  document.body.appendChild(f);
  requestAnimationFrame(() => requestAnimationFrame(() => f.style.opacity = 1));

  let hover = false;
  const refocus = () => { f.blur(); window.focus(); document.body.focus(); };
  // сайт может сам забрать фокус при загрузке — возвращаем, пока курсор не над ним
  const onBlur = () => setTimeout(() => { if (!hover && document.activeElement === f) refocus(); }, 0);
  f.addEventListener('mouseenter', () => { hover = true; });
  f.addEventListener('mouseleave', () => { hover = false; refocus(); });
  f.addEventListener('load', () => setTimeout(() => { if (!hover) refocus(); }, 300));
  addEventListener('blur', onBlur);
  return { update() {}, destroy() {
    removeEventListener('blur', onBlur); removeEventListener('resize', place); refocus();
    f.style.opacity = 0; f.style.pointerEvents = 'none'; setTimeout(() => f.remove(), 900);
  } };
};
