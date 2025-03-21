import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Account, MasterlinkSDK } from "masterlink-sdk";
import { z } from "zod";

/**
 * 註冊查詢歷史成交明細相關的工具到 MCP Server
 * @param {Object} server MCP Server 實例
 * @param {Object} sdk MasterlinkSDK 實例
 * @param {Object} accounts 帳戶實例陣列
 */
export function registerFilledHistoryDetailTools(
  server: McpServer,
  sdk: MasterlinkSDK,
  accounts: Account[]
) {
  // 查詢歷史成交明細工具
  server.tool(
    "filled_history_detail",
    "查詢歷史成交明細",
    {
      startDate: z
        .string()
        .describe("查詢開始日期 (YYYYMMDD 格式)"),
      endDate: z
        .string()
        .describe("查詢結束日期 (YYYYMMDD 格式)"),
    },
    async ({ startDate, endDate }, extra) => {
      try {
        // 呼叫 SDK 獲取歷史成交明細資訊
        const filledHistoryDetailData = await sdk.stock.filledDetailHistory(accounts[0], startDate, endDate);

        // 檢查是否有查詢結果
        if (!filledHistoryDetailData || (Array.isArray(filledHistoryDetailData) && filledHistoryDetailData.length === 0)) {
          return {
            content: [
              {
                type: "text",
                text: `📢 查詢期間 ${formatDate(startDate)} 至 ${formatDate(endDate)} 沒有任何成交明細紀錄`,
              },
            ],
          };
        }

        // 構建回應文本
        let responseText = `📊 **歷史成交明細紀錄** (${formatDate(startDate)} ~ ${formatDate(endDate)})\n\n`;
        
        // 轉換成交明細紀錄為數組
        const filledDetailRecords = Array.isArray(filledHistoryDetailData) ? filledHistoryDetailData : [filledHistoryDetailData];
        
        // 統計總數量
        responseText += `共有 ${filledDetailRecords.length} 筆成交明細紀錄\n\n`;
        
        // 按日期分組成交明細紀錄
        const groupedByDate = groupFilledDetailRecordsByDate(filledDetailRecords);
        
        // 遍歷分組顯示成交明細紀錄
        Object.keys(groupedByDate).sort().reverse().forEach(date => {
          const records = groupedByDate[date];
          responseText += `### ${formatDate(date)} (${records.length}筆)\n\n`;
          
          // 建立表格標題
          responseText += `| 時間 | 股票代號 | 買賣方向 | 成交價格 | 成交股數 | 成交金額 | 委託書號 | 盤別 | 市場 |\n`;
          responseText += `|------|----------|----------|----------|----------|----------|----------|------|------|\n`;
          
          // 排序當日紀錄（依時間遞減）
          records.sort((a, b) => b.filledTime.localeCompare(a.filledTime));
          
          // 添加成交明細紀錄到表格
          records.forEach(record => {
            responseText += 
              `| ${formatTime(record.filledTime)} | ${record.symbol} | ${getBuySellText(record.buySell)} | ${record.filledPrice} | ${record.filledQty.toLocaleString()} | ${record.payment.toLocaleString()} | ${record.orderNo} | ${getMarketTypeText(record.marketType)} | ${getMarketText(record.market)} |\n`;
          });
          
          responseText += `\n`;
        });

        // 添加統計信息
        const stats = calculateStatistics(filledDetailRecords);
        responseText += `### 統計資訊\n\n`;
        responseText += `- 買入總金額：${stats.totalBuyAmount.toLocaleString()} 元\n`;
        responseText += `- 賣出總金額：${stats.totalSellAmount.toLocaleString()} 元\n`;
        responseText += `- 買入股數：${stats.totalBuyQty.toLocaleString()} 股\n`;
        responseText += `- 賣出股數：${stats.totalSellQty.toLocaleString()} 股\n`;
        
        if (stats.totalBuyQty > 0) {
          responseText += `- 買入均價：${(stats.totalBuyAmount / stats.totalBuyQty).toFixed(2)} 元\n`;
        }
        
        if (stats.totalSellQty > 0) {
          responseText += `- 賣出均價：${(stats.totalSellAmount / stats.totalSellQty).toFixed(2)} 元\n`;
        }

        // 按市場類型統計
        responseText += `\n### 市場類型統計\n\n`;
        Object.entries(stats.marketTypeStats).forEach(([marketType, data]) => {
          responseText += `- ${getMarketTypeText(marketType)}：${data.count} 筆，總金額 ${data.totalAmount.toLocaleString()} 元\n`;
        });

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
              text: `❌ 查詢歷史成交明細失敗：${errorMessage}`,
            },
          ],
        };
      }
    }
  );
}

