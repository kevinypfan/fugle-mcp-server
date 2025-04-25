import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import bankRemainReference from "./references/bank-remain.json";
import { FubonSDK } from "fubon-neo";
import { Account } from "fubon-neo/trade";
  
/**
 * 註冊銀行餘額查詢工具到 MCP Server
 * @param {Object} server MCP Server 實例
 * @param {Object} sdk FubonSDK 實例
 * @param {Object} account 帳戶實例
 */
export function registerBankBalanceTool(
  server: McpServer,
  sdk: FubonSDK,
  account: Account
) {
  // 分戶帳銀行餘額查詢工具
  server.tool(
    "get_bank_remain",
    "查詢銀行餘額資訊",
    {
      // 這裡不需要額外參數，因為已經傳入帳戶資訊
    },
    async () => {
      try {
        // 透過SDK獲取分戶帳銀行餘額資訊
        const data = await sdk.accounting.bankRemain(account);

        const response = `API Response\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\`\n\nField Description\n\`\`\`json\n${JSON.stringify(bankRemainReference, null, 2)}\n\`\`\``;

        return {
          content: [{ type: "text", text: response }],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `銀行餘額查詢時發生錯誤: ${error || "未知錯誤"}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
