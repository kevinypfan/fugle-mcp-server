import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import filledHistoryReference from "./references/filled-history.json";
import { FubonSDK } from "fubon-neo";
import { Account } from "fubon-neo/trade";
import { z } from "zod";
  
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
  server.tool(
    "get_filled_history",
    "查詢成交單歷史紀錄",
    {
      date: z.string().optional().describe("查詢日期 (格式: YYYY/MM/DD)，不指定則為今日"),
      symbol: z.string().optional().describe("股票代號，不指定則查詢全部")
    },
    async ({ date, symbol }) => {
      try {
        // 透過SDK查詢成交單歷史
        // 確保date不是undefined
        const startDate = date || new Date().toLocaleDateString();
        const data = await sdk.stock.filledHistory(account, startDate, symbol || undefined);

        const response = `API Response\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\`\n\nField Description\n\`\`\`json\n${JSON.stringify(filledHistoryReference, null, 2)}\n\`\`\``;

        return {
          content: [{ type: "text", text: response }],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `查詢成交單歷史時發生錯誤: ${error || "未知錯誤"}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
