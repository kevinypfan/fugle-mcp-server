import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Account, MasterlinkSDK } from "masterlink-sdk";
import { z } from "zod";
import todayTradeSummaryReference from "./references/today-trade-summary.json";

/**
 * 註冊今日買賣日報與即時庫存查詢工具到 MCP Server
 * @param {Object} server MCP Server 實例
 * @param {Object} sdk MasterlinkSDK 實例
 * @param {Object} account 帳戶實例
 */
export function registerTodayTradeSummaryTools(
  server: McpServer,
  sdk: MasterlinkSDK,
  account: Account
) {
  // 今日買賣日報與即時庫存查詢工具
  server.tool(
    "get_account_today_trade_summary",
    "查詢今日買賣日報與即時庫存資訊",
    {
      symbol: z.string().optional().describe("選擇性參數：可指定股票代號"),
    },
    async ({ symbol }) => {
      try {
        // 透過SDK獲取今日買賣日報與即時庫存資訊
        const data = await sdk.accounting.todayTradeSummary(account, symbol);

        const response = `API Response\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\`\n\nField Description\n\`\`\`json\n${JSON.stringify(todayTradeSummaryReference, null, 2)}\n\`\`\``;

        return {
          content: [{ type: "text", text: response }],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `查詢今日買賣日報與即時庫存資訊時發生錯誤: ${error || "未知錯誤"}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
