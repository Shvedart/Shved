(function () {
  'use strict';
  /*
   * "Фейковая" push/pop-анимация для настоящих MPA-переходов:
   * 1) при клике по ссылке проигрываем анимацию ухода текущей страницы,
   * 2) только потом — реальный переход браузера на новый URL,
   * 3) новая страница сразу стартует со сдвинутой позиции и доезжает до места.
   * Работает в любом браузере (никаких экспериментальных API), а если JS
   * недоступен — ссылки обычные, переход просто мгновенный без анимации.
   */
  var KEY = 'tb_enter_anim';
  var EXIT_DURATION = 220;

  var screen = document.getElementById('screen-content');
  if (!screen) return;

  // ---- вход: доигрываем анимацию появления, если пришли по push/pop ----
  var enter = document.documentElement.getAttribute('data-enter');
  try {
    sessionStorage.removeItem(KEY);
  } catch (e) {}

  if (enter === 'push' || enter === 'pop') {
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        // снятие атрибута возвращает transform/opacity дим-слоя к базовым
        // правилам — это и запускает переход к состоянию "на месте"
        document.documentElement.removeAttribute('data-enter');
        screen.style.transform = 'translateX(0)';
      });
    });
  }

  // ---- выход: перехватываем клики по push/pop-ссылкам ----
  var links = document.querySelectorAll('[data-nav="push"], [data-nav="pop"]');
  links.forEach(function (link) {
    link.addEventListener('click', function (event) {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return; // открытие в новой вкладке и т.п. — не трогаем
      }
      var href = link.getAttribute('href');
      if (!href) return;

      event.preventDefault();
      var nav = link.getAttribute('data-nav');

      try {
        sessionStorage.setItem(KEY, nav);
      } catch (e) {}

      if (nav === 'push') {
        // уходящий (текущий) экран сдвигается назад и слегка темнеет —
        // ровно как поведение "предыдущего" экрана при нативном push
        screen.style.transform = 'translateX(-25%)';
        screen.classList.add('is-dimmed');
      } else {
        // при "назад" уходящий (текущий, самый верхний) экран просто
        // уезжает вправо целиком, без затемнения
        screen.style.transform = 'translateX(100%)';
      }

      setTimeout(function () {
        window.location.href = href;
      }, EXIT_DURATION);
    });
  });
})();
