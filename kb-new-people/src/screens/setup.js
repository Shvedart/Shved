// Сценарий 07: сначала пользователь настраивает ленту, потом попадает на главную с ней.
// Вид ленты (полками или сплошной), доля товаров и доли категорий — в store.state.feedSetup.

import { h, button } from '../core/dom.js';
import { haptics } from '../core/haptics.js';
import { store } from '../core/store.js';
import { primaryButton, offerCard, goodsCard, promoCard } from '../ui/components.js';
import { SETUP_CATS, INTENTS, intentWeights, LOGO_SIZES, LOGO_DEFAULT, PIC_DEFAULT, applyCardLook, defaultSetup, evenWeights, setWeight } from '../domain/feedSetup.js';
import { app } from '../app.js';

export function setupScreen({ el, params, nav }) {
  el.classList.add('setup');
  const { catalog } = app;
  const cats = SETUP_CATS.filter((c) => catalog.getCategory(c.id) || catalog.goods.some((g) => g.id === c.id));
  const ids = cats.map((c) => c.id);
  const saved = store.state.feedSetup;
  let setup = saved && ids.every((id) => id in saved.weights) ? { ...saved } : defaultSetup(ids);

  // ---------- Вид ленты ----------
  const modes = [
    { id: 'shelves', label: 'Полками', hint: 'Подборки с заголовками: офферы и товары своими полками' },
    { id: 'mixed', label: 'Сплошной лентой', hint: 'Без заголовков: офферы и товары вперемешку, рядом друг с другом' },
  ];
  const modeHint = h('p', { class: 'setup-hint' });
  // анимации вида ленты из квадратиков над переключателем (стили .anim-mode в screens.css), по одной над вариантом:
  // полками — заголовок и сетка 2×2, сплошной — две колонки разной высоты; лента едет вверх, двигается только выбранный
  const sq = (x, y, w, hh, cls = '') => `<rect class="${cls}" x="${x}" y="${y}" width="${w}" height="${hh}" rx="2.5"/>`;
  // полка: заголовок + 2 ряда по 2 карточки, период 34px — сдвиг вверх на 34px зацикливается без шва
  const shelves = [0, 1, 2].map((k) => { const y = 2 + k * 34; return sq(4, y, k % 2 ? 12 : 18, 3, 't') + sq(4, y + 6, 17, 10) + sq(23, y + 6, 17, 10) + sq(4, y + 19, 17, 10) + sq(23, y + 19, 17, 10); }).join('');
  // колонка: повтор высот с периодом 30px
  const column = (x, hs) => [0, 1, 2].flatMap((k) => { let y = 4 + k * 30; return hs.map((hh, i) => { const r = sq(x, y, 17, hh, x > 20 && i === 0 ? 'c' : ''); y += hh + 3; return r; }); }).join('');
  const MODE_ANIM = {
    shelves: `<g class="up up-34">${shelves}</g>`,
    mixed: `<g class="up up-30">${column(4, [14, 10])}${column(23, [10, 14])}</g>`,
  };
  const modeAnims = modes.map((m) => h('span', { class: 'setup-anim anim-mode', dataset: { mode: m.id }, 'aria-hidden': 'true', html: `<svg viewBox="0 0 44 44" width="44" height="44">${MODE_ANIM[m.id]}</svg>` }));
  const modePics = h('div', { class: 'setup-mode-pics' }, modeAnims);
  const modeBtns = modes.map((m) => {
    const b = button({ class: 'setup-seg-item', role: 'radio', dataset: { mode: m.id } }, m.label);
    b.addEventListener('click', () => {
      if (setup.mode === m.id) return;
      setup = { ...setup, mode: m.id };
      haptics.selection();
      syncMode();
  syncPreview();
    });
    return b;
  });
  const seg = h('div', { class: 'setup-seg', role: 'radiogroup', 'aria-label': 'Вид ленты' }, modeBtns);
  function syncMode() {
    for (const b of modeBtns) {
      const on = b.dataset.mode === setup.mode;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-checked', String(on));
    }
    modeHint.textContent = modes.find((m) => m.id === setup.mode).hint;
    for (const a of modeAnims) a.classList.toggle('is-on', a.dataset.mode === setup.mode);
  }

  // ---------- Ползунок ----------
  function slider({ label, value, onInput, cls = '', min = 0 }) {
    const out = h('span', { class: 'setup-value' }, `${value}%`);
    const input = h('input', { class: 'setup-range', type: 'range', min: String(min), max: '100', step: '1', value: String(value), 'aria-label': label });
    const paint = (v) => {
      out.textContent = `${v}%`;
      input.value = String(v);
      input.style.setProperty('--fill', `${((v - min) / (100 - min)) * 100}%`);
    };
    paint(value);
    input.addEventListener('input', () => onInput(Number(input.value)));
    const row = h('label', { class: `setup-slider ${cls}` }, h('span', { class: 'setup-slider-top' }, h('span', { class: 'setup-label' }, label), out), input);
    row.paint = paint;
    return row;
  }

  // ---------- Доля товаров ----------
  const goods = slider({
    label: 'Товары в ленте',
    value: setup.goods,
    onInput: (v) => { setup = { ...setup, goods: v }; goods.paint(v); goodsHint.textContent = goodsText(v); },
  });
  // большие карточки товаров (макет 720:155762): товар во всю ширину ленты
  const bigInput = h('input', { class: 'setup-switch-input', type: 'checkbox', role: 'switch' });
  bigInput.checked = !!setup.bigGoods;
  bigInput.addEventListener('change', () => { setup = { ...setup, bigGoods: bigInput.checked }; haptics.selection(); });
  const big = h('label', { class: 'setup-switch' },
    h('span', { class: 'setup-switch-text' }, h('span', { class: 'setup-label' }, 'Большие карточки товаров'), h('span', { class: 'setup-hint' }, 'Товар во всю ширину ленты')),
    bigInput, h('span', { class: 'setup-switch-track', 'aria-hidden': 'true' }));
  // цветной фон плиток офферов — цвет категории вместо серого
  const tintInput = h('input', { class: 'setup-switch-input', type: 'checkbox', role: 'switch' });
  tintInput.checked = !!setup.tinted;
  tintInput.addEventListener('change', () => { setup = { ...setup, tinted: tintInput.checked }; haptics.selection(); });
  const tint = h('label', { class: 'setup-switch' },
    h('span', { class: 'setup-switch-text' }, h('span', { class: 'setup-label' }, 'Цветной фон карточек'), h('span', { class: 'setup-hint' }, 'Офферы окрашены в цвет своей категории')),
    tintInput, h('span', { class: 'setup-switch-track', 'aria-hidden': 'true' }));
  // горизонтальные полки (корзина продуктов, подборки товаров, путешествия, афиша); поле — delivery,
  // у старых настроек его нет — считаем включёнными
  const deliveryInput = h('input', { class: 'setup-switch-input', type: 'checkbox', role: 'switch' });
  deliveryInput.checked = setup.delivery !== false;
  deliveryInput.addEventListener('change', () => { setup = { ...setup, delivery: deliveryInput.checked }; haptics.selection(); });
  const delivery = h('label', { class: 'setup-switch' },
    h('span', { class: 'setup-switch-text' }, h('span', { class: 'setup-label' }, 'Горизонтальные полки'), h('span', { class: 'setup-hint' }, 'Корзина продуктов, подборки товаров, путешествия и афиша')),
    deliveryInput, h('span', { class: 'setup-switch-track', 'aria-hidden': 'true' }));
  // товары после модерации — чистые фото без инфографики (data/tovarka-moderated.json); у старых настроек поля нет — включено
  const modInput = h('input', { class: 'setup-switch-input', type: 'checkbox', role: 'switch' });
  modInput.checked = setup.moderated !== false;
  modInput.addEventListener('change', () => { setup = { ...setup, moderated: modInput.checked }; haptics.selection(); });
  const moderated = h('label', { class: 'setup-switch' },
    h('span', { class: 'setup-switch-text' }, h('span', { class: 'setup-label' }, 'Чистые карточки товаров'), h('span', { class: 'setup-hint' }, 'Товары после модерации: фото без инфографики')),
    modInput, h('span', { class: 'setup-switch-track', 'aria-hidden': 'true' }));
  // продукты магазина как товары в ленте; полку «Где выгоднее заказать продукты?» не трогает
  const groceryInput = h('input', { class: 'setup-switch-input', type: 'checkbox', role: 'switch' });
  // тумблер утвердительный («Продукты в ленте»), а в настройке хранится hideGrocery — поэтому наоборот
  groceryInput.checked = setup.hideGrocery === false;
  groceryInput.addEventListener('change', () => { setup = { ...setup, hideGrocery: !groceryInput.checked }; haptics.selection(); });
  const grocery = h('label', { class: 'setup-switch' },
    h('span', { class: 'setup-switch-text' }, h('span', { class: 'setup-label' }, 'Продукты в ленте'), h('span', { class: 'setup-hint' }, 'Включено — карточки продуктов идут в ленте вперемешку с остальными. Выключено — только в полке «Где выгоднее заказать продукты?»')),
    groceryInput, h('span', { class: 'setup-switch-track', 'aria-hidden': 'true' }));
  // картинки на плитках офферов; у старых настроек поля нет — включены
  const picsInput = h('input', { class: 'setup-switch-input', type: 'checkbox', role: 'switch' });
  picsInput.checked = setup.offerImages !== false;
  picsInput.addEventListener('change', () => {
    // включили картинки — цветной фон сам выключается (его можно вернуть вручную,
    // картинки при этом не трогаем: связь только в эту сторону)
    setup = { ...setup, offerImages: picsInput.checked, ...(picsInput.checked ? { tinted: false } : {}) };
    if (picsInput.checked) tintInput.checked = false;
    haptics.selection();
  });
  const pics = h('label', { class: 'setup-switch' },
    h('span', { class: 'setup-switch-text' }, h('span', { class: 'setup-label' }, 'Картинки на офферах'), h('span', { class: 'setup-hint' }, 'Выключены — другой тип карточки: логотип и бренд сверху, кэшбэк и условия снизу')),
    picsInput, h('span', { class: 'setup-switch-track', 'aria-hidden': 'true' }));
  // ---------- Логотип и картинка на офферах и промокодах ----------
  // один размер логотипа у всех офферов и промокодов
  const logoBtns = LOGO_SIZES.map((size) => {
    const b = button({ class: 'setup-seg-item', role: 'radio', dataset: { size: String(size) } }, String(size));
    b.addEventListener('click', () => {
      if ((setup.logoSize || LOGO_DEFAULT) === size) return;
      setup = { ...setup, logoSize: size };
      haptics.selection();
      syncLogo();
      syncPreview();
    });
    return b;
  });
  function syncLogo() {
    for (const b of logoBtns) {
      const on = Number(b.dataset.size) === (setup.logoSize || LOGO_DEFAULT);
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-checked', String(on));
    }
  }
  const logo = h('div', { class: 'setup-field' },
    h('span', { class: 'setup-label' }, 'Размер логотипа, px'),
    h('div', { class: 'setup-seg is-logo', role: 'radiogroup', 'aria-label': 'Размер логотипа' }, logoBtns),
    h('span', { class: 'setup-hint' }, 'На экранах уже 390px логотип не больше 44px, картинка — не больше 75%'));
  // название бренда на офферах и промокодах в две строки; выключено — в одну
  const nameInput = h('input', { class: 'setup-switch-input', type: 'checkbox', role: 'switch' });
  nameInput.checked = setup.nameLines === 2;
  nameInput.addEventListener('change', () => { setup = { ...setup, nameLines: nameInput.checked ? 2 : 1 }; haptics.selection(); });
  const nameLines = h('label', { class: 'setup-switch' },
    h('span', { class: 'setup-switch-text' }, h('span', { class: 'setup-label' }, 'Название бренда в две строки'), h('span', { class: 'setup-hint' }, 'На офферах и промокодах. Выключено — в одну строку')),
    nameInput, h('span', { class: 'setup-switch-track', 'aria-hidden': 'true' }));
  const pic = slider({
    label: 'Размер картинки',
    value: setup.offerPic ?? PIC_DEFAULT,
    min: 40,
    cls: 'is-pic',
    onInput: (v) => { setup = { ...setup, offerPic: v }; pic.paint(v); syncPreview(); },
  });
  // случайный подбор: те же доли и места, но офферы и товары категории каждый раз другие
  const randomInput = h('input', { class: 'setup-switch-input', type: 'checkbox', role: 'switch' });
  randomInput.checked = !!setup.random;
  randomInput.addEventListener('change', () => { setup = { ...setup, random: randomInput.checked }; haptics.selection(); });
  const random = h('label', { class: 'setup-switch' },
    h('span', { class: 'setup-switch-text' }, h('span', { class: 'setup-label' }, 'Случайный подбор'), h('span', { class: 'setup-hint' }, 'Те же доли категорий, но офферы и товары каждый раз другие')),
    randomInput, h('span', { class: 'setup-switch-track', 'aria-hidden': 'true' }));
  // ---------- Что попадает в ленту: тумблеры с анимацией из квадратиков ----------
  // схема ленты 3×3 (квадратик 10px, шаг 13px); что двигается — показывает, что делает тумблер,
  // и зависит от его положения (CSS по :checked)
  const cell = (x, y, cls = '') => `<rect class="${cls}" x="${4 + x * 13}" y="${4 + y * 13}" width="10" height="10" rx="2.5"/>`;
  const grid = (skip = []) => [0, 1, 2].flatMap((y) => [0, 1, 2].map((x) => (skip.includes(`${x}${y}`) ? '' : cell(x, y)))).join('');
  const ANIM = {
    // два цветных квадратика меняются местами — карточки каждый раз другие
    random: `${grid(['00', '22'])}${cell(0, 0, 'a')}${cell(2, 2, 'b')}`,
    // средний ряд — полоска, внутри которой карточки едут вбок
    shelves: `${[0, 1, 2].map((x) => cell(x, 0) + cell(x, 2)).join('')}
      <clipPath id="shelf-clip"><rect x="2" y="15" width="40" height="14" rx="3"/></clipPath>
      <rect class="strip" x="2" y="15" width="40" height="14" rx="3"/>
      <g clip-path="url(#shelf-clip)"><g class="run">${[0, 1, 2, 3, 4].map((i) => `<rect class="s" x="${5 + i * 11}" y="18" width="8" height="8" rx="2"/>`).join('')}</g></g>`,
    // зелёный квадратик — продукт в ленте; выключено — на его месте пусто
    grocery: `${grid(['11'])}<rect class="slot" x="17.5" y="17.5" width="9" height="9" rx="2.5"/>${cell(1, 1, 'g')}`,
  };
  const anim = (kind) => h('span', { class: `setup-anim anim-${kind}`, 'aria-hidden': 'true', html: `<svg viewBox="0 0 44 44" width="44" height="44">${ANIM[kind]}</svg>` });
  random.prepend(anim('random'));
  delivery.prepend(anim('shelves'));
  grocery.prepend(anim('grocery'));

  // ---------- Живые превью: те же карточки и стили, что в ленте ----------
  // тумблеры меняют классы на превью так же, как на главной: .is-tinted, .no-offer-images, .goods-no-*
  // образцы: оффер и промокод — размер логотипа меняется у обоих
  const sampleOffer = catalog.offersInCategory('food').find((o) => o && o.image && o.logo && /от/.test(o.condition)) || catalog.offersInCategory('food').find((o) => o && o.image);
  const samplePromo = catalog.promos.find((p) => p.logo) || catalog.promos[0];
  const goodsList = (catalog.goodsModerated.length ? catalog.goodsModerated : catalog.goods).flatMap((c) => c.products);
  const full = (p) => p.oldPrice && p.brand && p.description;
  // образцы — товары, что есть в обоих файлах с разными фото: по тумблеру «Чистые карточки товаров»
  // видно, как инфографика сменяется чистым фото. Слева — с продавцом, справа — с «Магазин проверен»
  const MOD_SAMPLES = ['Смартфон iPhone 18 Pro 512 Гб, eSIM+eSIM, Burgundy', 'Сумка органайзер в багажник автомобиля 50х35х25см'];
  // исходное фото: та же запись по описанию, у айфона описание другое — подбираем по id
  const RAW_ALIAS = { 'product-160': 'product-012' };
  const rawGoods = catalog.goods.flatMap((c) => c.products);
  const modPairs = MOD_SAMPLES.map((d) => {
    const clean = goodsList.find((p) => p.description === d);
    // у сумки в исходном файле две записи — берём ту, где фото другое (с инфографикой)
    const raw = clean && rawGoods.find((p) => (p.id === RAW_ALIAS[clean.id] || p.description === d) && p.image !== clean.image);
    return { clean, raw };
  }).filter((x) => x.clean && x.raw);
  // оба варианта фото грузим заранее — при переключении подмена без задержки
  for (const x of modPairs) new Image().src = x.raw.image;
  const sampleGoods = modPairs.length === 2 ? modPairs.map((x) => x.clean)
    : [goodsList.find((p) => full(p) && !p.verified && p.merchant), goodsList.find((p) => full(p) && p.verified)].filter(Boolean);
  const offerPreview = h('div', { class: 'setup-preview', 'aria-hidden': 'true', inert: true }, [sampleOffer && offerCard(sampleOffer, { size: 's' }), samplePromo && promoCard(samplePromo)].filter(Boolean));
  const goodsPreview = h('div', { class: 'setup-preview', 'aria-hidden': 'true', inert: true }, sampleGoods.map((p) => goodsCard(p)));
  function syncPreview() {
    offerPreview.classList.toggle('is-tinted', !!setup.tinted);
    offerPreview.classList.toggle('no-offer-images', setup.offerImages === false);
    applyCardLook(offerPreview, setup);
    for (const part of ['old', 'brand', 'desc', 'shop', 'verified']) goodsPreview.classList.toggle(`goods-no-${part}`, setup.goodsShow?.[part] === false);
    // «Чистые карточки товаров»: у образцов фото после модерации или исходное, с инфографикой
    for (const { clean, raw } of modPairs) {
      const pic = goodsPreview.querySelector(`[data-goods="${clean.id}"] .goods-pic img`);
      const src = (setup.moderated !== false ? clean : raw).image;
      if (pic && pic.getAttribute('src') !== src) pic.src = src;
    }
  }
  // любой тумблер — превью обновляется (обработчик тумблера уже записал новое значение в setup)
  el.addEventListener('change', syncPreview);
  // высота превью — по самому высокому варианту карточек, иначе при переключении тумблеры
  // под превью прыгают (карточка без картинки ниже, у товара пропадают строки); карточки — по центру
  function lockHeight(preview, variants) {
    const keep = preview.className;
    preview.style.height = '';
    let max = 0;
    for (const v of variants) {
      preview.className = `setup-preview ${v}`;
      max = Math.max(max, preview.offsetHeight);
    }
    preview.className = keep;
    preview.style.height = `${max}px`;
  }
  let previewWidth = 0;
  const previewRo = new ResizeObserver(([e]) => {
    if (!e.contentRect.width || e.contentRect.width === previewWidth) return;
    previewWidth = e.contentRect.width;
    // самый высокий вариант — с названием в две строки (классы .card-look/.name-2 — как в applyCardLook)
    lockHeight(offerPreview, ['card-look name-2', 'no-offer-images card-look name-2']);
    lockHeight(goodsPreview, ['']);
  });
  previewRo.observe(offerPreview);

  // ---------- Карточка товара: какие строки показывать ----------
  // поле в настройке — goodsShow: { old, brand, desc, shop, verified }; нет поля — строка показана
  const GOODS_PARTS = [
    { id: 'old', label: 'Старая цена и скидка' },
    { id: 'brand', label: 'Бренд' },
    { id: 'desc', label: 'Описание' },
    { id: 'shop', label: 'Магазин', hint: 'Логотип и название продавца' },
    { id: 'verified', label: '«Магазин проверен»', hint: 'Отметка Т-Банка' },
  ];
  const goodsParts = GOODS_PARTS.map((part) => {
    const input = h('input', { class: 'setup-switch-input', type: 'checkbox', role: 'switch' });
    input.checked = setup.goodsShow?.[part.id] !== false;
    input.addEventListener('change', () => {
      setup = { ...setup, goodsShow: { ...setup.goodsShow, [part.id]: input.checked } };
      haptics.selection();
    });
    return h('label', { class: 'setup-switch' },
      h('span', { class: 'setup-switch-text' }, h('span', { class: 'setup-label' }, part.label), part.hint ? h('span', { class: 'setup-hint' }, part.hint) : null),
      input, h('span', { class: 'setup-switch-track', 'aria-hidden': 'true' }));
  });
  const goodsText = (v) => `${v}% товаров и ${100 - v}% офферов, промокодов и подборок`;
  const goodsHint = h('p', { class: 'setup-hint' }, goodsText(setup.goods));

  // ---------- Доли категорий ----------
  const rows = new Map();
  const catSliders = cats.map((c) => {
    const row = slider({
      label: c.label,
      value: setup.weights[c.id],
      onInput: (v) => {
        setup = setWeight(setup, c.id, v);
        syncWeights();
      },
    });
    rows.set(c.id, row);
    return row;
  });
  // интенты: тап расставляет ползунки в пропорции интента; выбранный подсвечен, пока доли совпадают
  const intentBtns = INTENTS.map((it) => {
    const b = button({ class: 'chip chip-m', dataset: { intent: it.id } }, h('span', { class: 'chip-text' }, it.label));
    b.addEventListener('click', () => {
      const weights = intentWeights(it, ids);
      setup = { ...setup, weights, locked: ids.filter((id) => weights[id] > 0) };
      haptics.selection();
      syncWeights();
    });
    return b;
  });
  const intents = h('div', { class: 'setup-intents' }, intentBtns);
  function syncWeights() {
    for (const b of intentBtns) {
      const it = INTENTS.find((x) => x.id === b.dataset.intent);
      b.classList.toggle('is-active', ids.every((id) => (setup.weights[id] || 0) === (it.weights[id] || 0)));
    }
    for (const [id, row] of rows) {
      row.paint(setup.weights[id]);
      // тронутые ползунки выделены: их доля не меняется, пока правишь другие
      row.classList.toggle('is-locked', setup.locked.includes(id));
    }
  }
  const reset = button({ class: 'btn-link setup-reset' }, 'Поровну');
  reset.addEventListener('click', () => {
    setup = { ...setup, weights: evenWeights(ids), locked: [] };
    haptics.selection();
    syncWeights();
  });

  const create = primaryButton('Создать ленту', {
    onClick: () => {
      haptics.success();
      store.setFeedSetup(setup);
      // настройка и лента сменяют друг друга, а не копятся в истории
      nav.replace(`/main/${params.s}`);
    },
  });

  el.append(
    h('div', { class: 'setup-inner' },
      h('h1', { class: 'setup-title' }, 'Соберите ленту под себя'),
      h('p', { class: 'setup-sub' }, 'Как показывать предложения и чего в ленте должно быть больше'),
      h('section', { class: 'setup-block' }, h('h2', { class: 'setup-block-title' }, 'Вид ленты'), modePics, seg, modeHint, offerPreview, logo, tint, pics, nameLines, pic),
      h('section', { class: 'setup-block' }, h('h2', { class: 'setup-block-title' }, 'Что попадает в ленту'), random, delivery, grocery),
      h('section', { class: 'setup-block' }, h('h2', { class: 'setup-block-title' }, 'Товары или офферы'), goods, goodsHint, big),
      h('section', { class: 'setup-block' }, h('h2', { class: 'setup-block-title' }, 'Карточка товара'), goodsPreview, moderated, goodsParts),
      h('section', { class: 'setup-block' },
        h('div', { class: 'setup-block-head' }, h('h2', { class: 'setup-block-title' }, 'Чего показывать больше'), reset),
        h('p', { class: 'setup-hint' }, 'Доли категорий в сумме — 100%. Тронутый ползунок держит свою долю, остальные делят остаток'),
        intents,
        h('div', { class: 'setup-sliders' }, catSliders))),
    h('div', { class: 'setup-bar bottom-bar is-shown' }, create));

  syncMode();
  syncLogo();
  syncPreview();
  syncWeights();
  return { appbar: { left: 'back', title: 'Настройка ленты' }, destroy: () => previewRo.disconnect() };
}
