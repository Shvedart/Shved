// Тур по главной в сценариях 03 и 04: живой градиент, текст по словам, «Далее» подсвечивает блоки.
// 04 — исходный тур (механики по очереди). 03 — эксперимент: тур вокруг одной привычки
// «перед покупкой загляни сюда», механики подчинены ей.

import { h, button, iconImg, wait } from '../core/dom.js';
import { animate, EASE, reducedMotion } from '../core/motion.js';
import { haptics } from '../core/haptics.js';
import { store } from '../core/store.js';
import { playConfetti } from '../ui/confetti.js';

// верх шторки прозрачный (дуга градиента): всё, что выше этой линии от её верха, считается видимым.
// Меняется вместе с `.tour { padding-top }` в screens.css
const SHEET_FADE = 100;
// «подол» шторки под нижним краем экрана (`--skirt` в screens.css): к видимой высоте добавляем его
const SKIRT = 80;

// 04: знакомство → ценность (счётчик и пролёт ленты) → галочка (кэшбэк сам) → сердечко как закладка →
// стирашка как бонус → навигация по категориям → привычка
const TOUR_HABIT = [
  { target: null, text: 'Привет! За минуту покажем, как здесь получать больше кэшбэка', cta: 'Погнали' },
  // counter — крупное число набегает до N прямо над текстом шага, лента под шторкой пролистывается до афиши
  { target: null, stay: true, counter: 5000, text: 'предложений с кэшбэком —\nвыгода найдётся почти на всё', cta: 'Как это работает?' },
  { target: 'selection', spotlight: 'selection', text: 'Увидели предложение — кэшбэк уже ваш. Ничего активировать не нужно', cta: 'Понятно' },
  { target: 'selection', hearts: 'selection', keepScroll: true, nudgeRows: 2, text: 'Нашли нужное среди тысяч предложений? Сердечко — чтобы не потерять' },
  { target: 'selection', scratch: true, text: 'А иногда в ленте прячется подарок — сотрите карточку' },
  // navDemo — лента встаёт к навигации, тур сам переключает категории; последняя остаётся включённой
  { target: null, stay: true, navDemo: ['health', 'travel', 'food'], text: 'Уже знаете, что купить?\nВыберите категорию — покажем\nподходящие предложения' },
  { target: null, stay: true, hero: 'assets/img/tour/final-70.webp', text: 'Перед покупкой загляните\nсюда: частые гости получают\nна 70% больше кэшбэка', cta: 'Лутать кэшбэк', last: true },
];

// 03: тот же тур-привычка, но с согласованной редакцией текстов (правки от 9 ноября)
const TOUR_HABIT_V2 = [
  { target: null, text: 'За покупки можно получать больше кэшбэка. За минуту расскажем', cta: 'Погнали' },
  { target: null, stay: true, counter: 5000, text: 'предложений с кэшбэком —\nвыгода найдётся почти на всё', cta: 'Как это работает?' },
  { target: 'selection', spotlight: 'selection', text: 'Как только\nвы видите предложение,\nкэшбэк уже активен', sub: 'Проверьте условия в карточке', cta: 'Понятно' },
  { target: 'selection', hearts: 'selection', keepScroll: true, nudgeRows: 2, text: 'Поставьте сердечко, чтобы отслеживать акции этого магазина или бренда' },
  { target: 'selection', scratch: true, text: 'А иногда в ленте прячется подарок — сотрите карточку' },
  { target: null, stay: true, navDemo: ['health', 'travel', 'food'], text: 'Уже знаете, что купить?\nВыберите категорию — покажем\nподходящие предложения' },
  { target: null, stay: true, hero: 'assets/img/tour/final-70.webp', text: 'Заходите сюда перед\nпокупкой — каждый день\nновые предложения', cta: 'Лутать кэшбэк', last: true },
];

