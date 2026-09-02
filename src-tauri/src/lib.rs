mod config;
mod ledger;
mod pricing;

use config::{load_app_config, load_ledger, load_widget_config, save_app_config, save_ledger, save_widget_config, AppConfig, WidgetConfig};
use ledger::Ledger;
use pricing::is_peak_time;
use serde::Serialize;
use std::sync::Mutex;
use tauri::Manager;

pub struct AppState {
    pub app_config: Mutex<AppConfig>,
    pub widget_config: Mutex<WidgetConfig>,
    pub ledger: Mutex<Ledger>,
    pub balance_cache: Mutex<Option<(i64, BalancePayload)>>,
}

#[derive(Serialize, Clone, Default)]
#[serde(rename_all = "camelCase")]
pub struct BalancePayload {
    pub ok: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub code: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub total_balance: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub currency: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub updated_at: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub today_usage: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub is_peak: Option<bool>,
}

const BALANCE_URL: &str = "https://api.deepseek.com/user/balance";
const BALANCE_TTL_MS: i64 = 25000;

fn now_ms() -> i64 {
    chrono::Utc::now().timestamp_millis()
}
fn now_sec() -> i64 {
    chrono::Utc::now().timestamp()
}
fn now_iso() -> String {
    chrono::Utc::now().to_rfc3339()
}

fn json_to_f64(v: &serde_json::Value) -> Option<f64> {
    if let Some(n) = v.as_f64() {
        return Some(n);
    }
    if let Some(s) = v.as_str() {
        return s.trim().parse::<f64>().ok();
    }
    None
}

fn pick_balance_info(infos: Option<&serde_json::Value>) -> Option<(f64, String)> {
    let arr = infos?.as_array()?;
    if arr.is_empty() {
        return None;
    }
    let num = |x: &serde_json::Value| -> f64 {
        x.get("total_balance").and_then(json_to_f64).unwrap_or(f64::NAN)
    };
    for x in arr {
        if x.get("currency").and_then(|c| c.as_str()) == Some("CNY") && num(x) > 0.0 {
            return Some((num(x), "CNY".to_string()));
        }
    }
    for x in arr {
        if num(x) > 0.0 {
            let cur = x.get("currency").and_then(|c| c.as_str()).unwrap_or("CNY").to_string();
            return Some((num(x), cur));
        }
    }
    for x in arr {
        if x.get("currency").and_then(|c| c.as_str()) == Some("CNY") {
            return Some((num(x), "CNY".to_string()));
        }
    }
    let x = &arr[0];
    let cur = x.get("currency").and_then(|c| c.as_str()).unwrap_or("CNY").to_string();
    Some((num(x), cur))
}

async fn fetch_balance(api_key: &str) -> Result<(f64, String), String> {
    let client = reqwest::Client::new();
    let mut last_err = String::new();
    for attempt in 0..2 {
        let res = client
            .get(BALANCE_URL)
            .header("Authorization", format!("Bearer {}", api_key))
            .timeout(std::time::Duration::from_secs(20))
            .send()
            .await;
        match res {
            Ok(r) => {
                if !r.status().is_success() {
                    last_err = format!("HTTP {}", r.status().as_u16());
                    if r.status().as_u16() < 500 {
                        break;
                    }
                    if attempt == 0 {
                        tokio::time::sleep(std::time::Duration::from_millis(500)).await;
                    }
                    continue;
                }
                let data: serde_json::Value = r
                    .json()
                    .await
                    .map_err(|_| "余额接口返回不是合法 JSON".to_string())?;
                return pick_balance_info(data.get("balance_infos"))
                    .ok_or_else(|| "余额接口返回结构异常".to_string());
            }
            Err(e) => {
                last_err = e.to_string();
                if attempt == 0 {
                    tokio::time::sleep(std::time::Duration::from_millis(500)).await;
                }
            }
        }
    }
    Err(format!("余额接口请求失败: {}", last_err))
}

