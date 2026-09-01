
const fs = require('node:fs');
const s = fs.readFileSync('D:/Wideget/dist/widget.js', 'utf8');
const lines = s.split('\n');
function dump(name, n) {
  const i = lines.findIndex(l => l.indexOf(name) !== -1);
  if (i < 0) { console.log('!! 未找到 ' + name); return; }
  console.log('===== ' + name + ' (line ' + (i+1) + ') =====');
  for (let j = i; j < i + n && j < lines.length; j++) console.log(String(j+1) + ': ' + lines[j]);
}
['function endDrag','function snapCheck','function settle','function startDrag','function onDocPointerMove','function saveConfig','function applyAnchorPos'].forEach(n => dump(n, 45));
