import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Account, MasterlinkSDK } from "masterlink-sdk";
import { z } from "zod";
import orderHistoryReference from "./references/order-history.json";

/**
 * 註冊查詢歷史委託相關的工具到 MCP Server
 * @param {Object} server MCP Server 實例
 * @param {Object} sdk MasterlinkSDK 實例
 * @param {Object} accounts 帳戶實例陣列
 */
export function registerOrderHistoryTools(
  server: McpServer,
  sdk: MasterlinkSDK,
  accounts: Account[]
) {
  // 查詢歷史委託工具
  server.tool(
    "get_order_history",
    "查詢歷史委託記錄",
    {
      startDate: z
        .string()
        .describe("查詢開始日期，格式：YYYYMMDD，例如：20240301"),
      endDate: z
        .string()
        .describe("查詢結束日期，格式：YYYYMMDD，例如：20240320"),
      symbol: z
        .string()
        .describe("股票代號，例如：2330（可選，不填則查詢所有股票）")
        .optional(),
    },
    async ({ startDate, endDate, symbol }, extra) => {
      try {
        // 呼叫 SDK 獲取歷史委託記錄
        const data = await sdk.stock.orderHistory(accounts[0], startDate, endDate);

        const response = `API Response\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\`\n\nField Description\n\`\`\`json\n${JSON.stringify(orderHistoryReference, null, 2)}\n\`\`\``;

        return {
          content: [{ type: "text", text: response }],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `查詢歷史委託時發生錯誤: ${error || "未知錯誤"}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}