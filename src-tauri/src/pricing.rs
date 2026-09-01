use chrono::{DateTime, Datelike, NaiveDate, Timelike, Utc};

// 高峰时段：工作日 9:00-12:00 与 14:00-18:00（北京时间）
const PEAK_HOURS: [(u32, u32); 2] = [(9, 12), (14, 18)];

// 2026-08-23 起（北京时间）周末全天谷价；生效分界为北京时间 2026-08-23 00:00
fn weekend_valley_from_sec() -> i64 {
    let d = NaiveDate::from_ymd_opt(2026, 8, 22).unwrap().and_hms_opt(16, 0, 0).unwrap();
    DateTime::<Utc>::from_naive_utc_and_offset(d, Utc).timestamp()
}

pub fn is_peak_time(time_sec: i64) -> bool {
    let bj = match DateTime::<Utc>::from_timestamp(time_sec, 0) {
        Some(t) => t + chrono::Duration::hours(8),
        None => return false,
    };
    // 0=周日 6=周六
    let dow = bj.weekday().num_days_from_sunday();
    if time_sec >= weekend_valley_from_sec() && (dow == 0 || dow == 6) {
        return false;
    }
    let hour = bj.hour();
    for (s, e) in PEAK_HOURS {
        if hour >= s && hour < e {
            return true;
        }
    }
    false
}
