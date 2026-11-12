// Детали оффера (фрейм 635:131030). Контент — из JSON; блоки «Как получить» и «Что ещё нужно знать» — общая рыба.

import { h, icon, img } from '../core/dom.js';
import { haptics } from '../core/haptics.js';
import { store } from '../core/store.js';
import { animate, EASE } from '../core/motion.js';
import { fmt } from '../domain/catalog.js';
import { toast } from '../ui/toast.js';
import { primaryButton } from '../ui/components.js';
import { app } from '../app.js';

export function offerScreen({ el, params, entry }) {
  const offer = app.catalog.getOffer(params.id);
  el.classList.add('offer');

  if (!offer) {
    el.append(h('div', { class: 'empty-state' },
      h('h1', { class: 'empty-title' }, 'Предложение не найдено'),
      h('p', { class: 'empty-text' }, 'Возможно, акция уже закончилась'),
      primaryButton('Назад', { onClick: () => app.nav.back() })));
    return { appbar: { left: 'back' } };
  }

  const brand = app.catalog.getBrand(offer.brandId);
  const kind = fmt.kindLabel(offer);
  const hero = h('div', { class: 'offer-hero', style: { backgroundColor: offer.bgColor, color: offer.textColor } },
    img(offer.background || offer.image, { cls: `offer-hero-img ${offer.background ? '' : 'is-compact'}`, alt: '', lazy: false }),
    h('div', { class: 'offer-hero-shade', style: { background: `linear-gradient(100deg, ${offer.bgColor}cc 0%, ${offer.bgColor}66 45%, transparent 75%)` } }),
    h('div', { class: 'offer-hero-text' },
      h('h1', { class: 'offer-title' }, offer.name, h('br'), offer.cashbackText),
      h('p', { class: 'offer-meta' }, offer.condition),
      h('p', { class: 'offer-meta' }, offer.daysLeft != null ? `Осталось ${fmt.daysLabel(offer.daysLeft)}` : offer.date)));

  const steps = [
    ['cart', offer.description, 'Акция действует на покупки в точках, отмеченных на карте'],
    ['card', 'Оплатите покупку любой картой Т-Банка', 'Нельзя оплатить по QR-коду и через СБП'],
    ['crown', offer.type === 'points' ? `Получите ${offer.cashback}` : `Получите ${kind.toLowerCase()} ${offer.short}`, `${kind} придёт в дату следующей выписки`],
  ];

  el.append(
    hero,
    h('div', { class: 'offer-body' },
      h('section', { class: 'card offer-card' },
        h('h2', { class: 'offer-card-title' }, `Как получить ${kind.toLowerCase()}`),
        h('ol', { class: 'offer-steps' }, steps.map(([ic, title, sub]) =>
          h('li', { class: 'offer-step' },
            h('span', { class: 'offer-step-icon' }, ic === 'cart' ? icon('stap', { size: 22 }) : ic === 'card' ? icon('card', { size: 22 }) : icon('crown', { size: 22 })),
            h('span', { class: 'offer-step-text' }, h('span', { class: 'offer-step-title' }, title), h('span', { class: 'offer-step-sub' }, sub))))),
        h('div', { class: 'offer-note' }, 'Акция не распространяется на покупки через сторонние сервисы доставки')),
      h('section', { class: 'card offer-card' },
        h('h2', { class: 'offer-card-title' }, 'Что ещё нужно знать'),
        h('p', { class: 'offer-par' }, 'Спецпредложение действует на покупки только в точках, отмеченных на карте'),
        h('p', { class: 'offer-par' }, `Не суммируется с другими акциями партнёра в разделе «Кэшбэки и бонусы»`),
        h('p', { class: 'offer-par' }, 'Акция суммируется с программой лояльности партнёра. Для получения дополнительных бонусов отсканируйте карту лояльности'))),
    h('div', { class: 'bottom-bar offer-cta' }, primaryButton('К покупкам', { onClick: () => toast(`Переход к партнёру «${brand?.name}» имитируется`) })));

  // Сердце в апп-баре — механизм добавления в избранное, а не вход в раздел.
  const heartState = () => ({
    heartActive: store.isFav(offer.brandId),
    heartLabel: `${brand?.name}: ${store.isFav(offer.brandId) ? 'убрать из избранного' : 'в избранное'}`,
  });
  const unsub = store.subscribe((_, change) => {
    if (change.type === 'fav' || change.type === 'reset') app.appbar.patch(entry, heartState());
  });

  // Над картинкой апп-бар прозрачный, после неё — сплошной с названием.
  el.addEventListener('scroll', () => {
    const solid = el.scrollTop > hero.offsetHeight - 160;
    if (entry.appbarState && entry.appbarState.transparent === solid) {
      app.appbar.patch(entry, { transparent: !solid, titleVisible: solid });
    }
  }, { passive: true });

  return {
    appbar: {
      left: 'back',
      transparent: true,
      title: offer.name,
      titleVisible: false,
      heart: true,
      ...heartState(),
      onHeart() {
        const liked = store.toggleFav(offer.brandId);
        haptics.selection();
        const target = app.appbar.heartEl.querySelector(liked ? '.heart-filled' : '.heart-outline');
        animate(target, [{ transform: 'scale(.5)' }, { transform: 'scale(1.2)' }, { transform: 'scale(1)' }], { duration: 400, easing: EASE.spring });
        toast(liked ? `${brand?.name} — в избранном` : `${brand?.name} убран из избранного`, { duration: 1600 });
      },
    },
    destroy: unsub,
  };
}
