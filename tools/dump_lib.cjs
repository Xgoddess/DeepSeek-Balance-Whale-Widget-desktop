
const fs = require('node:fs');
const s = fs.readFileSync('D:/Wideget/src-tauri/src/lib.rs', 'utf8');
console.log('=== lib.rs 总长: ' + s.length + ' ===');
console.log(s);
