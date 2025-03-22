import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Account, MasterlinkSDK } from "masterlink-sdk";
import { z } from "zod";

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
                text: `❌ 修改委託單數量失敗：找不到委託書號 ${orderNo} 的委託單`,
              },
            ],
          };
        }
        
        if (!targetOrder.canCancel) {
          return {
            content: [
              {
                type: "text",
                text: `❌ 修改委託單數量失敗：委託書號 ${orderNo} 的委託單不可修改`,
              },
            ],
          };
        }

        // 計算修改後剩餘數量
        const remainingQty = targetOrder.orgQty - targetOrder.filledQty - targetOrder.celQty;
        
        // 檢查刪減數量是否合理
        if (volume > remainingQty) {
          return {
            content: [
              {
                type: "text",
                text: `❌ 修改委託單數量失敗：欲刪減股數 ${volume} 大於可刪減股數 ${remainingQty}`,
              },
            ],
          };
        }
        
        // 判斷是刪單還是減量
        const isCancel = volume === 0 || volume === remainingQty;
        
        // 調用 SDK 修改數量
        const result = await sdk.stock.modifyVolume(
          accounts[0],
          targetOrder,
          volume
        );

        // 格式化輸出訊息
        const symbolName = targetOrder.symbol;
        const buySell = targetOrder.buySell === "Buy" ? "買入" : "賣出";
        const price = targetOrder.orderPrice.toFixed(2);
        const originalQty = targetOrder.orgQty.toLocaleString('zh-TW');
        const newQty = (remainingQty - volume).toLocaleString('zh-TW');

        return {
          content: [
            {
              type: "text",
              text: isCancel 
                ? `✅ 委託單取消成功：
委託書號：${orderNo}
股票代號：${symbolName}
交易方向：${buySell}
委託價格：${price} 元
委託數量：${originalQty} 股
取消時間：${formatOrderTime(result.orderTime)}`
                : `✅ 委託單數量修改成功：
委託書號：${orderNo}
股票代號：${symbolName}
交易方向：${buySell}
委託價格：${price} 元
原委託數量：${originalQty} 股
刪減數量：${volume.toLocaleString('zh-TW')} 股
修改後數量：${newQty} 股
修改時間：${formatOrderTime(result.orderTime)}`,
            },
          ],
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [
            {
              type: "text",
              text: `❌ 修改委託單數量失敗：${errorMessage}`,
            },
          ],
        };
      }
    }
  );
}

/**
 * 格式化委託時間（從毫秒格式轉為可讀格式）
 * @param timeStr 委託時間字串
 * @returns 格式化後的時間字串
 */
function formatOrderTime(timeStr: string): string {
  if (!timeStr || timeStr.length < 9) return timeStr;
  
  // 假設格式為 HHMMSSXXX，取出時分秒部分
  const hour = timeStr.substring(0, 2);
  const minute = timeStr.substring(2, 4);
  const second = timeStr.substring(4, 6);
  
  return `${hour}:${minute}:${second}`;
}