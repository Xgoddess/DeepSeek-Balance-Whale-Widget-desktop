const fs=require('node:fs');
let s=fs.readFileSync('D:/Wideget/dist/widget.step2.js','utf8');
function db(a,b,l){let i=s.indexOf(a);if(i<0){console.log('FAIL-start',l);return}let j=s.indexOf(b,i+a.length);if(j<0){console.log('FAIL-end',l);return}s=s.slice(0,i)+s.slice(j+b.length);console.log('OK',l)}
function dl(a,l){let i=s.indexOf(a);if(i<0){console.log('FAIL',l);return}s=s.slice(0,i)+s.slice(i+a.length);console.log('OK',l)}
function rp(a,b,l){let i=s.indexOf(a);if(i<0){console.log('FAIL',l);return}s=s.slice(0,i)+b+s.slice(i+a.length);console.log('OK',l)}

// URL 常量
rp("var BALANCE_URL = '/dsh-whale/balance.json'\nvar SIZE_URL = '/dsh-whale/size.json'\nvar IMG_URL = '/dsh-whale/image.png?v=2'\nvar GIF_URL = '/dsh-whale/rua.gif'",
   "var IMG_URL = 'assets/DSniang1.png'\nvar GIF_URL = 'assets/rua.gif'","url-const");

// refresh: fetch -> invoke
rp("  var ctrl = null\n  var timer = null\n  try {\n    ctrl = new AbortController()\n    timer = setTimeout(function () { try { ctrl.abort() } catch (err) {} }, FETCH_TIMEOUT_MS)\n  } catch (err) {}\n  fetch(BALANCE_URL, { cache: 'no-store', signal: ctrl ? ctrl.signal : undefined })\n    .then(function (r) { return r.json() })\n    .then(function (data) {",
   "  invoke('get_balance')\n    .then(function (data) {","refresh-fetch");
rp("    .finally(function () {\n      busy = false\n      if (timer) clearTimeout(timer)\n    })",
   "    .finally(function () {\n      busy = false\n    })","refresh-finally");

// saveConfig: fetch PUT -> invoke
rp("    fetch(SIZE_URL, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ scale: state.scale, sound: soundOn, vol: soundVol, soundSet: soundSet, usageMode: usageMode, peakMode: peakMode, bubbleOn: bubbleOn, turnCostOn: turnCostOn, turnCostCloseMs: turnCostCloseMs, scrollGapOn: scrollGapOn, scrollGapPx: scrollGapPx }) })",
   "    invoke('save_config', { cfg: { scale: state.scale, sound: soundOn, vol: soundVol, soundSet: soundSet, usageMode: usageMode, peakMode: peakMode, bubbleOn: bubbleOn } })","saveConfig-invoke");

// 音效路径
rp("    pressAudio = new Audio('/dsh-whale/sound/press.mp3?set=' + soundSet)",
   "    pressAudio = new Audio(soundSet === 'fx1' ? 'assets/D1.mp3' : 'assets/Ya1.mp3')","sound-press");
rp("    releaseAudio = new Audio('/dsh-whale/sound/release.mp3?set=' + soundSet)",
   "    releaseAudio = new Audio(soundSet === 'fx1' ? 'assets/D2.mp3' : 'assets/Ya2.mp3')","sound-release");

// 初始化 fetch(SIZE_URL) -> invoke('get_config')
rp("fetch(SIZE_URL, { cache: 'no-store' })\n  .then(function (r) { return r.json() })\n  .then(function (d) {",
   "invoke('get_config')\n  .then(function (d) {","init-fetch");

// 删除 pollLastTurn 整块
db("// —— 每轮对话消耗检测：轮询 last-turn.json，出现新 seq 时弹消耗金额泡泡 ——","setInterval(pollLastTurn, 1000)","pollLastTurn");

fs.writeFileSync('D:/Wideget/dist/widget.step3.js',s,'utf8');
console.log('len',s.length);
