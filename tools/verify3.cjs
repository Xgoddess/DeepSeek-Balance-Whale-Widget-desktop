
const fs = require('node:fs');
const w = fs.readFileSync('D:/Wideget/dist/widget.js', 'utf8');
const l = fs.readFileSync('D:/Wideget/src-tauri/src/lib.rs', 'utf8');
console.log('=== widget.js 关键引用 ===');
for (const c of ['todayUsage', '今日已用', 'usageMode', 'usageSelect']) {
  console.log(c + ': ' + (w.split(c).length - 1));
}
console.log('=== lib.rs 关键引用 ===');
for (const c of ['ledger', 'record_usage', 'today_usage', 'load_ledger', 'save_ledger', 'get_virtual_screen', 'GetSystemMetrics', 'platform_token', 'usage_mode']) {
  console.log(c + ': ' + (l.split(c).length - 1));
}
