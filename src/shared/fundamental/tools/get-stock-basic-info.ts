import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { FugleApiProvider } from "../providers";
import { loadToolMetadata, createToolHandler } from "../../utils/index.js";
import path from "path";

/**
 * 註冊股票基本資料查詢工具到 MCP Server
 * @param {McpServer} server MCP Server 實例
 * @param {FugleApiProvider} provider 股票 Fugle API 客戶端
 */
export function registerStockBasicInfoTool(
  server: McpServer,
  provider: FugleApiProvider
) {
  const currentDir = path.join(__dirname, '..');
  const { description } = loadToolMetadata(currentDir, 'get-stock-basic-info', '獲取股票基本資料');
  
  server.tool(
    "get_stock_basic_info",
    description,
    {
      symbolId: z.string().describe("股票代碼"),
    },
    createToolHandler(
      currentDir,
      'get-stock-basic-info',
      async ({ symbolId }) => {
        const data = await provider.getStockBasicInfo(symbolId);
        return { data };
      },
      {
        errorMessage: "查詢時發生錯誤",
      }
    )
  );
}
