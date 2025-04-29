## 注意事項

* **關於日期參數**: 在 `get_realized_pnl_detail` 和 `get_realized_pnl_summary` 工具中，日期參數目前只用於前端顯示和參考，並不實際影響 API 查詢結果。當前版本的 SDK 不支援直接郵入日期範圍進行查詢。

* **未來改進**: 未來版本可能會增加對日期過濾的支援，將可能透過其他方式指定查詢範圍。# 富邦帳戶管理 MCP 工具使用指南

這份指南說明如何在你的 MCP 專案中整合和使用富邦證券的帳戶管理工具。

## 安裝步驟

1. 確保已經安裝了 `fubon-neo` SDK 和 `@modelcontextprotocol/sdk` 套件：

```bash
npm install fubon-neo @modelcontextprotocol/sdk
```

## 如何整合到你的 MCP 伺服器

在你的伺服器啟動程式碼中，添加以下內容：

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FubonSDK } from "fubon-neo";
import { Account } from "fubon-neo/trade";
import { registerAccountManagementTools } from "./path/to/fubon/account/index.js";

// 初始化 MCP 伺服器
const server = new McpServer({
  // 你的伺服器配置
});

// 初始化富邦 SDK
const sdk = new FubonSDK({
  // 你的 SDK 配置
});

// 創建用戶帳戶實例
const account = new Account({
  // 帳戶資訊
});

// 註冊所有帳戶管理工具
registerAccountManagementTools(server, sdk, account);

// 啟動 MCP 伺服器
server.start();
```

## 可用的工具

這個套件提供了以下 MCP 工具：

1. **get_bank_remain** - 查詢銀行餘額資訊
   - 輸入：無需額外參數
   - 輸出：銀行餘額資訊（幣別、餘額、可用餘額等）

2. **get_inventories** - 查詢庫存資訊
   - 輸入：無需額外參數
   - 輸出：詳細的庫存資訊列表

3. **get_maintenance** - 查詢維持率資訊
   - 輸入：無需額外參數
   - 輸出：維持率彙總和明細資訊

4. **get_settlement** - 查詢交割款資訊
   - 輸入：`range` - 時間區間，可選值為 "0d"（當日）或 "3d"，預設為 "0d"
   - 輸出：交割款明細資訊

5. **get_realized_pnl_detail** - 查詢已實現損益明細
   - 輸入：
     - `startDate` - 查詢起始日期，格式為 YYYY/MM/DD，例如：2024/01/01（僅用於前端顯示，實際上 SDK 不支援日期過濾）
     - `endDate` - 查詢截止日期，格式為 YYYY/MM/DD，例如：2024/01/31（僅用於前端顯示，實際上 SDK 不支援日期過濾）
   - 輸出：已實現損益的詳細資訊（SDK 預設時間範圍）

6. **get_realized_pnl_summary** - 查詢已實現損益彙總
   - 輸入：
     - `startDate` - 查詢起始日期，格式為 YYYY/MM/DD，例如：2024/01/01（僅用於前端顯示，實際上 SDK 不支援日期過濾）
     - `endDate` - 查詢截止日期，格式為 YYYY/MM/DD，例如：2024/01/31（僅用於前端顯示，實際上 SDK 不支援日期過濾）
   - 輸出：已實現損益的彙總資訊（SDK 預設時間範圍）

7. **get_unrealized_pnl_detail** - 查詢未實現損益資訊
   - 輸入：無需額外參數
   - 輸出：未實現損益的詳細資訊

## 在對話中使用

一旦工具已註冊到 MCP 伺服器，AI 助手將能夠使用這些工具來回應用戶的相關查詢。例如：

- 「我想查看我的銀行餘額」
- 「幫我查詢目前的庫存情況」
- 「顯示我的融資維持率」
- 「查詢本週的交割款資訊」
- 「從上個月 1 號到今天的已實現損益」（格式為：2024/03/01 至 2024/04/25）

AI 助手將能夠調用相應的工具並向用戶呈現結果。

## 工具回應格式

每個工具都會返回標準化的 JSON 格式，包含 API 回應和欄位說明：

```
API Response
```json
{
  "isSuccess": true,
  "data": { ... }
}
```

Field Description
```json
{
  "fieldName": { "type": "string", "desc": "欄位說明" },
  ...
}
```

這種格式可以幫助 AI 助手更好地理解和解釋返回的數據，從而提供更有價值的回應給用戶。