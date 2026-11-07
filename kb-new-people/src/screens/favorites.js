// Избранное (фрейм 635:131163). Чипсы — категории; в каждой сначала лайкнутые офферы, ниже рекомендации.
// Порядок фиксируется при входе: лайк в рекомендациях не перемещает строку, пока не выйти и не зайти снова.

import { h } from '../core/dom.js';
import { animate, EASE, stagger, fadeUpIn } from '../core/motion.js';
import { haptics } from '../core/haptics.js';
import { store } from '../core/store.js';
import { chip, offerRow, setChipActive } from '../ui/components.js';
import { app } from '../app.js';

export function favoritesScreen({ el }) {
  el.classList.add('favorites');
  const snapshot = new Set(store.state.favBrands);
  const { catalog } = app;

  // Категории, где есть лайкнутые бренды, идут первыми.
  const cats = catalog.categories
    .filter((c) => c.offerIds.length)
    .map((c, i) => ({ c, i, liked: catalog.offersInCategory(c.id).some((o) => snapshot.has(o.brandId)) }))
    .sort((a, b) => (b.liked - a.liked) || (a.i - b.i))
    .map((x) => x.c);

  let current = cats[0]?.id;
  const chipsEl = h('div', { class: 'chips-line', role: 'tablist', 'aria-label': 'Категории' },
    cats.map((c) => {
      const ch = chip({ label: c.title, active: c.id === current, onClick: () => select(c.id) });
      ch.dataset.cat = c.id;
      return ch;
    }));
  const listEl = h('div', { class: 'fav-list', role: 'tabpanel' });

  el.append(h('div', { class: 'fav-chips chips-scroll' }, chipsEl), listEl);

  function renderList() {
    const offers = catalog.offersInCategory(current);
    const liked = offers.filter((o) => snapshot.has(o.brandId));
    const rest = offers.filter((o) => !snapshot.has(o.brandId));
    const nodes = [];
    if (liked.length) nodes.push(h('div', { class: 'fav-group' }, liked.map((o) => offerRow(o))));
    else nodes.push(h('p', { class: 'fav-empty' }, 'В этой категории вы ещё ничего не сохранили'));
    if (rest.length) {
      nodes.push(h('h2', { class: 'fav-heading' }, 'Рекомендуем вам'));
      nodes.push(h('div', { class: 'fav-group' }, rest.map((o) => offerRow(o))));
    }
    listEl.replaceChildren(...nodes);
  }

  function select(id) {
    if (id === current) return;
    current = id;
    haptics.selection();
    for (const c of chipsEl.children) setChipActive(c, c.dataset.cat === id);
    chipsEl.querySelector('.is-active')?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
    renderList();
    stagger(listEl.querySelectorAll('.row'), fadeUpIn, { duration: 300, step: 25, easing: EASE.out });
    el.scrollTo({ top: 0 });
  }

  renderList();
  animate(listEl, [{ opacity: 0 }, { opacity: 1 }], { duration: 200 });

  return { appbar: { left: 'back', title: 'Избранное' } };
}
