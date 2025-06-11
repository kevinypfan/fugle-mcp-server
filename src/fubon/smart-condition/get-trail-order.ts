import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FubonSDK } from "fubon-neo";
import { Account } from "fubon-neo/trade";
import { z } from "zod";
import { loadToolDescription } from "./utils.js";

/**
 * Register get trail order tool to MCP Server
 */
export function registerGetTrailOrderTool(
  server: McpServer,
  sdk: FubonSDK,
  account: Account
) {
  server.tool(
    "get_trail_order",
    loadToolDescription('get-trail-order', '查詢追蹤停利委託'),
    {},
    async () => {
      try {
        // Call SDK API
        const result = await sdk.stock.getTrailOrder(account);

        const response = `追蹤停利委託查詢結果\n\`\`\`json\n${JSON.stringify(
          result,
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
              text: `查詢追蹤停利委託時發生錯誤: ${error || "未知錯誤"}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}