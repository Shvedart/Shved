// Счётчик и цена используют один прогресс: итог всегда соответствует текущему возврату.
import { h, img } from '../core/dom.js';
import { animate, EASE, reducedMotion } from '../core/motion.js';

const money = (n) => `${Number(n.toFixed(2)).toLocaleString('ru-RU', { maximumFractionDigits: 2 })}\u00a0₽`;

export function installGoodsChange(card, { price, cashback, boostPoints = 15 }) {
  const fromPercent = Math.round(cashback / price * 100);
  const toPercent = Math.min(100, fromPercent + boostPoints);
  const fromBack = cashback;
  // Исходный возврат берём без изменений из JSON, к нему добавляем 15% цены товара.
  const toBack = toPercent === 100 ? price : Math.min(price, cashback + Math.floor(price * boostPoints / 100));
  if (toBack <= fromBack) return;
  const fromPrice = price - fromBack;
  const badge = card.querySelector('.goods-cashback-percent');
  const value = card.querySelector('.goods-net-value');
  const before = card.querySelector('.goods-price-before');
  const heart = card.querySelector('.heart');
  const main = card.querySelector('.goods-main');
  const label = main.getAttribute('aria-label');
  card.classList.add('has-cashback-change');
  card.dataset.changeState = 'pending';
  card.cashbackChange = { price, cashback, fromPercent, toPercent, toBack };
  badge.textContent = `${fromPercent}%`;
  value.textContent = money(fromPrice);
  heart.setAttribute('aria-pressed', 'true');
  main.setAttribute('aria-label', `${label}. В избранном. С кэшбэком ${money(fromPrice)}`);
  // Точки — исходные векторные значки нового состояния из макета.
  card.querySelector('.goods-dots').replaceChildren(
    ...['dot-active.svg', 'dot.svg', 'dot.svg'].map((name) => img(`assets/img/benefit/${name}`, { alt: '', lazy: false })));

  let raf = 0;
  let started = false;
  let progress = 0;
  let number = null;
  function finish() {
    progress = 1;
    number.textContent = `${toPercent}%`;
    value.textContent = money(price - toBack);
    card.dataset.changeState = 'done';
    main.setAttribute('aria-label', `${label}. В избранном. Кэшбэк вырос с ${fromPercent} до ${toPercent}%. С кэшбэком ${money(price - toBack)}`);
  }
  card.startCashbackChange = () => {
    if (started || heart.getAttribute('aria-pressed') !== 'true') return;
    started = true;
    card.dataset.changeState = 'running';
    before.textContent = money(price);
    const old = h('span', { class: 'goods-change-old' }, String(fromPercent));
    const arrow = h('span', { class: 'goods-change-arrow', 'aria-hidden': 'true' }, '\u00a0→\u00a0');
    number = h('span', { class: 'goods-change-new' }, `${fromPercent}%`);
    badge.replaceChildren(old, arrow, number);
    if (reducedMotion()) { finish(); return; }
    animate(arrow, [{ opacity: 0, transform: 'translateX(-6px)' }, { opacity: 1, transform: 'none' }], { duration: 300, easing: EASE.out, fill: 'none' });
    let start = performance.now();
    const tick = (now) => {
      raf = 0;
      // Не держим цикл на скрытой странице: при возвращении продолжим с того же места.
      if (card.closest('.page')?.inert || !card.getClientRects().length) return;
      progress = Math.min(1, (now - start) / 1100);
      const eased = 1 - (1 - progress) ** 3;
      const shownPercent = Math.round(fromPercent + (toPercent - fromPercent) * eased);
      number.textContent = `${shownPercent}%`;
      value.textContent = money(price - Math.min(price, fromBack + Math.floor(price * (shownPercent - fromPercent) / 100)));
      if (progress < 1) raf = requestAnimationFrame(tick);
      else {
        finish();
        animate(number, [{ transform: 'scale(1)' }, { transform: 'scale(1.14)' }, { transform: 'scale(1)' }], { duration: 360, easing: EASE.spring, fill: 'none' });
      }
    };
    card.resumeCashbackChange = () => {
      if (raf || card.dataset.changeState !== 'running') return;
      start = performance.now() - progress * 1100;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
  };
  card.stopCashbackChange = () => cancelAnimationFrame(raf);
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
