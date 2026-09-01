
const fs = require('node:fs');
const s = fs.readFileSync('D:/Wideget/dist/widget.js', 'utf8');
const lines = s.split('\n');
function show(a, b, label) {
  console.log('===== ' + label + ' (line ' + a + '-' + b + ') =====');
  for (let i = a; i <= b && i <= lines.length; i++) {
    console.log(String(i) + ': ' + lines[i-1]);
  }
}
show(803, 832, 'snapCheck 完整');
show(1030, 1135, '初始化恢复(get_config)');
