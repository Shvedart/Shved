// Источник данных. Экраны работают только с объектом Catalog, поэтому локальный JSON
// можно заменить на API: достаточно передать другой source с методом load().

import { buildCatalog } from '../domain/catalog.js';

export function createLocalSource({ catalogUrl = 'cashback-web.json', overridesUrl = 'data/overrides.json' } = {}) {
  return {
    async load() {
      const [raw, overrides] = await Promise.all([fetchJson(catalogUrl), fetchJson(overridesUrl)]);
      return { raw, overrides };
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
  const { raw, overrides } = await source.load();
  return buildCatalog(raw, overrides);
}
