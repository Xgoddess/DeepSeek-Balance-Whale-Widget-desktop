var __T = window.__TAURI__;
var invoke = __T && __T.core && __T.core.invoke ? __T.core.invoke.bind(__T.core) : function () { return Promise.reject(new Error('tauri unavailable')); };

function load() {
  invoke('get_api_key').then(function (k) { document.getElementById('apiKey').value = k || ''; }).catch(function () {});
  invoke('get_config').then(function (d) {
    if (d && typeof d.multiMonitor === 'boolean') {
      document.getElementById('multiMonitor').checked = d.multiMonitor;
    }
  }).catch(function () {});
}

document.getElementById('save').addEventListener('click', function () {
  var k = document.getElementById('apiKey').value.trim();
  var multi = document.getElementById('multiMonitor').checked;
  var st = document.getElementById('status');
  invoke('set_api_key', { key: k }).then(function () {
    return invoke('get_config').then(function (d) {
      var cfg = d || {};
      cfg.multiMonitor = multi;
      return invoke('save_config', { cfg: cfg });
    });
  }).then(function () {
    st.textContent = '已保存（多屏幕设置重启后生效）';
    setTimeout(function () { st.textContent = ''; }, 2500);
  }).catch(function (e) {
    st.textContent = '保存失败: ' + e;
  });
});

load();
