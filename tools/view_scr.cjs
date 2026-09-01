
const fs = require('node:fs');
const s = fs.readFileSync('D:/Wideget/dist/widget.js', 'utf8');
const lines = s.split('\n');
for (let i = 1040; i < 1090 && i < lines.length; i++) console.log(String(i+1) + ': ' + lines[i]);
