import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Account, MasterlinkSDK } from "masterlink-sdk";
import { z } from "zod";
import modifyQuantityReference from "./references/modify-quantity.json";

/**
 * 註冊修改委託單數量相關的工具到 MCP Server
 * @param {Object} server MCP Server 實例
 * @param {Object} sdk MasterlinkSDK 實例
 * @param {Object} accounts 帳戶實例陣列
 */
export function registerModifyVolumeTools(
  server: McpServer,
  sdk: MasterlinkSDK,
  accounts: Account[]
) {
  // 修改委託單數量工具
  server.tool(
    "modify_volume",
    "修改委託單數量",
    {
      orderNo: z
        .string()
        .describe("委託書號，例如：f0002"),
      volume: z
        .number()
        .int()
        .min(0)
        .describe("欲刪減的股數（設為0表示刪單）"),
    },
    async ({
      orderNo,
      volume
    }) => {
      try {
        if (process.env.ENABLE_ORDER !== "true") {
          throw new Error("修改委託單數量功能已停用！(啟用此功能請在環境變數中設定 ENABLE_ORDER 為 true )");
        }
        // 先獲取委託單資訊
        const orderResults = await sdk.stock.getOrderResults(accounts[0]);
        const targetOrder = orderResults.find(order => order.orderNo === orderNo);
        
        if (!targetOrder) {
          return {
            content: [
              {
                type: "text",
                text: `修改委託單數量失敗：找不到委託書號 ${orderNo} 的委託單`,
              },
            ],
            isError: true,
          };
        }

        // 檢查委託單狀態
        if (!targetOrder.canCancel) {
          return {
            content: [
              {
                type: "text",
                text: `修改委託單數量失敗：委託單不可修改`,
              },
            ],
            isError: true,
          };
        }

        // 修改委託數量
        const data = await sdk.stock.modifyVolume(accounts[0], targetOrder, volume);

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