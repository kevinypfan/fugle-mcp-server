import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Account, MasterlinkSDK } from "masterlink-sdk";
import { z } from "zod";

/**
 * 註冊查詢歷史委託相關的工具到 MCP Server
 * @param {Object} server MCP Server 實例
 * @param {Object} sdk MasterlinkSDK 實例
 * @param {Object} accounts 帳戶實例陣列
 */
export function registerOrderHistoryTools(
  server: McpServer,
  sdk: MasterlinkSDK,
  accounts: Account[]
) {
  // 查詢歷史委託工具
  server.tool(
    "get_order_history",
    "查詢歷史委託記錄",
    {
      startDate: z
        .string()
        .describe("查詢開始日期，格式：YYYYMMDD，例如：20240301"),
      endDate: z
        .string()
        .describe("查詢結束日期，格式：YYYYMMDD，例如：20240320"),
      symbol: z
        .string()
        .describe("股票代號，例如：2330（可選，不填則查詢所有股票）")
        .optional(),
    },
    async ({ startDate, endDate, symbol }, extra) => {
      try {
        // 呼叫 SDK 獲取歷史委託記錄
        const orderHistory = await sdk.stock.orderHistory(accounts[0], startDate, endDate);

        // 檢查是否有委託記錄
        if (!orderHistory || orderHistory.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: symbol
                  ? `📝 ${startDate} 至 ${endDate} 期間無 ${symbol} 的委託紀錄`
                  : `📝 ${startDate} 至 ${endDate} 期間無任何委託紀錄`,
              },
            ],
          };
        }

        // 篩選特定股票的委託紀錄
        const filteredOrders = symbol
          ? orderHistory.filter((record) => record.symbol === symbol)
          : orderHistory;

        if (filteredOrders.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: `📝 ${startDate} 至 ${endDate} 期間無 ${symbol} 的委託紀錄`,
              },
            ],
          };
        }

        // 計算各種統計數據
        let totalBuyQty = 0;
        let totalBuyFilledQty = 0;
        let totalSellQty = 0;
        let totalSellFilledQty = 0;
        let successfulOrders = 0;
        let failedOrders = 0;

        filteredOrders.forEach((order) => {
          if (order.buySell === "Buy") {
            totalBuyQty += order.orgQty;
            totalBuyFilledQty += order.filledQty;
          } else {
            totalSellQty += order.orgQty;
            totalSellFilledQty += order.filledQty;
          }

          if (order.errCode === "000000") {
            successfulOrders++;
          } else if (order.errCode !== "000000" && order.errMsg) {
            failedOrders++;
          }
        });

        // 構建回應文本
        let responseText = "";

        if (symbol) {
          // 如果指定了股票代號，顯示詳細委託記錄
          responseText = `📝 **${symbol} 委託紀錄 (${startDate} - ${endDate})**\n\n`;

          responseText += `**委託彙總：**\n`;
          responseText += `- 買入委託：${totalBuyQty.toLocaleString("zh-TW")} 股，已成交 ${totalBuyFilledQty.toLocaleString("zh-TW")} 股\n`;
          responseText += `- 賣出委託：${totalSellQty.toLocaleString("zh-TW")} 股，已成交 ${totalSellFilledQty.toLocaleString("zh-TW")} 股\n`;
          responseText += `- 成功委託：${successfulOrders} 筆\n`;
          responseText += `- 失敗委託：${failedOrders} 筆\n\n`;

          responseText += `**委託明細：**\n\n`;

          filteredOrders.forEach((order, index) => {
            responseText += `${index + 1}. ${order.buySell === "Buy" ? "買入" : "賣出"} ${order.symbol} ${order.orgQty.toLocaleString("zh-TW")} 股，價格 ${order.orderPrice.toFixed(2)} 元\n`;
            responseText += `   委託日期：${formatDateTime(order.orderDate || "", order.orderTime || "")}\n`;
            responseText += `   委託書號：${order.orderNo || "無"}\n`;
            responseText += `   市場/盤別：${getMarketName(order.market || "無")} / ${getMarketTypeName(order.marketType)}\n`;
            responseText += `   價格類型：${getPriceTypeName(order.priceType)}\n`;
            responseText += `   委託條件：${getTimeInForceName(order.timeInForce || "")}\n`;
            responseText += `   已成交：${order.filledQty.toLocaleString("zh-TW")} 股\n`;
            
            if (order.errCode !== "000000" && order.errMsg) {
              responseText += `   狀態：失敗 (${order.errCode})\n`;
              responseText += `   錯誤訊息：${order.errMsg}\n`;
            } else {
              responseText += `   狀態：${order.filledQty === order.orgQty ? "全部成交" : 
                               order.filledQty > 0 ? "部分成交" : 
                               order.celQty > 0 ? "已取消" : "委託中"}\n`;
            }
            
            if (index < filteredOrders.length - 1) responseText += `\n`;
          });
        } else {
          // 否則顯示所有委託的彙總
          responseText = `📝 **委託紀錄彙總 (${startDate} - ${endDate})**\n\n`;

          responseText += `**委託概況：**\n`;
          responseText += `- 買入委託：${totalBuyQty.toLocaleString("zh-TW")} 股，已成交 ${totalBuyFilledQty.toLocaleString("zh-TW")} 股\n`;
          responseText += `- 賣出委託：${totalSellQty.toLocaleString("zh-TW")} 股，已成交 ${totalSellFilledQty.toLocaleString("zh-TW")} 股\n`;
          responseText += `- 成功委託：${successfulOrders} 筆\n`;
          responseText += `- 失敗委託：${failedOrders} 筆\n\n`;

          // 獲取不重複的股票代號列表
          const uniqueSymbols = [...new Set(orderHistory.map((record) => record.symbol))];

          responseText += `**委託股票列表：**\n\n`;

          uniqueSymbols.forEach((stockSymbol) => {
            // 計算該股票的買入和賣出數量
            const stockRecords = orderHistory.filter((record) => record.symbol === stockSymbol);
            const buyQty = stockRecords
              .filter((record) => record.buySell === "Buy")
              .reduce((sum, record) => sum + record.orgQty, 0);
            const sellQty = stockRecords
              .filter((record) => record.buySell === "Sell")
              .reduce((sum, record) => sum + record.orgQty, 0);
            const buyFilledQty = stockRecords
              .filter((record) => record.buySell === "Buy")
              .reduce((sum, record) => sum + record.filledQty, 0);
            const sellFilledQty = stockRecords
              .filter((record) => record.buySell === "Sell")
              .reduce((sum, record) => sum + record.filledQty, 0);

            responseText += `${stockSymbol}：買入 ${buyQty.toLocaleString("zh-TW")} 股(已成交 ${buyFilledQty.toLocaleString("zh-TW")} 股)，賣出 ${sellQty.toLocaleString("zh-TW")} 股(已成交 ${sellFilledQty.toLocaleString("zh-TW")} 股)\n`;
          });

          responseText += `\n您可以輸入特定股票代號查詢詳細委託記錄，例如：查詢 2330 委託歷史`;
        }

        return {
          content: [
            {
              type: "text",
              text: responseText,
            },
          ],
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [
            {
              type: "text",
              text: `❌ 查詢歷史委託記錄失敗：${errorMessage}`,
            },
          ],
        };
      }
    }
  );
}