// 05: исходный тур — механики раздела по очереди
const TOUR_MECHANICS = [
  { target: null, text: 'Привет! За минуту покажем, как здесь получать больше кэшбэка', cta: 'Погнали' },
  { target: 'streak', text: 'Заходите сюда 5 дней подряд — и мы сделаем вам крутой подарок' },
  { target: 'selection', spotlight: 'selection', text: 'Галочка на карточке означает, что кэшбэк активирован для вас', cta: 'Понятно' },
  { target: 'selection', scratch: true, text: 'Стирайте карточки и ищите крутую выгоду' },
  { target: 'selection', hearts: 'selection', keepScroll: true, nudgeRows: 2, text: 'Понравилось предложение? Поставьте сердечко' },
  // финал без прокрутки наверх: страница остаётся там, где пользователь закончил
  // hero — картинка в центре: шторка растягивается почти на весь экран и становится белой
  { target: null, stay: true, hero: 'assets/img/tour/final-70.webp', text: 'Кто заходит сюда каждый день, получает на 70% больше кэшбэка', cta: 'Лутать кэшбэк', last: true },
];

const TOURS = { s3: TOUR_HABIT_V2, s4: TOUR_HABIT, s5: TOUR_MECHANICS };

export function startTour({ el, entry, scenario }) {
  const STEPS = TOURS[scenario] || TOUR_MECHANICS;
  const stage = el.parentElement;
  let index = -1;
  let active = true;
  let wordsTimer = 0;
  let stepCleanup = null;
  let stopConfetti = null;

  const textEl = h('p', { class: 'tour-text', 'aria-live': 'polite' });
  // sub — подзаголовок под текстом шага, проявляется, когда текст допечатан
  const subEl = h('p', { class: 'tour-sub', hidden: true });
  const nextBtn = button({ class: 'btn btn-dark btn-l tour-next' }, h('span', { class: 'btn-label' }, 'Далее'));
  const closeBtn = button({ class: 'btn-link tour-close' }, 'Закрыть');
  const counter = h('span', { class: 'visually-hidden' });
  const heroEl = h('div', { class: 'tour-hero', 'aria-hidden': 'true' });
  const countEl = h('div', { class: 'tour-count', 'aria-hidden': 'true', hidden: true },
    h('span', { class: 'tour-count-num' }, h('span', { class: 'tour-count-digits' }, '0')));
  const sheet = h('div', { class: 'tour', role: 'dialog', 'aria-label': 'Как получать больше кэшбэка' },
    h('div', { class: 'tour-glow', 'aria-hidden': 'true' }),
    h('div', { class: 'tour-body' }, heroEl, countEl, counter, textEl, subEl, nextBtn, closeBtn));
  /* Шторка — внутри прокручиваемой страницы, прилеплена к низу (sticky): свайп по ней листает
     ленту нативно, с инерцией. Отдельный слой поверх страницы на iPhone перехватывал скролл
     даже с pointer-events: none. Отрицательный отступ — чтобы она не добавляла высоту ленте. */
  el.append(sheet);
  sheet.style.marginTop = `${-sheet.offsetHeight}px`;
  el.classList.add('is-touring');
  entry.el.inert = false;

  nextBtn.addEventListener('click', () => {
    haptics.selection();
    if (STEPS[index]?.last) finish();
    else go(index + 1);
  });
  closeBtn.addEventListener('click', () => finish());

  animate(sheet, [{ transform: 'translateY(100%)' }, { transform: 'none' }], { duration: 520, easing: EASE.ios });
  // карточку для шага с галочкой начинаем грузить сразу, пока идут первые шаги
  const spotStep = STEPS.find((s) => s.spotlight);
  if (spotStep) warmCard(spotStep.spotlight);
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
    const sheetTop = sheet.getBoundingClientRect().top + SHEET_FADE; // верх шторки прозрачный
    // блок уже виден над шторкой — страницу не двигаем
    if (r.top >= top + appbarH && r.bottom <= sheetTop) return;
    const y = r.top - top + el.scrollTop - appbarH - 12;
    el.scrollTo({ top: Math.max(0, y), behavior: reducedMotion() ? 'auto' : 'smooth' });
  }

  // Докручиваем ленту так, чтобы скретч-карточка встала посередине между апп-баром и шторкой.
  function scrollToCard(card) {
    const top = el.getBoundingClientRect().top;
    const appbarH = parseFloat(getComputedStyle(el).paddingTop);
    const sheetTop = sheet.getBoundingClientRect().top + SHEET_FADE;
    const r = card.getBoundingClientRect();
    const free = sheetTop - top - appbarH;
    const y = r.top - top + el.scrollTop - appbarH - Math.max(12, (free - r.height) / 2);
    el.scrollTo({ top: Math.max(0, y), behavior: reducedMotion() ? 'auto' : 'smooth' });
  }

  // Шаг со скретч-карточкой: показываем, как стирать; стирать или нет — решает пользователь.
  function waitForScratch(card) {
    const hintTimer = setTimeout(() => card.playHint(), reducedMotion() ? 200 : 1100);
    return () => clearTimeout(hintTimer);
  }

  // «Больше 5000 предложений»: число набегает от нуля, а лента под шторкой в это же время
  // быстро пролистывается вниз — масштаб чувствуется, а не только читается.
  function runCounter(total) {
    const num = countEl.querySelector('.tour-count-num');
    const digits = countEl.querySelector('.tour-count-digits');
    const fmtNum = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00A0');
    // шторка на этом шаге выше обычной: число стоит наверху, на сплошном градиенте, а не поверх ленты
    const base = sheet.offsetHeight;
    countEl.hidden = false;
    sheet.classList.add('is-tall');
    const tall = Math.max(base, Math.round(el.clientHeight * 0.62) + SKIRT);
    sheet.style.height = `${tall}px`;
    sheet.style.marginTop = `${-tall}px`;
    const shrink = () => {
      countEl.hidden = true;
      sheet.classList.remove('is-tall');
      // текст следующего шага ставится сразу после — меряем высоту в следующем кадре, уже с ним.
      // Иначе шторка сжималась под старый текст, новый не влезал и кнопка проседала вниз
      requestAnimationFrame(() => {
        sheet.style.height = '';
        const h0 = sheet.offsetHeight;
        sheet.style.marginTop = `${-h0}px`;
        if (!reducedMotion()) animate(sheet, [{ height: `${tall}px`, marginTop: `${-tall}px` }, { height: `${h0}px`, marginTop: `${-h0}px` }], { duration: 420, easing: EASE.ios, fill: 'none' });
      });
    };
    if (reducedMotion()) { digits.textContent = fmtNum(total); return shrink; }
    animate(sheet, [{ height: `${base}px`, marginTop: `${-base}px` }, { height: `${tall}px`, marginTop: `${-tall}px` }], { duration: 800, easing: EASE.ios, fill: 'none' });
    animate(countEl, [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 320, easing: EASE.out });
    const DUR = 2200;
    const from = el.scrollTop;
    const grid = el.querySelector('[data-tour-cards]');
    const appbarH = parseFloat(getComputedStyle(el).paddingTop);
    const elTop = el.getBoundingClientRect().top;
    const maxScroll = el.scrollHeight - el.clientHeight;
    // пролетаем до афиши «События для вас»: её заголовок встаёт под апп-бар, крупные карточки
    // уходят под шторку дугой. Нет афиши — до середины ленты
    const afisha = el.querySelector('.fc-hero');
    const head = afisha?.firstElementChild;
    let to;
    if (head?.offsetParent) to = head.getBoundingClientRect().top - elTop + el.scrollTop - appbarH - 12;
    else {
      const grid = el.querySelector('[data-tour-cards]');
      to = grid ? grid.getBoundingClientRect().top - elTop + el.scrollTop + grid.offsetHeight * 0.5 : from + 2400;
    }
    to = Math.min(maxScroll, Math.max(0, to));
    const t0 = performance.now();
    let raf = 0;
    let stopped = false;
    const tick = (now) => {
      if (stopped) return;
      const p = Math.min(1, (now - t0) / DUR);
      const counterEase = 1 - (1 - p) ** 3; // число быстро растёт и мягко доходит до конца
      const scrollEase = p < 0.5 ? 4 * p ** 3 : 1 - (-2 * p + 2) ** 3 / 2; // лента разгоняется и тормозит
      digits.textContent = fmtNum(Math.round(total * counterEase));
      el.scrollTop = from + (to - from) * scrollEase;
      if (p < 1) raf = requestAnimationFrame(tick);
      else {
        haptics.light();
        animate(num, [{ transform: 'scale(1)' }, { transform: 'scale(1.08)' }, { transform: 'scale(1)' }], { duration: 360, easing: EASE.spring, fill: 'none' });
      }
    };
    raf = requestAnimationFrame(tick);
    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      shrink();
    };
  }

  // Финал: шторка вырастает почти на весь экран, фон белый, по центру — картинка.
  // Высоту меняем анимацией и следом пересчитываем отрицательный отступ, чтобы лента не сдвинулась.
  async function showHero(src) {
    // конфетти поверх всего экрана — слой не ловит касания, «Лутать кэшбэк» нажимается
    stopConfetti = playConfetti(stage);
    snapToFeedHead();
    const from = sheet.offsetHeight;
    const to = Math.max(from, el.clientHeight - 24 + SKIRT);
    heroEl.replaceChildren(h('img', { src, alt: '', draggable: 'false', decoding: 'async' }));
    sheet.classList.add('is-full');
    sheet.style.height = `${to}px`;
    sheet.style.marginTop = `${-to}px`;
    if (reducedMotion()) return;
    animate(sheet, [{ height: `${from}px`, marginTop: `${-from}px` }, { height: `${to}px`, marginTop: `${-to}px` }], { duration: 520, easing: EASE.ios, fill: 'none' });
    animate(heroEl, [{ opacity: 0, transform: 'scale(.8) translateY(24px)' }, { opacity: 1, transform: 'none' }], { duration: 620, delay: 220, easing: EASE.spring });
  }

  // Навигация ленты: доезжаем до неё и по очереди «нажимаем» категории.
  // Пользователь видит, как полки меняются, а не читает об этом.
  function runNavDemo(ids) {
    snapToFeedHead();
    let stopped = false;
    const item = (id) => el.querySelector(`.feed-nav-item[data-cat="${id}"]`);
    const tap = (btn) => {
      if (!btn) return;
      animate(btn, [{ transform: 'scale(1)' }, { transform: 'scale(.9)' }, { transform: 'scale(1)' }], { duration: 320, easing: EASE.out, fill: 'none' });
      btn.click();
    };
    // последняя категория остаётся включённой — лента так и показывает её дальше
    const last = ids[ids.length - 1];
    (async () => {
      await wait(reducedMotion() ? 200 : 900);
      for (const id of ids) {
        if (stopped) return;
        tap(item(id));
        await wait(1500);
      }
    })();
    return () => {
      stopped = true;
      // ушли с шага раньше — сразу ставим последнюю, чтобы не застрять на промежуточной
      const btn = item(last);
      if (btn && !btn.classList.contains('is-active')) btn.click();
    };
  }

  // Финал: лента встаёт к своему заголовку «Лента выгоды» — под апп-баром нет обрезанных карточек
  function snapToFeedHead() {
    // по заголовку, а не по блоку: у блока сверху свой отступ 32px
    const head = el.querySelector('.feed-head-title');
    if (!head) return;
    const appbarBottom = el.getBoundingClientRect().top + parseFloat(getComputedStyle(el).paddingTop);
    const d = head.getBoundingClientRect().top - appbarBottom;
    el.scrollTo({ top: Math.max(0, el.scrollTop + d - 4), behavior: reducedMotion() ? 'auto' : 'smooth' });
  }

  // Картинки карточки, которую поднимем, должны быть загружены и раскодированы заранее,
  // иначе на телефоне копия показывается пустой и фото «впрыгивают» (ждём не дольше 1,2 с)
  function warmCard(name) {
    const card = el.querySelector(`[data-tour-cards="${name}"] .ocard`);
    const imgs = card ? [...card.querySelectorAll('img')] : [];
    for (const im of imgs) im.loading = 'eager';
    const ready = Promise.all(imgs.map((im) => (im.decode ? im.decode() : Promise.resolve()).catch(() => {})));
    return Promise.race([ready, wait(1200)]);
  }

  // Ждём, пока страница перестанет прокручиваться (scrollTop не меняется 150 мс), но не дольше 1,6 с.
  function scrollIdle(page) {
    return new Promise((resolve) => {
      const t0 = performance.now();
      let last = page.scrollTop;
      let still = t0;
      const tick = (now) => {
        if (page.scrollTop !== last) { last = page.scrollTop; still = now; }
        if (now - still > 150 || now - t0 > 1600) resolve();
        else requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }

  function typeWords(text) {
    clearTimeout(wordsTimer);
    // \n в тексте шага — принудительный перенос строки (слова лежат во flex-строке, <br> там не работает)
    const lines = text.split('\n').map((l) => l.trim().split(' '));
    const words = lines.flat();
    textEl.setAttribute('aria-label', text.replace(/\n/g, ' '));
    // строки заданы вручную — поля уже, чтобы длинная строка не переносилась сама
    textEl.classList.toggle('is-lines', text.includes('\n'));
    textEl.replaceChildren(...lines.flatMap((ws, i) => [
      ...(i ? [h('span', { class: 'tour-br', 'aria-hidden': 'true' })] : []),
      // у последнего слова строки пробела нет — иначе длинная строка переносится из-за него
      ...ws.map((w, j) => h('span', { class: 'tour-word', 'aria-hidden': 'true' }, j < ws.length - 1 ? `${w} ` : w)),
    ]));
    if (reducedMotion()) return 0;
    [...textEl.querySelectorAll('.tour-word')].forEach((w, i) => {
      animate(w, [{ opacity: 0, filter: 'blur(4px)', transform: 'translateY(4px)' }, { opacity: 1, filter: 'blur(0)', transform: 'none' }], { duration: 320, delay: i * 70, easing: EASE.out });
    });
    return words.length * 70 + 320; // сколько печатается текст
  }

  function setLabel(text) {
    nextBtn.querySelector('.btn-label').textContent = text;
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
    // стирать не обязательно: «Далее» доступна сразу, стирашка лишь показывает, как это делается
    nextBtn.disabled = false;
    setLabel(step.cta || (step.last ? 'Понятно' : 'Далее'));
    if (card) {
      focusBlock(step.target, { scroll: false });
      scrollToCard(card);
    } else if (step.spotlight) {
      // лента встаёт так, чтобы первая карточка была сверху экрана, под апп-баром,
      // а не за градиентом: поднимаем именно её
      focusBlock(step.target, { scroll: false });
      const first = el.querySelector(`[data-tour-cards="${step.spotlight}"] .ocard`);
      if (first) {
        const appbarH = parseFloat(getComputedStyle(el).paddingTop);
        const y = first.getBoundingClientRect().top - el.getBoundingClientRect().top + el.scrollTop - appbarH - 12;
        el.scrollTo({ top: Math.max(0, y), behavior: reducedMotion() ? 'auto' : 'smooth' });
      }
    } else focusBlock(step.target, { stay: step.stay, scroll: !step.keepScroll });
    // докручиваем ленту вниз к следующему ряду офферов и ставим его наверх экрана, под апп-бар:
    // сердечки, которые подсвечиваем, оказываются у пользователя перед глазами
    if (step.nudgeRows) {
      const appbarBottom = el.getBoundingClientRect().top + parseFloat(getComputedStyle(el).paddingTop);
      const cards = [...el.querySelectorAll('[data-tour-cards] .ocard')].filter((c) => c.offsetParent);
      const row = cards[0]?.offsetHeight || 260;
      const target = cards.find((c) => c.getBoundingClientRect().top > appbarBottom + row * (step.nudgeRows - 1) + 40);
      if (target) {
        const y = target.getBoundingClientRect().top - appbarBottom + el.scrollTop - 12;
        el.scrollTo({ top: Math.max(0, y), behavior: reducedMotion() ? 'auto' : 'smooth' });
      }
    }
    if (step.hero) showHero(step.hero);
    if (step.navDemo) stepCleanup = runNavDemo(step.navDemo);
    if (step.counter) stepCleanup = runCounter(step.counter);
    else countEl.hidden = true;
    const typing = typeWords(step.text);
    subEl.hidden = !step.sub;
    subEl.textContent = step.sub || '';
    if (step.sub) animate(subEl, [{ opacity: 0, transform: 'translateY(4px)' }, { opacity: 1, transform: 'none' }], { duration: 320, delay: typing, easing: EASE.out, fill: 'backwards' });
    if (card && !scratchDone) {
      stepCleanup = waitForScratch(card);
      return;
    }
    if (step.spotlight || step.hearts) {
      // ждём, пока страница докрутится до ленты; сердечки загораются, когда текст шага допечатан
      await wait(reducedMotion() ? 0 : Math.max(750, step.hearts ? typing + 700 : 0));
      if (index !== i || !active) return;
      // на iPhone плавная докрутка длится дольше — ждём, пока лента встанет, иначе карточка сразу вернётся
      if (step.spotlight) await Promise.all([scrollIdle(el), warmCard(step.spotlight)]);
      if (index !== i || !active) return;
      if (step.spotlight) stepCleanup = spotlight(step.spotlight);
      if (step.hearts) stepCleanup = waitForLike(step.hearts);
    }
  }

  // Карточки ленты, которые видны между апп-баром и шторкой.
  // withPromos — вместе с промокодами (для подсказки на сердечках; «прожектор» берёт только офферы)
  function visibleCards(name, { withPromos = false } = {}) {
    const list = el.querySelector(`[data-tour-cards="${name}"]`);
    if (!list || !active) return [];
    const appbarBottom = el.getBoundingClientRect().top + parseFloat(getComputedStyle(el).paddingTop);
    const sheetTop = sheet.getBoundingClientRect().top + SHEET_FADE;
    return [...list.querySelectorAll(withPromos ? '.ocard, .promo' : '.ocard')].filter((card) => {
      if (!card.offsetParent) return false;
      const r = card.querySelector('.ocard-tile, .promo-tile').getBoundingClientRect();
      return r.top >= appbarBottom - 10 && r.top + 60 <= sheetTop;
    });
  }

  // Сердечки видимых офферов и промокодов по очереди загораются красным — подсказка, что их можно ставить.
  function hintHearts(name) {
    visibleCards(name, { withPromos: true }).forEach((card, i) => {
      const heart = card.querySelector('.ocard-heart, .promo-heart');
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
    // у копии картинки грузим сразу: ленивые <img> вне потока на iPhone появлялись с опозданием
    for (const im of clone.querySelectorAll('img')) im.loading = 'eager';
    // зелёный бейдж «Активен» растёт из угла логотипа, по нему бежит блик
    const mark = h('span', { class: 'spot-badge', 'aria-hidden': 'true' },
      iconImg('success', { size: 20 }), h('span', { class: 'spot-badge-text' }, 'Активен'),
      h('span', { class: 'spot-shine' }));
    const tile = clone.querySelector('.ocard-tile');
    tile.append(mark);
    stage.append(clone);
    card.style.visibility = 'hidden';
    el.classList.add('is-tour-spot');

    // центр свободной зоны между апп-баром и плотной частью шторки
    const appbarBottom = el.getBoundingClientRect().top + parseFloat(getComputedStyle(el).paddingTop) - sr.top;
    const freeBottom = sheet.getBoundingClientRect().top + SHEET_FADE - sr.top;
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
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        clone.remove();
        card.style.visibility = '';
        markViewed(card);
        trackViews(el, list);
      };
      // страховка: если анимация не отчиталась (бывает в Safari), карточка всё равно встанет на место
      const safety = new Promise((r) => setTimeout(r, 800));
      restored = Promise.race([
        animate(clone, [{ transform: out }, { transform: `translate(${bx}px, ${by}px)` }], { duration: 560, easing: EASE.ios }),
        safety,
      ]).then(finish);
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
      stopConfetti?.();
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
    const sheet = page.querySelector(':scope > .tour');
    const bottom = sheet ? sheet.getBoundingClientRect().top + SHEET_FADE : pr.bottom;
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
