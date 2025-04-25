import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import marginQuotaReference from "./references/margin-quota.json";
import { FubonSDK } from "fubon-neo";
import { Account } from "fubon-neo/trade";
import { z } from "zod";
  
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
  server.tool(
    "get_margin_quota",
    "查詢融資融券額度",
    {
      symbol: z.string().describe("股票代號，必須指定要查詢的股票")
    },
    async ({ symbol }) => {
      try {
        // 透過SDK查詢融資融券額度
        // 確保symbol不是undefined
        if (!symbol) {
          return {
            content: [
              {
                type: "text",
                text: "請提供股票代號以查詢融資融券額度",
              },
            ],
            isError: true,
          };
        }
        
        const data = await sdk.stock.marginQuota(account, symbol);

        const response = `API Response\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\`\n\nField Description\n\`\`\`json\n${JSON.stringify(marginQuotaReference, null, 2)}\n\`\`\``;

        return {
          content: [{ type: "text", text: response }],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `查詢融資融券額度時發生錯誤: ${error || "未知錯誤"}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
