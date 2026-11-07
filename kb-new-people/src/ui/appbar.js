// Постоянный апп-бар: стоит на месте, меняется только набор элементов.
// Конфиг: { left: 'back' | 'close' | null, title, titleVisible, progress (0..1 | null),
//           search, heart, heartVisible, transparent, onLeft, onHeart }

import { h, button, icon, iconUrl } from '../core/dom.js';
import { animate, EASE } from '../core/motion.js';
import { toast } from './toast.js';

export function createAppbar({ getNav }) {
  let current = null; // запись стека, чей конфиг показан
  let flashTimer = 0;

  const leftIcon = icon('chevron-left');
  const left = button({ class: 'appbar-btn glass', 'aria-label': 'Назад' }, leftIcon);
  const title = h('div', { class: 'appbar-title', 'aria-live': 'polite' });
  const progressFill = h('div', { class: 'progress-fill' });
  const progress = h('div', { class: 'progress', role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': '5' }, progressFill);
  const center = h('div', { class: 'appbar-center' }, title, progress);
  const search = button({ class: 'appbar-btn glass', 'aria-label': 'Поиск выгоды' }, icon('search'));
  const heartOutline = icon('heart-outline', { cls: 'heart-outline' });
  const heartFilled = h('img', { class: 'ico-img heart-filled', src: 'assets/icons/heart-filled.svg', alt: '', 'aria-hidden': 'true' });
  const heart = button({ class: 'appbar-btn glass heart-btn', 'aria-label': 'Избранное' }, heartOutline, heartFilled);
  const right = h('div', { class: 'appbar-right' }, search, heart);
  const bar = h('header', { class: 'appbar' }, h('div', { class: 'appbar-controls' }, h('div', { class: 'appbar-left' }, left), center, right));

  left.addEventListener('click', () => {
    const cfg = current?.appbarState;
    if (!cfg) return;
    if (cfg.onLeft) cfg.onLeft();
    else getNav().back();
  });
  search.addEventListener('click', () => toast('Поиск недоступен в прототипе'));
  heart.addEventListener('click', () => {
    const cfg = current?.appbarState;
    if (cfg?.onHeart) cfg.onHeart();
    else getNav().push('/favorites');
  });

  function render(cfg, { animateChange = false } = {}) {
    bar.hidden = cfg === false;
    if (cfg === false) return;
    bar.classList.toggle('is-transparent', !!cfg.transparent);
    bar.classList.toggle('is-solid', !cfg.transparent);

    // Стрелка назад превращается в крестик в модальных экранах
    const kind = cfg.left || null;
    left.hidden = !kind;
    if (kind && left.dataset.kind !== kind) {
      const was = left.dataset.kind;
      left.dataset.kind = kind;
      leftIcon.style.setProperty('--src', iconUrl(kind === 'close' ? 'close' : 'chevron-left'));
      left.setAttribute('aria-label', kind === 'close' ? 'Закрыть' : 'Назад');
      if (was && animateChange) animate(leftIcon, [{ opacity: 0, transform: 'rotate(-90deg) scale(.6)' }, { opacity: 1, transform: 'none' }], { duration: 260, easing: EASE.out });
    }

    const hasProgress = typeof cfg.progress === 'number';
    progress.hidden = !hasProgress;
    if (hasProgress) {
      progressFill.style.width = `${Math.max(0.06, cfg.progress) * 100}%`;
      progress.setAttribute('aria-valuenow', String(Math.round(cfg.progress * 5)));
      progress.setAttribute('aria-label', `Шаг ${Math.round(cfg.progress * 5)} из 5`);
    }
    title.textContent = cfg.title || '';
    title.classList.toggle('is-visible', !!cfg.title && cfg.titleVisible !== false && !hasProgress);

    search.hidden = !cfg.search;
    heart.hidden = !cfg.heart;
    heart.classList.toggle('is-off', cfg.heart && cfg.heartVisible === false);
    heart.tabIndex = cfg.heart && cfg.heartVisible === false ? -1 : 0;
    heart.classList.toggle('is-active', !!cfg.heartActive);
    heart.setAttribute('aria-label', cfg.heartLabel || 'Избранное');
    if (cfg.heartLabel) heart.setAttribute('aria-pressed', cfg.heartActive ? 'true' : 'false');
    else heart.removeAttribute('aria-pressed');
  }

  return {
    el: bar,
    setFor(entry) {
      current = entry;
      if (!entry.appbarState) {
        entry.appbarState = entry.screen.appbar === false ? false : { ...(entry.screen.appbar || {}), ...(entry.pendingAppbar || {}) };
      }
      render(entry.appbarState, { animateChange: true });
    },
    // Экран обновляет свой апп-бар (например, при скролле).
    patch(entry, partial) {
      if (!entry.screen) {
        // экран ещё создаётся — применим при активации
        entry.pendingAppbar = { ...(entry.pendingAppbar || {}), ...partial };
        return;
      }
      if (!entry.appbarState) entry.appbarState = { ...(entry.screen.appbar || {}) };
      if (entry.appbarState === false) return;
      Object.assign(entry.appbarState, partial);
      if (entry === current) render(entry.appbarState, { animateChange: true });
    },
    transition(kind) {
      if (kind === 'none') return;
      animate(center, [{ opacity: 0 }, { opacity: 1 }], { duration: 240, easing: EASE.out });
    },
    // Сердце в апп-баре на секунду загорается красным при каждом лайке.
    flashHeart() {
      clearTimeout(flashTimer);
      heart.classList.add('is-flash');
      animate(heartFilled, [{ transform: 'scale(.6)' }, { transform: 'scale(1.25)' }, { transform: 'scale(1)' }], { duration: 420, easing: EASE.spring });
      flashTimer = setTimeout(() => heart.classList.remove('is-flash'), 1000);
    },
    get heartEl() {
      return heart;
    },
  };
}
