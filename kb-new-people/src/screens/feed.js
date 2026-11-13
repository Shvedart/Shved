// Лента после тура сценария 03: офферы собираются в смысловые полки по 4 (или 3 + скретч-карточка),
// между ними — полки «Путешествия» и «События для вас» из прототипа афиши.

import { h, button, img, icon, iconImg } from '../core/dom.js';
import { animate, EASE, stagger, fadeUpIn } from '../core/motion.js';
import { haptics } from '../core/haptics.js';
import { bannerCard, cardHeader, goodsCard, linkButton, productCard } from '../ui/components.js';
import { travelShelf, afishaShelf } from '../ui/shelves.js';
import { toast } from '../ui/toast.js';
import { app } from '../app.js';
import { interleave, GROCERY_CARDS } from '../domain/feedSetup.js';

// Порядок ленты. offers — смысловая полка: категория каталога, при необходимости — фильтр по названию;
// scratch — номер скретч-карточки (по SCRATCH_PRIZES в main.js), тогда офферов три.
const LAYOUT = [
  { title: 'Продукты с доставкой', sub: 'Привезут за час — с кэшбэком', cat: 'food', match: /доставка|лавка|самокат|купер/i, scratch: 0 },
  { title: 'Супермаркеты рядом', sub: 'Кэшбэк на покупки у дома', cat: 'food', match: /магнит|пятёрочка|перекрёсток|лента|ашан/i },
  { kind: 'gorod' },
  { kind: 'grocery' },
  { title: 'Сырная полка', sub: 'Hochland и Almette с кэшбэком', cat: 'food', match: /hochland|almette/i },
  // товары с кэшбэком — только когда в навигации выбрана «Еда», во всей ленте их нет
  { kind: 'products', only: 'food' },
  { title: 'Красота и уход', sub: 'Косметика, парфюмерия и уход', cat: 'beauty', match: /подружка|лэтуаль|кератин|sokolov/i },
  { kind: 'goods', cat: 'beauty' },
  { kind: 'promos', title: 'Промокоды для вас', sub: 'Скидки по коду у партнёров' },
  { kind: 'afisha' },
  { title: 'Забота о здоровье', sub: 'Анализы, аптеки и клиники', cat: 'health', scratch: 1 },
  { title: 'Одежда и обувь', sub: 'Обновите гардероб к сезону', cat: 'clothes' },
  { kind: 'goods', cat: 'clothes' },
  { title: 'Украшения и часы', sub: 'Подарки себе и близким', cat: 'beauty' },
  { title: 'Кухонная техника', sub: 'Помощники для дома', cat: 'electronics', match: /tefal|polaris|delonghi|braun|kitfort/i, scratch: 2 },
  { kind: 'goods', cat: 'electronics' },
  { kind: 'travel' },
  { title: 'Отели и туры', sub: 'Отдых с кэшбэком до 20%', cat: 'travel', match: /островок|travelata|onlinetours|туры|твил|травелог|яндекс|авито/i },
  { title: 'Поезда и автобусы', sub: 'Поездки по России', cat: 'travel', scratch: 4 },
  { title: 'Кино, книги и игры', sub: 'Подписки и развлечения', cat: 'fun' },
  { kind: 'goods', cat: 'sport' },
  { title: 'Гаджеты', sub: 'Смартфоны, наушники и аксессуары', cat: 'electronics' },
  { title: 'Кофе и перекусы', sub: 'Взбодриться по пути', cat: 'food', match: /кофе|coffee|бургер/i },
  { title: 'Всё для авто', sub: 'Сервис, шины и проверка машины', cat: 'auto', scratch: 3 },
  { kind: 'goods', cat: 'auto' },
  { title: 'Учёба онлайн', sub: 'Языки и курсы с кэшбэком', cat: 'education' },
  { title: 'Детям', sub: 'Игрушки, одежда и книги', cat: 'kids' },
  { kind: 'goods', cat: 'kids' },
  { title: 'Уют в доме', sub: 'Мебель и товары для ремонта', cat: 'home' },
  { kind: 'goods', cat: 'home' },
  { title: 'Питомцам', sub: 'Корм, ветеринары и страховка', cat: 'pets' },
  { title: 'Цветы', sub: 'Букеты с доставкой', cat: 'flowers' },
  { title: 'Шопинг', sub: 'Маркетплейсы и сервисы покупок', cat: 'shopping' },
];

// навигация ленты: порядок, подписи и иллюстрации из макета 654:145600.
const NAV = [
  { id: 'food', label: 'Еда', img: 'assets/img/cats/food.webp' },
  { id: 'travel', label: 'Путешествия', img: 'assets/img/cats/travel.webp' },
  { id: 'health', label: 'Здоровье', img: 'assets/img/cats/health.webp' },
  { id: 'beauty', label: 'Красота', img: 'assets/img/cats/beauty.webp' },
  { id: 'electronics', label: 'Электроника и техника', img: 'assets/img/cats/electronics.webp' },
  { id: 'kids', label: 'Дети', img: 'assets/img/cats/kids.webp' },
  { id: 'clothes', label: 'Одежда', img: 'assets/img/cats/clothes.webp' },
  { id: 'fun', label: 'Развлечения', img: 'assets/img/cats/fun.webp' },
  { id: 'auto', label: 'Авто', img: 'assets/img/cats/auto.webp' },
  { id: 'pets', label: 'Животные', img: 'assets/img/cats/pets.webp' },
  { id: 'home', label: 'Дом', img: 'assets/img/cats/home.webp' },
  { id: 'education', label: 'Образование', img: 'assets/img/cats/education.webp' },
  { id: 'shopping', label: 'Шопинг', img: 'assets/img/cats/shopping.webp' },
  { id: 'telecom', label: 'Связь', img: 'assets/img/cats/telecom.webp' },
  { id: 'sport', label: 'Спорт', img: 'assets/img/cats/sport.webp' },
  { id: 'flowers', label: 'Цветы', img: 'assets/img/cats/flowers.webp' },
];

// навигация ленты 07 (макет 791:159769): квадратная плитка 80px с цветным фоном и 3D-картинкой, подпись под ней.
// NAV_LOOK — какой вид показывать в 07: 'tiles' — этот, 'cloud' — прежний (иллюстрации 105×100 из NAV).
// crop — кадрирование картинки в плитке как в макете (left, top, width, height в %); нет — по центру с обрезкой.
const NAV_LOOK = 'tiles';
const TILE_VIOLET = 'rgba(163, 129, 255, 0.1)';
const TILE_GREY = 'rgba(144, 173, 191, 0.1)';
const NAV_TILES = {
  food: { bg: 'rgba(88, 192, 130, 0.1)' },
  travel: { bg: 'rgba(239, 195, 138, 0.2)', crop: [3.18, 0.09, 105.26, 100] },
  health: { bg: 'rgba(88, 182, 192, 0.1)' },
  beauty: { bg: TILE_VIOLET },
  electronics: { bg: TILE_VIOLET, crop: [-2.63, -3.73, 105.26, 100], label: 'Электроника' },
  kids: { bg: TILE_VIOLET },
  clothes: { bg: TILE_VIOLET },
  fun: { bg: 'rgba(212, 93, 140, 0.1)', crop: [-6.87, -4.03, 113.75, 108.06] },
  auto: { bg: TILE_GREY, crop: [-9.37, -6.41, 118.75, 112.81] },
  pets: { bg: TILE_GREY },
  home: { bg: TILE_VIOLET, crop: [-6.02, 0, 105.26, 100] },
  education: { bg: TILE_GREY },
  shopping: { bg: TILE_VIOLET },
  telecom: { bg: 'rgba(255, 221, 45, 0.1)', crop: [-14.37, -11.16, 128.75, 122.31] },
  sport: { bg: TILE_VIOLET, crop: [-0.11, 0, 105.26, 100] },
  flowers: { bg: TILE_VIOLET },
};
function navTile(id) {
  const t = NAV_TILES[id] || { bg: TILE_VIOLET };
  const pic = img(`assets/img/cats-tiles/${id}.webp`, { cls: 'feed-nav-tile-img', alt: '', width: 80, height: 76, lazy: false });
  if (t.crop) {
    const [left, top, width, height] = t.crop;
    Object.assign(pic.style, { left: `${left}%`, top: `${top}%`, width: `${width}%`, height: `${height}%` });
  }
  return h('span', { class: 'feed-nav-tile', style: `--tile-bg: ${t.bg}` }, pic);
}

const TRAVEL = [
  { img: 'assets/img/travel/phuket.webp', place: 'Пхукет', trigger: 'вода +29°', cashback: '7%', price: 'от 5 240 ₽', oldPrice: '7 900 ₽', color: '#4c8aa8' },
  { img: 'assets/img/travel/alanya.webp', place: 'Аланья', trigger: 'пляж Клеопатры', cashback: '5%', price: 'от 3 180 ₽', oldPrice: '4 900 ₽', color: '#6895A1' },
  { img: 'assets/img/travel/makhachkala.webp', place: 'Махачкала', trigger: 'озёра выше облаков', cashback: '10%', price: 'от 12 450 ₽', oldPrice: '18 300 ₽', color: '#6D8281' },
  { img: 'assets/img/travel/barnaul.jpg', place: 'Барнаул', trigger: 'степи до горизонта', cashback: '5%', price: 'от 28 940 ₽', oldPrice: '41 200 ₽', color: '#696957' },
  { img: 'assets/img/travel/orenburg.webp', place: 'Оренбург', trigger: 'бархатные холмы', cashback: '7%', price: 'от 19 380 ₽', oldPrice: '27 900 ₽', color: '#7a8a6a' },
  { img: 'assets/img/travel/perm.webp', place: 'Пермь', trigger: 'запах хвои и тумана', cashback: '5%', price: 'от 6 480 ₽', oldPrice: '9 200 ₽', color: '#5f7466' },
  { img: 'assets/img/travel/spb.jpg', place: 'Санкт-Петербург', trigger: 'белые ночи', cashback: '7%', price: 'от 4 590 ₽', oldPrice: '6 800 ₽', color: '#6f7f8f' },
  { img: 'assets/img/travel/almaty.webp', place: 'Алматы', trigger: 'горы рядом', cashback: '10%', price: 'от 9 320 ₽', oldPrice: '13 700 ₽', color: '#405B50' },
  { img: 'assets/img/travel/cairo.webp', place: 'Каир', trigger: 'пирамиды на рассвете', cashback: '5%', price: 'от 15 480 ₽', oldPrice: '21 900 ₽', color: '#BFB89B' },
  { img: 'assets/img/travel/moscow.webp', place: 'Москва', trigger: 'огни ночного города', cashback: '7%', price: 'от 2 250 ₽', oldPrice: '3 300 ₽', color: '#AC9E9B' },
  { cta: true, img: 'assets/img/travel/stavropol-2.webp', color: '#609379', title: 'Скидки до 30%\nна горящие билеты', desc: 'Подберём даты и цену под вас', button: 'Смотреть билеты' },
];

