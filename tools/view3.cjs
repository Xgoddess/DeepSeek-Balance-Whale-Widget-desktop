
const fs = require('node:fs');
const s = fs.readFileSync('D:/Wideget/src-tauri/src/lib.rs', 'utf8');
const lines = s.split('\n');
for (let i = 297; i <= 355 && i <= lines.length; i++) {
  console.log(String(i) + ': ' + lines[i-1]);
}
