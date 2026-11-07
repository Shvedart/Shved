// Онбординг сценариев 01 (лайк оффера) и 02 (лайк бренда).
// Шаги 1–2 — одна страница с разными состояниями (фреймы 635:122720, 122749, 637:140273, 635:126132, 126159).
// Шаги 3–5 — итог: успех, уведомления, замена акции (фреймы 635:123799, 124374, 124960, 125539).

import { h, iconImg, icon, img, plural, wait } from '../core/dom.js';
import { animate, EASE, stagger, fadeUpIn, fadeUpOut, fadeDownIn, fadeDownOut, reducedMotion } from '../core/motion.js';
import { haptics } from '../core/haptics.js';
import { store } from '../core/store.js';
import { chip, offerRow, brandRow, primaryButton, linkButton, cardMini, setChipActive } from '../ui/components.js';
import { favCard } from '../ui/favcard.js';
import { app } from '../app.js';

const RESULT = {
  3: { icon: 'success', title: ['Предложения', 'любимых брендов', 'уже доступны'], variant: 'default', cta: 'Дальше', caption: 'Избранное теперь всегда под рукой' },
  4: { icon: 'bell', title: ['Сообщим, когда', 'кэшбэк вырастет'], variant: 'boost', cta: 'Включить уведомления', secondary: 'Не сейчас' },
  5: { icon: 'info-circle', title: ['Акция', 'закончится,', 'найдём похожую'], variant: 'replace', cta: 'Готово', caption: 'Всё готово, осталось совсем чуть-чуть' },
};

