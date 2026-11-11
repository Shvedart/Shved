// Источник данных. Экраны работают только с объектом Catalog, поэтому локальный JSON
// можно заменить на API: достаточно передать другой source с методом load().

import { buildCatalog } from '../domain/catalog.js';

export function createLocalSource({ catalogUrl = 'cashback-web.json', overridesUrl = 'data/overrides.json', productsUrl = 'data/products.json', discountsUrl = 'data/discounts.json', groceryUrl = 'data/grocery.json', goodsUrl = 'data/tovarka.json', goodsModeratedUrl = 'data/tovarka-moderated.json', bannersUrl = 'data/banners.json', kitsUrl = 'data/kits.json' } = {}) {
  return {
    async load() {
      // товары, промокоды и продукты из магазина — необязательные источники: без них лента обходится офферами
      const [raw, overrides, products, discounts, grocery, goods, goodsModerated, banners, kits] = await Promise.all([
        fetchJson(catalogUrl), fetchJson(overridesUrl),
        fetchJson(productsUrl).catch(() => null), fetchJson(discountsUrl).catch(() => null),
        fetchJson(groceryUrl).catch(() => null), fetchJson(goodsUrl).catch(() => null),
        fetchJson(goodsModeratedUrl).catch(() => null), fetchJson(bannersUrl).catch(() => null),
        fetchJson(kitsUrl).catch(() => null),
      ]);
      return { raw, overrides, products, discounts, grocery, goods, goodsModerated, banners, kits };
    },
  };
}

// Пример API-источника: тот же контракт, другой транспорт.
export function createApiSource({ baseUrl }) {
  return {
    async load() {
      const [raw, overrides] = await Promise.all([fetchJson(`${baseUrl}/offers`), fetchJson(`${baseUrl}/config`)]);
      return { raw, overrides };
    },
  };
}

async function fetchJson(url) {
  const res = await fetch(url, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`Не удалось загрузить ${url}: ${res.status}`);
  return res.json();
}

export async function loadCatalog(source) {
  const { raw, overrides, products, discounts, grocery, goods, goodsModerated, banners, kits } = await source.load();
  return buildCatalog(raw, overrides, products, discounts, grocery, goods, goodsModerated, banners, kits);
}
