import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import modifyQuantityReference from "./references/modify-quantity.json";
import { FubonSDK } from "fubon-neo";
import { Account, MarketType } from "fubon-neo/trade";
import { z } from "zod";
  
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
  server.tool(
    "modify_quantity",
    "修改委託單數量",
    {
      seqNo: z.string().describe("委託單流水序號"),
      quantity: z.number().describe("新委託數量")
    },
    async ({ seqNo, quantity }) => {
      try {
        if (process.env.ENABLE_ORDER !== "true") {
          throw new Error(
            "修改委託單數量功能已停用！(啟用此功能請在環境變數中設定 ENABLE_ORDER 為 true )"
          );
        }

        // 先獲取委託單資訊
        const orderResultRes = await sdk.stock.getOrderResults(account);
        if (!orderResultRes.isSuccess) {
          return {
            content: [
              {
                type: "text",
                text: `取得委託單資訊失敗：${orderResultRes.message}`,
              },
            ],
            isError: true,
          };
        }

        const targetOrder = orderResultRes.data?.find((order) => order.seqNo === seqNo);

        if (!targetOrder) {
          return {
            content: [
              {
                type: "text",
                text: `修改委託單數量失敗：找不到委託單流水序號 ${seqNo} 的委託單`
              },
            ],
            isError: true,
          };
        }

        const modifyQtyObj = sdk.stock.makeModifyQuantityObj(targetOrder, quantity);

        // 透過SDK修改委託單數量
        const data = await sdk.stock.modifyQuantity(account, modifyQtyObj, false);

        const response = `API Response\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\`\n\nField Description\n\`\`\`json\n${JSON.stringify(modifyQuantityReference, null, 2)}\n\`\`\``;

        return {
          content: [{ type: "text", text: response }],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `修改委託單數量時發生錯誤: ${error || "未知錯誤"}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}