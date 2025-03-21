import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Account, MasterlinkSDK } from "masterlink-sdk";
import { z } from "zod";

/**
 * 註冊帳戶損益相關的工具到 MCP Server
 * @param {Object} server MCP Server 實例
 * @param {Object} sdk MasterlinkSDK 實例
 * @param {Object} account 帳戶實例
 */
export function registerTotalPnlTools(
  server: McpServer,
  sdk: MasterlinkSDK,
  account: Account
) {
  // 帳戶損益速查工具
  server.tool(
    "get_account_total_pnl",
    "查詢帳戶損益概況",
    {
      // 這裡不需要額外參數，因為已經傳入帳戶資訊
    },
    async () => {
      try {
        // 透過SDK獲取帳戶損益資訊
        const pnlData = await sdk.accounting.accountTotalPnl(account);

        // 格式化損益為貨幣格式
        const formatCurrency = (value?: string) => {
          const numValue = parseInt(value || "0");
          return numValue.toLocaleString("zh-TW");
        };
        // 格式化回應內容
        let responseText = `
【帳戶損益總覽】

未實現損益：
- 現股：${formatCurrency(pnlData.unrealizedProfitLossCash)} 元
- 融資：${formatCurrency(pnlData.unrealizedProfitLossMargin)} 元
- 融券：${formatCurrency(pnlData.unrealizedProfitLossShortSelling)} 元
- 未實現總計：${formatCurrency(pnlData.unrealizedProfitLossTotal)} 元

已實現損益：
- 現股：${formatCurrency(pnlData.realizedProfitLossCash)} 元
- 融資：${formatCurrency(pnlData.realizedProfitLossMargin)} 元
- 融券：${formatCurrency(pnlData.realizedProfitLossShortSelling)} 元
- 已實現總計：${formatCurrency(pnlData.realizedProfitLossTotal)} 元

當沖損益：
- 信用：${formatCurrency(pnlData.dayTradingProfitLossCredit)} 元
- 現股：${formatCurrency(pnlData.dayTradingProfitLossCash)} 元

總計損益：
- 現股總損益：${formatCurrency(pnlData.totalProfitLossCash)} 元
- 融資總損益：${formatCurrency(pnlData.totalProfitLossMargin)} 元
- 融券總損益：${formatCurrency(pnlData.totalProfitLossShortSelling)} 元
- 總損益：${formatCurrency(pnlData.totalProfitLoss)} 元

其他資訊：
- 淨收付金額：${formatCurrency(pnlData.netAmount)} 元
${
  pnlData.accountMaintenanceRate
    ? `- 整戶維持率：${pnlData.accountMaintenanceRate}%`
    : ""
}
        `;

        return {
          content: [{ type: "text", text: responseText }],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `查詢帳戶損益資訊時發生錯誤: ${error || "未知錯誤"}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