/**
 * 格式化日期時間
 * @param dateStr 日期字串，格式為 YYYYMMDD
 * @param timeStr 時間字串
 * @returns 格式化後的日期時間字串
 */
function formatDateTime(dateStr: string, timeStr: string): string {
  if (!dateStr) return "未知日期";

  try {
    // 格式化日期 YYYYMMDD -> YYYY/MM/DD
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    const formattedDate = `${year}/${month}/${day}`;

    if (!timeStr || timeStr.length < 6) return formattedDate;

    // 格式化時間
    const hour = timeStr.substring(0, 2);
    const minute = timeStr.substring(2, 4);
    const second = timeStr.substring(4, 6);
    const formattedTime = `${hour}:${minute}:${second}`;

    return `${formattedDate} ${formattedTime}`;
  } catch (error) {
    // 如果解析出錯，返回原始字串
    return `${dateStr} ${timeStr}`;
  }
}

/**
 * 獲取市場名稱
 * @param marketCode 市場代碼
 * @returns 市場名稱
 */
function getMarketName(marketCode: string): string {
  switch (marketCode) {
    case "T": return "上市";
    case "O": return "上櫃";
    case "R": return "興櫃";
    default: return marketCode;
  }
}

/**
 * 獲取市場類型名稱
 * @param marketType 市場類型
 * @returns 市場類型名稱
 */
function getMarketTypeName(marketType: string): string {
  switch (marketType) {
    case "Common": return "整股";
    case "AfterMarket": return "盤後";
    case "Odd": return "盤後零股";
    case "Emg": return "興櫃";
    case "IntradayOdd": return "盤中零股";
    default: return marketType;
  }
}

/**
 * 獲取價格類型名稱
 * @param priceType 價格類型
 * @returns 價格類型名稱
 */
function getPriceTypeName(priceType: string): string {
  switch (priceType) {
    case "Limit": return "限價";
    case "Market": return "市價";
    default: return priceType;
  }
}

/**
 * 獲取委託條件名稱
 * @param timeInForce 委託條件
 * @returns 委託條件名稱
 */
function getTimeInForceName(timeInForce: string): string {
  switch (timeInForce) {
    case "ROD": return "ROD (當日有效)";
    case "IOC": return "IOC (立即成交否則取消)";
    case "FOK": return "FOK (立即全部成交否則取消)";
    default: return timeInForce;
  }
}