import { h, button, img, iconImg } from '../core/dom.js';
import { reducedMotion } from '../core/motion.js';
import { applyCardLook, defaultSetup } from '../domain/feedSetup.js';
import { goodsCard, offerCard, bannerCard } from '../ui/components.js';
import { openSheet } from '../ui/sheet.js';
import { toast } from '../ui/toast.js';
import { app } from '../app.js';

const asset = (name) => 'assets/img/city/' + name;
const art = (name, cls) => img(asset(name), { cls, alt: '', lazy: false });

let orientationAllowed = typeof window.DeviceOrientationEvent?.requestPermission !== 'function';
let orientationRequest;

export function requestCityOrientation() {
  if (!window.isSecureContext || orientationAllowed) return null;
  // Запрос вызывается прямо из клика, до перехода на экран.
  return orientationRequest ??= (async () => {
    try {
      orientationAllowed = await window.DeviceOrientationEvent.requestPermission() === 'granted';
    } catch {
      orientationAllowed = false;
    }
    return orientationAllowed;
  })();
}

const FUEL = {
  progress: .5, waterColor: '124, 174, 255', opacity: .5,
  waveAmplitude: 1.2, waveFrequency: 5, waveSpeed: 1.4,
  refractionStrength: 1, springStiffness: 45, damping: 8,
  tiltStrength: 56, lightIntensity: .08,
};