// «Заказать продукты домой через Т-Банк» (макет 685:150677): четыре бренда, кэшбэк — с заказа
// через Город / Т-Банк. У ВкусВилла такого предложения в данных нет — процент задан вручную.
const GOROD = {
  title: ['Продукты домой из Т-Банка'],
  sub: 'С кэшбэком за каждый заказ',
  items: [
    { name: 'Пятёрочка', time: '20-30 мин', offer: 'offer-900', logo: 'assets/img/gorod/pyaterochka.png', color: '#3e8d3e' },
    { name: 'Самокат', time: 'за 15 мин', offer: 'offer-040', logo: 'assets/img/gorod/samokat.png', color: '#ff335f' },
    { name: 'Лента Доставка', time: 'за 240 мин', offer: 'offer-125', logo: 'assets/img/gorod/lenta.png', color: '#003c96' },
    { name: 'ВкусВилл', time: '35-120 мин', cashback: '5%', logo: 'assets/img/gorod/vkusvill.png', color: '#60b769' },
  ],
};

function gorodShelf({ catalog, onLink }) {
  const tiles = GOROD.items.map((it) => {
    const offer = it.offer ? catalog.getOffer(it.offer) : null;
    const value = offer?.short || it.cashback;
    const tile = button({ class: 'gorod-tile', 'aria-label': `${it.name}, ${it.time}, кэшбэк ${value}` },
      h('span', { class: 'gorod-pic', style: { background: it.color } },
        img(it.logo, { alt: '', width: 100, height: 100 }),
        // фиксированная сумма в рублях — с иконкой купона, как у промокодов; процент — с короной
        h('span', { class: 'gorod-badge' }, offer?.type === 'fixed' ? iconImg('coupon', { size: 12 }) : icon('crown', { size: 12 }), h('span', null, value))),
      h('span', { class: 'gorod-text' },
        h('span', { class: 'gorod-name' }, it.name),
        h('span', { class: 'gorod-time' }, it.time)));
    tile.addEventListener('click', () => (offer ? app.nav.push(`/offer/${offer.id}`) : onLink?.()));
    return tile;
  });
  const title = GOROD.title.flatMap((line, i) => (i ? [h('br'), line] : [line]));
  return h('section', { class: 'shelf gorod', dataset: { cat: 'food' } },
    cardHeader({ title, subtitle: GOROD.sub }),
    h('div', { class: 'gorod-grid' }, tiles));
}

// какие товары (data/products.json) — про еду: для полки «Товары с кэшбэком» в категории «Еда»
const FOOD_PRODUCTS = ['product-001', 'product-002', 'product-003', 'product-004', 'product-005', 'product-007'];

// «Вы уже заказывали» (макет 685:150677, вторая версия): товары магазина из data/grocery.json —
// цена, кэшбэк в рублях с короной и сердечко. Показываем первые четыре.
const GROCERY = { shop: 'ВкусВилл', title: 'Вы уже заказывали', avatar: 'assets/img/gorod/vkusvill-avatar.svg', count: 4 };

// карточка продукта магазина: фото, цена, кэшбэк в рублях с короной, название
function groceryCard(p) {
  // сердечко только для вида: товаров нет в избранном прототипа
  const heart = button({ class: 'heart gcard-heart', 'aria-label': `${p.name}: в избранное`, 'aria-pressed': 'false' },
    icon('heart-outline', { size: 24, cls: 'heart-outline' }), iconImg('heart-filled', { size: 24, cls: 'heart-filled' }));
  heart.addEventListener('click', () => {
    const on = heart.getAttribute('aria-pressed') !== 'true';
    heart.setAttribute('aria-pressed', String(on));
    haptics.selection();
  });
  return h('div', { class: 'gcard' },
    h('div', { class: 'gcard-pic' }, img(p.image, { alt: '' })),
    heart,
    h('div', { class: 'gcard-info' },
      h('div', { class: 'gcard-price' }, h('span', null, p.price),
        h('span', { class: 'gcard-badge' }, icon('crown', { size: 10 }), h('span', null, p.cashback))),
      h('p', { class: 'gcard-name' }, p.name)));
}

function groceryShelf({ catalog, onLink }) {
  const items = catalog.grocery.slice(0, GROCERY.count).map(groceryCard);
  if (!items.length) return null;
  // шапка как у других полок (заголовок, подзаголовок, «Все»), только слева — логотип магазина
  return h('section', { class: 'shelf grocery', dataset: { cat: 'food' } },
    h('div', { class: 'card-header grocery-head' },
      img(GROCERY.avatar, { cls: 'grocery-avatar', alt: '', width: 44, height: 44 }),
      h('div', { class: 'card-header-text' }, h('h2', { class: 'card-title' }, GROCERY.title), h('p', { class: 'card-subtitle' }, GROCERY.shop)),
      linkButton('Все', { onClick: onLink, cls: 'card-link' })),
    h('div', { class: 'gorod-grid grocery-grid' }, items));
}

// «Доставка продуктов» (макет 736:156423, лента 07): белая карточка — продукты магазина
// лентой вбок; в подзаголовке кэшбэк за корзину, внизу кнопка с магазином и суммой
const DELIVERY = { title: 'Доставка продуктов', sub: 'Собрали вашу корзину', shop: 'ВкусВилл', time: 'за 30 мин', count: 6 };
const rub = (s) => Number(s.replace(/[^\d,]/g, '').replace(',', '.')) || 0;

// последняя плитка корзины (макет 736:156684): плюс на сером квадрате и подпись
function deliveryEdit() {
  const b = button({ class: 'gcard delivery-edit' },
    h('span', { class: 'gcard-pic' }, icon('add', { size: 36 })),
    h('span', { class: 'gcard-info' }, h('span', { class: 'gcard-name' }, 'Добавить или изменить продукты')));
  b.addEventListener('click', () => toast('Недоступно в прототипе'));
  return b;
}

// какой вид полки «Доставка продуктов» показывать: 'compare' — сравнение корзины в магазинах
// (макет 762:158548), 'single' — прежний вид с одним магазином (макет 736:156423, сохранён, скрыт)
// 'compare2' — «Где выгоднее заказать продукты?»: сначала магазины, у выгодного — на сколько дешевле,
// ниже продукты. Вернуть прежний вид «Ваша корзина» — 'compare'
// 'cashback' — один магазин с логотипом в заголовке: «корзина стоила N ₽, с кэшбэком — M ₽», без выбора магазина
const DELIVERY_LOOK = 'cashback';

// Одна и та же корзина в разных магазинах. У магазина своя цена на каждый продукт: базовая цена
// из data/grocery.json × множитель (prices, по кругу; 1 — как в данных), кэшбэк продукта × cashback.
// Самая выгодная корзина — меньше всего «цена минус кэшбэк»: она выбрана сразу, её цена зелёная
const DELIVERY_STORES = [
  { id: 'pyaterochka', name: 'Пятёрочка', where: 'Пятёрочке', logo: 'assets/img/gorod/pyaterochka.png', time: 'за 30 мин', prices: [1], cashback: 1 },
  { id: 'lenta', name: 'Лента доставка', where: 'Ленте', logo: 'assets/img/gorod/lenta.png', time: 'за 240 мин', prices: [1.16, 0.92, 1.21, 1.09, 1.3, 1.12, 0.95, 1.18, 1.07, 1.14, 0.9, 1.22], cashback: 0.8 },
];

// какие продукты из data/grocery.json в корзине — разные: молочка, фрукты, мясо, бакалея, сыр
const DELIVERY_BASKET = ['grocery-001', 'grocery-002', 'grocery-003', 'grocery-004', 'grocery-005', 'grocery-006',
  'grocery-007', 'grocery-017', 'grocery-018', 'grocery-021', 'grocery-036', 'grocery-073'];

function deliveryShelf(args) {
  if (DELIVERY_LOOK === 'single') return deliverySingleShelf(args);
  if (DELIVERY_LOOK === 'cashback') return deliveryCashbackShelf(args);
  return deliveryCompareShelf({ ...args, look: DELIVERY_LOOK });
}

