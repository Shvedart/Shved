// Карточка оффера, свёрстанная по данным из OFFERS (cashback.json).
// Макет 165×277 — как в SVG; под нужный размер масштабируется через --k.
const CARD_W = 165, CARD_H = 277;
const HEART = '<img class="oc-h" src="fig/heart.svg" alt="" draggable="false">';

// экранирование + неразрывные пробелы в суммах: «1 000 ₽» не рвётся
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))
  .replace(/(\d) (?=\d{3}\b)/g, '$1&nbsp;').replace(/ ₽/g, '&nbsp;₽');
const capFirst = s => s.charAt(0).toUpperCase() + s.slice(1);
// «кэшбэка» → «Кэшбэк»
const benefitLabel = t => /кэшбэк/i.test(t) ? 'Кэшбэк' : /скидк/i.test(t) ? 'Скидка' : capFirst(t);

// строка «условие + срок»; date — подмена срока (например «Осталось 1 день»), urgent — красным
const dateHTML = (o, date, urgent) => `${esc(o.desc)}<span${urgent ? ' class="oc-urg"' : ''}>${esc(date || o.date)}</span>`;
const offerAt = i => OFFERS[((i % OFFERS.length) + OFFERS.length) % OFFERS.length];

function cardHTML(i, pic = true) {
  const o = OFFERS[((i % OFFERS.length) + OFFERS.length) % OFFERS.length];
  return `<div class="ocw"><div class="oc-tile">
    ${pic ? `<img class="oc-img" src="${enc(o.img)}" alt="" draggable="false">` : ''}
    <div class="oc-top"><div class="oc-vt">
      <div class="oc-v">${esc(o.val)}</div>
      <div class="oc-t">${esc(benefitLabel(o.type))}</div></div>
      <div class="oc-d">${dateHTML(o)}</div>
    </div>
    <img class="oc-logo" src="${enc(o.logo)}" alt="" draggable="false">
    ${HEART}
  </div>
  <div class="oc-b"><div class="oc-n">${esc(o.title)}</div>
  <div class="oc-s">${esc(o.sub)}</div></div></div>`;
}

// DOM-узел карточки фиксированной ширины (для стены и полок)
function cardEl(i, pic, w, cls = '') {
  const el = document.createElement('div');
  el.className = 'oc ' + cls;
  el.style.width = w + 'px'; el.style.height = w * CARD_H / CARD_W + 'px';
  el.style.setProperty('--k', w / CARD_W);
  el.innerHTML = cardHTML(i, pic);
  return el;
}

// Плитка оффера «как в проде» (Figma, слайд «Выделить выгоду»): 204×259, фон задаётся через --tbg,
// поэтому смена фона между слайдами анимируется.
const TILE_W = 204, TILE_H = 259;
const cashbackLabel = o => benefitLabel(o.type) + ' ' + o.val;
function tileHTML(i) {
  const o = OFFERS[((i % OFFERS.length) + OFFERS.length) % OFFERS.length];
  return `<div class="tlw">
    <div class="tl-n">${esc(o.title)}</div>
    <div class="tl-c">${esc(cashbackLabel(o))}</div>
    <img class="tl-img" src="${enc(o.img)}" alt="" draggable="false">
    <img class="tl-logo" src="${enc(o.logo)}" alt="" draggable="false">
  </div>`;
}
