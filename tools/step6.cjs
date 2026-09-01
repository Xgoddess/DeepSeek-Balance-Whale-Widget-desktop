
const fs = require('node:fs');
let s = fs.readFileSync('D:/Wideget/dist/widget.js', 'utf8');

function rep(old, neu, label) {
  const i = s.indexOf(old);
  if (i < 0) { console.log('FAIL ' + label); return; }
  s = s.slice(0, i) + neu + s.slice(i + old.length);
  console.log('OK ' + label);
}

// 1. render hint 恢复「今日已用」
rep("    hint = state.isPeak ? '高峰时段' : '空闲时段'",
    "    hint = '今日已用 ' + (state.todayUsage !== null && state.todayUsage !== undefined ? fmt(state.todayUsage, state.currency) : '--')",
    "render hint 今日已用");

// 2. buildGroup1 恢复「今日已用」行
rep("    { t: peak ? peakText : offText, s: 'P', c: peak ? '#e0433f' : '#2fa24c' },\n  ]",
    "    { t: peak ? peakText : offText, s: 'P', c: peak ? '#e0433f' : '#2fa24c' },\n    { t: '今日已用 ' + fmt(state.todayUsage, state.currency), s: 'C', c: '' },\n  ]",
    "buildGroup1 今日已用");

// 3. refresh 恢复 todayUsage 赋值
rep("        state.isPeak = !!data.isPeak",
    "        state.todayUsage = data.todayUsage !== undefined ? data.todayUsage : null\n        state.isPeak = !!data.isPeak",
    "refresh todayUsage 赋值");

fs.writeFileSync('D:/Wideget/dist/widget.js', s, 'utf8');
console.log('len', s.length);
