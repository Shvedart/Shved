// Необычный онбординг сценария 03: живой градиент, текст по словам, «Далее» подсвечивает блоки главной.

import { h, button, iconImg, wait } from '../core/dom.js';
import { animate, EASE, reducedMotion } from '../core/motion.js';
import { haptics } from '../core/haptics.js';
import { store } from '../core/store.js';

const STEPS = [
  { target: null, text: 'Привет! За минуту покажем, как здесь получать больше выгоды и лутать кэшбэк каждый день', cta: 'Погнали' },
  { target: 'streak', text: 'Заходите сюда 5 дней подряд — и мы подарим 99% кэшбэка на Яндекс Плюс' },
  { target: 'selection', cards: 'selection', views: 6, text: 'Листайте ленту вниз и соберите 6 просмотров: увидели предложение — оно уже засчитано за вами' },
  { target: 'selection', hearts: 'selection', likes: 1, text: 'Понравилось предложение? Поставьте сердечко — оно сохранится в избранном и всегда будет под рукой' },
  { target: null, text: 'Кто заходит сюда каждый день, получает на 70% больше кэшбэка. Лутайте!', cta: 'Лутать кэшбэк', last: true },
];

export function startTour({ el, entry, scenario }) {
  const stage = el.parentElement;
  let index = -1;
  let active = true;
  let wordsTimer = 0;
  let stepCleanup = null;

  const textEl = h('p', { class: 'tour-text', 'aria-live': 'polite' });
  const nextBtn = button({ class: 'btn btn-dark btn-l tour-next' }, h('span', { class: 'btn-label' }, 'Далее'));
  const closeBtn = button({ class: 'btn-link tour-close' }, 'Закрыть');
  const counter = h('span', { class: 'visually-hidden' });
  const sheet = h('div', { class: 'tour', role: 'dialog', 'aria-label': 'Как получать больше кэшбэка' },
    h('div', { class: 'tour-glow', 'aria-hidden': 'true' }),
    h('div', { class: 'tour-body' }, counter, textEl, nextBtn, closeBtn));
  stage.append(sheet);
  el.classList.add('is-touring');
  entry.el.inert = false;

  nextBtn.addEventListener('click', () => {
    haptics.selection();
    if (STEPS[index]?.last) finish();
    else go(index + 1);
  });
  closeBtn.addEventListener('click', () => finish());

  animate(sheet, [{ transform: 'translateY(100%)' }, { transform: 'none' }], { duration: 520, easing: EASE.ios });
  go(0);

  function focusBlock(name) {
    // шаг-знакомство: ничего не подсвечиваем, экран чуть приглушён целиком
    el.classList.toggle('is-tour-intro', !name);
    if (!name) {
      for (const b of el.querySelectorAll('.is-focus')) b.classList.remove('is-focus');
      el.scrollTo({ top: 0, behavior: reducedMotion() ? 'auto' : 'smooth' });
      return;
    }
    for (const b of el.querySelectorAll('[data-tour]')) b.classList.toggle('is-focus', b.dataset.tour === name);
    const target = el.querySelector(`[data-tour="${name}"]`);
    const appbarH = parseFloat(getComputedStyle(el).paddingTop);
    const r = target.getBoundingClientRect();
    const top = el.getBoundingClientRect().top;
    const sheetTop = sheet.getBoundingClientRect().top + 60; // верх шторки прозрачный
    // блок уже виден над шторкой — страницу не двигаем
    if (r.top >= top + appbarH && r.bottom <= sheetTop) return;
    const y = r.top - top + el.scrollTop - appbarH - 12;
    el.scrollTo({ top: Math.max(0, y), behavior: reducedMotion() ? 'auto' : 'smooth' });
  }

  function typeWords(text) {
    clearTimeout(wordsTimer);
    const words = text.split(' ');
    textEl.setAttribute('aria-label', text);
    textEl.replaceChildren(...words.map((w) => h('span', { class: 'tour-word', 'aria-hidden': 'true' }, `${w} `)));
    if (reducedMotion()) return;
    [...textEl.children].forEach((w, i) => {
      animate(w, [{ opacity: 0, filter: 'blur(4px)', transform: 'translateY(4px)' }, { opacity: 1, filter: 'blur(0)', transform: 'none' }], { duration: 320, delay: i * 70, easing: EASE.out });
    });
  }

  function setLabel(text) {
    nextBtn.querySelector('.btn-label').textContent = text;
  }

  // Задание шага выполнено — кнопка снова ведёт дальше.
  function unlock() {
    nextBtn.disabled = false;
    setLabel('Далее');
    haptics.success();
    animate(nextBtn, [{ transform: 'scale(1)' }, { transform: 'scale(1.05)' }, { transform: 'scale(1)' }], { duration: 380, easing: EASE.spring, fill: 'none' });
  }

  async function go(i) {
    stepCleanup?.();
    stepCleanup = null;
    index = i;
    const step = STEPS[i];
    counter.textContent = `Шаг ${i + 1} из ${STEPS.length}`;
    nextBtn.disabled = Boolean(step.views || step.likes);
    if (step.views) setLabel(`Просмотрено 0 из ${step.views}`);
    else if (step.likes) setLabel('Поставьте сердечко');
    else setLabel(step.cta || (step.last ? 'Понятно' : 'Далее'));
    focusBlock(step.target);
    typeWords(step.text);
    if (step.cards || step.hearts) {
      // ждём, пока страница докрутится до ленты
      await wait(reducedMotion() ? 0 : 750);
      if (index !== i || !active) return;
      if (step.cards) collectViews(step.cards, step.views);
      if (step.hearts) stepCleanup = waitForLike(step.hearts);
    }
  }

  // Карточки ленты, которые видны между апп-баром и шторкой.
  function visibleCards(name) {
    const list = el.querySelector(`[data-tour-cards="${name}"]`);
    if (!list || !active) return [];
    const appbarBottom = el.getBoundingClientRect().top + parseFloat(getComputedStyle(el).paddingTop);
    const sheetTop = sheet.getBoundingClientRect().top + 60;
    return [...list.querySelectorAll('.ocard')].filter((card) => {
      const r = card.querySelector('.ocard-tile').getBoundingClientRect();
      return r.top >= appbarBottom - 10 && r.top + 60 <= sheetTop;
    });
  }

  // Сердечки видимых офферов по очереди загораются красным — подсказка, что их можно ставить.
  function hintHearts(name) {
    visibleCards(name).forEach((card, i) => {
      const heart = card.querySelector('.ocard-heart');
      if (!heart || heart.getAttribute('aria-pressed') === 'true') return;
      setTimeout(() => {
        if (!active) return;
        heart.classList.add('is-hint');
        animate(heart, [{ transform: 'rotate(0) scale(1)' }, { transform: 'rotate(-16deg) scale(1.25)' }, { transform: 'rotate(10deg) scale(1.1)' }, { transform: 'rotate(0) scale(1)' }], { duration: 480, easing: EASE.out, fill: 'none' });
        setTimeout(() => heart.classList.remove('is-hint'), 2200);
      }, i * 160);
    });
  }

  // Шаг с лайками: подсказка повторяется, пока пользователь сам не поставит сердечко.
  function waitForLike(name) {
    hintHearts(name);
    const timer = setInterval(() => hintHearts(name), 4200);
    const unsub = store.subscribe((_, change) => {
      if (change.type !== 'fav' || !change.liked) return;
      stop();
      unlock();
    });
    function stop() {
      clearInterval(timer);
      unsub?.();
    }
    return stop;
  }

  // Шаг с просмотрами: считаем первые goal карточек, дальше отметки ставит трекер сам и после тура.
  function collectViews(name, goal) {
    const list = el.querySelector(`[data-tour-cards="${name}"]`);
    if (!list) return null;
    let seen = 0;
    trackViews(el, list, {
      bottom: () => (sheet.isConnected ? sheet.getBoundingClientRect().top + 60 : null),
      onView(count) {
        if (!active || !STEPS[index]?.views || seen >= goal) return;
        seen = Math.min(goal, seen + count);
        setLabel(seen >= goal ? 'Далее' : `Просмотрено ${seen} из ${goal}`);
        if (seen >= goal) setTimeout(() => { if (active && STEPS[index]?.views) unlock(); }, count * 180 + 200);
      },
    });
    return null;
  }

  async function finish() {
    if (!active) return;
    stepCleanup?.();
    active = false;
    clearTimeout(wordsTimer);
    store.completeTour(scenario);
    el.classList.remove('is-touring', 'is-tour-intro');
    for (const b of el.querySelectorAll('.is-focus')) b.classList.remove('is-focus');
    await animate(sheet, [{ transform: 'none' }, { transform: 'translateY(100%)' }], { duration: 360, easing: EASE.ios });
    sheet.remove();
  }

  return {
    get active() {
      return active;
    },
    destroy() {
      stepCleanup?.();
      active = false;
      sheet.remove();
    },
  };
}

