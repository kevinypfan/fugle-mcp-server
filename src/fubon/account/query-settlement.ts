import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FubonSDK } from "fubon-neo";
import { Account } from "fubon-neo/trade";
import { z } from "zod";
import { loadToolMetadata, createToolHandler } from "../../shared/utils/index.js";

/**
 * 註冊交割款查詢工具到 MCP Server
 * @param {Object} server MCP Server 實例
 * @param {Object} sdk FubonSDK 實例
 * @param {Object} account 帳戶實例
 */
export function registerQuerySettlementTool(
  server: McpServer,
  sdk: FubonSDK,
  account: Account
) {
  const currentDir = __dirname;
  const { description } = loadToolMetadata(currentDir, 'query-settlement', '查詢交割款資訊');
  
  // 交割款查詢工具
  server.tool(
    "get_settlement",
    description,
    {
      range: z
        .enum(["0d", "3d"])
        .describe("時間區間，有效值為'0d'(當日)或'3d'")
        .default("0d")
    },
    createToolHandler(
      currentDir,
      'query-settlement',
      async (args) => {
        // 透過SDK獲取交割款資訊
        return await sdk.accounting.querySettlement(account, args.range);
      },
      {
        errorMessage: "交割款查詢時發生錯誤"
      }
    )
  );
}