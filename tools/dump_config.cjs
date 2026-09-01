
const fs = require('node:fs');
const s = fs.readFileSync('D:/Wideget/src-tauri/src/config.rs', 'utf8');
console.log('=== config.rs ===');
console.log(s);
