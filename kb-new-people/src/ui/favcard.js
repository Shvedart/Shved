// Блок «Мое любимое». Один компонент для главной (live) и для макета в шагах 3–5 онбординга (preview).
// variant: 'default' | 'boost' (+15% к первому офферу) | 'replace' (акция закончилась, показываем замену)

import { h, img, iconImg } from '../core/dom.js';
import { animate, EASE, settle } from '../core/motion.js';
import { haptics } from '../core/haptics.js';
import { store } from '../core/store.js';
import { fmt } from '../domain/catalog.js';
import { app } from '../app.js';
import { chip, cell, cardHeader, setChipActive, badge } from './components.js';

export function favCard({ mode = 'live', variant: initialVariant = 'default' } = {}) {
  let variant = initialVariant;
  const live = mode === 'live';
  const root = h('section', { class: `card favcard favcard-${mode} favcard-${variant}`, 'aria-label': 'Мое любимое' });
  let selected = null;
  let unsub = null;

  const brands = () => store.state.favBrands.map((id) => app.catalog.getBrand(id)).filter(Boolean);

  function render() {
    const list = brands();
    if (!list.some((b) => b.id === selected)) selected = list[0]?.id || null;

    // пока ничего не лайкнули (сценарий 03), подсказка стоит на месте подзаголовка
    root.replaceChildren(cardHeader({
      title: 'Мое любимое',
      subtitle: list.length ? 'Предложения выбранных брендов' : ['Отмечайте бренды сердечком —', h('br'), 'их предложения появятся здесь'],
      link: 'Все',
      onLink: live ? () => app.nav.push('/favorites') : null,
    }));
    const link = root.querySelector('.card-link');
    if (!live && link) { link.disabled = true; link.tabIndex = -1; }

    if (!list.length) {
      root.classList.add('is-empty');
      return;
    }
    root.classList.remove('is-empty');

    const chips = h('div', { class: 'chips-line', role: 'tablist', 'aria-label': 'Любимые бренды' },
      list.map((b) => {
        const c = chip({
          label: b.name,
          logo: b.logo,
          size: 's',
          active: b.id === selected,
          onClick: live ? () => select(b.id) : null,
        });
        c.dataset.brand = b.id;
        if (!live) { c.tabIndex = -1; c.disabled = true; }
        return c;
      }));
    root.append(h('div', { class: 'chips-scroll' }, chips));
    root.append(h('div', { class: 'favcard-list' }, renderList()));
    syncBadge();
  }

  // На шаге «замена акции» у выбранного бренда появляется бейдж — там изменения.
  function syncBadge() {
    root.querySelectorAll('.chip-badge').forEach((b) => b.remove());
    if (variant !== 'replace') return;
    const active = root.querySelector('.chip.is-active');
    if (!active) return;
    const b = badge(1);
    b.classList.add('chip-badge');
    active.append(b);
    return b;
  }

  function renderList() {
    const offers = app.catalog.offersOfBrand(selected);
    if (variant === 'replace') {
      const brand = app.catalog.getBrand(selected);
      const similar = app.catalog.similarOffers(selected, 2);
      return [
        h('div', { class: 'favcard-info' }, iconImg('info-circle', { size: 24 }), h('span', null, `${fmt.brandPrep(brand)} акции закончились. Подобрали похожие предложения`)),
        ...similar.map((o) => h('div', { class: 'mini-row' },
          h('span', { class: 'avatar', style: { width: '48px', height: '48px' } }, img(o.logo, { alt: '', width: 48, height: 48, fallback: o.name })),
          h('span', { class: 'mini-row-text' },
            h('span', { class: 'mini-row-title' }, h('b', null, o.cashback), ' • ', o.name),
            h('span', { class: 'mini-row-sub' }, o.condition)))),
      ];
    }
    const shown = live ? offers : offers.slice(0, 2);
    return shown.map((o, i) => {
      if (variant === 'boost' && i === 0 && o.type !== 'points') {
        const boosted = `${o.cashback.replace(/\d+/, (n) => String(Number(n) + 15))}`;
        const c = cell(o, { interactive: false });
        c.classList.add('is-boosted');
        c.querySelector('.cell-value').replaceWith(h('span', { class: 'cell-value boost' },
          h('span', { class: 'boost-old' }, o.cashback), h('span', { class: 'boost-arrow' }, ' → '),
          h('span', { class: 'boost-new', dataset: { from: String(o.value), to: String(o.value + 15) } }, boosted)));
        return c;
      }
      const c = cell(o, { interactive: live });
      if (variant === 'boost') c.classList.add('is-dim');
      return c;
    });
  }

  function select(id) {
    if (id === selected) return;
    selected = id;
    haptics.selection();
    for (const c of root.querySelectorAll('.chip')) setChipActive(c, c.dataset.brand === id);
    const listEl = root.querySelector('.favcard-list');
    listEl.replaceChildren(...renderList());
    animate(listEl, [{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 240, easing: EASE.out });
  }

  // Смена состояния без пересоздания карточки: чипсы и логотипы остаются, меняется только список.
  async function setVariant(next) {
    if (next === variant) return;
    const listEl = root.querySelector('.favcard-list');
    const h0 = listEl.offsetHeight;
    await animate(listEl, [{ opacity: 1 }, { opacity: 0 }], { duration: 140, easing: EASE.in });
    root.classList.replace(`favcard-${variant}`, `favcard-${next}`);
    variant = next;
    listEl.replaceChildren(...renderList());
    const newBadge = syncBadge();
    const h1 = listEl.offsetHeight;
    animate(listEl, [{ height: `${h0}px` }, { height: `${h1}px` }], { duration: 420, easing: EASE.ios, fill: 'none' });
    if (next === 'replace') {
      // строки замены появляются по очереди — одной анимацией, без повторного проявления
      const items = [...listEl.children];
      items.forEach((x) => { x.style.opacity = '0'; });
      settle(listEl);
      listEl.style.opacity = '1';
      await Promise.all(items.map((x, i) => animate(x, [{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'none' }], { duration: 360, delay: 60 + i * 90, easing: EASE.out }).then(() => { x.style.opacity = ''; })));
      listEl.style.opacity = '';
    } else {
      await animate(listEl, [{ opacity: 0 }, { opacity: 1 }], { duration: 260, delay: 80, easing: EASE.out });
    }
    if (newBadge) animate(newBadge, [{ transform: 'scale(0)' }, { transform: 'scale(1.3)' }, { transform: 'scale(1)' }], { duration: 420, easing: EASE.spring, fill: 'none' });
    if (next === 'boost') playBoost();
  }

  // Рост кэшбэка: подсветка строки, старое значение зачёркивается, новое «досчитывает» на +15%.
  function playBoost() {
    const row = root.querySelector('.cell.is-boosted');
    const num = row?.querySelector('.boost-new');
    if (!row || !num) return;
    const from = Number(num.dataset.from);
    const to = Number(num.dataset.to);
    const tpl = num.textContent;
    row.classList.add('is-glow');
    animate(row.querySelector('.boost-old'), [{ opacity: 1 }, { opacity: 0.45 }], { duration: 300, delay: 150 });
    animate(row.querySelector('.boost-arrow'), [{ opacity: 0, transform: 'translateX(-6px)' }, { opacity: 1, transform: 'none' }], { duration: 300, delay: 200 });
    const t0 = performance.now() + 250;
    const dur = 800;
    const tick = (t) => {
      const p = Math.min(1, Math.max(0, (t - t0) / dur));
      const eased = 1 - (1 - p) ** 3;
      num.textContent = tpl.replace(/\d+/, String(Math.round(from + (to - from) * eased)));
      if (p < 1) requestAnimationFrame(tick);
      else animate(num, [{ transform: 'scale(1)' }, { transform: 'scale(1.18)' }, { transform: 'scale(1)' }], { duration: 380, easing: EASE.spring, fill: 'none' });
    };
    requestAnimationFrame(tick);
  }

  render();
  if (live) {
    unsub = store.subscribe((_, change) => {
      if (change.type === 'fav' || change.type === 'reset') render();
    });
  }

  root.destroy = () => unsub?.();
  root.rerender = render;
  root.setVariant = setVariant;
  root.playBoost = playBoost;
  return root;
}
