import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FubonSDK } from "fubon-neo";
import { Account } from "fubon-neo/trade";

// 導入所有的工具註冊函數
import { registerPlaceOrderTool } from "./place-order.js";
import { registerCancelOrderTool } from "./cancel-order.js";
import { registerModifyPriceTool } from "./modify-price.js";
import { registerModifyQuantityTool } from "./modify-quantity.js";
import { registerOrderHistoryTool } from "./order-history.js";
import { registerFilledHistoryTool } from "./filled-history.js";
import { registerGetOrderResultsTool } from "./get-order-results.js";
import { registerMarginQuotaTool } from "./margin-quota.js";
import { registerDaytradeAndStockInfoTool } from "./daytrade-stock-info.js";

/**
 * 註冊所有交易相關工具到 MCP Server
 * @param {Object} server MCP Server 實例
 * @param {Object} sdk FubonSDK 實例
 * @param {Object} account 帳戶實例
 */
export function registerTradeTools(
  server: McpServer,
  sdk: FubonSDK,
  account: Account
) {
  // 註冊所有工具
  registerPlaceOrderTool(server, sdk, account);
  registerCancelOrderTool(server, sdk, account);
  registerModifyPriceTool(server, sdk, account);
  registerModifyQuantityTool(server, sdk, account);
  registerOrderHistoryTool(server, sdk, account);
  registerFilledHistoryTool(server, sdk, account);
  registerGetOrderResultsTool(server, sdk, account);
  registerMarginQuotaTool(server, sdk, account);
  registerDaytradeAndStockInfoTool(server, sdk, account);

}