// Переиспользуемые компоненты интерфейса. Состояние «в избранном» синхронизируется
// между всеми экранами через подписку на store (см. bindFavorites).

import { h, button, icon, iconImg, img, plural } from '../core/dom.js';
import { animate, EASE } from '../core/motion.js';
import { haptics } from '../core/haptics.js';
import { store } from '../core/store.js';
import { fmt } from '../domain/catalog.js';
import { app } from '../app.js';

// ---------- Избранное ----------

export function heartButton(brandId, { size = 28, cls = '', label } = {}) {
  const brand = app.catalog.getBrand(brandId);
  const outline = icon('heart-outline', { size, cls: 'heart-outline' });
  const filled = iconImg('heart-filled', { size, cls: 'heart-filled' });
  const el = button({
    class: `heart ${cls}`,
    'aria-label': label || `${brand?.name || ''}: в избранное`,
    'aria-pressed': String(store.isFav(brandId)),
    dataset: { favBrand: brandId },
  }, outline, filled);
  el.addEventListener('click', (e) => {
    e.stopPropagation();
    const liked = store.toggleFav(brandId);
    haptics.selection();
    animate(liked ? filled : outline, [{ transform: 'scale(.5) rotate(-18deg)' }, { transform: 'scale(1.22) rotate(8deg)' }, { transform: 'scale(1) rotate(0)' }], { duration: 420, easing: EASE.spring, fill: 'none' });
    if (liked) app.appbar.flashHeart();
  });
  return el;
}

export function bindFavorites() {
  store.subscribe((state, change) => {
    if (change.type !== 'fav' && change.type !== 'reset') return;
    for (const el of document.querySelectorAll('[data-fav-brand]')) {
      el.setAttribute('aria-pressed', String(state.favBrands.includes(el.dataset.favBrand)));
    }
  });
}

// ---------- Чипсы ----------

export function chip({ label, active = false, logo, size = 'm', onClick, role = 'tab' }) {
  const el = button({
    class: `chip chip-${size} ${active ? 'is-active' : ''} ${logo ? 'has-logo' : ''}`,
    role,
    'aria-selected': role === 'tab' ? String(active) : null,
    'aria-pressed': role === 'tab' ? null : String(active),
  },
  logo ? img(logo, { cls: 'chip-logo', alt: '', width: 24, height: 24, fallback: label }) : null,
  h('span', { class: 'chip-text' }, label));
  if (onClick) el.addEventListener('click', onClick);
  return el;
}

export function setChipActive(el, active) {
  el.classList.toggle('is-active', active);
  if (el.getAttribute('role') === 'tab') el.setAttribute('aria-selected', String(active));
  else el.setAttribute('aria-pressed', String(active));
}

// ---------- Строки списков ----------

function brandAvatar(src, name, size = 56) {
  return h('span', { class: 'avatar', style: { width: `${size}px`, height: `${size}px` } }, img(src, { alt: '', width: size, height: size, fallback: name }));
}

function subtitleNode(offer) {
  const s = fmt.rowSubtitle(offer);
  return h('span', { class: 'row-sub' }, s.hot ? h('span', { class: 'row-hot' }, s.hot) : null, h('span', { class: 'row-sub-text' }, s.text));
}

// Строчное состояние оффера: «28% • Самокат в Городе».
export function offerRow(offer, { onOpen } = {}) {
  const open = onOpen || (() => app.nav.push(`/offer/${offer.id}`));
  const main = button({ class: 'row-main', 'aria-label': `${offer.cashback}, ${offer.name}. Подробнее` },
    brandAvatar(offer.logo, offer.name),
    h('span', { class: 'row-text' },
      h('span', { class: 'row-title' }, h('span', { class: 'row-value' }, offer.cashback), h('span', { class: 'row-dot' }, ' • '), h('span', { class: 'row-name' }, offer.name)),
      subtitleNode(offer)));
  main.addEventListener('click', open);
  return h('div', { class: 'row', dataset: { offer: offer.id } }, main, heartButton(offer.brandId, { cls: 'row-heart', label: `${offer.name}: в избранное` }));
}

// Строка бренда (сценарий 02): лайк бренда целиком.
export function brandRow(brand, { onOpen } = {}) {
  const top = app.catalog.topOffer(brand.id);
  const open = onOpen || (() => top && app.nav.push(`/offer/${top.id}`));
  const main = button({ class: 'row-main', 'aria-label': `${brand.name}. ${app.catalog.brandSummary(brand.id)}`, disabled: top ? null : true },
    brandAvatar(brand.logo, brand.name),
    h('span', { class: 'row-text' },
      h('span', { class: 'row-title' }, h('span', { class: 'row-name' }, brand.name)),
      h('span', { class: 'row-sub' }, h('span', { class: 'row-sub-text' }, app.catalog.brandSummary(brand.id)))));
  main.addEventListener('click', open);
  return h('div', { class: 'row', dataset: { brand: brand.id } }, main, heartButton(brand.id, { cls: 'row-heart' }));
}

// Ячейка внутри карточки «Мое любимое».
export function cell(offer, { interactive = true, value } = {}) {
  const content = [
    h('span', { class: 'cell-text' },
      h('span', { class: 'cell-title' }, h('span', { class: 'cell-value' }, value || offer.cashback), h('span', { class: 'row-dot' }, ' • '), h('span', { class: 'cell-name' }, offer.name)),
      h('span', { class: 'cell-sub' }, `${fmt.kindLabel(offer)} ${fmt.lowerFirst(offer.condition)}`)),
    icon('chevron-right', { size: 16, cls: 'cell-chevron' }),
  ];
  if (!interactive) return h('div', { class: 'cell', dataset: { offer: offer.id } }, ...content);
  const el = button({ class: 'cell', dataset: { offer: offer.id }, 'aria-label': `${offer.cashback}, ${offer.name}` }, ...content);
  el.addEventListener('click', () => app.nav.push(`/offer/${offer.id}`));
  return el;
}

