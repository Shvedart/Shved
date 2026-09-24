'use strict';
/*
 * Генератор статического сайта: на выходе — обычные .html файлы,
 * никакого SPA-роутера и бандлера в рантайме. Этот скрипт запускается
 * только на этапе разработки (node build.js), чтобы не писать 35
 * однотипных файлов руками.
 */
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const BASE = '/tabbar-mpa'; // подпапка на GitHub Pages

const ICONS = {
  home: `<svg viewBox="0 0 24 24"><path d="M3 11.5L12 4l9 7.5"/><path d="M5.5 10v9a1 1 0 0 0 1 1H9.5v-5.5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1V20h3a1 1 0 0 0 1-1v-9"/></svg>`,
  catalog: `<svg viewBox="0 0 24 24"><rect x="3.5" y="3.5" width="7" height="7" rx="1.6"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.6"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.6"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.6"/></svg>`,
  favorites: `<svg viewBox="0 0 24 24"><path d="M12 20.3S3.8 15.3 3.8 9.8C3.8 6.6 6 4.5 8.7 4.5c1.9 0 3.4 1.1 3.3 3-.1-1.9 1.4-3 3.3-3 2.7 0 4.9 2.1 4.9 5.3 0 5.5-8.2 10.5-8.2 10.5z"/></svg>`,
  orders: `<svg viewBox="0 0 24 24"><path d="M9 8.3V6.6a3 3 0 0 1 6 0V8.3"/><path d="M5.8 8.3h12.4l-1.1 11a1.6 1.6 0 0 1-1.6 1.4H8.5a1.6 1.6 0 0 1-1.6-1.4l-1.1-11z"/></svg>`,
  profile: `<svg viewBox="0 0 24 24"><circle cx="12" cy="8.3" r="3.6"/><path d="M4.5 20c1.3-4 4-6 7.5-6s6.2 2 7.5 6"/></svg>`,
};

const TABS = [
  { id: 'home', label: 'Главная', icon: ICONS.home },
  { id: 'catalog', label: 'Каталог', icon: ICONS.catalog },
  { id: 'favorites', label: 'Избранное', icon: ICONS.favorites },
  { id: 'orders', label: 'Заказы', icon: ICONS.orders },
  { id: 'profile', label: 'Профиль', icon: ICONS.profile },
];

function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h;
}

function tileHue(seed, i) {
  return (Math.abs(hashStr(seed)) + i * 61) % 360;
}

function tileBackground(seed, i) {
  const hue = tileHue(seed, i);
  return `linear-gradient(135deg, hsl(${hue} 85% 62%), hsl(${(hue + 35) % 360} 85% 42%))`;
}

function tabBarHtml(activeTabId) {
  const items = TABS.map((tab) => {
    const active = tab.id === activeTabId ? ' active' : '';
    return `      <a class="tab-btn${active}" href="${BASE}/${tab.id}/">${tab.icon}<span class="tab-label">${tab.label}</span></a>`;
  }).join('\n');
  return `  <nav id="tabbar">\n    <div id="tabbar-glass"></div>\n    <div id="tabbar-items">\n${items}\n    </div>\n  </nav>`;
}

function tileHtml({ href, index, seed, clickable }) {
  const bg = tileBackground(seed, index - 1);
  const chevron = clickable
    ? '<svg class="tile-chevron" viewBox="0 0 12 20"><path d="M2 1l8 9-8 9" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    : '';
  const tag = clickable ? 'a' : 'div';
  const attrs = clickable ? ` href="${href}" data-nav="push"` : '';
  return `        <${tag} class="tile is-loading"${attrs} style="background: ${bg};">
          <span class="tile-index">${index}</span>
          <span class="tile-label">Плитка ${index}</span>
          ${chevron}
          <span class="tile-skeleton"></span>
        </${tag}>`;
}

function pageHtml({ title, subtitle, backHref, tabId, tilesHtml }) {
  const back = backHref
    ? `<a class="navbar-back" href="${backHref}" data-nav="pop"><svg viewBox="0 0 12 20"><path d="M10 1L2 10l8 9" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg><span>Назад</span></a>`
    : '';
  return `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=1, user-scalable=no">
<title>${title} — TabBar MPA</title>
<link rel="stylesheet" href="${BASE}/style.css">
<script>
// Блокирующий инлайн-скрипт: должен отработать ДО первой отрисовки,
// иначе будет видна вспышка финальной позиции перед стартом анимации.
(function () {
  try {
    var v = sessionStorage.getItem('tb_enter_anim');
    if (v === 'push' || v === 'pop') {
      document.documentElement.setAttribute('data-enter', v);
    }
  } catch (e) {}
})();
</script>
</head>
<body>
  <main id="screen-content">
    <div class="screen-dim"></div>
    <div class="screen-navbar">
      ${back}
      <div class="navbar-title">${title}</div>
    </div>
    <div class="screen-body">
      <div class="page-heading">${title}</div>
      <div class="page-sub">${subtitle}</div>
      <div class="tile-grid">
${tilesHtml}
      </div>
    </div>
  </main>

${tabBarHtml(tabId)}

  <script src="${BASE}/skeleton.js" defer></script>
  <script src="${BASE}/page-transitions.js" defer></script>
</body>
</html>
`;
}

function writeFile(relPath, content) {
  const full = path.join(ROOT, relPath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
  console.log('  ' + relPath);
}

console.log('Генерация статических страниц...');

// корень сайта — редирект на первый таб (работает и без JS)
writeFile(
  'index.html',
  `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<meta http-equiv="refresh" content="0; url=${BASE}/${TABS[0].id}/">
<title>TabBar MPA</title>
</head>
<body>
  <p>Переход на <a href="${BASE}/${TABS[0].id}/">${BASE}/${TABS[0].id}/</a>…</p>
</body>
</html>
`
);

TABS.forEach((tab) => {
  // корневая страница таба
  const rootTiles = Array.from({ length: 6 }, (_, i) =>
    tileHtml({
      href: `${BASE}/${tab.id}/${i + 1}/`,
      index: i + 1,
      seed: `${tab.id}:`,
      clickable: true,
    })
  ).join('\n');

  writeFile(
    `${tab.id}/index.html`,
    pageHtml({
      title: tab.label,
      subtitle: 'Нажмите на плитку, чтобы открыть новый экран',
      backHref: null,
      tabId: tab.id,
      tilesHtml: rootTiles,
    })
  );

  // детальные страницы (один уровень вложенности)
  for (let n = 1; n <= 6; n++) {
    const detailTiles = Array.from({ length: 6 }, (_, i) =>
      tileHtml({
        href: null,
        index: i + 1,
        seed: `${tab.id}:${n}`,
        clickable: false,
      })
    ).join('\n');

    writeFile(
      `${tab.id}/${n}/index.html`,
      pageHtml({
        title: `Плитка ${n}`,
        subtitle: `${BASE}/${tab.id}/${n}/`,
        backHref: `${BASE}/${tab.id}/`,
        tabId: tab.id,
        tilesHtml: detailTiles,
      })
    );
  }
});

console.log('Готово.');
