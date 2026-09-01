
const fs = require('node:fs');
const w = fs.readFileSync('D:/Wideget/dist/widget.js', 'utf8');
const l = fs.readFileSync('D:/Wideget/src-tauri/src/lib.rs', 'utf8');
console.log('=== widget.js 关键引用 ===');
for (const c of ['monitors', 'currentMonitor', 'monitorAt', 'get_screen_info', 'workAreas']) {
  console.log(c + ': ' + (w.split(c).length - 1));
}
console.log('=== lib.rs 关键引用 ===');
for (const c of ['get_screen_info', 'get_all_work_areas', 'EnumDisplayMonitors', 'GetMonitorInfoW', 'MonitorInfoW', 'WorkArea', 'ScreenInfo']) {
  console.log(c + ': ' + (l.split(c).length - 1));
}
