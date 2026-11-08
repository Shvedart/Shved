// Лента после тура сценария 03: офферы собираются в смысловые полки по 4 (или 3 + скретч-карточка),
// между ними — полки «Путешествия» и «События для вас» из прототипа афиши.

import { h, button, img } from '../core/dom.js';
import { animate, EASE, stagger, fadeUpIn } from '../core/motion.js';
import { haptics } from '../core/haptics.js';
import { cardHeader } from '../ui/components.js';
import { travelShelf, afishaShelf } from '../ui/shelves.js';

// Порядок ленты. offers — смысловая полка: категория каталога, при необходимости — фильтр по названию;
// scratch — номер скретч-карточки (по SCRATCH_PRIZES в main.js), тогда офферов три.
const LAYOUT = [
  { title: 'Продукты с доставкой', sub: 'Привезут за час — с кэшбэком', cat: 'food', match: /доставка|лавка|самокат|купер/i, scratch: 0 },
  { title: 'Супермаркеты рядом', sub: 'Кэшбэк на покупки у дома', cat: 'food', match: /магнит|пятёрочка|перекрёсток|лента|ашан/i },
  { title: 'Сырная полка', sub: 'Hochland и Almette с кэшбэком', cat: 'food', match: /hochland|almette/i },
  { title: 'Красота и уход', sub: 'Косметика, парфюмерия и уход', cat: 'beauty', match: /подружка|лэтуаль|кератин|sokolov/i },
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
export function buildShelves({ catalog, cards, scratches, onLink }) {
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

  const extras = [];
  const parts = [];
  LAYOUT.forEach((s, i) => {
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
    const offers = take(s.cat, s.match, scratch ? 3 : 4);
    if (!offers.length) return;
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
        for (const card of part.querySelectorAll('.ocard')) {
          const ok = id === 'all' || (!own && catOf.get(card.dataset.offer) === id);
          card.hidden = !ok;
          any ||= ok;
        }
        part.hidden = !any;
      } else {
        part.hidden = !(id === 'all' || part.dataset.cat === id);
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
      const y = wrap.getBoundingClientRect().top - pageEl.getBoundingClientRect().top + pageEl.scrollTop - parseFloat(getComputedStyle(pageEl).paddingTop) - 8;
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
