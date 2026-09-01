
const fs = require('node:fs');
let s = fs.readFileSync('D:/Wideget/dist/widget.js', 'utf8');

function rep(old, neu, label) {
  const i = s.indexOf(old);
  if (i < 0) { console.log('FAIL ' + label); return; }
  s = s.slice(0, i) + neu + s.slice(i + old.length);
  console.log('OK ' + label);
}

// 1. viewport 后注入 monitors + monitorAt + currentMonitor
rep("function rightGap() {",
"// —— 多显示器工作区（吸附避让各显示器任务栏）——\nvar monitors = []\nfunction monitorAt(cx, cy) {\n  var best = null\n  var bd = Infinity\n  for (var i = 0; i < monitors.length; i++) {\n    var m = monitors[i]\n    if (cx >= m.x && cx < m.x + m.w && cy >= m.y && cy < m.y + m.h) return m\n    var mx = m.x + m.w / 2\n    var my = m.y + m.h / 2\n    var d = (cx - mx) * (cx - mx) + (cy - my) * (cy - my)\n    if (d < bd) { bd = d; best = m }\n  }\n  return best\n}\nfunction currentMonitor() {\n  var w = root.offsetWidth || root.getBoundingClientRect().width || 0\n  var h = root.offsetHeight || root.getBoundingClientRect().height || 0\n  var cx = state.left + w / 2\n  var cy = state.top + h / 2\n  return monitorAt(cx, cy)\n}\nfunction rightGap() {",
"inject monitors");

// 2. settle 改造
rep("function settle() {\n  var vp = viewport()\n  var w = root.offsetWidth || root.getBoundingClientRect().width || 0\n  var h = root.offsetHeight || root.getBoundingClientRect().height || 0\n  if (drag && drag.active) {\n    // mid-drag resize: keep the pointer-follow position, just clamp into view\n    state.left = clamp(state.left, 0, Math.max(0, vp.w - w - rightGap()))\n    state.top = clamp(state.top, 0, Math.max(0, vp.h - h))\n    express()\n    return\n  }\n  if (state.h === 'right') {\n    state.left = Math.max(0, vp.w - w - state.hOff - rightGap())\n  } else if (state.h === 'left') {\n    state.left = state.hOff\n  } else {\n    state.left = clamp(state.left, 0, Math.max(0, vp.w - w - rightGap()))\n  }  if (state.v === 'bottom') {\n    state.top = Math.max(0, vp.h - h - state.vOff)\n  } else if (state.v === 'top') {\n    state.top = state.vOff\n  } else {\n    state.top = clamp(state.top, 0, Math.max(0, vp.h - h))\n  }\n  express()\n}",
"function settle() {\n  var vp = viewport()\n  var m = currentMonitor() || { x: 0, y: 0, w: vp.w, h: vp.h }\n  var w = root.offsetWidth || root.getBoundingClientRect().width || 0\n  var h = root.offsetHeight || root.getBoundingClientRect().height || 0\n  if (drag && drag.active) {\n    // mid-drag resize: keep the pointer-follow position, just clamp into view\n    state.left = clamp(state.left, 0, Math.max(0, vp.w - w - rightGap()))\n    state.top = clamp(state.top, 0, Math.max(0, vp.h - h))\n    express()\n    return\n  }\n  if (state.h === 'right') {\n    state.left = Math.max(m.x, m.x + m.w - w - state.hOff - rightGap())\n  } else if (state.h === 'left') {\n    state.left = m.x + state.hOff\n  } else {\n    state.left = clamp(state.left, m.x, Math.max(m.x, m.x + m.w - w - rightGap()))\n  }\n  if (state.v === 'bottom') {\n    state.top = Math.max(m.y, m.y + m.h - h - state.vOff)\n  } else if (state.v === 'top') {\n    state.top = m.y + state.vOff\n  } else {\n    state.top = clamp(state.top, m.y, Math.max(m.y, m.y + m.h - h))\n  }\n  express()\n}",
"settle");

