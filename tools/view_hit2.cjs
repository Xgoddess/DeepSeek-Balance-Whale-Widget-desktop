
const fs = require('node:fs');
const s = fs.readFileSync('D:/Wideget/dist/widget.js', 'utf8');
const lines = s.split('\n');
for (let i = 1128; i < 1185 && i < lines.length; i++) console.log(String(i+1) + ': ' + lines[i]);
