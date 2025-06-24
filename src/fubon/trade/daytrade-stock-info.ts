import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FubonSDK } from "fubon-neo";
import { Account } from "fubon-neo/trade";
import { z } from "zod";
import { loadToolMetadata, createToolHandler } from "../../shared/utils/index.js";
  
/**
 * 註冊當沖資訊查詢工具到 MCP Server
 * @param {Object} server MCP Server 實例
 * @param {Object} sdk FubonSDK 實例
 * @param {Object} account 帳戶實例
 */
export function registerDaytradeAndStockInfoTool(
  server: McpServer,
  sdk: FubonSDK,
  account: Account
) {
  const currentDir = __dirname;
  const { description } = loadToolMetadata(currentDir, 'daytrade-stock-info', '查詢股票當沖資訊');
  
  server.tool(
    "get_daytrade_stock_info",
    description,
    {
      symbol: z.string().describe("股票代號，必須指定要查詢的股票")
    },
    createToolHandler(
      currentDir,
      'daytrade-stock-info',
      async ({ symbol }) => {
        // 透過SDK查詢股票當沖資訊
        // 確保symbol不是undefined
        if (!symbol) {
          throw new Error("請提供股票代號以查詢當沖資訊");
        }
        
        return await sdk.stock.daytradeAndStockInfo(account, symbol);
      },
      {
        errorMessage: "查詢股票當沖資訊時發生錯誤"
      }
    )
  );
}