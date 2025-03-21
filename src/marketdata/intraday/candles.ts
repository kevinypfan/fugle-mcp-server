import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RestStockClient } from "masterlink-sdk/marketdata/rest/stock/client";
import { z } from "zod";
import { DateTime } from "luxon";

/**
 * 註冊股票K線資料相關的工具到 MCP Server
 * @param {McpServer} server MCP Server 實例
 * @param {RestStockClient} stock 股票 API 客戶端
 */
export function registerCandlesTools(
  server: McpServer,
  stock: RestStockClient
) {
  server.tool(
    "get_stock_intraday_candles",
    "取得當日股票K線資料",
    {
      symbol: z.string().describe("股票代碼，例如：2330"),
    },
    async ({ symbol }) => {
      try {
        // 透過API獲取K線數據
        const data = await stock.intraday.candles({ symbol });

        const candles = data.data;

        if (candles.length === 0) {
          return {
            content: [{ type: "text", text: `無法獲取 ${symbol} 的K線數據` }],
            isError: true,
          };
        }

        let responseText = `【${symbol}】近期K線數據：\n\n`;
        responseText +=
          "日期時間 | 開盤價 | 最高價 | 最低價 | 收盤價 | 成交量\n";
        responseText += "-------|-------|-------|-------|-------|-------\n";

        candles.forEach((candle) => {
          responseText += `${candle.date} | ${candle.open} | ${candle.high} | ${candle.low} | ${candle.close} | ${candle.volume}\n`;
        });

        return {
          content: [{ type: "text", text: responseText }],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `查詢股票 ${symbol} K線資料時發生錯誤: ${
                error || "未知錯誤"
              }`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
