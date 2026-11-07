// Разводящая по сценариям (фрейм 635:131149).

import { h, button, icon } from '../core/dom.js';
import { store } from '../core/store.js';
import { haptics } from '../core/haptics.js';
import { toast } from '../ui/toast.js';

const SCENARIOS = [
  { id: 's1', title: 'Онбординг через лайк оффера', sub: '01 · сценарий' },
  { id: 's2', title: 'Онбординг через лайк любимого бренда выгоды', sub: '02 · сценарий' },
  { id: 's3', title: 'Заход через хук и упущенную выгоду', sub: '03 · сценарий (ещё в работе)' },
];

export function hubScreen({ el, nav }) {
  el.classList.add('hub');
  el.append(
    h('div', { class: 'hub-inner' },
      h('h1', { class: 'hub-title' }, 'Привлечение новичков в раздел Кэшбэки и бонусы'),
      h('ul', { class: 'hub-list', role: 'list' },
        SCENARIOS.map((s) => {
          const b = button({ class: 'hub-row' },
            h('span', { class: 'hub-row-text' }, h('span', { class: 'hub-row-title' }, s.title), h('span', { class: 'hub-row-sub' }, s.sub)),
            icon('chevron-right', { cls: 'hub-row-chevron' }));
          b.addEventListener('click', () => nav.push(`/bank/${s.id}`));
          return h('li', null, b);
        })),
      h('div', { class: 'hub-footer' },
        (() => {
          const reset = button({ class: 'btn-link hub-reset' }, 'Сбросить прототип');
          reset.addEventListener('click', () => {
            store.reset();
            haptics.light();
            toast('Избранное, категории и прогресс сброшены');
          });
          return reset;
        })(),
        h('p', { class: 'hub-note' }, 'Сохраняются избранное, выбранные категории и пройденные шаги'))));
  return { appbar: false, swipeBack: false };
}
