import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FubonSDK } from "fubon-neo";
import { Account } from "fubon-neo/trade";
import { z } from "zod";

/**
 * Register get time slice order tool to MCP Server
 */
export function registerGetTimeSliceOrderTool(
  server: McpServer,
  sdk: FubonSDK,
  account: Account
) {
  server.tool(
    "get_time_slice_order",
    "查詢時間切片委託明細",
    {
      batch_no: z.string().describe("批次號碼"),
    },
    async ({ batch_no }) => {
      try {
        // Call SDK API
        const result = await sdk.stock.getTimeSliceOrder(account, batch_no);

        const response = `時間切片委託明細查詢結果\n\`\`\`json\n${JSON.stringify(
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
              text: `查詢時間切片委託明細時發生錯誤: ${error || "未知錯誤"}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}