export function onboardingScreen({ el, params, nav, entry }) {
  const scenario = params.s;
  const byBrand = scenario === 's2';
  const cfg = app.catalog.config.onboarding;
  let step = Math.min(5, Math.max(1, Number(params.step) || 1));
  if (step > 2 && !store.hasAnyFav()) step = 1;
  let busy = false;
  let hintTimer = 0;
  let hintPlayed = false;
  const cleanups = [];

  el.classList.add('onb');

  // ---------- Шаги 1–2 ----------
  const pkTile = cardMini({ flat: true });
  cleanups.push(pkTile.destroy);
  const titleEl = h('h1', { class: 'onb-title' });
  const subEl = h('p', { class: 'onb-sub' });
  const header = h('div', { class: 'onb-header' }, titleEl, subEl);
  const chips = [cfg.step1, cfg.step2].map((s, i) => {
    const c = chip({ label: s.chip, active: i + 1 === step, onClick: () => goPick(i + 1) });
    c.dataset.step = String(i + 1);
    return c;
  });
  const listEl = h('div', { class: 'onb-list' });
  const moreEl = h('p', { class: 'onb-more' }, cfg.moreText);
  const ctaBtn = primaryButton('', { onClick: onPickCta });
  const footnote = h('p', { class: 'onb-footnote' }, icon('heart-filled', { size: 16, cls: 'onb-footnote-heart' }), h('span', { class: 'onb-footnote-text' }));
  const pickBar = h('div', { class: 'bottom-bar onb-bar' }, ctaBtn, footnote);
  const pick = h('div', { class: 'onb-pick screen-flex' },
    h('div', { class: 'onb-pk' }, pkTile),
    header,
    h('div', { class: 'chips-line onb-chips', role: 'tablist', 'aria-label': 'Шаги подборки' }, chips),
    listEl,
    moreEl,
    pickBar);

  // ---------- Шаги 3–5 ----------
  const resIcon = h('div', { class: 'res-icon' });
  const resTitle = h('h1', { class: 'res-title' });
  const phoneSlot = h('div', { class: 'phone-slot' });
  // Макет телефона (фрейм 645:141288): главная на 20% прозрачности, снизу растворяется в белом.
  const streakDays = app.catalog.config.main.streak.days;
  const phone = h('div', { class: 'phone', 'aria-hidden': 'true' },
    h('div', { class: 'phone-ghost' },
      h('div', { class: 'phone-ghost-mini' }, h('span', null, app.catalog.config.month.title), h('span', { class: 'phone-ghost-dots' }, h('i'), h('i'), h('i'), h('i'))),
      h('div', { class: 'phone-ghost-card' },
        h('b', null, 'Подарим кэшбэк 99%'),
        h('b', null, 'на ', img('assets/img/yandex-plus.png', { cls: 'inline-logo', alt: '', width: 14, height: 14 }), ' Яндекс Плюс'),
        h('span', null, 'Если зайдёте сюда 5 дней подряд'),
        h('div', { class: 'phone-ghost-days' }, streakDays.map((d, i) => h('div', { class: `phone-ghost-day ${i === 0 ? 'is-done' : ''} ${d.gift ? 'is-gift' : ''}` }, h('small', null, d.dow), d.day))),
        h('b', { class: 'phone-ghost-sub' }, 'Доступно уже сегодня'),
        h('div', { class: 'phone-ghost-values' }, h('b', null, '50%'), h('b', null, '40%')))),
    phoneSlot);
  const resPrimary = primaryButton('', { onClick: onResultCta });
  const resSecondary = linkButton('', { onClick: onResultCta, cls: 'res-secondary' });
  const resCaption = h('p', { class: 'res-caption' });
  const resBar = h('div', { class: 'bottom-bar res-bar' }, resPrimary, resSecondary, resCaption);
  const result = h('div', { class: 'onb-result screen-flex', hidden: true },
    resIcon,
    resTitle,
    h('div', { class: 'phone-wrap' }, phone, h('div', { class: 'phone-fade', 'aria-hidden': 'true' })),
    resBar);

  el.append(pick, result);

  // ---------- Рендер шага выбора ----------
  function stepCfg(n) {
    return n === 1 ? cfg.step1 : cfg.step2;
  }

  function rowsFor(n) {
    return stepCfg(n).brands
      .map((id) => app.catalog.getBrand(id))
      .filter(Boolean)
      .slice(0, 6)
      .map((brand) => {
        if (byBrand) return brandRow(brand);
        const offer = app.catalog.topOffer(brand.id);
        return offer ? offerRow(offer) : null;
      })
      .filter(Boolean);
  }

  function setTexts(n) {
    const s = stepCfg(n);
    titleEl.replaceChildren(...s.title.flatMap((line, i) => (i ? [h('br'), line] : [line])));
    subEl.textContent = s.subtitle;
    ctaBtn.querySelector('.btn-label').textContent = s.cta;
    updateFootnote();
  }

  function updateFootnote() {
    const text = footnote.querySelector('.onb-footnote-text');
    if (step === 1 || !store.hasAnyFav()) {
      text.textContent = 'Можно выбрать без ограничений';
      return;
    }
    const n = store.state.favBrands.reduce((sum, id) => sum + app.catalog.offersOfBrand(id).length, 0);
    text.textContent = `Уже сохранили ${n} ${plural(n, 'предложение', 'предложения', 'предложений')}`;
  }

  function renderPick({ animateIn = false } = {}) {
    setTexts(step);
    listEl.replaceChildren(...rowsFor(step));
    chips.forEach((c) => setChipActive(c, c.dataset.step === String(step)));
    app.appbar.patch(entry, { progress: step / 5 });
    if (animateIn) {
      // при открытии список появляется сверху вниз
      stagger(listEl.children, [{ opacity: 0, transform: 'translateY(-14px)' }, { opacity: 1, transform: 'none' }], { duration: 380, step: 60, delay: 120, easing: EASE.out });
    }
  }

  // Смена шага 1 ↔ 2: строки уходят вверх, новые приходят снизу — по одной.
  async function goPick(n) {
    if (busy || n === step) return;
    busy = true;
    clearTimeout(hintTimer);
    haptics.selection();
    const headerTop = header.offsetTop - parseFloat(getComputedStyle(el).paddingTop);
    if (el.scrollTop > headerTop) el.scrollTo({ top: headerTop, behavior: reducedMotion() ? 'auto' : 'smooth' });
    step = n;
    nav.setPath(`/onb/${scenario}/${n}`, entry);
    chips.forEach((c) => setChipActive(c, c.dataset.step === String(n)));
    app.appbar.patch(entry, { progress: n / 5 });
    await Promise.all([
      stagger(listEl.children, fadeUpOut, { duration: 200, step: 30, easing: EASE.in }),
      animate(header, fadeDownOut, { duration: 180, easing: EASE.in }),
    ]);
    setTexts(n);
    listEl.replaceChildren(...rowsFor(n));
    animate(header, fadeDownIn, { duration: 300, easing: EASE.out });
    await stagger(listEl.children, fadeUpIn, { duration: 360, step: 45, easing: EASE.out });
    busy = false;
  }

  function onPickCta() {
    if (step === 1) return goPick(2);
    if (!store.hasAnyFav()) {
      // ничего не лайкнули — сразу на главную в сценарий «упущенная выгода»
      haptics.light();
      nav.replace('/main/s3');
      return;
    }
    haptics.light();
    goResult(3, { intro: true });
  }

  // Подсказка: через 1,5 с сердечки по очереди загораются и гаснут. Не играет, если уже есть лайк.
  function scheduleHint() {
    if (step !== 1 || hintPlayed) return;
    hintTimer = setTimeout(async () => {
      if (store.hasAnyFav() || step !== 1 || app.nav.top !== entry) return;
      hintPlayed = true;
      const hearts = [...listEl.querySelectorAll('.row-heart')];
      for (const [i, heart] of hearts.entries()) {
        setTimeout(() => {
          if (store.hasAnyFav()) return;
          heart.classList.add('is-hint');
          animate(heart, [{ transform: 'rotate(0) scale(1)' }, { transform: 'rotate(-16deg) scale(1.2)' }, { transform: 'rotate(10deg) scale(1.1)' }, { transform: 'rotate(0) scale(1)' }], { duration: 460, easing: EASE.out });
          setTimeout(() => heart.classList.remove('is-hint'), 520);
        }, i * 110);
      }
    }, 1500);
  }

  const unsub = store.subscribe((_, change) => {
    if (change.type === 'fav') {
      updateFootnote();
      if (change.liked) clearTimeout(hintTimer);
    }
  });
  cleanups.push(unsub);

  // ---------- Шаги 3–5 ----------
  function setHeading(n) {
    const r = RESULT[n];
    resIcon.replaceChildren(r.icon === 'bell' ? h('span', { class: 'res-bell' }, icon('bell', { size: 36 })) : iconImg(r.icon, { size: r.icon === 'success' ? 44 : 40 }));
    resIcon.dataset.kind = r.icon;
    resTitle.replaceChildren(...r.title.flatMap((line, i) => (i ? [h('br'), line] : [line])));
  }

  function setBar(n) {
    const r = RESULT[n];
    resPrimary.querySelector('.btn-label').textContent = r.cta;
    resSecondary.textContent = r.secondary || '';
    resSecondary.hidden = !r.secondary;
    resCaption.textContent = r.caption || '';
    resCaption.hidden = !r.caption;
  }

  function setResultContent(n) {
    setHeading(n);
    phoneSlot.replaceChildren(favCard({ mode: 'preview', variant: RESULT[n].variant }));
    setBar(n);
    app.appbar.patch(entry, { progress: n / 5, heart: false });
  }

  // Шаг 3 → 4 → 5: телефон и кнопка остаются на месте, меняются иконка, заголовок,
  // содержимое карточки и подпись кнопки — состояние перетекает, а не перерисовывается.
  async function morphResult(n) {
    const r = RESULT[n];
    app.appbar.patch(entry, { progress: n / 5 });

    const card = phoneSlot.firstElementChild;
    const label = resPrimary.querySelector('.btn-label');
    const extras = [resSecondary, resCaption].filter((x) => !x.hidden);

    // 1. уходит старое: иконка и заголовок вверх, подписи кнопок гаснут
    await Promise.all([
      animate(resIcon, fadeUpOut, { duration: 180, easing: EASE.in }),
      animate(resTitle, fadeUpOut, { duration: 200, delay: 20, easing: EASE.in }),
      animate(label, [{ opacity: 1 }, { opacity: 0 }], { duration: 160 }),
      ...extras.map((x) => animate(x, [{ opacity: 1 }, { opacity: 0 }], { duration: 160 })),
    ]);

    // 2. меняем текст; телефон плавно съезжает на новое место, если заголовок стал выше или ниже
    const phoneTop = phone.getBoundingClientRect().top;
    setHeading(n);
    setBar(n);
    const shift = phoneTop - phone.getBoundingClientRect().top;
    if (shift) animate(phone, [{ transform: `translateY(${shift}px)` }, { transform: 'none' }], { duration: 460, easing: EASE.ios, fill: 'none' });

    // 3. та же карточка меняет содержимое — чипсы и логотипы не перерисовываются, ничего не мигает
    const cardDone = card.setVariant(r.variant);

    animate(resIcon, fadeUpIn, { duration: 380, easing: EASE.out });
    animate(resTitle, fadeUpIn, { duration: 400, delay: 50, easing: EASE.out });
    animate(label, [{ opacity: 0 }, { opacity: 1 }], { duration: 260, delay: 80 });
    [resSecondary, resCaption].filter((x) => !x.hidden).forEach((x) => animate(x, [{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 300, delay: 120, easing: EASE.out }));
    if (n === 4) {
      animate(resIcon.firstChild, [{ transform: 'rotate(0)' }, { transform: 'rotate(14deg)' }, { transform: 'rotate(-12deg)' }, { transform: 'rotate(8deg)' }, { transform: 'rotate(-4deg)' }, { transform: 'rotate(0)' }], { duration: 900, delay: 200, easing: 'ease-in-out', fill: 'none' });
    }
    await cardDone;
  }

  async function goResult(n, { intro = false, swap = false } = {}) {
    busy = true;
    step = n;
    nav.setPath(`/onb/${scenario}/${n}`, entry);
    if (intro) {
      // Шаг 2 → 3 внахлёст: список остаётся на месте и гаснет, а поверх уже проявляется галочка.
      const appbarH = parseFloat(getComputedStyle(el).paddingTop);
      const scrolled = el.scrollTop;
      pick.style.cssText = `position:absolute;left:0;right:0;top:${appbarH - scrolled}px;pointer-events:none;`;
      pick.inert = true;
      result.hidden = false;
      el.scrollTo({ top: 0 });
      setResultContent(n);
      animate(pick, [{ opacity: 1 }, { opacity: 0, transform: 'scale(.98)' }], { duration: 280, easing: EASE.out }).then(() => {
        pick.hidden = true;
        pick.style.cssText = '';
        pick.inert = false;
      });
      await playSuccessIntro();
    } else if (swap) {
      await morphResult(n);
    } else {
      pick.hidden = true;
      result.hidden = false;
      setResultContent(n);
      phoneSlot.firstChild.classList.add('is-front');
      if (n === 4) setTimeout(() => phoneSlot.firstChild?.playBoost(), 400);
    }
    busy = false;
  }

  // Большая зелёная галочка → уменьшается и уезжает вверх; снизу появляются заголовок, макет и кнопка.
  async function playSuccessIntro() {
    const others = [resTitle, phone, resBar];
    if (reducedMotion()) {
      phoneSlot.firstChild.classList.add('is-front');
      return;
    }
    others.forEach((x) => { x.style.opacity = '0'; });
    const rect = resIcon.getBoundingClientRect();
    const pageRect = el.getBoundingClientRect();
    const dy = pageRect.top + pageRect.height * 0.42 - (rect.top + rect.height / 2);
    haptics.success();
    await animate(resIcon, [{ transform: `translateY(${dy}px) scale(0)` }, { transform: `translateY(${dy}px) scale(2.4)` }, { transform: `translateY(${dy}px) scale(2.1)` }], { duration: 520, easing: EASE.spring });
    await wait(380);
    await animate(resIcon, [{ transform: `translateY(${dy}px) scale(2.1)` }, { transform: 'translateY(0) scale(1)' }], { duration: 520, easing: EASE.ios });
    others.forEach((x) => { x.style.opacity = ''; });
    await Promise.all(others.map((x, i) => animate(x, fadeUpIn, { duration: 460, delay: i * 90, easing: EASE.out })));
    await wait(350);
    // реальный блок избранного выходит на передний план
    phoneSlot.firstChild.classList.add('is-front');
  }

  function onResultCta(e) {
    if (busy) return;
    if (step === 3) { haptics.light(); return goResult(4, { swap: true }); }
    if (step === 4) {
      if (e?.currentTarget === resPrimary) haptics.success();
      else haptics.selection();
      return goResult(5, { swap: true });
    }
    if (step === 5) {
      haptics.success();
      store.completeOnboarding(scenario);
      app.flags.introFor = scenario;
      nav.replace(`/main/${scenario}`);
    }
  }

  // ---------- Старт ----------
  if (step <= 2) {
    renderPick({ animateIn: true });
    scheduleHint();
  } else {
    goResult(step);
  }

  return {
    appbar: { left: 'back', progress: step / 5, heart: step <= 2, onLeft: () => nav.popTo('/') },
    onActive() {
      if (step <= 2) updateFootnote();
    },
    destroy() {
      clearTimeout(hintTimer);
      cleanups.forEach((fn) => fn?.());
    },
  };
}
