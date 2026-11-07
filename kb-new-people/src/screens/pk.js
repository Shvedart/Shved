// Выбор 4 повышенных категорий (фреймы 635:122698 / 122646 / 122666). Открывается модально снизу.
// После подтверждения выбор изменить нельзя — экран открывается только для просмотра.

import { h, button, icon, iconImg, wait } from '../core/dom.js';
import { animate, EASE, stagger } from '../core/motion.js';
import { haptics } from '../core/haptics.js';
import { store } from '../core/store.js';
import { toast } from '../ui/toast.js';
import { primaryButton } from '../ui/components.js';
import { app } from '../app.js';

export function pkScreen({ el, nav }) {
  el.classList.add('pk');
  const cfg = app.catalog.config.pk;
  const locked = !!store.state.pk;
  const chosen = new Set(locked ? store.state.pk.categories : []);
  let submitting = false;

  const rows = cfg.categories.map((cat) => {
    const check = h('span', { class: 'pk-check', 'aria-hidden': 'true' }, iconImg('checkbox', { size: 22, cls: 'pk-check-on' }));
    const main = button({ class: 'pk-row-main', role: 'checkbox', 'aria-checked': String(chosen.has(cat.id)), 'aria-label': `${cat.percent} ${cat.title}` },
      iconImg(cat.icon, { size: 40, cls: 'pk-icon' }),
      h('span', { class: 'pk-label' }, `${cat.percent} ${cat.title}`),
      check);
    const hint = button({ class: 'pk-hint', 'aria-label': `Подробнее: ${cat.title}` }, '?');
    hint.addEventListener('click', () => toast(cat.hint, { duration: 3000 }));
    main.addEventListener('click', () => toggle(cat.id));
    const row = h('li', { class: 'pk-row', dataset: { cat: cat.id } }, main, hint);
    row.main = main;
    return row;
  });

  const footer = h('div', { class: 'pk-footer bottom-bar' },
    primaryButton('Выбрать', { onClick: submit, cls: 'pk-submit' }),
    h('p', { class: 'pk-terms' }, 'Нажимая кнопку, вы соглашаетесь ', button({ class: 'pk-terms-link', onclick: () => toast('Условия программы — в разработке') }, 'с условиями')));

  const lockedNote = h('p', { class: 'pk-locked' }, `Категории на ${app.catalog.config.month.name} выбраны. Изменить их можно будет в следующем месяце`);

  el.append(
    h('div', { class: 'pk-inner' },
      h('h1', { class: 'pk-title' }, `Выберите ${cfg.limit} категории кэшбэка на ${app.catalog.config.month.name}`),
      h('ul', { class: 'pk-list', role: 'list' }, rows),
      locked ? lockedNote : null),
    locked ? null : footer);

  function sync({ animateFooter = false } = {}) {
    const full = chosen.size >= cfg.limit;
    for (const row of rows) {
      const on = chosen.has(row.dataset.cat);
      row.classList.toggle('is-on', on);
      row.classList.toggle('is-muted', (full || locked) && !on);
      row.main.setAttribute('aria-checked', String(on));
      row.main.disabled = locked || (full && !on);
    }
    if (locked) return;
    const wasShown = footer.classList.contains('is-shown');
    footer.classList.toggle('is-shown', full);
    footer.inert = !full;
    if (animateFooter && full && !wasShown) {
      animate(footer, [{ opacity: 0, transform: 'translateY(40px)' }, { opacity: 1, transform: 'none' }], { duration: 360, easing: EASE.out });
    }
  }

  function toggle(id) {
    if (locked || submitting) return;
    if (chosen.has(id)) chosen.delete(id);
    else if (chosen.size < cfg.limit) chosen.add(id);
    haptics.selection();
    sync({ animateFooter: true });
  }

  function submit() {
    if (chosen.size !== cfg.limit || submitting) return;
    submitting = true;
    haptics.light();
    openRating();
  }

  // Шторка оценки: звёзды серые, после выбора держится ещё секунду и закрывает весь модальный выбор.
  function openRating() {
    const scrim = h('div', { class: 'sheet-scrim' });
    const stars = [1, 2, 3, 4, 5].map((n) => {
      const s = button({ class: 'star', role: 'radio', 'aria-checked': 'false', 'aria-label': `${n} из 5` }, icon('star', { size: 36 }));
      s.addEventListener('click', () => rate(n));
      return s;
    });
    const sheet = h('div', { class: 'sheet', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Оценка категорий' },
      h('div', { class: 'sheet-grabber', 'aria-hidden': 'true' }),
      h('h2', { class: 'sheet-title' }, 'Как вам категории?'),
      h('div', { class: 'stars', role: 'radiogroup', 'aria-label': 'Оценка' }, stars));
    // шторка выше апп-бара, чтобы затемнение накрывало весь экран
    sheetHost = h('div', { class: 'sheet-host' }, scrim, sheet);
    document.getElementById('app').append(sheetHost);
    el.querySelector('.pk-inner').inert = true;
    footer.inert = true;
    animate(scrim, [{ opacity: 0 }, { opacity: 1 }], { duration: 300 });
    animate(sheet, [{ transform: 'translateY(100%)' }, { transform: 'none' }], { duration: 420, easing: EASE.ios }).then(() => stars[0].focus());

    let rated = false;
    async function rate(n) {
      if (rated) return;
      rated = true;
      stars.forEach((s, i) => {
        s.classList.toggle('is-on', i < n);
        s.setAttribute('aria-checked', String(i === n - 1));
        s.disabled = true;
      });
      haptics.success();
      stagger(stars.slice(0, n), [{ transform: 'scale(.6)' }, { transform: 'scale(1.18)' }, { transform: 'scale(1)' }], { duration: 360, step: 50, easing: EASE.spring });
      store.setPk({ categories: [...chosen], rating: n, month: app.catalog.config.month.name });
      await wait(1000);
      animate(scrim, [{ opacity: 1 }, { opacity: 0 }], { duration: 300 });
      animate(sheet, [{ transform: 'none' }, { transform: 'translateY(100%)' }], { duration: 360, easing: EASE.ios }).then(() => sheetHost?.remove());
      nav.back();
    }
  }

  let sheetHost = null;
  sync();
  return {
    appbar: { left: 'close' },
    swipeBack: false,
    destroy: () => sheetHost?.remove(),
  };
}
