import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Account, MasterlinkSDK } from "masterlink-sdk";
import { z } from "zod";
import { PriceType } from "masterlink-sdk";

/**
 * 註冊修改委託單相關的工具到 MCP Server
 * @param {Object} server MCP Server 實例
 * @param {Object} sdk MasterlinkSDK 實例
 * @param {Object} accounts 帳戶實例陣列
 */
export function registerModifyOrderTools(
  server: McpServer,
  sdk: MasterlinkSDK,
  accounts: Account[]
) {
  // 修改委託價格工具
  server.tool(
    "modify_price",
    "修改委託價格",
    {
      orderNo: z
        .string()
        .describe("委託書號，例如：f0002"),
      price: z
        .string()
        .describe("修改後的委託價格，例如：14.5（市價、漲停、跌停等特殊價格類型時可為空）"),
      priceType: z
        .enum(["Limit", "Market", "LimitUp", "LimitDown", "Reference"])
        .describe("價格類型：Limit 限價、Market 市價、LimitUp 漲停、LimitDown 跌停、Reference 平盤價")
    },
    async ({
      orderNo,
      price,
      priceType
    }) => {
      try {
        // 先獲取委託單資訊
        const orderResults = await sdk.stock.getOrderResults(accounts[0]);
        const targetOrder = orderResults.find(order => order.orderNo === orderNo);
        
        if (!targetOrder) {
          return {
            content: [
              {
                type: "text",
                text: `❌ 修改委託價格失敗：找不到委託書號 ${orderNo} 的委託單`,
              },
            ],
          };
        }
        
        if (!targetOrder.canCancel) {
          return {
            content: [
              {
                type: "text",
                text: `❌ 修改委託價格失敗：委託書號 ${orderNo} 的委託單不可修改`,
              },
            ],
          };
        }

        // 處理 enum 轉換
        let priceTypeValue: PriceType;
        
        switch (priceType) {
          case "Limit": priceTypeValue = PriceType.Limit; break;
          case "Market": priceTypeValue = PriceType.Market; break;
          case "LimitUp": priceTypeValue = PriceType.LimitUp; break;
          case "LimitDown": priceTypeValue = PriceType.LimitDown; break;
          case "Reference": priceTypeValue = PriceType.Reference; break;
          default: throw new Error(`不支援的價格類型: ${priceType}`);
        }
        
        // 根據文檔特別說明處理價格
        let finalPrice = price;
        if (priceType !== "Limit") {
          finalPrice = "0";
        }
        
        // 調用 SDK 修改價格
        const result = await sdk.stock.modifyPrice(
          accounts[0],
          targetOrder,
          finalPrice,
          priceTypeValue
        );

        // 格式化輸出訊息
        const originalPrice = targetOrder.orderPrice.toFixed(2);
        const symbolName = targetOrder.symbol;
        const buySell = targetOrder.buySell === "Buy" ? "買入" : "賣出";
        const quantity = targetOrder.orgQty.toLocaleString('zh-TW');
        const priceTypeText = getPriceTypeText(priceType);
        const newPrice = priceType === "Limit" ? `${price}元` : priceTypeText;

        return {
          content: [
            {
              type: "text",
              text: `✅ 委託單價格修改成功：
委託書號：${orderNo}
股票代號：${symbolName}
交易方向：${buySell}
委託數量：${quantity} 股
原委託價格：${originalPrice} 元
修改後價格：${newPrice}
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
              text: `❌ 修改委託價格失敗：${errorMessage}`,
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

/**
 * 獲取價格類型的中文描述
 * @param priceType 價格類型
 * @returns 價格類型描述
 */
function getPriceTypeText(priceType: string): string {
  switch (priceType) {
    case "Limit": return "限價";
    case "Market": return "市價";
    case "LimitUp": return "漲停價";
    case "LimitDown": return "跌停價";
    case "Reference": return "平盤價";
    default: return priceType;
  }
}