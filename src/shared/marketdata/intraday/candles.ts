import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StockClientInterface } from "../types";
import { z } from "zod";
import candlesReference from "./references/candles.json";

/**
 * 註冊股票K線資料相關的工具到 MCP Server
 * @param {McpServer} server MCP Server 實例
 * @param {StockClientInterface} stock 股票 API 客戶端
 */
export function registerCandlesTools(server: McpServer, stock: StockClientInterface) {
  server.tool(
    "get_stock_intraday_candles",
    "取得當日股票K線資料",
    {
      symbol: z.string().describe("股票代碼，例如：2330"),
      type: z.literal("oddlot").optional().describe("Ticker 類型，可選 oddlot 盤中零股"),
      timeframe: z
        .enum(["1", "5", "10", "15", "30", "60"])
        .optional()
        .describe("K線週期，可選 1 1分K；5 5分K；10 10分K；15 15分K；30 30分K；60 60分K")
    },
    async ({ symbol, type, timeframe = "1" }) => {
      try {
        // 透過API獲取K線數據
        // 支援同時使用 timeframe 或 resolution 參數
        const data = await stock.intraday.candles({
          symbol,
          type,
          timeframe,
          resolution: timeframe // 為了向後兼容，同時傳遞 resolution 和 timeframe
        });

        const response = `API Response\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\`\n\nField Description\n\`\`\`json\n${JSON.stringify(candlesReference, null, 2)}\n\`\`\``;

        return {
          content: [{ type: "text", text: response }],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `查詢股票 ${symbol} K線資料時發生錯誤: ${error || "未知錯誤"}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}