/**
 * 格式化日期字串
 * @param dateStr 日期字串，格式為 YYYYMMDD
 * @returns 格式化後的日期字串 YYYY/MM/DD
 */
function formatDate(dateStr: string): string {
  if (!dateStr || dateStr.length !== 8) {
    return dateStr;
  }
  
  const year = dateStr.substring(0, 4);
  const month = dateStr.substring(4, 6);
  const day = dateStr.substring(6, 8);
  
  return `${year}/${month}/${day}`;
}

/**
 * 格式化時間字串
 * @param timeStr 時間字串，格式為 HHMMSS 或 HHMMSSNNN
 * @returns 格式化後的時間字串 HH:MM:SS
 */
function formatTime(timeStr: string): string {
  if (!timeStr || timeStr.length < 6) {
    return timeStr;
  }
  
  const hour = timeStr.substring(0, 2);
  const minute = timeStr.substring(2, 4);
  const second = timeStr.substring(4, 6);
  
  return `${hour}:${minute}:${second}`;
}

/**
 * 獲取買賣方向的文字說明
 * @param buySell 買賣方向代碼
 * @returns 買賣方向的文字說明
 */
function getBuySellText(buySell: string): string {
  switch (buySell.toUpperCase()) {
    case "B":
    case "BUY":
      return "買入";
    case "S":
    case "SELL":
      return "賣出";
    default:
      return buySell;
  }
}

/**
 * 獲取市場類型的文字說明
 * @param marketType 市場類型代碼
 * @returns 市場類型的文字說明
 */
function getMarketTypeText(marketType: string): string {
  switch (marketType) {
    case "Common":
      return "整股";
    case "AfterMarket":
      return "盤後";
    case "Odd":
      return "盤後零股";
    case "Emg":
      return "興櫃";
    case "IntradayOdd":
      return "盤中零股";
    default:
      return marketType;
  }
}

/**
 * 獲取市場的文字說明
 * @param market 市場代碼
 * @returns 市場的文字說明
 */
function getMarketText(market: string): string {
  switch (market) {
    case "T":
      return "上市";
    case "O":
      return "上櫃";
    case "R":
      return "興櫃";
    default:
      return market;
  }
}

/**
 * 按日期分組成交明細紀錄
 * @param records 成交明細紀錄數組
 * @returns 按日期分組的成交明細紀錄
 */
function groupFilledDetailRecordsByDate(records: any[]): { [date: string]: any[] } {
  const grouped: { [date: string]: any[] } = {};
  
  records.forEach(record => {
    const date = record.filledDate;
    if (!grouped[date]) {
      grouped[date] = [];
    }
    grouped[date].push(record);
  });
  
  return grouped;
}

/**
 * 計算統計資訊
 * @param records 成交明細紀錄數組
 * @returns 統計資訊
 */
function calculateStatistics(records: any[]): { 
  totalBuyAmount: number; 
  totalSellAmount: number; 
  totalBuyQty: number; 
  totalSellQty: number;
  marketTypeStats: {
    [marketType: string]: {
      count: number;
      totalAmount: number;
    }
  }
} {
  const stats = {
    totalBuyAmount: 0,
    totalSellAmount: 0,
    totalBuyQty: 0,
    totalSellQty: 0,
    marketTypeStats: {} as {
      [marketType: string]: {
        count: number;
        totalAmount: number;
      }
    }
  };
  
  records.forEach(record => {
    const isBuy = record.buySell.toUpperCase() === "B" || record.buySell.toUpperCase() === "BUY";
    
    if (isBuy) {
      stats.totalBuyAmount += record.payment;
      stats.totalBuyQty += record.filledQty;
    } else {
      stats.totalSellAmount += record.payment;
      stats.totalSellQty += record.filledQty;
    }
    
    // 按市場類型統計
    const marketType = record.marketType;
    if (!stats.marketTypeStats[marketType]) {
      stats.marketTypeStats[marketType] = {
        count: 0,
        totalAmount: 0
      };
    }
    
    stats.marketTypeStats[marketType].count += 1;
    stats.marketTypeStats[marketType].totalAmount += record.payment;
  });
  
  return stats;
}