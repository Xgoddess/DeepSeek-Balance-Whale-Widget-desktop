
const fs = require('node:fs');
const l = fs.readFileSync('D:/Wideget/src-tauri/src/lib.rs', 'utf8');
// 提取命令列表和关键函数签名
const lines = l.split('\n');
console.log('=== 命令函数签名 ===');
for (let i = 0; i < lines.length; i++) {
  if (/^(async )?fn (get_|set_|save_)/.test(lines[i])) console.log(lines[i].trim());
}
console.log('=== generate_handler ===');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('generate_handler')) {
    for (let j = i; j < i + 10 && j < lines.length; j++) console.log(lines[j]);
  }
}