// 3. snapCheck 改造
rep("function snapCheck() {\n  var rect = root.getBoundingClientRect()\n  var vp = viewport()\n  var w = rect.width, h = rect.height\n  var left = rect.left, top = rect.top\n  var centerX = left + w / 2\n  var centerY = top + h / 2\n  var moved = false\n  if (centerX < vp.w / 4) {\n    state.h = 'left'\n    state.hOff = 0\n    left = 0\n    moved = true\n  } else if (centerX > vp.w * 3 / 4) {\n    state.h = 'right'\n    state.hOff = 0\n    left = vp.w - w - rightGap()\n    moved = true\n  } else {\n    state.h = null\n    state.hOff = left\n  }\n  if (centerY < vp.h / 4) {\n    state.v = 'top'\n    state.vOff = 0\n    top = 0\n    moved = true\n  } else {\n    state.v = 'bottom'\n    state.vOff = Math.max(0, vp.h - top - h)\n  }\n  if (moved) {\n    state.left = left\n    state.top = top\n    settle()\n  }\n}",
"function snapCheck() {\n  var rect = root.getBoundingClientRect()\n  var vp = viewport()\n  var w = rect.width, h = rect.height\n  var left = rect.left, top = rect.top\n  var centerX = left + w / 2\n  var centerY = top + h / 2\n  var m = currentMonitor() || { x: 0, y: 0, w: vp.w, h: vp.h }\n  var moved = false\n  if (centerX < m.x + m.w / 4) {\n    state.h = 'left'\n    state.hOff = 0\n    left = m.x\n    moved = true\n  } else if (centerX > m.x + m.w * 3 / 4) {\n    state.h = 'right'\n    state.hOff = 0\n    left = m.x + m.w - w - rightGap()\n    moved = true\n  } else {\n    state.h = null\n    state.hOff = left - m.x\n  }\n  if (centerY < m.y + m.h / 4) {\n    state.v = 'top'\n    state.vOff = 0\n    top = m.y\n    moved = true\n  } else {\n    state.v = 'bottom'\n    state.vOff = Math.max(0, m.y + m.h - top - h)\n  }\n  if (moved) {\n    state.left = left\n    state.top = top\n    settle()\n  }\n}",
"snapCheck");

// 4. endDrag 改造
rep("  var centerX = left + drag.w / 2\n  var centerY = top + drag.h / 2\n  if (centerX < drag.vp.w / 4) {\n    state.h = 'left'\n    state.hOff = 0\n  } else if (centerX > drag.vp.w * 3 / 4) {\n    state.h = 'right'\n    state.hOff = 0\n  } else {\n    state.h = null\n    state.hOff = left\n  }\n  if (centerY < drag.vp.h / 4) {\n    state.v = 'top'\n    state.vOff = 0\n  } else if (centerY > drag.vp.h * 3 / 4) {\n    state.v = 'bottom'\n    state.vOff = 0\n  } else {\n    state.v = null\n    state.vOff = top\n  }",
"  var centerX = left + drag.w / 2\n  var centerY = top + drag.h / 2\n  var m = monitorAt(centerX, centerY) || { x: 0, y: 0, w: drag.vp.w, h: drag.vp.h }\n  if (centerX < m.x + m.w / 4) {\n    state.h = 'left'\n    state.hOff = 0\n  } else if (centerX > m.x + m.w * 3 / 4) {\n    state.h = 'right'\n    state.hOff = 0\n  } else {\n    state.h = null\n    state.hOff = left - m.x\n  }\n  if (centerY < m.y + m.h / 4) {\n    state.v = 'top'\n    state.vOff = 0\n  } else if (centerY > m.y + m.h * 3 / 4) {\n    state.v = 'bottom'\n    state.vOff = 0\n  } else {\n    state.v = null\n    state.vOff = top - m.y\n  }",
"endDrag");

