import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import unrealizedPnLDetailReference from "./references/unrealized-pnl-detail.json";
import { FubonSDK } from "fubon-neo";
import { Account } from "fubon-neo/trade";

/**
 * 註冊未實現損益查詢工具到 MCP Server
 * @param {Object} server MCP Server 實例
 * @param {Object} sdk FubonSDK 實例
 * @param {Object} account 帳戶實例
 */
export function registerUnrealizedPnLDetailTool(
  server: McpServer,
  sdk: FubonSDK,
  account: Account
) {
  // 未實現損益查詢工具
  server.tool(
    "get_unrealized_pnl_detail",
    "查詢未實現損益資訊",
    {
      // 這裡不需要額外參數，因為已經傳入帳戶資訊
    },
    async () => {
      try {
        // 透過SDK獲取未實現損益資訊
        const data = await sdk.accounting.unrealizedGainsAndLoses(account);

        const response = `API Response\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\`\n\nField Description\n\`\`\`json\n${JSON.stringify(unrealizedPnLDetailReference, null, 2)}\n\`\`\``;

        return {
          content: [{ type: "text", text: response }],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `未實現損益查詢時發生錯誤: ${error || "未知錯誤"}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}