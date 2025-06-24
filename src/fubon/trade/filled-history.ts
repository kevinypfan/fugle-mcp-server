import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FubonSDK } from "fubon-neo";
import { Account } from "fubon-neo/trade";
import { z } from "zod";
import { loadToolMetadata, createToolHandler } from "../../shared/utils/index.js";
  
/**
 * 註冊成交單歷史查詢工具到 MCP Server
 * @param {Object} server MCP Server 實例
 * @param {Object} sdk FubonSDK 實例
 * @param {Object} account 帳戶實例
 */
export function registerFilledHistoryTool(
  server: McpServer,
  sdk: FubonSDK,
  account: Account
) {
  const currentDir = __dirname;
  const { description } = loadToolMetadata(currentDir, 'filled-history', '查詢成交單歷史紀錄');
  
  server.tool(
    "get_filled_history",
    description,
    {
      date: z.string().optional().describe("查詢日期 (格式: YYYY/MM/DD)，不指定則為今日"),
      symbol: z.string().optional().describe("股票代號，不指定則查詢全部")
    },
    createToolHandler(
      currentDir,
      'filled-history',
      async ({ date, symbol }) => {
        // 透過SDK查詢成交單歷史
        // 確保date不是undefined
        const startDate = date || new Date().toLocaleDateString();
        return await sdk.stock.filledHistory(account, startDate, symbol || undefined);
      },
      {
        errorMessage: "查詢成交單歷史時發生錯誤"
      }
    )
  );
}