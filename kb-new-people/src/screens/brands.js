// Бренды: куда ведёт «+» в новом «Мое любимое» (сценарий 04). Похоже на избранное, но строка — бренд,
// а в ней самое жирное предложение бренда. Сердечко добавляет бренд в «Мое любимое»; сверху — поиск.

import { h, icon } from '../core/dom.js';
import { EASE, stagger, fadeUpIn } from '../core/motion.js';
import { haptics } from '../core/haptics.js';
import { chip, offerRow, setChipActive } from '../ui/components.js';
import { app } from '../app.js';

const norm = (t) => t.toLowerCase().replace(/ё/g, 'е').trim();

export function brandsScreen({ el }) {
  el.classList.add('brands');
  const { catalog } = app;

  // каждому бренду — его лучший оффер; бренды без офферов пропускаем
  const tops = [];
  const seen = new Set();
  for (const cat of catalog.categories) {
    for (const o of catalog.offersInCategory(cat.id)) {
      if (!o || seen.has(o.brandId)) continue;
      const top = catalog.topOffer(o.brandId);
      if (!top) continue;
      seen.add(o.brandId);
      tops.push({ offer: top, brand: catalog.getBrand(o.brandId), cat: cat.id });
    }
  }
  // самые жирные — выше
  tops.sort((a, b) => b.offer.value - a.offer.value);

  const cats = [{ id: 'all', title: 'Все' }, ...catalog.categories.filter((c) => tops.some((t) => t.cat === c.id))];
  let current = 'all';
  let query = '';

  const input = h('input', {
    class: 'brands-search-input',
    type: 'search',
    placeholder: 'Найти бренд',
    'aria-label': 'Найти бренд',
    autocomplete: 'off',
    enterkeyhint: 'search',
  });
  const clear = h('button', { class: 'brands-search-clear', type: 'button', 'aria-label': 'Очистить', hidden: true }, icon('close', { size: 16 }));
  const search = h('label', { class: 'brands-search' }, icon('search', { size: 20, cls: 'brands-search-icon' }), input, clear);

  const chipsEl = h('div', { class: 'chips-line', role: 'tablist', 'aria-label': 'Категории' },
    cats.map((c) => {
      const ch = chip({ label: c.title, active: c.id === current, onClick: () => select(c.id) });
      ch.dataset.cat = c.id;
      return ch;
    }));
  const listEl = h('div', { class: 'fav-list', role: 'tabpanel' });

  el.append(h('div', { class: 'brands-head' }, search, h('div', { class: 'chips-scroll' }, chipsEl)), listEl);

  function renderList() {
    const q = norm(query);
    // поиск идёт по всем категориям — иначе бренд из другой категории «не находится»
    const items = tops.filter((t) => (q ? norm(t.brand.name).includes(q) || norm(t.offer.name).includes(q) : current === 'all' || t.cat === current));
    listEl.replaceChildren(items.length
      ? h('div', { class: 'fav-group' }, items.map((t) => offerRow(t.offer)))
      : h('p', { class: 'fav-empty' }, q ? `По запросу «${query.trim()}» ничего не нашли` : 'Здесь пока нет брендов'));
  }

  function select(id) {
    if (id === current && !query) return;
    current = id;
    haptics.selection();
    for (const c of chipsEl.children) setChipActive(c, c.dataset.cat === id);
    chipsEl.querySelector('.is-active')?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
    if (query) { query = ''; input.value = ''; clear.hidden = true; el.classList.remove('is-searching'); }
    renderList();
    stagger(listEl.querySelectorAll('.row'), fadeUpIn, { duration: 300, step: 25, easing: EASE.out });
    el.scrollTo({ top: 0 });
  }

  input.addEventListener('input', () => {
    query = input.value;
    clear.hidden = !query;
    // пока идёт поиск, чипсы категорий не действуют — прячем их
    el.classList.toggle('is-searching', Boolean(query.trim()));
    renderList();
  });
  clear.addEventListener('click', (e) => {
    e.preventDefault();
    input.value = '';
    input.dispatchEvent(new Event('input'));
    input.focus();
  });

  renderList();
  return { appbar: { left: 'back', title: 'Бренды' } };
}
