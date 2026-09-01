
const fs = require('node:fs');
const s = fs.readFileSync('D:/Wideget/dist/widget.js', 'utf8');
const lines = s.split('\n');
// 找 scaleFactor / devicePixelRatio / cursorPosition / setIgnoreCursorEvents / scaleFactor 相关
const keys = ['scaleFactor', 'devicePixelRatio', 'cursorPosition', 'setIgnoreCursorEvents', 'cursorPosFn', 'winX', 'winY', 'scaleFactor'];
lines.forEach((l, i) => {
  if (keys.some(k => l.includes(k))) console.log(String(i+1) + ': ' + l);
});
