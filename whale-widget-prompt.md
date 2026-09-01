D:/Wideget/whale-widget-prompt.md [chars 0-4500 of 4607] (auto-truncated, use offset/limit to read more):
D:/Wideget/whale-widget-prompt.md [chars 0-4500 of 9013] (auto-truncated, use offset/limit to read more):
# DeepSeek 余额小鲸鱼挂件 · 桌面版（Tauri）完整规格/维护提示词

> 用途：独立桌面悬浮挂件（脱离浏览器/DSH），屏幕常驻小鲸鱼气泡图 + DeepSeek API 余额 + 今日已用。
> 本文件汇总完整需求、架构、后端/前端行为规格、视觉参数与踩坑结论，可直接交给 AI 复现或维护。
> 技术栈：Tauri v2（Rust 1.90 + MSVC）+ 原生 JS 前端（由原 DSH 插件的 `WIDGET_JS` 改造而来）。

---

## 一、需求总览

实现一个屏幕常驻的 DeepSeek 余额挂件：

- 小鲸鱼 cut-out 本体（`assets/DSniang1.png`）+ 代码绘制的白色对话气泡（SVG 椭圆 + 尾巴），气泡内叠加三行文字。
- **余额**：来自 DeepSeek 官方接口 `GET https://api.deepseek.com/user/balance`，请求头 `Authorization: Bearer <key>`；从 `balance_infos` 中选取展示项（优先 CNY 且 >0，其次任意非零项，再退回 CNY 项，最后取第一项）。
- **今日已用（记账模式，免令牌）**：每次拿到余额后，用「当天第一次观测的余额 − 实时余额」累计当日用量，**0 点（跨天）刷新归零**。
- **桌面常驻**：透明无边框、置顶、点击穿透的悬浮窗，覆盖「虚拟屏幕」（所有显示器），挂件可拖到任意显示器。
- **显示器边框吸附 + 任务栏吸附**：挂件吸附到「各显示器工作区」四边——左右/顶 = 显示器物理边框，底部 = 任务栏上方（不盖任务栏）。
- 支持：拖拽、四分之一区域吸附、左吸附镜像翻转、汉堡菜单（大小/音效/音量/峰谷文案/气泡开关）、按压 Q 弹 + 音效、余额数字滚动动画、60 秒自动刷新 + 点击手动刷新、随机台词气泡（点击切换/关闭）、系统托盘（显示/隐藏、设置 API Key、退出）。

> 已移除「每轮对话消耗统计」（依赖 DSH 会话事件，脱离 Web 端无法复现）与「实时·令牌」模式（需要平台会话令牌）。

---

## 二、架构（务必先读）

### 2.1 进程模型

Tauri v2 桌面应用：Rust 后端（`src-tauri/`）+ WebView 前端（`dist/`，纯原生 JS，无打包器）。

- **后端（Rust）**：负责余额拉取、记账、显示器枚举、窗口/托盘/穿透控制、配置读写；通过 `#[tauri::command]` 暴露命令给前端。
- **前端（widget.js）**：负责挂件 DOM、定位/吸附/拖拽、气泡/菜单/音效、穿透轮询；通过 `window.__TAURI__.core.invoke` 调用后端命令。

### 2.2 窗口模型（关键）

- **主窗口（main）**：`transparent: true, decorations: false, alwaysOnTop: true, skipTaskbar: true, resizable: false`，初始 `visible: false`。
- 启动时（`setup_window`）用 `GetSystemMetrics(SM_XVIRTUALSCREEN 等)` 取「虚拟屏幕」边界，把窗口设为覆盖**所有显示器**（含任务栏区域），再 `set_ignore_cursor_events(true)` 穿透，最后 `show()`。
- 这样前端 `window.innerWidth/innerHeight` = 虚拟屏幕尺寸，挂件可在任意显示器间拖动；吸附逻辑靠「各显示器工作区」信息来避开任务栏。
- **设置窗口（settings）**：普通 440×300 居中窗口，用于填写 API Key。

### 2.3 权限（capabilities）

Tauri v2 的 ACL 会默认拒绝插件命令。前端穿透轮询调用 `plugin:window|cursor_position`、`plugin:window|set_ignore_cursor_events` 等，必须授权。

