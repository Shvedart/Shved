// Навигация со стеком страниц поверх History API.
// Push и pop — парные горизонтальные переходы в духе iOS, модальные экраны выезжают снизу.
// Предыдущие страницы остаются в DOM, поэтому возврат восстанавливает их состояние.

import { h } from './dom.js';
import { animate, EASE, reducedMotion } from './motion.js';

const STANDALONE = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
const DUR = 460;

export function createRouter({ stage, routes, appbar, fallback = '/' }) {
  const stack = []; // { path, idx, screen, el, route }
  let busy = Promise.resolve();
  let lastEdgeTouch = 0;
  let pendingTarget = null;

  const dim = h('div', { class: 'page-dim', 'aria-hidden': 'true' });
  stage.append(dim);
  // Затемнение — цветом фона, а не opacity: Safari на iOS красит статус-бар по фону верхнего элемента, даже прозрачного.
  const shade = (a) => `rgba(0,0,0,${a})`;

  function match(path) {
    for (const route of routes) {
      const m = path.match(route.pattern);
      if (m) return { route, params: m.groups || {} };
    }
    return null;
  }

  function currentPath() {
    const hash = location.hash.replace(/^#/, '');
    return hash || '/';
  }

  function top() {
    return stack[stack.length - 1];
  }

  function mount(path) {
    let found = match(path);
    if (!found) {
      path = fallback;
      found = match(path);
    }
    const { route, params } = found;
    const el = h('main', { class: `page ${route.modal ? 'is-modal' : ''}`, tabindex: '-1' });
    const entry = { path, route, params, el, screen: null, idx: 0 };
    entry.screen = route.create({ params, el, nav: api, entry });
    if (entry.screen.appbar !== false) el.classList.add('has-appbar');
    stage.append(el);
    return entry;
  }

  function activate(entry) {
    for (const e of stack) {
      const isTop = e === entry;
      if (!isTop && !e.el.inert) e.screen.onInactive?.();
      e.el.inert = !isTop;
      e.el.setAttribute('aria-hidden', isTop ? 'false' : 'true');
      // верхняя страница лежит над затемнением, затемняется только та, что уходит назад
      e.el.classList.toggle('is-front', isTop);
    }
    appbar.setFor(entry);
    entry.screen.onActive?.();
    requestAnimationFrame(() => entry.el.focus({ preventScroll: true }));
  }

  function cover(entries) {
    for (const e of entries) e.el.classList.add('is-covered');
  }

  function destroy(entry) {
    entry.screen.destroy?.();
    entry.el.remove();
  }

  function queue(fn) {
    busy = busy.then(fn, fn);
    return busy;
  }

  // ---------- Анимации переходов ----------

  async function animatePush(from, to, { modal = false } = {}) {
    if (!from || reducedMotion()) {
      if (from) cover([from]);
      if (reducedMotion() && from) await animate(to.el, [{ opacity: 0 }, { opacity: 1 }], { duration: 160 });
      to.el.getAnimations().forEach((a) => a.cancel());
      return;
    }
    if (modal) {
      await Promise.all([
        animate(to.el, [{ transform: 'translateY(100%)', borderRadius: `var(--r-page) var(--r-page) 0 0` }, { transform: 'translateY(0)', borderRadius: '0' }], { duration: DUR, easing: EASE.ios }),
        animate(dim, [{ backgroundColor: shade(0) }, { backgroundColor: shade(0.25) }], { duration: DUR, easing: EASE.ios }),
        animate(from.el, [{ transform: 'scale(1)' }, { transform: 'scale(0.96)' }], { duration: DUR, easing: EASE.ios }),
      ]);
    } else {
      await Promise.all([
        animate(to.el, [{ transform: 'translateX(100%)', borderRadius: 'var(--r-page)', boxShadow: '0 0 30px rgba(0,0,0,.12)' }, { transform: 'translateX(0)', borderRadius: '0', boxShadow: '0 0 30px rgba(0,0,0,0)' }], { duration: DUR, easing: EASE.ios }),
        animate(from.el, [{ transform: 'translateX(0)' }, { transform: 'translateX(-30%)' }], { duration: DUR, easing: EASE.ios }),
        animate(dim, [{ backgroundColor: shade(0) }, { backgroundColor: shade(0.08) }], { duration: DUR, easing: EASE.ios }),
      ]);
    }
    cover([from]);
    for (const el of [to.el, from.el, dim]) el.getAnimations().forEach((a) => a.cancel());
  }

  async function animatePop(from, to, { modal = false, progress = 0 } = {}) {
    to.el.classList.remove('is-covered');
    if (reducedMotion()) {
      await animate(from.el, [{ opacity: 1 }, { opacity: 0 }], { duration: 140 });
      return;
    }
    const dur = Math.max(180, DUR * (1 - progress));
    if (modal) {
      await Promise.all([
        animate(from.el, [{ transform: 'translateY(0)', borderRadius: '0' }, { transform: 'translateY(100%)', borderRadius: 'var(--r-page) var(--r-page) 0 0' }], { duration: DUR * 0.85, easing: EASE.ios }),
        animate(dim, [{ backgroundColor: shade(0.25) }, { backgroundColor: shade(0) }], { duration: DUR * 0.85, easing: EASE.ios }),
        animate(to.el, [{ transform: 'scale(0.96)' }, { transform: 'scale(1)' }], { duration: DUR * 0.85, easing: EASE.ios }),
      ]);
    } else {
      const start = `${progress * 100}%`;
      await Promise.all([
        animate(from.el, [{ transform: `translateX(${start})`, borderRadius: 'var(--r-page)', boxShadow: '0 0 30px rgba(0,0,0,.12)' }, { transform: 'translateX(100%)', borderRadius: 'var(--r-page)', boxShadow: '0 0 30px rgba(0,0,0,0)' }], { duration: dur, easing: EASE.ios }),
        animate(to.el, [{ transform: `translateX(${-30 * (1 - progress)}%)` }, { transform: 'translateX(0)' }], { duration: dur, easing: EASE.ios }),
        animate(dim, [{ backgroundColor: shade(0.08 * (1 - progress)) }, { backgroundColor: shade(0) }], { duration: dur, easing: EASE.ios }),
      ]);
    }
    for (const el of [to.el, dim]) el.getAnimations().forEach((a) => a.cancel());
  }

  // ---------- Операции стека ----------

  function doPush(path, { replace = false } = {}) {
    return queue(async () => {
      const from = top();
      const to = mount(path);
      to.idx = from ? (replace ? from.idx : from.idx + 1) : 0;
      const state = { idx: to.idx, path: to.path };
      if (replace) history.replaceState(state, '', `#${to.path}`);
      else history.pushState(state, '', `#${to.path}`);
      stack.push(to);
      activate(to);
      appbar.transition('push');
      await animatePush(from, to, { modal: to.route.modal });
      if (replace && from) {
        stack.splice(stack.indexOf(from), 1);
        destroy(from);
      }
    });
  }

  // Возврат к записи стека (или к новой, если её нет — после перезагрузки).
  function doPopTo(targetPath, { animateIt = true } = {}) {
    return queue(async () => {
      const from = top();
      let targetIndex = -1;
      for (let i = stack.length - 2; i >= 0; i--) {
        if (stack[i].path === targetPath) { targetIndex = i; break; }
      }
      let to;
      if (targetIndex >= 0) {
        to = stack[targetIndex];
      } else {
        to = mount(targetPath);
        to.idx = Math.max(0, from.idx - 1);
        stage.insertBefore(to.el, from.el);
        stack.splice(stack.length - 1, 0, to);
        targetIndex = stack.length - 2;
      }
      const removed = stack.splice(targetIndex + 1);
      // промежуточные страницы убираем сразу, анимируем только верхнюю
      for (const e of removed) if (e !== from) destroy(e);
      from.el.classList.add('is-leaving');
      activate(to);
      appbar.transition('pop');
      if (animateIt) await animatePop(from, to, { modal: from.route.modal });
      else to.el.classList.remove('is-covered');
      destroy(from);
    });
  }

  function parentOf(entry) {
    const p = entry.route.parent;
    if (typeof p === 'function') return p(entry.params) || fallback;
    return p || fallback;
  }

  // ---------- Публичное API ----------

  const api = {
    get top() {
      return top();
    },
    get stack() {
      return stack;
    },
    push(path) {
      return doPush(path);
    },
    replace(path) {
      return doPush(path, { replace: true });
    },
    // Назад по истории; если истории нет (открыли по ссылке) — к логическому родителю.
    back() {
      const t = top();
      if (!t) return;
      if (t.idx > 0) {
        history.back();
      } else {
        const parent = parentOf(t);
        history.replaceState({ idx: t.idx, path: parent }, '', `#${parent}`);
        doPopTo(parent);
      }
    },
    // Вернуться к конкретному экрану (например, «назад» из онбординга ведёт на разводящую).
    popTo(path) {
      const t = top();
      const target = [...stack].reverse().find((e) => e.path === path && e !== t);
      if (target && t.idx - target.idx > 0) {
        pendingTarget = path;
        history.go(target.idx - t.idx);
      } else if (t.idx > 0) {
        pendingTarget = path;
        history.go(-t.idx);
      } else {
        history.replaceState({ idx: 0, path }, '', `#${path}`);
        doPopTo(path);
      }
    },
    // Обновить адрес текущего экрана без перехода (шаги внутри одной страницы).
    setPath(path, entry = top()) {
      if (!entry) return;
      entry.path = path;
      if (entry === top()) history.replaceState({ idx: entry.idx, path }, '', `#${path}`);
    },
    start() {
      const path = currentPath();
      const to = mount(path);
      to.idx = history.state?.idx ?? 0;
      history.replaceState({ idx: to.idx, path: to.path }, '', `#${to.path}`);
      stack.push(to);
      activate(to);
      appbar.transition('none');
    },
  };

  window.addEventListener('popstate', (e) => {
    const state = e.state || { idx: (top()?.idx ?? 0) + 1, path: currentPath() };
    const t = top();
    const skipAnim = !STANDALONE && Date.now() - lastEdgeTouch < 900; // браузер уже показал свой свайп
    if (pendingTarget) {
      const target = pendingTarget;
      pendingTarget = null;
      if (state.path !== target) history.replaceState({ idx: state.idx, path: target }, '', `#${target}`);
      doPopTo(target, { animateIt: !skipAnim });
      return;
    }
    if (!t || state.idx < t.idx || (state.idx === t.idx && state.path !== t.path && stack.some((s) => s.path === state.path))) {
      doPopTo(state.path, { animateIt: !skipAnim });
    } else if (state.idx > t.idx) {
      // вперёд по истории
      queue(async () => {
        const from = top();
        const to = mount(state.path);
        to.idx = state.idx;
        stack.push(to);
        activate(to);
        appbar.transition('push');
        await animatePush(from, to, { modal: to.route.modal });
      });
    } else if (state.path !== t.path) {
      api.replace(state.path);
    }
  });

  // Отмечаем касания у края, чтобы не дублировать нативный свайп Safari своей анимацией.
  window.addEventListener('touchstart', (e) => {
    const x = e.touches[0]?.clientX ?? 100;
    if (x < 28 || x > window.innerWidth - 28) lastEdgeTouch = Date.now();
  }, { passive: true, capture: true });

  return api;
}
