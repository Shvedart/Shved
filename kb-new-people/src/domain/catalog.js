// Нормализация сырого JSON в модель «категория → бренд → офферы».
// Оффер всегда принадлежит бренду; у бренда может быть несколько офферов.

import { plural } from '../core/dom.js';

const MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
const DAY_MS = 86400000;

export function buildCatalog(raw, cfg, productsRaw = null, discountsRaw = null, groceryRaw = null, goodsRaw = null, goodsModeratedRaw = null, bannersRaw = null, kitsRaw = null) {
  const today = new Date(`${cfg.today}T00:00:00`);
  const matchIndex = new Map();
  for (const [brandId, b] of Object.entries(cfg.brands || {})) {
    for (const name of b.match || []) matchIndex.set(normName(name), brandId);
  }

  const categories = [];
  const offers = new Map();
  const brands = new Map();

  const extraByCategory = new Map();
  for (const extra of cfg.extraOffers || []) {
    if (!extraByCategory.has(extra.categoryId)) extraByCategory.set(extra.categoryId, []);
    extraByCategory.get(extra.categoryId).push(extra);
  }

  for (const cat of raw.categories || []) {
    const list = [...(cat.offers || [])];
    for (const extra of extraByCategory.get(cat.id) || []) {
      const at = list.findIndex((o) => o.id === extra.afterId);
      list.splice(at >= 0 ? at + 1 : list.length, 0, extra.offer);
    }
    const ids = [];
    for (const rawOffer of list) {
      const brandId = matchIndex.get(normName(rawOffer.name)) || slug(rawOffer.name);
      const offer = normalizeOffer(rawOffer, cat.id, brandId, today);
      offers.set(offer.id, offer);
      ids.push(offer.id);

      if (!brands.has(brandId)) {
        const meta = cfg.brands?.[brandId] || {};
        brands.set(brandId, {
          id: brandId,
          name: meta.name || rawOffer.name,
          namePrep: meta.namePrep || null,
          logo: meta.logo || rawOffer.logo,
          categoryId: cat.id,
          offerIds: [],
        });
      }
      brands.get(brandId).offerIds.push(offer.id);
    }
    categories.push({ id: cat.id, title: cat.title, offerIds: ids });
  }

  for (const brand of brands.values()) {
    brand.offerIds.sort((a, b) => offers.get(b).rank - offers.get(a).rank);
  }

  const products = buildProducts(productsRaw, offers, brands);
  const promos = buildPromos(discountsRaw, brands);
  // продукты из магазина (data/grocery.json): цена, кэшбэк в рублях и фото — для полки «Вы уже заказывали»
  const grocery = groceryRaw?.products || [];
  // товары маркетплейса (data/tovarka.json) по категориям навигации: [{ id, title, products }];
  // hiddenGoods в overrides — товары, которые пока не показываем (например, фото-инфографика)
  const hiddenGoods = new Set(cfg.hiddenGoods || []);
  const goods = (goodsRaw?.categories || []).map((c) => ({ ...c, products: c.products.filter((p) => !hiddenGoods.has(p.id)) }));
  // товары после модерации (data/tovarka-moderated.json): чистые фото без инфографики — для ленты 07;
  // id у них свои, поэтому hiddenGoods к ним не применяем
  const goodsModerated = goodsModeratedRaw?.categories || [];
  // рекламные баннеры ленты 07 (data/banners.json): фото, логотип, заголовок, категория
  const banners = bannersRaw?.banners || [];
  // наборы товаров с баннером (data/kits.json) — полки «Сделать свою первую свечу» и подобные
  const kits = kitsRaw?.kits || [];
  return createCatalogApi({ categories, offers, brands, cfg, products, promos, grocery, goods, goodsModerated, banners, kits });
}

/* Товары с кэшбэком (формат land → payload.items[]: фото, название, кэшбэк).
   Товар привязываем к офферу с тем же названием или к бренду, чьё имя есть в названии товара, —
   тогда работают переход в детали и сердечко. */
function buildProducts(productsRaw, offers, brands) {
  const list = [];
  const byName = new Map([...offers.values()].map((o) => [normName(o.name).toLowerCase(), o]));
  const brandList = [...brands.values()].sort((a, b) => b.name.length - a.name.length);
  for (const entry of productsRaw?.land || []) {
    for (const item of entry.payload?.items || []) {
      const name = normName(item.texts?.name || '');
      if (!name) continue;
      const cashback = item.texts?.cashback || '';
      const lower = name.toLowerCase();
      let offer = byName.get(lower) || null;
      if (!offer) {
        const brand = brandList.find((b) => b.name.length > 2 && lower.includes(normName(b.name).toLowerCase()));
        offer = brand ? offers.get(brand.offerIds[0]) : null;
      }
      list.push({
        id: `product-${item.entity?.id || entry.id}`,
        name,
        image: item.images?.photo || '',
        cashback,
        // в плашке — без слова «Кэшбэк»: оно уже стоит перед ней
        short: cashback.replace(/^кэшбэк\s*/i, ''),
        offerId: offer?.id || null,
        brandId: offer?.brandId || null,
      });
    }
  }
  return list;
}

