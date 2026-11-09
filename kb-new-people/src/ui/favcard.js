// Блок «Мое любимое». Один компонент для главной (live) и для макета в шагах 3–5 онбординга (preview).
// variant: 'default' | 'boost' (+15%: v1 — к первому офферу, v2 — см. boostTarget) | 'replace' (акция закончилась, показываем замену)
// look: 'v1' — чипсы брендов; 'v2' — сценарий 04 (макет 668:149352): логотипы с плашкой процента,
// кнопка «+»; в строках процент и полное название оффера.

import { h, img, iconImg, icon, button, wait } from '../core/dom.js';
import { animate, EASE, settle, reducedMotion } from '../core/motion.js';
import { haptics } from '../core/haptics.js';
import { store } from '../core/store.js';
import { fmt } from '../domain/catalog.js';
import { app } from '../app.js';
import { chip, cell, cardHeader, setChipActive, badge } from './components.js';

// Какой вид «Мое любимое» в каком сценарии. Старый вид (v1, чипсы) не удалён:
// чтобы вернуть его сценарию, поставьте здесь 'v1'.
const LOOK_BY_SCENARIO = { s1: 'v2', s2: 'v2', s3: 'v1', s4: 'v1', s5: 'v1' };
export const favLook = (scenario) => LOOK_BY_SCENARIO[scenario] || 'v1';

// Повышенный кэшбэк (v2): на шаге «Сообщим, когда кэшбэк вырастет» он растёт у второго выбранного
// бренда (если выбран один — у него), у самого жирного предложения. Включили уведомления —
// рост засчитывается и переезжает на главную (store.state.boost), «Не сейчас» — нет.
export const BOOST = 15;
export function boostTarget() {
  const ids = store.state.favBrands.filter((id) => app.catalog.getBrand(id));
  const brandId = ids.length >= 2 ? ids[1] : ids[0];
  const top = brandId ? app.catalog.topOffer(brandId) : null;
  return top && top.type !== 'points' ? { brandId, offerId: top.id } : null;
}

