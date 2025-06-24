import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FubonSDK } from "fubon-neo";
import { Account } from "fubon-neo/trade";
import { z } from "zod";
import { loadToolMetadata, createToolHandler } from "../../shared/utils/index.js";

/**
 * Register get condition by ID tool to MCP Server
 */
export function registerGetConditionByIdTool(
  server: McpServer,
  sdk: FubonSDK,
  account: Account
) {
  const currentDir = __dirname;
  const { description } = loadToolMetadata(currentDir, 'get-condition-by-id', '查詢條件單資訊');

  server.tool(
    "get_condition_by_id",
    description,
    {
      guid: z.string().describe("條件單 GUID 識別碼"),
    },
    createToolHandler(
      currentDir,
      'get-condition-by-id',
      async ({ guid }) => {
        // Call SDK API
        return await sdk.stock.getConditionOrderById(account, guid);
      },
      {
        errorMessage: "查詢條件單時發生錯誤"
      }
    )
  );
}