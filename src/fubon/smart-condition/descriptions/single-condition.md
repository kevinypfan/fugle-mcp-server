# 單一條件單 API

## API 用途
建立單一條件委託單，當指定的監控條件達成時自動執行委託下單。支援價格、數量、時間等各種觸發條件，並可設定停利停損功能。

## 主要功能
- 單一條件監控（價格、數量、時間等觸發條件）
- 自動委託下單執行
- 支援停利停損（TPSL）設定
- 多種價格類型與委託條件
- 靈活的監控期間設定

## 使用場景
- 技術分析交易策略實現
- 自動化交易執行
- 風險控管與停損設定
- 價格突破或跌破交易
- 定時委託執行

## 使用範例

### 範例 1：價格突破買進策略
當台積電成交價 ≥ 620 時，買進台積電 1000 股
```json
{
  "start_date": "20241210",
  "end_date": "20241231",
  "stop_sign": "Full",
  "condition_market_type": "Reference",
  "condition_symbol": "2330",
  "condition_trigger": "MatchedPrice",
  "condition_trigger_value": 620,
  "condition_comparison": "GreaterThanOrEqual",
  "order_buy_sell": "Buy",
  "order_symbol": "2330",
  "order_price": 625,
  "order_quantity": 1000,
  "order_market_type": "Common",
  "order_price_type": "Limit",
  "order_time_in_force": "ROD",
  "order_order_type": "Stock"
}
```

### 範例 2：跌破停損賣出策略
當持有的台積電成交價 ≤ 580 時，賣出台積電 1000 股
```json
{
  "start_date": "20241210",
  "end_date": "20241231",
  "stop_sign": "Full",
  "condition_market_type": "Reference",
  "condition_symbol": "2330",
  "condition_trigger": "MatchedPrice",
  "condition_trigger_value": 580,
  "condition_comparison": "LessThanOrEqual",
  "order_buy_sell": "Sell",
  "order_symbol": "2330",
  "order_price": 575,
  "order_quantity": 1000,
  "order_market_type": "Common",
  "order_price_type": "Limit",
  "order_time_in_force": "ROD",
  "order_order_type": "Stock"
}
```

### 範例 3：成交量條件 + 停利停損
當台積電總成交量 ≥ 80000000 時，買進並設定停利停損
```json
{
  "start_date": "20241210",
  "end_date": "20241231",
  "stop_sign": "Full",
  "condition_market_type": "Reference",
  "condition_symbol": "2330",
  "condition_trigger": "TotalQuantity",
  "condition_trigger_value": 80000000,
  "condition_comparison": "GreaterThanOrEqual",
  "order_buy_sell": "Buy",
  "order_symbol": "2330",
  "order_price": 610,
  "order_quantity": 1000,
  "order_market_type": "Common",
  "order_price_type": "Limit",
  "order_time_in_force": "ROD",
  "order_order_type": "Stock",
  "tpsl_stop_sign": "Full",
  "tpsl_end_date": "20241231",
  "tp_buy_sell": "Sell",
  "tp_symbol": "2330",
  "tp_price": 650,
  "tp_quantity": 1000,
  "tp_market_type": "Common",
  "tp_price_type": "Limit",
  "tp_time_in_force": "ROD",
  "tp_order_type": "Stock",
  "sl_buy_sell": "Sell",
  "sl_symbol": "2330",
  "sl_price": 570,
  "sl_quantity": 1000,
  "sl_market_type": "Common",
  "sl_price_type": "Limit",
  "sl_time_in_force": "ROD",
  "sl_order_type": "Stock"
}
```

### 範例 4：時間條件委託
在 2024/12/10 下午 14:30 執行市價買進
```json
{
  "start_date": "20241210",
  "end_date": "20241210",
  "stop_sign": "Full",
  "condition_market_type": "Scheduled",
  "condition_symbol": "",
  "condition_trigger": "Time",
  "condition_trigger_value": "14:30:00",
  "condition_comparison": "GreaterThanOrEqual",
  "order_buy_sell": "Buy",
  "order_symbol": "2330",
  "order_price": 600,
  "order_quantity": 1000,
  "order_market_type": "Common",
  "order_price_type": "Market",
  "order_time_in_force": "ROD",
  "order_order_type": "Stock"
}
```

### 範例 5：融資買進策略
當台積電成交價 ≤ 590 時，融資買進台積電 2000 股
```json
{
  "start_date": "20241210",
  "end_date": "20241231",
  "stop_sign": "Full",
  "condition_market_type": "Reference",
  "condition_symbol": "2330",
  "condition_trigger": "MatchedPrice",
  "condition_trigger_value": 590,
  "condition_comparison": "LessThanOrEqual",
  "order_buy_sell": "Buy",
  "order_symbol": "2330",
  "order_price": 595,
  "order_quantity": 2000,
  "order_market_type": "Common",
  "order_price_type": "Limit",
  "order_time_in_force": "ROD",
  "order_order_type": "Margin"
}
```