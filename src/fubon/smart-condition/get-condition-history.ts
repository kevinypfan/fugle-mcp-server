import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FubonSDK } from "fubon-neo";
import { Account } from "fubon-neo/trade";
import { z } from "zod";
import { HistoryStatus } from "./types.js";
import { loadToolMetadata, createToolHandler } from "../../shared/utils/index.js";

/**
 * Register get condition history tool to MCP Server
 */
export function registerGetConditionHistoryTool(
  server: McpServer,
  sdk: FubonSDK,
  account: Account
) {
  const currentDir = __dirname;
  const { description } = loadToolMetadata(currentDir, 'get-condition-history', '查詢條件單歷史');

  server.tool(
    "get_condition_history",
    description,
    {
      start_date: z.string().describe("查詢開始日期 (YYYYMMDD)"),
      end_date: z.string().describe("查詢結束日期 (YYYYMMDD)"),
      history_status: z.enum([
        "Type1", "Type2", "Type3", "Type4", "Type5", "Type6"
      ] as const).optional().describe(
        "歷史狀態篩選（選填）：Type1=所有條件單(不包含已刪除、失效), Type2=選擇期間內全部成交單, Type3=選擇期間內部分成交單, Type4=選擇期間刪除單, Type5=選擇期間失效單, Type6=選擇期間內已觸發記錄"
      ),
    },
    createToolHandler(
      currentDir,
      'get-condition-history',
      async ({ start_date, end_date, history_status }) => {
        // Call SDK API
        return await sdk.stock.getConditionHistory(
          account,
          start_date,
          end_date,
          history_status as any
        );
      },
      {
        errorMessage: "查詢條件單歷史紀錄時發生錯誤"
      }
    )
  );
}