function fuelMotion(page, canvas, logo, settings = FUEL) {
  const ctx = canvas.getContext('2d');
  const original = document.createElement('canvas');
  const source = original.getContext('2d');
  let width, height, dpr, logoTop, logoBottom;
  let fill, shine, frame = 0, last = 0, time = 0;
  let active = false, visible = false, target = 0, tilt = 0, tiltSpeed = 0;
  let wave = 0, speed = 0, level = settings.progress, levelSpeed = 0;
  let lastY, lastScroll = 0, previousDelta = 0, pitch = null, hasLogo = false;
  const clamp = (v, max) => Math.max(-max, Math.min(max, v));
  const getTile = () => canvas.parentElement;
  const tint = (a) => 'rgba(' + settings.waterColor + ',' + a + ')';

  function wake() {
    if (active && visible && !frame && width && height) frame = requestAnimationFrame(draw);
  }

  function resize() {
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    if (!width || !height) return;
    dpr = Math.min(window.devicePixelRatio || 1, 3);
    canvas.width = original.width = Math.round(width * dpr);
    canvas.height = original.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    source.setTransform(dpr, 0, 0, dpr, 0, 0);

    logoTop = logo.offsetTop;
    logoBottom = logoTop + logo.offsetHeight;
    hasLogo = logo.complete && logo.naturalWidth > 0;
    if (hasLogo) {
      const x = logo.offsetLeft;
      source.beginPath();
      source.roundRect(x, logoTop, logo.offsetWidth, logo.offsetHeight, 6);
      source.clip();
      source.drawImage(logo, x, logoTop, logo.offsetWidth, logo.offsetHeight);
      logo.classList.add('is-rendered');
    }

    fill = ctx.createLinearGradient(0, height * .37, 0, height);
    fill.addColorStop(0, tint(settings.opacity));
    fill.addColorStop(.4, tint(settings.opacity));
    fill.addColorStop(1, tint(settings.opacity * .58));
    shine = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
    shine.addColorStop(0, 'rgba(220, 254, 255,' + settings.lightIntensity + ')');
    shine.addColorStop(1, 'rgba(220, 254, 255,0)');
    wake();
  }

  function draw(now) {
    frame = 0;
    const still = reducedMotion();
    const dt = last ? Math.min((now - last) / 1000, .032) : 1 / 60;
    last = now;
    if (!still) time += dt * settings.waveSpeed;
    tiltSpeed += ((target - tilt) * settings.springStiffness - tiltSpeed * settings.damping) * dt;
    tilt += tiltSpeed * dt;
    speed += (-wave * settings.springStiffness - speed * settings.damping) * dt;
    wave += speed * dt;
    levelSpeed += ((settings.progress - level) * settings.springStiffness - levelSpeed * settings.damping) * dt;
    level += levelSpeed * dt;
    const waterY = height * (1 - level);
    const edge = (x) => {
      const u = x / width;
      return waterY + (still ? 0 : width * tilt * (u - .5)
        + settings.waveAmplitude * (Math.sin(u * settings.waveFrequency + time) + .4 * Math.sin(u * 7 - time * .7))
        + wave * Math.sin(u * Math.PI * 2 - time * 2));
    };
    const line = new Path2D();
    // Замыкаем маски за плиткой: при сильном наклоне поверхность выходит за её края.
    const outside = height + width * 6;
    const segments = 24;
    for (let i = 0; i <= segments; i++) {
      const x = width * i / segments;
      if (i) line.lineTo(x, edge(x));
      else line.moveTo(x, edge(x));
    }
    ctx.clearRect(0, 0, width, height);
    if (hasLogo) {
      const dry = new Path2D(line);
      dry.lineTo(width, -outside);
      dry.lineTo(0, -outside);
      dry.closePath();
      ctx.save();
      ctx.clip(dry);
      ctx.drawImage(original, 0, 0, width, height);
      ctx.restore();
    }
    const wet = new Path2D(line);
    wet.lineTo(width, outside);
    wet.lineTo(0, outside);
    wet.closePath();
    ctx.save();
    ctx.clip(wet);
    if (hasLogo) {
      // Деформируем только пиксели логотипа: около десяти полос на кадр.
      const center = logo.offsetLeft + logo.offsetWidth / 2;
      const nearEdge = edge(center);
      for (let y = logoTop; y < logoBottom; y += 2) {
        const band = Math.min(2, logoBottom - y);
        const near = Math.exp(-Math.abs(y - nearEdge) / 21);
        const dx = (Math.sin(y * .21 + time * 2) * 2.5 + Math.sin(y * .12 - time) * 2)
          * (.45 + near * 1.4) * settings.refractionStrength;
        const dy = 1.5 + Math.sin(y * .25 + time) * near * 1.25;
        ctx.drawImage(original, 0, y * dpr, original.width, band * dpr, dx, y + dy, width, band + .7);
      }
    }
    ctx.fillStyle = fill;
    ctx.fillRect(0, 0, width, height);
    for (let i = 0; i < 2; i++) {
      ctx.save();
      ctx.translate(width * (.33 + i * .32 + Math.sin(time * .7 + i) * .13), waterY + 18 + i * 25);
      ctx.scale(width * .52, height * .22);
      ctx.fillStyle = shine;
      ctx.fillRect(-1, -1, 2, 2);
      ctx.restore();
    }
    ctx.restore();
    // Цвет виден только с внутренней стороны кромки.
    ctx.save();
    ctx.clip(wet);
    const glint = ctx.createLinearGradient(0, 0, width, 0);
    const center = .48 + .16 * Math.sin(time * .55 + tilt);
    glint.addColorStop(0, 'transparent');
    glint.addColorStop(center - .25, 'rgba(151, 125, 255, 0)');
    glint.addColorStop(center - .09, 'rgba(169, 130, 255, .32)');
    glint.addColorStop(center, 'rgba(255, 212, 183, .44)');
    glint.addColorStop(center + .10, 'rgba(117, 244, 232, .36)');
    glint.addColorStop(center + .26, 'rgba(117, 244, 232, 0)');
    glint.addColorStop(1, 'transparent');
    ctx.strokeStyle = glint;
    for (let blur = 0; blur < 4; blur++) {
      ctx.globalAlpha = .32 - blur * .065;
      ctx.lineWidth = 2 + blur * 2;
      ctx.stroke(line);
    }
    ctx.restore();
    ctx.strokeStyle = 'rgba(212, 250, 255, .48)';
    ctx.lineWidth = 1;
    ctx.stroke(line);
    if (!still) wake();
    if (!frame) last = 0;
  }

  function scroll() {
    const delta = page.scrollTop - lastY;
    lastY = page.scrollTop;
    if (!visible || reducedMotion()) return;
    const now = performance.now();
    if (now - lastScroll > 100) previousDelta = 0;
    speed = clamp(speed + (delta - previousDelta) * 6, 240);
    previousDelta = delta;
    lastScroll = now;
    wake();
  }
  function orient(event) {
    if (!orientationAllowed || !visible || reducedMotion() || !Number.isFinite(event.gamma)) return;
    // Наклон поверхности следует горизонту. Ограничиваем тангенс у 90°.
    const roll = clamp(event.gamma, 80) * Math.PI / 180;
    target = Math.tan(roll);
    if (Number.isFinite(event.beta)) {
      if (pitch !== null) speed = clamp(speed + clamp(event.beta - pitch, 10) * 5, 140);
      pitch = event.beta;
    }
    wake();
  }
  function pointer(event) {
    if (event.pointerType !== 'mouse' || reducedMotion()) return;
    const box = canvas.getBoundingClientRect();
    target = clamp((event.clientX - box.left) / box.width - .5, .5) * settings.tiltStrength / box.width;
    wake();
  }
  function leave() { target = 0; wake(); }
  function pause() {
    cancelAnimationFrame(frame);
    frame = last = previousDelta = 0;
    pitch = null;
  }
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) wake();
    else pause();
  }, { root: page });
  const sizeObserver = new ResizeObserver(resize);
  return {
    start() {
      active = true;
      lastY = page.scrollTop;
      observer.observe(canvas);
      sizeObserver.observe(canvas);
      logo.addEventListener('load', resize);
      getTile().addEventListener('pointermove', pointer);
      getTile().addEventListener('pointerleave', leave);
      page.addEventListener('scroll', scroll, { passive: true });
      window.addEventListener('deviceorientation', orient);
      resize();
    },
    stop() {
      active = visible = false;
      observer.disconnect();
      sizeObserver.disconnect();
      logo.removeEventListener('load', resize);
      getTile().removeEventListener('pointermove', pointer);
      getTile().removeEventListener('pointerleave', leave);
      page.removeEventListener('scroll', scroll);
      window.removeEventListener('deviceorientation', orient);
      pause();
    },
  };
}

