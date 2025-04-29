import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { FugleApiProvider } from "../providers";

/**
 * 註冊股票基本資料查詢工具到 MCP Server
 * @param {McpServer} server MCP Server 實例
 * @param {FugleApiProvider} provider 股票 Fugle API 客戶端
 */
export function registerStockBasicInfoTool(
  server: McpServer,
  provider: FugleApiProvider
) {
  // 取得股票基本資料工具
  server.tool(
    "get_stock_basic_info",
    "獲取股票基本資料",
    {
      symbolId: z.string().describe("股票代碼"),
    },
    async ({ symbolId }) => {
      try {
        const data = await provider.getStockBasicInfo(symbolId);
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
