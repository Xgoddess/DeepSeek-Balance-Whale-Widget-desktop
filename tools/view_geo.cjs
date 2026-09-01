
const fs = require('node:fs');
const s = fs.readFileSync('D:/Wideget/dist/widget.js', 'utf8');
const lines = s.split('\n');
// 找 viewport、monitorAt、currentMonitor、get_screen_info 使用、applyScreenInfo
function dump(name) {
  const i = lines.findIndex(l => l.indexOf('function ' + name) !== -1);
  if (i < 0) { console.log('!! 未找到 ' + name); return; }
  console.log('===== ' + name + ' (line ' + (i+1) + ') =====');
  for (let j = i; j < i + 20 && j < lines.length; j++) console.log(String(j+1) + ': ' + lines[j]);
}
['viewport','monitorAt','currentMonitor','applyScreenInfo'].forEach(dump);
// 找 get_screen_info 调用处
console.log('===== get_screen_info 调用 ====');
lines.forEach((l, i) => { if (l.includes('get_screen_info') || l.includes('monitors')) console.log(String(i+1) + ': ' + l); });
