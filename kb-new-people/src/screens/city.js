import { h, button, img, iconImg } from '../core/dom.js';
import { reducedMotion } from '../core/motion.js';
import { applyCardLook, defaultSetup } from '../domain/feedSetup.js';
import { offerCard, promoCard } from '../ui/components.js';
import { openSheet } from '../ui/sheet.js';
import { app } from '../app.js';
import { buildShelves } from './feed.js';
import { watchGoodsChanges } from '../ui/goodsChange.js';

const asset = (name) => 'assets/img/city/' + name;
const art = (name, cls) => img(asset(name), { cls, alt: '', lazy: false });

let orientationAllowed = typeof window.DeviceOrientationEvent?.requestPermission !== 'function';
let orientationRequest;

export function requestCityOrientation() {
  if (!window.isSecureContext || orientationAllowed) return null;
  // Запрос вызывается прямо из клика, до перехода на экран.
  return orientationRequest ??= (async () => {
    try {
      orientationAllowed = await window.DeviceOrientationEvent.requestPermission() === 'granted';
    } catch {
      orientationAllowed = false;
    }
    return orientationAllowed;
  })();
}

export function cityScreen({ el, nav, params }) {
  const { catalog } = app;
  const products = params.branch === 'products';
  const setup = {
    ...defaultSetup([]),
    mode: 'flat',
    goods: 90,
    weights: { electronics: 86, home: 8, food: 4, travel: 1, fun: 1 },
  };
  el.classList.add('city-page');
  if (products) el.classList.add('city-products');
  applyCardLook(el, setup);
  for (const [part, on] of Object.entries(setup.goodsShow)) if (!on) el.classList.add('goods-no-' + part);

  let sheet;
  function show(title, body) {
    sheet?.close({ instant: true });
    sheet = openSheet({ title, body });
  }
  const city = button({ class: 'city-location', 'aria-label': 'Выбрать город' }, 'Москва');
  city.onclick = () => show('Выберите город', ['Москва', 'Санкт-Петербург', 'Ростов-на-Дону', 'Казань'].map((name) =>
    button({ class: 'city-option', onClick: () => { city.textContent = name; sheet.close(); } }, name)));
  const header = h('header', { class: 'city-header' },
    h('div', { class: 'city-bar' }, city,
      button({ class: 'city-glass glass', 'aria-label': 'Избранное', onClick: () => nav.push('/favorites') }, iconImg('city-heart', { size: 24 })),
      button({ class: 'city-glass glass', onClick: () => show('Заказы', h('p', null, 'У вас пока нет заказов')) }, 'Заказы')));
  const promo = catalog.offersInCategory('beauty').find((o) => /подружка/i.test(o.name));
  const hero = h('section', { class: 'city-hero' },
    h('div', { class: 'city-hero-art', 'aria-hidden': 'true' }, art('hero-front.png', 'city-hero-image')),
    h('h1', null, 'Кэшбэк дня 30% в Подружке'),
    button({ class: 'city-details', onClick: () => promo && nav.push('/offer/' + promo.id) }, 'Подробнее'));

  const input = h('input', { type: 'search', placeholder: 'Поиск', 'aria-label': 'Поиск по ленте' });
  const clearSearch = button({ class: 'city-search-clear', 'aria-label': 'Очистить поиск', hidden: true,
    onClick: () => { input.value = ''; render(); input.focus(); },
  }, iconImg('close', { size: 16 }));
  const search = h('form', { class: 'city-search', role: 'search' }, iconImg('city-search', { size: 24 }), input, clearSearch);
  const video = h('video', { class: 'city-headphone-video', muted: true, playsinline: true, preload: 'auto', 'aria-hidden': 'true' });
  video.muted = true;
  const featured = button({ class: 'city-tile city-electronics', onClick: () => {
    if (!orientationRequest) requestCityOrientation();
    select(products ? 'food' : 'electronics');
  } }, art(products ? 'grocery-poster.png' : 'electronics.png', 'city-headphone-poster'), video,
    h('span', { class: 'city-tile-title' }, products ? 'Супермаркеты' : 'Электроника'),
    h('span', { class: 'city-badge' }, iconImg('city-shield', { size: 12 }), '20%'));
  const clock = h('span', { role: 'timer' }, '00:16:32');
  const deadline = Date.now() + 992000;
  const discounts = button({ class: 'city-tile city-discounts', onClick: () => select('discounts') },
    h('span', { class: 'city-tile-title' }, 'Скидка до 30%'),
    h('span', { class: 'city-badge city-timer' }, iconImg('city-flash', { size: 12 }), clock));
  const brands = button({ class: 'city-tile city-brands', onClick: () => select('brands') },
    h('span', { class: 'city-brand-stack', 'aria-hidden': 'true' }, art('brand-first.png'), art('brand-second.png')),
    h('span', { class: 'city-tile-title' }, 'Кэшбэк', h('br'), 'от брендов'));

  const repeatOrder = button({ class: 'city-tile city-repeat-order', onClick: () => select('food', '.delivery-redeem') },
    h('span', { class: 'city-tile-title' }, 'Повторить заказ'),
    h('span', { class: 'city-order-meta' }, '12 товаров', h('br'), '~ 5 900 ₽'),
    art('order-brand.png', 'city-order-brand'));
  const nutella = button({ class: 'city-tile city-nutella', onClick: () => select('food') },
    art('nutella.png', 'city-nutella-art'),
    h('span', { class: 'city-tile-title' }, 'Nutella'),
    h('span', { class: 'city-badge' }, iconImg('city-shield', { size: 12 }), '100%'));

  let videoURL, frame = 0, progress = 0, timer, mounted = true;
  const download = new AbortController();
  // Blob позволяет перематывать локальное видео и на сервере без Range-запросов.
  fetch(asset(products ? 'supermarket.mp4' : 'electronics.mp4'), { signal: download.signal }).then((response) => {
    if (!response.ok) throw new Error('Видео не загрузилось');
    return response.blob();
  }).then((blob) => {
    if (!mounted) return;
    videoURL = URL.createObjectURL(blob);
    video.src = videoURL;
  }).catch(() => {});
  function seek() {
    frame = 0;
    if (video.seeking || video.readyState < 1 || !Number.isFinite(video.duration)) return;
    // Конечная позиция внутри последнего кадра, чтобы он оставался видимым.
    const end = Math.max(0, video.duration - 1 / 60);
    const desired = progress * end;
    if (Math.abs(video.currentTime - desired) >= 1 / 60) video.currentTime = desired;
  }
  function scrub(fraction) {
    if (reducedMotion()) return;
    progress = Math.max(0, Math.min(1, fraction));
    if (!frame) frame = requestAnimationFrame(seek);
  }
  const pointer = (event) => {
    if (event.pointerType === 'mouse') scrub(event.clientX / window.innerWidth);
  };
  const tilt = (event) => {
    if (orientationAllowed && Number.isFinite(event.gamma)) scrub((event.gamma + 35) / 70);
  };
  video.addEventListener('loadeddata', () => { video.classList.add('is-ready'); seek(); });
  video.addEventListener('seeked', seek);
  function tick() {
    const seconds = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
    clock.textContent = [Math.floor(seconds / 3600), Math.floor(seconds / 60) % 60, seconds % 60]
      .map((value) => String(value).padStart(2, '0')).join(':');
  }
  function stop() {
    window.removeEventListener('pointermove', pointer);
    window.removeEventListener('deviceorientation', tilt);
    clearInterval(timer);
    cancelAnimationFrame(frame);
    frame = 0;
  }
  const categories = [['fun', 'Афиша', 'fun'], ['hotels', 'Отели', 'travel'], ['beauty', 'Красота', 'beauty'], ['clothes', 'Одежда', 'clothes'], ['home', 'Мебель', 'home']];
  const shortcuts = categories.map(([image, name, category]) => button({
    class: 'city-shortcut', dataset: { category }, 'aria-pressed': 'false', onClick: () => select(category),
  }, h('span', { class: 'city-shortcut-icon city-icon-' + image }, iconImg('city-' + image, { size: 28 })), name));

  const serviceIcons = ['auto', 'first', 'fuel', 'second'];
  shortcuts.push(button({ class: 'city-shortcut', onClick: () => show('Сервисы',
    [['Электроника', '/main/s8'], ['Продукты', '/main/s8/products']].map(([label, path]) =>
      button({ class: 'city-option', onClick: async () => {
        await requestCityOrientation();
        sheet.close({ instant: true });
        nav.push(path);
      } }, label))) },
  h('span', { class: 'city-shortcut-icon city-service-icons' },
    serviceIcons.map((name) => iconImg('city-service-' + name, { size: 14, cls: 'city-service-' + name }))), 'Сервисы'));

  const bestByImage = new Map();
  for (const { id } of catalog.categories) {
    for (const offer of catalog.offersInCategory(id)) {
      if (!offer.image) continue;
      const key = offer.image.trim();
      if (!bestByImage.has(key) || offer.rank > bestByImage.get(key).rank) bestByImage.set(key, offer);
    }
  }
  const feed = buildShelves({
    catalog,
    cards: [...bestByImage.values()].map((offer) => offerCard(offer, { size: 's' })),
    promos: catalog.promos.map((promo) => promoCard(promo)),
    scratches: [],
    custom: setup,
    externalControls: true,
    matchGoodsShare: true,
    firstBanner: { id: 'city-pets', category: 'pets', title: 'Товары для питомцев с кэшбэком 10%', image: asset('pet-ad.png'), textColor: 'dark' },
    onLink: () => nav.push('/favorites'),
  });
  const emptySearch = h('p', { class: 'city-search-empty', role: 'status', hidden: true }, 'Ничего не нашли');
  let goodsChanges;
  let feedMounted = false;
  let category = 'all';
  function render() {
    const query = input.value.trim().toLocaleLowerCase('ru-RU');
    clearSearch.hidden = !input.value;
    el.classList.toggle('city-searching', !!query);
    feed.select(query ? 'all' : category, { query });
    emptySearch.hidden = !query || !!feed.querySelector('.shelf-mixed:not([hidden]) .grid:not([hidden])');

  }
  function select(next, destination) {
    category = !destination && category === next ? 'all' : next;
    for (const shortcut of shortcuts) shortcut.setAttribute('aria-pressed', String(shortcut.dataset.category === category));
    render();
    (destination && feed.querySelector(destination) || feed).scrollIntoView({ block: 'start' });
  }
  input.addEventListener('input', render);
  search.addEventListener('submit', (event) => { event.preventDefault(); input.blur(); });
  el.append(header, hero, search, h('nav', { 'aria-label': 'Сервисы Города' },
    h('div', { class: 'city-tiles' }, featured, ...(products ? [repeatOrder, nutella] : [discounts, brands])), h('div', { class: 'city-shortcuts' }, shortcuts)), emptySearch, feed);
  return {
    appbar: false,
    onActive() {
      if (!feedMounted) {
        feed.mount(el);
        goodsChanges = watchGoodsChanges(el);
        feedMounted = true;
      }
      goodsChanges?.check();
      window.addEventListener('pointermove', pointer, { passive: true });
      window.addEventListener('deviceorientation', tilt);
      if (!products) {
        tick();
        timer = setInterval(tick, 1000);
      }
    },
    onInactive: stop,
    destroy() {
      stop();
      mounted = false;
      download.abort();
      feed.destroy();
      goodsChanges?.destroy();
      if (videoURL) URL.revokeObjectURL(videoURL);
      sheet?.close({ instant: true });
    },
  };
}
