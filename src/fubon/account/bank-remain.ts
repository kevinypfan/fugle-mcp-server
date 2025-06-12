import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FubonSDK } from "fubon-neo";
import { Account } from "fubon-neo/trade";
import { loadToolMetadata, createToolHandler } from "../../shared/utils/index.js";
  
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
  const currentDir = __dirname;
  const { description } = loadToolMetadata(currentDir, 'bank-remain', '查詢銀行餘額資訊');
  
  // 分戶帳銀行餘額查詢工具
  server.tool(
    "get_bank_remain",
    description,
    {
      // 這裡不需要額外參數，因為已經傳入帳戶資訊
    },
    createToolHandler(
      currentDir,
      'bank-remain',
      async () => {
        // 透過SDK獲取分戶帳銀行餘額資訊
        return await sdk.accounting.bankRemain(account);
      },
      {
        errorMessage: "銀行餘額查詢時發生錯誤"
      }
    )
  );
}
