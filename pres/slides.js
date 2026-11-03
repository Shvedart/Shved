// ───────── helpers ─────────
const T = (txt, x, y, fs = 140, o = {}) => ({ txt, x, y, fs, ...o });
const cap = (txt, x, y, o = {}) => ({ txt, x, y, fs: 30, fw: 500, cls: 'cap', ...o });
const R = (x, y, w, h, bg, o = {}) => ({ x, y, w, h, bg, r: 0, ...o });
const O = (x, y, d, bg, o = {}) => ({ x, y, w: d, h: d, bg, r: '50%', ...o });
const A = f => ASSETS.asisDir + f;
const IMG = {
  kenwood: A('multi‑offer-1.png'), litres: A('multi‑offer-2.png'), sber: A('multi‑offer-3.png'), tasty: A('multi‑offer-4.png'),
  rayon: A('multi‑offer-5.png'), train: A('multi‑offer-6.png'), spec: A('multi‑offer.png'), list: A('multi‑offer.jpg'),
  garden: A('offer-big-1.png'), hotel: A('offer-big-2.png'), shop: A('offer-big-3.png'), divinare: A('offer-big.png'),
};
const RATIO = { kenwood: 456 / 541, litres: 456 / 541, sber: 456 / 541, tasty: 455 / 541, rayon: 503 / 541, train: 456 / 543,
  spec: 407 / 541, list: 1877 / 1179, garden: 401 / 541, hotel: 402 / 541, shop: 401 / 541, divinare: 402 / 541 };
const merge = (...o) => Object.assign({}, ...o);
const SH = '0 30px 60px -30px rgba(0,0,0,.35)';

// сетки кругов первого слайда
const neat = (cx, cy, step, d, accent) => {
  const o = {};
  for (let i = 0; i < 9; i++) o['g' + i] = O(cx + (i % 3 - 1) * step, cy + (Math.floor(i / 3) - 1) * step, d, accent && i === 4 ? C.or : C.ink, { d: i * 35 });
  return o;
};
const MESS = [[1250, 300, 170, C.or, '50%', 0], [1520, 240, 90, C.ink, '0px', 20], [1720, 400, 150, C.bl, '50%', 0],
  [1390, 520, 64, C.mg, '50%', 0], [1580, 600, 210, C.ye, '14px', -14], [1230, 650, 110, C.ink, '50%', 0],
  [1780, 690, 70, C.gr, '0px', 35], [1450, 370, 44, C.ink, '50%', 0], [1690, 170, 52, C.or, '0px', 12]];
const messy = (k = 1, ox = 0, oy = 0, cx = 1500, cy = 430) => {
  const o = {};
  MESS.forEach(([x, y, d, bg, r, rot], i) => o['h' + i] = { x: ox + cx + (x - cx) * k, y: oy + cy + (y - cy) * k, w: d * k, h: d * k, bg, r, rot, d: i * 35 });
  return o;
};

// качели: предметы стоят на балке и поворачиваются вместе с ней
function seesaw(a, items, extra = {}, py = 640) {
  const P = { x: 960, y: py }, rad = a * Math.PI / 180;
  const ux = Math.cos(rad), uy = Math.sin(rad), nx = Math.sin(rad), ny = -Math.cos(rad);
  const o = {
    beam: R(P.x, P.y, 1300, 12, C.ink, { rot: a, ...extra }),
    fulc: R(P.x, P.y + 6 + 60, 140, 120, C.ink, { cp: 'polygon(50% 0,100% 100%,0 100%)', ...extra }),
    gnd: R(960, P.y + 127, 1808, 3, C.ink, extra),
  };
  for (const it of items) {
    const { s, lift = 0, id, ...rest } = it;
    const off = rest.h / 2 + 6 + lift;
    o[id] = { r: 0, ...rest, ...extra, x: P.x + ux * s + nx * off, y: P.y + uy * s + ny * off, rot: a };
  }
  return o;
}

// сетка скринов as-is 4×3 (раскладка из Figma); новые скрины лежат в fig/
const FIG = { metta: 'fig/metta.png', submarine: 'fig/submarine.png', ybiz: 'fig/ybiz.png', deparfum: 'fig/deparfum.png' };
const AS_GRID = [
  ['divinare', 204, 97, 268], ['metta', 588, 97, 268], ['submarine', 972, 97, 268], ['ybiz', 1356, 97, 268],
  ['garden', 204, 389, 267], ['shop', 588, 389, 267], ['deparfum', 972, 389, 267], ['hotel', 1356, 388, 268],
  ['sber', 204, 680, 303], ['train', 588, 681, 302], ['tasty', 972, 680, 303], ['kenwood', 1356, 680, 303],
];
function asisWall(w = 360) {
  const o = {};
  AS_GRID.forEach(([k, x, y, h], i) => {
    const c = i % 4, r = Math.floor(i / 4);
    o['as_' + k] = { img: IMG[k] || FIG[k], x: x + w / 2, y: y + h / 2, w, h, r: 22, sh: SH, fit: 'cover', d: (c + r) * 70, from: { op: 0, sc: .85, y: y + h / 2 + 80 } };
  });
  return o;
}

// балка между верхушками штилей (для восьмых нот)
const beam = (x1, y1, x2, y2, o = {}) => R((x1 + x2) / 2, (y1 + y2) / 2, Math.hypot(x2 - x1, y2 - y1) + 4, 8, C.ink,
  { rot: Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI, ...o });

