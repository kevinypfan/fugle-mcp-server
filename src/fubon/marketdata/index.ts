import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RestStockClient } from "fubon-neo/marketdata/rest/stock/client";
import { registerAllMarketDataTools as registerSharedMarketDataTools } from "../../shared/marketdata";

// 定義一個函數來註冊所有市場數據工具
export const registerAllTools = (
  server: McpServer,
  stock: RestStockClient
) => {
  // 使用共享的實現
  registerSharedMarketDataTools(server, stock);
};