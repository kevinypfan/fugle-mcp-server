import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Account, MasterlinkSDK } from "masterlink-sdk";
import { z } from "zod";

/**
 * 註冊帳戶庫存與未實現損益查詢工具到 MCP Server
 * @param {Object} server MCP Server 實例
 * @param {Object} sdk MasterlinkSDK 實例
 * @param {Object} account 帳戶實例
 */
export function registerInventoriesTools(
  server: McpServer,
  sdk: MasterlinkSDK,
  account: Account
) {
  // 帳戶庫存與未實現損益查詢工具
  server.tool(
    "get_account_inventories",
    "查詢帳戶庫存與未實現損益概況",
    {
      // 這裡不需要額外參數，因為已經傳入帳戶資訊
    },
    async () => {
      try {
        // 透過SDK獲取帳戶庫存資訊
        const inventoriesData = await sdk.accounting.inventories(account);

        // 格式化貨幣金額
        const formatCurrency = (value?: string) => {
          if (!value) return "0";
          const numValue = parseInt(value);
          return numValue.toLocaleString("zh-TW");
        };

        // 格式化百分比
        const formatPercent = (value?: string) => {
          if (!value) return "0%";
          // 檢查是否已經包含百分比符號
          return value.includes("%") ? value : `${value}%`;
        };

        // 組建帳戶庫存摘要
        let summaryText = `
【帳戶庫存摘要】

庫存總覽：
- 昨日庫存總額：${formatCurrency(inventoriesData.prevDayQuantity)} 股
- 目前庫存總額：${formatCurrency(inventoriesData.currentQuantity)} 股
- 今日增減股數：${formatCurrency(inventoriesData.todayQuantity)} 股
- 今日買進總額：${formatCurrency(inventoriesData.todayBuyQuantity)} 股
- 今日賣出總額：${formatCurrency(inventoriesData.todaySellQuantity)} 股

財務概況：
- 付出總成本：${formatCurrency(inventoriesData.cost)} 元
- 目前總市值：${formatCurrency(inventoriesData.marketValue)} 元
- 未實現損益：${formatCurrency(
          inventoriesData.unrealizedProfitLoss
        )} 元 (${formatPercent(inventoriesData.unrealizedProfitLossRate)})
- 預估淨收付：${formatCurrency(inventoriesData.unrealizedNetAmount)} 元
- 總損益：${formatCurrency(inventoriesData.totalProfitLoss)} 元
- 當日已實現損益：${formatCurrency(inventoriesData.realizedProfitLoss)} 元

費用明細：
- 手續費：${formatCurrency(inventoriesData.fee)} 元
- 交易稅：${formatCurrency(inventoriesData.tax)} 元
- 利息：${formatCurrency(inventoriesData.interest)} 元
- 其他費用：${formatCurrency(inventoriesData.otherCost)} 元
- 證券交易所得稅：${formatCurrency(
          inventoriesData.securitiesTransactionIncomeTax
        )} 元
- 健保補充費：${formatCurrency(inventoriesData.healthInsuranceFee)} 元

融資融券：
- 未償還融資/券金額：${formatCurrency(inventoriesData.openMarginAmount)} 元
- 未償還融券保證金：${formatCurrency(inventoriesData.openGuaranteeAmount)} 元
- 未償還擔保品：${formatCurrency(inventoriesData.openShortCollateral)} 元
- 融券手續費：${formatCurrency(inventoriesData.shortSellingFee)} 元
- 自備款：${formatCurrency(inventoriesData.ownFundsAmount)} 元
        `;

        // 添加帳戶維持率（如果有的話）
        if (
          inventoriesData.accountSummary &&
          inventoriesData.accountSummary.accountMaintenanceRate
        ) {
          summaryText += `\n整戶維持率：${formatPercent(
            inventoriesData.accountSummary.accountMaintenanceRate
          )}`;
        }

        // 加入個股持倉資訊
        if (
          inventoriesData.positionSummaries &&
          inventoriesData.positionSummaries.length > 0
        ) {
          summaryText += `\n\n【個股持倉明細】\n`;

          inventoriesData.positionSummaries.forEach((position, index) => {
            summaryText += `
${index + 1}. ${position.symbolName}（${position.symbol}）：
   - 持有數量：${formatCurrency(position.currentQuantity)} 股（${formatPercent(
              position.holdingPercent
            )}）
   - 成本均價：${position.averagePrice} 元
   - 現價：${position.currentPrice} 元
   - 市值：${formatCurrency(position.marketValue)} 元
   - 未實現損益：${formatCurrency(
     position.unrealizedProfit
   )} 元 (${formatPercent(position.unrealizedProfitLossRate)})
   - 損益兩平價：${position.breakEvenPrice} 元
   - 交易類型：${position.orderTypeName}
            `;
          });
        }

        return {
          content: [{ type: "text", text: summaryText }],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `查詢帳戶庫存資訊時發生錯誤: ${error || "未知錯誤"}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