// 5. applyAnchorPos 改造
rep("    var vp = viewport()\n    var w = root.offsetWidth || root.getBoundingClientRect().width || 0\n    var h = root.offsetHeight || root.getBoundingClientRect().height || 0\n    // 与加载恢复一致：锚点存净距离，右锚点按当前避让开关叠加\n    var effectiveRightDist = a.hAnchor === 'right' ? a.hDist + (scrollGapOn ? rightGap() : 0) : a.hDist\n    var l = a.hAnchor === 'left' ? a.hDist : vp.w - effectiveRightDist - w\n    var t = a.vAnchor === 'top' ? a.vDist : vp.h - a.vDist - h\n    state.left = clamp(l, 0, Math.max(0, vp.w - w))\n    state.top = clamp(t, 0, Math.max(0, vp.h - h))",
"    var vp = viewport()\n    var m = currentMonitor() || { x: 0, y: 0, w: vp.w, h: vp.h }\n    var w = root.offsetWidth || root.getBoundingClientRect().width || 0\n    var h = root.offsetHeight || root.getBoundingClientRect().height || 0\n    // 与加载恢复一致：锚点存净距离，右锚点按当前避让开关叠加\n    var effectiveRightDist = a.hAnchor === 'right' ? a.hDist + (scrollGapOn ? rightGap() : 0) : a.hDist\n    var l = a.hAnchor === 'left' ? m.x + a.hDist : m.x + m.w - effectiveRightDist - w\n    var t = a.vAnchor === 'top' ? m.y + a.vDist : m.y + m.h - a.vDist - h\n    state.left = clamp(l, m.x, Math.max(m.x, m.x + m.w - w))\n    state.top = clamp(t, m.y, Math.max(m.y, m.y + m.h - h))",
"applyAnchorPos");

// 6. saveConfig 的 hDist 计算改造
rep("    var vp = viewport()\n    var w = root.offsetWidth || root.getBoundingClientRect().width || 0\n    var h = root.offsetHeight || root.getBoundingClientRect().height || 0\n    var leftDist = state.left\n    var rightDist = vp.w - state.left - w\n    var topDist = state.top\n    var bottomDist = vp.h - state.top - h",
"    var vp = viewport()\n    var m = currentMonitor() || { x: 0, y: 0, w: vp.w, h: vp.h }\n    var w = root.offsetWidth || root.getBoundingClientRect().width || 0\n    var h = root.offsetHeight || root.getBoundingClientRect().height || 0\n    var leftDist = state.left - m.x\n    var rightDist = m.x + m.w - state.left - w\n    var topDist = state.top - m.y\n    var bottomDist = m.y + m.h - state.top - h",
"saveConfig hDist");

// 7. 初始化恢复（get_config .then 里的锚点恢复）改造
rep("        var vpA = viewport()\n        var wA = root.offsetWidth || root.getBoundingClientRect().width || 0\n        var hA = root.offsetHeight || root.getBoundingClientRect().height || 0\n        // 锚点存的是净距离：右锚点按当前避让开关叠加避让距离\n        var effectiveRightDist = a.hAnchor === 'right' ? a.hDist + (scrollGapOn ? rightGap() : 0) : a.hDist\n        var lA = a.hAnchor === 'left' ? a.hDist : vpA.w - effectiveRightDist - wA\n        var tA = a.vAnchor === 'top' ? a.vDist : vpA.h - a.vDist - hA\n        state.left = clamp(lA, 0, Math.max(0, vpA.w - wA))\n        state.top = clamp(tA, 0, Math.max(0, vpA.h - hA))",
"        var vpA = viewport()\n        var mA = currentMonitor() || { x: 0, y: 0, w: vpA.w, h: vpA.h }\n        var wA = root.offsetWidth || root.getBoundingClientRect().width || 0\n        var hA = root.offsetHeight || root.getBoundingClientRect().height || 0\n        // 锚点存的是净距离：右锚点按当前避让开关叠加避让距离\n        var effectiveRightDist = a.hAnchor === 'right' ? a.hDist + (scrollGapOn ? rightGap() : 0) : a.hDist\n        var lA = a.hAnchor === 'left' ? mA.x + a.hDist : mA.x + mA.w - effectiveRightDist - wA\n        var tA = a.vAnchor === 'top' ? mA.y + a.vDist : mA.y + mA.h - a.vDist - hA\n        state.left = clamp(lA, mA.x, Math.max(mA.x, mA.x + mA.w - wA))\n        state.top = clamp(tA, mA.y, Math.max(mA.y, mA.y + mA.h - hA))",
"init restore");

// 8. 注入 invoke get_screen_info
rep("applySoundSet()\nsetupHitTest()\ninvoke('get_config')",
"applySoundSet()\nsetupHitTest()\n// 获取各显示器工作区列表，用于吸附避让各显示器任务栏\ninvoke('get_screen_info').then(function (info) {\n  if (info && info.workAreas && info.workAreas.length) {\n    monitors = info.workAreas\n    settle()\n  }\n}).catch(function () {})\ninvoke('get_config')",
"inject get_screen_info");

fs.writeFileSync('D:/Wideget/dist/widget.js', s, 'utf8');
console.log('len', s.length);
