import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FubonSDK } from "fubon-neo";
import { Account } from "fubon-neo/trade";
import { z } from "zod";
import { loadToolMetadata, createToolHandler } from "../../shared/utils/index.js";
  
/**
 * 註冊融資融券額度查詢工具到 MCP Server
 * @param {Object} server MCP Server 實例
 * @param {Object} sdk FubonSDK 實例
 * @param {Object} account 帳戶實例
 */
export function registerMarginQuotaTool(
  server: McpServer,
  sdk: FubonSDK,
  account: Account
) {
  const currentDir = __dirname;
  const { description } = loadToolMetadata(currentDir, 'margin-quota', '查詢融資融券額度');
  
  server.tool(
    "get_margin_quota",
    description,
    {
      symbol: z.string().describe("股票代號，必須指定要查詢的股票")
    },
    createToolHandler(
      currentDir,
      'margin-quota',
      async ({ symbol }) => {
        // 透過SDK查詢融資融券額度
        // 確保symbol不是undefined
        if (!symbol) {
          throw new Error("請提供股票代號以查詢融資融券額度");
        }
        
        return await sdk.stock.marginQuota(account, symbol);
      },
      {
        errorMessage: "查詢融資融券額度時發生錯誤"
      }
    )
  );
}
