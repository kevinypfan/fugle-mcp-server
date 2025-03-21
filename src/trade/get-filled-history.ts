import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Account, MasterlinkSDK } from "masterlink-sdk";
import { z } from "zod";

/**
 * 註冊查詢歷史成交相關的工具到 MCP Server
 * @param {Object} server MCP Server 實例
 * @param {Object} sdk MasterlinkSDK 實例
 * @param {Object} accounts 帳戶實例陣列
 */
export function registerFilledHistoryTools(
  server: McpServer,
  sdk: MasterlinkSDK,
  accounts: Account[]
) {
  // 查詢歷史成交工具
  server.tool(
    "filled_history",
    "查詢歷史成交",
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
        // 呼叫 SDK 獲取歷史成交資訊
        const filledHistoryData = await sdk.stock.filledHistory(accounts[0], startDate, endDate);

        // 檢查是否有查詢結果
        if (!filledHistoryData || (Array.isArray(filledHistoryData) && filledHistoryData.length === 0)) {
          return {
            content: [
              {
                type: "text",
                text: `📢 查詢期間 ${formatDate(startDate)} 至 ${formatDate(endDate)} 沒有任何成交紀錄`,
              },
            ],
          };
        }

        // 構建回應文本
        let responseText = `📊 **歷史成交紀錄** (${formatDate(startDate)} ~ ${formatDate(endDate)})\n\n`;
        
        // 轉換成交紀錄為數組
        const filledRecords = Array.isArray(filledHistoryData) ? filledHistoryData : [filledHistoryData];
        
        // 統計總數量
        responseText += `共有 ${filledRecords.length} 筆成交紀錄\n\n`;
        
        // 按日期分組成交紀錄
        const groupedByDate = groupFilledRecordsByDate(filledRecords);
        
        // 遍歷分組顯示成交紀錄
        Object.keys(groupedByDate).sort().reverse().forEach(date => {
          const records = groupedByDate[date];
          responseText += `### ${formatDate(date)} (${records.length}筆)\n\n`;
          
          // 建立表格標題
          responseText += `| 時間 | 股票代號 | 買賣方向 | 成交價格 | 成交股數 | 成交金額 | 委託書號 |\n`;
          responseText += `|------|----------|----------|----------|----------|----------|----------|\n`;
          
          // 排序當日紀錄（依時間遞減）
          records.sort((a, b) => b.filledTime.localeCompare(a.filledTime));
          
          // 添加成交紀錄到表格
          records.forEach(record => {
            responseText += `| ${formatTime(record.filledTime)} | ${record.symbol} | ${getBuySellText(record.buySell)} | ${record.filledPrice} | ${record.filledQty.toLocaleString()} | ${record.payment.toLocaleString()} | ${record.orderNo} |\n`;
          });
          
          responseText += `\n`;
        });

        // 添加統計信息
        const stats = calculateStatistics(filledRecords);
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
              text: `❌ 查詢歷史成交失敗：${errorMessage}`,
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
 * 按日期分組成交紀錄
 * @param records 成交紀錄數組
 * @returns 按日期分組的成交紀錄
 */
function groupFilledRecordsByDate(records: any[]): { [date: string]: any[] } {
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
 * @param records 成交紀錄數組
 * @returns 統計資訊
 */
function calculateStatistics(records: any[]): { 
  totalBuyAmount: number; 
  totalSellAmount: number; 
  totalBuyQty: number; 
  totalSellQty: number; 
} {
  const stats = {
    totalBuyAmount: 0,
    totalSellAmount: 0,
    totalBuyQty: 0,
    totalSellQty: 0
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
  });
  
  return stats;
}