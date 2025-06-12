import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FubonSDK } from "fubon-neo";
import { Account } from "fubon-neo/trade";
import { z } from "zod";
import { loadToolMetadata, createToolHandler } from "../../shared/utils/index.js";

/**
 * Register get trail history tool to MCP Server
 */
export function registerGetTrailHistoryTool(
  server: McpServer,
  sdk: FubonSDK,
  account: Account
) {
  const currentDir = __dirname;
  const { description } = loadToolMetadata(currentDir, 'get-trail-history', '查詢追蹤停利歷史');

  server.tool(
    "get_trail_history",
    description,
    {
      start_date: z.string().describe("查詢開始日期 (YYYYMMDD)"),
      end_date: z.string().describe("查詢結束日期 (YYYYMMDD)"),
    },
    createToolHandler(
      currentDir,
      'get-trail-history',
      async ({ start_date, end_date }) => {
        // Call SDK API
        return await sdk.stock.getTrailHistory(
          account,
          start_date,
          end_date
        );
      },
      {
        errorMessage: "查詢追蹤停利歷史紀錄時發生錯誤"
      }
    )
  );
}