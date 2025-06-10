import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FubonSDK } from "fubon-neo";
import { Account } from "fubon-neo/trade";
import { z } from "zod";

/**
 * Register get condition by ID tool to MCP Server
 */
export function registerGetConditionByIdTool(
  server: McpServer,
  sdk: FubonSDK,
  account: Account
) {
  server.tool(
    "get_condition_by_id",
    "依 ID 查詢條件單",
    {
      guid: z.string().describe("條件單 GUID 識別碼"),
    },
    async ({ guid }) => {
      try {
        // Call SDK API
        const result = await sdk.stock.getConditionOrderById(account, guid);

        const response = `條件單查詢結果\n\`\`\`json\n${JSON.stringify(
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
              text: `查詢條件單時發生錯誤: ${error || "未知錯誤"}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}