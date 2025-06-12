import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FubonSDK } from "fubon-neo";
import { Account } from "fubon-neo/trade";
import { loadToolMetadata, createToolHandler } from "../../shared/utils/index.js";
  
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
  const currentDir = __dirname;
  const { description } = loadToolMetadata(currentDir, 'get-order-results', '查詢未成交委託單');
  
  server.tool(
    "get_order_results",
    description,
    {
      // 這裡不需要額外參數，根據錯誤信息，getOrderResults 方法可能只接受一個參數
    },
    createToolHandler(
      currentDir,
      'get-order-results',
      async () => {
        // 透過SDK查詢未成交委託單
        return await sdk.stock.getOrderResults(account);
      },
      {
        errorMessage: "查詢未成交委託單時發生錯誤"
      }
    )
  );
}