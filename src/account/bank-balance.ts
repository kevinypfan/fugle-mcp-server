import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Account, MasterlinkSDK } from "masterlink-sdk";
import balanceReference from "./references/balance.json";
  
/**
 * 註冊分戶帳銀行餘額查詢工具到 MCP Server
 * @param {Object} server MCP Server 實例
 * @param {Object} sdk MasterlinkSDK 實例
 * @param {Object} account 帳戶實例
 */
export function registerBankBalanceTools(
  server: McpServer,
  sdk: MasterlinkSDK,
  account: Account
) {
  // 分戶帳銀行餘額查詢工具
  server.tool(
    "get_bank_balance",
    "查詢分戶帳銀行餘額資訊",
    {
      // 這裡不需要額外參數，因為已經傳入帳戶資訊
    },
    async () => {
      try {
        // 透過SDK獲取分戶帳銀行餘額資訊
        const data = await sdk.accounting.bankBalance(account);

        const response = `API Response\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\`\n\nField Description\n\`\`\`json\n${JSON.stringify(balanceReference, null, 2)}\n\`\`\``;

        return {
          content: [{ type: "text", text: response }],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `查詢分戶帳銀行餘額時發生錯誤: ${error || "未知錯誤"}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
