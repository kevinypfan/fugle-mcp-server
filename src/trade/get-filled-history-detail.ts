import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Account, MasterlinkSDK } from "masterlink-sdk";
import { z } from "zod";
import filledHistoryDetailReference from "./references/filled-history-detail.json";

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
        const data = await sdk.stock.filledDetailHistory(accounts[0], startDate, endDate);

        // 檢查是否有查詢結果
        if (!data || (Array.isArray(data) && data.length === 0)) {
          return {
            content: [
              {
                type: "text",
                text: `查詢期間 ${formatDate(startDate)} 至 ${formatDate(endDate)} 沒有任何成交明細紀錄`,
              },
            ],
          };
        }

        const response = `API Response\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\`\n\nField Description\n\`\`\`json\n${JSON.stringify(filledHistoryDetailReference, null, 2)}\n\`\`\``;

        return {
          content: [{ type: "text", text: response }],
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [
            {
              type: "text",
              text: `查詢歷史成交明細失敗：${errorMessage}`,
            },
          ],
          isError: true,
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
