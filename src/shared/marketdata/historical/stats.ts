import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StockClientInterface } from "../types";
import { z } from "zod";
import { loadToolMetadata, createToolHandler } from "../../utils/index.js";

/**
 * 註冊股票近 52 週股價數據查詢工具到 MCP Server
 * @param {McpServer} server MCP Server 實例
 * @param {StockClientInterface} stock 股票 API 客戶端
 */
export function registerHistoricalStatsTools(
  server: McpServer,
  stock: StockClientInterface
) {
  const currentDir = __dirname;
  const { description } = loadToolMetadata(currentDir, 'stats', '取得近 52 週股價數據（依代碼查詢）');
  
  // 取得股票近 52 週股價數據工具
  server.tool(
    "get_stock_historical_stats",
    description,
    {
      symbol: z.string().describe("股票代碼，例如：2330"),
    },
    createToolHandler(
      currentDir,
      'stats',
      async ({ symbol }) => {
        // 透過API獲取股票近 52 週股價數據
        return await stock.historical.stats({
          symbol,
        });
      },
      {
        errorMessage: "查詢股票近 52 週股價數據時發生錯誤"
      }
    )
  );
}