/* Промокоды (data/discounts.json): та же раскладка «категория → предложения», что у кэшбэка,
   но вместо процента — скидка и код. Бренд ищем среди брендов кэшбэка по названию —
   тогда работает сердечко и переход в детали. */
function buildPromos(discountsRaw, brands) {
  const list = [];
  const brandList = [...brands.values()].sort((a, b) => b.name.length - a.name.length);
  for (const cat of discountsRaw?.categories || []) {
    for (const p of cat.offers || []) {
      const lower = normName(p.name).toLowerCase();
      const brand = brandList.find((b) => normName(b.name).toLowerCase() === lower)
        || brandList.find((b) => b.name.length > 3 && lower.includes(normName(b.name).toLowerCase()));
      list.push({
        id: `promo-${p.id}`,
        categoryId: cat.id,
        name: normName(p.name),
        description: p.description || '',
        discount: p.discount,
        discountText: p.discountText,
        code: p.promoCode,
        condition: p.condition,
        date: p.date,
        logo: p.logo,
        image: p.image,
        brandId: brand?.id || null,
        offerId: brand?.offerIds[0] || null,
      });
    }
  }
  return list;
}

function createCatalogApi({ categories, offers, brands, cfg, products = [], promos = [], grocery = [], goods = [], goodsModerated = [], banners = [], kits = [] }) {
  const api = {
    config: cfg,
    categories,
    products,
    promos,
    grocery,
    goodsModerated,
    banners,
    kits,
    goods,
    getOffer: (id) => offers.get(id) || null,
    getBrand: (id) => brands.get(id) || null,
    getCategory: (id) => categories.find((c) => c.id === id) || null,
    brandOf: (offerId) => brands.get(offers.get(offerId)?.brandId) || null,
    offersOfBrand: (brandId) => (brands.get(brandId)?.offerIds || []).map((id) => offers.get(id)),
    topOffer: (brandId) => offers.get(brands.get(brandId)?.offerIds[0]) || null,
    offersInCategory: (categoryId) => (api.getCategory(categoryId)?.offerIds || []).map((id) => offers.get(id)),
    brandsInCategory: (categoryId) => [...brands.values()].filter((b) => b.categoryId === categoryId),
    // Похожие предложения из той же категории от других брендов — замена закончившейся акции.
    similarOffers(brandId, limit = 2) {
      const brand = brands.get(brandId);
      if (!brand) return [];
      const seen = new Set([brandId]);
      const result = [];
      // ближе всего — офферы с похожим описанием («доставка продуктов» к «доставке продуктов»)
      const words = new Set(api.offersOfBrand(brandId).flatMap((o) => keywords(o.description)));
      const score = (o) => keywords(o.description).filter((w) => words.has(w)).length;
      const candidates = api.offersInCategory(brand.categoryId)
        .filter((o) => o.type === 'cashback')
        .sort((a, b) => (score(b) - score(a)) || (b.rank - a.rank));
      for (const offer of candidates) {
        if (seen.has(offer.brandId) || !offer.background) continue;
        seen.add(offer.brandId);
        result.push(offer);
        if (result.length === limit) break;
      }
      return result;
    },
    // Выгода бренда одной строкой, без счёта предложений (сценарий 02):
    // одно — «12% на доставку», несколько — «до 53% · доставка и магазины».
    brandPitch(brandId) {
      const list = api.offersOfBrand(brandId);
      if (!list.length) return 'Пока нет. Но часто бывают';
      if (list.length === 1) return `${list[0].cashback} ${CHANNEL_PHRASE[channelOf(list[0])]}`;
      const channels = [...new Set(list.map(channelOf))];
      const top = list[0];
      const value = top.type === 'cashback' ? `до ${top.short}` : top.cashback;
      // все предложения в одном канале — «до 47% на доставку»
      if (channels.length === 1) return `${value} ${CHANNEL_PHRASE[channels[0]]}`;
      const where = channels.length === 2 ? `${channels[0]} и ${channels[1]}` : `${channels[0]}, ${channels[1]} и ещё ${channels.length - 2}`;
      return `${value} · ${where}`;
    },
    brandSummary(brandId) {
      const list = api.offersOfBrand(brandId);
      if (!list.length) return 'Пока нет. Но часто бывают';
      const words = ['', 'Одно', 'Два', 'Три', 'Четыре'];
      const head = list.length < 5 ? `${words[list.length]} ${plural(list.length, 'предложение', 'предложения', 'предложений')}` : `${list.length} предложений`;
      const values = [...new Set(list.slice().sort((a, b) => a.value - b.value).map((o) => o.short))];
      return `${head} на ${values.slice(0, 3).join(', ')}`;
    },
  };
  return api;
}

