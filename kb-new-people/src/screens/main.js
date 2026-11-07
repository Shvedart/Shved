// Главная «Кэшбэк» (фреймы 635:122815, 123307, 129517).

import { h, button, icon, iconImg, img, wait } from '../core/dom.js';
import { animate, EASE, stagger, fadeUpIn, reducedMotion } from '../core/motion.js';
import { store } from '../core/store.js';
import { haptics } from '../core/haptics.js';
import { toast } from '../ui/toast.js';
import { cardMini, cardHeader, offerCard, productCard } from '../ui/components.js';
import { favCard } from '../ui/favcard.js';
import { startTour } from './tour.js';
import { openSheet } from '../ui/sheet.js';
import { app } from '../app.js';

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

  const fav = favCard({ mode: 'live' });
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
    const mark = d.gift ? img('assets/icons/priz.svg', { alt: '', width: 16, height: 16, cls: 'day-mark' }) : i === 0 ? iconImg('check', { size: 16, cls: 'day-mark day-check' }) : icon('lock', { size: 16, cls: 'day-mark' });
    const content = [h('span', { class: 'day-dow' }, d.dow), h('span', { class: 'day-num' }, d.day), mark];
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
    h('div', { class: 'card-header card-header-tight', dataset: { tour: 'today' } }, h('h2', { class: 'card-title' }, 'Доступно уже сегодня')),
    h('div', { class: 'hscroll' }, today.map((o) => offerCard(o, { size: 'm' }))));

  const nearby = h('section', { class: 'card nearby', dataset: { tour: 'nearby' } },
    cardHeader({ title: 'Выгода рядом с вами', subtitle: 'Кэшбэк на районе', aside: h('span', { class: 'map-pin', 'aria-hidden': 'true' }, icon('location', { size: 22 })) }),
    h('ul', { class: 'nearby-list', role: 'list' }, cfg.nearby.map((n) => h('li', { class: 'nearby-row' },
      h('span', { class: 'nearby-icon' }, icon(n.icon, { size: 20 })),
      h('span', { class: 'nearby-text' }, h('span', { class: 'nearby-title' }, `${n.cashback} • ${n.name}`), h('span', { class: 'nearby-sub' }, n.address))))));

  const products = h('section', { class: 'card products', dataset: { tour: 'products' } },
    cardHeader({ title: 'Товары с кэшбэком', subtitle: 'Самые жирные предложения' }),
    h('div', { class: 'hscroll' }, cfg.products.map((id) => catalog.getOffer(id)).filter(Boolean).map((o) => productCard(o))));

  // Подборка: сначала избранные редакцией, затем все остальные офферы без лайка.
  // Список фиксируется при входе — лайк не убирает карточку из-под пальца.
  function selectionOffers() {
    const liked = new Set(store.state.favBrands);
    const seen = new Set();
    const all = [...cfg.selection.map((id) => catalog.getOffer(id)), ...catalog.categories.flatMap((c) => catalog.offersInCategory(c.id))];
    return all.filter((o) => o && o.image && !liked.has(o.brandId) && !seen.has(o.id) && seen.add(o.id));
  }

  const selection = h('section', { class: 'selection', dataset: { tour: 'selection' } },
    cardHeader({ title: 'Ваша подборка', subtitle: '40% крупных сетей', link: 'Все', onLink: () => nav.push('/favorites') }),
    h('div', { class: 'grid', dataset: { tourCards: 'selection' } }, selectionOffers().map((o) => offerCard(o, { size: 's' }))));

  const blocks = [pk, favBlock, streak, nearby, products, selection];
  el.append(h('div', { class: 'main-inner' }, top, ...blocks));

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
  if (!store.state.streak.day1) {
    const io = new IntersectionObserver((items) => {
      if (!items.some((i) => i.isIntersecting) || app.nav.top !== entry || tour?.active) return;
      io.disconnect();
      setTimeout(() => {
        const day = dayEls[0];
        day.classList.add('is-done');
        day.setAttribute('aria-label', `${streakCfg.days[0].dow} ${streakCfg.days[0].day}: засчитан`);
        animate(day, [{ transform: 'scale(.9)' }, { transform: 'scale(1.06)' }, { transform: 'scale(1)' }], { duration: 480, easing: EASE.spring });
        animate(day.querySelector('.day-check'), [{ opacity: 0, transform: 'scale(0) rotate(-30deg)' }, { opacity: 1, transform: 'scale(1.3)' }, { opacity: 1, transform: 'none' }], { duration: 520, delay: 120, easing: EASE.spring });
        store.markStreakDay();
      }, 250);
    }, { root: el, threshold: 0.5 });
    io.observe(streak);
    cleanups.push(() => io.disconnect());
  }

  // ---------- Сценарий 03: плашка «могли получить больше» ----------
  if (scenario === 's3') {
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
    const counted = countUp(amountEl, balance);
    setTimeout(async () => {
      await counted;
      missedSlot.classList.add('is-open');
      const target = missedSlot.firstChild.offsetHeight;
      await animate(missedSlot, [{ height: '0px', opacity: 0 }, { height: `${target}px`, opacity: 1 }], { duration: 480, easing: EASE.ios, fill: 'none' });
      // лёгкий блик пробегает по плашке, привлекая внимание
      missed.classList.add('is-shine');
      setTimeout(() => missed.classList.remove('is-shine'), 2600);
    }, 300);
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
  }

  return {
    appbar: { left: 'back', title: 'Кэшбэки', titleVisible: false, search: true, heart: true, heartVisible: false, onLeft: () => nav.popTo('/') },
    onActive: onScroll,
    onInactive() {
      tour?.destroy();
      tour = null;
      el.classList.remove('is-touring', 'is-tour-intro');
      for (const b of el.querySelectorAll('.is-focus')) b.classList.remove('is-focus');
    },
    destroy() {
      el.removeEventListener('scroll', onScroll);
      tour?.destroy();
      cleanups.forEach((fn) => fn?.());
    },
  };
}
