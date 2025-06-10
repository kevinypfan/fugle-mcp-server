# 多重條件單 API

## API 用途
建立多重條件委託單，當所有指定的監控條件同時達成時自動執行委託下單。支援多個條件的 AND 邏輯組合，實現複雜的交易策略。

## 主要功能
- 多重條件監控（AND 邏輯）
- 複雜交易策略實現
- 自動委託下單執行
- 支援停利停損（TPSL）設定
- 多檔股票聯動監控

## 使用場景
- 複雜技術分析策略
- 多檔股票聯動交易
- 市場多重指標確認
- 風險控管強化
- 高精度交易時機把握

## 使用範例

### 範例 1：雙條件價格突破策略
當台積電成交價 ≥ 650 且聯發科成交價 ≥ 1100 時，買進台積電 1000 股
```json
{
  "start_date": "20241210",
  "end_date": "20241231",
  "stop_sign": "Full",
  "condition1_market_type": "Reference",
  "condition1_symbol": "2330",
  "condition1_trigger": "MatchedPrice",
  "condition1_trigger_value": 650,
  "condition1_comparison": "GreaterThanOrEqual",
  "condition2_market_type": "Reference",
  "condition2_symbol": "2454",
  "condition2_trigger": "MatchedPrice",
  "condition2_trigger_value": 1100,
  "condition2_comparison": "GreaterThanOrEqual",
  "order_buy_sell": "Buy",
  "order_symbol": "2330",
  "order_price": 655,
  "order_quantity": 1000,
  "order_market_type": "Common",
  "order_price_type": "Limit",
  "order_time_in_force": "ROD",
  "order_order_type": "Stock"
}
```

### 範例 2：技術指標確認 + 停利停損
當台積電成交價 ≥ 600 且總成交量 ≥ 50000000 時，買進並設停利停損
```json
{
  "start_date": "20241210",
  "end_date": "20241231",
  "stop_sign": "Full",
  "condition1_market_type": "Reference",
  "condition1_symbol": "2330",
  "condition1_trigger": "MatchedPrice",
  "condition1_trigger_value": 600,
  "condition1_comparison": "GreaterThanOrEqual",
  "condition2_market_type": "Reference",
  "condition2_symbol": "2330",
  "condition2_trigger": "TotalQuantity",
  "condition2_trigger_value": 50000000,
  "condition2_comparison": "GreaterThanOrEqual",
  "order_buy_sell": "Buy",
  "order_symbol": "2330",
  "order_price": 605,
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

### 範例 3：時間條件 + 價格條件
在指定時間 14:00 且台積電成交價 ≤ 580 時，買進融資台積電
```json
{
  "start_date": "20241210",
  "end_date": "20241210",
  "stop_sign": "Full",
  "condition1_market_type": "Scheduled",
  "condition1_symbol": "",
  "condition1_trigger": "Time",
  "condition1_trigger_value": "14:00:00",
  "condition1_comparison": "GreaterThanOrEqual",
  "condition2_market_type": "Reference",
  "condition2_symbol": "2330",
  "condition2_trigger": "MatchedPrice",
  "condition2_trigger_value": 580,
  "condition2_comparison": "LessThanOrEqual",
  "order_buy_sell": "Buy",
  "order_symbol": "2330",
  "order_price": 585,
  "order_quantity": 1000,
  "order_market_type": "Common",
  "order_price_type": "Limit",
  "order_time_in_force": "ROD",
  "order_order_type": "Margin"
}
```