# 追蹤停利委託 API

## API 用途
建立追蹤停利委託單，根據股價變動動態調整停利點，確保獲利最大化同時控制風險。支援向上或向下追蹤。

## 主要功能
- 動態停利點調整
- 向上/向下追蹤模式
- 百分比閾值設定
- 價格跳動調整
- 獲利保護機制

## 使用場景
- 趨勢跟隨策略
- 獲利保護與擴大
- 波段交易執行
- 動態風險控管
- 自動化停利管理

## 使用範例

### 範例 1：向上追蹤停利
持有台積電 1000 股，從 600 元開始向上追蹤 3%，保護獲利
```json
{
  "start_date": "20241210",
  "end_date": "20241231",
  "stop_sign": "Full",
  "trail_symbol": "2330",
  "trail_price": 600.00,
  "trail_direction": "Up",
  "trail_percentage": 3.0,
  "trail_buysell": "Sell",
  "trail_quantity": 1000,
  "trail_price_type": "Limit",
  "trail_diff": -1.0
}
```

### 範例 2：向下追蹤逢低買進
追蹤台積電價格下跌 5% 後買進 2000 股
```json
{
  "start_date": "20241210",
  "end_date": "20241231",
  "stop_sign": "Full",
  "trail_symbol": "2330",
  "trail_price": 650.00,
  "trail_direction": "Down",
  "trail_percentage": 5.0,
  "trail_buysell": "Buy",
  "trail_quantity": 2000,
  "trail_price_type": "Market",
  "trail_diff": 0.0
}
```

### 範例 3：高頻交易追蹤
聯發科短線追蹤 1.5%，快速停利
```json
{
  "start_date": "20241210",
  "end_date": "20241210",
  "stop_sign": "Partial",
  "trail_symbol": "2454",
  "trail_price": 1100.00,
  "trail_direction": "Up",
  "trail_percentage": 1.5,
  "trail_buysell": "Sell",
  "trail_quantity": 500,
  "trail_price_type": "MatchedPrice",
  "trail_diff": 0.5
}
```

### 範例 4：大幅追蹤策略
ETF 0050 長期持有，追蹤 8% 停利
```json
{
  "start_date": "20241210",
  "end_date": "20250131",
  "stop_sign": "UntilEnd",
  "trail_symbol": "0050",
  "trail_price": 140.00,
  "trail_direction": "Up",
  "trail_percentage": 8.0,
  "trail_buysell": "Sell",
  "trail_quantity": 5000,
  "trail_price_type": "Limit",
  "trail_diff": -0.5
}
```

### 範例 5：反彈追蹤買進
鴻海股價從低點反彈 4% 後追蹤買進
```json
{
  "start_date": "20241210",
  "end_date": "20241220",
  "stop_sign": "Full",
  "trail_symbol": "2317",
  "trail_price": 180.00,
  "trail_direction": "Up",
  "trail_percentage": 4.0,
  "trail_buysell": "Buy",
  "trail_quantity": 3000,
  "trail_price_type": "BidPrice",
  "trail_diff": 1.0
}
```

## 追蹤機制說明

### 向上追蹤 (Up)
- 當股價上漲時，停利點會跟著上調
- 當股價回落達到設定百分比時觸發賣出
- 適用於保護已獲利部位

### 向下追蹤 (Down)  
- 當股價下跌時，買進點會跟著下調
- 當股價反彈達到設定百分比時觸發買進
- 適用於逢低加碼策略

### 價格跳動調整 (trail_diff)
- 正數：執行價格加價
- 負數：執行價格減價
- 0：按追蹤價格執行