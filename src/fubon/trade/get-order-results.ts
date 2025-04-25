import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import getOrderResultsReference from "./references/get-order-results.json";
import { FubonSDK } from "fubon-neo";
import { Account } from "fubon-neo/trade";
  
/**
 * 註冊查詢委託結果工具到 MCP Server
 * @param {Object} server MCP Server 實例
 * @param {Object} sdk FubonSDK 實例
 * @param {Object} account 帳戶實例
 */
export function registerGetOrderResultsTool(
  server: McpServer,
  sdk: FubonSDK,
  account: Account
) {
  server.tool(
    "get_order_results",
    "查詢未成交委託單",
    {
      // 這裡不需要額外參數，根據錯誤信息，getOrderResults 方法可能只接受一個參數
    },
    async () => {
      try {
        // 透過SDK查詢未成交委託單
        const data = await sdk.stock.getOrderResults(account);

        const response = `API Response\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\`\n\nField Description\n\`\`\`json\n${JSON.stringify(getOrderResultsReference, null, 2)}\n\`\`\``;

        return {
          content: [{ type: "text", text: response }],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `查詢未成交委託單時發生錯誤: ${error || "未知錯誤"}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