`src-tauri/capabilities/default.json`：
```json
{
  "identifier": "default",
  "windows": ["main", "settings"],
  "permissions": [
    "core:default",
    "core:window:allow-cursor-position",
    "core:window:allow-scale-factor",
    "core:window:allow-outer-position",
    "core:window:allow-outer-size",
    "core:window:allow-is-visible",
    "core:window:allow-set-ignore-cursor-events"
  ]
}
```

> 关键：`set-ignore-cursor-events` **不在** window 默认权限集内，必须显式授权（否则穿透切换静默失败，挂件「点不动」）。

### 2.4 后端命令一览

| 命令 | 参数 | 返回 | 说明 |
|---|---|---|---|
| `get_balance` | — | `BalancePayload` | 余额 + 今日用量（25s 内存缓存 + 记账） |
| `get_config` | — | `WidgetConfig` | 读取挂件配置 |
| `save_config` | `cfg` | `()` | 保存挂件配置 |
| `get_api_key` | — | `String` | 读取 API Key |
| `set_api_key` | `key` | `()` | 保存 API Key（并清空余额缓存） |
| `get_screen_info` | — | `ScreenInfo` | 各显示器工作区（逻辑坐标，相对窗口左上角） |

---

## 三、后端（Rust）规格

### 3.1 余额拉取（`fetch_balance` + `pick_balance_info`）

- URL `https://api.deepseek.com/user/balance`，`Authorization: Bearer <key>`，20s 超时。
- **重试**：网络错误/超时/5xx 重试 1 次（间隔 500ms）；4xx 不重试。
- **`total_balance` 是字符串**（如 `"110.00"`）！必须用 `json_to_f64` 兼容数字与字符串解析，否则 `as_f64()` 返回 `None` → `NaN` → JSON `null` → 前端 `Number(null)=0`（「余额显示 0」的根因）。
- `pick_balance_info` 选币顺序：CNY 且 >0 → 任意 >0 → CNY → 第一项。

### 3.2 今日用量（记账，`ledger.rs`）

- `record_usage(ledger, current_balance, currency)`：
  - 跨天（`date != today`）：**0 点刷新**，归零 `today_usage`，重记基准。
  - 币种切换：只换基准，不记差值（避免币种切换记假账）。
  - 同天且余额下降：`today_usage += prev - current`；上升（充值）不扣减。
- 持久化到 `%APPDATA%\dsh-whale\usage.json`。

### 3.3 显示器枚举（`get_screen_info`）

- `EnumDisplayMonitors` + `GetMonitorInfoW` 枚举所有显示器，取 `rcWork`（工作区，**排除任务栏**）。
- `rcWork` 是「虚拟屏幕坐标」（相对虚拟屏幕左上角）；窗口左上角 = 虚拟屏幕左上角，所以 `rcWork / scale_factor` 即「相对窗口左上角的逻辑坐标」。
- `ScreenInfo { scale_factor, work_areas: [{x,y,w,h}] }` 返回给前端。
- 空时回退：用窗口尺寸（整个虚拟屏幕）作为唯一工作区。

### 3.4 窗口 / 穿透 / 托盘 / 设置

- `setup_window`：优先覆盖虚拟屏幕；失败回退主显示器工作区（`SystemParametersInfoW(SPI_GETWORKAREA)`）。
- `setup_tray`：托盘菜单「显示/隐藏挂件」「设置 API Key…」「退出」。
- `setup_settings_close`：拦截 settings 窗口 `CloseRequested` → `prevent_close() + hide()`（点 X 隐藏而非销毁，保证托盘「设置」能反复打开——否则窗口销毁后 `show()` 无效，表现为「保存后再点设置点不进去」）。

### 3.5 配置存储（`config.rs`）

| 文件 | 内容 |
|---|---|
| `%APPDATA%\dsh-whale\config.json` | `{ api_key }` |
| `%APPDATA%\dsh-whale\widget.json` | `{ scale, sound, vol, soundSet, peakMode, bubbleOn }` |
| `%APPDATA%\dsh-whale\usage.json` | `{ date, lastBalance, lastCurrency, todayUsage }` |

---

## 四、前端（widget.js）规格

### 4.1 DOM 结构

```text
div.dshwv-root（position:fixed，承载定位与翻转）
├─ div.dshwv-body（绝对定位铺满，承载按压 Q 弹缩放）
│  ├─ img.dshwv-img（鲸鱼 cut-out，右下角 59.45%）
│  └─ di
