import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RestStockClient } from "masterlink-sdk/marketdata/rest/stock/client";
import { z } from "zod";
import { DateTime } from "luxon";

/**
 * 註冊股票歷史K線查詢工具到 MCP Server
 * @param {McpServer} server MCP Server 實例
 * @param {RestStockClient} stock 股票 API 客戶端
 */
export function registerHistoricalCandlesTools(
  server: McpServer,
  stock: RestStockClient
) {
  // 取得股票歷史K線工具
  server.tool(
    "get_stock_historical_candles",
    "取得股票歷史K線（依代碼查詢）",
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
    async ({ symbol, from, to, timeframe = "D", fields, sort = "desc" }) => {
      try {
        // 檢查是否為分K但同時指定了日期範圍
        const isMinuteTimeframe = ["1", "5", "10", "15", "30", "60"].includes(
          timeframe
        );

        if (isMinuteTimeframe && (from || to)) {
          return {
            content: [
              {
                type: "text",
                text: "⚠️ 注意：分K目前無法指定開始日期與結束日期，一律回傳近五日資料。指定的日期範圍將被忽略。",
              },
            ],
          };
        }

        // 透過API獲取股票歷史K線
        const data = await stock.historical.candles({
          symbol,
          from,
          to,
          timeframe,
          fields,
          sort,
        });

        // 確保 data.data 是數組
        const candles = Array.isArray(data.data) ? data.data : [];

        if (candles.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: `未找到股票 ${symbol} 的歷史K線資料`,
              },
            ],
          };
        }

        // 構建回應內容
        let responseText = `【${symbol}】歷史${getTimeframeText(
          timeframe
        )}K線：\n\n`;

        // 添加股票信息
        responseText += `證券類型：${data.type || "無類型資訊"}\n`;
        responseText += `交易所：${data.exchange || "無交易所資訊"}\n`;
        responseText += `市場別：${data.market || "無市場別資訊"}\n\n`;

        // 添加查詢條件信息
        let queryInfo = [`K線週期：${getTimeframeText(timeframe)}`];

        if (from && to) {
          queryInfo.push(`日期範圍：${from} 至 ${to}`);
        } else if (from) {
          queryInfo.push(`開始日期：${from}`);
        } else if (to) {
          queryInfo.push(`結束日期：${to}`);
        } else if (!isMinuteTimeframe) {
          queryInfo.push("使用預設日期範圍");
        }

        if (fields) {
          queryInfo.push(`包含欄位：${fields}`);
        }

        queryInfo.push(
          `排序方式：${sort === "desc" ? "由新到舊" : "由舊到新"}`
        );

        responseText += `查詢條件：${queryInfo.join("、")}\n\n`;

        // 表格頭部
        responseText +=
          "日期 | 開盤價 | 最高價 | 最低價 | 收盤價 | 漲跌 | 成交量 | 成交金額\n";
        responseText +=
          "-----|--------|--------|--------|--------|------|--------|----------\n";

        // 表格內容
        candles.forEach((candle) => {
          const change =
            candle.change !== undefined
              ? candle.change > 0
                ? `+${candle.change}`
                : candle.change
              : "-";
          const volume = candle.volume
            ? Math.round(candle.volume / 1000).toLocaleString()
            : "-"; // 轉換為張
          const turnover = candle.turnover
            ? candle.turnover.toLocaleString()
            : "-";

          responseText += `${candle.date} | ${candle.open || "-"} | ${
            candle.high || "-"
          } | ${candle.low || "-"} | ${
            candle.close || "-"
          } | ${change} | ${volume} | ${turnover}\n`;
        });

        // 添加統計信息
        if (candles.length > 1) {
          responseText += "\n統計資訊：\n";

          // 日期範圍
          const dateRange = {
            start: candles[sort === "asc" ? 0 : candles.length - 1].date,
            end: candles[sort === "asc" ? candles.length - 1 : 0].date,
          };
          responseText += `資料期間：${dateRange.start} 至 ${dateRange.end}\n`;

          // 計算價格變化
          const firstCandle = candles[sort === "asc" ? 0 : candles.length - 1];
          const lastCandle = candles[sort === "asc" ? candles.length - 1 : 0];

          if (firstCandle.close && lastCandle.close) {
            const priceChange = lastCandle.close - firstCandle.close;
            const priceChangePercent = (priceChange / firstCandle.close) * 100;

            responseText += `總漲跌：${
              priceChange > 0 ? "+" : ""
            }${priceChange.toFixed(2)} (${
              priceChangePercent > 0 ? "+" : ""
            }${priceChangePercent.toFixed(2)}%)\n`;
          }

          // 計算最高和最低價格
          const highPrices = candles
            .map((candle) => candle.high)
            .filter((price) => price !== undefined);
          const lowPrices = candles
            .map((candle) => candle.low)
            .filter((price) => price !== undefined);

          if (highPrices.length > 0 && lowPrices.length > 0) {
            const highestPrice = Math.max(...highPrices);
            const lowestPrice = Math.min(...lowPrices);

            responseText += `最高價：${highestPrice}（區間內）\n`;
            responseText += `最低價：${lowestPrice}（區間內）\n`;
          }

          // 計算平均成交量
          const volumes = candles
            .map((candle) => candle.volume)
            .filter((volume) => volume !== undefined);
          if (volumes.length > 0) {
            const averageVolume =
              volumes.reduce((sum, volume) => sum + volume, 0) / volumes.length;
            responseText += `平均成交量：${Math.round(
              averageVolume / 1000
            ).toLocaleString()} 張\n`;
          }

          // 計算漲跌天數
          const changes = candles
            .map((candle) => candle.change)
            .filter((change) => change !== undefined);
          if (changes.length > 0) {
            const upDays = changes.filter((change) => change > 0).length;
            const downDays = changes.filter((change) => change < 0).length;
            const flatDays = changes.filter((change) => change === 0).length;

            responseText += `上漲${getTimeframeUnit(timeframe)}數：${upDays}\n`;
            responseText += `下跌${getTimeframeUnit(
              timeframe
            )}數：${downDays}\n`;
            if (flatDays > 0) {
              responseText += `平盤${getTimeframeUnit(
                timeframe
              )}數：${flatDays}\n`;
            }

            // 最大單日漲幅和跌幅
            if (changes.length > 0) {
              const maxUp = Math.max(...changes);
              const maxDown = Math.min(...changes);

              if (maxUp > 0) {
                responseText += `最大單${getTimeframeUnit(
                  timeframe
                )}漲幅：+${maxUp}\n`;
              }

              if (maxDown < 0) {
                responseText += `最大單${getTimeframeUnit(
                  timeframe
                )}跌幅：${maxDown}\n`;
              }
            }
          }
        }

        // 如果是分K，添加提示
        if (isMinuteTimeframe) {
          responseText += "\n⚠️ 注意：分K資料僅顯示近五個交易日的資料。";
        } else {
          // 提醒資料可回溯範圍
          const isIndex = symbol.startsWith("t") || symbol.startsWith("IX");
          if (isIndex) {
            responseText += "\n⚠️ 注意：指數歷史資料最遠可回溯至 2015 年。";
          } else {
            responseText += "\n⚠️ 注意：個股歷史資料最遠可回溯至 2010 年。";
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
              text: `查詢股票 ${symbol} 歷史K線時發生錯誤: ${
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

/**
 * 取得K線週期的中文說明
 * @param {string} timeframe K線週期代碼
 * @returns {string} K線週期中文說明
 */
function getTimeframeText(timeframe: string): string {
  const timeframeMap: Record<string, string> = {
    "1": "1分",
    "5": "5分",
    "10": "10分",
    "15": "15分",
    "30": "30分",
    "60": "60分",
    D: "日",
    W: "週",
    M: "月",
  };

  return timeframeMap[timeframe] || timeframe;
}

/**
 * 取得K線週期的計量單位
 * @param {string} timeframe K線週期代碼
 * @returns {string} K線週期計量單位
 */
function getTimeframeUnit(timeframe: string): string {
  if (["D", "1", "5", "10", "15", "30", "60"].includes(timeframe)) {
    return "日";
  } else if (timeframe === "W") {
    return "週";
  } else if (timeframe === "M") {
    return "月";
  }

  return "次";
}
