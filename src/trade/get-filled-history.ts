import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Account, MasterlinkSDK } from "masterlink-sdk";
import { z } from "zod";
import filledHistoryReference from "./references/filled-history.json";

/**
 * 註冊查詢歷史成交相關的工具到 MCP Server
 * @param {Object} server MCP Server 實例
 * @param {Object} sdk MasterlinkSDK 實例
 * @param {Object} accounts 帳戶實例陣列
 */
export function registerFilledHistoryTools(
  server: McpServer,
  sdk: MasterlinkSDK,
  accounts: Account[]
) {
  // 查詢歷史成交工具
  server.tool(
    "filled_history",
    "查詢歷史成交",
    {
      startDate: z
        .string()
        .describe("查詢開始日期 (YYYYMMDD 格式)"),
      endDate: z
        .string()
        .describe("查詢結束日期 (YYYYMMDD 格式)"),
    },
    async ({ startDate, endDate }, extra) => {
      try {
        // 呼叫 SDK 獲取歷史成交資訊
        const data = await sdk.stock.filledHistory(accounts[0], startDate, endDate);

        const response = `API Response\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\`\n\nField Description\n\`\`\`json\n${JSON.stringify(filledHistoryReference, null, 2)}\n\`\`\``;

        return {
          content: [{ type: "text", text: response }],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `查詢歷史成交時發生錯誤: ${error || "未知錯誤"}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}