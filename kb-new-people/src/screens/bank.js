// Страница банка (фрейм 635:131062). Активна только плитка «Кэшбэки и бонусы» — вход в сценарий.

import { h, button, icon, iconImg, img } from '../core/dom.js';
import { store } from '../core/store.js';
import { toast } from '../ui/toast.js';
import { badge } from '../ui/components.js';
import { app } from '../app.js';

const unavailable = () => toast('Недоступно в прототипе');

export function bankScreen({ el, params, nav }) {
  el.classList.add('bank');
  const scenario = params.s;
  const logos = ['magnit', 'samokat', 'lavka'].map((id) => app.catalog.getBrand(id)?.logo).filter(Boolean);

  const tap = (cls, children, onClick = unavailable, label) => {
    const b = button({ class: cls, 'aria-label': label || null }, ...children);
    b.addEventListener('click', onClick);
    return b;
  };

  const enter = () => {
    if (['s3', 's4', 's5'].includes(scenario)) nav.push(`/main/${scenario}`);
    else if (store.state.onboarding[scenario]?.done) nav.push(`/main/${scenario}`);
    else nav.push(`/onb/${scenario}/1`);
  };

  el.append(
    h('div', { class: 'bank-top' },
      tap('bank-notify', [icon('bell', { size: 20 }), 'Все уведомления'])),
    h('div', { class: 'bank-sheet' },
      h('div', { class: 'bank-head' },
        tap('bank-avatar', [h('span', { class: 'bank-avatar-img' }, 'А')], unavailable, 'Профиль'),
        tap('bank-search', [icon('search', { size: 22 }), h('span', null, 'Поиск выгоды')]),
        tap('bank-gift', [icon('gift', { size: 22 })], unavailable, 'Подарки')),
      h('div', { class: 'bank-dots', 'aria-hidden': 'true' }, h('span', { class: 'is-active' }), h('span'), h('span')),
      h('div', { class: 'bank-balance' },
        h('span', { class: 'bank-crown' }, icon('crown', { size: 14 }), '2 450 ₽'),
        h('div', { class: 'bank-amount' }, '12 424 ₽')),
      h('div', { class: 'bank-card' }, h('span', { class: 'bank-card-inner' }, img('assets/img/bank-card.png', { alt: 'Карта Black', width: 210, height: 133, lazy: false }), h('span', { class: 'bank-card-badge', 'aria-hidden': 'true' }, 'Black'))),
      h('div', { class: 'bank-panel' },
        h('div', { class: 'bank-actions' },
          [['add', 'Пополнить'], ['scan', 'Скан'], ['arrow-right', 'Перевести'], ['premium-yellow', 'Прем']].map(([ic, label]) =>
            tap('bank-action', [h('span', { class: 'bank-action-icon' }, ic === 'premium-yellow' ? iconImg(ic, { size: 28 }) : icon(ic, { size: 28 })), h('span', { class: 'bank-action-label' }, label)]))),
        tap('bank-tile', [h('div', { class: 'bank-tile-text' }, h('div', { class: 'bank-tile-title' }, 'Операции'), h('div', { class: 'bank-tile-sub' }, 'Траты в октябре 43 746 ₽')), h('div', { class: 'bank-bars', 'aria-hidden': 'true' }, h('span'), h('span'), h('span'))]),
        tap('bank-tile bank-tile-cashback', [
          h('div', { class: 'bank-tile-title' }, 'Кэшбэки', h('br'), 'и бонусы'),
          h('div', { class: 'bank-tile-logos' }, badge(1), logos.map((src) => h('span', { class: 'bank-logo' }, img(src, { alt: '', width: 32, height: 32 }))))],
        enter, 'Кэшбэки и бонусы'),
        tap('bank-tile', [h('span', { class: 'bank-round' }, icon('cards', { size: 24 })), h('div', { class: 'bank-tile-text' }, h('div', { class: 'bank-tile-title' }, '120 000 ₽'), h('div', { class: 'bank-tile-sub' }, 'Накопления'))]),
        tap('bank-tile', [h('span', { class: 'bank-round' }, icon('card', { size: 24 })), h('div', { class: 'bank-tile-text' }, h('div', { class: 'bank-tile-title' }, 'Кредиты'), h('div', { class: 'bank-tile-sub' }, 'Деньги от банка и рейтинг'))]))));

  return { appbar: { left: 'back', transparent: true } };
}
