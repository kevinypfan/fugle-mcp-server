import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Account, MasterlinkSDK } from "masterlink-sdk";
import { z } from "zod";
import dispositionStockReference from "./references/query-disposition-stock.json";

/**
 * 註冊查詢處置股票相關的工具到 MCP Server
 * @param {Object} server MCP Server 實例
 * @param {Object} sdk MasterlinkSDK 實例
 * @param {Object} account 帳戶實例
 */
export function registerDispositionStockTools(
  server: McpServer,
  sdk: MasterlinkSDK,
  account: Account
) {
  // 查詢處置股票工具
  server.tool(
    "query_disposition_stock",
    "查詢處置股票",
    {
      symbol: z
        .string()
        .describe("股票代號，例如：2330（可選，不填則查詢所有處置股票）"),
    },
    async ({ symbol }, extra) => {
      try {
        // 呼叫 SDK 獲取處置股票資訊
        const data = await sdk.stock.queryDispositionStock(account, symbol);

        const response = `API Response\n\`\`\`json\n${JSON.stringify(
          data,
          null,
          2
        )}\n\`\`\`\n\nField Description\n\`\`\`json\n${JSON.stringify(
          dispositionStockReference,
          null,
          2
        )}\n\`\`\``;

        return {
          content: [{ type: "text", text: response }],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `查詢處置股票時發生錯誤: ${error || "未知錯誤"}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
