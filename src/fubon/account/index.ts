import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FubonSDK } from "fubon-neo";
import { Account } from "fubon-neo/trade";

// 導入所有的工具註冊函數
import { registerBankBalanceTool } from "./bank-remain.js";
import { registerInventoriesTool } from "./inventories.js";
import { registerMaintenanceTool } from "./maintenance.js";
import { registerQuerySettlementTool } from "./query-settlement.js";
import { registerRealizedPnLDetailTool } from "./realized-pnl-detail.js";
import { registerRealizedPnLSumTool } from "./realized-pnl-sum.js";
import { registerUnrealizedPnLDetailTool } from "./unrealized-pnl-detail.js";

/**
 * 註冊所有帳戶管理相關工具到 MCP Server
 * @param {Object} server MCP Server 實例
 * @param {Object} sdk FubonSDK 實例
 * @param {Object} account 帳戶實例
 */
export function registerAccountManagementTools(
  server: McpServer,
  sdk: FubonSDK,
  account: Account
) {
  // 註冊所有工具
  registerBankBalanceTool(server, sdk, account);
  registerInventoriesTool(server, sdk, account);
  registerMaintenanceTool(server, sdk, account);
  registerQuerySettlementTool(server, sdk, account);
  registerRealizedPnLDetailTool(server, sdk, account);
  registerRealizedPnLSumTool(server, sdk, account);
  registerUnrealizedPnLDetailTool(server, sdk, account);
}
