// Разводящая по сценариям (фрейм 635:131149).

import { h, button, icon } from '../core/dom.js';
import { store } from '../core/store.js';

const SCENARIOS = [
  { id: 's1', title: 'Онбординг через лайк оффера', sub: '01 · сценарий' },
  { id: 's2', title: 'Онбординг через лайк любимого бренда выгоды', sub: '02 · сценарий' },
  { id: 's3', title: 'Заход через хук: «загляни перед покупкой»', sub: '03 · сценарий (новые тексты)' },
  // 04 скрыт с разводящей; сам сценарий работает по адресу #/main/s4
  { id: 's4', title: 'Заход через хук: «загляни перед покупкой»', sub: '04 · сценарий (эксперимент)', hidden: true },
  { id: 's5', title: 'Заход через хук и упущенную выгоду', sub: '05 · сценарий' },
];

export function hubScreen({ el, nav }) {
  el.classList.add('hub');
  el.append(
    h('div', { class: 'hub-inner' },
      h('h1', { class: 'hub-title' }, 'Привлечение новичков в раздел Кэшбэки и бонусы'),
      h('ul', { class: 'hub-list', role: 'list' },
        SCENARIOS.filter((s) => !s.hidden).map((s) => {
          const b = button({ class: 'hub-row' },
            h('span', { class: 'hub-row-text' }, h('span', { class: 'hub-row-title' }, s.title), h('span', { class: 'hub-row-sub' }, s.sub)),
            icon('chevron-right', { cls: 'hub-row-chevron' }));
          b.addEventListener('click', () => nav.push(`/bank/${s.id}`));
          return h('li', null, b);
        })),
      h('div', { class: 'hub-footer' },
        h('p', { class: 'hub-note' }, 'Прототип сбрасывается, когда вы возвращаетесь на этот экран'))));
  // каждый заход на разводящую — с чистого листа: избранное, категории и прогресс сценариев обнуляются
  return { appbar: false, onActive: () => store.reset() };
}
