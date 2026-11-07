import { h } from '../core/dom.js';
import { animate, EASE } from '../core/motion.js';

let host = null;
let timer = 0;

export function toast(text, { duration = 2200 } = {}) {
  if (!host) {
    host = h('div', { class: 'toast-host', role: 'status', 'aria-live': 'polite' });
    document.getElementById('app').append(host);
  }
  clearTimeout(timer);
  host.replaceChildren(h('div', { class: 'toast' }, text));
  const el = host.firstChild;
  animate(el, [{ opacity: 0, transform: 'translateY(16px) scale(.98)' }, { opacity: 1, transform: 'none' }], { duration: 260, easing: EASE.out });
  timer = setTimeout(() => {
    animate(el, [{ opacity: 1 }, { opacity: 0, transform: 'translateY(8px)' }], { duration: 200 }).then(() => el.remove());
  }, duration);
}
