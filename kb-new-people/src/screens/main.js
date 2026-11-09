// Главная «Кэшбэк» (фреймы 635:122815, 123307, 129517).

import { h, button, icon, iconImg, img, wait } from '../core/dom.js';
import { animate, EASE, stagger, fadeUpIn, reducedMotion } from '../core/motion.js';
import { store } from '../core/store.js';
import { haptics } from '../core/haptics.js';
import { toast } from '../ui/toast.js';
import { cardMini, cardHeader, cell, offerCard, productCard, promoCard } from '../ui/components.js';
import { favCard, favLook } from '../ui/favcard.js';
import { scratchCard } from '../ui/scratch.js';
import { buildShelves } from './feed.js';
import { startTour, stopViewMarks } from './tour.js';
import { openSheet } from '../ui/sheet.js';
import { app } from '../app.js';

// сценарии с заходом через плашку и тур; в 03 и 04 — тур-привычка, в 05 — тур про механики
const HOOK = ['s3', 's4', 's5'];
const HABIT = ['s3', 's4'];

export function mainScreen({ el, params, nav, entry }) {
  const scenario = params.s;
  const { catalog } = app;
  const cfg = catalog.config.main;
  const intro = app.flags.introFor === scenario;
  delete app.flags.introFor;
  const cleanups = [];
  let tour = null;
  el.classList.add('main');

  // ---------- Верх: сумма и действия ----------
  const actions = [
    { id: 'withdraw', label: 'Вывести', node: icon('arrow-right', { size: 28 }) },
    { id: 'privileges', label: 'Привилегии', node: iconImg('premium-gold', { size: 28 }) },
    { id: 'food', label: 'Еда', node: icon('food', { size: 28 }) },
    { id: 'edit', label: 'Изменить', node: icon('edit', { size: 28 }), disabled: true },
  ].map((a) => {
    const b = button({ class: `nav-action ${a.disabled ? 'is-disabled' : ''}`, 'aria-disabled': a.disabled ? 'true' : null, 'aria-label': a.disabled ? `${a.label}: недоступно` : a.label },
      h('span', { class: 'nav-action-icon' }, a.node), h('span', { class: 'nav-action-label' }, a.label));
    b.addEventListener('click', () => {
      if (a.id === 'edit') {
        haptics.warning();
        toast(store.state.pk ? 'Категории на этот месяц уже выбраны' : 'Сначала выберите категории в блоке «В ноябре»');
      } else if (a.id === 'food') {
        nav.push('/favorites');
      } else {
        toast('Недоступно в прототипе');
      }
    });
    return b;
  });

  const missedSlot = h('div', { class: 'missed-slot' });
  const amountEl = h('div', { class: 'main-amount', 'aria-label': cfg.balance }, cfg.balance);

  // Сумма «набегает» от нуля, как счётчики в приложениях Apple: быстро в начале, мягко в конце.
  function countUp(el, target, { duration = 1400 } = {}) {
    const fmtNum = (n) => `${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0')}\u00a0₽`;
    if (reducedMotion()) { el.textContent = fmtNum(target); return Promise.resolve(); }
    return new Promise((resolve) => {
      const t0 = performance.now();
      const tick = (t) => {
        const p = Math.min(1, (t - t0) / duration);
        const eased = p === 1 ? 1 : 1 - 2 ** (-10 * p);
        el.textContent = fmtNum(Math.round(target * eased));
        if (p < 1) requestAnimationFrame(tick);
        else resolve();
      };
      el.textContent = fmtNum(0);
      requestAnimationFrame(tick);
    });
  }
  const top = h('section', { class: 'main-top' },
    h('h1', { class: 'main-top-title' }, 'Кэшбэк'),
    amountEl,
    missedSlot,
    h('div', { class: 'nav-actions' }, actions));

  // ---------- Блоки ----------
  const pk = h('div', { class: 'main-block', dataset: { tour: 'pk' } }, cardMini({ flat: false }));
  cleanups.push(pk.firstChild.destroy);

  const fav = favCard({ mode: 'live', look: favLook(scenario) });
  cleanups.push(fav.destroy);
  const favBlock = h('div', { class: 'main-block', dataset: { tour: 'fav' } }, fav);

  const streakCfg = cfg.streak;
  // Офферы, которые откроются в следующие дни серии: по 4 на день, без тех, что уже доступны сегодня.
  const upcomingPool = catalog.categories
    .flatMap((c) => catalog.offersInCategory(c.id))
    .filter((o) => o.type === 'cashback' && o.image && !cfg.availableToday.includes(o.id));
  const upcomingFor = (i) => upcomingPool.slice((i - 1) * 4, i * 4);

  const dayEls = streakCfg.days.map((d, i) => {
    const done = i === 0 && store.state.streak.day1;
    // у засчитанного первого дня замка нет вовсе — только галочка
    const mark = d.gift ? iconImg('priz', { size: 16, cls: 'day-mark' }) : done ? null : icon('lock', { size: 16, cls: 'day-mark day-lock' });
    // первый день: до активации — замочек, как у остальных; после — галочка
    const content = [h('span', { class: 'day-dow' }, d.dow), h('span', { class: 'day-num' }, d.day), mark,
      // монохромная иконка (цвет из currentColor): белая без CSS-фильтра — фильтр Safari растрирует
      i === 0 ? icon('check', { size: 16, cls: 'day-mark day-check' }) : null];
    if (i === 0) {
      return h('div', { class: `day ${done ? 'is-done' : ''}`, role: 'listitem', 'aria-label': `${d.dow} ${d.day}: ${done ? 'засчитан' : 'сегодня'}` }, ...content);
    }
    // заблокированные дни открывают шторку с офферами, которые станут доступны в этот день
    const b = button({ class: `day day-locked ${d.gift ? 'is-gift' : ''}`, 'aria-label': `${d.dow} ${d.day}: ${d.gift ? 'подарок' : 'откроется'}. Показать предложения`, 'aria-haspopup': 'dialog' }, ...content);
    b.addEventListener('click', () => openUpcoming(i));
    return h('div', { role: 'listitem', class: 'day-cell' }, b);
  });

  function openUpcoming(i) {
    const d = streakCfg.days[i];
    haptics.selection();
    let sheet = null;
    const cards = upcomingFor(i).map((o) => offerCard(o, {
      size: 's',
      locked: true,
      lockLabel: `Откроется ${d.when}`,
      onOpen: () => { sheet.close({ instant: true }); nav.push(`/offer/${o.id}`); },
    }));
    sheet = openSheet({
      title: d.gift ? `${d.dow}, ${d.day} — подарок` : `Откроется ${d.when}`,
      subtitle: d.gift ? 'Кэшбэк 99% на Яндекс Плюс и эти предложения — за 5 дней подряд' : 'Заходите каждый день, чтобы получить эти предложения',
      body: h('div', { class: 'grid upcoming-grid' }, cards),
    });
  }
  const today = cfg.availableToday.map((id) => catalog.getOffer(id)).filter(Boolean);
  const streak = h('section', { class: 'card streak', dataset: { tour: 'streak' } },
    h('div', { class: 'card-header' },
      h('div', { class: 'card-header-text' },
        h('h2', { class: 'card-title' }, streakCfg.title[0], h('br'), streakCfg.title[1], ' ', img('assets/img/yandex-plus.png', { cls: 'inline-logo', alt: '', width: 16, height: 16 }), ' ', streakCfg.title[2]),
        h('p', { class: 'card-subtitle' }, streakCfg.subtitle))),
    h('div', { class: 'days', role: 'list', 'aria-label': 'Серия заходов' }, dayEls),
    h('div', { class: 'card-header card-header-tight streak-today' }, h('h2', { class: 'card-title' }, 'Доступно уже сегодня')),
    // строками, как в «Мое любимое»: маленький логотип, процент и название. Прежний вид — карточки:
    // h('div', { class: 'hscroll streak-today' }, today.map((o) => offerCard(o, { size: 'm' })))
    h('div', { class: 'streak-today streak-rows' }, today.map((o) => {
      const c = cell(o);
      c.querySelector('.cell-title').prepend(h('span', { class: 'cell-logo' }, img(o.logo, { alt: '', width: 20, height: 20, fallback: o.name })));
      return c;
    })));

  const nearby = h('section', { class: 'card nearby', dataset: { tour: 'nearby' } },
    cardHeader({ title: 'Выгода рядом с вами', subtitle: 'Кэшбэк на районе', aside: h('span', { class: 'map-pin', 'aria-hidden': 'true' }, icon('location', { size: 22 })) }),
    h('ul', { class: 'nearby-list', role: 'list' }, cfg.nearby.map((n) => h('li', { class: 'nearby-row' },
      h('span', { class: 'nearby-icon' }, icon(n.icon, { size: 20 })),
      h('span', { class: 'nearby-text' }, h('span', { class: 'nearby-title' }, `${n.cashback} • ${n.name}`), h('span', { class: 'nearby-sub' }, n.address))))));

  const products = h('section', { class: 'card products', dataset: { tour: 'products' } },
    // экрана со всеми товарами в прототипе нет — «Все» только показывает подсказку
    cardHeader({ title: 'Товары с кэшбэком', link: 'Все', onLink: () => toast('Недоступно в прототипе') }),
    // реальные товары из data/products.json; если их нет — прежние офферы из overrides
    h('div', { class: 'hscroll' }, (catalog.products.length ? catalog.products : cfg.products.map((id) => catalog.getOffer(id)).filter(Boolean)).map((p) => productCard(p))));

  // Подборка: сначала избранные редакцией, затем все остальные офферы без лайка.
  // Список фиксируется при входе — лайк не убирает карточку из-под пальца.
  function selectionOffers() {
    const liked = new Set(store.state.favBrands);
    const seen = new Set();
    const all = [...cfg.selection.map((id) => catalog.getOffer(id)), ...catalog.categories.flatMap((c) => catalog.offersInCategory(c.id))];
    return all.filter((o) => o && o.image && !liked.has(o.brandId) && !seen.has(o.id) && seen.add(o.id));
  }

  // Скретч-карточки с крутыми призами: первая — в 8-м ряду (её стирают в туре), остальные разбросаны ниже.
  const SCRATCH_PRIZES = [
    // пять стирашек на ленту; номер — поле scratch у полки в LAYOUT (feed.js), приз — по теме полки
    { percent: '75%', title: 'Скидка в Самокате', sub: 'на первый заказ до конца недели' },
    { percent: '50%', title: 'Кэшбэк на анализы', sub: 'в ИНВИТРО до конца недели' },
    { percent: '1 000 ₽', title: 'Кэшбэк в Ситилинке', sub: 'за покупку от 10 000 ₽' },
    { percent: '55%', title: 'Кэшбэк на шиномонтаж', sub: 'до конца месяца' },
    { percent: '65%', title: 'Кэшбэк на поезда', sub: 'в Т-Путешествиях' },
  ];
  // индексы в сетке из двух колонок: чётный — слева, нечётный — справа
  const SCRATCH_SLOTS = [14, 34, 56, 78, 100];
  const scratches = SCRATCH_PRIZES.map((prize) => scratchCard({ prize }));
  scratches[0].dataset.tourScratch = '';
  cleanups.push(() => scratches.forEach((c) => c.destroy()));

  const selectionHeader = cardHeader({ title: 'Ваша подборка', subtitle: '40% крупных сетей', link: 'Все', onLink: () => nav.push('/favorites') });
  const selectionGrid = h('div', { class: 'grid', dataset: { tourCards: 'selection' } }, withScratch(selectionOffers().map((o) => offerCard(o, { size: 's' }))));
  const selection = h('section', { class: 'selection', dataset: { tour: 'selection' } }, selectionHeader, selectionGrid);

  function withScratch(cards) {
    scratches.forEach((c, i) => cards.splice(Math.min(SCRATCH_SLOTS[i], cards.length), 0, c));
    return cards;
  }

  const blocks = [pk, favBlock, streak, nearby, products, selection];
  el.append(h('div', { class: 'main-inner' }, top, ...blocks));
  scratches.forEach((c) => c.mount(el));

  // ---------- Лента полками ----------
  let shelves = null;
  function toShelves({ animated }) {
    if (shelves) return;
    const cards = [...selectionGrid.querySelectorAll(':scope > .ocard')];
    shelves = buildShelves({ catalog, cards, scratches, promos: catalog.promos.map((p) => promoCard(p)), onLink: () => nav.push('/favorites') });
    const swap = () => {
      selection.classList.add('is-shelves');
      selection.replaceChildren(shelves);
      shelves.mount(el);
    };
    if (!animated || reducedMotion()) { swap(); return; }
    // лента не прыгает: запоминаем карточку, что сейчас на экране, и после пересборки
    // возвращаем её на то же место; полки вокруг проявляются плавно
    const pageTop = el.getBoundingClientRect().top + parseFloat(getComputedStyle(el).paddingTop);
    const anchor = cards.find((c) => c.getBoundingClientRect().bottom > pageTop + 40) || null;
    const anchorY = anchor ? anchor.getBoundingClientRect().top : 0;
    animate(selectionGrid, [{ opacity: 1 }, { opacity: 0 }], { duration: 220, easing: EASE.in }).then(() => {
      swap();
      if (anchor?.isConnected) el.scrollTop += anchor.getBoundingClientRect().top - anchorY;
      animate(shelves, [{ opacity: 0 }, { opacity: 1 }], { duration: 360, easing: EASE.out });
    });
  }
  // лента полками во всех сценариях сразу — в 03 тур проходит уже по ней
  toShelves({ animated: false });
  cleanups.push(() => shelves?.destroy());

  // ---------- Апп-бар при скролле ----------
  let raf = 0;
  const onScroll = () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const appbarH = parseFloat(getComputedStyle(el).paddingTop);
      const scrolledTitle = el.scrollTop > top.offsetHeight * 0.5;
      const favBottom = favBlock.getBoundingClientRect().bottom - el.getBoundingClientRect().top;
      const showHeart = favBottom < appbarH;
      const st = entry.appbarState || {};
      if (st.titleVisible !== scrolledTitle || st.heartVisible !== showHeart) {
        app.appbar.patch(entry, { titleVisible: scrolledTitle, heartVisible: showHeart });
      }
    });
  };
  el.addEventListener('scroll', onScroll, { passive: true });

  // ---------- Серия: первый день засчитывается, когда блок виден на 50% ----------
  // В сценариях 03–05 — только когда блок поднялся в верхнюю часть экрана: обычно это происходит
  // на шаге тура про серию, и день засчитывается прямо на глазах.
  if (!store.state.streak.day1) {
    const hook = HOOK.includes(scenario);
    const io = new IntersectionObserver((items) => {
      if (!items.some((i) => i.isIntersecting) || app.nav.top !== entry || (!hook && tour?.active)) return;
      io.disconnect();
      setTimeout(() => {
        const day = dayEls[0];
        day.classList.add('is-done');
        // замок убираем из разметки, а не только стилем: в Safari на iPhone он оставался рядом с галочкой
        day.querySelector('.day-lock')?.remove();
        day.setAttribute('aria-label', `${streakCfg.days[0].dow} ${streakCfg.days[0].day}: засчитан`);
        animate(day, [{ transform: 'scale(.9)' }, { transform: 'scale(1.06)' }, { transform: 'scale(1)' }], { duration: 480, easing: EASE.spring });
        animate(day.querySelector('.day-check'), [{ opacity: 0, transform: 'scale(0) rotate(-30deg)' }, { opacity: 1, transform: 'scale(1.3)' }, { opacity: 1, transform: 'none' }], { duration: 520, delay: 120, easing: EASE.spring });
        store.markStreakDay();
      }, tour?.active ? 1500 : 250); // в туре — с паузой, чтобы сначала прочитали текст шага
    }, hook ? { root: el, rootMargin: '0px 0px -55% 0px', threshold: 0 } : { root: el, threshold: 0.5 });
    io.observe(streak);
    cleanups.push(() => io.disconnect());
  }

  // ---------- Сценарии 03–05: плашка «могли получить больше» ----------
  // заход через плашку «могли получить больше» и тур
  if (HOOK.includes(scenario)) {
    const missed = button({ class: 'missed', 'aria-label': `В ${cfg.missed.month} могли получить ещё ${cfg.missed.amount} кэшбэка. Узнать как` },
      h('span', { class: 'missed-crown' }, icon('crown', { size: 22 })),
      h('span', { class: 'missed-text' }, h('span', null, `В ${cfg.missed.month} могли получить`), h('span', { class: 'missed-amount' }, `ещё ${cfg.missed.amount} кэшбэка`)),
      h('span', { class: 'missed-q', 'aria-hidden': 'true' }, '?'));
    missed.addEventListener('click', () => {
      haptics.light();
      tour = startTour({ el, entry, scenario });
    });
    missedSlot.append(h('div', { class: 'missed-wrap' }, h('span', { class: 'missed-tail', 'aria-hidden': 'true' }), missed));
    // появляется чуть позже загрузки и плавно сдвигает контент вниз
    const balance = Number(cfg.balance.replace(/\D/g, ''));
    // в 03 и 04 тур не про упущенную выгоду — сумма стоит сразу, не набегает
    const counted = HABIT.includes(scenario) ? Promise.resolve() : countUp(amountEl, balance);
    setTimeout(async () => {
      await counted;
      missedSlot.classList.add('is-open');
      const target = missedSlot.firstChild.offsetHeight;
      await animate(missedSlot, [{ height: '0px', opacity: 0 }, { height: `${target}px`, opacity: 1 }], { duration: 480, easing: EASE.ios, fill: 'none' });
      // лёгкий блик пробегает по плашке, привлекая внимание
      missed.classList.add('is-shine');
      setTimeout(() => missed.classList.remove('is-shine'), 2600);
      // в 03 и 04 сумма не набегает — без паузы плашка выскакивала сразу при входе
    }, HABIT.includes(scenario) ? 800 : 300);
  }

  // ---------- Онбординг завершён: блок избранного становится настоящим, остальное появляется ----------
  if (intro) {
    const rest = [top, pk, streak, nearby, products, selection];
    rest.forEach((b) => { b.style.opacity = '0'; });
    animate(favBlock, [{ transform: 'scale(1.06)', opacity: 0.6 }, { transform: 'scale(1)', opacity: 1 }], { duration: 620, delay: 120, easing: EASE.ios });
    wait(380).then(() => {
      rest.forEach((b) => { b.style.opacity = ''; });
      stagger(rest, fadeUpIn, { duration: 460, step: 70, easing: EASE.out });
    });
    // включили уведомления в онбординге — рост кэшбэка засчитан: проигрываем его ещё раз уже здесь
    if (store.state.boost) wait(900).then(() => fav.playBoost());
  }

  return {
    appbar: { left: 'back', title: 'Кэшбэки', titleVisible: false, search: true, heart: true, heartVisible: false, onLeft: () => nav.popTo('/') },
    onActive: onScroll,
    onInactive() {
      tour?.destroy();
      tour = null;
      el.classList.remove('is-touring', 'is-tour-intro', 'is-tour-clear');
      for (const b of el.querySelectorAll('.is-focus')) b.classList.remove('is-focus');
    },
    destroy() {
      el.removeEventListener('scroll', onScroll);
      tour?.destroy();
      stopViewMarks(el);
      cleanups.forEach((fn) => fn?.());
    },
  };
}
