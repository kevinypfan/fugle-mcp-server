import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Account, MasterlinkSDK } from "masterlink-sdk";
import { z } from "zod";
import filledDetailReference from "./references/get-filled-detail.json";

/**
 * 註冊查詢成交明細相關的工具到 MCP Server
 * @param {Object} server MCP Server 實例
 * @param {Object} sdk MasterlinkSDK 實例
 * @param {Object} accounts 帳戶實例陣列
 */
export function registerFilledDetailTools(
  server: McpServer,
  sdk: MasterlinkSDK,
  accounts: Account[]
) {
  // 查詢今日成交明細工具
  server.tool(
    "get_filled_detail",
    "查詢今日成交明細",
    {
      symbol: z
        .string()
        .describe("股票代號，例如：2330（可選，不填則查詢所有股票）")
        .optional(),
    },
    async ({ symbol }, extra) => {
      try {
        // 呼叫 SDK 獲取成交明細
        const data = await sdk.stock.getFilledDetail(accounts[0], symbol);

        const response = `API Response\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\`\n\nField Description\n\`\`\`json\n${JSON.stringify(filledDetailReference, null, 2)}\n\`\`\``;

        return {
          content: [{ type: "text", text: response }],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `查詢成交明細時發生錯誤: ${error || "未知錯誤"}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}