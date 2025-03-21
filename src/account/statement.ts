import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Account, MasterlinkSDK } from "masterlink-sdk";
import { z } from "zod";

/**
 * 註冊帳戶對帳單查詢工具到 MCP Server
 * @param {Object} server MCP Server 實例
 * @param {Object} sdk MasterlinkSDK 實例
 * @param {Object} account 帳戶實例
 */
export function registerAccountStatementTools(
  server: McpServer,
  sdk: MasterlinkSDK,
  account: Account
) {
  // 帳戶對帳單查詢工具
  server.tool(
    "get_account_statement",
    "查詢指定期間內的帳戶對帳單資訊",
    {
      start_date: z
        .string()
        .describe("查詢起始日期，格式為YYYYMMDD，例如：20240101"),
      end_date: z
        .string()
        .describe("查詢結束日期，格式為YYYYMMDD，例如：20240131"),
      symbol: z
        .string()
        .optional()
        .describe("選擇性參數：可指定股票代號篩選特定股票的交易記錄"),
    },
    async ({ start_date, end_date, symbol }) => {
      try {
        // 檢查日期格式是否正確
        if (!/^\d{8}$/.test(start_date) || !/^\d{8}$/.test(end_date)) {
          return {
            content: [
              {
                type: "text",
                text: "日期格式錯誤！請使用YYYYMMDD格式，例如：20240101",
              },
            ],
            isError: true,
          };
        }

        // 檢查結束日期是否早於起始日期
        if (parseInt(end_date) < parseInt(start_date)) {
          return {
            content: [
              {
                type: "text",
                text: "查詢結束日期不能早於起始日期！",
              },
            ],
            isError: true,
          };
        }

        // 透過SDK獲取帳戶對帳單資訊
        const statementData = await sdk.accounting.accountStatment(
          account,
          start_date,
          end_date,
          symbol
        );

        // 格式化貨幣金額
        const formatCurrency = (value?: string) => {
          if (!value) return "0";
          const numValue = parseInt(value);
          return numValue.toLocaleString("zh-TW");
        };

        // 格式化日期
        const formatDate = (dateStr?: string) => {
          if (!dateStr || dateStr.length !== 8) return dateStr;
          return `${dateStr.slice(0, 4)}/${dateStr.slice(4, 6)}/${dateStr.slice(
            6,
            8
          )}`;
        };

        // 組建摘要
        let summaryText = `
【帳戶對帳單摘要】(${formatDate(start_date)} ~ ${formatDate(end_date)})${
          symbol ? ` - 股票：${symbol}` : ""
        }

交易概況：
- 買入總額：${formatCurrency(statementData.cost)} 元
- 賣出總額：${formatCurrency(statementData.income)} 元
- 收付淨額：${formatCurrency(statementData.netAmount)} 元
- 成交股數：${formatCurrency(statementData.filledQuantity)} 股
- 成交金額：${formatCurrency(statementData.filledAmount)} 元
- 總損益：${formatCurrency(statementData.profitLoss)} 元

費用明細：
- 手續費：${formatCurrency(statementData.fee)} 元
- 交易稅：${formatCurrency(statementData.tax)} 元
- 利息：${formatCurrency(statementData.interest)} 元
- 融券費：${formatCurrency(statementData.shortSellingFee)} 元
- 證券所得稅：${formatCurrency(statementData.securitiesIncomeTax)} 元
- 健保費：${formatCurrency(statementData.healthInsuranceFee)} 元
- 證券借貸價差費：${formatCurrency(
          statementData.securitiesLendingDifferentialFee
        )} 元

當沖交易：
- 融券當沖損益：${formatCurrency(
          statementData.marginShortDayTradingProfitLoss
        )} 元
- 普通股當沖損益：${formatCurrency(
          statementData.commonStockDayTradingProfitLoss || "0"
        )} 元
`;

        // 加入帳戶摘要資訊
        if (statementData.accountSummary) {
          const accountSummary = statementData.accountSummary;
          summaryText += `
帳戶資產摘要：
- 融資持倉市值：${formatCurrency(
            accountSummary.marginPositionMarketValueSum
          )} 元
- 融券持倉市值：${formatCurrency(
            accountSummary.shortPositionMarketValueSum
          )} 元
- 融券擔保品：${formatCurrency(accountSummary.shortCollateralSum)} 元
- 融資限額：${formatCurrency(accountSummary.marginLimit)} 元
- 融券限額：${formatCurrency(accountSummary.shortLimit)} 元
- 保證金總額：${formatCurrency(accountSummary.guaranteeAmountSum)} 元
- 融資金額總額：${formatCurrency(accountSummary.marginAmountSum)} 元
- 融券金額總額：${formatCurrency(accountSummary.shortAmountSum)} 元
${
  accountSummary.accountMaintenanceRate
    ? `- 帳戶維持率：${accountSummary.accountMaintenanceRate}`
    : ""
}
- 今日結算：${formatCurrency(accountSummary.settlementToday)} 元
- 昨日結算：${formatCurrency(accountSummary.settlementYesterday)} 元
- 結算淨額：${formatCurrency(accountSummary.settlementNet)} 元
`;
        }

        // 加入帳單摘要資訊
        if (statementData.billSummary) {
          const billSummary = statementData.billSummary;
          summaryText += `
交易明細摘要：
- 普通股買入：${formatCurrency(
            billSummary.commonStockBuyAmount
          )} 元 (${formatCurrency(billSummary.buyQuantity)} 股)
- 普通股賣出：${formatCurrency(
            billSummary.commonStockSellAmount
          )} 元 (${formatCurrency(billSummary.sellQuantity)} 股)
- 普通股手續費：${formatCurrency(billSummary.commonStockFee)} 元
- 普通股稅金：${formatCurrency(billSummary.commonStockTax)} 元
- 普通股淨額：${formatCurrency(billSummary.commonStockNetAmount)} 元

融資交易：
- 融資金額：${formatCurrency(billSummary.marginAmount)} 元
- 融資手續費：${formatCurrency(billSummary.marginFee)} 元
- 融資利息：${formatCurrency(billSummary.marginInterest)} 元
- 融資稅金：${formatCurrency(billSummary.marginTax)} 元
- 融資所得稅：${formatCurrency(billSummary.marginSecuritiesIncomeTax)} 元
- 融資淨額：${formatCurrency(billSummary.marginNetAmount)} 元

融券交易：
- 融券保證金：${formatCurrency(billSummary.guaranteeAmount)} 元
- 融券擔保品：${formatCurrency(billSummary.shortCollateral)} 元
- 融券手續費：${formatCurrency(billSummary.shortFee)} 元
- 融券利息：${formatCurrency(billSummary.shortInterest)} 元
- 融券健保費：${formatCurrency(billSummary.shortHealthInsuranceFee)} 元
- 融券淨額：${formatCurrency(billSummary.shortNetAmount)} 元

總計：
- 自有資金：${formatCurrency(billSummary.ownFundsAmount)} 元
- 總損益：${formatCurrency(billSummary.profitLoss)} 元
- 總淨額：${formatCurrency(billSummary.netAmount)} 元
`;
        }

        // 加入成交記錄明細
        if (
          statementData.filledRecords &&
          statementData.filledRecords.length > 0
        ) {
          summaryText += `\n【成交記錄明細】\n`;

          // 如果成交記錄太多，可能需要限制顯示的數量
          const maxRecordsToShow = 10;
          const recordsToShow = statementData.filledRecords.slice(
            0,
            maxRecordsToShow
          );

          recordsToShow.forEach((record, index) => {
            summaryText += `
${index + 1}. ${record.symbolName}（${record.symbol}）- ${formatDate(
              record.filledDate
            )}：
   - 委託類型：${record.orderTypeName} (${record.buySellName})
   - 委託序號：${record.orderNo}
   - 成交序號：${record.filledNo}
   - 成交價格：${record.filledPrice} 元
   - 成交數量：${formatCurrency(record.filledQty)} 股
   - 成交金額：${formatCurrency(record.filledAmount)} 元
   - 手續費：${formatCurrency(record.fee)} 元
   - 交易稅：${formatCurrency(record.tax)} 元
   - 預估淨額：${formatCurrency(record.netAmount)} 元
   - 當沖交易：${record.isDayTrade === "Y" ? "是" : "否"}
`;
          });

          // 如果記錄數量超過顯示限制，提示用戶
          if (statementData.filledRecords.length > maxRecordsToShow) {
            summaryText += `\n以上顯示 ${maxRecordsToShow} 筆交易記錄，共有 ${statementData.filledRecords.length} 筆符合查詢條件的記錄。`;
          }
        } else {
          summaryText += "\n查詢期間內無成交記錄。";
        }

        return {
          content: [{ type: "text", text: summaryText }],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `查詢帳戶對帳單資訊時發生錯誤: ${error || "未知錯誤"}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}