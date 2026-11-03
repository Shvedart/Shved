// Сцена 1920×1080. Каждый слайд описывает состояние «актёров» (id → свойства).
// Актёр с тем же id на следующем слайде плавно перетекает в новое состояние.
// Фигуры позиционируются по центру (x,y), текст — по левому верхнему углу (al:'c' — по центру).
const W = 1920, H = 1080;
const C = { paper:'#EEECE6', ink:'#0D0D0D', or:'#FF5B1F', mg:'#FF2E8A', bl:'#2E47FF', gr:'#178A4A', ye:'#FFC423',
  grey:'#BDB8AD', soft:'#E2DFD7', white:'#FAF9F6' };
const DUR = 1150, EASE = 'cubic-bezier(.77,0,.18,1)';
const stage = document.getElementById('stage');
const actors = new Map();
let SLIDES = [], cur = -1, cleanup = null, curMod = null;

const enc = p => encodeURI(p).replace(/#/g, '%23');
const isColor = v => /^(#|rgb|hsl|transparent|currentColor)/.test(v);

function makeEl(p) {
  const el = document.createElement(p.img ? 'img' : p.video ? 'video' : 'div');
  el.className = 'a';
  if (p.img) { el.draggable = false; el.decoding = 'async'; }
  // видео всегда без звука, крутится по кругу
  if (p.video) { el.muted = true; el.loop = true; el.playsInline = true; el.preload = 'auto'; }
  stage.insertBefore(el, document.getElementById('hud'));
  return el;
}

function apply(a, p) {
  const el = a.el, s = el.style, txt = p.txt != null;
  const dur = p.dur ?? DUR, d = p.d ?? 0, ease = p.ease ?? EASE;
  s.transition = `all ${dur}ms ${ease} ${d}ms`;
  const w = p.w ?? (txt ? null : 100), h = p.h ?? (txt ? null : 100);
  const x = p.x ?? 0, y = p.y ?? 0, rot = p.rot ?? 0, sc = p.sc ?? 1;
  if (txt) {
    const ax = p.al === 'c' ? ' - 50%' : p.al === 'r' ? ' - 100%' : '';
    s.transformOrigin = p.al === 'c' ? '50% 0' : p.al === 'r' ? '100% 0' : '0 0';
    s.translate = ax ? `calc(${x}px${ax}) ${y}px` : `${x}px ${y}px`;
    s.transform = `rotate(${rot}deg) scale(${sc})`;
    s.width = w != null ? w + 'px' : 'max-content';
    s.textAlign = p.al === 'c' ? 'center' : p.al === 'r' ? 'right' : 'left';
    s.fontSize = (p.fs ?? 140) + 'px';
    s.fontWeight = p.fw ?? 700;
    s.lineHeight = p.lh ?? '';
    s.letterSpacing = p.ls ?? '';
    s.whiteSpace = p.wrap ? 'normal' : '';
  } else {
    s.translate = `${x - w / 2}px ${y - h / 2}px`;
    s.transform = `rotate(${rot}deg) scale(${sc})`;
    s.width = w + 'px'; s.height = h + 'px';
  }
  s.opacity = p.op ?? 1;
  s.color = p.c ?? '';
  const bg = p.bg ?? 'transparent';
  if (isColor(bg)) { s.backgroundColor = bg; s.backgroundImage = 'none'; }
  else { s.backgroundColor = 'transparent'; s.backgroundImage = bg; }
  s.borderRadius = p.r == null ? '0px' : typeof p.r === 'number' ? p.r + 'px' : p.r;
  s.border = p.b ?? 'none';
  s.boxShadow = p.sh ?? 'none';
  s.filter = p.filter ?? 'none';
  s.clipPath = p.cp ?? 'none';
  s.zIndex = p.z ?? '';
  s.mixBlendMode = p.blend ?? '';
  if (a.stKeys) a.stKeys.forEach(k => s[k] = '');
  a.stKeys = p.st ? Object.keys(p.st) : null;
  if (p.st) Object.assign(s, p.st);
  const keep = txt ? ['shown', 'out'].filter(c => el.classList.contains(c)).map(c => ' ' + c).join('') : '';
  const cls = 'a' + (txt ? ' t' : '') + (p.card ? ' oc' : '') + (p.cls ? ' ' + p.cls : '') + keep;
  if (el.className !== cls) el.className = cls;
  if (p.img && el.getAttribute('data-src') !== p.img) { el.setAttribute('data-src', p.img); el.src = enc(p.img); }
  if (p.img) s.objectFit = p.fit ?? 'cover';
  if (p.video && el.getAttribute('data-src') !== p.video) { el.setAttribute('data-src', p.video); el.src = enc(p.video); }
  if (p.video) s.objectFit = p.fit ?? 'cover';
  if (p.card) {
    const tile = p.card.kind === 'tile';
    const key = p.card.i + (tile ? 't' : p.card.pic === false ? 'n' : 'p');
    if (a.cardKey !== key) { a.cardKey = key; a.dateKey = ''; el.innerHTML = tile ? tileHTML(p.card.i) : cardHTML(p.card.i, p.card.pic !== false); }
    s.setProperty('--k', w / (tile ? TILE_W : CARD_W));
    // внутренний масштаб карточки анимируется синхронно с её рамкой
    s.setProperty('--tr', `${dur}ms ${ease} ${d}ms`);
    if (tile) s.setProperty('--tbg', p.card.bg || 'rgba(0,16,36,.03)');
    // срок можно подменить на конкретном слайде, не пересобирая карточку
    const dk = (p.card.date || '') + (p.card.urgent ? '!' : '');
    if (!tile && a.dateKey !== dk) {
      a.dateKey = dk;
      const dd = el.querySelector('.oc-d');
      if (dd) dd.innerHTML = dateHTML(offerAt(p.card.i), p.card.date, p.card.urgent);
    }
  }
  if (!txt && !p.card) {
    const ic = p.inner || '';
    let i = el.firstElementChild;
    if (ic && !i) { i = document.createElement('i'); el.appendChild(i); }
    if (i) { if (!ic) i.remove(); else { i.className = ic; i.style.cssText = p.istyle || ''; } }
  }
  a.p = p;
}

// *слово* — оранжевый акцент, _слово_ — маджента, ~слово~ — глитч, %слово% — шрифт MV-SKIFER, \n — перенос
function wordHTML(w, i, base) {
  let cls = '', t = w, pre = '';
  const m = /^(.*?)([*_~^%])(.+)\2([.,!?»:]*)$/.exec(w);
  if (m) { pre = m[1]; t = m[3] + m[4]; cls = { '*': 'acc', '_': 'mgc', '~': 'gl', '^': 'mute', '%': 'sk' }[m[2]]; }
  const inner = pre + (cls === 'gl' ? `<span class="gl" data-t="${t}">${t}</span>` : cls ? `<span class="${cls}">${t}</span>` : t);
  return `<span class="w"><span style="transition-delay:${base + i * 55}ms">${inner}</span></span>`;
}
function reveal(a, p, swap) {
  const el = a.el;
  const tok = a.tok = (a.tok || 0) + 1;
  a.txt = p.txt;
  if (swap && el.classList.contains('shown') && el.innerHTML) {
    el.classList.add('out');
    setTimeout(() => { if (a.tok === tok) { el.classList.remove('out'); reveal(a, { ...p, d: 0 }); } }, 420);
    return;
  }
  el.classList.remove('out');
  let i = 0;
  const base = (p.d ?? 0) + (p.rd ?? 120);
  el.innerHTML = p.txt.split('\n').map(line =>
    line.split(' ').filter(Boolean).map(w => wordHTML(w, i++, base)).join(' ')).join('<br>');
  el.classList.remove('shown');
  void el.offsetWidth;
  el.classList.add('shown');
  a.txt = p.txt;
}

const kind = p => p.txt != null ? 't' : p.img ? 'i' : p.video ? 'v' : p.card ? 'c' : 's';

function setActor(id, p) {
  let a = actors.get(id);
  // тот же id, но другой тип (текст ↔ фигура ↔ картинка) — пересоздаём, иначе остаётся старое содержимое
  if (a && a.p && kind(a.p) !== kind(p)) {
    const old = a.el; old.style.transition = 'opacity .35s'; old.style.opacity = 0;
    setTimeout(() => old.remove(), 400);
    actors.delete(id); a = null;
  }
  if (!a) {
    a = { el: makeEl(p), p: null, vis: false };
    actors.set(id, a);
    const from = p.from ?? (p.txt != null ? {} : { op: 0, sc: .3 });
    apply(a, { ...p, op: 0, ...from, dur: 0, d: 0 });
    if (p.txt != null) a.el.innerHTML = '';
    void a.el.offsetWidth;
  } else if (!a.vis && p.from) {
    apply(a, { ...p, op: 0, ...p.from, dur: 0, d: 0 });
    void a.el.offsetWidth;
  }
  const wasVis = a.vis;
  apply(a, p);
  a.vis = (p.op ?? 1) > 0;
  if (p.txt != null && (!wasVis || a.txt !== p.txt)) reveal(a, p, wasVis);
  if (p.video && a.vis && !wasVis) { a.el.currentTime = 0; a.el.play().catch(() => {}); }
}

const ctx = {
  timers: [],
  set(id, patch) {
    const a = actors.get(id); if (!a) return;
    const p = { ...a.p, d: 0, ...patch };
    const txtChanged = patch.txt != null && patch.txt !== a.txt;
    apply(a, p); a.vis = (p.op ?? 1) > 0;
    if (txtChanged) reveal(a, p, a.vis);
  },
  get(id) { return actors.get(id); },
  after(ms, f) { this.timers.push(setTimeout(f, ms)); },
  every(ms, f) { this.timers.push(setInterval(f, ms)); },
  clear() { this.timers.forEach(t => { clearTimeout(t); clearInterval(t); }); this.timers = []; }
};

function go(i) {
  i = Math.max(0, Math.min(SLIDES.length - 1, i));
  if (i === cur) return;
  ctx.clear();
  if (cleanup) { cleanup(); cleanup = null; }
  cur = i;
  const sl = SLIDES[i]();
  document.body.style.backgroundColor = sl.bg || C.paper;
  document.body.classList.toggle('dark', !!sl.dark);
  document.getElementById('num').textContent = String(i + 1).padStart(2, '0');
  document.querySelector('#bar i').style.width = ((i + 1) / SLIDES.length * 100) + '%';
  history.replaceState(null, '', '#' + (i + 1));

  const seen = new Set();
  for (const [id, p] of Object.entries(sl.a || {})) { seen.add(id); setActor(id, p); }
  for (const [id, a] of actors) {
    if (seen.has(id) || !a.vis) continue;
    apply(a, { ...a.p, op: 0, d: 0, dur: 650, cls: a.p.txt != null ? a.p.cls : '', ...(a.p.out || {}) });
    a.vis = false;
  }

  if (sl.mod) {
    if (curMod && curMod.key === sl.mod.key) curMod.inst.update(sl.mod.mode);
    else { if (curMod) curMod.inst.destroy(); curMod = { key: sl.mod.key, inst: MODS[sl.mod.key](sl.mod.mode, sl.mod) }; }
  } else if (curMod) { curMod.inst.destroy(); curMod = null; }

  if (sl.run) cleanup = sl.run(ctx) || null;
}

function layer(cls = '') {
  const el = document.createElement('div');
  el.className = 'layer ' + cls;
  stage.insertBefore(el, document.getElementById('hud'));
  requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('on')));
  el.kill = () => { el.classList.remove('on'); setTimeout(() => el.remove(), 900); };
  return el;
}

