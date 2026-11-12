// Сценарий 07: сначала пользователь настраивает ленту, потом попадает на главную с ней.
// Вид ленты (полками или сплошной), доля товаров и доли категорий — в store.state.feedSetup.

import { h, button } from '../core/dom.js';
import { haptics } from '../core/haptics.js';
import { store } from '../core/store.js';
import { primaryButton, offerCard, goodsCard } from '../ui/components.js';
import { SETUP_CATS, defaultSetup, evenWeights, setWeight } from '../domain/feedSetup.js';
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
  }

  // ---------- Ползунок ----------
  function slider({ label, value, onInput, cls = '' }) {
    const out = h('span', { class: 'setup-value' }, `${value}%`);
    const input = h('input', { class: 'setup-range', type: 'range', min: '0', max: '100', step: '1', value: String(value), 'aria-label': label });
    const paint = (v) => {
      out.textContent = `${v}%`;
      input.value = String(v);
      input.style.setProperty('--fill', `${v}%`);
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
  const sampleOffers = ['food', 'electronics']
    .map((cat) => catalog.offersInCategory(cat).find((o) => o && o.image && o.logo && /от/.test(o.condition)) || catalog.offersInCategory(cat).find((o) => o && o.image))
    .filter(Boolean);
  const goodsList = (catalog.goodsModerated.length ? catalog.goodsModerated : catalog.goods).flatMap((c) => c.products);
  const full = (p) => p.oldPrice && p.brand && p.description;
  // товар с «Магазин проверен» — тот, что есть в обоих файлах с разными фото: по тумблеру
  // «Чистые карточки товаров» видно, как инфографика сменяется чистым фото
  const MOD_SAMPLE = 'Сумка органайзер в багажник автомобиля 50х35х25см';
  const findIn = (list, not) => list.flatMap((c) => c.products).find((p) => p.description === MOD_SAMPLE && p.image !== not);
  const clean = findIn(catalog.goodsModerated);
  // в исходном файле сумка встречается дважды — берём запись с другим фото (с инфографикой)
  const modPair = { clean, raw: findIn(catalog.goods, clean?.image) };
  const verifiedSample = modPair.clean || goodsList.find((p) => full(p) && p.verified);
  const sampleGoods = [goodsList.find((p) => full(p) && !p.verified && p.merchant), verifiedSample].filter(Boolean);
  const offerPreview = h('div', { class: 'setup-preview', 'aria-hidden': 'true', inert: true }, sampleOffers.map((o) => offerCard(o, { size: 's' })));
  const goodsPreview = h('div', { class: 'setup-preview', 'aria-hidden': 'true', inert: true }, sampleGoods.map((p) => goodsCard(p)));
  function syncPreview() {
    offerPreview.classList.toggle('is-tinted', !!setup.tinted);
    offerPreview.classList.toggle('no-offer-images', setup.offerImages === false);
    for (const part of ['old', 'brand', 'desc', 'shop', 'verified']) goodsPreview.classList.toggle(`goods-no-${part}`, setup.goodsShow?.[part] === false);
    // «Чистые карточки товаров»: у товара-образца фото после модерации или исходное, с инфографикой
    const pic = goodsPreview.querySelector(`[data-goods="${verifiedSample?.id}"] .goods-pic img`);
    const src = (setup.moderated !== false ? modPair.clean : modPair.raw)?.image;
    if (pic && src && pic.getAttribute('src') !== src) pic.src = src;
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
    lockHeight(offerPreview, ['', 'no-offer-images']);
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
  function syncWeights() {
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
      h('section', { class: 'setup-block' }, h('h2', { class: 'setup-block-title' }, 'Вид ленты'), seg, modeHint, offerPreview, tint, pics),
      h('section', { class: 'setup-block' }, h('h2', { class: 'setup-block-title' }, 'Что попадает в ленту'), random, delivery, grocery),
      h('section', { class: 'setup-block' }, h('h2', { class: 'setup-block-title' }, 'Товары или офферы'), goods, goodsHint, big),
      h('section', { class: 'setup-block' }, h('h2', { class: 'setup-block-title' }, 'Карточка товара'), goodsPreview, moderated, goodsParts),
      h('section', { class: 'setup-block' },
        h('div', { class: 'setup-block-head' }, h('h2', { class: 'setup-block-title' }, 'Чего показывать больше'), reset),
        h('p', { class: 'setup-hint' }, 'Доли категорий в сумме — 100%. Тронутый ползунок держит свою долю, остальные делят остаток'),
        h('div', { class: 'setup-sliders' }, catSliders))),
    h('div', { class: 'setup-bar bottom-bar is-shown' }, create));

  syncMode();
  syncWeights();
  return { appbar: { left: 'back', title: 'Настройка ленты' }, destroy: () => previewRo.disconnect() };
}
