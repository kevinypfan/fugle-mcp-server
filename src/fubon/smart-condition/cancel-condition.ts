import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FubonSDK } from "fubon-neo";
import { Account } from "fubon-neo/trade";
import { z } from "zod";
import { loadToolDescription } from "./utils.js";

/**
 * Register cancel condition order tool to MCP Server
 */
export function registerCancelConditionTool(
  server: McpServer,
  sdk: FubonSDK,
  account: Account
) {
  server.tool(
    "cancel_condition_order",
    loadToolDescription('cancel-condition', '取消條件單'),
    {
      guid: z.string().describe("條件單 GUID 識別碼"),
    },
    async ({ guid }) => {
      try {
        if (process.env.ENABLE_ORDER !== "true") {
          throw new Error(
            "條件單功能已停用！(啟用此功能請在環境變數中設定 ENABLE_ORDER 為 true )"
          );
        }

        // Call SDK API
        const result = await sdk.stock.cancelConditionOrders(account, guid);

        const response = `取消條件單結果\n\`\`\`json\n${JSON.stringify(
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
              text: `取消條件單時發生錯誤: ${error || "未知錯誤"}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}