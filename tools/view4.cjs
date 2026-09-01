
const fs = require('node:fs');
const s = fs.readFileSync('D:/Wideget/dist/widget.js', 'utf8');
const lines = s.split('\n');
function show(a, b, label) {
  console.log('===== ' + label + ' (line ' + a + '-' + b + ') =====');
  for (let i = a; i <= b && i <= lines.length; i++) {
    console.log(String(i) + ': ' + lines[i-1]);
  }
}
show(445, 460, 'viewport + rightGap');
show(503, 545, 'express + settle');
show(785, 805, 'snapCheck');
show(901, 915, 'onDocPointerMove');
show(951, 995, 'endDrag');
show(995, 1030, 'applyAnchorPos');
