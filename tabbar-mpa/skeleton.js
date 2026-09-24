(function () {
  'use strict';
  var tiles = document.querySelectorAll('.tile');
  var baseDelay = 480 + Math.random() * 180;
  tiles.forEach(function (tile, i) {
    setTimeout(function () {
      var skeleton = tile.querySelector('.tile-skeleton');
      tile.classList.remove('is-loading');
      if (!skeleton) return;
      skeleton.classList.add('hide');
      skeleton.addEventListener('transitionend', function () {
        skeleton.remove();
      }, { once: true });
    }, baseDelay + i * 60);
  });
})();
