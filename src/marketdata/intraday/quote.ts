import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RestStockClient } from "masterlink-sdk/marketdata/rest/stock/client";
import { z } from "zod";

/**
 * 註冊股票報價相關的工具到 MCP Server
 * @param {Object} server MCP Server 實例
 * @param {Object} stock 股票 API 客戶端
 */
export function registerQuoteTools(server: McpServer, stock: RestStockClient) {
  // 取得即時報價工具
  server.tool(
    "get_stock_intraday_quote",
    "取得股票即時報價",
    {
      symbol: z.string().describe("股票代碼，例如：2330"),
      type: z.string().optional().describe("類型，可選 oddlot 盤中零股"),
    },
    async ({ symbol, type }) => {
      try {
        // 透過API獲取股票資訊
        const data = await stock.intraday.quote({
          symbol,
          type: type === "oddlot" ? "oddlot" : undefined,
        });

        // 計算漲跌幅百分比，格式化為小數點後2位
        const changePercent = data.changePercent
          ? data.changePercent.toFixed(2) + "%"
          : "無漲跌幅資料";

        // 判斷漲跌顏色
        const priceColor =
          data.change > 0 ? "紅色" : data.change < 0 ? "綠色" : "黑色";

        // 格式化回應內容
        let responseText = `
【${data.symbol} ${data.name}】即時報價：
價格: ${data.closePrice} (${
          data.change >= 0 ? "+" + data.change : data.change
        }, ${changePercent})
開盤: ${data.openPrice} | 最高: ${data.highPrice} | 最低: ${data.lowPrice}
成交量: ${data.total?.tradeVolume?.toLocaleString() || "無資料"} 張
時間: ${new Date(data.lastUpdated / 1000).toLocaleTimeString("zh-TW")}
        `;

        // 如果有五檔資料，則加入
        if (
          data.bids &&
          data.bids.length > 0 &&
          data.asks &&
          data.asks.length > 0
        ) {
          responseText += "\n買賣五檔：\n";

          // 取得最多5檔
          const maxPrices = Math.min(
            5,
            Math.max(data.bids.length, data.asks.length)
          );

          for (let i = 0; i < maxPrices; i++) {
            const bid = data.bids[i]
              ? `${data.bids[i].price}(${data.bids[i].size})`
              : "無";
            const ask = data.asks[i]
              ? `${data.asks[i].price}(${data.asks[i].size})`
              : "無";
            responseText += `買${i + 1}: ${bid} | 賣${i + 1}: ${ask}\n`;
          }
        }

        // 加入市場狀態
        if (data.isClose) {
          responseText += "\n市場狀態: 已收盤";
        } else if (data.isOpen) {
          responseText += "\n市場狀態: 交易中";
        } else if (data.isTrial) {
          responseText += "\n市場狀態: 試撮中";
        }

        return {
          content: [{ type: "text", text: responseText }],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `查詢股票 ${symbol} 資訊時發生錯誤: ${error || "未知錯誤"}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
