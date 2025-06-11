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
  "conditions": "[{\"marketType\":\"Reference\",\"symbol\":\"2330\",\"trigger\":\"MatchedPrice\",\"triggerValue\":\"650\",\"comparison\":\"GreaterThanOrEqual\"},{\"marketType\":\"Reference\",\"symbol\":\"2454\",\"trigger\":\"MatchedPrice\",\"triggerValue\":\"1100\",\"comparison\":\"GreaterThanOrEqual\"}]",
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
當台積電成交價 ≥ 600 且總成交量 ≥ 5000 張時，買進並設停利停損
```json
{
  "start_date": "20241210",
  "end_date": "20241231",
  "stop_sign": "Full",
  "conditions": "[{\"marketType\":\"Reference\",\"symbol\":\"2330\",\"trigger\":\"MatchedPrice\",\"triggerValue\":\"600\",\"comparison\":\"GreaterThanOrEqual\"},{\"marketType\":\"Reference\",\"symbol\":\"2330\",\"trigger\":\"TotalQuantity\",\"triggerValue\":\"5000\",\"comparison\":\"GreaterThanOrEqual\"}]",
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
  "tp_target_price": 650,
  "tp_price": 650,
  "tp_price_type": "Limit",
  "tp_time_in_force": "ROD",
  "tp_order_type": "Stock",
  "tp_trigger": "MatchedPrice",
  "sl_target_price": 570,
  "sl_price": 570,
  "sl_price_type": "Limit",
  "sl_time_in_force": "ROD",
  "sl_order_type": "Stock",
  "sl_trigger": "MatchedPrice"
}
```

### 範例 3：時間條件 + 價格條件
在指定時間 14:00 且台積電成交價 ≤ 580 時，買進融資台積電
```json
{
  "start_date": "20241210",
  "end_date": "20241210",
  "stop_sign": "Full",
  "conditions": "[{\"marketType\":\"Scheduled\",\"symbol\":\"\",\"trigger\":\"Time\",\"triggerValue\":\"14:00:00\",\"comparison\":\"GreaterThanOrEqual\"},{\"marketType\":\"Reference\",\"symbol\":\"2330\",\"trigger\":\"MatchedPrice\",\"triggerValue\":\"580\",\"comparison\":\"LessThanOrEqual\"}]",
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