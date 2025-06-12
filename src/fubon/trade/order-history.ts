import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FubonSDK } from "fubon-neo";
import { Account } from "fubon-neo/trade";
import { z } from "zod";
import { loadToolMetadata, createToolHandler } from "../../shared/utils/index.js";
  
/**
 * 註冊委託單歷史查詢工具到 MCP Server
 * @param {Object} server MCP Server 實例
 * @param {Object} sdk FubonSDK 實例
 * @param {Object} account 帳戶實例
 */
export function registerOrderHistoryTool(
  server: McpServer,
  sdk: FubonSDK,
  account: Account
) {
  const currentDir = __dirname;
  const { description } = loadToolMetadata(currentDir, 'order-history', '查詢委託單歷史紀錄');
  
  server.tool(
    "get_order_history",
    description,
    {
      date: z.string().optional().describe("查詢日期 (格式: YYYY/MM/DD)，不指定則為今日"),
      symbol: z.string().optional().describe("股票代號，不指定則查詢全部")
    },
    createToolHandler(
      currentDir,
      'order-history',
      async ({ date, symbol }) => {
        // 透過SDK查詢委託單歷史
        // 確保date不是undefined
        const startDate = date || new Date().toLocaleDateString();
        return await sdk.stock.orderHistory(account, startDate, symbol || undefined);
      },
      {
        errorMessage: "查詢委託單歷史時發生錯誤"
      }
    )
  );
}