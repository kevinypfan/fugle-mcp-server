# 股票基本資料 API

## API 用途
取得股票的基本資料和可用的資料卡片清單，提供股票代號對應的各種資料來源和更新狀態。此 API 主要用於確認該股票有哪些資料可以取得，以及各項資料的更新時間。

## 主要功能
- 股票代號確認（symbol_id）
- 可用資料卡片清單（available_cards）
- 各資料卡片的更新時間
- 資料完整性評分（default_score）
- 資料卡片規格 ID（card_spec_id）

## 使用場景
- 確認股票資料可用性
- 檢查資料更新狀態
- 系統整合前的資料來源確認
- API 功能探索和測試