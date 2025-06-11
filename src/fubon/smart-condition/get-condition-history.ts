import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FubonSDK } from "fubon-neo";
import { Account } from "fubon-neo/trade";
import { z } from "zod";
import { HistoryStatus } from "./types.js";
import { loadToolDescription } from "./utils.js";

/**
 * Register get condition history tool to MCP Server
 */
export function registerGetConditionHistoryTool(
  server: McpServer,
  sdk: FubonSDK,
  account: Account
) {
  server.tool(
    "get_condition_history",
    loadToolDescription('get-condition-history', '查詢條件單歷史'),
    {
      start_date: z.string().describe("查詢開始日期 (YYYYMMDD)"),
      end_date: z.string().describe("查詢結束日期 (YYYYMMDD)"),
      history_status: z.enum([
        "Type1", "Type2", "Type3", "Type4", "Type5", "Type6"
      ] as const).optional().describe(
        "歷史狀態篩選（選填）：Type1=所有條件單(不包含已刪除、失效), Type2=選擇期間內全部成交單, Type3=選擇期間內部分成交單, Type4=選擇期間刪除單, Type5=選擇期間失效單, Type6=選擇期間內已觸發記錄"
      ),
    },
    async ({ start_date, end_date, history_status }) => {
      try {
        // Call SDK API
        const result = await sdk.stock.getConditionHistory(
          account,
          start_date,
          end_date,
          history_status as any
        );

        const response = `條件單歷史紀錄查詢結果\n\`\`\`json\n${JSON.stringify(
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
              text: `查詢條件單歷史紀錄時發生錯誤: ${error || "未知錯誤"}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}