import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FubonSDK } from "fubon-neo";
import { Account, MarketType } from "fubon-neo/trade";
import { z } from "zod";
import { loadToolMetadata, createToolHandler } from "../../shared/utils/index.js";
  
/**
 * 註冊改量工具到 MCP Server
 * @param {Object} server MCP Server 實例
 * @param {Object} sdk FubonSDK 實例
 * @param {Object} account 帳戶實例
 */
export function registerModifyQuantityTool(
  server: McpServer,
  sdk: FubonSDK,
  account: Account
) {
  const currentDir = __dirname;
  const { description } = loadToolMetadata(currentDir, 'modify-quantity', '修改委託單數量');
  
  server.tool(
    "modify_quantity",
    description,
    {
      seqNo: z.string().describe("委託單流水序號"),
      quantity: z.number().describe("新委託數量")
    },
    createToolHandler(
      currentDir,
      'modify-quantity',
      async ({ seqNo, quantity }) => {
        if (process.env.ENABLE_ORDER !== "true") {
          throw new Error(
            "修改委託單數量功能已停用！(啟用此功能請在環境變數中設定 ENABLE_ORDER 為 true )"
          );
        }

        // 先獲取委託單資訊
        const orderResultRes = await sdk.stock.getOrderResults(account);
        if (!orderResultRes.isSuccess) {
          throw new Error(`取得委託單資訊失敗：${orderResultRes.message}`);
        }

        const targetOrder = orderResultRes.data?.find((order) => order.seqNo === seqNo);

        if (!targetOrder) {
          throw new Error(`修改委託單數量失敗：找不到委託單流水序號 ${seqNo} 的委託單`);
        }

        const modifyQtyObj = sdk.stock.makeModifyQuantityObj(targetOrder, quantity);

        // 透過SDK修改委託單數量
        return await sdk.stock.modifyQuantity(account, modifyQtyObj, false);
      },
      {
        errorMessage: "修改委託單數量時發生錯誤"
      }
    )
  );
}