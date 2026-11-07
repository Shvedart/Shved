// Нормализация сырого JSON в модель «категория → бренд → офферы».
// Оффер всегда принадлежит бренду; у бренда может быть несколько офферов.

import { plural } from '../core/dom.js';

const MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
const DAY_MS = 86400000;

export function buildCatalog(raw, cfg) {
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

  return createCatalogApi({ categories, offers, brands, cfg });
}

function createCatalogApi({ categories, offers, brands, cfg }) {
  const api = {
    config: cfg,
    categories,
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
