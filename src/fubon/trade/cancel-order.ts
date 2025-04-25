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
      orderNo: z.string().describe("委託書號"),
      stockNo: z.string().describe("股票代號"),
      marketType: z.enum(["Common", "Fixing", "IntradayOdd", "Odd", "Emg", "EmgOdd"])
        .describe("盤別種類：Common = 整股, Fixing = 定盤, IntradayOdd = 盤中零股, Odd = 盤後零股, Emg = 興櫃, EmgOdd = 興櫃零股")
    },
    async ({ orderNo, stockNo, marketType }) => {
      try {
        // 透過SDK刪除委託單
        // 注意：這裡根據 OrderResult 物件的類型定義補充了必要的欄位
        const data = await sdk.stock.cancelOrder(account, {
          orderNo,
          stockNo,
          marketType: marketType as MarketType, // 使用 type assertion
          seqNo: "",  // 委託單流水序號
          date: new Date().toLocaleDateString(),
          branchNo: account.branchNo || "",
          account: account.account || "",
          isPreOrder: false,
          lastTime: new Date().toLocaleTimeString(),
          status: 10  // 假設狀態為委託成功
        }, false);

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
