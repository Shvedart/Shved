// Лента после тура сценария 03: офферы собираются в смысловые полки по 4 (или 3 + скретч-карточка),
// между ними — полки «Путешествия» и «События для вас» из прототипа афиши.

import { h, button, img, icon, iconImg } from '../core/dom.js';
import { animate, EASE, stagger, fadeUpIn } from '../core/motion.js';
import { haptics } from '../core/haptics.js';
import { cardHeader, productCard } from '../ui/components.js';
import { travelShelf, afishaShelf } from '../ui/shelves.js';
import { app } from '../app.js';

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
  { kind: 'promos', title: 'Промокоды для вас', sub: 'Скидки по коду у партнёров' },
  { kind: 'afisha' },
  { title: 'Забота о здоровье', sub: 'Анализы, аптеки и клиники', cat: 'health', scratch: 1 },
  { title: 'Одежда и обувь', sub: 'Обновите гардероб к сезону', cat: 'clothes' },
  { title: 'Украшения и часы', sub: 'Подарки себе и близким', cat: 'beauty' },
  { title: 'Кухонная техника', sub: 'Помощники для дома', cat: 'electronics', match: /tefal|polaris|delonghi|braun|kitfort/i, scratch: 2 },
  { kind: 'travel' },
  { title: 'Отели и туры', sub: 'Отдых с кэшбэком до 20%', cat: 'travel', match: /островок|travelata|onlinetours|туры|твил|травелог|яндекс|авито/i },
  { title: 'Поезда и автобусы', sub: 'Поездки по России', cat: 'travel', scratch: 4 },
  { title: 'Кино, книги и игры', sub: 'Подписки и развлечения', cat: 'fun' },
  { title: 'Гаджеты', sub: 'Смартфоны, наушники и аксессуары', cat: 'electronics' },
  { title: 'Кофе и перекусы', sub: 'Взбодриться по пути', cat: 'food', match: /кофе|coffee|бургер/i },
  { title: 'Всё для авто', sub: 'Сервис, шины и проверка машины', cat: 'auto', scratch: 3 },
  { title: 'Учёба онлайн', sub: 'Языки и курсы с кэшбэком', cat: 'education' },
  { title: 'Детям', sub: 'Игрушки, одежда и книги', cat: 'kids' },
  { title: 'Уют в доме', sub: 'Мебель и товары для ремонта', cat: 'home' },
  { title: 'Питомцам', sub: 'Корм, ветеринары и страховка', cat: 'pets' },
  { title: 'Цветы', sub: 'Букеты с доставкой', cat: 'flowers' },
  { title: 'Шопинг', sub: 'Маркетплейсы и сервисы покупок', cat: 'shopping' },
];

