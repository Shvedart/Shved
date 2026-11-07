// Нижняя шторка поверх всего экрана (включая апп-бар). Закрывается крестиком, тапом по фону или Esc.

import { h, button, icon } from '../core/dom.js';
import { animate, EASE } from '../core/motion.js';

export function openSheet({ title, subtitle, body, label }) {
  const opener = document.activeElement;
  const scrim = h('div', { class: 'sheet-scrim' });
  const closeBtn = button({ class: 'sheet-close', 'aria-label': 'Закрыть' }, icon('close', { size: 20 }));
  const sheet = h('div', { class: 'sheet sheet-content', role: 'dialog', 'aria-modal': 'true', 'aria-label': label || title },
    h('div', { class: 'sheet-grabber', 'aria-hidden': 'true' }),
    h('div', { class: 'sheet-head' },
      h('div', { class: 'sheet-head-text' }, h('h2', { class: 'sheet-title' }, title), subtitle ? h('p', { class: 'sheet-subtitle' }, subtitle) : null),
      closeBtn),
    h('div', { class: 'sheet-body' }, body));
  const host = h('div', { class: 'sheet-host' }, scrim, sheet);
  document.getElementById('app').append(host);

  let closed = false;
  const onKey = (e) => { if (e.key === 'Escape') close(); };
  document.addEventListener('keydown', onKey);
  scrim.addEventListener('click', () => close());
  closeBtn.addEventListener('click', () => close());

  animate(scrim, [{ opacity: 0 }, { opacity: 1 }], { duration: 280 });
  animate(sheet, [{ transform: 'translateY(100%)' }, { transform: 'none' }], { duration: 440, easing: EASE.ios }).then(() => closeBtn.focus({ preventScroll: true }));

  async function close({ instant = false } = {}) {
    if (closed) return;
    closed = true;
    document.removeEventListener('keydown', onKey);
    if (!instant) {
      await Promise.all([
        animate(scrim, [{ opacity: 1 }, { opacity: 0 }], { duration: 240 }),
        animate(sheet, [{ transform: 'none' }, { transform: 'translateY(100%)' }], { duration: 320, easing: EASE.ios }),
      ]);
    }
    host.remove();
    opener?.focus?.({ preventScroll: true });
  }

  return { close, el: sheet };
}
