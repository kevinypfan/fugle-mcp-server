import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Account, MasterlinkSDK } from "masterlink-sdk";
import { z } from "zod";

/**
 * 註冊分戶帳銀行餘額查詢工具到 MCP Server
 * @param {Object} server MCP Server 實例
 * @param {Object} sdk MasterlinkSDK 實例
 * @param {Object} account 帳戶實例
 */
export function registerBankBalanceTools(
  server: McpServer,
  sdk: MasterlinkSDK,
  account: Account
) {
  // 分戶帳銀行餘額查詢工具
  server.tool(
    "get_bank_balance",
    "查詢分戶帳銀行餘額資訊",
    {
      // 這裡不需要額外參數，因為已經傳入帳戶資訊
    },
    async () => {
      try {
        // 透過SDK獲取分戶帳銀行餘額資訊
        const balanceDataArray = await sdk.accounting.bankBalance(account);

        // 檢查是否有資料
        if (!balanceDataArray || balanceDataArray.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: "查無分戶帳銀行餘額資訊。",
              },
            ],
          };
        }

        // 組建回應訊息
        let responseText = "【分戶帳銀行餘額資訊】\n\n";

        // 處理每個帳戶資訊
        balanceDataArray.forEach((balanceData, index) => {
          responseText += `${index > 0 ? "\n\n" : ""}`;
          responseText += `${index > 0 ? `帳戶 ${index + 1}：\n` : ""}`;
          responseText += `餘額資訊：
- 可用餘額：${balanceData.availableBalance} 元
- 圈存金額：${balanceData.reservedAmount} 元
- 專戶餘額：${balanceData.dedicatedAccountBalance} 元

出金銀行資訊：
- 銀行代號：${balanceData.withdrawalBankCode || "無"}
- 銀行名稱：${balanceData.withdrawalBank || "無"}
- 銀行帳號：${balanceData.withdrawalAccount || "無"}

入金銀行資訊：
- 銀行代號：${balanceData.depositBankCode || "無"}
- 銀行帳號：${balanceData.depositAccount || "無"}`;
        });

        return {
          content: [{ type: "text", text: responseText }],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `查詢分戶帳銀行餘額時發生錯誤: ${error || "未知錯誤"}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