// навигация ленты: порядок, подписи и иллюстрации из макета 654:145600;
// crop — высота и сдвиг картинки в процентах, как в макете (часть иллюстраций выходит за плитку)
const NAV = [
  { id: 'food', label: 'Еда', img: 'assets/img/cats/food.png' },
  { id: 'travel', label: 'Путешествия', img: 'assets/img/cats/travel.png' },
  { id: 'health', label: 'Здоровье', img: 'assets/img/cats/health.png' },
  { id: 'beauty', label: 'Красота', img: 'assets/img/cats/beauty.png' },
  { id: 'electronics', label: 'Электроника и техника', img: 'assets/img/cats/electronics.png' },
  { id: 'kids', label: 'Дети', img: 'assets/img/cats/kids.png', crop: [103.83, -3.83] },
  { id: 'clothes', label: 'Одежда', img: 'assets/img/cats/clothes.png', crop: [104.11, -4.11] },
  { id: 'fun', label: 'Развлечения', img: 'assets/img/cats/fun.png', crop: [110.14, -4.35] },
  { id: 'auto', label: 'Авто', img: 'assets/img/cats/auto.png', crop: [114.46, -6.33] },
  { id: 'pets', label: 'Животные', img: 'assets/img/cats/pets.png', crop: [114.46, -6.93] },
  { id: 'home', label: 'Дом', img: 'assets/img/cats/home.png' },
  { id: 'education', label: 'Образование', img: 'assets/img/cats/education.png', crop: [113.1, -6.55] },
  { id: 'shopping', label: 'Шопинг', img: 'assets/img/cats/shopping.png', crop: [105.56, -2.75] },
  { id: 'telecom', label: 'Связь', img: 'assets/img/cats/telecom.png', crop: [106.15, -4.22] },
  { id: 'sport', label: 'Спорт', img: 'assets/img/cats/sport.png', crop: [102.7, -2.7] },
  { id: 'flowers', label: 'Цветы', img: 'assets/img/cats/flowers.png', crop: [104.4, -4.4] },
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
  const all = button({ class: 'gorod-all' }, 'Посмотреть все');
  all.addEventListener('click', () => onLink?.());
  const title = GOROD.title.flatMap((line, i) => (i ? [h('br'), line] : [line]));
  return h('section', { class: 'shelf gorod', dataset: { cat: 'food' } },
    cardHeader({ title, subtitle: GOROD.sub }),
    h('div', { class: 'gorod-grid' }, tiles),
    all);
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
  const all = button({ class: 'gorod-all' }, 'Посмотреть все');
  all.addEventListener('click', () => onLink?.());
  return h('section', { class: 'shelf grocery', dataset: { cat: 'food' } },
    h('div', { class: 'card-header grocery-head' },
      h('div', { class: 'card-header-text' }, h('p', { class: 'grocery-shop' }, GROCERY.shop), h('h2', { class: 'card-title' }, GROCERY.title)),
      img(GROCERY.avatar, { cls: 'grocery-avatar', alt: '', width: 44, height: 44 })),
    h('div', { class: 'gorod-grid grocery-grid' }, items),
    all);
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
export function buildShelves({ catalog, cards, scratches, promos = [], onLink }) {
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
      parts.push(t);
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

  const root = h('div', { class: 'shelves', dataset: { tourCards: 'selection' } }, parts);

  // ---------- Навигация по категориям (макет 654:145600): плитка-иллюстрация и подпись ----------
  // Тап оставляет в ленте только полки категории, повторный тап — снова вся лента.
  const catOf = new Map();
  for (const c of catalog.categories) for (const id of c.offerIds) catOf.set(id, c.id);
  const navItems = NAV.filter((n) => catalog.getCategory(n.id)).map((n) => {
    const el = button({ class: 'feed-nav-item', role: 'tab', 'aria-selected': 'false', dataset: { cat: n.id } },
      h('span', { class: 'feed-nav-pic' }, img(n.img, { cls: 'feed-nav-img', alt: '', width: 105, height: 100, lazy: false })),
      h('span', { class: 'feed-nav-label' }, n.label));
    if (n.crop) Object.assign(el.querySelector('.feed-nav-img').style, { height: `${n.crop[0]}%`, top: `${n.crop[1]}%`, objectFit: 'fill' });
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
    const own = parts.some((p) => p.dataset.cat === id);
    const shown = [];
    for (const part of parts) {
      if (part.dataset.cat === 'mix') {
        let any = false;
        for (const card of part.querySelectorAll('.ocard, .promo')) {
          const ok = id === 'all' || (!own && (card.dataset.cat || catOf.get(card.dataset.offer)) === id);
          card.hidden = !ok;
          any ||= ok;
        }
        part.hidden = !any;
      } else {
        // полка «только для категории» во всей ленте не показывается
        part.hidden = part.dataset.only ? part.dataset.only !== id : !(id === 'all' || part.dataset.cat === id);
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
  const head = h('div', { class: 'feed-head' },
    h('h2', { class: 'feed-head-title' }, 'Лента выгоды'),
    h('p', { class: 'feed-head-sub' }, 'Кэшбэк во всех категориях'));
  const wrap = h('div', { class: 'feed-shelves' }, head, chipsBar, root);
  let cleanups = [];
  wrap.mount = (page) => { pageEl = page; cleanups = extras.map((x) => x.mount(page)); };
  wrap.destroy = () => cleanups.forEach((fn) => fn?.());
  return wrap;
}
