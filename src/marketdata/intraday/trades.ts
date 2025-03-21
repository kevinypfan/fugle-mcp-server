import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RestStockClient } from "masterlink-sdk/marketdata/rest/stock/client";
import { z } from "zod";
import { DateTime } from "luxon";

/**
 * 註冊股票成交明細查詢工具到 MCP Server
 * @param {McpServer} server MCP Server 實例
 * @param {RestStockClient} stock 股票 API 客戶端
 */
export function registerTradesTools(server: McpServer, stock: RestStockClient) {
  // 取得股票成交明細工具
  server.tool(
    "get_stock_intraday_trades",
    "取得股票成交明細（依代碼查詢）",
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
    async ({ symbol, type, limit = 50, offset }) => {
      try {
        // 透過API獲取股票成交明細
        const data = await stock.intraday.trades({
          symbol,
          type: type === "oddlot" ? "oddlot" : undefined,
          limit,
          offset,
        });

        // 確保 data.data 是數組
        const trades = Array.isArray(data.data) ? data.data : [];

        if (trades.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: `未找到股票 ${symbol} ${
                  type === "oddlot" ? "(盤中零股)" : ""
                } 的成交明細`,
              },
            ],
          };
        }

        // 構建回應內容
        let responseText = `【${symbol}】成交明細：\n\n`;

        // 添加交易日期和類型資訊
        responseText += `日期：${data.date || "無日期資訊"}\n`;
        responseText += `交易所：${data.exchange || "無交易所資訊"} `;
        responseText += `市場別：${data.market || "無市場別資訊"}\n\n`;

        // 表格頭部
        responseText += "時間 | 價格 | 數量 | 內外盤 | 成交值(元)\n";
        responseText += "-----|------|------|--------|------------\n";

        // 表格內容
        trades.forEach((trade) => {
          // 格式化時間，將 timestamp 轉換為時間格式
          const tradeTime = DateTime.fromMillis(trade.time / 1000).toISO();

          // 判斷內外盤 (如果有買賣價資訊)
          let tradeType = "-";
          if (trade.bid && trade.ask) {
            if (trade.price <= trade.bid) {
              tradeType = "內盤"; // 賣方主動成交 (壓價)
            } else if (trade.price >= trade.ask) {
              tradeType = "外盤"; // 買方主動成交 (搶價)
            }
          }

          // 計算成交值
          const tradeValue = trade.price * trade.size * 1000; // 假設 1 張 = 1000 股

          responseText += `${tradeTime} | ${
            trade.price
          } | ${trade.size.toLocaleString()} | ${tradeType} | ${tradeValue.toLocaleString()}\n`;
        });

        // 添加統計資訊
        if (trades.length > 1) {
          responseText += "\n統計資訊：\n";

          // 計算平均價格
          const avgPrice =
            trades.reduce((sum, trade) => sum + trade.price, 0) / trades.length;
          responseText += `平均價格：${avgPrice.toFixed(2)}\n`;

          // 計算最高和最低價格
          const highPrice = Math.max(...trades.map((trade) => trade.price));
          const lowPrice = Math.min(...trades.map((trade) => trade.price));
          responseText += `最高價格：${highPrice} | 最低價格：${lowPrice}\n`;

          // 計算總成交量
          const totalSize = trades.reduce((sum, trade) => sum + trade.size, 0);
          responseText += `總成交量：${totalSize.toLocaleString()} 張\n`;

          // 計算總成交值
          const totalValue = trades.reduce(
            (sum, trade) => sum + trade.price * trade.size * 1000,
            0
          );
          responseText += `總成交值：${totalValue.toLocaleString()} 元\n`;

          // 計算內外盤比例 (如果資料中有買賣價)
          const hasBidAsk = trades.some((trade) => trade.bid && trade.ask);
          if (hasBidAsk) {
            const bidVolume = trades.reduce(
              (sum, trade) =>
                sum + (trade.bid && trade.price <= trade.bid ? trade.size : 0),
              0
            );
            const askVolume = trades.reduce(
              (sum, trade) =>
                sum + (trade.ask && trade.price >= trade.ask ? trade.size : 0),
              0
            );

            const bidPercentage =
              totalSize > 0 ? ((bidVolume / totalSize) * 100).toFixed(2) : 0;
            const askPercentage =
              totalSize > 0 ? ((askVolume / totalSize) * 100).toFixed(2) : 0;

            responseText += `內盤比例：${bidPercentage}% | 外盤比例：${askPercentage}%\n`;
          }
        }

        // 分頁信息 (如果有)
        if (offset !== undefined) {
          responseText += `\n顯示第 ${offset + 1} 至 ${
            offset + trades.length
          } 筆資料`;

          // 提供下一頁提示 (如果數據量達到了limit)
          if (trades.length === limit) {
            const nextOffset = offset + limit;
            responseText += `\n要查看更多資料，請使用 offset=${nextOffset}`;
          }
        }

        return {
          content: [{ type: "text", text: responseText }],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `查詢股票 ${symbol} 成交明細時發生錯誤: ${
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
