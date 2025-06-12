import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { FugleApiProvider } from "../providers";
import { loadToolMetadata, createToolHandler } from "../../utils/index.js";
import path from "path";

/**
 * 註冊股票重大訊息查詢工具到 MCP Server
 * @param {McpServer} server MCP Server 實例
 * @param {FugleApiProvider} provider 股票 Fugle API 客戶端
 */
export function registerImportantNewsTool(
  server: McpServer,
  provider: FugleApiProvider
) {
  const currentDir = path.join(__dirname, '..');
  const { description } = loadToolMetadata(currentDir, 'get-important-news', '獲取股票重大訊息');
  
  server.tool(
    "get_important_news",
    description,
    {
      symbolId: z.string().describe("股票代碼"),
    },
    createToolHandler(
      currentDir,
      'get-important-news',
      async ({ symbolId }) => {
        const data = await provider.getImportantNews(symbolId);
        return { data };
      },
      {
        errorMessage: "查詢時發生錯誤",
      }
    )
  );
}
