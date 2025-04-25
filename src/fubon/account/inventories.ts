import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import inventoriesReference from "./references/inventories.json";
import { FubonSDK } from "fubon-neo";
import { Account } from "fubon-neo/trade";

/**
 * 註冊庫存查詢工具到 MCP Server
 * @param {Object} server MCP Server 實例
 * @param {Object} sdk FubonSDK 實例
 * @param {Object} account 帳戶實例
 */
export function registerInventoriesTool(
  server: McpServer,
  sdk: FubonSDK,
  account: Account
) {
  // 庫存查詢工具
  server.tool(
    "get_inventories",
    "查詢庫存資訊",
    {
      // 這裡不需要額外參數，因為已經傳入帳戶資訊
    },
    async () => {
      try {
        // 透過SDK獲取庫存資訊
        const data = await sdk.accounting.inventories(account);

        const response = `API Response\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\`\n\nField Description\n\`\`\`json\n${JSON.stringify(inventoriesReference, null, 2)}\n\`\`\``;

        return {
          content: [{ type: "text", text: response }],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `庫存查詢時發生錯誤: ${error || "未知錯誤"}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}