export function favCard({ mode = 'live', variant: initialVariant = 'default', look = 'v1' } = {}) {
  let variant = initialVariant;
  const live = mode === 'live';
  const v2 = look === 'v2';
  const root = h('section', { class: `card favcard favcard-${mode} favcard-${variant} ${v2 ? 'favcard-v2' : ''}`, 'aria-label': 'Мое любимое' });
  let selected = null;
  let unsub = null;

  const brands = () => store.state.favBrands.map((id) => app.catalog.getBrand(id)).filter(Boolean);

  // у кого вырос кэшбэк: в макете онбординга — на шаге «рост», на главной — если его засчитали
  function boosted() {
    if (!v2) return null;
    if (live) {
      const b = store.state.boost;
      return b && store.isFav(b.brandId) ? b : null;
    }
    return variant === 'boost' ? boostTarget() : null;
  }

  function render() {
    const list = brands();
    // на главной сразу открыт бренд с повышенным кэшбэком — видно, что рост засчитан
    if (!list.some((b) => b.id === selected)) selected = (live && boosted()?.brandId) || list[0]?.id || null;

    // подзаголовка нет; пока ничего не лайкнули (сценарий 03), на его месте подсказка
    root.replaceChildren(cardHeader({
      title: 'Мое любимое',
      subtitle: list.length ? null : ['Отмечайте бренды сердечком —', h('br'), 'их предложения появятся здесь'],
      link: 'Все',
      onLink: live ? () => app.nav.push('/favorites') : null,
    }));
    const link = root.querySelector('.card-link');
    if (!live && link) { link.disabled = true; link.tabIndex = -1; }

    if (!list.length) {
      root.classList.add('is-empty');
      return;
    }
    root.classList.remove('is-empty');

    if (v2) {
      root.append(logosRow(list));
      root.append(h('div', { class: 'favcard-list' }, renderList()));
      syncBadge();
      return;
    }
    const chips = h('div', { class: 'chips-line', role: 'tablist', 'aria-label': 'Любимые бренды' },
      list.map((b) => {
        const c = chip({
          label: b.name,
          logo: b.logo,
          size: 's',
          active: b.id === selected,
          onClick: live ? () => select(b.id) : null,
        });
        c.dataset.brand = b.id;
        if (!live) { c.tabIndex = -1; c.disabled = true; }
        return c;
      }));
    root.append(h('div', { class: 'chips-scroll' }, chips));
    root.append(h('div', { class: 'favcard-list' }, renderList()));
    syncBadge();
  }

  // v2: ряд логотипов. Над каждым — плашка с самым большим кэшбэком бренда; выбранный логотип
  // с небольшим скруглением, остальные круглые и чуть прозрачные. «+» — добавить бренды.
  function logosRow(list) {
    const items = list.map((b) => {
      const top = app.catalog.topOffer(b.id);
      const el = button({
        class: `fav-logo ${b.id === selected ? 'is-active' : ''}`,
        role: 'tab',
        'aria-selected': String(b.id === selected),
        'aria-label': `${b.name}${top ? `, кэшбэк ${top.short}` : ''}`,
        dataset: { brand: b.id },
      },
      h('span', { class: 'fav-logo-pic' }, img(b.logo, { alt: '', width: 56, height: 56, fallback: b.name })),
      top ? h('span', { class: 'fav-logo-badge' }, top.short) : null);
      if (live) el.addEventListener('click', () => select(b.id));
      else { el.tabIndex = -1; el.disabled = true; }
      return el;
    });
    const add = button({ class: 'fav-logo fav-logo-add', 'aria-label': 'Добавить бренды' }, h('span', { class: 'fav-logo-pic' }, icon('add', { size: 28 })));
    if (live) add.addEventListener('click', () => app.nav.push('/brands'));
    else { add.tabIndex = -1; add.disabled = true; }
    return h('div', { class: 'fav-logos-scroll' }, h('div', { class: 'fav-logos', role: 'tablist', 'aria-label': 'Любимые бренды' }, items, add));
  }

  // На шаге «замена акции» у выбранного бренда появляется бейдж — там изменения.
  function syncBadge() {
    if (v2) {
      // v2: у бренда с ростом плашка зеленеет со стрелкой, в «замене» у выбранного — красный счётчик
      const up = boosted();
      for (const el of root.querySelectorAll('.fav-logo[data-brand]')) {
        const on = el.dataset.brand === selected;
        const isUp = up?.brandId === el.dataset.brand;
        const pill = el.querySelector('.fav-logo-badge');
        el.classList.toggle('is-active', on);
        el.classList.toggle('is-up-host', isUp);
        el.setAttribute('aria-selected', String(on));
        if (!pill) continue;
        const top = app.catalog.topOffer(el.dataset.brand);
        pill.className = 'fav-logo-badge';
        pill.textContent = top?.short || '';
        if (isUp && top) {
          pill.classList.add('is-up');
          pill.textContent = `${top.short.replace(/\d+/, (n) => String(Number(n) + BOOST))}↗`;
        } else if (on && variant === 'replace') {
          pill.classList.add('is-count');
          pill.textContent = '1';
        }
      }
      return root.querySelector('.fav-logo-badge.is-up, .fav-logo.is-active .fav-logo-badge.is-count');
    }
    root.querySelectorAll('.chip-badge').forEach((b) => b.remove());
    if (variant !== 'replace') return;
    const active = root.querySelector('.chip.is-active');
    if (!active) return;
    const b = badge(1);
    b.classList.add('chip-badge');
    active.append(b);
    return b;
  }

  function renderList() {
    const offers = app.catalog.offersOfBrand(selected);
    if (variant === 'replace') {
      const brand = app.catalog.getBrand(selected);
      const similar = app.catalog.similarOffers(selected, 2);
      if (v2) {
        // замена: офферы других брендов — с маленьким логотипом и полным названием
        return [
          h('div', { class: 'favcard-info favcard-info-v2' }, `${fmt.brandPrep(brand)} акции закончились. Подобрали похожие предложения`),
          ...similar.map((o) => {
            const c = cell(o, { interactive: false });
            c.querySelector('.cell-title').prepend(h('span', { class: 'cell-logo' }, img(o.logo, { alt: '', width: 20, height: 20, fallback: o.name })));
            c.querySelector('.row-dot').textContent = ' ';
            return c;
          }),
        ];
      }
      return [
        h('div', { class: 'favcard-info' }, iconImg('info-circle', { size: 24 }), h('span', null, `${fmt.brandPrep(brand)} акции закончились. Подобрали похожие предложения`)),
        ...similar.map((o) => h('div', { class: 'mini-row' },
          h('span', { class: 'avatar', style: { width: '48px', height: '48px' } }, img(o.logo, { alt: '', width: 48, height: 48, fallback: o.name })),
          h('span', { class: 'mini-row-text' },
            h('span', { class: 'mini-row-title' }, h('b', null, o.cashback), ' • ', o.name),
            h('span', { class: 'mini-row-sub' }, o.condition)))),
      ];
    }
    const shown = live ? offers : offers.slice(0, 2);
    // v1 — рост у первого предложения выбранного бренда; v2 — у бренда из boosted()
    const up = v2 ? boosted() : (variant === 'boost' ? { brandId: selected, offerId: offers[0]?.id } : null);
    const here = up && up.brandId === selected;
    return shown.map((o) => {
      if (here && o.id === up.offerId && o.type !== 'points') {
        const value = `${o.cashback.replace(/\d+/, (n) => String(Number(n) + BOOST))}`;
        const c = cell(o, { interactive: live });
        c.classList.add('is-boosted');
        c.querySelector('.cell-value').replaceWith(h('span', { class: 'cell-value boost' },
          h('span', { class: 'boost-old' }, o.cashback), h('span', { class: 'boost-arrow' }, ' → '),
          h('span', { class: 'boost-new', dataset: { from: String(o.value), to: String(o.value + BOOST) } }, value)));
        if (v2) toSource(c);
        return c;
      }
      const c = cell(o, { interactive: live });
      if (here && !live) c.classList.add('is-dim');
      if (v2) toSource(c);
      return c;
    });
  }

  // v2: в строке процент и полное название оффера через пробел, без точки
  function toSource(c) {
    c.querySelector('.row-dot').textContent = ' ';
  }

  function select(id) {
    if (id === selected) return;
    selected = id;
    haptics.selection();
    for (const c of root.querySelectorAll('.chip')) setChipActive(c, c.dataset.brand === id);
    if (v2) syncBadge();
    const listEl = root.querySelector('.favcard-list');
    const h0 = listEl.offsetHeight;
    listEl.replaceChildren(...renderList());
    const h1 = listEl.offsetHeight;
    if (h0 !== h1) animate(listEl, [{ height: `${h0}px` }, { height: `${h1}px` }], { duration: 300, easing: EASE.ios, fill: 'none' });
    return animate(listEl, [{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 240, easing: EASE.out });
  }

  // v2, шаг «рост»: сначала зеленеет плашка у бренда с ростом, потом он сам выбирается
  // (логотип становится квадратным) и в его строке проигрывается рост кэшбэка
  async function runBoost() {
    const up = boosted();
    if (!v2 || !up || up.brandId === selected) return playBoost();
    await wait(reducedMotion() ? 0 : 700);
    if (variant !== 'boost' || !root.isConnected) return;
    await select(up.brandId);
    playBoost();
  }

  // Смена состояния без пересоздания карточки: чипсы и логотипы остаются, меняется только список.
  async function setVariant(next) {
    if (next === variant) return;
    const listEl = root.querySelector('.favcard-list');
    const h0 = listEl.offsetHeight;
    await animate(listEl, [{ opacity: 1 }, { opacity: 0 }], { duration: 140, easing: EASE.in });
    root.classList.replace(`favcard-${variant}`, `favcard-${next}`);
    variant = next;
    // акция закончилась у первого бренда — после роста на втором выбор возвращается к первому
    if (v2 && next === 'replace') selected = brands()[0]?.id || selected;
    listEl.replaceChildren(...renderList());
    const newBadge = syncBadge();
    const h1 = listEl.offsetHeight;
    animate(listEl, [{ height: `${h0}px` }, { height: `${h1}px` }], { duration: 420, easing: EASE.ios, fill: 'none' });
    if (next === 'replace') {
      // строки замены появляются по очереди — одной анимацией, без повторного проявления
      const items = [...listEl.children];
      items.forEach((x) => { x.style.opacity = '0'; });
      settle(listEl);
      listEl.style.opacity = '1';
      await Promise.all(items.map((x, i) => animate(x, [{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'none' }], { duration: 360, delay: 60 + i * 90, easing: EASE.out }).then(() => { x.style.opacity = ''; })));
      listEl.style.opacity = '';
    } else {
      await animate(listEl, [{ opacity: 0 }, { opacity: 1 }], { duration: 260, delay: 80, easing: EASE.out });
    }
    // v2: плашка уже на месте — только мягко «вздыхает», без исчезновения (иначе казалось, что она моргает)
    if (newBadge) {
      const frames = v2
        ? [{ transform: 'scale(1)' }, { transform: 'scale(1.12)' }, { transform: 'scale(1)' }]
        : [{ transform: 'scale(0)' }, { transform: 'scale(1.3)' }, { transform: 'scale(1)' }];
      animate(newBadge, frames, { duration: 420, easing: EASE.spring, fill: 'none' });
    }
    // не ждём: кнопка шага доступна, пока плашка и выбор бренда доигрывают
    if (next === 'boost') runBoost();
  }

  // Рост кэшбэка: подсветка строки, старое значение зачёркивается, новое «досчитывает» на +15%.
  function playBoost() {
    const row = root.querySelector('.cell.is-boosted');
    const num = row?.querySelector('.boost-new');
    if (!row || !num) return;
    const from = Number(num.dataset.from);
    const to = Number(num.dataset.to);
    const tpl = num.textContent;
    row.classList.add('is-glow');
    animate(row.querySelector('.boost-old'), [{ opacity: 1 }, { opacity: 0.45 }], { duration: 300, delay: 150 });
    // стрелка серая, как старый процент слева
    animate(row.querySelector('.boost-arrow'), [{ opacity: 0, transform: 'translateX(-6px)' }, { opacity: 0.45, transform: 'none' }], { duration: 300, delay: 200 });
    const t0 = performance.now() + 250;
    const dur = 800;
    const tick = (t) => {
      const p = Math.min(1, Math.max(0, (t - t0) / dur));
      const eased = 1 - (1 - p) ** 3;
      num.textContent = tpl.replace(/\d+/, String(Math.round(from + (to - from) * eased)));
      if (p < 1) requestAnimationFrame(tick);
      else animate(num, [{ transform: 'scale(1)' }, { transform: 'scale(1.18)' }, { transform: 'scale(1)' }], { duration: 380, easing: EASE.spring, fill: 'none' });
    };
    requestAnimationFrame(tick);
  }

  render();
  if (live) {
    unsub = store.subscribe((_, change) => {
      if (change.type === 'fav' || change.type === 'reset' || change.type === 'boost') render();
    });
  }

  root.destroy = () => unsub?.();
  root.rerender = render;
  root.setVariant = setVariant;
  root.playBoost = runBoost;
  return root;
}
