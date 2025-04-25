import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import daytradeStockInfoReference from "./references/daytrade-stock-info.json";
import { FubonSDK } from "fubon-neo";
import { Account } from "fubon-neo/trade";
import { z } from "zod";
  
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
  server.tool(
    "get_daytrade_stock_info",
    "查詢股票當沖資訊",
    {
      symbol: z.string().describe("股票代號，必須指定要查詢的股票")
    },
    async ({ symbol }) => {
      try {
        // 透過SDK查詢股票當沖資訊
        // 確保symbol不是undefined
        if (!symbol) {
          return {
            content: [
              {
                type: "text",
                text: "請提供股票代號以查詢當沖資訊",
              },
            ],
            isError: true,
          };
        }
        
        const data = await sdk.stock.daytradeAndStockInfo(account, symbol);

        const response = `API Response\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\`\n\nField Description\n\`\`\`json\n${JSON.stringify(daytradeStockInfoReference, null, 2)}\n\`\`\``;

        return {
          content: [{ type: "text", text: response }],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `查詢股票當沖資訊時發生錯誤: ${error || "未知錯誤"}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