#[tauri::command]
async fn get_balance(state: tauri::State<'_, AppState>) -> Result<BalancePayload, String> {
    {
        let cache = state.balance_cache.lock().unwrap();
        if let Some((at, payload)) = cache.as_ref() {
            if now_ms() - at < BALANCE_TTL_MS {
                return Ok(payload.clone());
            }
        }
    }

    let api_key = state.app_config.lock().unwrap().api_key.clone();
    let api_key = match api_key {
        Some(k) if !k.trim().is_empty() => k.trim().to_string(),
        _ => {
            return Ok(BalancePayload {
                ok: false,
                code: Some("NO_KEY".into()),
                error: Some("未配置 DEEPSEEK_API_KEY".into()),
                ..Default::default()
            });
        }
    };

    let (total, currency) = match fetch_balance(&api_key).await {
        Ok(v) => v,
        Err(e) => {
            return Ok(BalancePayload {
                ok: false,
                code: Some("HTTP".into()),
                error: Some(e),
                ..Default::default()
            });
        }
    };

    // 记账：当天第一次余额 - 实时余额 = 当日用量，0点刷新
    let today_usage = {
        let mut ledger = state.ledger.lock().unwrap();
        ledger::record_usage(&mut ledger, total, &currency);
        let u = ledger.today_usage;
        save_ledger(&ledger);
        u
    };

    let payload = BalancePayload {
        ok: true,
        total_balance: Some(total),
        currency: Some(currency),
        updated_at: Some(now_iso()),
        today_usage: Some(today_usage),
        is_peak: Some(is_peak_time(now_sec())),
        ..Default::default()
    };

    *state.balance_cache.lock().unwrap() = Some((now_ms(), payload.clone()));
    Ok(payload)
}

#[tauri::command]
fn get_config(state: tauri::State<'_, AppState>) -> WidgetConfig {
    state.widget_config.lock().unwrap().clone()
}

#[tauri::command]
fn save_config(cfg: WidgetConfig, state: tauri::State<'_, AppState>) -> Result<(), String> {
    save_widget_config(&cfg);
    *state.widget_config.lock().unwrap() = cfg;
    Ok(())
}

#[tauri::command]
fn get_api_key(state: tauri::State<'_, AppState>) -> String {
    state.app_config.lock().unwrap().api_key.clone().unwrap_or_default()
}

#[tauri::command]
fn set_api_key(key: String, state: tauri::State<'_, AppState>) -> Result<(), String> {
    {
        let mut cfg = state.app_config.lock().unwrap();
        cfg.api_key = if key.trim().is_empty() { None } else { Some(key.trim().to_string()) };
        save_app_config(&cfg);
    }
    *state.balance_cache.lock().unwrap() = None;
    Ok(())
}


// —— Windows 主显示器工作区（排除任务栏）——
#[repr(C)]
#[derive(Clone, Copy)]
struct WinRect {
    left: i32,
    top: i32,
    right: i32,
    bottom: i32,
}

#[repr(C)]
#[derive(Clone, Copy)]
struct MonitorInfoW {
    cb_size: u32,
    rc_monitor: WinRect,
    rc_work: WinRect,
    dw_flags: u32,
}

type MonitorEnumProc = unsafe extern "system" fn(isize, isize, *mut WinRect, isize) -> i32;

const SPI_GETWORKAREA: u32 = 0x0030;

#[link(name = "user32")]
extern "system" {
    fn SystemParametersInfoW(
        ui_action: u32,
        ui_param: u32,
        pv_param: *mut std::ffi::c_void,
        f_win_ini: u32,
    ) -> i32;
    fn GetSystemMetrics(n_index: i32) -> i32;
    fn EnumDisplayMonitors(
        hdc: *mut std::ffi::c_void,
        lprc_clip: *const WinRect,
        lpfn_enum: MonitorEnumProc,
        dw_data: isize,
    ) -> i32;
    fn GetMonitorInfoW(h_monitor: isize, lpmi: *mut MonitorInfoW) -> i32;
}

const SM_XVIRTUALSCREEN: i32 = 76;
const SM_YVIRTUALSCREEN: i32 = 77;
const SM_CXVIRTUALSCREEN: i32 = 78;
const SM_CYVIRTUALSCREEN: i32 = 79;

// 虚拟屏幕：所有显示器的外接矩形（物理像素），支持多显示器拖拽
fn get_virtual_screen() -> Option<(i32, i32, i32, i32)> {
    let x = unsafe { GetSystemMetrics(SM_XVIRTUALSCREEN) };
    let y = unsafe { GetSystemMetrics(SM_YVIRTUALSCREEN) };
    let w = unsafe { GetSystemMetrics(SM_CXVIRTUALSCREEN) };
    let h = unsafe { GetSystemMetrics(SM_CYVIRTUALSCREEN) };
    if w <= 0 || h <= 0 {
        return None;
    }
    Some((x, y, w, h))
}

// 返回主显示器工作区（虚拟屏幕逻辑坐标，不含任务栏）；失败返回 None
fn get_work_area_logical() -> Option<(i32, i32, i32, i32)> {
    let mut rect = WinRect {
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
    };
    let ok = unsafe {
        SystemParametersInfoW(
            SPI_GETWORKAREA,
            0,
            &mut rect as *mut WinRect as *mut std::ffi::c_void,
            0,
        )
    };
    if ok == 0 {
        return None;
    }
    Some((rect.left, rect.top, rect.right, rect.bottom))
}

