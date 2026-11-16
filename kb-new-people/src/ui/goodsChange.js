// Счётчик и цена используют один прогресс: итог всегда соответствует текущему возврату.
import { h, img } from '../core/dom.js';
import { reducedMotion } from '../core/motion.js';

const money = (n) => `${Number(n.toFixed(2)).toLocaleString('ru-RU', { maximumFractionDigits: 2 })}\u00a0₽`;

export function installGoodsChange(card, { price, cashback, boostPoints = 15, kind = 'cashback', oldPrice, discount: catalogDiscount }) {
  const changesPrice = kind !== 'cashback';
  const changesBack = kind !== 'discount';
  const fromPercent = Math.round(cashback / price * 100);
  const toPercent = Math.min(100, fromPercent + (changesBack ? boostPoints : 0));
  // История скидки демонстрационная: исходные цена и возврат берутся из каталога.
  const base = Number.isFinite(oldPrice) && oldPrice > price ? oldPrice : price / 0.8;
  const fromDiscount = Math.round((1 - price / base) * 100);
  const toDiscount = Math.min(95, fromDiscount + boostPoints);
  const toPrice = changesPrice ? Math.round(base * (1 - toDiscount / 100)) : price;
  const title = kind === 'discount' ? 'Скидка выросла' : kind === 'both' ? 'Скидка и кэшбэк выросли' : 'Кэшбэк вырос';
  const main = card.querySelector('.goods-main');
  const heart = card.querySelector('.heart');
  const badge = card.querySelector('.goods-cashback-percent');
  const value = card.querySelector('.goods-net-value');
  const before = card.querySelector('.goods-price-before');
  const legacyPrice = card.querySelector('.goods-price > span:first-child');
  const legacyBack = card.querySelector('.gcard-badge > span:last-child');
  const legacyValue = h('span', { class: 'goods-change-value' });
  legacyPrice.replaceChildren(legacyValue);
  const caption = h('div', { class: 'goods-change-summary' });
  const cashbackCaption = h('div', { class: 'goods-change-summary' });
  card.querySelector('.goods-price').after(h('div', { class: 'goods-change-summaries' }, caption, cashbackCaption));

  const old = card.querySelector('.goods-price .goods-old') || h('span', { class: 'goods-old' });
  if (!old.parentElement) card.querySelector('.goods-price').append(old);
  const previousPrice = changesPrice ? price : oldPrice;
  old.hidden = !(Number.isFinite(previousPrice) && previousPrice > 0 && (changesPrice || previousPrice > price));
  old.replaceChildren(h('s', null, money(Number.isFinite(previousPrice) ? previousPrice : price)));
  card.classList.add('has-cashback-change');
  card.dataset.changeKind = kind;
  card.dataset.changeState = 'pending';
  heart.setAttribute('aria-pressed', 'true');
  card.querySelector('.goods-dots').replaceChildren(
    ...['dot-active.svg', 'dot.svg', 'dot.svg'].map((name) => img(`assets/img/benefit/${name}`, { alt: '', lazy: false })));
  function render(progress) {
    const currentPrice = Math.round(price + (toPrice - price) * progress);
    const percent = Math.round(fromPercent + (toPercent - fromPercent) * progress);
    const currentBack = Math.min(currentPrice, Math.round(cashback * currentPrice / price) + Math.floor(currentPrice * (changesBack ? (percent - fromPercent) / 100 : 0)));
    const net = money(currentPrice - currentBack);
    value.textContent = money(currentPrice);
    legacyValue.textContent = money(currentPrice);
    legacyBack.textContent = money(currentBack);
    before.textContent = money(currentPrice);
    badge.textContent = `${percent}%`;
    caption.textContent = changesPrice
      ? `На ${money(price - currentPrice)} дешевле`
      : '';
    caption.hidden = !changesPrice;
    cashbackCaption.hidden = !changesBack;
    cashbackCaption.textContent = changesBack ? `${changesPrice ? 'и кэшбэк' : 'Кэшбэк'} ${fromPercent}% → ${percent}%` : '';
    main.setAttribute('aria-label', `${title}. В избранном. Цена ${money(currentPrice)}. Кэшбэк ${percent}%. С кэшбэком ${net}`);
  }
  render(0);
  let raf = 0;
  let started = false;
  let progress = 0;
  let start = 0;
  const tick = (now) => {
    raf = 0;
    if (card.closest('.page')?.inert || !card.getClientRects().length) return;
    progress = Math.min(1, (now - start) / 1100);
    render(1 - (1 - progress) ** 3);
    if (progress < 1) raf = requestAnimationFrame(tick);
    else card.dataset.changeState = 'done';
  };
  card.startCashbackChange = () => {
    if (started || heart.getAttribute('aria-pressed') !== 'true') return;
    started = true;
    card.dataset.changeState = 'running';
    if (reducedMotion()) { render(1); card.dataset.changeState = 'done'; return; }
    start = performance.now();
    raf = requestAnimationFrame(tick);
  };
  card.resumeCashbackChange = () => {
    if (raf || card.dataset.changeState !== 'running') return;
    start = performance.now() - progress * 1100;
    raf = requestAnimationFrame(tick);
  };
  card.stopCashbackChange = () => { cancelAnimationFrame(raf); raf = 0; };
}

export function watchGoodsChanges(page) {
  let raf = 0;
  const cards = [...page.querySelectorAll('.has-cashback-change')];
  const collect = () => {
    if (!page.isConnected || page.inert) return;
    const bounds = page.getBoundingClientRect();
    const bar = document.querySelector('.appbar');
    const top = Math.max(bounds.top, bar?.getBoundingClientRect().bottom || bounds.top);
    const bottom = Math.min(bounds.bottom, window.innerHeight);
    for (const card of cards) {
      if (card.dataset.changeState === 'done' || !card.getClientRects().length) continue;
      const r = card.getBoundingClientRect();
      if (r.height > 0 && r.top >= top && r.bottom <= bottom && r.left >= bounds.left && r.right <= bounds.right) {
        if (card.dataset.changeState === 'running') card.resumeCashbackChange?.();
        else card.startCashbackChange();
      }
    }
  };
  const check = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(collect); };
  page.addEventListener('scroll', check, { passive: true });
  window.addEventListener('resize', check);
  // Фильтр категории меняет hidden без прокрутки — тоже проверяем видимость.
  const observer = new MutationObserver(check);
  observer.observe(page, { subtree: true, attributes: true, attributeFilter: ['hidden'] });
  check();
  return { check, destroy() {
    cancelAnimationFrame(raf);
    observer.disconnect();
    page.removeEventListener('scroll', check);
    window.removeEventListener('resize', check);
    cards.forEach((card) => card.stopCashbackChange());
  } };
}
