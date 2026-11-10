// Переиспользуемые компоненты интерфейса. Состояние «в избранном» синхронизируется
// между всеми экранами через подписку на store (см. bindFavorites).

import { h, button, icon, iconImg, img, plural } from '../core/dom.js';
import { animate, EASE } from '../core/motion.js';
import { haptics } from '../core/haptics.js';
import { store } from '../core/store.js';
import { fmt } from '../domain/catalog.js';
import { app } from '../app.js';
import { toast } from './toast.js';

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

// Строка бренда (сценарий 02): лайк бренда целиком. pitch — подзаголовок «до 53% · доставка и магазины»
// вместо «Два предложения на…» (плашку с процентом у логотипа убрали — она повторяла подзаголовок).
export function brandRow(brand, { onOpen, pitch = false } = {}) {
  const top = app.catalog.topOffer(brand.id);
  const open = onOpen || (() => top && app.nav.push(`/offer/${top.id}`));
  const sub = pitch ? app.catalog.brandPitch(brand.id) : app.catalog.brandSummary(brand.id);
  const main = button({ class: 'row-main', 'aria-label': `${brand.name}. ${sub}`, disabled: top ? null : true },
    brandAvatar(brand.logo, brand.name),
    h('span', { class: 'row-text' },
      h('span', { class: 'row-title' }, h('span', { class: 'row-name' }, brand.name)),
      h('span', { class: 'row-sub' }, h('span', { class: 'row-sub-text' }, sub))));
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

// Повышенный кэшбэк, новый вид (макет 693:151396, сценарии 01 и 02): две плитки рядом.
// Слева — текущий месяц: красный бейдж и «Выбрать», после выбора — стопка иконок категорий.
// Справа — прошлый месяц: категории уже выбраны, тап открывает их на экране выбора только для просмотра.
// Прежний вид — cardMini выше; какой вид в каком сценарии — PK_LOOK ниже.
export function pkTiles({ flat = true } = {}) {
  const cfg = app.catalog.config;
  const catsOf = (ids) => ids.map((id) => cfg.pk.categories.find((c) => c.id === id)).filter(Boolean);
  const stack = (cats) => h('span', { class: 'pk-tile-stack' }, cats.map((c) => iconImg(c.icon, { size: 40, cls: 'pk-tile-icon' })));
  const title = (text) => h('span', { class: 'pk-tile-title' }, text);

  const now = button({ class: 'pk-tile' });
  const render = () => {
    const pk = store.state.pk;
    const text = `Повышенный кэшбэк ${cfg.month.title.toLowerCase()}`;
    if (!pk) {
      now.setAttribute('aria-label', `${text}: выберите категории`);
      now.replaceChildren(h('span', { class: 'pk-tile-top' }, title(text), badge(1)),
        h('span', { class: 'btn btn-primary btn-s', 'aria-hidden': 'true' }, 'Выбрать'));
    } else {
      const cats = catsOf(pk.categories);
      now.setAttribute('aria-label', `${text}: ${cats.map((c) => c.title).join(', ')}`);
      now.replaceChildren(h('span', { class: 'pk-tile-top' }, title(text)), stack(cats));
    }
  };
  render();
  now.addEventListener('click', () => app.nav.push('/pk'));

  const prev = cfg.prevMonth;
  const before = prev ? button({ class: 'pk-tile', 'aria-label': `Повышенный кэшбэк ${prev.title}: посмотреть категории` },
    h('span', { class: 'pk-tile-top' }, title(`Повышенный кэшбэк ${prev.title}`)), stack(catsOf(prev.categories))) : null;
  before?.addEventListener('click', () => app.nav.push('/pk/prev'));

  const el = h('div', { class: `pk-tiles ${flat ? 'is-flat' : 'is-raised'}` }, now, before);
  const unsub = store.subscribe((_, change) => { if (change.type === 'pk' || change.type === 'reset') render(); });
  el.destroy = unsub;
  return el;
}

// Какой вид выбора повышенного кэшбэка в каком сценарии: 'tiles' — две плитки, 'mini' — прежняя плашка
const PK_LOOK = { s1: 'tiles', s2: 'tiles' };
// tilesFlat — плитки серые и плоские даже там, где прежняя плашка была белой с тенью (главная)
export function pkBlock(scenario, { flat = true, tilesFlat = flat } = {}) {
  return PK_LOOK[scenario] === 'tiles' ? pkTiles({ flat: tilesFlat }) : cardMini({ flat });
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

// item — товар из каталога (catalog.products) или оффер: у товара свой id, а детали открывает его offerId
export function productCard(item) {
  const offerId = item.offerId !== undefined ? item.offerId : item.id;
  const main = button({ class: 'pcard-main', 'aria-label': `${item.name}, кэшбэк ${item.short}` },
    h('div', { class: 'pcard-tile' }, img(item.image, { cls: 'pcard-image', alt: '' })),
    h('div', { class: 'pcard-caption' },
      h('div', { class: 'pcard-price' }, h('span', { class: 'ocard-kind' }, 'Кэшбэк'), h('span', { class: 'pcard-pill' }, icon('crown', { size: 16 }), item.short)),
      h('div', { class: 'pcard-name' }, item.name),
      h('div', { class: 'pcard-pay' }, iconImg('premium-yellow', { size: 16 }), 'Оплати картой Т-Банка')));
  main.addEventListener('click', () => {
    if (offerId) app.nav.push(`/offer/${offerId}`);
    else toast('Недоступно в прототипе');
  });
  return h('div', { class: 'pcard', dataset: { offer: item.id } }, main,
    item.brandId ? heartButton(item.brandId, { size: 24, cls: 'pcard-heart' }) : null);
}

// ---------- Карточка промокода (макет 662:145964) ----------
// Как карточка оффера, но плитка голубая: логотип сверху, крупная скидка, условия,
// перфорация и замаскированный код со стрелкой.

export function promoCard(promo) {
  const main = button({ class: 'promo-main', 'aria-label': `${promo.discountText}, ${promo.name}. Промокод ${promo.code}` },
    h('div', { class: 'promo-tile' },
      h('div', { class: 'promo-top' },
        h('span', { class: 'promo-logo' }, img(promo.logo, { alt: '', width: 56, height: 56, fallback: promo.name })),
        h('div', { class: 'promo-texts' },
          // длинная скидка («до 10 000 ₽») не влезает в 30px — для неё шрифт 20px
          h('div', { class: `ocard-value ${promo.discount.length > 7 ? 'is-long' : ''}` }, promo.discount),
          h('div', { class: 'promo-terms' }, promo.condition),
          // срок — только на широких экранах, где в плитке хватает места (см. .promo-date)
          promo.date ? h('div', { class: 'promo-date' }, promo.date) : null)),
      // перфорация и код прибиты к низу плитки — линия разрыва у всех карточек на одной высоте
      h('div', { class: 'promo-bottom' },
        h('img', { class: 'promo-perf', src: 'assets/img/promo-perforation.svg', alt: '', 'aria-hidden': 'true', draggable: 'false' }),
        h('div', { class: 'promo-code' }, h('span', { class: 'promo-code-text' }, promo.code), icon('chevron-right', { size: 16 })))),
    h('div', { class: 'ocard-caption' }, h('div', { class: 'ocard-name' }, promo.name), h('div', { class: 'ocard-desc' }, promo.description)));
  main.addEventListener('click', () => {
    if (promo.offerId) app.nav.push(`/offer/${promo.offerId}`);
    else toast('Промокод откроется в приложении');
  });
  const heart = promo.brandId
    ? heartButton(promo.brandId, { size: 24, cls: 'promo-heart' })
    : localHeart(`${promo.name}: в избранное`);
  return h('div', { class: 'promo', dataset: { promo: promo.id, cat: promo.categoryId } }, main, heart);
}

// ---------- Карточка товара (макет 710:155116) ----------
// Фото 3:4 на серой плитке (белый фон снимка сливается с ней), рейтинг, сердечко и точки галереи;
// ниже старая цена со скидкой, цена с кэшбэком, бренд, описание в две строки и магазин.
export function goodsCard(p) {
  const pic = h('div', { class: 'goods-pic' },
    img(p.image, { alt: '' }),
    p.rating ? h('span', { class: 'goods-rating' }, icon('star', { size: 10 }), p.rating) : null);
  const merchant = p.verified
    ? h('div', { class: 'goods-shop' }, h('span', { class: 'goods-verified' }, iconImg('premium-dark', { size: 10 })), 'Магазин проверен')
    : p.merchant ? h('div', { class: 'goods-shop' }, // логотип не загрузился (часть адресов cdn-tinkoff недоступна) — кружок с первой буквой
      p.merchantLogo ? h('span', { class: 'goods-shop-logo' }, img(p.merchantLogo, { alt: '', fallback: p.merchant })) : null, p.merchant) : null;
  const main = button({ class: 'goods-main', 'aria-label': `${p.brand}, ${p.description}. ${p.price}, кэшбэк ${p.cashback} ₽` },
    pic,
    h('div', { class: 'goods-dots', 'aria-hidden': 'true' }, h('span', { class: 'is-on' }), h('span'), h('span')),
    h('div', { class: 'goods-info' },
      p.oldPrice ? h('div', { class: 'goods-old' }, h('s', null, p.oldPrice), p.discount ? h('span', { class: 'goods-discount' }, p.discount) : null) : null,
      h('div', { class: 'goods-price' }, h('span', null, p.price),
        h('span', { class: 'gcard-badge' }, icon('crown', { size: 10 }), h('span', null, `${p.cashback}\u00A0₽`))),
      h('div', { class: 'goods-text' }, h('p', { class: 'goods-brand' }, p.brand), h('p', { class: 'goods-desc' }, p.description)),
      merchant));
  main.addEventListener('click', () => toast('Товар откроется в приложении'));
  return h('div', { class: 'goods', dataset: { goods: p.id } }, main, localHeart(`${p.brand}: в избранное`));
}

// Сердечко без бренда в каталоге: отметка живёт только на карточке
function localHeart(label) {
  const outline = icon('heart-outline', { size: 24, cls: 'heart-outline' });
  const filled = iconImg('heart-filled', { size: 24, cls: 'heart-filled' });
  const el = button({ class: 'heart promo-heart', 'aria-label': label, 'aria-pressed': 'false' }, outline, filled);
  el.addEventListener('click', (e) => {
    e.stopPropagation();
    const on = el.getAttribute('aria-pressed') !== 'true';
    el.setAttribute('aria-pressed', String(on));
    haptics.selection();
    animate(on ? filled : outline, [{ transform: 'scale(.5) rotate(-18deg)' }, { transform: 'scale(1.22) rotate(8deg)' }, { transform: 'scale(1) rotate(0)' }], { duration: 420, easing: EASE.spring, fill: 'none' });
  });
  return el;
}

// ---------- Заголовок секции в карточке ----------

export function cardHeader({ title, subtitle, link, onLink, aside }) {
  return h('div', { class: 'card-header' },
    h('div', { class: 'card-header-text' }, h('h2', { class: 'card-title' }, title), subtitle ? h('p', { class: 'card-subtitle' }, subtitle) : null),
    link ? linkButton(link, { onClick: onLink, cls: 'card-link' }) : null,
    aside || null);
}
