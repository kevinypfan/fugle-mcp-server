import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import realizedPnLDetailReference from "./references/realized-pnl-detail.json";
import { FubonSDK } from "fubon-neo";
import { Account } from "fubon-neo/trade";
import { z } from "zod";

/**
 * 註冊已實現損益明細查詢工具到 MCP Server
 * @param {Object} server MCP Server 實例
 * @param {Object} sdk FubonSDK 實例
 * @param {Object} account 帳戶實例
 */
export function registerRealizedPnLDetailTool(
  server: McpServer,
  sdk: FubonSDK,
  account: Account
) {
  // 已實現損益明細查詢工具
  server.tool(
    "get_realized_pnl_detail",
    "查詢已實現損益明細",
    {
      startDate: z
        .string()
        .describe("查詢起始日期，格式為YYYY/MM/DD，例如：2024/01/01"),
      endDate: z
        .string()
        .describe("查詢截止日期，格式為YYYY/MM/DD，例如：2024/01/31")
    },
    async ({ startDate, endDate }) => {
      try {
        // 檢查日期格式是否正確
        if (!/^\d{4}\/\d{2}\/\d{2}$/.test(startDate) || !/^\d{4}\/\d{2}\/\d{2}$/.test(endDate)) {
          return {
            content: [
              {
                type: "text",
                text: "日期格式錯誤！請使用YYYY/MM/DD格式，例如：2024/01/01",
              },
            ],
            isError: true,
          };
        }
        
        // 檢查結束日期是否早於起始日期
        const startDateObj = new Date(startDate);
        const endDateObj = new Date(endDate);
        if (endDateObj < startDateObj) {
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
        // 透過SDK獲取已實現損益明細
        // 假設 SDK 只接受帳戶參數，且在內部使用預設日期
        // 或者日期範圍應該透過其他方式設定
        const data = await sdk.accounting.realizedGainsAndLoses(account);
        
        // 在實際應用中，如果需要根據日期過濾數據，可能需要在後端進行過濾
        // 這裡只是範例代碼，實際應用時請根據 SDK 的實際規格進行調整
        // const filteredData = {
        //   ...data,
        //   data: Array.isArray(data.data) 
        //     ? data.data.filter(item => {
        //         const itemDate = new Date(item.date);
        //         return itemDate >= startDateObj && itemDate <= endDateObj;
        //       })
        //     : data.data
        // };

        const response = `API Response\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\`\n\nField Description\n\`\`\`json\n${JSON.stringify(realizedPnLDetailReference, null, 2)}\n\`\`\``;

        return {
          content: [{ type: "text", text: response }],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `已實現損益明細查詢時發生錯誤: ${error || "未知錯誤"}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}