import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FubonSDK } from "fubon-neo";
import { Account } from "fubon-neo/trade";
import { z } from "zod";
import {
  loadToolMetadata,
  createToolHandler,
} from "../../shared/utils/index.js";

/**
 * 註冊已實現損益彙總查詢工具到 MCP Server
 * @param {Object} server MCP Server 實例
 * @param {Object} sdk FubonSDK 實例
 * @param {Object} account 帳戶實例
 */
export function registerRealizedPnLSumTool(
  server: McpServer,
  sdk: FubonSDK,
  account: Account
) {
  const currentDir = __dirname;
  const { description } = loadToolMetadata(
    currentDir,
    "realized-pnl-sum",
    "查詢已實現損益彙總"
  );

  // 已實現損益彙總查詢工具
  server.tool(
    "get_realized_pnl_summary",
    description,
    {},
    createToolHandler(
      currentDir,
      "realized-pnl-sum",
      async () => {
        return sdk.accounting.realizedGainsAndLosesSummary(account);
      },
      {
        errorMessage: "已實現損益彙總查詢時發生錯誤",
      }
    )
  );
}
