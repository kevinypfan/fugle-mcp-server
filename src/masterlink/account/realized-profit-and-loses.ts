import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Account, BSAction, MasterlinkSDK } from "masterlink-sdk";
import { z } from "zod";
import realizedPNLReference from "./references/realized-pnl-detail.json";

/**
 * 註冊已實現損益查詢工具到 MCP Server
 * @param {Object} server MCP Server 實例
 * @param {Object} sdk MasterlinkSDK 實例
 * @param {Object} account 帳戶實例
 */
export function registerRealizedProfitAndLossesTools(
  server: McpServer,
  sdk: MasterlinkSDK,
  account: Account
) {
  // 已實現損益查詢工具
  server.tool(
    "get_account_realized_profit_and_losses",
    "查詢指定期間內的已實現損益",
    {
      start_date: z
        .string()
        .describe("查詢起始日期，格式為YYYYMMDD，例如：20240101"),
      end_date: z
        .string()
        .describe("查詢結束日期，格式為YYYYMMDD，例如：20240131"),
    },
    async ({ start_date, end_date }) => {
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

        // 透過SDK獲取已實現損益資訊
        const data = await sdk.accounting.realizedProfitAndLoses(
          account,
          start_date,
          end_date
        );

        const response = `API Response\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\`\n\nField Description\n\`\`\`json\n${JSON.stringify(realizedPNLReference, null, 2)}\n\`\`\``;

        return {
          content: [{ type: "text", text: response }],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `查詢已實現損益資訊時發生錯誤: ${error || "未知錯誤"}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