// ритм-сетка 10×4 из кругов (слайды 8): cols — b/m на каждый круг, sizes — диаметры (≤1 — круг исчез)
const RG_IDS = [...[...Array(16).keys()].map(i => 'ra' + i), ...[...Array(16).keys()].map(i => 'rc' + i), ...[...Array(8).keys()].map(i => 'n' + i)];
const rhythmGrid = (cols, sizes) => {
  const a = {};
  RG_IDS.forEach((id, k) => {
    const c = k % 10, r = Math.floor(k / 10), d = sizes ? sizes[k] : 118;
    a[id] = O(285 + c * 150, 315 + r * 150, Math.max(d, 1), cols[k] === 'm' ? C.mg : C.bl, { op: d > 1 ? 1 : 0, d: (c + r) * 40 });
  });
  return a;
};
const RG_MIX = 'bmbmmbmbmm' + 'bbmmbmbmmb' + 'mmbbmmbmbm' + 'mbmbmmbmmb';
const RG_SIZES = [118, 118, 1, 118, 118, 59, 118, 118, 1, 118, 118, 59, 118, 1, 118, 118, 118, 59, 1, 118,
  1, 118, 59, 1, 118, 118, 118, 118, 59, 118, 118, 118, 1, 118, 59, 118, 1, 118, 118, 118];

// карточки новых офферов
const NC = (i, x, y, w, o = {}) => ({ card: { i }, x, y, w, h: w * CARD_H / CARD_W, ...o });
const NP = (i, x, y, w, o = {}) => ({ card: { i, pic: false }, x, y, w, h: w * CARD_H / CARD_W, ...o });
const PR = (i, x, y, w, o = {}) => ({ img: ASSETS.promo[i], x, y, w, h: w * 290 / 166, fit: 'contain', ...o });

// весы со стрелкой (слайды 26–28)
const scale = (o = {}) => ({
  plat: R(960, 744, 1240, 14, C.ink, { from: { op: 1, w: 0 } }),
  plb: R(960, 780, 60, 60, C.ink, { cp: 'polygon(50% 0,100% 100%,0 100%)' }),
  ...o,
});

// карточки без картинки (слайды 47–49); среди них популярные бренды:
// Магнит, Самокат, ВкусВилл, Лента, Пятёрочка, Спортмастер, restore
const FLAT = [15, 31, 9, 116, 7, 30, 99, 5, 41, 44, 48, 52, 55, 60, 64, 70];

// 48 — сплошной список карточек без картинки (49 строится поверх)
const flatList = () => {
  const a = {}, w = 170, step = 205, x0 = (W - 7 * step) / 2;
  for (let i = 0; i < 16; i++) {
    const c = i % 8, r = Math.floor(i / 8);
    a['lp' + i] = NP(FLAT[i], x0 + c * step, 330 + r * 310, w, { d: i * 35, from: { op: 0, y: 500 } });
  }
  for (let i = 0; i < 16; i++) a['rb' + i] = R(260 + i * 93, 990, 14, 50, C.ink, { d: 300 + i * 30 });
  a.tt = T('Ровно. Слишком ровно', 56, 70, 70);
  a.tc = cap('хочется больше ритма', 1780, 92, { al: 'r', fs: 30, c: C.or });
  return { bg: '#FFFFFF', a };
};

// вес = 0,05 кг на знак (с пробелами): «Кэшбэк 17%» — 10 знаков — 0,50 кг, как на прошлом слайде
const textKg = t => (t.length * .05).toFixed(2).replace('.', ',') + ' кг';

// 42 — сетка офферов «как в проде»: сначала с цветными фонами, на следующем слайде фон уходит
// цвета фонов — из Figma (цвет бренда, 50% прозрачности)
const TILES = [[0, '#0099cc'], [1, '#be216a'], [2, '#90adbf'], [3, '#00859a'], [4, '#af2a89'], [5, '#1551e5'], [7, '#003c96'], [8, '#00adff'], [9, '#ed1c24']];
const tileGrid = (colored) => {
  const a = {};
  TILES.forEach(([i, c], k) => {
    const col = k % 3, row = Math.floor(k / 3);
    a['tl' + k] = { card: { kind: 'tile', i, bg: colored ? hexA(c, .5) : 'rgba(0,16,36,.03)' }, x: 1143 + col * 243, y: 253.5 + row * 284,
      w: TILE_W, h: TILE_H, d: (col + row) * 70, from: { op: 0, y: 253.5 + row * 284 + 80 } };
  });
  return a;
};

