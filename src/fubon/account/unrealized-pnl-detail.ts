import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FubonSDK } from "fubon-neo";
import { Account } from "fubon-neo/trade";
import { loadToolMetadata, createToolHandler } from "../../shared/utils/index.js";

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
  const currentDir = __dirname;
  const { description } = loadToolMetadata(currentDir, 'unrealized-pnl-detail', '查詢未實現損益資訊');
  
  // 未實現損益查詢工具
  server.tool(
    "get_unrealized_pnl_detail",
    description,
    {
      // 這裡不需要額外參數，因為已經傳入帳戶資訊
    },
    createToolHandler(
      currentDir,
      'unrealized-pnl-detail',
      async () => {
        // 透過SDK獲取未實現損益資訊
        return await sdk.accounting.unrealizedGainsAndLoses(account);
      },
      {
        errorMessage: "未實現損益查詢時發生錯誤"
      }
    )
  );
}