import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StockClientInterface } from "../types";
import { z } from "zod";
import { loadToolMetadata, createToolHandler } from "../../utils/index.js";

/**
 * 註冊股票分價量表查詢工具到 MCP Server
 * @param {McpServer} server MCP Server 實例
 * @param {StockClientInterface} stock 股票 API 客戶端
 */
export function registerVolumesTools(server: McpServer, stock: StockClientInterface) {
  const currentDir = __dirname;
  const { description } = loadToolMetadata(currentDir, 'volumes', '取得股票分價量表（依代碼查詢）');
  
  // 取得股票分價量表工具
  server.tool(
    "get_stock_intraday_volumes",
    description,
    {
      symbol: z.string().describe("股票代碼，例如：2330"),
      type: z
        .literal("oddlot")
        .optional()
        .describe("Ticker 類型，可選 oddlot 盤中零股"),
    },
    createToolHandler(
      currentDir,
      'volumes',
      async ({ symbol, type }) => {
        // 透過API獲取股票分價量表
        return await stock.intraday.volumes({
          symbol,
          type: type === "oddlot" ? "oddlot" : undefined,
        });
      },
      {
        errorMessage: "查詢股票分價量表時發生錯誤"
      }
    )
  );
}