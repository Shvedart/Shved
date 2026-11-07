// Необычный онбординг сценария 03: живой градиент, текст по словам, «Далее» подсвечивает блоки главной.

import { h, button, iconImg, wait } from '../core/dom.js';
import { animate, EASE, reducedMotion } from '../core/motion.js';
import { haptics } from '../core/haptics.js';
import { store } from '../core/store.js';

const STEPS = [
  { target: null, text: 'Привет! За минуту покажем, как здесь получать больше кэшбэка', cta: 'Погнали' },
  { target: 'streak', text: 'Заходите сюда 5 дней подряд — и мы сделаем вам крутой подарок' },
  { target: 'selection', spotlight: 'selection', text: 'Галочка на карточке означает, что кэшбэк активирован', cta: 'Понятно' },
  { target: 'selection', scratch: true, text: 'Стирайте карточки и ищите крутую выгоду' },
  { target: 'selection', hearts: 'selection', keepScroll: true, nudgeRows: 2, text: 'Понравилось предложение? Поставьте сердечко' },
  // финал без прокрутки наверх: страница остаётся там, где пользователь закончил
  { target: null, stay: true, text: 'Кто заходит сюда каждый день, получает на 70% больше кэшбэка', cta: 'Лутать кэшбэк', last: true },
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

  function focusBlock(name, { stay = false, scroll = true } = {}) {
    // шаг-знакомство: ничего не подсвечиваем, экран чуть приглушён целиком; финал — без приглушения
    el.classList.toggle('is-tour-intro', !name && !stay);
    el.classList.toggle('is-tour-clear', !name && stay);
    if (!name) {
      for (const b of el.querySelectorAll('.is-focus')) b.classList.remove('is-focus');
      if (!stay) el.scrollTo({ top: 0, behavior: reducedMotion() ? 'auto' : 'smooth' });
      return;
    }
    for (const b of el.querySelectorAll('[data-tour]')) b.classList.toggle('is-focus', b.dataset.tour === name);
    if (!scroll) return;
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

  // Докручиваем ленту так, чтобы скретч-карточка встала посередине между апп-баром и шторкой.
  function scrollToCard(card) {
    const top = el.getBoundingClientRect().top;
    const appbarH = parseFloat(getComputedStyle(el).paddingTop);
    const sheetTop = sheet.getBoundingClientRect().top + 60;
    const r = card.getBoundingClientRect();
    const free = sheetTop - top - appbarH;
    const y = r.top - top + el.scrollTop - appbarH - Math.max(12, (free - r.height) / 2);
    el.scrollTo({ top: Math.max(0, y), behavior: reducedMotion() ? 'auto' : 'smooth' });
  }

  // Шаг со скретч-карточкой: показываем, как стирать, и ждём, пока пользователь сотрёт фольгу сам.
  function waitForScratch(card, i) {
    const hintTimer = setTimeout(() => card.playHint(), reducedMotion() ? 200 : 1100);
    // приз уже «вспыхнул» — даём его рассмотреть и открываем «Далее»
    const onReveal = () => setTimeout(() => { if (active && index === i) unlock(); }, 400);
    card.addEventListener('scratchreveal', onReveal, { once: true });
    return () => {
      clearTimeout(hintTimer);
      card.removeEventListener('scratchreveal', onReveal);
    };
  }

  function typeWords(text) {
    clearTimeout(wordsTimer);
    const words = text.split(' ');
    textEl.setAttribute('aria-label', text);
    textEl.replaceChildren(...words.map((w) => h('span', { class: 'tour-word', 'aria-hidden': 'true' }, `${w} `)));
    if (reducedMotion()) return 0;
    [...textEl.children].forEach((w, i) => {
      animate(w, [{ opacity: 0, filter: 'blur(4px)', transform: 'translateY(4px)' }, { opacity: 1, filter: 'blur(0)', transform: 'none' }], { duration: 320, delay: i * 70, easing: EASE.out });
    });
    return words.length * 70 + 320; // сколько печатается текст
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
    // сначала завершаем прошлый шаг (поднятая карточка возвращается на место), потом показываем новый
    const leaving = stepCleanup?.();
    stepCleanup = null;
    if (leaving instanceof Promise) {
      nextBtn.disabled = true;
      await leaving;
      await wait(reducedMotion() ? 0 : 500); // пауза: карточка встала на место — потом новый текст
      if (!active) return;
    }
    index = i;
    const step = STEPS[i];
    counter.textContent = `Шаг ${i + 1} из ${STEPS.length}`;
    const card = step.scratch ? el.querySelector('[data-tour-scratch]') : null;
    const scratchDone = card?.revealed;
    nextBtn.disabled = Boolean(card && !scratchDone);
    if (card && !scratchDone) setLabel('Сотрите карточку');
    else setLabel(step.cta || (step.last ? 'Понятно' : 'Далее'));
    if (card) {
      focusBlock(step.target, { scroll: false });
      scrollToCard(card);
    } else focusBlock(step.target, { stay: step.stay, scroll: !step.keepScroll });
    // докручиваем ленту вниз на пару рядов офферов от текущего места — к свежим карточкам с сердечками
    if (step.nudgeRows) {
      const grid = el.querySelector('[data-tour-cards]');
      const row = (grid?.querySelector('.ocard')?.offsetHeight || 260) + (parseFloat(getComputedStyle(grid).rowGap) || 0);
      el.scrollBy({ top: row * step.nudgeRows, behavior: reducedMotion() ? 'auto' : 'smooth' });
    }
    const typing = typeWords(step.text);
    if (card && !scratchDone) {
      stepCleanup = waitForScratch(card, i);
      return;
    }
    if (step.spotlight || step.hearts) {
      // ждём, пока страница докрутится до ленты; сердечки загораются, когда текст шага допечатан
      await wait(reducedMotion() ? 0 : Math.max(750, step.hearts ? typing + 700 : 0));
      if (index !== i || !active) return;
      if (step.spotlight) stepCleanup = spotlight(step.spotlight);
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

  // Шаг с лайками: сердечко ставить не обязательно — «Далее» доступна сразу,
  // подсказка повторяется, пока пользователь не лайкнет что-нибудь или не пойдёт дальше.
  function waitForLike(name) {
    hintHearts(name);
    const timer = setInterval(() => hintHearts(name), 4200);
    const unsub = store.subscribe((_, change) => {
      if (change.type === 'fav' && change.liked) stop();
    });
    function stop() {
      clearInterval(timer);
      unsub?.();
    }
    return stop;
  }

  // Шаг с галочкой: всё сереет, одна карточка выезжает в центр над шторкой, увеличивается,
  // на ней крупная галочка и бегущий блик. «Понятно», следующий шаг или скролл возвращают её на место.
  function spotlight(name) {
    const list = el.querySelector(`[data-tour-cards="${name}"]`);
    const card = visibleCards(name)[0];
    if (!list || !card) {
      if (list) trackViews(el, list);
      return null;
    }
    const sr = stage.getBoundingClientRect();
    const r = card.getBoundingClientRect();
    const clone = card.cloneNode(true);
    clone.classList.add('spot-card');
    clone.inert = true;
    clone.setAttribute('aria-hidden', 'true');
    Object.assign(clone.style, { left: `${r.left - sr.left}px`, top: `${r.top - sr.top}px`, width: `${r.width}px` });
    clone.querySelector('.counted')?.remove();
    // зелёный бейдж «Активен» растёт из угла логотипа, по нему бежит блик
    const mark = h('span', { class: 'spot-badge', 'aria-hidden': 'true' },
      iconImg('success', { size: 20 }), h('span', { class: 'spot-badge-text' }, 'Активен'),
      h('span', { class: 'spot-shine' }));
    const tile = clone.querySelector('.ocard-tile');
    tile.append(mark);
    stage.insertBefore(clone, sheet);
    card.style.visibility = 'hidden';
    el.classList.add('is-tour-spot');

    // центр свободной зоны между апп-баром и плотной частью шторки
    const appbarBottom = el.getBoundingClientRect().top + parseFloat(getComputedStyle(el).paddingTop) - sr.top;
    const freeBottom = sheet.getBoundingClientRect().top + 60 - sr.top;
    const scale = Math.min(1.3, (freeBottom - appbarBottom - 24) / r.height);
    const dx = sr.width / 2 - (r.left - sr.left + r.width / 2);
    const dy = (appbarBottom + freeBottom) / 2 - (r.top - sr.top + r.height / 2);
    const out = `translate(${dx}px, ${dy}px) scale(${scale})`;
    animate(clone, [{ transform: 'none' }, { transform: out }], { duration: 560, easing: EASE.ios });
    animate(mark, [{ opacity: 0, transform: 'scale(.6)' }, { opacity: 1, transform: 'none' }], { duration: 420, delay: 380, easing: EASE.out });
    haptics.light();

    const scrollStart = el.scrollTop;
    const onScroll = () => { if (Math.abs(el.scrollTop - scrollStart) > 8) restore(); };
    el.addEventListener('scroll', onScroll, { passive: true });

    let restored = null;
    function restore() {
      if (restored) return restored;
      el.removeEventListener('scroll', onScroll);
      el.classList.remove('is-tour-spot');
      // карточка уезжает назад вместе со страницей, если её уже прокрутили
      const back = card.getBoundingClientRect();
      const bx = back.left - r.left;
      const by = back.top - r.top;
      animate(mark, [{ opacity: 1 }, { opacity: 0 }], { duration: 200 });
      restored = animate(clone, [{ transform: out }, { transform: `translate(${bx}px, ${by}px)` }], { duration: 560, easing: EASE.ios }).then(() => {
        clone.remove();
        card.style.visibility = '';
        markViewed(card);
        trackViews(el, list);
      });
      return restored;
    }
    return restore;
  }

  async function finish() {
    if (!active) return;
    stepCleanup?.();
    active = false;
    clearTimeout(wordsTimer);
    store.completeTour(scenario);
    el.classList.remove('is-touring', 'is-tour-intro', 'is-tour-clear');
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

// Отметка «просмотрено»: когда карточка проходит центр экрана, в углу логотипа плавно проявляется
// маленькая зелёная галочка. Трекер живёт на странице и после тура — засчитываются все карточки ленты.
const trackers = new WeakMap();

function trackViews(page, list) {
  const prev = trackers.get(page);
  if (prev) {
    prev.collect();
    return;
  }
  const t = { raf: 0 };
  t.collect = () => {
    const pr = page.getBoundingClientRect();
    const appbarBottom = pr.top + parseFloat(getComputedStyle(page).paddingTop);
    const sheet = page.parentElement.querySelector('.tour');
    const bottom = sheet ? sheet.getBoundingClientRect().top + 60 : pr.bottom;
    const mid = (appbarBottom + bottom) / 2;
    const band = (bottom - appbarBottom) * 0.2;
    // ищем по странице, а не в сохранённом списке: после тура карточки переезжают в полки
    for (const card of page.querySelectorAll('[data-tour-cards] .ocard:not(.is-viewed)')) {
      const r = card.querySelector('.ocard-tile').getBoundingClientRect();
      if (Math.abs(r.top + r.height / 2 - mid) <= band) markViewed(card);
    }
  };
  t.onScroll = () => {
    cancelAnimationFrame(t.raf);
    t.raf = requestAnimationFrame(t.collect);
  };
  page.addEventListener('scroll', t.onScroll, { passive: true });
  trackers.set(page, t);
  t.collect();
}

function markViewed(card) {
  if (card.classList.contains('is-viewed')) return;
  card.classList.add('is-viewed');
  const mark = h('span', { class: 'counted', 'aria-hidden': 'true' }, iconImg('success', { size: 28 }));
  card.querySelector('.ocard-tile').append(mark);
  animate(mark, [{ opacity: 0 }, { opacity: 1 }], { duration: 500, easing: EASE.out });
}

export function stopViewMarks(page) {
  const t = trackers.get(page);
  if (!t) return;
  page.removeEventListener('scroll', t.onScroll);
  cancelAnimationFrame(t.raf);
  trackers.delete(page);
}
