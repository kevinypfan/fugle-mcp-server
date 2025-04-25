import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Account, MasterlinkSDK } from "masterlink-sdk";
import { z } from "zod";
import shortDaytradeQuotaReference from "./references/short-day-trade-quota.json";

/**
 * 註冊查詢現沖券餘額相關的工具到 MCP Server
 * @param {Object} server MCP Server 實例
 * @param {Object} sdk MasterlinkSDK 實例
 * @param {Object} account 帳戶實例
 */
export function registerShortDaytradeQuotaTools(
  server: McpServer,
  sdk: MasterlinkSDK,
  account: Account
) {
  // 查詢現沖券餘額工具
  server.tool(
    "get_short_daytrade_quota",
    "查詢股票現沖券餘額",
    {
      symbol: z
        .string()
        .describe("股票代號，例如：2330"),
    },
    async ({ symbol }, extra) => {
      try {
        // 呼叫 SDK 獲取現沖券餘額資訊
        const data = await sdk.stock.shortDaytradeQuota(account, symbol);

        const response = `API Response\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\`\n\nField Description\n\`\`\`json\n${JSON.stringify(shortDaytradeQuotaReference, null, 2)}\n\`\`\``;

        return {
          content: [{ type: "text", text: response }],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `查詢現沖券餘額時發生錯誤: ${error || "未知錯誤"}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}