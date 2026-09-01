
const fs = require('node:fs');
let s = fs.readFileSync('D:/Wideget/dist/widget.js', 'utf8');

function rep(old, neu, label) {
  const i = s.indexOf(old);
  if (i < 0) { console.log('FAIL ' + label); return; }
  s = s.slice(0, i) + neu + s.slice(i + old.length);
  console.log('OK ' + label);
}
function del(old, label) { rep(old, '', label); }

// 1. 删除 usageSelect 创建
del("var usageSelect = document.createElement('select')\nusageSelect.className = 'dshwv-sound'\nusageSelect.appendChild(soundOpt('ledger', '小鲸鱼记账 (推荐)'))\nusageSelect.appendChild(soundOpt('token', '实时·令牌 (用法：去问dsh)'))\nusageSelect.addEventListener('change', function () { setUsageMode(usageSelect.value) })\n", "usageSelect 创建");

// 2. 删除 row4 创建
del("var row4 = menuRow()\nrow4.appendChild(menuLabel('用量'))\nrow4.appendChild(usageSelect)\n", "row4 创建");

// 3. 删除 menuBox.appendChild(row4)
del("menuBox.appendChild(row4)\n", "append row4");

// 4. buildGroup1 删除「今日已用」行
del("    { t: '今日已用 ' + fmt(state.todayUsage, state.currency), s: 'C', c: '' },\n", "buildGroup1 今日已用");

// 5. render hint 改为峰谷信息
rep("    hint = '今日已用 ' + (state.todayUsage !== null && state.todayUsage !== undefined ? fmt(state.todayUsage, state.currency) : '--')",
    "    hint = state.isPeak ? '高峰时段' : '空闲时段'", "render hint");

// 6. refresh 删除 todayUsage 赋值
del("        state.todayUsage = data.todayUsage !== undefined ? data.todayUsage : null\n", "refresh todayUsage");

// 7. 删除 usageMode 变量
del("var usageMode = 'ledger'\n", "usageMode 变量");

// 8. saveConfig 删除 usageMode
rep("invoke('save_config', { cfg: { scale: state.scale, sound: soundOn, vol: soundVol, soundSet: soundSet, usageMode: usageMode, peakMode: peakMode, bubbleOn: bubbleOn } })",
    "invoke('save_config', { cfg: { scale: state.scale, sound: soundOn, vol: soundVol, soundSet: soundSet, peakMode: peakMode, bubbleOn: bubbleOn } })", "saveConfig usageMode");

// 9. 删除 setUsageMode 函数
del("function setUsageMode(v) {\n  usageMode = v === 'token' ? 'token' : 'ledger'\n  usageSelect.value = usageMode\n  saveConfig()\n  refresh(false)\n}\n", "setUsageMode 函数");

// 10. 删除初始化恢复 usageMode
del("    if (d && typeof d.usageMode === 'string') {\n      usageMode = d.usageMode === 'token' ? 'token' : 'ledger'\n      usageSelect.value = usageMode\n    }\n", "初始化恢复 usageMode");

fs.writeFileSync('D:/Wideget/dist/widget.js', s, 'utf8');
console.log('len', s.length);
