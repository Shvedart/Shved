// Настройка ленты (сценарий 07): вид ленты, доля товаров и доли категорий.
// Доли категорий всегда в сумме 100%. Тронутые ползунки «запоминаются»: при правке следующего
// меняются только нетронутые — 70% электроники останутся, если потом отдать 20% красоте.

export const SETUP_CATS = [
  { id: 'food', label: 'Еда' },
  { id: 'electronics', label: 'Электроника' },
  { id: 'beauty', label: 'Красота' },
  { id: 'clothes', label: 'Одежда' },
  { id: 'home', label: 'Дом' },
  { id: 'kids', label: 'Дети' },
  { id: 'sport', label: 'Спорт' },
  { id: 'auto', label: 'Авто' },
  { id: 'travel', label: 'Путешествия' },
  { id: 'health', label: 'Здоровье' },
  { id: 'fun', label: 'Развлечения' },
  { id: 'pets', label: 'Животные' },
];

// Интенты «Чего показывать больше»: готовые пропорции категорий, тап сам расставляет ползунки
// (остальные категории — 0). Сумма — 100.
export const INTENTS = [
  { id: 'care', label: 'Уход и продукты', weights: { beauty: 40, food: 40, clothes: 15, home: 5 } },
  { id: 'pets', label: 'Питомцы и дом', weights: { pets: 50, food: 25, home: 20, kids: 5 } },
  { id: 'tech', label: 'Техника и поездки', weights: { electronics: 40, travel: 40, clothes: 20 } },
  { id: 'family', label: 'Семья с детьми', weights: { food: 40, kids: 40, clothes: 20 } },
];

export function intentWeights(intent, ids) {
  return Object.fromEntries(ids.map((id) => [id, intent.weights[id] || 0]));
}

// поровну, остаток от деления — первым категориям
export function evenWeights(ids) {
  const base = Math.floor(100 / ids.length);
  let rest = 100 - base * ids.length;
  return Object.fromEntries(ids.map((id) => [id, base + (rest-- > 0 ? 1 : 0)]));
}

// Логотип и картинка на офферах и промокодах (лента 07): CSS-переменные на контейнере ленты или превью.
// logoSize — px, один размер у офферов и промокодов; offerPic — % ширины плитки; nameLines — 1 или 2 строки названия
// Отдельные карточки продуктов (data/grocery.json) в ленте 07: false — их нет нигде, даже в «Еде»,
// продукты живут только в полках (корзина, Самокат, ВкусВилл); тумблер «Продукты в ленте» тогда скрыт.
// true — как раньше: по тумблеру во всей ленте, а в «Еде» вперемешку с офферами
export const GROCERY_CARDS = false;

export const LOGO_SIZES = [56, 44, 40, 32];
export const LOGO_DEFAULT = 56;
export const PIC_DEFAULT = 87;
export function applyCardLook(node, setup) {
  // выбранные значения; итоговые --logo-size и --pic-size считает CSS (.card-look) — на узких экранах с потолком
  node.classList.add('card-look');
  node.style.setProperty('--pic-pref', `${setup?.offerPic ?? PIC_DEFAULT}%`);
  node.style.setProperty('--logo-pref', `${setup?.logoSize || LOGO_DEFAULT}px`);
  // название бренда на офферах и промокодах — в одну строку (по умолчанию) или в две
  node.classList.toggle('name-2', setup?.nameLines === 2);
  node.classList.toggle('name-1', setup?.nameLines !== 2);
}

// по умолчанию: сплошная лента, 20% товаров, название бренда в две строки, у карточки товара только
// описание, доли категорий — интент «Уход и продукты»
export function defaultSetup(ids) {
  const weights = intentWeights(INTENTS[0], ids);
  return {
    mode: 'mixed', goods: 20, goodsNetPrice: false, bigGoods: false, tinted: false, offerImages: true, random: false, delivery: true, hideGrocery: true, moderated: true,
    nameLines: 2,
    goodsShow: { old: false, brand: false, desc: true, shop: false, verified: false },
    weights, locked: ids.filter((id) => weights[id] > 0),
  };
}

// Ставит категории id долю value; остаток делят нетронутые категории пропорционально их долям.
// Если нетронутых не осталось, остаток раздаётся тронутым, кроме той, что меняем сейчас.
export function setWeight(setup, id, value) {
  const ids = Object.keys(setup.weights);
  const locked = setup.locked.filter((x) => x !== id);
  const lockedSum = locked.reduce((s, x) => s + setup.weights[x], 0);
  const v = Math.max(0, Math.min(100 - lockedSum, Math.round(value)));
  let free = ids.filter((x) => x !== id && !locked.includes(x));
  let budget = 100 - lockedSum - v;
  const weights = { ...setup.weights, [id]: v };
  if (!free.length) {
    free = locked;
    budget = 100 - v;
    locked.length = 0;
  }
  const freeSum = free.reduce((s, x) => s + setup.weights[x], 0);
  // распределяем с округлением так, чтобы сумма сошлась ровно
  let given = 0;
  free.forEach((x, i) => {
    const share = i === free.length - 1
      ? budget - given
      : Math.round(freeSum ? (budget * setup.weights[x]) / freeSum : budget / free.length);
    weights[x] = Math.max(0, share);
    given += weights[x];
  });
  return { ...setup, weights, locked: [...locked, id] };
}

// Плавное перемешивание по весам (как smooth weighted round-robin): категории с большей долей
// встречаются чаще, но не идут подряд пачкой. counts — сколько элементов взять у каждой.
export function interleave(counts) {
  const ids = Object.keys(counts).filter((id) => counts[id] > 0);
  const left = { ...counts };
  const total = ids.reduce((s, id) => s + counts[id], 0);
  const current = Object.fromEntries(ids.map((id) => [id, 0]));
  const order = [];
  for (let step = 0; step < total; step++) {
    let best = null;
    for (const id of ids) {
      if (!left[id]) continue;
      current[id] += counts[id];
      if (!best || current[id] > current[best]) best = id;
    }
    current[best] -= total;
    left[best]--;
    order.push(best);
  }
  return order;
}
