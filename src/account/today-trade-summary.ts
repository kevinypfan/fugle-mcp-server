import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Account, MasterlinkSDK } from "masterlink-sdk";
import { z } from "zod";

/**
 * 註冊今日買賣日報與即時庫存查詢工具到 MCP Server
 * @param {Object} server MCP Server 實例
 * @param {Object} sdk MasterlinkSDK 實例
 * @param {Object} account 帳戶實例
 */
export function registerTodayTradeSummaryTools(
  server: McpServer,
  sdk: MasterlinkSDK,
  account: Account
) {
  // 今日買賣日報與即時庫存查詢工具
  server.tool(
    "get_account_today_trade_summary",
    "查詢今日買賣日報與即時庫存資訊",
    {
      symbol: z.string().optional().describe("選擇性參數：可指定股票代號"),
    },
    async ({ symbol }) => {
      try {
        // 透過SDK獲取今日買賣日報與即時庫存資訊
        const tradeSummaryData = await sdk.accounting.todayTradeSummary(account, symbol);

        // 格式化數字
        const formatNumber = (value?: string) => {
          if (!value) return "0";
          const numValue = parseInt(value);
          return numValue.toLocaleString("zh-TW");
        };

        // 取得市場類型的中文名稱
        const getMarketTypeName = (marketType?: string) => {
          if (!marketType) return "未知";
          switch (marketType) {
            case "T": return "上市";
            case "O": return "上櫃";
            case "R": return "興櫃";
            default: return "未知";
          }
        };

        // 準備回應訊息
        let responseText = "";

        // 如果回傳的是單一股票的資訊
        if (!Array.isArray(tradeSummaryData)) {
          responseText = formatSingleStockSummary(tradeSummaryData);
        } 
        // 如果回傳的是多檔股票的陣列
        else if (Array.isArray(tradeSummaryData) && tradeSummaryData.length > 0) {
          responseText = `【今日交易與即時庫存摘要】\n\n`;
          
          // 加入每檔股票的摘要資訊
          tradeSummaryData.forEach((stock, index) => {
            responseText += `${index + 1}. ${stock.symbol} (${getMarketTypeName(stock.marketType)}):\n`;
            responseText += formatStockSummaryBrief(stock);
            responseText += "\n";
          });
          
          // 如果股票數量太多，提供建議
          if (tradeSummaryData.length > 5) {
            responseText += `\n共有 ${tradeSummaryData.length} 檔股票的交易記錄。若要查看特定股票的詳細資訊，請使用「symbol」參數指定股票代號。`;
          }
        } else {
          responseText = "查無今日交易資料。";
        }

        return {
          content: [{ type: "text", text: responseText }],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `查詢今日買賣日報與即時庫存資訊時發生錯誤: ${error || "未知錯誤"}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // 格式化單一股票的完整摘要
  function formatSingleStockSummary(stock: any) {
    const formatNumber = (value?: string) => {
      if (!value) return "0";
      const numValue = parseInt(value);
      return numValue.toLocaleString("zh-TW");
    };

    const getMarketTypeName = (marketType?: string) => {
      if (!marketType) return "未知";
      switch (marketType) {
        case "T": return "上市";
        case "O": return "上櫃";
        case "R": return "興櫃";
        default: return "未知";
      }
    };

    return `
【${stock.symbol} (${getMarketTypeName(stock.marketType)}) 今日交易與即時庫存】

昨日餘額：
- 普通股股數：${formatNumber(stock.commonStockQuantity)} 股
- 融資股數：${formatNumber(stock.marginStockQuantity)} 股
- 融券股數：${formatNumber(stock.shortStockQuantity || stock.shortSellingQuantity)} 股
- 零股股數：${formatNumber(stock.oddLotQuantity)} 股

即時庫存：
- 普通股股數：${formatNumber(stock.realTimeDepositoryQuantity)} 股
- 融資股數：${formatNumber(stock.realTimeMarginQuantity)} 股
- 融券股數：${formatNumber(stock.realTimeShortSellingQuantity)} 股
- 零股股數：${formatNumber(stock.realTimeOddLotQuantity)} 股

今日委託買進：
- 普通股：${formatNumber(stock.todayDepositoryBuyOrderQuantity)} 股
- 融資：${formatNumber(stock.todayMarginBuyOrderQuantity)} 股
- 融券：${formatNumber(stock.todayShortSellingBuyOrderQuantity)} 股
- 零股：${formatNumber(stock.todayOddLotBuyOrderQuantity)} 股

今日委託賣出：
- 普通股：${formatNumber(stock.todayDepositorySellOrderQuantity)} 股
- 融資：${formatNumber(stock.todayMarginSellOrderQuantity)} 股
- 融券：${formatNumber(stock.todayShortSellingSellOrderQuantity)} 股
- 零股：${formatNumber(stock.todayOddLotSellOrderQuantity)} 股

今日買進成交：
- 普通股：${formatNumber(stock.todayDepositoryBuyExecutedQuantity)} 股
- 融資：${formatNumber(stock.todayMarginBuyExecutedQuantity)} 股
- 融券：${formatNumber(stock.todayShortSellingBuyExecutedQuantity)} 股
- 零股：${formatNumber(stock.todayOddLotBuyExecutedQuantity)} 股

今日賣出成交：
- 普通股：${formatNumber(stock.todayDepositorySellExecutedQuantity)} 股
- 融資：${formatNumber(stock.todayMarginSellExecutedQuantity)} 股
- 融券：${formatNumber(stock.todayShortSellingSellExecutedQuantity)} 股
- 零股：${formatNumber(stock.todayOddLotSellExecutedQuantity)} 股
`;
  }

  // 格式化股票的簡短摘要（用於多檔股票的情況）
  function formatStockSummaryBrief(stock: any) {
    const formatNumber = (value?: string) => {
      if (!value) return "0";
      const numValue = parseInt(value);
      return numValue.toLocaleString("zh-TW");
    };

    // 計算買進和賣出的總成交量
    const totalBuyExecuted = parseInt(stock.todayDepositoryBuyExecutedQuantity || "0") +
                              parseInt(stock.todayMarginBuyExecutedQuantity || "0") +
                              parseInt(stock.todayShortSellingBuyExecutedQuantity || "0") +
                              parseInt(stock.todayOddLotBuyExecutedQuantity || "0");
    
    const totalSellExecuted = parseInt(stock.todayDepositorySellExecutedQuantity || "0") +
                               parseInt(stock.todayMarginSellExecutedQuantity || "0") +
                               parseInt(stock.todayShortSellingSellExecutedQuantity || "0") +
                               parseInt(stock.todayOddLotSellExecutedQuantity || "0");

    // 計算總即時庫存
    const totalRealTimeQuantity = parseInt(stock.realTimeDepositoryQuantity || "0") +
                                   parseInt(stock.realTimeMarginQuantity || "0") +
                                   parseInt(stock.realTimeShortSellingQuantity || "0") +
                                   parseInt(stock.realTimeOddLotQuantity || "0");

    return `   - 即時庫存：${formatNumber(totalRealTimeQuantity.toString())} 股
   - 今日買進成交：${formatNumber(totalBuyExecuted.toString())} 股
   - 今日賣出成交：${formatNumber(totalSellExecuted.toString())} 股`;
  }
}