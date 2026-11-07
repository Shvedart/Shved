// Обёртки над Web Animations API с учётом prefers-reduced-motion.

const mq = window.matchMedia('(prefers-reduced-motion: reduce)');

export const reducedMotion = () => mq.matches;

export const EASE = {
  ios: 'cubic-bezier(0.32, 0.72, 0, 1)',
  out: 'cubic-bezier(0.22, 1, 0.36, 1)',
  in: 'cubic-bezier(0.4, 0, 1, 1)',
  spring: 'cubic-bezier(0.34, 1.4, 0.64, 1)',
};

// Запускает анимацию и возвращает промис окончания. При reduced motion — мгновенно применяет конечный кадр.
export function animate(el, keyframes, options = {}) {
  if (!el || !el.animate) return Promise.resolve();
  const opts = { duration: 300, easing: EASE.out, fill: 'both', ...options };
  if (reducedMotion()) {
    const last = Array.isArray(keyframes) ? keyframes[keyframes.length - 1] : keyframes;
    const softened = Array.isArray(keyframes) && 'opacity' in last ? [{ opacity: keyframes[0].opacity ?? 1 }, { opacity: last.opacity }] : [last, last];
    opts.duration = Math.min(opts.duration, 120);
    opts.delay = 0;
    const anim = el.animate(softened, opts);
    return anim.finished.catch(() => {});
  }
  const anim = el.animate(keyframes, opts);
  return anim.finished.catch(() => {});
}

// Последовательное появление списка элементов.
export function stagger(els, keyframes, { step = 40, ...options } = {}) {
  return Promise.all([...els].map((el, i) => animate(el, keyframes, { ...options, delay: (options.delay || 0) + i * step })));
}

// Снимает застывшие (fill: both) анимации, чтобы вернуть элементу стили из CSS.
export function settle(el) {
  if (!el || !el.getAnimations) return;
  for (const a of el.getAnimations()) a.cancel();
}

export const fadeUpIn = [
  { opacity: 0, transform: 'translateY(24px)' },
  { opacity: 1, transform: 'translateY(0)' },
];

export const fadeUpOut = [
  { opacity: 1, transform: 'translateY(0)' },
  { opacity: 0, transform: 'translateY(-16px)' },
];

export const fadeDownIn = [
  { opacity: 0, transform: 'translateY(-14px)' },
  { opacity: 1, transform: 'translateY(0)' },
];

export const fadeDownOut = [
  { opacity: 1, transform: 'translateY(0)' },
  { opacity: 0, transform: 'translateY(14px)' },
];
