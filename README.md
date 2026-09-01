# DeepSeek 余额小鲸鱼 · 桌面挂件（Tauri 版）

![小鲸鱼本体 cut-out](dist/assets/DSniang1.png)

基于 DSH Web 插件 [DeepSeek-Balance-Whale-Widget](https://github.com/MeteorNOX/DeepSeek-Balance-Whale-Widget)（作者 MeteorNOX，MIT License）进阶二次开发而来，
脱离浏览器/DSH 宿主，作为**独立桌面悬浮挂件**常驻屏幕右下角。

## 特性

- 🐋 **桌面常驻**：透明无边框、置顶、点击穿透的悬浮窗，覆盖所有显示器，可拖到任意屏幕
- 💰 **余额**：DeepSeek API 余额，60 秒自动刷新 + 点击鲸鱼手动刷新；余额变化数字滚动动画；网络抖动沿用最近余额
- 📊 **今日已用**：记账模式（免令牌）——当天第一次观测的余额 − 实时余额 = 当日用量，0 点（跨天）刷新归零
- 🖱️ **拖拽 + 吸附**：显示器边框吸附（左右/顶）与任务栏吸附（底部），支持横/竖屏混合 DPI 多显示器
- 🧸 **按压 Q 弹** + 音效（小黄鸭 / 音效1）
- 🎚️ **汉堡菜单**：大小 / 音效 / 音量 / 峰谷文案 / 气泡开关
- 💬 **随机台词气泡**（点击切换、5 秒自动收起）
- 🖥️ **系统托盘**：显示/隐藏挂件、设置 API Key、退出

## 构建

前置：Rust（stable-msvc）+ MSVC Build Tools (C++) + WebView2 Runtime。

```powershell
cd src-tauri
cargo build            # 调试构建（target/debug/dsh-whale-widget.exe）
cargo build --release  # 发布构建（target/release/dsh-whale-widget.exe）
```

## 使用

1. 运行程序，屏幕右下角出现小鲸鱼挂件
2. 首次使用：托盘 → 「设置 API Key…」→ 填入 DeepSeek API Key
3. 点击鲸鱼弹出气泡（余额 + 今日已用），再点切换随机台词，气泡 5 秒自动收起
4. 拖拽鲸鱼移动，松手自动吸附显示器边框 / 任务栏上方

## 配置存储

- API Key：`%APPDATA%\dsh-whale\config.json`
- 挂件配置：`%APPDATA%\dsh-whale\widget.json`
- 记账数据：`%APPDATA%\dsh-whale\usage.json`

## 开源协议

本项目基于 [DeepSeek-Balance-Whale-Widget](https://github.com/MeteorNOX/DeepSeek-Balance-Whale-Widget)（作者 **MeteorNOX**）二次开发，原项目与本项目均采用 **MIT License**。

- 原插件前端逻辑（`dist/widget.js` 由原插件 `WIDGET_JS` 改造而来）与图片资源归属原项目，保留原作者版权声明：`Copyright (c) 2026 MeteorNOX`
- 本项目（Tauri 桌面化改造：Rust 后端、窗口/托盘/多显示器/点击穿透等）版权归 **小星同学**：`Copyright (c) 2026 小星同学`，同样以 MIT License 开源
- 完整协议见 [LICENSE](./LICENSE)

> 依据 MIT 协议，任何使用、复制、修改、分发本软件均需在副本或实质部分中保留上述版权声明与本许可声明。
