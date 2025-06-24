import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FubonSDK } from "fubon-neo";
import { Account } from "fubon-neo/trade";
import { z } from "zod";
import { loadToolMetadata, createToolHandler } from "../../shared/utils/index.js";

/**
 * Register cancel condition order tool to MCP Server
 */
export function registerCancelConditionTool(
  server: McpServer,
  sdk: FubonSDK,
  account: Account
) {
  const currentDir = __dirname;
  const { description } = loadToolMetadata(currentDir, 'cancel-condition', '取消條件單');

  server.tool(
    "cancel_condition_order",
    description,
    {
      guid: z.string().describe("條件單 GUID 識別碼"),
    },
    createToolHandler(
      currentDir,
      'cancel-condition',
      async ({ guid }) => {
        if (process.env.ENABLE_ORDER !== "true") {
          throw new Error(
            "條件單功能已停用！(啟用此功能請在環境變數中設定 ENABLE_ORDER 為 true )"
          );
        }

        // Call SDK API
        return await sdk.stock.cancelConditionOrders(account, guid);
      },
      {
        errorMessage: "取消條件單時發生錯誤"
      }
    )
  );
}