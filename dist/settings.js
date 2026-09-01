var __T = window.__TAURI__;
var invoke = __T && __T.core && __T.core.invoke ? __T.core.invoke.bind(__T.core) : function () { return Promise.reject(new Error('tauri unavailable')); };

function load() {
  invoke('get_api_key').then(function (k) { document.getElementById('apiKey').value = k || ''; }).catch(function () {});
}

document.getElementById('save').addEventListener('click', function () {
  var k = document.getElementById('apiKey').value.trim();
  var st = document.getElementById('status');
  invoke('set_api_key', { key: k }).then(function () {
    st.textContent = '已保存';
    setTimeout(function () { st.textContent = ''; }, 2000);
  }).catch(function (e) {
    st.textContent = '保存失败: ' + e;
  });
});

load();