function fit() {
  const s = Math.min(innerWidth / W, innerHeight / H);
  stage.style.transform = `translate(${(innerWidth - W * s) / 2}px,${(innerHeight - H * s) / 2}px) scale(${s})`;
  stage.scale = s;
  stage.ox = (innerWidth - W * s) / 2; stage.oy = (innerHeight - H * s) / 2;
}
const toStage = (e) => ({ x: (e.clientX - stage.ox) / stage.scale, y: (e.clientY - stage.oy) / stage.scale });

function preload(list) {
  let k = 0;
  const next = () => { if (k >= list.length) return; const im = new Image(); im.onload = im.onerror = next; im.src = enc(list[k++]); };
  for (let n = 0; n < 6; n++) next();
}

function start() {
  document.getElementById('tot').textContent = SLIDES.length;
  fit(); addEventListener('resize', fit);
  addEventListener('keydown', e => {
    if (['ArrowRight', 'PageDown', ' ', 'Enter'].includes(e.key)) { e.preventDefault(); go(cur + 1); }
    else if (['ArrowLeft', 'PageUp', 'Backspace'].includes(e.key)) { e.preventDefault(); go(cur - 1); }
    else if (e.key === 'Home') go(0);
    else if (e.key === 'End') go(SLIDES.length - 1);
    else if (e.key === 'f' || e.key === 'а') {
      if (!document.fullscreenElement) document.documentElement.requestFullscreen?.(); else document.exitFullscreen?.();
    }
  });
  let mt;
  addEventListener('mousemove', () => { document.body.classList.add('cur'); clearTimeout(mt); mt = setTimeout(() => document.body.classList.remove('cur'), 1800); });
  const h = parseInt(location.hash.slice(1));
  go(h > 0 ? h - 1 : 0);
  preload([...ASSETS.asis.map(f => ASSETS.asisDir + f), ...OFFERS.flatMap(o => [o.img, o.logo]), ...ASSETS.promo]);
}
