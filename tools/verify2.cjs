
const fs = require('node:fs');
const w = fs.readFileSync('D:/Wideget/dist/widget.js', 'utf8');
const l = fs.readFileSync('D:/Wideget/src-tauri/src/lib.rs', 'utf8');
console.log('=== widget.js 残留 ===');
for (const c of ['usageMode','usageSelect','setUsageMode','实时·令牌','小鲸鱼记账','用量']) {
  console.log(c + ': ' + (w.split(c).length - 1));
}
console.log('todayUsage: ' + (w.split('todayUsage').length - 1));
console.log('isPeak: ' + (w.split('isPeak').length - 1));
console.log('=== lib.rs 残留 ===');
for (const c of ['compute_today_usage','fetch_platform_usage','platform_token','usage_mode','price_for','save_ledger','get_platform_token','set_platform_token']) {
  console.log(c + ': ' + (l.split(c).length - 1));
}