// ---------- Кнопки ----------

export function primaryButton(text, { onClick, cls = '', size = 'l' } = {}) {
  const el = button({ class: `btn btn-primary btn-${size} ${cls}` }, h('span', { class: 'btn-label' }, text));
  if (onClick) el.addEventListener('click', onClick);
  return el;
}

export function linkButton(text, { onClick, cls = '' } = {}) {
  const el = button({ class: `btn-link ${cls}` }, text);
  if (onClick) el.addEventListener('click', onClick);
  return el;
}

export function badge(n) {
  return h('span', { class: 'badge', 'aria-label': `${n} ${plural(n, 'новое', 'новых', 'новых')}` }, String(n));
}

// ---------- Плитка «В ноябре» (выбор повышенных категорий) ----------

export function cardMini({ flat = true, onOpen } = {}) {
  const el = button({ class: `card-mini ${flat ? 'is-flat' : 'is-raised'}` });
  const render = () => {
    const pk = store.state.pk;
    const cfg = app.catalog.config;
    el.replaceChildren(h('span', { class: 'card-mini-title' }, cfg.month.title));
    el.classList.toggle('is-chosen', !!pk);
    if (!pk) {
      el.setAttribute('aria-label', `${cfg.month.title}: выберите категории кэшбэка`);
      el.append(h('span', { class: 'card-mini-right' }, badge(1), h('span', { class: 'btn btn-primary btn-s', 'aria-hidden': 'true' }, 'Выбрать')));
    } else {
      const cats = pk.categories.map((id) => cfg.pk.categories.find((c) => c.id === id)).filter(Boolean);
      el.setAttribute('aria-label', `${cfg.month.title}: выбраны ${cats.map((c) => c.title).join(', ')}`);
      el.append(h('span', { class: 'icon-stack' }, cats.map((c) => iconImg(c.icon, { size: 32, cls: 'icon-stack-item' }))));
    }
  };
  render();
  const unsub = store.subscribe((_, change) => { if (change.type === 'pk' || change.type === 'reset') render(); });
  el.addEventListener('click', () => (onOpen ? onOpen() : app.nav.push('/pk')));
  el.destroy = unsub;
  return el;
}

// ---------- Карточка оффера (вертикальная) ----------

// locked: оффер откроется позже — карточка серая, вместо лайка замок, но открыть детали можно.
export function offerCard(offer, { size = 'm', onOpen, locked = false, lockLabel = '' } = {}) {
  const brand = app.catalog.getBrand(offer.brandId);
  const open = onOpen || (() => app.nav.push(`/offer/${offer.id}`));
  const tile = h('div', { class: 'ocard-tile' },
    img(offer.image, { cls: 'ocard-image', alt: '' }),
    h('div', { class: 'ocard-head' },
      h('div', { class: 'ocard-value' }, fmt.cardValue(offer)),
      h('div', { class: 'ocard-kind' }, fmt.kindLabel(offer)),
      h('div', { class: 'ocard-terms' }, h('span', null, offer.condition), h('span', { class: offer.isHot ? 'is-hot' : '' }, fmt.cardTerm(offer)))),
    h('span', { class: 'ocard-logo' }, img(offer.logo, { alt: '', width: 56, height: 56, fallback: offer.name })));
  const main = button({ class: 'ocard-main', 'aria-label': `${offer.cashback} ${fmt.kindLabel(offer).toLowerCase()}, ${offer.name}${locked ? `. ${lockLabel || 'Откроется позже'}` : ''}` },
    tile,
    h('div', { class: 'ocard-caption' }, h('div', { class: 'ocard-name' }, offer.name), h('div', { class: 'ocard-desc' }, offer.description)));
  main.addEventListener('click', open);
  const corner = locked
    ? h('span', { class: 'ocard-heart ocard-lock', 'aria-hidden': 'true' }, icon('lock', { size: 20 }))
    : heartButton(offer.brandId, { size: 24, cls: 'ocard-heart', label: `${brand?.name}: в избранное` });
  return h('div', { class: `ocard ocard-${size} ${locked ? 'is-locked' : ''}`, dataset: { offer: offer.id } }, main, corner);
}

// ---------- Карточка товара ----------

export function productCard(offer) {
  const main = button({ class: 'pcard-main', 'aria-label': `${offer.name}, кэшбэк ${offer.short}` },
    h('div', { class: 'pcard-tile' }, img(offer.image, { cls: 'pcard-image', alt: '' })),
    h('div', { class: 'pcard-caption' },
      h('div', { class: 'pcard-price' }, h('span', null, 'Кэшбэк'), h('span', { class: 'pcard-pill' }, icon('crown', { size: 16 }), offer.short)),
      h('div', { class: 'pcard-name' }, offer.name),
      h('div', { class: 'pcard-pay' }, iconImg('premium-yellow', { size: 16 }), 'Оплати картой Т-Банка')));
  main.addEventListener('click', () => app.nav.push(`/offer/${offer.id}`));
  return h('div', { class: 'pcard', dataset: { offer: offer.id } }, main, heartButton(offer.brandId, { size: 24, cls: 'pcard-heart' }));
}

// ---------- Заголовок секции в карточке ----------

export function cardHeader({ title, subtitle, link, onLink, aside }) {
  return h('div', { class: 'card-header' },
    h('div', { class: 'card-header-text' }, h('h2', { class: 'card-title' }, title), subtitle ? h('p', { class: 'card-subtitle' }, subtitle) : null),
    link ? linkButton(link, { onClick: onLink, cls: 'card-link' }) : null,
    aside || null);
}
