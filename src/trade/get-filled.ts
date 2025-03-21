import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Account, MasterlinkSDK } from "masterlink-sdk";
import { z } from "zod";

/**
 * 註冊查詢成交相關的工具到 MCP Server
 * @param {Object} server MCP Server 實例
 * @param {Object} sdk MasterlinkSDK 實例
 * @param {Object} accounts 帳戶實例陣列
 */
export function registerFilledQueryTools(
  server: McpServer,
  sdk: MasterlinkSDK,
  accounts: Account[]
) {
  // 查詢今日成交彙總工具
  server.tool(
    "get_filled",
    "查詢今日成交彙總",
    {
      symbol: z
        .string()
        .describe("股票代號，例如：2330（可選，不填則查詢所有股票）")
        .optional(),
    },
    async ({ symbol }, extra) => {
      try {
        // 呼叫 SDK 獲取成交紀錄
        const filledData = await sdk.stock.getFilled(accounts[0], symbol);

        // 檢查是否有成交紀錄
        if (!filledData || filledData.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: symbol
                  ? `📊 今日無 ${symbol} 的成交紀錄`
                  : `📊 今日無任何成交紀錄`,
              },
            ],
          };
        }

        // 構建回應文本
        let responseText = "";
        let totalBuyQty = 0;
        let totalBuyAmount = 0;
        let totalSellQty = 0;
        let totalSellAmount = 0;

        // 篩選特定股票的成交紀錄
        const filteredData = symbol
          ? filledData.filter((record) => record.symbol === symbol)
          : filledData;

        if (filteredData.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: `📊 今日無 ${symbol} 的成交紀錄`,
              },
            ],
          };
        }

        // 計算總數量和金額
        filteredData.forEach((record) => {
          if (record.buySell === "Buy") {
            totalBuyQty += record.filledQty;
            totalBuyAmount += record.payment;
          } else {
            totalSellQty += record.filledQty;
            totalSellAmount += record.payment;
          }
        });

        const totalAmount = totalSellAmount - totalBuyAmount;

        // 如果指定了股票代號，則顯示詳細成交記錄
        if (symbol) {
          responseText = `📊 **${symbol} 今日成交明細**\n\n`;

          // 彙總資訊
          responseText += `**成交彙總：**\n`;
          responseText += `- 買入：${totalBuyQty.toLocaleString(
            "zh-TW"
          )} 股，共 ${formatCurrency(totalBuyAmount)} 元\n`;
          responseText += `- 賣出：${totalSellQty.toLocaleString(
            "zh-TW"
          )} 股，共 ${formatCurrency(totalSellAmount)} 元\n\n`;

          // 詳細成交記錄
          responseText += `**成交明細：**\n\n`;

          filteredData.forEach((record, index) => {
            responseText += `${index + 1}. ${
              record.buySell === "Buy" ? "買入" : "賣出"
            } ${record.filledQty.toLocaleString(
              "zh-TW"
            )} 股，價格 ${record.filledPrice.toFixed(2)} 元\n`;
            responseText += `   金額：${formatCurrency(record.payment)} 元\n`;
            responseText += `   時間：${formatDateTime(
              record.filledDate || "",
              record.filledTime || ""
            )}\n`;
            responseText += `   委託書號：${record.orderNo}\n`;
            if (index < filteredData.length - 1) responseText += `\n`;
          });
        }
        // 否則顯示所有成交的彙總
        else {
          responseText = `📊 **今日成交彙總**\n\n`;

          responseText += `**交易概況：**\n`;
          responseText += `- 買入：${totalBuyQty.toLocaleString(
            "zh-TW"
          )} 股，共 ${formatCurrency(totalBuyAmount)} 元\n`;
          responseText += `- 賣出：${totalSellQty.toLocaleString(
            "zh-TW"
          )} 股，共 ${formatCurrency(totalSellAmount)} 元\n`;
          responseText += `- 淨額：${formatCurrency(
            Math.abs(totalAmount)
          )} 元 (${totalAmount >= 0 ? "淨賣出" : "淨買入"})\n\n`;

          // 成交股票列表
          responseText += `**今日成交股票：**\n\n`;

          // 獲取不重複的股票代號列表
          const uniqueSymbols = [
            ...new Set(filledData.map((record) => record.symbol)),
          ];

          uniqueSymbols.forEach((stockSymbol) => {
            // 計算該股票的買入和賣出數量
            const stockRecords = filledData.filter(
              (record) => record.symbol === stockSymbol
            );
            const buyQty = stockRecords
              .filter((record) => record.buySell === "Buy")
              .reduce((sum, record) => sum + record.filledQty, 0);
            const sellQty = stockRecords
              .filter((record) => record.buySell === "Sell")
              .reduce((sum, record) => sum + record.filledQty, 0);

            responseText += `${stockSymbol}：買入 ${buyQty.toLocaleString(
              "zh-TW"
            )} 股，賣出 ${sellQty.toLocaleString("zh-TW")} 股\n`;
          });

          responseText += `\n您可以輸入特定股票代號查詢詳細成交記錄，例如：查詢今日2330成交`;
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
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        return {
          content: [
            {
              type: "text",
              text: `❌ 查詢今日成交記錄失敗：${errorMessage}`,
            },
          ],
        };
      }
    }
  );
}

/**
 * 格式化貨幣金額（添加千位分隔符）
 * @param amount 金額
 * @returns 格式化後的金額字串
 */
function formatCurrency(amount: number): string {
  return amount.toLocaleString("zh-TW");
}

/**
 * 格式化日期時間
 * @param dateStr 日期字串，格式為 YYYYMMDD
 * @param timeStr 時間字串，格式為 HHMMSSXXX
 * @returns 格式化後的日期時間字串
 */
function formatDateTime(dateStr: string, timeStr: string): string {
  if (!dateStr || !timeStr) return `${dateStr} ${timeStr}`;

  try {
    // 格式化日期 YYYYMMDD -> YYYY/MM/DD
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    const formattedDate = `${year}/${month}/${day}`;

    // 格式化時間 HHMMSSXXX -> HH:MM:SS
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
