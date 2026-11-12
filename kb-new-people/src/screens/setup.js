// Сценарий 07: сначала пользователь настраивает ленту, потом попадает на главную с ней.
// Вид ленты (полками или сплошной), доля товаров и доли категорий — в store.state.feedSetup.

import { h, button } from '../core/dom.js';
import { haptics } from '../core/haptics.js';
import { store } from '../core/store.js';
import { primaryButton } from '../ui/components.js';
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
  // полка «Доставка продуктов»; у старых настроек поля нет — считаем включённой
  const deliveryInput = h('input', { class: 'setup-switch-input', type: 'checkbox', role: 'switch' });
  deliveryInput.checked = setup.delivery !== false;
  deliveryInput.addEventListener('change', () => { setup = { ...setup, delivery: deliveryInput.checked }; haptics.selection(); });
  const delivery = h('label', { class: 'setup-switch' },
    h('span', { class: 'setup-switch-text' }, h('span', { class: 'setup-label' }, 'Доставка продуктов'), h('span', { class: 'setup-hint' }, 'Полка с собранной корзиной и кнопкой «Заказать»')),
    deliveryInput, h('span', { class: 'setup-switch-track', 'aria-hidden': 'true' }));
  // товары после модерации — чистые фото без инфографики (data/tovarka-moderated.json); у старых настроек поля нет — включено
  const modInput = h('input', { class: 'setup-switch-input', type: 'checkbox', role: 'switch' });
  modInput.checked = setup.moderated !== false;
  modInput.addEventListener('change', () => { setup = { ...setup, moderated: modInput.checked }; haptics.selection(); });
  const moderated = h('label', { class: 'setup-switch' },
    h('span', { class: 'setup-switch-text' }, h('span', { class: 'setup-label' }, 'Чистые карточки товаров'), h('span', { class: 'setup-hint' }, 'Товары после модерации: фото без инфографики')),
    modInput, h('span', { class: 'setup-switch-track', 'aria-hidden': 'true' }));
  // продукты магазина как товары в ленте; полку «Доставка продуктов» не трогает
  const groceryInput = h('input', { class: 'setup-switch-input', type: 'checkbox', role: 'switch' });
  groceryInput.checked = setup.hideGrocery !== false;
  groceryInput.addEventListener('change', () => { setup = { ...setup, hideGrocery: groceryInput.checked }; haptics.selection(); });
  const grocery = h('label', { class: 'setup-switch' },
    h('span', { class: 'setup-switch-text' }, h('span', { class: 'setup-label' }, 'Без продуктов в ленте'), h('span', { class: 'setup-hint' }, 'Продукты только в полке «Доставка продуктов»')),
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
      h('section', { class: 'setup-block' }, h('h2', { class: 'setup-block-title' }, 'Вид ленты'), seg, modeHint, tint, pics, delivery),
      h('section', { class: 'setup-block' }, h('h2', { class: 'setup-block-title' }, 'Товары или офферы'), goods, goodsHint, big, moderated, grocery),
      h('section', { class: 'setup-block' },
        h('div', { class: 'setup-block-head' }, h('h2', { class: 'setup-block-title' }, 'Чего показывать больше'), reset),
        h('p', { class: 'setup-hint' }, 'Доли категорий в сумме — 100%. Тронутый ползунок держит свою долю, остальные делят остаток'),
        h('div', { class: 'setup-sliders' }, catSliders))),
    h('div', { class: 'setup-bar bottom-bar is-shown' }, create));

  syncMode();
  syncWeights();
  return { appbar: { left: 'back', title: 'Настройка ленты' } };
}
