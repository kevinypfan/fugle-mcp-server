import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Account, MasterlinkSDK } from "masterlink-sdk";
import { z } from "zod";
import accountStatementReference from "./references/account-statement.json";

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
        const data = await sdk.accounting.accountStatment(
          account,
          start_date,
          end_date,
          symbol
        );

        const response = `API Response\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\`\n\nField Description\n\`\`\`json\n${JSON.stringify(accountStatementReference, null, 2)}\n\`\`\``;

        return {
          content: [{ type: "text", text: response }],
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