// Отметка «просмотрено»: карточка, попавшая во вьюпорт, получает большую зелёную галочку внизу на картинке,
// через секунду она сжимается до 16px и остаётся — незаметная, но видно, что оффер засчитан.
// Трекер живёт на странице и после тура: засчитываются все карточки, до которых долистали.
const trackers = new WeakMap();

function trackViews(page, list, { bottom, onView }) {
  const prev = trackers.get(page);
  if (prev) {
    prev.onView = onView;
    prev.bottom = bottom;
    prev.collect();
    return;
  }
  const t = { onView, bottom, raf: 0 };
  t.collect = () => {
    const appbarBottom = page.getBoundingClientRect().top + parseFloat(getComputedStyle(page).paddingTop);
    const sheetTop = t.bottom?.();
    const limit = sheetTop ?? page.getBoundingClientRect().bottom;
    const fresh = [...list.querySelectorAll('.ocard')].filter((card) => {
      if (card.classList.contains('is-viewed')) return false;
      const r = card.querySelector('.ocard-tile').getBoundingClientRect();
      return r.top >= appbarBottom - r.height / 2 && r.bottom <= limit;
    });
    // хаптик только во время тура — после него галочки ставятся молча
    fresh.forEach((card, i) => markViewed(card, i * 180, sheetTop != null));
    if (fresh.length) t.onView?.(fresh.length);
  };
  t.onScroll = () => {
    cancelAnimationFrame(t.raf);
    t.raf = requestAnimationFrame(t.collect);
  };
  page.addEventListener('scroll', t.onScroll, { passive: true });
  trackers.set(page, t);
  t.collect();
}

function markViewed(card, delay, tick) {
  card.classList.add('is-viewed');
  const mark = h('span', { class: 'counted', 'aria-hidden': 'true' }, iconImg('success', { size: 28 }));
  card.querySelector('.ocard-tile').append(mark);
  const small = 'scale(0.5714)'; // 28px → 16px
  animate(mark, [
    { opacity: 0, transform: 'scale(.3) rotate(-30deg)', offset: 0 },
    { opacity: 1, transform: 'scale(1.2)', offset: 0.18 },
    { opacity: 1, transform: 'scale(1)', offset: 0.3 },
    { opacity: 1, transform: 'scale(1)', offset: 0.72 },
    { opacity: 1, transform: small, offset: 1 },
  ], { duration: 1700, delay, easing: 'cubic-bezier(.33,0,.2,1)' });
  if (tick) setTimeout(() => haptics.light(), delay);
}

export function stopViewMarks(page) {
  const t = trackers.get(page);
  if (!t) return;
  page.removeEventListener('scroll', t.onScroll);
  cancelAnimationFrame(t.raf);
  trackers.delete(page);
}
