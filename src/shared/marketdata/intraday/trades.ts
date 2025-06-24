import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StockClientInterface } from "../types";
import { z } from "zod";
import { loadToolMetadata, createToolHandler } from "../../utils/index.js";

/**
 * 註冊股票成交明細查詢工具到 MCP Server
 * @param {McpServer} server MCP Server 實例
 * @param {StockClientInterface} stock 股票 API 客戶端
 */
export function registerTradesTools(server: McpServer, stock: StockClientInterface) {
  const currentDir = __dirname;
  const { description } = loadToolMetadata(currentDir, 'trades', '取得股票成交明細（依代碼查詢）');
  
  // 取得股票成交明細工具
  server.tool(
    "get_stock_intraday_trades",
    description,
    {
      symbol: z.string().describe("股票代碼，例如：2330"),
      type: z
        .literal("oddlot")
        .optional()
        .describe("Ticker 類型，可選 oddlot 盤中零股"),
      limit: z
        .number()
        .int()
        .positive()
        .max(100)
        .optional()
        .describe("限制回傳筆數，預設 50 筆，最多 100 筆"),
      offset: z
        .number()
        .int()
        .min(0)
        .optional()
        .describe("偏移量，用於分頁查詢"),
    },
    createToolHandler(
      currentDir,
      'trades',
      async ({ symbol, type, limit = 50, offset }) => {
        // 透過API獲取股票成交明細
        return await stock.intraday.trades({
          symbol,
          type: type === "oddlot" ? "oddlot" : undefined,
          limit,
          offset,
        });
      },
      {
        errorMessage: "查詢股票成交明細時發生錯誤"
      }
    )
  );
}