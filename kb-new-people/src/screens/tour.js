// Необычный онбординг сценария 03: живой градиент, текст по словам, «Далее» подсвечивает блоки главной.

import { h, button, iconImg, wait } from '../core/dom.js';
import { animate, EASE, reducedMotion } from '../core/motion.js';
import { haptics } from '../core/haptics.js';
import { store } from '../core/store.js';

const STEPS = [
  { target: null, text: 'Привет! За минуту покажем, как здесь получать больше выгоды и лутать кэшбэк каждый день', cta: 'Погнали' },
  { target: 'streak', text: 'Заходите сюда 5 дней подряд — и мы подарим 99% кэшбэка на Яндекс Плюс' },
  { target: 'selection', cards: 'selection', text: 'Листайте ленту: увидели предложение — оно уже засчитано за вами. Просто платите картой Т-Банка' },
  { target: 'selection', hearts: 'selection', text: 'Понравилось предложение? Ставьте сердечко — оно сохранится в избранном и всегда будет под рукой' },
  { target: null, text: 'Кто заходит сюда каждый день, получает на 70% больше кэшбэка. Лутайте!', cta: 'Лутать кэшбэк', last: true },
];

export function startTour({ el, entry, scenario }) {
  const stage = el.parentElement;
  let index = -1;
  let active = true;
  let wordsTimer = 0;

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

  async function go(i) {
    index = i;
    const step = STEPS[i];
    counter.textContent = `Шаг ${i + 1} из ${STEPS.length}`;
    nextBtn.querySelector('.btn-label').textContent = step.cta || (step.last ? 'Понятно' : 'Далее');
    focusBlock(step.target);
    typeWords(step.text);
    if (step.cards || step.hearts) {
      // ждём, пока страница докрутится до ленты
      await wait(reducedMotion() ? 0 : 750);
      if (index !== i) return;
      if (step.cards) markVisibleCards(step.cards);
      if (step.hearts) hintHearts(step.hearts);
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

  // Сердечки видимых офферов по очереди загораются красным на секунду — подсказка, что их можно ставить.
  function hintHearts(name) {
    visibleCards(name).forEach((card, i) => {
      const heart = card.querySelector('.ocard-heart');
      if (!heart || heart.getAttribute('aria-pressed') === 'true') return;
      setTimeout(() => {
        if (!active) return;
        heart.classList.add('is-hint');
        animate(heart, [{ transform: 'rotate(0) scale(1)' }, { transform: 'rotate(-16deg) scale(1.25)' }, { transform: 'rotate(10deg) scale(1.1)' }, { transform: 'rotate(0) scale(1)' }], { duration: 480, easing: EASE.out, fill: 'none' });
        setTimeout(() => heart.classList.remove('is-hint'), 1000);
      }, i * 160);
    });
  }

  // Офферы ленты, попавшие во вьюпорт, получают зелёную галочку «засчитан» на месте сердечка, потом она пропадает.
  function markVisibleCards(name) {
    visibleCards(name).forEach((card, i) => {
      const mark = h('span', { class: 'counted', 'aria-hidden': 'true' }, iconImg('success', { size: 28 }));
      card.append(mark);
      setTimeout(() => card.classList.add('is-counted'), i * 180);
      animate(mark, [{ opacity: 0, transform: 'scale(.3) rotate(-30deg)' }, { opacity: 1, transform: 'scale(1.2)' }, { opacity: 1, transform: 'none' }], { duration: 480, delay: i * 180, easing: EASE.spring })
        .then(() => wait(1800))
        .then(() => animate(mark, [{ opacity: 1 }, { opacity: 0, transform: 'scale(.6)' }], { duration: 280 }))
        .then(() => { mark.remove(); card.classList.remove('is-counted'); });
    });
  }

  async function finish() {
    if (!active) return;
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
      active = false;
      sheet.remove();
    },
  };
}
