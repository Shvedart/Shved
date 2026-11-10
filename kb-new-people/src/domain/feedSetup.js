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

// поровну, остаток от деления — первым категориям
export function evenWeights(ids) {
  const base = Math.floor(100 / ids.length);
  let rest = 100 - base * ids.length;
  return Object.fromEntries(ids.map((id) => [id, base + (rest-- > 0 ? 1 : 0)]));
}

export function defaultSetup(ids) {
  return { mode: 'shelves', goods: 30, weights: evenWeights(ids), locked: [] };
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
