
const fs = require('node:fs');
const s = fs.readFileSync('D:/Wideget/dist/widget.js', 'utf8');
const lines = s.split('\n');
function show(a, b, label) {
  console.log('===== ' + label + ' (line ' + a + '-' + b + ') =====');
  for (let i = a; i <= b && i <= lines.length; i++) {
    console.log(String(i) + ': ' + lines[i-1]);
  }
}
show(137, 196, '菜单行构建');
show(284, 306, 'buildGroup1');
show(498, 510, 'render hint');
show(555, 565, 'refresh todayUsage');
show(600, 648, '变量+saveConfig+setUsageMode');
show(1065, 1076, '初始化恢复');
