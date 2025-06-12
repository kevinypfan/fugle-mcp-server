import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FubonSDK } from "fubon-neo";
import { Account, MarketType } from "fubon-neo/trade";
import { z } from "zod";
import { loadToolMetadata, createToolHandler } from "../../shared/utils/index.js";
  
/**
 * 註冊刪除委託單工具到 MCP Server
 * @param {Object} server MCP Server 實例
 * @param {Object} sdk FubonSDK 實例
 * @param {Object} account 帳戶實例
 */
export function registerCancelOrderTool(
  server: McpServer,
  sdk: FubonSDK,
  account: Account
) {
  const currentDir = __dirname;
  const { description } = loadToolMetadata(currentDir, 'cancel-order', '刪除委託單');
  
  server.tool(
    "cancel_order",
    description,
    {
      seqNo: z.string().describe("委託單流水序號")
    },
    createToolHandler(
      currentDir,
      'cancel-order',
      async ({ seqNo }) => {
        if (process.env.ENABLE_ORDER !== "true") {
          throw new Error(
            "刪除委託單功能已停用！(啟用此功能請在環境變數中設定 ENABLE_ORDER 為 true )"
          );
        }

        // 先獲取委託單資訊
        const orderResultRes = await sdk.stock.getOrderResults(account);
        if (!orderResultRes.isSuccess) {
          throw new Error(`取得委託單資訊失敗：${orderResultRes.message}`);
        }

        const targetOrder = orderResultRes.data?.find((order) => order.seqNo === seqNo);
        if (!targetOrder) {
          throw new Error(`刪除委託單失敗：找不到委託單流水序號 ${seqNo} 的委託單`);
        }

        // 透過SDK刪除委託單
        return await sdk.stock.cancelOrder(account, targetOrder, false);
      },
      {
        errorMessage: "刪除委託單時發生錯誤"
      }
    )
  );
}