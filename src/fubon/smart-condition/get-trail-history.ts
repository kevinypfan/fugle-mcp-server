import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FubonSDK } from "fubon-neo";
import { Account } from "fubon-neo/trade";
import { z } from "zod";

/**
 * Register get trail history tool to MCP Server
 */
export function registerGetTrailHistoryTool(
  server: McpServer,
  sdk: FubonSDK,
  account: Account
) {
  server.tool(
    "get_trail_history",
    "查詢追蹤停利歷史紀錄",
    {
      start_date: z.string().describe("查詢開始日期 (YYYYMMDD)"),
      end_date: z.string().describe("查詢結束日期 (YYYYMMDD)"),
    },
    async ({ start_date, end_date }) => {
      try {
        // Call SDK API
        const result = await sdk.stock.getTrailHistory(
          account,
          start_date,
          end_date
        );

        const response = `追蹤停利歷史紀錄查詢結果\n\`\`\`json\n${JSON.stringify(
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
              text: `查詢追蹤停利歷史紀錄時發生錯誤: ${error || "未知錯誤"}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}