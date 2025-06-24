import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FubonSDK } from "fubon-neo";
import { Account } from "fubon-neo/trade";
import { z } from "zod";
import { loadToolMetadata, createToolHandler } from "../../shared/utils/index.js";

/**
 * Register get trail order tool to MCP Server
 */
export function registerGetTrailOrderTool(
  server: McpServer,
  sdk: FubonSDK,
  account: Account
) {
  const currentDir = __dirname;
  const { description } = loadToolMetadata(currentDir, 'get-trail-order', '查詢追蹤停利委託');

  server.tool(
    "get_trail_order",
    description,
    {},
    createToolHandler(
      currentDir,
      'get-trail-order',
      async () => {
        // Call SDK API
        return await sdk.stock.getTrailOrder(account);
      },
      {
        errorMessage: "查詢追蹤停利委託時發生錯誤"
      }
    )
  );
}