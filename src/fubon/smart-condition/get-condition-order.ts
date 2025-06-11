import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FubonSDK } from "fubon-neo";
import { Account } from "fubon-neo/trade";
import { z } from "zod";
import { ConditionStatus } from "./types.js";
import { loadToolDescription } from "./utils.js";

/**
 * Register get condition order tool to MCP Server
 */
export function registerGetConditionOrderTool(
  server: McpServer,
  sdk: FubonSDK,
  account: Account
) {
  server.tool(
    "get_condition_order",
    loadToolDescription('get-condition-order', '查詢條件單委託'),
    {
      condition_status: z.enum([
        "Type1", "Type2", "Type3", "Type4", "Type5", "Type6", 
        "Type7", "Type8", "Type9", "Type10", "Type11"
      ] as const).optional().describe(
        "條件狀態篩選（選填）：Type1=今日相關查詢, Type2=尚有效單, Type3=條件比對中, Type4=委託處理中, Type5=委託成功, Type6=已通知, Type7=委託失敗, Type8=已有成交, Type9=刪除成功, Type10=異常, Type11=失效"
      ),
    },
    async ({ condition_status }) => {
      try {
        // Call SDK API
        const result = await sdk.stock.getConditionOrder(
          account, 
          condition_status as any
        );

        const response = `條件單委託查詢結果\n\`\`\`json\n${JSON.stringify(
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
              text: `查詢條件單委託時發生錯誤: ${error || "未知錯誤"}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}