export function cityScreen({ el, nav }) {
  const { catalog } = app;
  const setup = defaultSetup([]);
  el.classList.add('city-page');
  applyCardLook(el, setup);
  for (const [part, on] of Object.entries(setup.goodsShow)) if (!on) el.classList.add('goods-no-' + part);

  let sheet;
  function show(title, body) {
    sheet?.close({ instant: true });
    sheet = openSheet({ title, body });
  }
  const city = button({ class: 'city-location', 'aria-label': 'Выбрать город' }, 'Москва');
  city.onclick = () => show('Выберите город', ['Москва', 'Санкт-Петербург', 'Ростов-на-Дону', 'Казань'].map((name) =>
    button({ class: 'city-option', onClick: () => { city.textContent = name; sheet.close(); } }, name)));
  const header = h('header', { class: 'city-header' },
    h('div', { class: 'city-bar' }, city,
      button({ class: 'city-glass glass', 'aria-label': 'Избранное', onClick: () => nav.push('/favorites') }, iconImg('city-heart', { size: 24 })),
      button({ class: 'city-glass glass', onClick: () => show('Заказы', h('p', null, 'У вас пока нет заказов')) }, 'Заказы')));
  const promo = catalog.offersInCategory('beauty').find((o) => /подружка/i.test(o.name));
  const hero = h('section', { class: 'city-hero' },
    h('div', { class: 'city-hero-art', 'aria-hidden': 'true' }, art('hero-front.png', 'city-hero-image')),
    h('h1', null, 'Кэшбэк дня 30% в Подружке'),
    button({ class: 'city-details', onClick: () => promo && nav.push('/offer/' + promo.id) }, 'Подробнее'));

  const input = h('input', { type: 'search', placeholder: 'Поиск', 'aria-label': 'Поиск по ленте' });
  const search = h('label', { class: 'city-search' }, iconImg('city-search', { size: 24 }), input);
  const canvas = h('canvas', { class: 'city-liquid', width: 332, height: 300, 'aria-hidden': 'true' });
  const fuelLogo = art('fuel-logo.svg', 'city-fuel-logo');
  const motion = fuelMotion(el, canvas, fuelLogo);
  const badge = () => h('span', { class: 'city-badge' }, iconImg('city-shield', { size: 12 }), '20%');
  const fuel = button({ class: 'city-tile city-fuel', onClick: async () => {
    const request = orientationRequest ? null : requestCityOrientation();
    const result = await request;
    if (result !== null) toast(result ? 'Наклоните телефон' : 'Движение доступно при прокрутке');
    else show('Топливо', h('p', null, 'TEBOIL · АИ-95 от 75 ₽'));
  } }, canvas, h('span', { class: 'city-tile-title' }, 'Топливо', h('br'), 'АИ-95 • от 75 ₽'),
    h('span', { class: 'city-badges' }, badge(), fuelLogo));
  const grocery = button({ class: 'city-tile city-grocery', onClick: () => select('food') },
    art('grocery.png', 'city-grocery-art'), h('span', { class: 'city-tile-title' }, 'Супермаркеты'),
    h('span', { class: 'city-badges' }, badge(), h('span', { class: 'city-badge city-mandarins' }, 'мандарины 30%')));
  const categories = [['fun', 'Афиша', 'fun'], ['hotels', 'Отели', 'travel'], ['beauty', 'Красота', 'beauty'], ['clothes', 'Одежда', 'clothes'], ['home', 'Мебель', 'home']];
  const shortcuts = categories.map(([image, name, category]) => button({
    class: 'city-shortcut', dataset: { category }, 'aria-pressed': 'false', onClick: () => select(category),
  }, h('span', { class: 'city-shortcut-icon city-icon-' + image }, iconImg('city-' + image, { size: 28 })), name));

  const feed = h('section', { class: 'city-feed grid', 'aria-label': 'Лента выгоды' });
  const src = catalog.goodsModerated.length ? catalog.goodsModerated : catalog.goods;
  const getGoods = (cat) => (src.find((group) => group.id === cat)?.products || []).map(goodsCard);
  const offers = (cat) => catalog.offersInCategory(cat).map((offer) => offerCard(offer));
  const tech = getGoods('electronics');
  const phone = tech.findIndex((card) => /iphone.*pro/i.test(card.textContent));
  if (phone > 0) tech.unshift(...tech.splice(phone, 1));
  const goods = [...tech.slice(0, 18), ...getGoods('home').slice(0, 4), ...tech.slice(18, 23)];
  const partner = [...offers('electronics').slice(0, 2), ...offers('shopping').slice(0, 1)];
  const ad = bannerCard({ id: 'city-pets', category: 'pets', title: 'Товары\nдля питомцев\nс кэшбэком 10%', image: asset('pet-ad.png'), textColor: 'dark' });
  ad.classList.add('city-ad');
  const initial = goods.flatMap((card, i) => [card, i === 0 ? ad : null, i % 9 === 8 ? partner[Math.floor(i / 9)] : null].filter(Boolean));
  const filtered = new Map();
  let category = '';
  function render() {
    if (category && !filtered.has(category)) filtered.set(category, [...getGoods(category), ...offers(category)]);
    const query = input.value.trim().toLocaleLowerCase('ru-RU');
    const items = (filtered.get(category) || initial).filter((card) => !query || card.textContent.toLocaleLowerCase('ru-RU').includes(query));
    feed.replaceChildren(...(items.length ? items : [h('p', { class: 'city-empty' }, 'Ничего не найдено')]));
  }
  function select(next) {
    category = category === next ? '' : next;
    for (const shortcut of shortcuts) shortcut.setAttribute('aria-pressed', String(shortcut.dataset.category === category));
    render();
    feed.scrollIntoView({ block: 'start' });
  }
  input.addEventListener('input', render);
  render();
  el.append(header, hero, search, h('nav', { 'aria-label': 'Сервисы Города' },
    h('div', { class: 'city-tiles' }, fuel, grocery), h('div', { class: 'city-shortcuts' }, shortcuts)), feed);
  return {
    appbar: false,
    onActive: () => motion.start(),
    onInactive: () => motion.stop(),
    destroy() { motion.stop(); sheet?.close({ instant: true }); },
  };
}
