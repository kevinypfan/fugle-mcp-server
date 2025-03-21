import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Account, MasterlinkSDK } from "masterlink-sdk";
import { z } from "zod";

/**
 * 註冊查詢成交明細相關的工具到 MCP Server
 * @param {Object} server MCP Server 實例
 * @param {Object} sdk MasterlinkSDK 實例
 * @param {Object} accounts 帳戶實例陣列
 */
export function registerFilledDetailTools(
  server: McpServer,
  sdk: MasterlinkSDK,
  accounts: Account[]
) {
  // 查詢今日成交明細工具
  server.tool(
    "get_filled_detail",
    "查詢今日成交明細",
    {
      symbol: z
        .string()
        .describe("股票代號，例如：2330（可選，不填則查詢所有股票）")
        .optional(),
    },
    async ({ symbol }, extra) => {
      try {
        // 呼叫 SDK 獲取成交明細
        const filledData = await sdk.stock.getFilledDetail(accounts[0], symbol);
        
        // 檢查是否有成交紀錄
        if (!filledData || filledData.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: symbol 
                  ? `📋 今日無 ${symbol} 的成交明細`
                  : `📋 今日無任何成交明細`,
              },
            ],
          };
        }

        // 篩選特定股票的成交紀錄
        const filteredData = symbol 
          ? filledData.filter(record => record.symbol === symbol)
          : filledData;
          
        if (filteredData.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: `📋 今日無 ${symbol} 的成交明細`,
              },
            ],
          };
        }
        
        // 構建回應文本
        let responseText = "";
        
        // 如果指定了股票代號
        if (symbol) {
          responseText = `📋 **${symbol} 今日成交明細**\n\n`;
        } else {
          responseText = `📋 **今日成交明細**\n\n`;
        }
        
        // 按日期排序，最新的在前面
        const sortedData = [...filteredData].sort((a, b) => {
          // 處理可能的 undefined 值
          const aDate = a.filledDate || "";
          const bDate = b.filledDate || "";
          
          // 按日期排序（降序）
          return bDate.localeCompare(aDate);
        });
        
        // 添加成交明細
        sortedData.forEach((record, index) => {
          // 如果不是特定股票查詢，顯示股票代號
          if (!symbol) {
            responseText += `【${record.symbol || "未知"}】 `;
          }
          
          // 基本交易信息
          responseText += `${record.buySell === "Buy" ? "買入" : "賣出"} ${(record.filledQty || 0).toLocaleString('zh-TW')} 股 @ ${(record.filledAvgPrice || 0).toFixed(2)} 元\n`;
          
          // 交易詳情
          responseText += `  成交金額：${formatCurrency(record.payment || 0)} 元\n`;
          responseText += `  成交日期：${formatDate(record.filledDate || "")}\n`;
          responseText += `  委託書號：${record.orderNo || "無"}\n`;
          responseText += `  市場類型：${getMarketTypeText(record.marketType)}\n`;
          
          // 如果不是最後一筆，添加分隔線
          if (index < sortedData.length - 1) {
            responseText += `\n${symbol ? "" : "————————————————\n\n"}`;
          }
        });
        
        // 如果記錄超過 10 筆，添加摘要資訊
        if (sortedData.length > 10) {
          responseText += `\n\n共顯示 ${sortedData.length} 筆成交記錄`;
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
              text: `❌ 查詢今日成交明細失敗：${errorMessage}`,
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
  return amount.toLocaleString('zh-TW');
}

/**
 * 格式化日期
 * @param dateStr 日期字串，格式為 YYYYMMDD
 * @returns 格式化後的日期字串
 */
function formatDate(dateStr: string): string {
  if (!dateStr) return dateStr;
  
  try {
    // 格式化日期 YYYYMMDD -> YYYY/MM/DD
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    return `${year}/${month}/${day}`;
  } catch (error) {
    // 如果解析出錯，返回原始字串
    return dateStr;
  }
}

/**
 * 獲取市場類型的中文描述
 * @param marketType 市場類型
 * @returns 市場類型描述
 */
function getMarketTypeText(marketType: number): string {
  switch (marketType) {
    case 0: return "普通整股";
    case 1: return "盤後交易";
    case 2: return "盤後零股";
    case 3: return "興櫃";
    case 4: return "盤中零股";
    default: return `未知(${marketType})`;
  }
}