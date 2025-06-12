import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StockClientInterface } from "../types";
import { z } from "zod";
import { loadToolMetadata, createToolHandler } from "../../utils/index.js";

/**
 * 註冊股票報價相關的工具到 MCP Server
 * @param {McpServer} server MCP Server 實例
 * @param {StockClientInterface} stock 股票 API 客戶端
 */
export function registerQuoteTools(server: McpServer, stock: StockClientInterface) {
  const currentDir = __dirname;
  const { description } = loadToolMetadata(currentDir, 'quote', '取得股票即時報價');
  
  // 取得即時報價工具
  server.tool(
    "get_stock_intraday_quote",
    description,
    {
      symbol: z.string().describe("股票代碼，例如：2330"),
      type: z.string().optional().describe("類型，可選 oddlot 盤中零股"),
    },
    createToolHandler(
      currentDir,
      'quote',
      async ({ symbol, type }) => {
        // 透過API獲取股票資訊
        return await stock.intraday.quote({
          symbol,
          type: type === "oddlot" ? "oddlot" : undefined,
        });
      },
      {
        errorMessage: "查詢股票即時報價時發生錯誤"
      }
    )
  );
}