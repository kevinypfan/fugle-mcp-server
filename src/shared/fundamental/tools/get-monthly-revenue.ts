import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { FugleApiProvider } from "../providers";

/**
 * 註冊公司近5年月營收查詢工具到 MCP Server
 * @param {McpServer} server MCP Server 實例
 * @param {FugleApiProvider} provider 股票 Fugle API 客戶端
 */
export function registerMonthlyRevenueTool(
  server: McpServer,
  provider: FugleApiProvider
) {
  // 取得公司近5年月營收工具
  server.tool(
    "get_monthly_revenue",
    "獲取公司近5年月營收",
    {
      symbolId: z.string().describe("股票代碼"),
    },
    async ({ symbolId }) => {
      try {
        const data = await provider.getMonthlyRevenue(symbolId);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ data }),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `查詢時發生錯誤: ${error || "未知錯誤"}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
