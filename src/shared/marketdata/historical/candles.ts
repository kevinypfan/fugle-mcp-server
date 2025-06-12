import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StockClientInterface } from "../types";
import { z } from "zod";
import { loadToolMetadata, createToolHandler } from "../../utils/index.js";
import path from "path";

/**
 * 註冊股票歷史K線查詢工具到 MCP Server
 * @param {McpServer} server MCP Server 實例
 * @param {StockClientInterface} stock 股票 API 客戶端
 */
export function registerHistoricalCandlesTools(
  server: McpServer,
  stock: StockClientInterface
) {
  const currentDir = __dirname;
  const { description } = loadToolMetadata(currentDir, 'candles', '取得股票歷史K線（依代碼查詢）');
  
  // 取得股票歷史K線工具
  server.tool(
    "get_stock_historical_candles",
    description,
    {
      symbol: z.string().describe("股票代碼，例如：2330"),
      from: z.string().optional().describe("開始日期（格式：yyyy-MM-dd）"),
      to: z.string().optional().describe("結束日期（格式：yyyy-MM-dd）"),
      timeframe: z
        .enum(["1", "5", "10", "15", "30", "60", "D", "W", "M"])
        .optional()
        .describe(
          "K線週期，可選 1 1分K；5 5分K；10 10分K；15 15分K；30 30分K；60 60分K；D 日K；W 週K；M 月K"
        ),
      fields: z
        .string()
        .optional()
        .describe("欄位，可選：open,high,low,close,volume,turnover,change"),
      sort: z
        .enum(["asc", "desc"])
        .optional()
        .describe("時間排序，預設為 desc 降冪；可選 asc 升冪"),
    },
    createToolHandler(
      currentDir,
      'candles',
      async ({ symbol, from, to, timeframe = "D", fields, sort = "desc" }) => {
        // 檢查是否為分K但同時指定了日期範圍
        const isMinuteTimeframe = ["1", "5", "10", "15", "30", "60"].includes(
          timeframe
        );

        if (isMinuteTimeframe && (from || to)) {
          throw new Error("⚠️ 注意：分K目前無法指定開始日期與結束日期，一律回傳近五日資料。指定的日期範圍將被忽略。");
        }

        // 透過API獲取股票歷史K線
        return await stock.historical.candles({
          symbol,
          from,
          to,
          timeframe,
          fields,
          sort,
        });
      },
      {
        errorMessage: `查詢股票歷史K線時發生錯誤`
      }
    )
  );
}