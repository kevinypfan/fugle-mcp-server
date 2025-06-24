import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { FugleApiProvider } from "../providers";
import { loadToolMetadata, createToolHandler } from "../../utils/index.js";
import path from "path";

/**
 * 註冊股票漲跌幅排行查詢工具到 MCP Server
 * @param {McpServer} server MCP Server 實例
 * @param {FugleApiProvider} provider 股票 Fugle API 客戶端
 */
export function registerRecentPriceVolumeTool(
  server: McpServer,
  provider: FugleApiProvider
) {
  const currentDir = path.join(__dirname, '..');
  const { description } = loadToolMetadata(currentDir, 'get-recent-price-volume', '獲取股票近3日價量數據');
  
  server.tool(
    "get_recent_price_volume",
    description,
    {
      symbolId: z.string().describe("股票代碼"),
    },
    createToolHandler(
      currentDir,
      'get-recent-price-volume',
      async ({ symbolId }) => {
        const data = await provider.getRecentPriceVolume(symbolId);
        return { data };
      },
      {
        errorMessage: "查詢時發生錯誤",
      }
    )
  );
}
