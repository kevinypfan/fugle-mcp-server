import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FubonSDK } from "fubon-neo";
import { Account } from "fubon-neo/trade";
import { loadToolMetadata, createToolHandler } from "../../shared/utils/index.js";

/**
 * 註冊維持率查詢工具到 MCP Server
 * @param {Object} server MCP Server 實例
 * @param {Object} sdk FubonSDK 實例
 * @param {Object} account 帳戶實例
 */
export function registerMaintenanceTool(
  server: McpServer,
  sdk: FubonSDK,
  account: Account
) {
  const currentDir = __dirname;
  const { description } = loadToolMetadata(currentDir, 'maintenance', '查詢維持率資訊');
  
  // 維持率查詢工具
  server.tool(
    "get_maintenance",
    description,
    {
      // 這裡不需要額外參數，因為已經傳入帳戶資訊
    },
    createToolHandler(
      currentDir,
      'maintenance',
      async () => {
        // 透過SDK獲取維持率資訊
        return await sdk.accounting.maintenance(account);
      },
      {
        errorMessage: "維持率查詢時發生錯誤"
      }
    )
  );
}