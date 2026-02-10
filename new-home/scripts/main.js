/* Placeholder for future interactions.
   Keep JS minimal to ensure fast load. */
document.documentElement.classList.add('js');

// Inline TGS/Lottie sticker on Home (replaces 👋)
(() => {
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const loadLottie = (el, path, { loop, autoplay, frame = 0 } = {}) => {
    if (!el) return null;
    if (!window.lottie) return null;
    el.innerHTML = '';

    const anim = window.lottie.loadAnimation({
      container: el,
      renderer: 'svg',
      loop: !!loop,
      autoplay: !!autoplay,
      path,
    });

    if (!autoplay) {
      anim.addEventListener('DOMLoaded', () => {
        try { anim.goToAndStop(frame, true); } catch (_) {}
      }, { once: true });
    }

    return anim;
  };

  // 👋 in hero (может играть)
  loadLottie(document.getElementById('hi-sticker'), './tgs/hi-sticker-2.json', {
    loop: prefersReduced ? false : true,
    autoplay: prefersReduced ? false : true,
    frame: 0,
  });

  // TG stickers: в покое не играют, на hover — оранжевая версия
  const tgEls = document.querySelectorAll('.tg-sticker[data-lottie-idle][data-lottie-hover]');
  tgEls.forEach((el) => {
    const idle = el.getAttribute('data-lottie-idle');
    const hover = el.getAttribute('data-lottie-hover');
    if (!idle || !hover) return;

    let anim = loadLottie(el, idle, { loop: false, autoplay: false, frame: 0 });
    const host = el.closest('a') || el;

    const toHover = () => {
      if (anim) { try { anim.destroy(); } catch (_) {} }
      anim = loadLottie(el, hover, { loop: prefersReduced ? false : true, autoplay: prefersReduced ? false : true, frame: 0 });
      if (prefersReduced && anim) {
        try { anim.goToAndStop(0, true); } catch (_) {}
      }
    };

    const toIdle = () => {
      if (anim) { try { anim.destroy(); } catch (_) {} }
      anim = loadLottie(el, idle, { loop: false, autoplay: false, frame: 0 });
    };

    host.addEventListener('pointerenter', toHover);
    host.addEventListener('pointerleave', toIdle);
    host.addEventListener('focusin', toHover);
    host.addEventListener('focusout', toIdle);
  });
})();

// Drag-to-scroll for horizontal galleries
document.querySelectorAll('.gallery[data-drag-scroll="true"]').forEach((el) => {
  let isDown = false;
  let startX = 0;
  let scrollLeft = 0;

  el.addEventListener('pointerdown', (e) => {
    // left click / primary touch only
    if (typeof e.button === 'number' && e.button !== 0) return;
    e.preventDefault();
    isDown = true;
    el.classList.add('is-dragging');
    try { el.setPointerCapture(e.pointerId); } catch (_) {}
    startX = e.clientX;
    scrollLeft = el.scrollLeft;
  });

  el.addEventListener('pointermove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const dx = e.clientX - startX;
    el.scrollLeft = scrollLeft - dx;
  });

  const stop = () => {
    isDown = false;
    el.classList.remove('is-dragging');
  };

  el.addEventListener('pointerup', stop);
  el.addEventListener('pointercancel', stop);
  el.addEventListener('mouseleave', stop);
});

// Sound toggles for reel videos (only one can be unmuted at a time)
(() => {
  // UX: когда звук ВЫКЛЮЧЕН — показываем иконку "включить звук"
  // когда звук ВКЛЮЧЕН — показываем иконку "выключить звук"
  const ICON_ENABLE = './icons/volume_up_24dp_E3E3E3_FILL0_wght300_GRAD0_opsz24.svg';
  const ICON_DISABLE = './icons/no_sound_24dp_E3E3E3_FILL0_wght300_GRAD0_opsz24%201.svg';

  const groups = document.querySelectorAll('[data-sound-group]');
  groups.forEach((group) => {
    const buttons = group.querySelectorAll('[data-sound-toggle][aria-controls]');

    const setBtnState = (btn, isMuted) => {
      btn.setAttribute('aria-pressed', String(!isMuted));
      btn.setAttribute('aria-label', isMuted ? 'Включить звук' : 'Выключить звук');
      const img = btn.querySelector('img');
      if (img) img.src = isMuted ? ICON_ENABLE : ICON_DISABLE;
    };

    const muteAllExcept = (exceptVideo) => {
      group.querySelectorAll('video').forEach((v) => {
        if (v !== exceptVideo) v.muted = true;
      });
      buttons.forEach((btn) => {
        const id = btn.getAttribute('aria-controls');
        const v = id ? group.querySelector(`#${CSS.escape(id)}`) : null;
        setBtnState(btn, !v || v.muted);
      });
    };

    // Ensure default muted + correct icon state
    muteAllExcept(null);

    buttons.forEach((btn) => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('aria-controls');
        if (!id) return;
        const video = group.querySelector(`#${CSS.escape(id)}`);
        if (!(video instanceof HTMLVideoElement)) return;

        const willUnmute = video.muted;
        if (willUnmute) {
          muteAllExcept(video);
          video.muted = false;
          try { await video.play(); } catch (_) {}
        } else {
          video.muted = true;
        }

        setBtnState(btn, video.muted);
      });
    });
  });
})();

// Lite YouTube: replace poster with iframe on click
document.querySelectorAll('.yt-lite[data-youtube-id]').forEach((el) => {
  const id = el.getAttribute('data-youtube-id');
  if (!id) return;

  const onActivate = () => {
    const src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&controls=1&modestbranding=1&rel=0&iv_load_policy=3&playsinline=1`;
    el.innerHTML = `<iframe class="embed__iframe" src="${src}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;
  };

  el.addEventListener('click', onActivate, { once: true });
  el.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onActivate();
    }
  });
});

// Skeleton loading for media (img/video/iframe)
(() => {
  const selector = [
    'img.media',
    'img.gallery__img',
    'img.yt-lite__thumb',
    'video.media',
    'video.gallery__item',
    'video.reel__video',
    'iframe.embed__iframe',
    'iframe.overlay-iframe',
    'iframe.iframe-size-parallax',
    'iframe.iframe-size-parallax-3',
    'iframe.iframe-size-shapelax',
    'iframe.iframe-size-shapelax-3',
  ].join(',');

  const els = document.querySelectorAll(selector);
  els.forEach((el) => {
    // Exclude tiny icons
    if (el.classList.contains('sound-btn__icon')) return;

    el.classList.add('is-loading');

    const done = () => el.classList.remove('is-loading');
    const failSafe = window.setTimeout(done, 15000);

    const finish = () => {
      window.clearTimeout(failSafe);
      done();
    };

    if (el instanceof HTMLImageElement) {
      if (el.complete && el.naturalWidth > 0) return finish();
      el.addEventListener('load', finish, { once: true });
      el.addEventListener('error', finish, { once: true });
      return;
    }

    if (el instanceof HTMLVideoElement) {
      if (el.readyState >= 2) return finish();
      el.addEventListener('loadeddata', finish, { once: true });
      el.addEventListener('error', finish, { once: true });
      return;
    }

    if (el instanceof HTMLIFrameElement) {
      // iframe load fires when document is ready enough
      el.addEventListener('load', finish, { once: true });
      return;
    }

    // Fallback
    finish();
  });
})();