// ───────── slides ─────────
SLIDES = [

// 1 — буква «Ц» (вектор из Figma)
() => ({ a: {
  ts: { img: 'fig/s01.svg', x: 959.5, y: 570.5, w: 363, h: 421, fit: 'contain', dur: 1400, from: { op: 0, sc: .7, y: 640 } },
} }),

// 3 — что такое красиво?
() => ({ a: {
  q1: T('что\nтакое\n%красиво%', 960, 380, 170, { al: 'c', lh: .66 }),
} }),

// 2 — антидизайн и «с днём овса»
() => ({ a: {
  im2a: { img: 'fig/s02a.png', x: 303.5, y: 540, w: 607, h: 1080, fit: 'cover', from: { op: 0, x: 200 } },
  im2b: { img: 'fig/s02b.png', x: 1147, y: 540, w: 1080, h: 1080, fit: 'cover', d: 150, from: { op: 0, y: 700 } },
} }),

// 4 — инструменты
() => {
  const xs = [270, 730, 1190, 1650], y = 450;
  const a = merge(neat(xs[3], y, 105, 64, true), {
    s1: { x: xs[0] - 76, y, w: 150, h: 300, bg: C.ink, r: '150px 0 0 150px', d: 100 },
    s2: { x: xs[0] + 76, y, w: 150, h: 300, bg: C.ink, r: '0 150px 150px 0', d: 160 },
    s3: R(xs[0], y, 2, 380, C.mg, { d: 300, from: { op: 1, h: 0 } }),
    hm0: O(xs[2], y, 300, 'transparent', { b: '3px solid ' + C.ink, d: 100 }),
    hm1: O(xs[2], y + 150 - 93, 186, C.bl, { d: 180 }),
    hm2: O(xs[2], y + 150 - 57, 115, C.ink, { d: 260 }),
  });
  [0, 1, 2, 3, 4].forEach(i => a['h' + i] = R(xs[1] + (i - 2) * 62, y, 22, 300 - (i % 2) * 90, C.ink, { d: 100 + i * 50 }));
  ['Симметрия', 'Ритм', 'Гармония', 'Акцент'].forEach((t, i) => {
    a['tl' + i] = T(t, xs[i], 700, 52, { al: 'c', d: 200 + i * 80 });
    a['tn' + i] = cap('0' + (i + 1), xs[i], 790, { al: 'c', fs: 22, d: 260 + i * 80, c: '#8a857b' });
  });
  return { a };
},

// 5 — графика / музыка
() => {
  const pat = [0, 1, 0, 1, 0, 1, 0, 1], X0 = 760, dx = 140, a = {};
  pat.forEach((s, i) => {
    const x = X0 + i * dx;
    a['pg' + i] = R(x, 347, s ? 90 : 40, s ? 90 : 40, s ? C.ink : C.or, { d: i * 50 });
    a['n' + i] = { x, y: 637 - (s ? 26 : 0), w: 50, h: 36, r: '50%', bg: C.ink, rot: -22, d: 200 + i * 50 };
    a['ns' + i] = R(x + 23, 637 - (s ? 26 : 0) - 58, 4, 116, C.ink, { d: 240 + i * 50 });
  });
  return { a: merge(a, {
    r1: T('Графика', 140, 307, 80), r2: T('Музыка', 140, 597, 80, { d: 120 }),
    rl: R(1250, 497, 1300, 2, 'rgba(13,13,13,.12)'),
    rc: cap('одна и та же закономерность — в трёх языках', 140, 960, { fs: 26, c: '#8a857b', d: 500 }),
  }) };
},

// 6 — ритм в музыке
() => {
  const a = {};
  for (let k = 0; k < 5; k++) a['st' + k] = R(1050, 330 + k * 36, 1500, 2.5, C.ink, { d: k * 60, from: { op: 1, w: 0 } });
  // ноты и паузы: позиции по x и ступень на нотном стане
  const N = [[420, 4], [520, 2], [620, 4], [820, 1], [880, 3], [940, 5], [1140, 2], [1240, 2], [1440, 6], [1500, 4], [1560, 2], [1740, 3]];
  N.forEach(([x, st], i) => {
    const y = 330 + 4 * 36 - st * 18;
    a['n' + i] = { x, y, w: 50, h: 36, r: '50%', bg: i === 8 ? C.or : C.ink, rot: -22, d: 300 + i * 90, from: { op: 0, y: y - 80 } };
    a['ns' + i] = R(x + 23, y - 58, 4, 116, i === 8 ? C.or : C.ink, { d: 330 + i * 90 });
  });
  a.bm0 = beam(443, 290, 543, 326, { d: 1300 });
  a.bm1 = beam(843, 344, 963, 272, { d: 1400 });
  a.bm2 = beam(1463, 254, 1583, 326, { d: 1500 });
  a.tt = T('Ритм', 140, 640, 220);
  a.tc = cap('последовательность нот и пауз\nсоздаёт ритмический рисунок', 150, 880, { fs: 32, d: 300 });
  return { a };
},

// 7 — ритм в графике
() => {
  const a = {}, X0 = 640;
  // A — монотонно
  for (let i = 0; i < 16; i++) a['ra' + i] = R(X0 + i * 74, 320, 22, 150, C.ink, { d: i * 25 });
  // B — меняем частоту (из нот)
  const bx = [0, 30, 60, 140, 220, 260, 300, 340, 520, 560, 760, 1100];
  bx.forEach((x, i) => a['n' + i] = { x: X0 + x, y: 580, w: i % 4 === 3 ? 70 : 22, h: 150, r: 0, bg: C.ink, rot: 0, d: i * 40 });
  // C — повторяем рисунок
  const motif = [[0, 60], [90, 22], [130, 22], [170, 22]];
  for (let i = 0; i < 16; i++) { const [mx, w] = motif[i % 4]; a['rc' + i] = R(X0 - 20 + Math.floor(i / 4) * 300 + mx + w / 2, 840, w, 150, i % 4 === 0 ? C.or : C.ink, { d: 200 + i * 30 }); }
  a.la = cap('монотонно — скучно', 140, 300, { fs: 30 });
  a.lb = cap('меняем частоту\nи интервалы', 140, 545, { fs: 30, d: 100 });
  a.lc = cap('повторяем\nполучившийся рисунок', 140, 805, { fs: 30, d: 200 });
  a.tt = T('Ритм в графике', 140, 70, 70);
  return { a };
},

// 8 — ритм: один цвет
() => ({ a: rhythmGrid('b'.repeat(40)) }),

// 8б — ритм цветом
() => ({ a: rhythmGrid(RG_MIX) }),

// 8в — ритм цветом и размером
() => ({ a: rhythmGrid(RG_MIX, RG_SIZES) }),

// 9 — гармония
() => {
  const a = {};
  const cl = [[1330, 470, 160, C.or], [1520, 600, 80, C.bl], [1610, 420, 120, C.ink], [1400, 700, 60, C.mg], [1700, 650, 50, C.or]];
  cl.forEach(([x, y, d, c], i) => a['ra' + i] = O(x, y, d, c, { d: i * 60 }));
  a.tt = T('Гармония', 140, 90, 120);
  a.lm = cap('в музыке — понятно:\nволны складываются в аккорд', 140, 860, { fs: 30, d: 400 });
  a.lg = cap('в графике — уже не очень', 1290, 860, { fs: 30, d: 500 });
  return { a, mod: { key: 'waves' } };
},

// 10 — много книг
() => {
  const a = {}, cols = [C.ink, C.bl, '#C9C4B9', C.ink, C.or, '#2B2B2B', C.ye, C.bl, C.ink];
  let y = 910;
  for (let i = 0; i < 9; i++) {
    const h = 56 + (i * 37 % 4) * 12, w = 560 + (i * 73 % 5) * 50;
    y -= h / 2;
    a['bk' + i] = R(1370 + ((i * 53) % 7 - 3) * 18, y, w, h, cols[i], { r: 4, rot: ((i * 31) % 5 - 2) * .7, d: i * 110, dur: 900, ease: 'cubic-bezier(.3,1.4,.5,1)', from: { op: 1, y: -200, rot: 20 } });
    y -= h / 2 + 4;
  }
  a.bk4.sh = '0 0 0 6px ' + C.paper + ', 0 0 0 9px ' + C.or;
  a.tt = T('Про гармонию\nнаписаны\nкучи книг', 140, 220, 110);
  a.tc = cap('сегодня — один из подходов →', 150, 640, { fs: 34, c: C.or, d: 1100 });
  return { a };
},

// 11 — закон Кулона
() => ({ bg: C.ink, dark: true, a: {
  q1: O(640, 515, 220, C.or, { d: 100 }), q2: O(1300, 515, 150, C.bl, { d: 200 }),
  q1t: T('+', 640, 427, 150, { al: 'c', c: C.ink, d: 300 }), q2t: T('−', 1300, 450, 120, { al: 'c', c: C.paper, d: 350 }),
  f0: O(640, 515, 220, 'transparent', { c: C.or, inner: 'ripple', d: 200 }),
  f1: O(640, 515, 220, 'transparent', { c: C.or, inner: 'ripple', istyle: 'animation-delay:-1s', d: 200 }),
  f2: O(640, 515, 220, 'transparent', { c: C.or, inner: 'ripple', istyle: 'animation-delay:-2s', d: 200 }),
  f3: O(1300, 515, 150, 'transparent', { c: C.bl, inner: 'ripple', istyle: 'animation-delay:-.5s', d: 300 }),
  f4: O(1300, 515, 150, 'transparent', { c: C.bl, inner: 'ripple', istyle: 'animation-delay:-1.5s', d: 300 }),
  rl: R(970, 515, 420, 2, 'rgba(238,236,230,.4)', { d: 400, from: { op: 1, w: 0 } }),
  fc: cap('Закон Кулона — взаимодействие электрических зарядов', 56, 938, { c: '#9A968D', fs: 28, d: 200 }),
  src: cap('по мотивам: ashapiro.ru/research/graphic-tension-simulator', 1780, 990, { al: 'r', fs: 20, c: '#77746D', d: 600 }),
} }),

// 12 — поле влияния: живой симулятор на весь слайд
// (страницу ashapiro.ru встроить iframe нельзя — сайт запрещает это заголовком X-Frame-Options)
() => ({ mod: { key: 'field', mode: 1, full: true }, a: {
  src: cap('по мотивам: ashapiro.ru/research/graphic-tension-simulator', 1780, 1000, { al: 'r', fs: 20, c: '#8a857b', d: 600 }),
} }),

// 12б — настоящий симулятор графического напряжения (iframe)
() => ({ mod: { key: 'iframe', src: 'https://x-raizor.github.io/graphic-tension-simulator/simulator.html' }, a: {} }),

// 16 — микс
() => {
  const a = {}, ch = ['бас', 'барабаны', 'гитара', 'клавиши', 'вокал', 'мастер'], cols = [C.or, C.mg, C.bl, C.gr, C.ye, C.ink];
  ch.forEach((t, i) => {
    const x = 870 + i * 170;
    a['mx' + i] = R(x, 470, 90, 560, C.soft, { r: 14, d: i * 60 });
    a['mv' + i] = R(x, 470, 90, 560, 'transparent', { r: 14, c: cols[i], inner: 'lvl', istyle: `--t:${(.55 + (i * .23) % .7).toFixed(2)}s;animation-delay:-${i * .3}s`, d: i * 60 + 100 });
    a['ml' + i] = cap(t, x, 780, { al: 'c', fs: 26, d: 300 + i * 60 });
  });
  a.tt = T('Важно,\nкак звучит\n*вместе*', 120, 200, 110);
  a.tc = cap('каждый инструмент\nвзаимодействует с остальными', 125, 620, { fs: 28 });
  return { a };
},

// 17 — визуальная масса
() => ({ a: {
  m_big: R(640, 740, 340, 340, C.ink),
  m_s0: R(1300, 825, 170, 170, C.ink, { d: 120 }),
  gnd: R(960, 911, 1808, 3, C.ink, { from: { op: 1, w: 0 } }),
  tt: T('Визуальная масса', 56, 100, 120),
  l1: cap('больше', 640, 950, { al: 'c', fs: 30, d: 300 }), l2: cap('меньше', 1300, 950, { al: 'c', fs: 30, d: 350 }),
} }),

// 18 — весы
() => ({ a: merge(seesaw(0, [
  { id: 'm_big', s: -400, w: 340, h: 340, bg: C.ink },
  { id: 'm_s0', s: 300, w: 170, h: 170, bg: C.ink, d: 100 }, { id: 'm_s1', s: 476, w: 170, h: 170, bg: C.ink, d: 160 },
  { id: 'm_s2', s: 300, w: 170, h: 170, bg: C.ink, lift: 176, d: 220 }, { id: 'm_s3', s: 476, w: 170, h: 170, bg: C.ink, lift: 176, d: 280 },
], {}, 817), {
  tt: T('1 большой = 4 маленьких', 56, 100, 96),
  tc: cap('при прочих равных', 56, 210, { fs: 30, c: '#8a857b', d: 300 }),
}) }),

// 19 — цвет тоже весит
() => {
  const xs = [274.5, 617.5, 959.5, 1302.5, 1645.5], cs = ['#DDD9CF', '#C2BDB2', '#959086', '#55524C', C.ink];
  const ids = ['m_big', 'sw1', 'sw2', 'sw3', 'm_s0'], a = {};
  ids.forEach((id, i) => a[id] = R(xs[i], 649.5, 269, 269, cs[i], { d: i * 80 }));
  a.tt = T('Но массу задаёт\nи *цвет*', 56, 100, 110);
  a.l1 = cap('← лёгкий', 140, 865, { fs: 30, d: 400 }); a.l2 = cap('тяжёлый →', 1780, 865, { al: 'r', fs: 30, d: 450 });
  return { a };
},

// 20 — большой чёрный перевешивает → светлеет → маленький чёрный перевешивает
() => {
  const items = big => [
    { id: 'm_big', s: -400, w: 340, h: 340, bg: big },
    { id: 'm_s0', s: 440, w: 170, h: 170, bg: C.ink, d: 100 },
  ];
  const tilt = (a, big, o) => { const st = seesaw(a, items(big), {}, 822); for (const id in st) st[id] = { ...st[id], ...o }; return st; };
  return { a: merge(tilt(-9, C.ink, {}), {
    tt: T('Большой — тяжелее', 140, 90, 70),
  }), run(c) {
    // большой светлеет
    c.after(2000, () => c.set('m_big', { bg: '#DCD8CE', dur: 900, ease: 'ease-in-out' }));
    // весы переваливаются на сторону маленького чёрного
    c.after(2900, () => {
      const o = tilt(9, '#DCD8CE', { d: 0, dur: 1500, ease: 'cubic-bezier(.6,0,.25,1.25)' });
      for (const id in o) c.set(id, o[id]);
      c.set('tt', { txt: 'Маленький, но контрастный — *тяжелее*' });
    });
  } };
},

// 21 — формула веса (тёмный и светлый варианты)
...[[C.ink, C.paper, C.paper], [C.paper, C.ink, '#DBD9D6']].map(([bg, fg, small]) => () => ({ bg, dark: bg === C.ink, a: {
  f1: T('Вес =', 140, 220, 190, { c: fg }),
  f2: T('размер ×', 140, 370, 190, { c: fg, d: 150 }),
  f3: T('*контраст*', 140, 520, 190, { c: fg, d: 300 }),
  m_big: O(1332, 726, 533, '#3A3935', { d: 200 }),
  m_s0: O(1723, 908, 170, small, { d: 350, z: 3 }),
  fc: cap('чем крупнее и контрастнее с окружением —\nтем больше визуальный вес', 145, 880, { c: '#9A968D', fs: 28, d: 500 }),
} })),

// 22 — дизайнер уравновешивает
() => {
  const items = [
    { id: 'm_big', s: -360, w: 300, h: 300, bg: '#55524C' }, { id: 'm_c', s: -580, w: 120, h: 120, bg: C.or, r: '50%', d: 80 },
    { id: 'm_s0', s: 300, w: 170, h: 170, bg: C.ink, d: 120 }, { id: 'm_s1', s: 490, w: 170, h: 170, bg: C.bl, d: 160 },
    { id: 'm_s2', s: 395, w: 110, h: 110, bg: C.mg, r: '50%', lift: 176, d: 200 },
  ];
  return { a: merge(seesaw(0, items, {}, 814), { tt: T('Дизайнер постоянно\n*уравновешивает*', 56, 90, 96) }),
    run(c) {
      const seq = [-4, 3.2, -2, 1.2, -.5, 0, 0, 2.5, -3, 1.5, 0, 0];
      let k = 0;
      c.after(1300, () => c.every(1250, () => {
        const o = seesaw(seq[k++ % seq.length], items, {}, 814);
        for (const id in o) c.set(id, { ...o[id], d: 0, dur: 1250, ease: 'cubic-bezier(.45,0,.55,1)' });
      }));
    } };
},

// 23 — печать
() => ({ a: {
  tt: T('Печать', 140, 382, 170),
  pimg: { img: 'fig/s24poster.png', x: 1369, y: 540, w: 532, h: 710, fit: 'cover', d: 200, from: { op: 0, y: 620 } },
  c3: cap('→ находим порядок, ритм, гармонию\nи расставляем акценты', 152, 572, { fs: 34, c: C.or, d: 300 }),
} }),

// 24 — почему в вебе так уёбищно?
() => {
  const px = 1460, a = {
    poster: R(1403, 545, 532, 710, C.white),
    pc0: O(px + 120, 300, 380, C.mg, { d: 100 }),
    pc5: R(px - 120, 180, 420, 12, C.ink, { rot: 25 }), pc6: R(px + 200, 900, 220, 12, C.ink, { rot: -40 }),
    pc7: R(1250, 496, 260, 12, C.ink, { rot: 80 }),
    tt: T('Почему в вебе\nтак часто всё\nвыглядит\n~уёбищно?~', 140, 190, 128),
  };
  [[-200, 420, 30], [260, 600, -18], [40, 700, 60], [-60, 350, -70]].forEach(([dx, y, r], i) => a['pb' + i] = R(px + dx, y, 16, 280, C.ink, { rot: r, d: i * 60 }));
  Object.assign(a.pb0, { x: 1301, y: 444, w: 111 });
  Object.assign(a.pb2, { x: 1471, y: 649, w: 133 });
  return { a };
},

// 25 — неопределённость
() => {
  const cx = 1330, a = {
    wf: R(cx, 540, 600, 760, '#FFFFFF', { r: 40, sh: SH }),
    wfi: R(cx, 340, 520, 300, 'transparent', { r: 24, inner: 'flick', d: 150 }),
    wfl: O(cx - 200, 800, 90, C.grey, { d: 300 }),
  };
  const LINES = [[540, 1.3, 420], [590, 1.9, 360], [640, 1.1, 300], [690, 2.3, 400]];
  LINES.forEach(([y, t, w], i) =>
    a['wl' + i] = { x: cx - 260 + w / 2, y, w, h: i ? 18 : 34, r: 6, bg: 'transparent', inner: 'grow', istyle: `--t:${t}s;animation-delay:-${i * .4}s`, d: 200 + i * 60 });
  a.tt = T('Высокая\nнеопределённость', 140, 140, 86);
  a.c1 = cap('сколько придёт текста?', 145, 480, { fs: 36, d: 300 });
  a.c2 = cap('какая будет картинка?', 145, 540, { fs: 36, d: 400 });
  a.c3 = cap('насколько контрастная?', 145, 600, { fs: 36, d: 500 });
  a.c4 = cap('какой у неё визуальный вес?', 145, 660, { fs: 36, d: 600, c: C.or });
  a.c5 = cap('мы проектируем на динамических данных', 145, 860, { fs: 26, c: '#8a857b', d: 700 });
  // картинка меняет высоту (верх прибит к карточке), строки текста едут следом
  return { a, run(c) {
    const hs = [170, 360, 240, 320, 190, 300];
    let k = 0;
    c.every(1400, () => {
      const h = hs[k++ % hs.length], dy = h - 300, mv = { d: 0, dur: 900, ease: 'cubic-bezier(.65,0,.35,1)' };
      c.set('wfi', { ...mv, h, y: 190 + h / 2 });
      LINES.forEach(([y], i) => c.set('wl' + i, { ...mv, y: y + dy }));
    });
  } };
},

// 26 — прямоугольник = 1 кг
() => ({ a: scale({
  kg: R(960, 547, 1000, 380, C.ink),
  kgd: T('1,00 кг', 960, 850, 120, { al: 'c' }),
  kgc: cap('представим, что прямоугольник весит один килограмм', 960, 150, { al: 'c', fs: 32 }),
}) }),

// 27 — вырезали буквы
() => ({ a: scale({
  kgt: T('Кэшбэк 17%', 960, 527, 150, { al: 'c', z: 2 }),
  kgd: T('0,50 кг', 960, 850, 120, { al: 'c' }),
  kgc: cap('высекли текст — масса стала меньше', 960, 150, { al: 'c', fs: 32 }),
}) }),

// 28 — меняем текст: чем больше текста, тем больше вес
() => ({ a: scale({
  kgt: T('Кэшбэк 5%', 960, 527, 150, { al: 'c', z: 2 }),
  kgd: T(textKg('Кэшбэк 5%'), 960, 850, 120, { al: 'c' }),
  kgc: cap('чем меньше текста — тем меньше вес, чем больше — тем больше', 960, 150, { al: 'c', fs: 32 }),
}), run(c) {
  const v = ['5%', 'Кэшбэк 5%', 'Кэшбэк до 15%', 'Скидка 20%', 'Кэшбэк 3% на всё', 'Кэшбэк 5%'];
  let k = 0;
  c.every(2000, () => { const t = v[k++ % v.length]; c.set('kgt', { txt: t, rd: 0 }); c.set('kgd', { txt: textKg(t), rd: 0 }); });
} }),

// 29 — графическое напряжение
() => {
  const t = 'Кэшбэк до 50 000 ₽\nза первую покупку\nонлайн до 31 декабря\nбез регистрации и смс VIP PRO MAX';
  // вес по тому же правилу, что на прошлом слайде: 0,05 кг на знак
  const kg = textKg(t.replace(/\n/g, ' ')).split(' ');
  return { a: {
  plat: R(960, 664, 1240, 14, C.ink, { rot: -5 }), plb: R(960, 700, 60, 60, C.ink, { cp: 'polygon(50% 0,100% 100%,0 100%)' }),
  kgt: T(t, 960, 248, 84, { al: 'c', z: 2, lh: 1, cls: 'shake' }),
  kgd: T(`_${kg[0]}_ _${kg[1]}_`, 960, 770, 120, { al: 'c' }),
  kgc: T('_Графическое_ _напряжение_', 960, 110, 84, { al: 'c' }),
} };
},

// 30 — наши офферы
() => ({ a: {
  tt: T('Наши\n*офферы*', 140, 300, 230),
  as_hotel: { img: IMG.hotel, x: 1340, y: 330, w: 620, h: 620 * RATIO.hotel, r: 26, rot: 4, sh: SH, from: { op: 0, y: 600, rot: 12 } },
  as_kenwood: { img: IMG.kenwood, x: 1460, y: 730, w: 560, h: 560 * RATIO.kenwood, r: 26, rot: -3, sh: SH, d: 150, from: { op: 0, y: 1000, rot: -12 } },
} }),

// 31 — анатомия оффера: скрины с разметкой (композиция из Figma)
() => {
  const xs = [403, 947, 1503];
  return { a: {
    an_comp: { img: 'fig/s31.png', x: 957.5, y: 411, w: 1343, h: 538, fit: 'contain', from: { op: 0, y: 480 } },
    an_l0: T('Картинка', xs[0], 730, 64, { al: 'c', d: 200 }), an_s0: cap('создаёт настроение', xs[0], 820, { al: 'c', fs: 30, d: 300, c: '#8a857b' }),
    an_l1: T('Логотип', xs[1], 730, 64, { al: 'c', d: 260 }), an_s1: cap('бренд', xs[1], 820, { al: 'c', fs: 30, d: 360, c: '#8a857b' }),
    an_l2: T('Текст', xs[2], 730, 64, { al: 'c', d: 320 }), an_s2: cap('информация о выгоде', xs[2], 820, { al: 'c', fs: 30, d: 420, c: '#8a857b' }),
  } };
},

// 32 — три формата (композиция из Figma)
() => ({ a: {
  f_all: { img: 'fig/s32.png', x: 960, y: 540.5, w: 1808, h: 487, fit: 'contain', d: 100, from: { op: 0, y: 620 } },
  tt: cap('три формата', 56, 70, { fs: 30, c: '#8a857b' }),
} }),

// 33 — as-is вместе
() => ({ a: asisWall() }),

// 34 — шум
() => {
  const a = asisWall();
  for (const k in a) { a[k].filter = 'blur(5px) saturate(1.6)'; a[k].cls = 'shake'; a[k].d = 0; a[k].st = { animationDelay: (Math.random() * -1).toFixed(2) + 's' }; }
  a.nz = R(960, 540, 1920, 1080, 'transparent', { inner: 'noise', op: .35, z: 6, blend: 'multiply' });
  a.tt = T('Шум', 960, 300, 420, { al: 'c', z: 7, c: C.ink });
  a.tc = cap('каждый оффер создавался отдельно — они ничего не знают\nдруг о друге и конкурируют за внимание', 960, 760, { al: 'c', fs: 34, z: 7, d: 400, c: C.ink, bg: C.paper, st: { padding: '14px 26px' } });
  return { a };
},

// 35 — лента: блоки тасуются внутри телефона
() => {
  const pool = ['submarine', 'tasty', 'hotel', 'metta', 'train', 'divinare'];
  const H = { submarine: 304, tasty: 343, hotel: 304, metta: 304, train: 343, divinare: 303 };
  const place = (order) => {
    const o = {}; let y = 64;
    const top = {}; order.forEach(i => { top[i] = y; y += H[pool[i]] + 13; });
    pool.forEach((k, i) => {
      const on = order.includes(i), h = H[k], t = on ? top[i] : 64 + (i % 3) * 330;
      o['as_' + k] = { img: IMG[k] || FIG[k], x: 1320, y: t + h / 2, w: 408, h, r: 25, fit: 'cover', op: on ? 1 : 0, sc: on ? 1 : .85, z: 3 };
    });
    return o;
  };
  return { a: merge(place([0, 1, 2]), {
    ph: R(1320, 540, 470, 960, '#E8E8E8', { r: 66 }),
    phm: R(1320, 1050, 560, 60, C.paper, { z: 4 }),
    phb: R(1320, 540, 470, 960, 'transparent', { r: 66, b: '14px solid ' + C.ink, z: 5 }),
    tt: T('Лента', 140, 200, 200),
    tc: cap('непредсказуемо не только\nсодержимое блоков —\nно и сами блоки, их места\nи сочетания', 145, 500, { fs: 34 }),
  }), run(c) {
    const orders = [[3, 4, 2], [5, 1, 3], [2, 0, 5], [4, 3, 1], [0, 1, 2]]; let k = 0;
    c.every(1500, () => { const o = place(orders[k++ % orders.length]); for (const id in o) c.set(id, { ...o[id], dur: 900 }); });
  } };
},

// 36 — балансир (фото из Figma, кубики меняются между слайдами)
() => ({ a: {
  bal0: { img: 'fig/s36a.png', x: 960, y: 540, w: 1920, h: 1072, fit: 'cover', from: { op: 0, sc: 1.04 } },
  tt: T('Балансир', 56, 80, 150, { z: 3 }),
  tc: cap('всё держится, пока известны веса', 61, 250, { fs: 30, z: 3 }),
} }),

// 37 — разные плоскости
() => ({ a: {
  bal0: { img: 'fig/s36a.png', x: 960, y: 540, w: 1920, h: 1072, fit: 'cover' },
  bal1: { img: 'fig/s36b.png', x: 960, y: 540, w: 1920, h: 1072, fit: 'cover', z: 1, from: { op: 0, sc: 1 } },
  tt: T('Разные\nплоскости', 56, 80, 150, { z: 3 }),
} }),

// 38 — неизвестная масса
() => ({ a: {
  bal1: { img: 'fig/s36b.png', x: 960, y: 540, w: 1920, h: 1072, fit: 'cover', z: 1 },
  bal2: { video: 'hf_20261103_085557_c41fa7a9-e959-4eeb-ad41-db77be9019d6.mp4', x: 960, y: 540, w: 1920, h: 1080, fit: 'cover', z: 2, from: { op: 0, sc: 1 } },
  tt: T('Масса —\nнеизвестна', 56, 80, 120, { z: 3 }),
} }),

// 39 — мы проигрываем
() => ({ a: {
  tt: T('И в такой игре\nмы будем\n_проигрывать_', 140, 300, 140),
} }),

// 40 — баги на проде
() => {
  const items = [
    ['kenwood', 'светлый текст\nна светлом фоне', [.51, .10, .85, .25]],
    ['tasty', 'выгоду не прочитать', [.13, .09, .96, .25]],
    ['spec', 'текст растворяется\nв фоне', [.08, .25, .38, .46]],
    ['divinare', 'текст на фото\nпропадает', [.03, .07, .45, .36]],
  ];
  const w = 420, gap = 34, x0 = (W - (4 * w + 3 * gap)) / 2 + w / 2, cy = 540, a = {};
  items.forEach(([k, t, [x1, y1, x2, y2]], i) => {
    const h = w * RATIO[k], x = x0 + i * (w + gap);
    a['as_' + k] = { img: IMG[k], x, y: cy, w, h, r: 22, sh: SH, fit: 'cover', d: i * 60 };
    const L = x - w / 2, Tp = cy - h / 2;
    a['hl' + i] = { x: L + w * (x1 + x2) / 2, y: Tp + h * (y1 + y2) / 2, w: w * (x2 - x1) + 16, h: h * (y2 - y1) + 16, r: 12, b: '4px solid ' + C.mg, d: 700 + i * 150, from: { op: 0, sc: 1.4 }, z: 3 };
    a['bc' + i] = cap(t, L, cy + h / 2 + 34, { fs: 26, d: 800 + i * 150 });
  });
  a.tt = T('А ещё — просто баги', 56, 100, 90);
  return { a };
},

// 41 — что мы можем сделать?
() => ({ a: { tt: T('Что мы можем\nсделать*?*', 255, 330, 200) } }),

// 42 — убрать лишний вес: цветные фоны карточек
() => ({ bg: '#FFFFFF', a: merge(tileGrid(true), {
  tt: T('Убрать\nлишний вес', 56, 180, 120),
  c1: cap('основную тяжесть дают фоновые цвета:\nсильный и непредсказуемый контраст', 145, 470, { fs: 30 }),
}) }),

// 42б — фон убрали (#001024, 3%), выгода выходит на первый план
() => ({ bg: '#FFFFFF', a: merge(tileGrid(false), {
  tt: T('Убрать\nлишний вес', 56, 180, 120),
  c1: cap('основную тяжесть дают фоновые цвета:\nсильный и непредсказуемый контраст', 145, 470, { fs: 30 }),
}), run(c) { c.after(1600, () => c.set('tt', { txt: 'Выделить\n*выгоду*' })); } }),

// 43 — выгода · настроение · бренд
() => ({ bg: '#FFFFFF', a: {
  nc: NC(18, 960.5, 149 + 495 * CARD_H / CARD_W / 2, 495, { from: { op: 0, sc: .9 } }),
  ln0: R(630, 268.5, 306, 3, C.ink, { d: 400, from: { op: 0, w: 0 } }),
  lb0: T('Выгода', 140, 229, 80, { d: 300 }),
  ln1: R(596, 658.5, 352, 3, C.ink, { d: 600, from: { op: 0, w: 0 } }),
  lb1: T('Бренд', 140, 619, 80, { d: 500 }),
  ln2: R(1252, 598.5, 180, 3, C.ink, { d: 800, from: { op: 0, w: 0 } }),
  lb2: T('Настроение', 1362, 563, 64, { d: 700 }),
} }),

// 44 — рядом с соседями
() => {
  const a = {}, w = 270, xs = [0, 1, 2, 3, 4, 5].map(i => 210 + i * 300);
  [0, 1, 2, 3, 4, 5].forEach(i => a[i === 3 ? 'nc' : 'nr' + i] = NC(i === 3 ? 18 : [6, 1, 9, 3, 12, 4][i], xs[i], 600, w, { d: i * 70, from: { op: 0, y: 760 } }));
  a.tt = T('Спокойно встаёт рядом с соседями', 56, 120, 80);
  a.tc = cap('картинки‑настроение перестают выглядеть так стрёмно', 56, 225, { fs: 30, c: '#8a857b', d: 300 });
  return { bg: '#FFFFFF', a };
},

// 45 — 150 офферов
() => ({ bg: '#FFFFFF', mod: { key: 'wall', mode: 1 }, a: {
  tt: T('150 реальных офферов', 56, 70, 80),
  tc: cap('прод → JSON → плагин → карточки с настоящими картинками', 56, 950, { fs: 30 }),
} }),

// 46 — ещё не идеально
() => ({ bg: '#FFFFFF', mod: { key: 'wall', mode: 2 }, a: {
  tt: T('Всё ещё _не_ _идеально_', 56, 70, 80),
  tc: cap('контрастные картинки всё равно перетягивают внимание', 56, 950, { fs: 30 }),
} }),

// 47 — без картинки, предсказуемый текст
() => {
  const a = {}, w = 250, xs = [0, 1, 2, 3, 4, 5].map(i => 235 + i * 290);
  // предсказуемый срок: просто «N дней», последний день — красным
  const left = ['3 дня', '1 день', '10 дней', '2 дня', '1 день', '3 дня'];
  xs.forEach((x, i) => {
    a['lp' + i] = NP(FLAT[i], x, 560, w, { d: i * 70, from: { op: 0, y: 700 } });
    a['lp' + i].card = { ...a['lp' + i].card, date: left[i], urgent: left[i] === '1 день' };
  });
  a.tt = T('Убрать картинку', 56, 90, 90);
  a.tc = cap('и сделать текст предсказуемым — например, всегда\n«осталось 5 дней» до конца предложения', 56, 850, { fs: 32, d: 300 });
  return { bg: '#FFFFFF', a };
},

// 48 — сплошной список
flatList,

// 49 — промокоды дают ритм
() => {
  const a = flatList().a, promo = { 2: 0, 5: 1, 9: 2, 12: 3 };
  for (const i in promo) {
    const p = a['lp' + i];
    a['pr' + promo[i]] = PR(promo[i], p.x, p.y, 170 * 166 / 165 * .97, { d: 200 + promo[i] * 120, from: { op: 0, sc: .6 } });
    a['lp' + i] = { ...p, op: 0, sc: .6 };
  }
  for (let i = 0; i < 16; i++) {
    const hit = [2, 5, 10, 13].includes(i);
    a['rb' + i] = R(260 + i * 93, 990 - (hit ? 25 : 0), hit ? 30 : 14, hit ? 100 : 50, hit ? C.bl : C.ink, { d: i * 30 });
  }
  a.tt = T('Промокоды — *отдельной* *сущностью*', 56, 70, 70);
  a.tc = { ...a.tc, op: 0 };
  return { bg: '#FFFFFF', a };
},

// 51 — как-то так
() => ({ bg: '#FFFFFF', a: merge(neat(1520, 540, 150, 108, true), {
  tt: T('Как‑то так*.*', 140, 446, 200),
}) }),
];