function deliveryCompareShelf({ catalog, onLink, look = 'compare' }) {
  const list = DELIVERY_BASKET.map((id) => catalog.grocery.find((p) => p.id === id)).filter(Boolean);
  if (!list.length) return null;
  const money = (n) => `${(Math.round(n * 100) / 100).toLocaleString('ru-RU', { maximumFractionDigits: 2 })}\u00a0₽`;
  // цены и кэшбэк каждого продукта в каждом магазине; цена не «как в данных» — с 99 копейками
  const stores = DELIVERY_STORES.map((st) => {
    const items = list.map((p, i) => {
      const k = st.prices[i % st.prices.length];
      const price = k === 1 ? rub(p.price) : Math.floor(rub(p.price) * k) + 0.99;
      return { price, back: Math.round(rub(p.cashback) * k * st.cashback) };
    });
    const total = items.reduce((t, x) => t + x.price, 0);
    const back = items.reduce((t, x) => t + x.back, 0);
    return { ...st, items, total, back };
  });
  const best = stores.reduce((a, b) => (b.total - b.back < a.total - a.back ? b : a));
  let picked = best;
  const cards = list.map(groceryCard);
  const sumEl = h('b', null, money(Math.round(picked.total)));
  // цены на карточках — выбранного магазина; плашка на фото — насколько дороже или дешевле лучшей корзины
  function paint() {
    cards.forEach((card, i) => {
      const { price, back } = picked.items[i];
      card.querySelector('.gcard-price > span').textContent = money(price);
      card.querySelector('.gcard-badge > span:last-child').textContent = money(back);
      const diff = Math.round((price - best.items[i].price) * 100) / 100;
      card.querySelector('.delivery-diff')?.remove();
      if (!diff) return;
      const pill = h('span', { class: `delivery-diff ${diff > 0 ? 'is-up' : 'is-down'}` }, `${diff > 0 ? '+' : '−'}${money(Math.abs(Math.abs(diff) >= 1 ? Math.round(diff) : diff))}`);
      card.querySelector('.gcard-pic').append(pill);
      animate(pill, [{ opacity: 0, transform: 'scale(0.6)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 260, easing: EASE.spring });
    });
    sumEl.textContent = money(Math.round(picked.total));
  }
  // compare2: у выгодного магазина третьей строкой — на сколько он дешевле следующего по цене («На 133 ₽ дешевле»)
  const runnerUp = stores.filter((st) => st !== best).reduce((a, b) => (!a || b.total < a.total ? b : a), null);
  const saving = runnerUp ? Math.round(runnerUp.total) - Math.round(best.total) : 0;
  const rows = stores.map((st) => {
    const row = button({ class: 'delivery-store', role: 'radio', 'aria-checked': String(st === picked), 'aria-label': `${st.name}: ${money(st.total)}, кэшбэк ${money(st.back)}, доставка ${st.time}` },
      img(st.logo, { cls: 'delivery-store-logo', alt: '', width: 40, height: 40 }),
      h('span', { class: 'delivery-store-text' },
        h('span', { class: 'delivery-store-name' }, h('span', { class: 'delivery-store-title' }, st.name), ' • ',
          h('span', { class: st === best ? 'is-best' : '' }, money(Math.round(st.total)))),
        h('span', { class: 'delivery-store-meta' }, icon('crown', { size: 14 }), h('span', { class: 'delivery-store-back' }, money(st.back)), ' • ', st.time),
        look === 'compare2' && st === best && saving > 0
          ? h('span', { class: 'delivery-store-saving' }, `На ${money(saving)} дешевле`) : null),
      h('span', { class: 'delivery-radio', 'aria-hidden': 'true' }, iconImg('checkbox', { size: 22 })));
    row.addEventListener('click', () => {
      if (picked === st) return;
      picked = st;
      haptics.selection();
      rows.forEach((r, i) => r.setAttribute('aria-checked', String(stores[i] === picked)));
      paint();
    });
    return row;
  });
  paint();
  const order = button({ class: 'delivery-order' }, h('span', null, 'Заказать'), sumEl);
  order.addEventListener('click', () => toast('Недоступно в прототипе'));
  const scroll = h('div', { class: 'hscroll delivery-scroll' }, cards, deliveryEdit());
  const storeList = h('div', { class: 'delivery-stores', role: 'radiogroup', 'aria-label': 'Магазин' }, rows);
  // compare2 — сначала магазины, потом продукты; compare — прежний порядок
  if (look === 'compare2') {
    return h('section', { class: 'card delivery delivery-compare is-v2', dataset: { cat: 'food' } },
      cardHeader({ title: 'Где выгоднее заказать продукты?', subtitle: 'Те же продукты в двух магазинах', link: 'Все', onLink }),
      storeList, scroll,
      h('div', { class: 'delivery-foot' }, order));
  }
  return h('section', { class: 'card delivery delivery-compare', dataset: { cat: 'food' } },
    cardHeader({ title: 'Ваша корзина', subtitle: 'Доставка продуктов из Т-Банка', link: 'Все', onLink }),
    scroll, storeList,
    h('div', { class: 'delivery-foot' }, order));
}

// Корзина в одном магазине (первый в DELIVERY_STORES): логотип в заголовке, ниже — сколько корзина
// стоила и сколько будет стоить с кэшбэком (цена минус кэшбэк продуктов), дальше продукты и «Заказать»
function deliveryCashbackShelf({ catalog, onLink }) {
  const list = DELIVERY_BASKET.map((id) => catalog.grocery.find((p) => p.id === id)).filter(Boolean);
  if (!list.length) return null;
  const st = DELIVERY_STORES[0];
  const money = (n) => `${Math.round(n).toLocaleString('ru-RU')}\u00a0₽`;
  const total = list.reduce((t, p) => t + rub(p.price), 0);
  const back = list.reduce((t, p) => t + Math.round(rub(p.cashback)), 0);
  const order = button({ class: 'delivery-order', 'aria-label': `Заказать в ${st.where} на ${money(total)}` }, h('span', null, 'Заказать'), h('b', null, money(total)));
  order.addEventListener('click', () => toast('Недоступно в прототипе'));
  return h('section', { class: 'card delivery delivery-cashback', dataset: { cat: 'food' } },
    // шапка как у cardHeader, но логотип отдельной колонкой — подзаголовок встаёт под заголовок, а не под логотип
    h('div', { class: 'card-header delivery-cb-head' },
      img(st.logo, { cls: 'delivery-cb-logo', alt: '', width: 40, height: 40, lazy: false }),
      h('div', { class: 'card-header-text' },
        h('h2', { class: 'card-title' }, `Корзина в ${st.where}`),
        h('p', { class: 'card-subtitle delivery-cb-sub', 'aria-label': `Стоила ${money(total)}, с кэшбэком ${money(total - back)}` },
          h('s', null, money(total)), ' ', h('b', null, money(total - back)), ' с кэшбэком')),
      linkButton('Все', { onClick: onLink, cls: 'card-link' })),
    h('div', { class: 'hscroll delivery-scroll' }, list.map(groceryCard), deliveryEdit()),
    h('div', { class: 'delivery-foot' }, order));
}

// Полки магазинов продуктов — по виду как корзина с кэшбэком (логотип слева от заголовка), но без суммы
// корзины и без «Заказать»: просто продукты лентой вбок с кэшбэком на каждом. Фото у этих магазинов
// со своим фоном — на всю плитку (.store-shelf в shelves.css)
// «Не забудьте взять» из Самоката: повседневное вперемешку со сладким к чаю
const REMIND = {
  logo: 'assets/img/gorod/samokat.png',
  title: 'Не забудьте взять',
  sub: 'Обычно докупаете в Самокате',
  source: 'samokat',
  items: ['samokat-030', 'samokat-038', 'samokat-043', 'samokat-003', 'samokat-072', 'samokat-036', 'samokat-012', 'samokat-001',
    'samokat-074', 'samokat-062', 'samokat-094', 'samokat-049', 'samokat-058', 'samokat-011', 'samokat-060', 'samokat-055'],
};
// «Ваш ВкусВилл»: то, что вы всегда там берёте, — теперь выгоднее; товары — все из data/vkusvill.json
// (повторы убирает catalog), items: null — все по порядку
const VKUSVILL = {
  logo: 'assets/img/gorod/vkusvill.png',
  title: 'Ваш ВкусВилл',
  sub: 'Как всегда, только выгоднее',
  source: 'vkusvill',
  items: null,
};

function storeShelf(cfg, { catalog, onLink }) {
  const all = catalog[cfg.source] || [];
  const list = cfg.items ? cfg.items.map((id) => all.find((p) => p.id === id)).filter(Boolean) : all;
  if (!list.length) return null;
  return h('section', { class: `card delivery delivery-cashback store-shelf is-${cfg.source}`, dataset: { cat: 'food' } },
    h('div', { class: 'card-header delivery-cb-head' },
      img(cfg.logo, { cls: 'delivery-cb-logo', alt: '', width: 40, height: 40, lazy: false }),
      h('div', { class: 'card-header-text' },
        h('h2', { class: 'card-title' }, cfg.title),
        h('p', { class: 'card-subtitle' }, cfg.sub)),
      linkButton('Все', { onClick: onLink, cls: 'card-link' })),
    h('div', { class: 'hscroll delivery-scroll' }, list.map(groceryCard)));
}

function deliverySingleShelf({ catalog, onLink }) {
  const list = catalog.grocery.slice(0, DELIVERY.count);
  if (!list.length) return null;
  const sum = (key) => Math.round(list.reduce((s, p) => s + rub(p[key]), 0)).toLocaleString('ru-RU');
  const order = button({ class: 'delivery-order', 'aria-label': `Заказать в магазине ${DELIVERY.shop} на ${sum('price')} ₽, доставка ${DELIVERY.time}` },
    h('span', null, DELIVERY.shop, h('span', { class: 'delivery-time' }, DELIVERY.time)), h('b', null, `${sum('price')} ₽`));
  order.addEventListener('click', () => toast('Недоступно в прототипе'));
  return h('section', { class: 'card delivery', dataset: { cat: 'food' } },
    h('div', { class: 'card-header' },
      h('div', { class: 'card-header-text' },
        h('h2', { class: 'card-title' }, DELIVERY.title),
        h('p', { class: 'card-subtitle delivery-sub' }, DELIVERY.sub, icon('crown', { size: 16 }), `${sum('cashback')} ₽`)),
      linkButton('Все', { onClick: onLink, cls: 'card-link' })),
    h('div', { class: 'hscroll delivery-scroll' }, list.map(groceryCard), deliveryEdit()),
    h('div', { class: 'delivery-foot' }, order));
}

// Товары маркетплейса (data/tovarka.json, карточка — макет 710:155116): полки по 4 товара.
// Во всей ленте у категории одна полка, в своей категории и в «Шопинге» (он родитель всех
// товарных категорий) — до GOODS_SHELVES полок
const GOODS_TITLES = {
  electronics: 'Техника и гаджеты',
  clothes: 'Одежда и обувь',
  auto: 'Товары для авто',
  sport: 'Товары для спорта',
  home: 'Товары для дома',
  beauty: 'Косметика и уход',
  kids: 'Товары для детей',
};
const GOODS_SHELVES = 3;

// ---------- Лента по настройке (сценарий 07) ----------
// Сколько карточек в ленте: доли категорий делят это число, доля товаров — каждую категорию
const CUSTOM_TOTAL = 150;
// сколько товаров минимум идёт подряд в конце ленты 07, когда офферы кончились
const TAIL_GOODS = 40;
// рекламный баннер в сплошной ленте 07 — примерно один на столько карточек
const BANNER_EVERY = 16;

// Баннеры из data/banners.json, что подходят ленте: своей категории с долей больше 0 или вне
// настройки (продукты банка, связь — у них средняя доля). Порядок — категории чередуются по долям
function pickBanners(catalog, setup) {
  const shares = Object.values(setup.weights).filter((w) => w > 0);
  const avg = shares.reduce((a, b) => a + b, 0) / (shares.length || 1);
  const weightOf = (c) => (c in setup.weights ? setup.weights[c] : avg);
  const byCat = {};
  for (const b of catalog.banners) if (weightOf(b.category) > 0) (byCat[b.category] ||= []).push(b);
  // очередь — по доле категории, а не по числу её баннеров: иначе категория с 8 баннерами забирала бы всю рекламу
  const counts = Object.fromEntries(Object.keys(byCat).map((c) => [c, Math.max(1, Math.round(weightOf(c) * 10))]));
  const taken = {};
  const order = interleave(counts).filter((c) => (taken[c] = (taken[c] || 0) + 1) <= byCat[c].length);
  const used = {};
  return order.map((c) => byCat[c][(used[c] = (used[c] || 0) + 1) - 1]);
}
const chunk = (list, n) => Array.from({ length: Math.ceil(list.length / n) }, (_, i) => list.slice(i * n, i * n + n));

// Правила для больших карточек в сплошной ленте: больших товаров подряд — не больше двух,
// обычные карточки идут только парами (в строке всегда две). Порядок ленты сохраняется,
// лишняя одиночная карточка в конце отбрасывается.
function pairUp(items) {
  const isBig = (x) => x.classList.contains('is-big');
  const bigs = items.filter(isBig);
  const smalls = items.filter((x) => !isBig(x));
  const out = [];
  let run = 0;
  for (const item of items) {
    if (isBig(item)) {
      if (!bigs.includes(item)) continue;
      // третий большой подряд ждёт, пока между ними не встанет пара обычных
      if (run === 2) {
        if (smalls.length < 2) break;
        out.push(smalls.shift(), smalls.shift());
        run = 0;
      }
      bigs.splice(bigs.indexOf(item), 1);
      out.push(item);
      run++;
    } else {
      if (!smalls.includes(item)) continue;
      if (smalls.length < 2) break;
      out.push(smalls.shift(), smalls.shift());
      run = 0;
    }
  }
  return out;
}

// Продукты из магазина (data/grocery.json) в виде карточки товара — ими лента 07 добирает «товары еды»
const groceryAsGoods = (p) => ({
  id: p.id, image: p.image, rating: '', oldPrice: '', discount: '', price: p.price,
  cashback: p.cashback.replace(/\s*₽$/, ''), brand: '', description: p.name, merchant: 'ВкусВилл', merchantLogo: '', verified: false,
});

// «Путешествия» и афиша в ленте 07 — если у их категории есть доля; встают на треть и две трети ленты
// «Подешевело в избранном» (макет 762:158789, лента 07): белая карточка, товары со
// скидкой из выбранных категорий лентой вбок (карточки 132px, как в «Вашей корзине»), сердечко
// уже отмечено, на фото — зелёная плашка, на сколько рублей стало дешевле
const FAV_DROP_COUNT = 8;

function favDropShelf({ catalog, setup }) {
  const src = setup.moderated !== false && catalog.goodsModerated.length ? catalog.goodsModerated : catalog.goods;
  const pools = Object.fromEntries(src.filter((c) => (setup.weights[c.id] || 0) > 0)
    .map((c) => [c.id, c.products.filter((p) => p.oldPrice && rub(p.oldPrice) > rub(p.price))]));
  // категории чередуются по долям, чтобы в полке были не одни часы
  const order = interleave(Object.fromEntries(Object.entries(pools).map(([c, l]) => [c, Math.min(l.length, FAV_DROP_COUNT)])));
  const taken = {};
  const list = order.slice(0, FAV_DROP_COUNT).map((c) => pools[c][(taken[c] = (taken[c] || 0) + 1) - 1]);
  if (list.length < 2) return null;
  return goodsStrip({ title: 'Подешевело в избранном', cat: 'shopping', list, liked: true,
    label: (p) => ({ text: `−${Math.round(rub(p.oldPrice) - rub(p.price)).toLocaleString('ru-RU')}\u00a0₽`, cls: 'is-down' }) });
}

// Белая карточка с товарами лентой вбок (карточки 132px, без старой цены и магазина) и плашкой на фото:
// общая для «Подешевело в избранном» и «Успеет приехать к субботе»
function goodsStrip({ title, sub, cat, list, liked = false, label }) {
  const cards = list.map((p) => {
    const card = goodsCard(p);
    if (liked) card.querySelector('.heart')?.setAttribute('aria-pressed', 'true');
    const { text, cls } = label(p);
    card.querySelector('.goods-pic').append(h('span', { class: `delivery-diff ${cls}` }, text));
    return card;
  });
  return h('section', { class: 'card delivery fav-drop', dataset: { cat } },
    cardHeader({ title, subtitle: sub }),
    h('div', { class: 'hscroll delivery-scroll' }, cards));
}

// Набор товаров с баннером (data/kits.json, лента 07): заголовок, первым — баннер набора во всю
// высоту карточек, за ним товары набора (карточки 132px), внизу «Заказать набор» с суммой
function kitShelf(kit) {
  const total = kit.products.reduce((s, p) => s + rub(p.price), 0);
  const order = button({ class: 'delivery-order' }, h('span', null, kit.order || 'Заказать набор'), h('b', null, `${Math.round(total).toLocaleString('ru-RU')}\u00a0₽`));
  order.addEventListener('click', () => toast('Недоступно в прототипе'));
  return h('section', { class: 'card delivery kit', dataset: { cat: kit.category, kit: kit.id } },
    cardHeader({ title: kit.title }),
    h('div', { class: 'hscroll delivery-scroll' }, bannerCard({ category: kit.category, ...kit.banner }), kit.products.map(goodsCard)),
    h('div', { class: 'delivery-foot' }, order));
}

// «Успеет приехать к субботе» (лента 07): детские игрушки на подарок, на фото — когда привезут
const GIFT_DAYS = ['Завтра', 'В пятницу', 'В субботу'];
const GIFT_MATCH = /игрушк|конструктор|беговел|робот|мотоцикл|электромобил|каталк|велосипед|набор/i;

function giftShelf({ catalog, setup }) {
  const src = setup.moderated !== false && catalog.goodsModerated.length ? catalog.goodsModerated : catalog.goods;
  const list = (src.find((c) => c.id === 'kids')?.products || []).filter((p) => GIFT_MATCH.test(p.description)).slice(0, FAV_DROP_COUNT);
  if (list.length < 2) return null;
  return goodsStrip({ title: 'Успеет приехать к субботе', sub: 'Подарки детям', cat: 'kids', list,
    label: (p) => ({ text: GIFT_DAYS[list.indexOf(p) % GIFT_DAYS.length], cls: 'is-date' }) });
}

function customSpecials({ catalog, setup, extras, onLink }) {
  const list = [];
  // тумблер «Горизонтальные полки» (поле delivery, по умолчанию включён) — выключен: в ленте нет
  // ни одной полки с лентой вбок — корзины продуктов, подборок товаров, путешествий и афиши
  if (setup.delivery === false) return list;
  if (setup.goods > 0) {
    const f = favDropShelf({ catalog, setup });
    if (f) list.push({ el: f, at: 0.5 });
    const g = giftShelf({ catalog, setup });
    if (g) list.push({ el: g, at: 0.85 });
    // наборы — между «Подешевело в избранном» и афишей
    catalog.kits.forEach((kit, i) => list.push({ el: kitShelf(kit), at: 0.6 + i * 0.05 }));
  }
  const d = deliveryShelf({ catalog, onLink });
  if (d) list.push({ el: d, at: 0.1 });
  const r = storeShelf(REMIND, { catalog, onLink });
  if (r) list.push({ el: r, at: 0.25 });
  const v = storeShelf(VKUSVILL, { catalog, onLink });
  if (v) list.push({ el: v, at: 0.45 });
  if (setup.weights.travel > 0) {
    const t = travelShelf({ items: TRAVEL });
    t.dataset.cat = 'travel';
    extras.push(t);
    list.push({ el: t, at: 0.35 });
  }
  if (setup.weights.fun > 0) {
    const a = afishaShelf({ items: AFISHA });
    a.querySelector('.fc-all-link').addEventListener('click', onLink);
    a.dataset.cat = 'fun';
    extras.push(a);
    list.push({ el: a, at: 0.7 });
  }
  // широкие блоки ставятся по порядку своего места в ленте
  return list.sort((a, b) => a.at - b.at);
}

// Раздаёт total карточек категориям по весам порциями по step, не больше, чем есть (caps):
// каждая порция — категории, которой сейчас меньше всех относительно её доли. Кончилась у одной —
// остаток уходит остальным по их долям.
function allocate(total, weights, caps, step) {
  const out = Object.fromEntries(Object.keys(caps).map((c) => [c, 0]));
  for (let left = Math.floor(total / step) * step; left >= step; left -= step) {
    let best = null;
    for (const c of Object.keys(caps)) {
      if (out[c] + step > caps[c]) continue;
      if (!best || (out[c] + step) / weights[c] < (out[best] + step) / weights[best]) best = c;
    }
    if (!best) break;
    out[best] += step;
  }
  return out;
}

// Колонки «как в Pinterest» по настоящим высотам: каждая карточка — в ту колонку, что сейчас
// короче, а в конце одна пара карточек из разных колонок меняется местами, если так колонки
// сходятся ровнее — иначе над широким блоком (путешествия, афиша) остаётся пустота
// исходный порядок карточек блока — по очереди слева и справа, как их разложили при сборке
const masonryItems = (m) => (m.items ||= [...m.children].flatMap((c) => [...c.children].map((el, i) => [i, el]))
  .sort((a, b) => a[0] - b[0]).map(([, el]) => el));

// Все блоки колонок ленты: если колонки над широким блоком не сходятся (например, карточек
// нечётное число), последняя карточка переезжает под широкий блок — в начало следующих колонок
function balanceFeed(section) {
  const blocks = [...section.children];
  // высоты меряем сразу у всех, пока карточки на странице: перенесённая карточка на миг
  // выпадает из DOM, и её высота читалась бы как 0
  const heights = new Map();
  for (const m of blocks) if (m.classList.contains('masonry')) for (const el of masonryItems(m)) heights.set(el, el.getBoundingClientRect().height);
  const balanceMasonry = (m) => balanceColumns(m, heights);
  blocks.forEach((m, i) => {
    if (!m.classList.contains('masonry')) return;
    const next = blocks.slice(i + 1).find((b) => b.classList.contains('masonry'));
    // пробуем перенести 0–3 карточки и оставляем вариант, где колонки сходятся ровнее
    const own = masonryItems(m);
    const moved = [];
    let best = { k: 0, diff: balanceMasonry(m) };
    for (let k = 1; k <= 3 && next && best.diff > 40 && own.length > 2; k++) {
      moved.unshift(own.pop());
      const diff = balanceMasonry(m);
      if (diff < best.diff) best = { k, diff };
    }
    // лишнее — назад, перенесённое — в начало следующего блока
    while (moved.length > best.k) own.push(moved.shift());
    if (next) masonryItems(next).unshift(...moved);
    balanceMasonry(m);
  });
}

function balanceColumns(m, heights, items = masonryItems(m)) {
  const cols = [...m.children];
  const hs = items.map((el) => heights.get(el) || 0);
  const gap = parseFloat(getComputedStyle(cols[0]).rowGap) || 0;
  const sum = [0, 0];
  const put = [[], []];
  hs.forEach((hgt, i) => {
    const c = sum[0] <= sum[1] ? 0 : 1;
    put[c].push(i);
    sum[c] += hgt ? hgt + gap : 0; // скрытая фильтром карточка места не занимает
  });
  const d = sum[0] - sum[1];
  let swap = null;
  let bestD = Math.abs(d);
  for (const a of put[0].slice(-4)) for (const b of put[1].slice(-4)) {
    const nd = Math.abs(d - 2 * (hs[a] - hs[b]));
    if (nd < bestD) { bestD = nd; swap = [a, b]; }
  }
  if (swap) {
    const [a, b] = swap;
    put[0][put[0].indexOf(a)] = b;
    put[1][put[1].indexOf(b)] = a;
  }
  cols.forEach((c, k) => c.replaceChildren(...put[k].map((i) => items[i])));
  return bestD;
}

function customParts({ catalog, byOffer, promos, scratches: allScratches = [], extras = [], setup, onLink }) {
  // стирашек в ленте 07 вдвое меньше (из 5 — 3); лишние убираем со страницы
  const scratches = allScratches.slice(0, Math.round(allScratches.length / 2));
  allScratches.slice(scratches.length).forEach((sc) => sc.remove());
  const specials = customSpecials({ catalog, setup, extras, onLink });
  const usedOffers = new Set();
  const usedPromos = new Set();
  // «Чистые карточки товаров» (по умолчанию включено; у старых настроек поля нет) — товары после модерации
  const goodsSrc = setup.moderated !== false && catalog.goodsModerated.length ? catalog.goodsModerated : catalog.goods;
  // Доли категорий — это интерес: по ним делятся и товары, и офферы с промокодами.
  // Доля товаров (ползунок «Товары или офферы») держится во всей ленте точно.
  // полками — кратно 4, чтобы не было полок из одной-двух карточек
  const step = setup.mode !== 'mixed' ? 4 : 1;
  const cats = Object.keys(setup.weights).filter((cat) => setup.weights[cat] > 0);
  const weights = { ...setup.weights };
  // «Шопинг» — родитель товарных категорий, в настройке его нет: его офферы добирают
  // офферов одежде, технике и остальным товарным — с их суммарной долей
  const goodsWeight = cats.filter((c) => c !== 'food' && goodsSrc.some((g) => g.id === c && g.products.length))
    .reduce((sum, c) => sum + weights[c], 0);
  if (goodsWeight && !('shopping' in weights) && catalog.getCategory('shopping')) {
    cats.push('shopping');
    weights.shopping = goodsWeight;
  }
  // «Случайный подбор»: внутри категории офферы, промокоды и товары перемешаны — доли и места
  // в ленте те же, но какой именно оффер или товар туда попадёт, каждый раз другой
  const mix = (list) => {
    if (!setup.random) return list;
    const out = [...list];
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  };
  // товары категории — один раз в одном порядке: из него берутся и лента, и «всё для категории»
  const goodsOrder = new Map();
  const goodsOf = (cat) => {
    if (!goodsOrder.has(cat)) goodsOrder.set(cat, mix(goodsSrc.find((g) => g.id === cat)?.products || []));
    return goodsOrder.get(cat);
  };
  const pools = {};
  for (const cat of cats) {
    // у еды своих товаров в tovarka нет — берём продукты из магазина; тумблер «Продукты в ленте» выключен
    // (по умолчанию, у старых настроек поля нет) — их нет, остаются в полке доставки
    // GROCERY_CARDS выключен — отдельных продуктов в ленте нет вовсе, только полки
    const goods = cat === 'food' ? (!GROCERY_CARDS || setup.hideGrocery !== false ? [] : mix(catalog.grocery).map(groceryAsGoods)) : goodsOf(cat);
    const offers = mix([
      ...catalog.offersInCategory(cat).filter((o) => o && byOffer.has(o.id) && !usedOffers.has(o.id)).map((o) => {
        usedOffers.add(o.id);
        return byOffer.get(o.id);
      }),
      ...promos.filter((p) => p.dataset.cat === cat && !usedPromos.has(p)).map((p) => { usedPromos.add(p); return p; }),
    ]);
    pools[cat] = { goods, offers };
  }
  // В ленту идут все офферы и промокоды выбранных категорий, товары — вперемешку с ними по доле;
  // когда офферы кончились — дальше одни товары (хвост ленты): минимум TAIL_GOODS и до CUSTOM_TOTAL
  const sum = (counts) => Object.values(counts).reduce((a, b) => a + b, 0);
  const offerCaps = Object.fromEntries(cats.map((c) => [c, pools[c].offers.length]));
  const offerCounts = setup.goods >= 100 ? {} : allocate(sum(offerCaps), weights, offerCaps, step);
  const offerSum = sum(offerCounts);
  const goodsTarget = setup.goods >= 100 ? CUSTOM_TOTAL : Math.round((offerSum * setup.goods) / (100 - setup.goods));
  const goodsCounts = allocate(goodsTarget, weights, Object.fromEntries(cats.map((c) => [c, pools[c].goods.length])), step);
  const tailTarget = setup.goods > 0 && setup.goods < 100 ? Math.max(TAIL_GOODS, CUSTOM_TOTAL - offerSum - sum(goodsCounts)) : 0;
  const tailCounts = allocate(tailTarget, weights,
    Object.fromEntries(cats.map((c) => [c, pools[c].goods.length - (goodsCounts[c] || 0)])), step);
  const toCard = (cat) => (p) => {
    const card = goodsCard(p);
    card.dataset.cat = cat;
    // большие карточки — во всю ширину ленты; продукты еды всегда маленькие
    if (setup.bigGoods && cat !== 'food') card.classList.add('is-big');
    // продукты — квадратное фото, как на полке «Вы уже заказывали»
    if (cat === 'food') card.classList.add('is-square');
    return card;
  };
  const plan = {};
  for (const cat of cats) {
    const g = goodsCounts[cat] || 0;
    const o = offerCounts[cat] || 0;
    const t = tailCounts[cat] || 0;
    if (!g && !o && !t) continue;
    plan[cat] = {
      offers: pools[cat].offers.slice(0, o),
      goods: pools[cat].goods.slice(0, g).map(toCard(cat)),
      tail: pools[cat].goods.slice(g, g + t).map(toCard(cat)),
    };
  }
  // «Продукты в ленте» выключен: во всей ленте продуктов нет, но в категории «Еда» они идут
  // вперемешку с её офферами — с той же долей товаров (карточки с data-only="food")
  if (GROCERY_CARDS && setup.hideGrocery !== false && plan.food?.offers.length && setup.goods < 100) {
    const want = Math.round((plan.food.offers.length * setup.goods) / (100 - setup.goods));
    const n = Math.floor(Math.min(catalog.grocery.length, Math.max(step, want)) / step) * step;
    plan.food.goods.push(...catalog.grocery.slice(0, n).map((p) => {
      const card = goodsCard(groceryAsGoods(p));
      card.classList.add('is-square');
      Object.assign(card.dataset, { cat: 'food', only: 'food' });
      return card;
    }));
  }
  // офферы, что не попали в ленту, — назад в общий список (их карточки больше нигде не стоят)
  for (const [cat, { offers }] of Object.entries(plan)) for (const c of offers) c.dataset.cat ||= cat;

  // Доли из «Чего показывать больше» — только для всей ленты. В категории ограничений нет:
  // всё, что не попало в общую ленту (офферы, промокоды, товары — и у категорий с долей 0),
  // идёт в конец ленты с data-only — во всей ленте скрыто, в своей категории видно
  const rest = {};
  for (const { id: cat } of NAV) {
    const offers = [
      ...catalog.offersInCategory(cat).filter((o) => o && byOffer.has(o.id) && !usedOffers.has(o.id)).map((o) => {
        usedOffers.add(o.id);
        return byOffer.get(o.id);
      }),
      ...promos.filter((p) => p.dataset.cat === cat && !usedPromos.has(p)).map((p) => { usedPromos.add(p); return p; }),
    ];
    // товары лежат по порядку: в ленту ушли первые (по доле и хвост), остальные — сюда
    const all = cat === 'food' ? [] : goodsOf(cat);
    const used = plan[cat] ? [...plan[cat].goods, ...plan[cat].tail].filter((c) => !c.dataset.only).length : 0;
    const goods = all.slice(used).map(toCard(cat));
    if (!offers.length && !goods.length) continue;
    const kinds = interleave({ goods: goods.length, offers: offers.length });
    let gi = 0;
    let oi = 0;
    rest[cat] = kinds.map((k) => (k === 'goods' ? goods[gi++] : offers[oi++]));
    for (const c of rest[cat]) Object.assign(c.dataset, { cat, only: cat });
  }

  if (setup.mode === 'mixed') {
    // сплошная сетка без заголовков: категории перемешаны по долям, внутри — офферы и товары по доле
    const perCat = {};
    for (const [cat, { offers, goods }] of Object.entries(plan)) {
      const kinds = interleave({ goods: goods.length, offers: offers.length });
      let gi = 0;
      let oi = 0;
      perCat[cat] = kinds.map((k) => (k === 'goods' ? goods[gi++] : offers[oi++]));
    }
    const order = interleave(Object.fromEntries(Object.entries(perCat).map(([c, l]) => [c, l.length])));
    const taken = {};
    let items = order.map((c) => perCat[c][(taken[c] = (taken[c] || 0) + 1) - 1]);
    // офферы кончились — дальше одни товары, категории так же чередуются по долям
    const tailOrder = interleave(Object.fromEntries(Object.entries(plan).map(([c, { tail }]) => [c, tail.length])));
    const tailTaken = {};
    items.push(...tailOrder.map((c) => plan[c].tail[(tailTaken[c] = (tailTaken[c] || 0) + 1) - 1]));
    // стирашки — на место офферов и промокодов, равномерно по ленте; у каждой своя категория
    // (того оффера, чьё место она заняла), чтобы в отфильтрованной ленте была максимум одна
    const offerIdx = items.map((x, i) => (x.classList.contains('goods') ? -1 : i)).filter((i) => i >= 0);
    const stepI = offerIdx.length / (scratches.length + 1);
    const scratchCats = new Set();
    scratches.forEach((sc, i) => {
      let k = Math.min(offerIdx.length - 1, Math.round(stepI * (i + 1)));
      while (k < offerIdx.length - 1 && scratchCats.has(items[offerIdx[k]].dataset.cat)) k++;
      const at = offerIdx[k];
      if (at == null || scratchCats.has(items[at].dataset.cat)) return sc.remove();
      scratchCats.add(items[at].dataset.cat);
      sc.dataset.cat = items[at].dataset.cat;
      items[at] = sc;
    });
    // рекламные баннеры — между карточками, равномерно по ленте (карточки не заменяют)
    const banners = pickBanners(catalog, setup).slice(0, Math.floor(items.length / BANNER_EVERY));
    const stepB = items.length / (banners.length + 1);
    banners.forEach((b, i) => items.splice(Math.round(stepB * (i + 1)) + i, 0, bannerCard(b)));
    // остальное по категориям — в самый конец (во всей ленте скрыто, места не занимает)
    items.push(...Object.values(rest).flat());
    if (setup.bigGoods) items = pairUp(items);
    // путешествия, афиша, доставка — отдельными блоками во всю ширину; в ровной сетке — только после
    // целого ряда (колонки над блоком выравнивает balanceFeed уже по настоящим высотам).
    // Место — доля видимой ленты: скрытое «только для категории» в конце не считается
    const base = items.filter((x) => !x.dataset.only).length;
    specials.forEach((sp, n) => {
      let at = Math.round(base * sp.at) + n;
      const rowEnd = (i) => {
        let smalls = 0;
        for (let j = i - 1; j >= 0 && !items[j].classList.contains('is-big'); j--) smalls++;
        return smalls % 2 === 0;
      };
      if (setup.bigGoods) while (at < items.length && !rowEnd(at)) at++;
      sp.el.classList.add('is-special');
      items.splice(at, 0, sp.el);
    });
    // как Pinterest: две независимые колонки, карточки по очереди слева и справа —
    // разная высота офферов и товаров даёт неровные ряды, порядок чтения сохраняется
    // большая карточка разрывает колонки: до неё — свой блок колонок, она сама — во всю ширину
    const blocks = [];
    let cols = null;
    let n = 0;
    for (const item of items) {
      if (item.classList.contains('is-special')) {
        blocks.push(item);
        cols = null;
        continue;
      }
      if (item.classList.contains('is-big')) {
        blocks.push(h('div', { class: 'masonry-wide' }, item));
        cols = null;
        continue;
      }
      // с большими карточками ряды ровные (обычная сетка), без них — колонки как в Pinterest
      if (!cols) {
        if (setup.bigGoods) {
          const grid = h('div', { class: 'grid' });
          cols = [grid, grid];
          blocks.push(grid);
        } else {
          cols = [h('div', { class: 'masonry-col' }), h('div', { class: 'masonry-col' })];
          blocks.push(h('div', { class: 'masonry' }, cols));
        }
        n = 0;
      }
      cols[n++ % 2].append(item);
    }
    const section = h('section', { class: 'shelf shelf-mixed', dataset: { cat: 'mix' } }, blocks);
    // продукты «только для Еды» во всей ленте скрыты
    for (const el of section.querySelectorAll('[data-only]')) el.hidden = true;
    // после фильтра по категории колонки раскладываются заново: в категории — без переносов
    // между блоками, во всей ленте — как при первой раскладке
    section.rebalance = (all) => {
      if (setup.bigGoods) return;
      const masonries = [...section.querySelectorAll(':scope > .masonry')];
      if (all) {
        // карточки возвращаются в свои блоки (часть была слита в соседний) — иначе их не измерить
        masonries.forEach((m) => { m.hidden = false; m.firstElementChild.replaceChildren(...masonryItems(m)); });
        balanceFeed(section);
        return;
      }
      // в категории широкие блоки чужих категорий скрыты — соседние колонки сливаются в одни,
      // иначе карточки категории стояли бы по одной-две в разных блоках
      const heights = new Map(masonries.flatMap((m) => masonryItems(m)).map((el) => [el, el.getBoundingClientRect().height]));
      const groups = [];
      let group = null;
      for (const b of section.children) {
        if (b.classList.contains('masonry')) (group ||= groups[groups.push([]) - 1]).push(b);
        else if (!b.hidden) group = null;
      }
      // все карточки группы остаются на странице (скрытые места не занимают) — фильтр их находит
      const lists = groups.map((g) => g.flatMap((m) => masonryItems(m)));
      groups.forEach(([first, ...rest], i) => {
        const items = lists[i];
        const next = lists[i + 1];
        // как во всей ленте: не сошлись колонки над широким блоком — до 3 видимых карточек переезжают под него
        const moved = [];
        let best = { k: 0, diff: balanceColumns(first, heights, items) };
        for (let k = 1; k <= 3 && next && best.diff > 40 && items.length > 2; k++) {
          let x;
          do { x = items.pop(); moved.unshift(x); } while (x.hidden && items.length);
          const diff = balanceColumns(first, heights, items);
          if (diff < best.diff) best = { k: moved.length, diff };
        }
        while (moved.length > best.k) items.push(moved.shift());
        if (next) next.unshift(...moved);
        balanceColumns(first, heights, items);
        first.hidden = !items.some((el) => !el.hidden);
        for (const m of rest) { [...m.children].forEach((c) => c.replaceChildren()); m.hidden = true; }
      });
    };
    // высоты карточек известны только на экране: раскладываем колонки, когда лента получила размер
    if (!setup.bigGoods) {
      let width = 0;
      new ResizeObserver(([e]) => {
        if (!e.contentRect.width || e.contentRect.width === width) return;
        width = e.contentRect.width;
        balanceFeed(section);
      }).observe(section);
    }
    return [section];
  }

  // полками: у каждой категории полки по 4 — офферные и товарные вперемешку по доле;
  // категории чередуются по долям, чтобы 70% электроники не шли одной пачкой
  const perCat = {};
  for (const [cat, { offers, goods }] of Object.entries(plan)) {
    const title = catalog.getCategory(cat)?.title || GOODS_TITLES[cat] || 'Подборка';
    const offerShelves = chunk(offers, 4).map((list, i) => h('section', { class: 'shelf', dataset: { cat } },
      cardHeader({ title: i ? `Ещё: ${title.toLowerCase()}` : title, subtitle: 'Кэшбэк у партнёров', link: 'Все', onLink }),
      h('div', { class: 'grid' }, list)));
    // большие карточки — по две в полке: больше двух товаров подряд не идёт
    // полка из продуктов «только для Еды» во всей ленте не показывается (data-only, как у «Товаров с кэшбэком»)
    const goodsShelves = chunk(goods, goods[0]?.classList.contains('is-big') ? 2 : 4).map((list, i) => {
      const only = list.every((c) => c.dataset.only) ? list[0].dataset.only : null;
      return h('section', { class: 'shelf shelf-goods', hidden: !!only, dataset: { cat, goods: 'true', ...(only ? { only } : {}) } },
      cardHeader({ title: i ? `Ещё товары: ${title.toLowerCase()}` : GOODS_TITLES[cat] || `Товары: ${title.toLowerCase()}`, subtitle: 'Предложения выбранных брендов', link: 'Все', onLink }),
      h('div', { class: 'grid' }, list));
    });
    const kinds = interleave({ goods: goodsShelves.length, offers: offerShelves.length });
    let gi = 0;
    let oi = 0;
    perCat[cat] = kinds.map((k) => (k === 'goods' ? goodsShelves[gi++] : offerShelves[oi++]));
  }
  const order = interleave(Object.fromEntries(Object.entries(perCat).map(([c, l]) => [c, l.length])));
  const taken = {};
  const shelves = order.map((c) => perCat[c][(taken[c] = (taken[c] || 0) + 1) - 1]);
  // офферы кончились — дальше одни товарные полки, категории чередуются по долям
  const tailShelves = {};
  for (const [cat, { goods, tail }] of Object.entries(plan)) {
    const title = catalog.getCategory(cat)?.title || GOODS_TITLES[cat] || 'Подборка';
    // первая товарная полка категории — с её названием, следующие — «Ещё товары: …»
    tailShelves[cat] = chunk(tail, tail[0]?.classList.contains('is-big') ? 2 : 4).map((list, i) => h('section', { class: 'shelf shelf-goods', dataset: { cat, goods: 'true' } },
      cardHeader({ title: goods.length || i ? `Ещё товары: ${title.toLowerCase()}` : GOODS_TITLES[cat] || `Товары: ${title.toLowerCase()}`, subtitle: 'Предложения выбранных брендов', link: 'Все', onLink }),
      h('div', { class: 'grid' }, list)));
  }
  const tailOrder = interleave(Object.fromEntries(Object.entries(tailShelves).map(([c, l]) => [c, l.length])));
  const tailTaken = {};
  shelves.push(...tailOrder.map((c) => tailShelves[c][(tailTaken[c] = (tailTaken[c] || 0) + 1) - 1]));
  // путешествия и афиша между полками; товарная полка не встаёт прямо над «Путешествиями»
  for (const sp of specials.slice().reverse()) {
    let at = Math.round(shelves.length * sp.at);
    while (sp.el.dataset.cat === 'travel' && at < shelves.length && shelves[at - 1]?.dataset.goods) at++;
    shelves.splice(at, 0, sp.el);
  }
  // стирашки — по одной в разные офферные полки, каждый раз на другое место в полке;
  // полки разных категорий — в отфильтрованной ленте стирашка максимум одна
  const offerShelves = shelves.filter((sh) => !sh.dataset.goods && sh.querySelector('.grid'));
  const stepS = offerShelves.length / (scratches.length + 1);
  const scratchCats = new Set();
  scratches.forEach((sc, i) => {
    let k = Math.min(offerShelves.length - 1, Math.round(stepS * (i + 1)));
    while (k < offerShelves.length - 1 && scratchCats.has(offerShelves[k].dataset.cat)) k++;
    const sh = offerShelves[k];
    if (!sh || scratchCats.has(sh.dataset.cat)) return sc.remove();
    scratchCats.add(sh.dataset.cat);
    sc.dataset.cat = sh.dataset.cat;
    const cards = sh ? [...sh.querySelector('.grid').children] : [];
    cards[[1, 3, 0, 2][i % 4] % (cards.length || 1)]?.replaceWith(sc);
  });
  // рекламные баннеры — в офферные полки своей категории, по одному на полку, вместо оффера;
  // баннеры вне категорий настройки (продукты банка, связь) в ленте полками не ставим
  const freeShelves = offerShelves.filter((sh) => !sh.querySelector('.scard'));
  for (const b of pickBanners(catalog, setup)) {
    const sh = freeShelves.find((x) => x.dataset.cat === b.category);
    if (!sh) continue;
    freeShelves.splice(freeShelves.indexOf(sh), 1);
    const cards = [...sh.querySelector('.grid').children];
    cards[Math.min(2, cards.length - 1)]?.replaceWith(bannerCard(b));
  }
  // остальное по категориям — полками в конце, только для своей категории (data-only)
  for (const [cat, list] of Object.entries(rest)) {
    const title = catalog.getCategory(cat)?.title || GOODS_TITLES[cat] || NAV.find((n) => n.id === cat)?.label || 'Подборка';
    chunk(list, 4).forEach((part, i) => shelves.push(h('section', { class: 'shelf', hidden: true, dataset: { cat, only: cat } },
      cardHeader({ title: i ? `Ещё: ${title.toLowerCase()}` : `Всё: ${title.toLowerCase()}`, subtitle: 'Кэшбэк у партнёров', link: 'Все', onLink }),
      h('div', { class: 'grid' }, part))));
  }
  return shelves;
}

const AFISHA = [
  { img: 'assets/img/afisha/basta.jpg', category: 'Хип-хоп', title: 'Баста', place: 'ОК «Лужники», Большая арена', date: '30 ноября', price: 'От 4 850 ₽', cashback: 'До 20%' },
  { img: 'assets/img/afisha/madam-boom.jpg', category: 'Шоу', title: 'Бурлеск кабаре шоу МАДАМ БУМ', place: 'Гримёрка Gastro Club & Karaoke Bar', date: '4 декабря', price: 'От 4 500 ₽', cashback: 'До 20%' },
  { img: 'assets/img/afisha/lazarev.jpg', category: 'Поп', title: 'Сергей Лазарев. Шоумен', place: 'На 3 площадках', date: '23 ноября', price: 'От 12 000 ₽', cashback: 'До 35%' },
  { img: 'assets/img/afisha/vernuvshiesya.jpg', category: 'Иммерсивный', title: 'Вернувшиеся: Новая реальность', place: 'Особняк «Дашков 5»', date: '3 декабря', price: 'От 8 000 ₽', cashback: 'До 20%' },
  { img: 'assets/img/afisha/savicheva.jpg', category: 'Поп', title: 'Юлия Савичева', place: 'Petter — Петровка, 21, стр. 1', date: '7 декабря', price: 'От 5 500 ₽', cashback: 'До 10%' },
  { img: 'assets/img/afisha/rock-hits.jpg', category: 'Рок', title: 'Рок-хиты с симфоническим оркестром', place: 'На 3 площадках', date: '10 декабря', price: 'От 4 500 ₽', cashback: 'До 15%' },
  { img: 'assets/img/afisha/orlov.jpg', category: 'Стендап', title: 'Сергей Орлов «Звезда»', place: 'ЦСКА Арена', date: '28 ноября', price: 'От 4 000 ₽', cashback: 'До 25%' },
  { img: 'assets/img/afisha/enrique-iglesias.jpg', category: 'Поп', title: 'Enrique Iglesias', place: 'Астана Арена', date: '5 декабря', price: 'От 9 400 ₽', cashback: 'До 15%' },
];

/* Собирает полки из уже отрисованных карточек ленты: узлы переезжают, поэтому галочки
   «просмотрено», лайки и стёртые скретч-карточки сохраняются. */
// custom — настройка ленты из сценария 07 (store.state.feedSetup): тогда лента собирается не по LAYOUT,
// а по долям категорий и товаров, полками или сплошной сеткой (customParts)
export function buildShelves({ catalog, cards, scratches, promos = [], goods = false, custom = null, onLink }) {
  const byOffer = new Map(cards.map((c) => [c.dataset.offer, c]));
  const used = new Set();
  const take = (cat, match, n) => {
    const out = [];
    for (const o of catalog.offersInCategory(cat)) {
      if (out.length >= n) break;
      if (!o || used.has(o.id) || !byOffer.has(o.id)) continue;
      if (match && !match.test(o.name)) continue;
      used.add(o.id);
      out.push(byOffer.get(o.id));
    }
    return out;
  };

  // промокоды по категориям: в полке без стирашки один оффер уступает место промокоду
  const promoPool = [...promos];
  const takePromo = (cat) => {
    const at = promoPool.findIndex((p) => p.dataset.cat === cat);
    return at < 0 ? null : promoPool.splice(at, 1)[0];
  };

  const extras = [];
  const parts = [];
  const afterTravel = [];
  if (custom) parts.push(...customParts({ catalog, byOffer, promos: promoPool, scratches, extras, setup: custom, onLink }));
  else {
    LAYOUT.forEach((s, i) => {
      if (s.kind === 'promos') {
        // отдельная полка промокодов — из тех, что не разошлись по категориям раньше
        const list = promoPool.splice(0, 4);
        if (list.length) {
          parts.push(h('section', { class: 'shelf', dataset: { cat: 'mix' } },
            cardHeader({ title: s.title, subtitle: s.sub, link: 'Все', onLink }), h('div', { class: 'grid' }, list)));
        }
        return;
      }
      if (s.kind === 'products') {
        const list = catalog.products.filter((p) => FOOD_PRODUCTS.includes(p.id));
        if (list.length) {
          parts.push(h('section', { class: 'shelf shelf-products', hidden: true, dataset: { cat: s.only, only: s.only } },
            cardHeader({ title: 'Товары с кэшбэком', link: 'Все', onLink }),
            h('div', { class: 'hscroll' }, list.map((p) => productCard(p)))));
        }
        return;
      }
      if (s.kind === 'goods') {
        if (!goods) return;
        // товарная полка не встаёт прямо над «Путешествиями» со слайдером — переезжает под них
        const into = LAYOUT[i + 1]?.kind === 'travel' ? afterTravel : parts;
        const list = catalog.goods.find((g) => g.id === s.cat)?.products || [];
        for (let n = 0; n < GOODS_SHELVES && n * 4 < list.length; n++) {
          const shelf = h('section', { class: 'shelf shelf-goods', dataset: n ? { cat: s.cat, goods: 'true', more: 'true' } : { cat: s.cat, goods: 'true' } },
            n ? null : cardHeader({ title: GOODS_TITLES[s.cat] || 'Товары', subtitle: 'Предложения выбранных брендов', link: 'Все', onLink }),
            h('div', { class: 'grid' }, list.slice(n * 4, n * 4 + 4).map((p) => goodsCard(p))));
          // продолжение полки — только внутри категории
          if (n) shelf.hidden = true;
          into.push(shelf);
        }
        return;
      }
      if (s.kind === 'grocery') {
        const g = groceryShelf({ catalog, onLink });
        if (g) parts.push(g);
        return;
      }
      if (s.kind === 'gorod') {
        parts.push(gorodShelf({ catalog, onLink }));
        return;
      }
      if (s.kind === 'travel') {
        const t = travelShelf({ items: TRAVEL });
        t.dataset.cat = 'travel';
        extras.push(t);
        parts.push(t, ...afterTravel.splice(0));
        return;
      }
      if (s.kind === 'afisha') {
        const a = afishaShelf({ items: AFISHA });
        a.querySelector('.fc-all-link').addEventListener('click', onLink);
        a.dataset.cat = 'fun';
        extras.push(a);
        parts.push(a);
        return;
      }
      const scratch = s.scratch != null ? scratches[s.scratch] : null;
      const promo = scratch || s.promo === false ? null : takePromo(s.cat);
      const offers = take(s.cat, s.match, scratch || promo ? 3 : 4);
      if (!offers.length) { if (promo) promoPool.unshift(promo); return; }
      // промокод — в другом ряду и колонке, чем стирашки, чтобы не стоять всегда в одном месте
      if (promo) {
        let at = [1, 2, 0][i % 3] % (offers.length + 1);
        if (LAYOUT[i + 1]?.kind === 'travel' && at >= 2) at = 1;
        offers.splice(at, 0, promo);
      }
      // скретч-карточка встаёт в разные места полки, чтобы лента не была однообразной;
      // но не в нижний ряд над путешествиями — иначе стирашка стоит вплотную к билету
      if (scratch) {
        let at = [3, 1, 2][i % 3] % (offers.length + 1);
        if (LAYOUT[i + 1]?.kind === 'travel' && at >= 2) at = 1;
        offers.splice(at, 0, scratch);
      }
      parts.push(h('section', { class: 'shelf', dataset: { cat: s.cat } },
        cardHeader({ title: s.title, subtitle: s.sub, link: 'Все', onLink }),
        h('div', { class: 'grid' }, offers)));
    });

    // что не попало в полки — дальше теми же полками по 4: сначала полные по категориям,
    // а одиночные остатки разных категорий — общими полками «Ещё для вас»
    const shelf = (title, sub, list, cat) => parts.push(h('section', { class: 'shelf', dataset: { cat } },
      cardHeader({ title, subtitle: sub, link: 'Все', onLink }), h('div', { class: 'grid' }, list)));
    for (const cat of catalog.categories) {
      const left = catalog.offersInCategory(cat.id).filter((o) => o && !used.has(o.id) && byOffer.has(o.id));
      for (let n = Math.floor(left.length / 4); n > 0; n--) shelf(cat.title, 'Ещё предложения с кэшбэком', take(cat.id, null, 4), cat.id);
    }
    const rest = cards.filter((c) => !used.has(c.dataset.offer));
    for (let i = 0; i < rest.length; i += 4) shelf('Ещё для вас', 'Подобрали по вашим покупкам', rest.slice(i, i + 4), 'mix');
    for (let i = 0; i < promoPool.length; i += 4) shelf('Ещё промокоды', 'Скидки по коду у партнёров', promoPool.slice(i, i + 4), 'mix');
  }

  const root = h('div', { class: 'shelves', dataset: { tourCards: 'selection' } }, parts);

  // ---------- Навигация по категориям (макет 654:145600): плитка-иллюстрация и подпись ----------
  // Тап оставляет в ленте только полки категории, повторный тап — снова вся лента.
  const catOf = new Map();
  for (const c of catalog.categories) for (const id of c.offerIds) catOf.set(id, c.id);
  // в 07 — плитки (NAV_LOOK), в остальных сценариях прежние иллюстрации
  const tiles = !!custom && NAV_LOOK === 'tiles';
  const navItems = NAV.filter((n) => catalog.getCategory(n.id)).map((n) => {
    const el = button({ class: 'feed-nav-item', role: 'tab', 'aria-selected': 'false', dataset: { cat: n.id } },
      tiles ? navTile(n.id) : h('span', { class: 'feed-nav-pic' }, img(n.img, { cls: 'feed-nav-img', alt: '', width: 105, height: 100, lazy: false })),
      h('span', { class: 'feed-nav-label' }, (tiles && NAV_TILES[n.id]?.label) || n.label));
    el.addEventListener('click', () => select(current === n.id ? 'all' : n.id));
    return el;
  });
  const chipsBar = h('div', { class: `feed-nav ${tiles ? 'is-tiles' : ''}`, role: 'tablist', 'aria-label': 'Категории ленты' }, navItems);
  let current = 'all';

  // ---------- Чипсы в шапке (07): навигация уехала под апп-бар — сверху появляется строка чипсов ----------
  // Липкий слой высотой со строку чипсов, поднятый на ту же высоту (отрицательный отступ, место в потоке — ноль):
  // лежит поверх низа навигации и прилипает к апп-бару, когда навигация уходит под него; лента не сдвигается.
  // Чипсы и плитки выбирают одно и то же.
  const chips = custom ? [{ id: 'all', label: 'Все' }, ...NAV.filter((n) => catalog.getCategory(n.id)).map((n) => ({ id: n.id, label: NAV_TILES[n.id]?.label || n.label }))].map((c) => {
    const el = button({ class: `chip chip-m ${c.id === 'all' ? 'is-active' : ''}`, dataset: { cat: c.id } }, h('span', { class: 'chip-text' }, c.label));
    el.addEventListener('click', () => select(c.id, { fromChips: true }));
    return el;
  }) : [];
  const chipsScroll = h('div', { class: 'chips-scroll' }, h('div', { class: 'chips-line' }, chips));
  const chipsTop = custom ? h('div', { class: 'feed-chips' }, h('div', { class: 'feed-chips-bar' }, chipsScroll)) : null;
  const CHIPS_DELAY = 30;
  let chipsShown = false;
  // после тапа по чипсу задержки нет: лента встаёт под строку чипсов целиком, чипсы остаются;
  // как только навигация снова видна — обычный режим
  let chipsPinned = false;
  function syncChips() {
    if (!chipsTop || !pageEl) return;
    // слой ниже на CHIPS_DELAY: чипсы появляются, когда ленту прокрутили ещё на столько после ухода навигации
    const lift = chipsTop.firstChild.offsetHeight - (chipsPinned ? 0 : CHIPS_DELAY);
    chipsTop.style.height = `${lift}px`;
    chipsTop.style.marginTop = `${-lift}px`;
    const appbarBottom = pageEl.getBoundingClientRect().top + parseFloat(getComputedStyle(pageEl).paddingTop);
    const show = chipsBar.getBoundingClientRect().bottom <= appbarBottom + lift + 1;
    if (!show && chipsPinned) {
      chipsPinned = false;
      syncChips();
      return;
    }
    if (show === chipsShown) return;
    chipsShown = show;
    chipsTop.classList.toggle('is-shown', show);
  }

  let pageEl = null;
  function select(id, { fromChips = false } = {}) {
    if (id === current) return;
    current = id;
    haptics.selection();
    chipsBar.classList.toggle('has-active', id !== 'all');
    for (const el of navItems) {
      const on = el.dataset.cat === id;
      el.classList.toggle('is-active', on);
      el.setAttribute('aria-selected', String(on));
    }
    for (const el of chips) {
      const on = el.dataset.cat === id;
      el.classList.toggle('is-active', on);
      // выбранный чипс — в видимую часть строки
      if (on) chipsScroll.scrollTo({ left: el.offsetLeft - (chipsScroll.clientWidth - el.offsetWidth) / 2, behavior: 'smooth' });
    }
    // у категории есть свои полки — показываем их; если своих нет (спорт, связь),
    // показываем её карточки из сборных полок «Ещё для вас»
    const own = parts.some((p) => p.dataset.cat === id && !p.dataset.goods);
    const shown = [];
    for (const part of parts) {
      if (part.dataset.cat === 'mix') {
        let any = false;
        for (const card of part.querySelectorAll('.ocard, .promo, .goods, .banner')) {
          // data-only — карточка только для своей категории (продукты в «Еде»)
          const ok = id === 'all' ? !card.dataset.only : !own && (card.dataset.cat || catOf.get(card.dataset.offer)) === id;
          card.hidden = !ok;
          any ||= ok;
        }
        // стирашка сплошной ленты 07 — только в своей категории (у каждой категории их не больше одной)
        for (const sc of part.querySelectorAll('.scard[data-cat]')) {
          sc.hidden = !(id === 'all' || sc.dataset.cat === id);
          any ||= !sc.hidden;
        }
        // широкие блоки сплошной ленты (доставка, путешествия, афиша) — только в своей категории
        for (const sp of part.querySelectorAll(':scope > .is-special')) {
          sp.hidden = !(id === 'all' || sp.dataset.cat === id);
          any ||= !sp.hidden;
        }
        part.hidden = !any;
        part.rebalance?.(id === 'all');
      } else {
        // полка «только для категории» во всей ленте не показывается
        if (part.dataset.only) part.hidden = part.dataset.only !== id;
        // товары: во всей ленте — первая полка категории, в своей категории и в «Шопинге» — все
        else if (part.dataset.goods) part.hidden = id === 'all' ? !!part.dataset.more : !(part.dataset.cat === id || id === 'shopping');
        else part.hidden = !(id === 'all' || part.dataset.cat === id);
      }
      if (!part.hidden) shown.push(part);
    }
    // интерактивная полка (путешествия, афиша) не встаёт первой: в категории она идёт второй
    for (const part of parts) part.style.order = '';
    const interactive = (el) => el?.classList.contains('fc-trip') || el?.classList.contains('fc-hero');
    if (id !== 'all' && interactive(shown[0]) && shown[1]) {
      shown.forEach((el, i) => { el.style.order = String(i); });
      shown[0].style.order = '1';
      shown[1].style.order = '0';
      [shown[0], shown[1]] = [shown[1], shown[0]];
    }
    // билет прижат к соседям отрицательным отступом — первым под навигацией ему нужен обычный
    root.classList.toggle('starts-with-trip', !!shown[0]?.classList.contains('fc-trip'));
    // лента встаёт к навигации, видимые полки проявляются по очереди
    if (pageEl && fromChips) {
      // из чипсов — к началу ленты под строкой чипсов, чтобы они остались на экране
      const pad = parseFloat(getComputedStyle(pageEl).paddingTop) + chipsTop.firstChild.offsetHeight;
      const y = root.getBoundingClientRect().top - pageEl.getBoundingClientRect().top + pageEl.scrollTop - pad;
      chipsPinned = true;
      if (pageEl.scrollTop > y) pageEl.scrollTo({ top: Math.max(0, y), behavior: 'auto' });
      syncChips();
    } else if (pageEl) {
      // по заголовку «Лента выгоды», а не по блоку: над ним отступ 32px, и из-под шапки торчала тень блока выше
      const title = head.querySelector('.feed-head-title');
      const y = title.getBoundingClientRect().top - pageEl.getBoundingClientRect().top + pageEl.scrollTop - parseFloat(getComputedStyle(pageEl).paddingTop) - 4;
      if (pageEl.scrollTop > y) pageEl.scrollTo({ top: Math.max(0, y), behavior: 'auto' });
    }
    stagger(shown.slice(0, 3), fadeUpIn, { duration: 360, step: 60, easing: EASE.out });
    animate(root, [{ opacity: 0.4 }, { opacity: 1 }], { duration: 220, fill: 'none' });
  }

  // заголовок отделяет верхние блоки главной от ленты
  // лента по настройке (07) — рядом с заголовком ссылка обратно в настройку
  const tune = custom ? linkButton('Изменить', { onClick: () => app.nav.replace('/setup/s7'), cls: 'feed-head-link' }) : null;
  const head = h('div', { class: 'feed-head' },
    h('div', { class: 'feed-head-row' }, h('h2', { class: 'feed-head-title' }, 'Лента выгоды'), tune),
    h('p', { class: 'feed-head-sub' }, custom ? 'Собрана по вашей настройке' : 'Кэшбэк во всех категориях'));
  const wrap = h('div', { class: 'feed-shelves' }, head, chipsBar, chipsTop, root);
  let cleanups = [];
  wrap.mount = (page) => {
    pageEl = page;
    cleanups = extras.map((x) => x.mount(page));
    if (chipsTop) {
      let raf = 0;
      const onScroll = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(syncChips); };
      page.addEventListener('scroll', onScroll, { passive: true });
      cleanups.push(() => page.removeEventListener('scroll', onScroll));
    }
  };
  wrap.destroy = () => cleanups.forEach((fn) => fn?.());
  return wrap;
}
