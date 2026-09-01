
const fs = require('node:fs');
const s = fs.readFileSync('D:/Wideget/dist/widget.js', 'utf8');
const lines = s.split('\n');
const start = lines.findIndex(l => l.indexOf('function settle()') !== -1);
for (let i = start; i < start + 35 && i < lines.length; i++) {
  console.log(String(i+1) + ': ' + lines[i]);
}
