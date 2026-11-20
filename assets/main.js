/* 万灵屿 - 启动入口 */
(function () {
  'use strict';

  var booted = false;

  function setStartupStatus(text, hidden) {
    var el = document.getElementById('startup-status');
    if (!el) return;
    el.textContent = text;
    if (hidden) el.classList.add('is-hidden');
  }

  function boot() {
    if (booted) return;
    booted = true;
    window.Core.initViewport();

    window.Core.loadState().then(function () {
      window.UI.init();
      window.UI.show('world');
      document.body.classList.add('is-ready');
      setStartupStatus('小岛已就绪', true);

      if (window.Core.didStorageReadFail()) {
        window.UI.toast('存档读取失败，已使用新存档');
      } else if (!window.Core.isStorageAvailable()) {
        setTimeout(function () {
          window.UI.toast('当前环境不支持本地存档，本次进度仅在本次打开期间保留');
        }, 900);
      }
    }).catch(function () {
      setStartupStatus('小岛加载失败，请退出后重新打开', false);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
}());
