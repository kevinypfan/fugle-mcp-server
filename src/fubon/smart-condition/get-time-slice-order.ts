import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FubonSDK } from "fubon-neo";
import { Account } from "fubon-neo/trade";
import { z } from "zod";
import { loadToolMetadata, createToolHandler } from "../../shared/utils/index.js";

/**
 * Register get time slice order tool to MCP Server
 */
export function registerGetTimeSliceOrderTool(
  server: McpServer,
  sdk: FubonSDK,
  account: Account
) {
  const currentDir = __dirname;
  const { description } = loadToolMetadata(currentDir, 'get-time-slice-order', '查詢時間切片委託');

  server.tool(
    "get_time_slice_order",
    description,
    {
      batch_no: z.string().describe("批次號碼"),
    },
    createToolHandler(
      currentDir,
      'get-time-slice-order',
      async ({ batch_no }) => {
        // Call SDK API
        return await sdk.stock.getTimeSliceOrder(account, batch_no);
      },
      {
        errorMessage: "查詢時間切片委託明細時發生錯誤"
      }
    )
  );
}