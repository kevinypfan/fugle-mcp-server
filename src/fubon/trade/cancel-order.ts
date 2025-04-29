import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import cancelOrderReference from "./references/cancel-order.json";
import { FubonSDK } from "fubon-neo";
import { Account, MarketType } from "fubon-neo/trade";
import { z } from "zod";
  
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
  server.tool(
    "cancel_order",
    "刪除委託單",
    {
      seqNo: z.string().describe("委託單流水序號")
    },
    async ({ seqNo }) => {
      try {
        if (process.env.ENABLE_ORDER !== "true") {
          throw new Error(
            "刪除委託單功能已停用！(啟用此功能請在環境變數中設定 ENABLE_ORDER 為 true )"
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
                text: `刪除委託單失敗：找不到委託單流水序號 ${seqNo} 的委託單`
              },
            ],
            isError: true,
          };
        }

        // 透過SDK刪除委託單
        const data = await sdk.stock.cancelOrder(account, targetOrder, false);

        const response = `API Response\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\`\n\nField Description\n\`\`\`json\n${JSON.stringify(cancelOrderReference, null, 2)}\n\`\`\``;

        return {
          content: [{ type: "text", text: response }],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `刪除委託單時發生錯誤: ${error || "未知錯誤"}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}