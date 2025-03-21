import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Account, MasterlinkSDK } from "masterlink-sdk";
import { z } from "zod";

/**
 * 註冊查詢現沖券餘額相關的工具到 MCP Server
 * @param {Object} server MCP Server 實例
 * @param {Object} sdk MasterlinkSDK 實例
 * @param {Object} accounts 帳戶實例陣列
 */
export function registerShortDaytradeQuotaTools(
  server: McpServer,
  sdk: MasterlinkSDK,
  accounts: Account[]
) {
  // 查詢現沖券餘額工具
  server.tool(
    "get_short_daytrade_quota",
    "查詢股票現沖券餘額",
    {
      symbol: z
        .string()
        .describe("股票代號，例如：2330"),
    },
    async ({ symbol }, extra) => {
      try {
        // 呼叫 SDK 獲取現沖券餘額資訊
        const quotaData = await sdk.stock.shortDaytradeQuota(accounts[0], symbol);

        // 檢查是否有查詢結果
        if (!quotaData) {
          return {
            content: [
              {
                type: "text",
                text: `❌ 查無 ${symbol} 的現沖券餘額資訊`,
              },
            ],
          };
        }

        // 解析數值（移除前導零）
        const quota = parseInt(quotaData.quota || "0", 10).toString();
        const total = parseInt(quotaData.total || "0", 10).toString();
        const used = parseInt(quotaData.used || "0", 10).toString();

        // 計算使用率
        const usageRate = parseInt(total) > 0 
          ? (parseInt(used) / parseInt(total) * 100).toFixed(2) 
          : "0.00";

        // 構建回應文本
        let responseText = `📊 **${symbol} 現沖券餘額查詢結果**\n\n`;
        
        responseText += `- 現沖券剩餘張數：${formatNumber(quota)} 張\n`;
        responseText += `- 現沖券原始額度：${formatNumber(total)} 張\n`;
        responseText += `- 現沖券使用額度：${formatNumber(used)} 張\n`;
        responseText += `- 現沖券使用率：${usageRate}%\n`;
        
        // 加入使用建議
        if (parseInt(quota) <= 0) {
          responseText += `\n⚠️ **提醒：** 您目前已無可用的現沖券額度，無法進行現沖交易。`;
        } else if (parseInt(quota) < parseInt(total) * 0.1) {
          responseText += `\n⚠️ **提醒：** 您的現沖券額度即將用盡，請謹慎交易。`;
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
              text: `❌ 查詢現沖券餘額失敗：${errorMessage}`,
            },
          ],
        };
      }
    }
  );
}

/**
 * 格式化數字（加入千位分隔符）
 * @param value 數字或數字字串
 * @returns 格式化後的數字字串
 */
function formatNumber(value: string | number): string {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}