# 時間切片委託 API

## API 用途
建立時間切片委託單，將大量委託分割成多個時間段執行，降低市場衝擊成本並改善執行效率。支援多種切片策略。

## 主要功能
- 時間間隔切片執行
- 數量均分策略
- 自定義切片方法
- 執行時間控制
- 市場衝擊最小化

## 使用場景
- 大額交易執行
- 市場衝擊成本控制
- 均價策略執行
- 量化交易策略
- 機構投資者下單

## 使用範例

### 範例 1：時間間隔切片策略
將 10000 股台積電分批執行，每 30 秒執行 500 股
```json
{
  "start_date": "20241210",
  "end_date": "20241210",
  "stop_sign": "Full",
  "split_method": "Type1",
  "split_interval": 30,
  "split_single_quantity": 500,
  "split_total_quantity": 10000,
  "split_start_time": "09:30:00",
  "split_end_time": "13:30:00",
  "order_buy_sell": "Buy",
  "order_symbol": "2330",
  "order_price": 610,
  "order_quantity": 10000,
  "order_market_type": "Common",
  "order_price_type": "Limit",
  "order_time_in_force": "ROD",
  "order_order_type": "Stock"
}
```

### 範例 2：數量均分切片策略
將 5000 股聯發科在上午時段均分執行
```json
{
  "start_date": "20241210",
  "end_date": "20241210",
  "stop_sign": "Full",
  "split_method": "Type2",
  "split_interval": 60,
  "split_single_quantity": 1000,
  "split_total_quantity": 5000,
  "split_start_time": "09:30:00",
  "split_end_time": "12:00:00",
  "order_buy_sell": "Sell",
  "order_symbol": "2454",
  "order_price": 1050,
  "order_quantity": 5000,
  "order_market_type": "Common",
  "order_price_type": "Limit",
  "order_time_in_force": "ROD",
  "order_order_type": "Stock"
}
```

### 範例 3：自定義切片策略
使用市價單進行緊急拋售
```json
{
  "start_date": "20241210",
  "end_date": "20241210",
  "stop_sign": "Partial",
  "split_method": "Type3",
  "split_interval": 10,
  "split_single_quantity": 2000,
  "split_total_quantity": 20000,
  "split_start_time": "10:00:00",
  "split_end_time": "11:00:00",
  "order_buy_sell": "Sell",
  "order_symbol": "2330",
  "order_price": 600,
  "order_quantity": 20000,
  "order_market_type": "Common",
  "order_price_type": "Market",
  "order_time_in_force": "IOC",
  "order_order_type": "Stock"
}
```

### 範例 4：長時間分散執行
整日分散買進策略，降低價格衝擊
```json
{
  "start_date": "20241210",
  "end_date": "20241210",
  "stop_sign": "UntilEnd",
  "split_method": "Type1",
  "split_interval": 300,
  "split_single_quantity": 200,
  "split_total_quantity": 8000,
  "split_start_time": "09:30:00",
  "split_end_time": "13:30:00",
  "order_buy_sell": "Buy",
  "order_symbol": "0050",
  "order_price": 145,
  "order_quantity": 8000,
  "order_market_type": "Common",
  "order_price_type": "Limit",
  "order_time_in_force": "ROD",
  "order_order_type": "Stock"
}
```