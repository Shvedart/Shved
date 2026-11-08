// Конфетти (Lottie) поверх экрана. Слой не ловит касания — кнопки под ним нажимаются как обычно.
// Плеер lottie_light лежит в assets/vendor и подгружается только при первом показе.

const PLAYER = 'assets/vendor/lottie_light.min.js';
const CONFETTI = 'assets/lottie/confetti.json';

let playerLoad = null;
function loadPlayer() {
  if (window.lottie) return Promise.resolve(window.lottie);
  if (!playerLoad) {
    playerLoad = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = PLAYER;
      s.onload = () => resolve(window.lottie);
      s.onerror = reject;
      document.head.append(s);
    });
  }
  return playerLoad;
}

// Показывает конфетти один раз поверх host; возвращает функцию, которая убирает слой раньше времени.
export function playConfetti(host) {
  const layer = document.createElement('div');
  layer.className = 'confetti-layer';
  layer.setAttribute('aria-hidden', 'true');
  host.append(layer);
  let anim = null;
  let gone = false;
  const remove = () => {
    if (gone) return;
    gone = true;
    anim?.destroy();
    layer.remove();
  };
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    remove();
    return remove;
  }
  loadPlayer().then((lottie) => {
    if (gone || !lottie) return;
    anim = lottie.loadAnimation({
      container: layer,
      renderer: 'svg',
      loop: false,
      autoplay: true,
      path: CONFETTI,
      // на весь экран: лишнее по краям обрезается, а не сжимается
      rendererSettings: { preserveAspectRatio: 'xMidYMid slice' },
    });
    anim.addEventListener('complete', remove);
  }).catch(remove);
  return remove;
}
