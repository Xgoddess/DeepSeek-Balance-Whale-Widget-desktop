
const fs = require('node:fs');
const s = fs.readFileSync('D:/Wideget/src-tauri/src/lib.rs', 'utf8');
const lines = s.split('\n');
function show(a, b, label) {
  console.log('===== ' + label + ' (line ' + a + '-' + b + ') =====');
  for (let i = a; i <= b && i <= lines.length; i++) {
    console.log(String(i) + ': ' + lines[i-1]);
  }
}
show(54, 122, 'pick_balance_info + fetch_balance');
show(123, 193, 'compute_today_usage + fetch_platform_usage');
show(194, 264, 'get_balance');
show(265, 303, 'config + api key + platform token 命令');
show(385, 447, 'setup_tray + run');
