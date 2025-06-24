import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { FugleApiProvider } from "../providers";
import { loadToolMetadata, createToolHandler } from "../../utils/index.js";
import path from "path";

/**
 * 註冊股票近10年股利資料查詢工具到 MCP Server
 * @param {McpServer} server MCP Server 實例
 * @param {FugleApiProvider} provider 股票 Fugle API 客戶端
 */
export function registerLast10YearsDividendsTool(
  server: McpServer,
  provider: FugleApiProvider
) {
  const currentDir = path.join(__dirname, '..');
  const { description } = loadToolMetadata(currentDir, 'get-last-10-years-dividends', '獲取股票近10年股利資料');
  
  server.tool(
    "get_last_10_years_dividends",
    description,
    {
      symbolId: z.string().describe("股票代碼"),
    },
    createToolHandler(
      currentDir,
      'get-last-10-years-dividends',
      async ({ symbolId }) => {
        const data = await provider.getLast10YearsDividends(symbolId);
        return { data };
      },
      {
        errorMessage: "查詢時發生錯誤",
      }
    )
  );
}
