import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Account, MasterlinkSDK } from "masterlink-sdk";
import { z } from "zod";

/**
 * 註冊今日交割款查詢工具到 MCP Server
 * @param {Object} server MCP Server 實例
 * @param {Object} sdk MasterlinkSDK 實例
 * @param {Object} account 帳戶實例
 */
export function registerTodaySettlementTools(
  server: McpServer,
  sdk: MasterlinkSDK,
  account: Account
) {
  // 今日交割款查詢工具
  server.tool(
    "get_today_settlement",
    "查詢今日交割款資訊",
    {
      // 這裡不需要額外參數，因為已經傳入帳戶資訊
    },
    async () => {
      try {
        // 透過SDK獲取今日交割款資訊
        const settlementData = await sdk.accounting.todaySettlement(account);

        // 處理空值
        const handleEmptyValue = (value?: string) => {
          return value || "0";
        };

        // 格式化日期
        const formatDate = (dateStr?: string) => {
          if (!dateStr || dateStr.length !== 8) return dateStr;
          return `${dateStr.slice(0, 4)}/${dateStr.slice(4, 6)}/${dateStr.slice(
            6,
            8
          )}`;
        };

        // 組建回應訊息
        let responseText = `
【今日交割款資訊】

基本資訊：
- 交割日期：${formatDate(settlementData.sDate)}
- 交易日期：${formatDate(settlementData.tDate)}
- 總淨收付金額：${handleEmptyValue(settlementData.netAmount)} 元`;

        // 加入現金結算摘要
        if (settlementData.settleSum) {
          const settleSum = settlementData.settleSum;
          responseText += `

現金結算摘要：
- 今日現股買入金額：${handleEmptyValue(settleSum.buyAmount)} 元
- 今日現股賣出金額：${handleEmptyValue(settleSum.sellAmount)} 元
- 手續費：${handleEmptyValue(settleSum.fee)} 元
- 交易稅：${handleEmptyValue(settleSum.tax)} 元
- 淨收付金額：${handleEmptyValue(settleSum.netAmount)} 元`;
        }

        // 加入融資結算摘要
        if (settlementData.settleCreditSum) {
          const creditSum = settlementData.settleCreditSum;
          responseText += `

融資結算摘要：
- 當日融資額度：${handleEmptyValue(creditSum.marginQuantity)} 元
- 當日可用融資餘額：${handleEmptyValue(creditSum.marginQuantityLeft)} 元
- 融資自備款：${handleEmptyValue(creditSum.openShortCollateral)} 元
- 融資自備款買入：${handleEmptyValue(creditSum.openShortCollateralBuy)} 元
- 融資自備款賣出：${handleEmptyValue(creditSum.openShortCollateralSell)} 元
- 融資金額：${handleEmptyValue(creditSum.marginAmount)} 元
- 融資買入金額：${handleEmptyValue(creditSum.marginAmountBuy)} 元
- 融資賣出金額：${handleEmptyValue(creditSum.marginAmountSell)} 元
- 融資買入應收付金額：${handleEmptyValue(creditSum.marginNetAmountBuy)} 元
- 融資賣出應收付金額：${handleEmptyValue(creditSum.marginNetAmountSell)} 元
- 融資利息：${handleEmptyValue(creditSum.interest)} 元
- 手續費：${handleEmptyValue(creditSum.fee)} 元
- 交易稅：${handleEmptyValue(creditSum.tax)} 元
- 融資淨收付金額：${handleEmptyValue(creditSum.netAmount)} 元`;
        }

        // 加入融券結算摘要
        if (settlementData.settleDebitSum) {
          const debitSum = settlementData.settleDebitSum;
          responseText += `

融券結算摘要：
- 當日融券額度：${handleEmptyValue(debitSum.shortQuantity)} 元
- 當日可用融券餘額：${handleEmptyValue(debitSum.shortQuantityLeft)} 元
- 融券保證金：${handleEmptyValue(debitSum.guaranteeAmount)} 元
- 融券保證金券買：${handleEmptyValue(debitSum.guaranteeAmountBuy)} 元
- 融券保證金券賣：${handleEmptyValue(debitSum.guaranteeAmountSell)} 元
- 融券擔保品：${handleEmptyValue(debitSum.shortCollateral)} 元
- 融券擔保品券買：${handleEmptyValue(debitSum.shortCollateralBuy)} 元
- 融券擔保品券賣：${handleEmptyValue(debitSum.shortCollateralSell)} 元
- 融券券買應收付金額：${handleEmptyValue(debitSum.shortNetAmountBuy)} 元
- 融券券賣應收付金額：${handleEmptyValue(debitSum.shortNetAmountSell)} 元
- 融券手續費：${handleEmptyValue(debitSum.shortSellingFee)} 元
- 融券利息：${handleEmptyValue(debitSum.interest)} 元
- 融券淨收付金額：${handleEmptyValue(debitSum.netAmount)} 元`;
        }

        return {
          content: [{ type: "text", text: responseText }],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `查詢今日交割款資訊時發生錯誤: ${error || "未知錯誤"}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