unsafe extern "system" fn monitor_enum_proc(
    h_monitor: isize,
    _hdc: isize,
    _lprc: *mut WinRect,
    dw_data: isize,
) -> i32 {
    let areas = &mut *(dw_data as *mut Vec<WinRect>);
    let mut info = MonitorInfoW {
        cb_size: std::mem::size_of::<MonitorInfoW>() as u32,
        rc_monitor: WinRect { left: 0, top: 0, right: 0, bottom: 0 },
        rc_work: WinRect { left: 0, top: 0, right: 0, bottom: 0 },
        dw_flags: 0,
    };
    if GetMonitorInfoW(h_monitor, &mut info) != 0 {
        areas.push(info.rc_work);
    }
    1
}

fn get_all_work_areas() -> Vec<WinRect> {
    let mut areas: Vec<WinRect> = Vec::new();
    unsafe {
        EnumDisplayMonitors(
            std::ptr::null_mut(),
            std::ptr::null(),
            monitor_enum_proc,
            &mut areas as *mut Vec<WinRect> as isize,
        );
    }
    areas
}

const MONITORINFOF_PRIMARY: u32 = 1;

unsafe extern "system" fn primary_monitor_enum_proc(
    h_monitor: isize,
    _hdc: isize,
    _lprc: *mut WinRect,
    dw_data: isize,
) -> i32 {
    let primary = &mut *(dw_data as *mut Option<WinRect>);
    let mut info = MonitorInfoW {
        cb_size: std::mem::size_of::<MonitorInfoW>() as u32,
        rc_monitor: WinRect { left: 0, top: 0, right: 0, bottom: 0 },
        rc_work: WinRect { left: 0, top: 0, right: 0, bottom: 0 },
        dw_flags: 0,
    };
    if GetMonitorInfoW(h_monitor, &mut info) != 0 && info.dw_flags & MONITORINFOF_PRIMARY != 0 {
        *primary = Some(info.rc_work);
        return 0; // 已找到主显示器，停止枚举
    }
    1
}