// Канал оффера — где действует кэшбэк. Угадываем по названию и условию; для прототипа хватает.
// Сначала смотрим на название: «Самокат в Городе» — это Город, хоть в описании и «доставка».
function channelOf(o) {
  if (/аптек/i.test(o.name)) return 'аптека';
  if (/в т-банке/i.test(o.name)) return 'Т-Банк';
  if (/в городе/i.test(o.name)) return 'Город';
  if (/шопинг/i.test(o.name)) return 'Шопинг';
  if (/доставк/i.test(`${o.name} ${o.description || ''}`)) return 'доставка';
  if (/онлайн/i.test(o.condition)) return 'онлайн';
  return 'магазины';
}

const CHANNEL_PHRASE = {
  аптека: 'в аптеке',
  доставка: 'на доставку',
  'Т-Банк': 'в Т-Банке',
  Город: 'в Городе',
  Шопинг: 'в Шопинге',
  онлайн: 'на покупки онлайн',
  магазины: 'в магазинах',
};

function normalizeOffer(o, categoryId, brandId, today) {
  const cashback = (o.cashback || '').trim();
  const type = /бонус/i.test(cashback) ? 'points' : /₽/.test(cashback) ? 'fixed' : 'cashback';
  const value = Number((cashback.match(/\d+/) || [0])[0]);
  const daysLeft = parseDaysLeft(o.date || '', today);
  const isHot = daysLeft != null && daysLeft < 2;
  return {
    id: o.id,
    brandId,
    categoryId,
    name: o.name,
    description: o.description,
    cashback,
    short: cashback.replace(/^до\s+/i, ''),
    cashbackText: o.cashbackText || `Кэшбэк ${cashback}`,
    condition: (o.condition || '').trim(),
    date: (o.date || '').trim(),
    daysLeft,
    isHot,
    type,
    value,
    // для сортировки: проценты сравниваем между собой, баллы и фиксированные суммы — ниже
    rank: type === 'cashback' ? value : value / 1000,
    image: o.image,
    background: o.background,
    logo: o.logo,
    bgColor: o.backgroundColor || '#f0f0f0',
    textColor: o.textColor || '#000000',
  };
}

function parseDaysLeft(text, today) {
  const left = text.match(/Осталось\s+(\d+)/i);
  if (left) return Number(left[1]);
  const until = text.match(/До\s+(\d+)\s+([а-яё]+)/i);
  if (until) {
    const month = MONTHS.indexOf(until[2].toLowerCase());
    if (month < 0) return null;
    let date = new Date(today.getFullYear(), month, Number(until[1]));
    if (date < today) date = new Date(today.getFullYear() + 1, month, Number(until[1]));
    return Math.round((date - today) / DAY_MS);
  }
  return null;
}

function keywords(text = '') {
  return text.toLowerCase().split(/[^a-zа-яё]+/i).filter((w) => w.length > 3).map((w) => w.slice(0, 6));
}

// В исходном JSON встречаются неразрывные пробелы — для сопоставления с брендами их выравниваем.
function normName(name) {
  return name.replace(/[  ]/g, ' ').replace(/\s+/g, ' ').trim();
}

function slug(name) {
  return name.toLowerCase().replace(/[^a-zа-яё0-9]+/gi, '-').replace(/^-|-$/g, '');
}

// Подписи для оффера, общие для всех экранов.
export const fmt = {
  lowerFirst: (s) => (s ? s[0].toLowerCase() + s.slice(1) : s),
  daysLabel: (n) => `${n} ${plural(n, 'день', 'дня', 'дней')}`,
  // Строка под названием в списке: дата только у горящих офферов.
  rowSubtitle(offer) {
    return { hot: offer.isHot ? `${fmt.daysLabel(offer.daysLeft)},` : null, text: fmt.lowerFirst(offer.condition) };
  },
  // Срок на карточке.
  cardTerm(offer) {
    if (offer.isHot) return fmt.daysLabel(offer.daysLeft);
    return offer.date;
  },
  kindLabel(offer) {
    if (offer.type === 'points') return 'Бонусы';
    return 'Кэшбэк';
  },
  cardValue(offer) {
    if (offer.type === 'points') return offer.cashback.replace(/\s*бонус\S*/i, '');
    return offer.cashback;
  },
  brandPrep(brand) {
    return brand.namePrep ? `В ${brand.namePrep}` : `В «${brand.name}»`;
  },
};
