import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Account, MasterlinkSDK } from "masterlink-sdk";
import { z } from "zod";
import skBankBalanceReference from "./references/sk-bank-balance.json";

/**
 * 註冊新光銀行餘額查詢工具到 MCP Server
 * @param {Object} server MCP Server 實例
 * @param {Object} sdk MasterlinkSDK 實例
 * @param {Object} account 帳戶實例
 */
export function registerSkbankBalanceTools(
  server: McpServer,
  sdk: MasterlinkSDK,
  account: Account
) {
  // 新光銀行餘額查詢工具
  server.tool(
    "get_skbank_balance",
    "查詢新光銀行帳戶餘額資訊",
    {
      // 這裡不需要額外參數，因為已經傳入帳戶資訊
    },
    async () => {
      try {
        // 透過SDK獲取新光銀行餘額資訊
        const data = await sdk.accounting.skbankBalance(account);

        const response = `API Response\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\`\n\nField Description\n\`\`\`json\n${JSON.stringify(skBankBalanceReference, null, 2)}\n\`\`\``;

        return {
          content: [{ type: "text", text: response }],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `查詢新光銀行餘額時發生錯誤: ${error || "未知錯誤"}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
