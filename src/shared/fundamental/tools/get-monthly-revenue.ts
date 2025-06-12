import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { FugleApiProvider } from "../providers";
import { loadToolMetadata, createToolHandler } from "../../utils/index.js";
import path from "path";

/**
 * 註冊公司近5年月營收查詢工具到 MCP Server
 * @param {McpServer} server MCP Server 實例
 * @param {FugleApiProvider} provider 股票 Fugle API 客戶端
 */
export function registerMonthlyRevenueTool(
  server: McpServer,
  provider: FugleApiProvider
) {
  const currentDir = path.join(__dirname, '..');
  const { description } = loadToolMetadata(currentDir, 'get-monthly-revenue', '獲取公司近5年月營收');
  
  server.tool(
    "get_monthly_revenue",
    description,
    {
      symbolId: z.string().describe("股票代碼"),
    },
    createToolHandler(
      currentDir,
      'get-monthly-revenue',
      async ({ symbolId }) => {
        const data = await provider.getMonthlyRevenue(symbolId);
        return { data };
      },
      {
        errorMessage: "查詢時發生錯誤",
      }
    )
  );
}
