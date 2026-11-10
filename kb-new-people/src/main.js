// Точка входа: загрузка данных, маршруты, глобальные обработчики.

import { h } from './core/dom.js';
import { createRouter } from './core/router.js';
import { createAppbar } from './ui/appbar.js';
import { bindFavorites, primaryButton } from './ui/components.js';
import { createLocalSource, loadCatalog } from './data/repository.js';
import { app } from './app.js';
import { hubScreen } from './screens/hub.js';
import { bankScreen } from './screens/bank.js';
import { onboardingScreen } from './screens/onboarding.js';
import { mainScreen } from './screens/main.js';
import { pkScreen } from './screens/pk.js';
import { offerScreen } from './screens/offer.js';
import { favoritesScreen } from './screens/favorites.js';
import { brandsScreen } from './screens/brands.js';

const routes = [
  { pattern: /^\/$/, create: hubScreen },
  { pattern: /^\/bank\/(?<s>s[1-6])$/, create: bankScreen, parent: '/' },
  { pattern: /^\/onb\/(?<s>s[12])\/(?<step>[1-5])$/, create: onboardingScreen, parent: (p) => `/bank/${p.s}` },
  { pattern: /^\/main\/(?<s>s[1-6])$/, create: mainScreen, parent: '/' },
  { pattern: /^\/pk(?:\/(?<month>prev))?$/, create: pkScreen, modal: true, parent: '/' },
  { pattern: /^\/offer\/(?<id>[\w-]+)$/, create: offerScreen, parent: '/' },
  { pattern: /^\/favorites$/, create: favoritesScreen, parent: '/' },
  { pattern: /^\/brands$/, create: brandsScreen, parent: '/' },
];

const params = new URLSearchParams(location.search);

installPressFeedback();

async function boot() {
  const root = document.getElementById('app');
  const stage = h('div', { class: 'stage' });
  const appbar = createAppbar({ getNav: () => app.nav });
  root.replaceChildren(stage, appbar.el);
  stage.append(h('div', { class: 'boot-loader', role: 'status' }, h('span', { class: 'spinner' }), h('span', { class: 'visually-hidden' }, 'Загрузка')));

  try {
    app.catalog = await loadCatalog(createLocalSource());
  } catch (err) {
    console.error(err);
    stage.replaceChildren(h('div', { class: 'empty-state' },
      h('h1', { class: 'empty-title' }, 'Не удалось загрузить предложения'),
      h('p', { class: 'empty-text' }, 'Проверьте подключение и попробуйте ещё раз'),
      primaryButton('Повторить', { onClick: () => boot() })));
    return;
  }

  stage.replaceChildren();
  app.appbar = appbar;
  app.nav = createRouter({ stage, routes, appbar });
  bindFavorites();
  app.nav.start();
}

// Сжатие до 0.95 при касании — сразу на pointerdown, без задержки :active на iOS.
function installPressFeedback() {
  let pressed = null;
  const release = () => {
    pressed?.classList.remove('is-pressed');
    pressed = null;
  };
  document.addEventListener('pointerdown', (e) => {
    const t = e.target.closest('.tap');
    if (!t || t.disabled || t.getAttribute('aria-disabled') === 'true') return;
    pressed = t;
    t.classList.add('is-pressed');
  }, { passive: true });
  document.addEventListener('pointerup', release, { passive: true });
  document.addEventListener('pointercancel', release, { passive: true });
  document.addEventListener('scroll', release, { passive: true, capture: true });
  document.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.classList?.contains('tap')) {
      e.target.classList.add('is-pressed');
      setTimeout(() => e.target.classList.remove('is-pressed'), 140);
    }
  });
}

if ('serviceWorker' in navigator && location.protocol !== 'file:' && !params.has('nosw')) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}

boot();
