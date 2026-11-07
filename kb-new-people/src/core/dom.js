// Небольшие помощники для сборки DOM без фреймворка.

export function h(tag, props = {}, ...children) {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(props || {})) {
    if (value == null || value === false) continue;
    if (key === 'class') el.className = value;
    else if (key === 'style' && typeof value === 'object') Object.assign(el.style, value);
    else if (key === 'dataset') Object.assign(el.dataset, value);
    else if (key.startsWith('on') && typeof value === 'function') el.addEventListener(key.slice(2).toLowerCase(), value);
    else if (key === 'html') el.innerHTML = value;
    else if (value === true) el.setAttribute(key, '');
    else el.setAttribute(key, value);
  }
  append(el, children);
  return el;
}

export function append(el, children) {
  for (const child of children.flat(Infinity)) {
    if (child == null || child === false) continue;
    el.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return el;
}

export function clear(el) {
  while (el.firstChild) el.firstChild.remove();
  return el;
}

const ICON_ROOT = 'assets/icons/';

// URL для mask-image: CSS-переменные разрешаются относительно таблицы стилей, поэтому нужен абсолютный путь.
export const iconUrl = (name) => `url("${new URL(`${ICON_ROOT}${name}.svg`, document.baseURI).href}")`;

// Монохромная иконка: цвет берётся из currentColor.
export function icon(name, { size = 24, cls = '' } = {}) {
  const el = h('span', { class: `ico ${cls}`, 'aria-hidden': 'true' });
  el.style.setProperty('--src', iconUrl(name));
  el.style.width = el.style.height = `${size}px`;
  return el;
}

// Цветная иконка: используется как есть.
export function iconImg(name, { size = 24, cls = '', alt = '' } = {}) {
  const el = h('img', {
    class: `ico-img ${cls}`,
    src: `${ICON_ROOT}${name}.svg`,
    width: size,
    height: size,
    alt,
    'aria-hidden': alt ? null : 'true',
    draggable: 'false',
  });
  el.style.width = el.style.height = `${size}px`;
  return el;
}

export function img(src, { cls = '', alt = '', width, height, lazy = true, fallback } = {}) {
  if (fallback && !src) return imgFallback(fallback);
  const el = h('img', {
    class: cls,
    src,
    alt,
    width,
    height,
    loading: lazy ? 'lazy' : null,
    decoding: 'async',
    draggable: 'false',
  });
  el.addEventListener('error', () => {
    // битая картинка логотипа заменяется первой буквой названия
    if (fallback) el.replaceWith(imgFallback(fallback));
    else el.classList.add('is-broken');
  }, { once: true });
  return el;
}

function imgFallback(name) {
  return h('span', { class: 'img-fallback', 'aria-hidden': 'true' }, (name.match(/[A-Za-zА-Яа-яЁё0-9]/) || ['•'])[0].toUpperCase());
}

// Кнопка с сжатием при нажатии.
export function button(props = {}, ...children) {
  const { class: cls = '', ...rest } = props;
  return h('button', { type: 'button', class: `tap ${cls}`, ...rest }, ...children);
}

export function plural(n, one, few, many) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

export const nextFrame = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
export const wait = (ms) => new Promise((r) => setTimeout(r, ms));
