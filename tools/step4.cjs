const fs=require('node:fs');
let s=fs.readFileSync('D:/Wideget/dist/widget.step3.js','utf8');
const NL=String.fromCharCode(10);

const invokeCode = "var __T = window.__TAURI__" + NL +
  "var invoke = __T && __T.core && __T.core.invoke ? function (cmd, args) { return __T.core.invoke(cmd, args) } : function () { return Promise.reject(new Error('tauri unavailable')) }";

const mk1 = "window.__dshWhaleWidget = true" + NL + NL;
if (s.indexOf(mk1) >= 0) { s = s.replace(mk1, mk1 + invokeCode + NL + NL); console.log('OK invoke-inject'); } else console.log('FAIL invoke-inject');

const passthrough = [
"// —— 桌面版：点击穿透（窗口全屏透明，非挂件区域穿透）——",
"var tauriWin = (window.__TAURI__ && window.__TAURI__.window && window.__TAURI__.window.getCurrentWindow) ? window.__TAURI__.window.getCurrentWindow() : null",
"var cursorPosFn = (window.__TAURI__ && window.__TAURI__.window && window.__TAURI__.window.cursorPosition) ? window.__TAURI__.window.cursorPosition : null",
"var scaleFactor = 1",
"var winX = 0",
"var winY = 0",
"var geoReady = false",
"if (tauriWin) {",
"  Promise.all([tauriWin.scaleFactor(), tauriWin.outerPosition()]).then(function (r) {",
"    scaleFactor = r[0]",
"    winX = r[1].x",
"    winY = r[1].y",
"    geoReady = true",
"  }).catch(function () { geoReady = true })",
"}",
"function interactiveRect() {",
"  var r = root.getBoundingClientRect()",
"  var pad = 12",
"  var x1 = r.left - pad",
"  var y1 = r.top - pad",
"  var x2 = r.right + pad",
"  var y2 = r.bottom + pad",
"  if (menuOpen) {",
"    var m = menuBox.getBoundingClientRect()",
"    x1 = Math.min(x1, m.left - pad)",
"    y1 = Math.min(y1, m.top - pad)",
"    x2 = Math.max(x2, m.right + pad)",
"    y2 = Math.max(y2, m.bottom + pad)",
"  }",
"  return { x1: x1, y1: y1, x2: x2, y2: y2 }",
"}",
"var ignoring = true",
"if (tauriWin && cursorPosFn) {",
"  setInterval(function () {",
"    if (!geoReady) return",
"    cursorPosFn().then(function (pos) {",
"      var rx = (pos.x - winX) / scaleFactor",
"      var ry = (pos.y - winY) / scaleFactor",
"      var rc = interactiveRect()",
"      var inside = rx >= rc.x1 && rx <= rc.x2 && ry >= rc.y1 && ry <= rc.y2",
"      if (inside === ignoring) {",
"        ignoring = !inside",
"        tauriWin.setIgnoreCursorEvents(ignoring).catch(function () {})",
"      }",
"    }).catch(function () {})",
"  }, 50)",
"}"
].join(NL);

const mk2 = "setInterval(function () { refresh(false) }, REFRESH_MS)" + NL;
if (s.indexOf(mk2) >= 0) { s = s.replace(mk2, mk2 + NL + passthrough + NL + NL + "})()" + NL); console.log('OK end-inject'); } else console.log('FAIL end-inject');

fs.writeFileSync('D:/Wideget/dist/widget.js', s, 'utf8');
console.log('len', s.length);
