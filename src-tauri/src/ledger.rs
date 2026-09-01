use chrono::Local;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone, Default)]
pub struct Ledger {
    pub date: String,
    pub last_balance: Option<f64>,
    pub last_currency: Option<String>,
    pub today_usage: f64,
}

fn today_key() -> String {
    Local::now().format("%Y-%m-%d").to_string()
}

// 记账：当天第一次观测余额作为基准；之后余额下降的差值累计为今日用量；0点（跨天）刷新归零。
pub fn record_usage(ledger: &mut Ledger, current_balance: f64, currency: &str) {
    let t = today_key();
    let cur = currency.to_string();
    let currency_changed = match &ledger.last_currency {
        Some(lc) => !lc.is_empty() && !cur.is_empty() && *lc != cur,
        None => false,
    };

    if ledger.date != t {
        // 0点刷新：跨天归零，重新记录基准
        ledger.date = t;
        ledger.last_balance = Some(current_balance);
        ledger.last_currency = Some(cur);
        ledger.today_usage = 0.0;
    } else if currency_changed {
        // 币种切换：只换基准，不记差值
        ledger.last_balance = Some(current_balance);
        ledger.last_currency = Some(cur);
    } else {
        let prev = ledger.last_balance.unwrap_or(current_balance);
        if current_balance < prev {
            ledger.today_usage += prev - current_balance;
        }
        ledger.last_balance = Some(current_balance);
        ledger.last_currency = Some(cur);
    }
}
