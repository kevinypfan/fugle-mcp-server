import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import querySettlementReference from "./references/query-settlement.json";
import { FubonSDK } from "fubon-neo";
import { Account } from "fubon-neo/trade";
import { z } from "zod";

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
  // 交割款查詢工具
  server.tool(
    "get_settlement",
    "查詢交割款資訊",
    {
      range: z
        .enum(["0d", "3d"])
        .describe("時間區間，有效值為'0d'(當日)或'3d'")
        .default("0d")
    },
    async (args) => {
      try {
        // 透過SDK獲取交割款資訊
        const data = await sdk.accounting.querySettlement(account, args.range);

        const response = `API Response\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\`\n\nField Description\n\`\`\`json\n${JSON.stringify(querySettlementReference, null, 2)}\n\`\`\``;

        return {
          content: [{ type: "text", text: response }],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `交割款查詢時發生錯誤: ${error || "未知錯誤"}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}