// 主显示器工作区（物理像素，虚拟屏幕坐标，排除任务栏）
fn get_primary_work_area() -> Option<WinRect> {
    let mut primary: Option<WinRect> = None;
    unsafe {
        EnumDisplayMonitors(
            std::ptr::null_mut(),
            std::ptr::null(),
            primary_monitor_enum_proc,
            &mut primary as *mut Option<WinRect> as isize,
        );
    }
    primary
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct WorkArea {
    x: f64,
    y: f64,
    w: f64,
    h: f64,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct ScreenInfo {
    scale_factor: f64,
    work_areas: Vec<WorkArea>,
}

// 返回各显示器工作区（物理像素，相对窗口左上角）。
// 混合 DPI（多显示器缩放不同）下 window.scale_factor() 与 WebView2 实际 devicePixelRatio 可能不一致，
// 所以后端只返回原始物理坐标，换算交给前端用 window.devicePixelRatio，保证与 innerWidth/innerHeight 同一坐标系。
#[tauri::command]
fn get_screen_info(
    window: tauri::WebviewWindow,
    state: tauri::State<'_, AppState>,
) -> Result<ScreenInfo, String> {
    let multi = state.widget_config.lock().unwrap().multi_monitor;
    let sf = window.scale_factor().unwrap_or(1.0);
    let pos = window
        .outer_position()
        .unwrap_or(tauri::PhysicalPosition::new(0, 0));
    let mut work_areas = Vec::new();
    if multi {
        // 多屏（实验）：所有显示器工作区
        for a in get_all_work_areas() {
            let w = (a.right - a.left).max(0) as f64;
            let h = (a.bottom - a.top).max(0) as f64;
            if w <= 0.0 || h <= 0.0 {
                continue;
            }
            work_areas.push(WorkArea {
                x: (a.left - pos.x) as f64,
                y: (a.top - pos.y) as f64,
                w,
                h,
            });
        }
    } else {
        // 单屏（默认）：窗口=主显示器工作区，前端工作区=整个窗口（x/y 恒为 0，与 viewport 完全一致）
        let size = window
            .outer_size()
            .unwrap_or(tauri::PhysicalSize::new(0, 0));
        if size.width > 0 && size.height > 0 {
            work_areas.push(WorkArea {
                x: 0.0,
                y: 0.0,
                w: size.width as f64,
                h: size.height as f64,
            });
        }
    }
    if work_areas.is_empty() {
        let size = window
            .outer_size()
            .unwrap_or(tauri::PhysicalSize::new(0, 0));
        work_areas.push(WorkArea {
            x: 0.0,
            y: 0.0,
            w: size.width as f64,
            h: size.height as f64,
        });
    }
    Ok(ScreenInfo {
        scale_factor: sf,
        work_areas,
    })
}

fn setup_window(app: &tauri::App) -> Result<(), Box<dyn std::error::Error>> {
    let window = app.get_webview_window("main").unwrap();

    // 多屏幕支持（实验，默认关闭）：关闭时窗口只覆盖主显示器工作区（单屏稳定），
    // 开启时覆盖虚拟屏幕（所有显示器）可跨屏拖动
    let multi = load_widget_config().multi_monitor;
    let mut positioned = false;
    if multi {
        if let Some((vx, vy, vw, vh)) = get_virtual_screen() {
            if vw > 0 && vh > 0 {
                let _ = window.set_position(tauri::PhysicalPosition::new(vx, vy));
                let _ = window.set_size(tauri::PhysicalSize::new(vw as u32, vh as u32));
                positioned = true;
            }
        }
    } else if let Some(wa) = get_primary_work_area() {
        let w = (wa.right - wa.left).max(0) as u32;
        let h = (wa.bottom - wa.top).max(0) as u32;
        if w > 0 && h > 0 {
            let _ = window.set_position(tauri::PhysicalPosition::new(wa.left, wa.top));
            let _ = window.set_size(tauri::PhysicalSize::new(w, h));
            positioned = true;
        }
    }

    // 回退：主显示器工作区（排除任务栏）
    if !positioned {
        let mut sf = 1.0f64;
        if let Ok(Some(monitor)) = window.primary_monitor() {
            sf = monitor.scale_factor();
        }
        if let Some((lx, ly, rx, by)) = get_work_area_logical() {
            let lw = (rx - lx).max(0);
            let lh = (by - ly).max(0);
            if lw > 0 && lh > 0 {
                let x = (lx as f64 * sf).round() as i32;
                let y = (ly as f64 * sf).round() as i32;
                let w = (lw as f64 * sf).round() as u32;
                let h = (lh as f64 * sf).round() as u32;
                let _ = window.set_position(tauri::PhysicalPosition::new(x, y));
                let _ = window.set_size(tauri::PhysicalSize::new(w, h));
                positioned = true;
            }
        }
    }

    if !positioned {
        if let Ok(Some(monitor)) = window.primary_monitor() {
            let size = monitor.size();
            let pos = monitor.position();
            let _ = window.set_position(tauri::PhysicalPosition::new(pos.x, pos.y));
            let _ = window.set_size(tauri::PhysicalSize::new(size.width, size.height));
        }
    }

    let _ = window.set_ignore_cursor_events(true);
    let _ = window.show();
    Ok(())
}

fn setup_tray(app: &tauri::App) -> Result<(), Box<dyn std::error::Error>> {
    use tauri::menu::{Menu, MenuItem};
    use tauri::tray::TrayIconBuilder;

    let show = MenuItem::with_id(app, "show", "显示/隐藏挂件", true, None::<&str>)?;
    let settings = MenuItem::with_id(app, "settings", "设置 API Key…", true, None::<&str>)?;
    let quit = MenuItem::with_id(app, "quit", "退出", true, None::<&str>)?;
    let menu = Menu::with_items(app, &[&show, &settings, &quit])?;

    let mut builder = TrayIconBuilder::with_id("tray")
        .menu(&menu)
        .on_menu_event(|app, event| match event.id.as_ref() {
            "show" => {
                if let Some(w) = app.get_webview_window("main") {
                    let vis = w.is_visible().unwrap_or(false);
                    let _ = if vis { w.hide() } else { w.show() };
                }
            }
            "settings" => {
                if let Some(w) = app.get_webview_window("settings") {
                    let _ = w.show();
                    let _ = w.set_focus();
                }
            }
            "quit" => app.exit(0),
            _ => {}
        });
    if let Some(icon) = app.default_window_icon() {
        builder = builder.icon(icon.clone());
    }
    let _ = builder.build(app)?;
    Ok(())
}

// settings 窗口点 X 时隐藏而非销毁，保证托盘「设置」能再次打开
fn setup_settings_close(app: &tauri::App) {
    if let Some(w) = app.get_webview_window("settings") {
        let w2 = w.clone();
        w.on_window_event(move |event| {
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                api.prevent_close();
                let _ = w2.hide();
            }
        });
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(AppState {
            app_config: Mutex::new(load_app_config()),
            widget_config: Mutex::new(load_widget_config()),
            ledger: Mutex::new(load_ledger()),
            balance_cache: Mutex::new(None),
        })
        .setup(|app| {
            setup_window(app)?;
            setup_tray(app)?;
            setup_settings_close(app);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_balance,
            get_config,
            save_config,
            get_api_key,
            set_api_key,
            get_screen_info
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
