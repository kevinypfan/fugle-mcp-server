import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Account, MasterlinkSDK } from "masterlink-sdk";
import { z } from "zod";
import attentionStockReference from "./references/query-attention-stock.json";

/**
 * 註冊查詢警示股票相關的工具到 MCP Server
 * @param {Object} server MCP Server 實例
 * @param {Object} sdk MasterlinkSDK 實例
 * @param {Object} account 帳戶實例
 */
export function registerAttentionStockTools(
  server: McpServer,
  sdk: MasterlinkSDK,
  account: Account
) {
  // 查詢警示股票工具
  server.tool(
    "get_attention_stock",
    "查詢警示股票",
    {
      symbol: z
        .string()
        .describe("股票代號，例如：2330（可選，不填則查詢所有警示股票）")
        .optional(),
    },
    async ({ symbol }, extra) => {
      try {
        // 呼叫 SDK 獲取警示股票資訊
        const data = await sdk.stock.queryAttentionStock(account, symbol);

        const response = `API Response\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\`\n\nField Description\n\`\`\`json\n${JSON.stringify(attentionStockReference, null, 2)}\n\`\`\``;

        return {
          content: [{ type: "text", text: response }],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `查詢警示股票時發生錯誤: ${error || "未知錯誤"}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}