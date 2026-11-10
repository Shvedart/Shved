// Лента после тура сценария 03: офферы собираются в смысловые полки по 4 (или 3 + скретч-карточка),
// между ними — полки «Путешествия» и «События для вас» из прототипа афиши.

import { h, button, img, icon, iconImg } from '../core/dom.js';
import { animate, EASE, stagger, fadeUpIn } from '../core/motion.js';
import { haptics } from '../core/haptics.js';
import { cardHeader, goodsCard, linkButton, productCard } from '../ui/components.js';
import { travelShelf, afishaShelf } from '../ui/shelves.js';
import { app } from '../app.js';
import { interleave } from '../domain/feedSetup.js';

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

function groceryShelf({ catalog, onLink }) {
  const items = catalog.grocery.slice(0, GROCERY.count).map((p) => {
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
  });
  if (!items.length) return null;
  // шапка как у других полок (заголовок, подзаголовок, «Все»), только слева — логотип магазина
  return h('section', { class: 'shelf grocery', dataset: { cat: 'food' } },
    h('div', { class: 'card-header grocery-head' },
      img(GROCERY.avatar, { cls: 'grocery-avatar', alt: '', width: 44, height: 44 }),
      h('div', { class: 'card-header-text' }, h('h2', { class: 'card-title' }, GROCERY.title), h('p', { class: 'card-subtitle' }, GROCERY.shop)),
      linkButton('Все', { onClick: onLink, cls: 'card-link' })),
    h('div', { class: 'gorod-grid grocery-grid' }, items));
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
const CUSTOM_TOTAL = 64;
const chunk = (list, n) => Array.from({ length: Math.ceil(list.length / n) }, (_, i) => list.slice(i * n, i * n + n));

function customParts({ catalog, byOffer, promos, setup, onLink }) {
  const usedOffers = new Set();
  const usedPromos = new Set();
  // по каждой категории: сколько всего, из них товаров — по доле, остальное офферы и промокоды
  const plan = {};
  for (const [cat, w] of Object.entries(setup.weights)) {
    // полками — кратно 4, чтобы не было полок из одной-двух карточек; маленькая доля может дать 0
    const shelves = setup.mode !== 'mixed';
    const n = shelves ? Math.round((CUSTOM_TOTAL * w) / 400) * 4 : Math.round((CUSTOM_TOTAL * w) / 100);
    if (!n) continue;
    const goodsPool = catalog.goods.find((g) => g.id === cat)?.products || [];
    const offerPool = [
      ...catalog.offersInCategory(cat).filter((o) => o && byOffer.has(o.id) && !usedOffers.has(o.id)).map((o) => {
        usedOffers.add(o.id);
        return byOffer.get(o.id);
      }),
      ...promos.filter((p) => p.dataset.cat === cat && !usedPromos.has(p)).map((p) => { usedPromos.add(p); return p; }),
    ];
    let g = Math.min(goodsPool.length, shelves ? Math.round((n * setup.goods) / 400) * 4 : Math.round((n * setup.goods) / 100));
    const whole = (x) => (shelves ? Math.floor(x / 4) * 4 : x);
    let o = whole(Math.min(offerPool.length, n - g));
    // не хватило одного вида — добираем другим
    if (g + o < n) g = whole(Math.min(goodsPool.length, n - o));
    if (!g && !o) continue;
    const goodsCards = goodsPool.slice(0, g).map((p) => {
      const card = goodsCard(p);
      card.dataset.cat = cat;
      return card;
    });
    plan[cat] = { offers: offerPool.slice(0, o), goods: goodsCards };
  }
  // офферы, что не попали в ленту, — назад в общий список (их карточки больше нигде не стоят)
  for (const [cat, { offers }] of Object.entries(plan)) for (const c of offers) c.dataset.cat ||= cat;

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
    const items = order.map((c) => perCat[c][(taken[c] = (taken[c] || 0) + 1) - 1]);
    // как Pinterest: две независимые колонки, карточки по очереди слева и справа —
    // разная высота офферов и товаров даёт неровные ряды, порядок чтения сохраняется
    const cols = [h('div', { class: 'masonry-col' }), h('div', { class: 'masonry-col' })];
    items.forEach((item, i) => cols[i % 2].append(item));
    return [h('section', { class: 'shelf shelf-mixed', dataset: { cat: 'mix' } }, h('div', { class: 'masonry' }, cols))];
  }

  // полками: у каждой категории полки по 4 — офферные и товарные вперемешку по доле;
  // категории чередуются по долям, чтобы 70% электроники не шли одной пачкой
  const perCat = {};
  for (const [cat, { offers, goods }] of Object.entries(plan)) {
    const title = catalog.getCategory(cat)?.title || GOODS_TITLES[cat] || 'Подборка';
    const offerShelves = chunk(offers, 4).map((list, i) => h('section', { class: 'shelf', dataset: { cat } },
      cardHeader({ title: i ? `Ещё: ${title.toLowerCase()}` : title, subtitle: 'Кэшбэк у партнёров', link: 'Все', onLink }),
      h('div', { class: 'grid' }, list)));
    const goodsShelves = chunk(goods, 4).map((list, i) => h('section', { class: 'shelf shelf-goods', dataset: { cat, goods: 'true' } },
      cardHeader({ title: i ? `Ещё товары: ${title.toLowerCase()}` : GOODS_TITLES[cat] || `Товары: ${title.toLowerCase()}`, subtitle: 'Предложения выбранных брендов', link: 'Все', onLink }),
      h('div', { class: 'grid' }, list)));
    const kinds = interleave({ goods: goodsShelves.length, offers: offerShelves.length });
    let gi = 0;
    let oi = 0;
    perCat[cat] = kinds.map((k) => (k === 'goods' ? goodsShelves[gi++] : offerShelves[oi++]));
  }
  const order = interleave(Object.fromEntries(Object.entries(perCat).map(([c, l]) => [c, l.length])));
  const taken = {};
  return order.map((c) => perCat[c][(taken[c] = (taken[c] || 0) + 1) - 1]);
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
  if (custom) parts.push(...customParts({ catalog, byOffer, promos: promoPool, setup: custom, onLink }));
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
  const navItems = NAV.filter((n) => catalog.getCategory(n.id)).map((n) => {
    const el = button({ class: 'feed-nav-item', role: 'tab', 'aria-selected': 'false', dataset: { cat: n.id } },
      h('span', { class: 'feed-nav-pic' }, img(n.img, { cls: 'feed-nav-img', alt: '', width: 105, height: 100, lazy: false })),
      h('span', { class: 'feed-nav-label' }, n.label));
    el.addEventListener('click', () => select(current === n.id ? 'all' : n.id));
    return el;
  });
  const chipsBar = h('div', { class: 'feed-nav', role: 'tablist', 'aria-label': 'Категории ленты' }, navItems);
  let current = 'all';

  let pageEl = null;
  function select(id) {
    if (id === current) return;
    current = id;
    haptics.selection();
    chipsBar.classList.toggle('has-active', id !== 'all');
    for (const el of navItems) {
      const on = el.dataset.cat === id;
      el.classList.toggle('is-active', on);
      el.setAttribute('aria-selected', String(on));
    }
    // у категории есть свои полки — показываем их; если своих нет (спорт, связь),
    // показываем её карточки из сборных полок «Ещё для вас»
    const own = parts.some((p) => p.dataset.cat === id && !p.dataset.goods);
    const shown = [];
    for (const part of parts) {
      if (part.dataset.cat === 'mix') {
        let any = false;
        for (const card of part.querySelectorAll('.ocard, .promo, .goods')) {
          const ok = id === 'all' || (!own && (card.dataset.cat || catOf.get(card.dataset.offer)) === id);
          card.hidden = !ok;
          any ||= ok;
        }
        part.hidden = !any;
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
    if (pageEl) {
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
  const wrap = h('div', { class: 'feed-shelves' }, head, chipsBar, root);
  let cleanups = [];
  wrap.mount = (page) => { pageEl = page; cleanups = extras.map((x) => x.mount(page)); };
  wrap.destroy = () => cleanups.forEach((fn) => fn?.());
  return wrap;
}
