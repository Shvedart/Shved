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

// Иконки встраиваются в DOM как <svg>: Safari на iOS растрирует SVG в mask-image и <img>, и они мылятся.
// Пока файл грузится, монохромная иконка рисуется маской, цветная — пустым местом нужного размера.
const svgCache = new Map();
let svgSeq = 0;

function loadSvg(name) {
  if (!svgCache.has(name)) {
    svgCache.set(name, fetch(`${ICON_ROOT}${name}.svg`).then((r) => (r.ok ? r.text() : null)).catch(() => null));
  }
  return svgCache.get(name);
}

// Монохромная: все цвета вне <mask> → currentColor (как раньше маска брала только альфу).
const toCurrentColor = (src) => src.split(/(<mask[\s\S]*?<\/mask>)/).map((part, i) => (i % 2 ? part : part
  .replace(/(fill|stroke|stop-color)="(?!none|url)[^"]*"/g, '$1="currentColor"')
  .replace(/(fill|stroke|stop-color):(?!\s*none|\s*url)[^;"]*/g, '$1:currentColor'))).join('');

function inlineSvg(el, src, mono) {
  // id внутри файла уникализируются, иначе одинаковые градиенты в скрытой копии ломают видимую
  const n = ++svgSeq;
  let text = src.replace(/id="([^"]+)"/g, `id="$1_i${n}"`).replace(/url\(#([^)]+)\)/g, `url(#$1_i${n})`).replace(/href="#([^"]+)"/g, `href="#$1_i${n}"`);
  if (mono) text = toCurrentColor(text);
  const tpl = document.createElement('template');
  tpl.innerHTML = text.trim();
  const svg = tpl.content.querySelector('svg');
  if (!svg) return;
  svg.removeAttribute('preserveAspectRatio');
  svg.removeAttribute('style');
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.setAttribute('focusable', 'false');
  svg.setAttribute('aria-hidden', 'true');
  el.classList.add('is-inline');
  el.replaceChildren(svg);
}

function mountSvg(el, name, mono) {
  const cached = svgCache.get(name);
  if (cached?.value !== undefined) {
    if (cached.value) inlineSvg(el, cached.value, mono);
    return;
  }
  loadSvg(name).then((src) => {
    svgCache.get(name).value = src;
    if (src) inlineSvg(el, src, mono);
  });
}

// Монохромная иконка: цвет берётся из currentColor.
export function icon(name, { size = 24, cls = '' } = {}) {
  const el = h('span', { class: `ico ${cls}`, 'aria-hidden': 'true' });
  el.style.setProperty('--src', iconUrl(name));
  el.style.width = el.style.height = `${size}px`;
  mountSvg(el, name, true);
  return el;
}

// Цветная иконка: используется как есть.
export function iconImg(name, { size = 24, cls = '', alt = '' } = {}) {
  const el = h('span', {
    class: `ico-img ${cls}`,
    role: alt ? 'img' : null,
    'aria-label': alt || null,
    'aria-hidden': alt ? null : 'true',
  });
  el.style.width = el.style.height = `${size}px`;
  mountSvg(el, name, false);
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
