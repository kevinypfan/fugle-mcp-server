import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Account, MasterlinkSDK } from "masterlink-sdk";
import { z } from "zod";

/**
 * 註冊查詢警示股票相關的工具到 MCP Server
 * @param {Object} server MCP Server 實例
 * @param {Object} sdk MasterlinkSDK 實例
 * @param {Object} accounts 帳戶實例陣列
 */
export function registerAttentionStockTools(
  server: McpServer,
  sdk: MasterlinkSDK,
  accounts: Account[]
) {
  // 查詢警示股票工具
  server.tool(
    "get_attention_stock",
    "查詢警示股票",
    {
      symbol: z
        .string()
        .describe("股票代號，例如：2330（可選，不填則查詢所有警示股票）")
        .optional(),
    },
    async ({ symbol }, extra) => {
      try {
        // 呼叫 SDK 獲取警示股票資訊
        const alertStockData = await sdk.stock.queryAttentionStock(accounts[0], symbol);

        // 檢查是否有查詢結果
        if (!alertStockData || (Array.isArray(alertStockData) && alertStockData.length === 0)) {
          return {
            content: [
              {
                type: "text",
                text: symbol
                  ? `📢 查無 ${symbol} 的警示股票資訊`
                  : "📢 目前沒有警示股票",
              },
            ],
          };
        }

        // 構建回應文本
        let responseText = "";

        // 處理單一股票查詢結果
        if (!Array.isArray(alertStockData) || symbol) {
          const stockData = Array.isArray(alertStockData) ? alertStockData[0] : alertStockData;
          
          responseText = `⚠️ **${stockData.stockName || stockData.symbol} (${stockData.symbol}) 警示股票資訊**\n\n`;
          
          // 警示期間
          responseText += `**警示期間：** ${formatDate(stockData.alertStartDate)} ~ ${formatDate(stockData.alertEndDate)}\n`;
          
          // 警示處理模式
          responseText += `**警示狀態：** ${getAlertHandlingModeText(stockData.alertHandlingMode)}\n`;
          
          // 價格資訊
          responseText += `**價格區間：** ${stockData.lowerLimitPrice} (跌停) ~ ${stockData.upperLimitPrice} (漲停)\n`;
          responseText += `**收盤價：** ${stockData.closingPrice}\n`;
          
          // 其他交易限制
          responseText += `**當沖狀態：** ${stockData.dayTradingAndAccount98Status || "未提供"}\n`;
          responseText += `**平盤下券賣：** ${stockData.shortSellingAtParAllowed || (stockData.shortSellingAtParMark === "1" ? "可以" : "不可以")}\n`;
          
          // 風險提示
          if (stockData.messageDescription) {
            responseText += `\n**⚠️ 注意事項：** ${stockData.messageDescription}\n`;
          }
        } 
        // 處理所有警示股票列表
        else {
          responseText = `⚠️ **警示股票列表**\n\n`;
          
          // 計算警示股票數量
          responseText += `目前共有 ${alertStockData.length} 檔警示股票：\n\n`;
          
          // 分類警示股票
          const severeStocks = alertStockData.filter(stock => stock.alertHandlingMode === 1 || stock.alertHandlingMode === 2);
          const normalAlertStocks = alertStockData.filter(stock => stock.alertHandlingMode !== 1 && stock.alertHandlingMode !== 2);
          
          // 顯示處置/再處置股票
          if (severeStocks.length > 0) {
            responseText += `**處置/再處置股票：**\n`;
            severeStocks.forEach(stock => {
              responseText += `- ${stock.stockName || stock.symbol} (${stock.symbol})：${getAlertHandlingModeText(stock.alertHandlingMode)}，`;
              responseText += `警示至 ${formatDate(stock.alertEndDate)}\n`;
            });
            responseText += `\n`;
          }
          
          // 顯示一般警示股票
          if (normalAlertStocks.length > 0) {
            responseText += `**一般警示股票：**\n`;
            normalAlertStocks.forEach(stock => {
              responseText += `- ${stock.stockName || stock.symbol} (${stock.symbol})：警示至 ${formatDate(stock.alertEndDate)}\n`;
            });
          }
          
          // 查詢提示
          responseText += `\n您可以輸入特定股票代號查詢詳細警示資訊，例如：查詢警示股票 2330`;
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
              text: `❌ 查詢警示股票失敗：${errorMessage}`,
            },
          ],
        };
      }
    }
  );
}

/**
 * 格式化日期
 * @param dateStr 日期字串，格式為 YYYYMMDD
 * @returns 格式化後的日期字串 YYYY/MM/DD
 */
function formatDate(dateStr?: string): string {
  if (!dateStr || dateStr.length !== 8) {
    return "未提供";
  }
  
  const year = dateStr.substring(0, 4);
  const month = dateStr.substring(4, 6);
  const day = dateStr.substring(6, 8);
  
  return `${year}/${month}/${day}`;
}

/**
 * 獲取警示處理模式的文字說明
 * @param mode 警示處理模式代碼
 * @returns 警示處理模式的文字說明
 */
function getAlertHandlingModeText(mode: number): string {
  switch (mode) {
    case 1:
      return "受處置";
    case 2:
      return "再處置";
    default:
      return "一般警示";
  }
}

/**
 * 獲取市場類型的文字說明
 * @param marketType 市場類型代碼
 * @returns 市場類型的文字說明
 */
function getMarketTypeText(marketType: number): string {
  switch (marketType) {
    case 0:
      return "上市";
    case 1:
      return "上櫃";
    case 3:
      return "興櫃";
    default:
      return "未知";
  }
}