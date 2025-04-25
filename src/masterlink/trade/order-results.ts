import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Account, MasterlinkSDK } from "masterlink-sdk";
import { z } from "zod";
import { QueryType } from "masterlink-sdk";
import orderResultsReference from "./references/get-order-results.json";

/**
 * 註冊查詢委託單相關的工具到 MCP Server
 * @param {Object} server MCP Server 實例
 * @param {Object} sdk MasterlinkSDK 實例
 * @param {Object} account 帳戶實例
 */
export function registerOrderResultTools(
  server: McpServer,
  sdk: MasterlinkSDK,
  account: Account
) {
  // 取得委託單結果工具
  server.tool(
    "get_order_results",
    "查詢委託單結果",
    {
      queryType: z
        .enum(["All", "Reservation", "RegularSession", "Cancelable", "Failed"])
        .describe(
          "盤別：All 全部、Reservation 預約單、RegularSession 盤中、Cancelable 可取消委託、Failed 失敗單"
        )
        .default("All")
        .optional(),
    },
    async ({ queryType }) => {
      try {
        // 處理 enum 轉換
        let queryTypeValue: QueryType;

        // 如果未提供 queryType，預設為 All
        if (!queryType) {
          queryTypeValue = QueryType.All;
        } else {
          switch (queryType) {
            case "All":
              queryTypeValue = QueryType.All;
              break;
            case "Reservation":
              queryTypeValue = QueryType.Reservation;
              break;
            case "RegularSession":
              queryTypeValue = QueryType.RegularSession;
              break;
            case "Cancelable":
              queryTypeValue = QueryType.Cancelable;
              break;
            case "Failed":
              queryTypeValue = QueryType.Failed;
              break;
            default:
              throw new Error(`不支援的查詢類型: ${queryType}`);
          }
        }

        // 呼叫 SDK 獲取委託單結果
        const data = await sdk.stock.getOrderResults(account, queryTypeValue);

        const response = `API Response\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\`\n\nField Description\n\`\`\`json\n${JSON.stringify(orderResultsReference, null, 2)}\n\`\`\``;

        return {
          content: [{ type: "text", text: response }],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `查詢委託單結果時發生錯誤: ${error || "未知錯誤"}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
