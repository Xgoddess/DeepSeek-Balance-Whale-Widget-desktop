const fs = require('node:fs');
const p = 'D:/Wideget/whale-widget-prompt.md';
let s = fs.readFileSync(p, 'utf8');
const marker = '> 技术栈：Tauri v2（Rust 1.90 + MSVC）+ 原生 JS 前端（由原 DSH 插件的 `WIDGET_JS` 改造而来）。

---';
const add = marker.replace(/

---$/, '

## 零、来源与开源协议

本项目是基于 [DeepSeek-Balance-Whale-Widget](https://github.com/MeteorNOX/DeepSeek-Balance-Whale-Widget)（作者 **MeteorNOX**）的**二次开发**，原项目采用 **MIT License**（版权 ' + String.fromCharCode(96) + 'Copyright (c) 2026 MeteorNOX' + String.fromCharCode(96) + '）。

- 原插件前端逻辑（' + String.fromCharCode(96) + 'dist/widget.js' + String.fromCharCode(96) + ' 由原插件 ' + String.fromCharCode(96) + 'WIDGET_JS' + String.fromCharCode(96) + ' 改造而来）归属原项目，保留原作者版权声明。
- 本项目新增的 Tauri 桌面化改造（Rust 后端、窗口/托盘/多显示器/穿透等）同样以 **MIT License** 开源。
- 完整协议见仓库根目录 ' + String.fromCharCode(96) + 'LICENSE' + String.fromCharCode(96) + '。

> 依据 MIT 协议，任何使用、复制、修改、分发本软件均需在副本或实质部分中保留上述版权声明与本许可声明。

---');
if (s.includes(marker)) {
  s = s.replace(marker, add);
  fs.writeFileSync(p, s);
  console.log('OK: 已插入来源章节');
} else {
  console.log('FAIL: marker 未找到');
}
