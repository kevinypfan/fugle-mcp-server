import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RestStockClient } from "masterlink-sdk/marketdata/rest/stock/client";
import { z } from "zod";
import { DateTime } from "luxon";

/**
 * 註冊股票漲跌幅排行查詢工具到 MCP Server
 * @param {McpServer} server MCP Server 實例
 * @param {RestStockClient} stock 股票 API 客戶端
 */
export function registerMoversTools(server: McpServer, stock: RestStockClient) {
  // 取得股票漲跌幅排行工具
  server.tool(
    "get_stock_snapshot_movers",
    "取得股票漲跌幅排行（依市場別）",
    {
      market: z
        .enum(["TSE", "OTC", "ESB", "TIB", "PSB"])
        .describe("市場別，可選 TSE, OTC, ESB, TIB, PSB"),
      direction: z
        .enum(["up", "down"])
        .describe("上漲／下跌，可選 up 上漲；down 下跌"),
      change: z
        .enum(["percent", "value"])
        .describe("漲跌／漲跌幅，可選 percent 漲跌幅；value 漲跌"),
      gt: z.number().optional().describe("篩選大於漲跌／漲跌幅的股票"),
      type: z
        .enum(["COMMONSTOCK", "ALL", "ALLBUT0999"])
        .optional()
        .describe(
          "標的類型，可選 ALLBUT0999 包含一般股票、特別股及ETF ； COMMONSTOCK 為一般股票；ALL 為全部"
        ),
      gte: z.number().optional().describe("篩選大於或等於漲跌／漲跌幅的股票"),
      lt: z.number().optional().describe("篩選小於漲跌／漲跌幅的股票"),
      lte: z.number().optional().describe("篩選小於或等於漲跌／漲跌幅的股票"),
      eq: z.number().optional().describe("篩選等於漲跌／漲跌幅的股票"),
      limit: z
        .number()
        .int()
        .positive()
        .max(50)
        .optional()
        .describe("限制回傳筆數，最多 50 筆"),
    },
    async ({
      market,
      direction,
      change,
      gt,
      type,
      gte,
      lt,
      lte,
      eq,
      limit = 20,
    }) => {
      try {
        // 透過API獲取股票漲跌幅排行
        const data = await stock.snapshot.movers({
          market,
          direction,
          change,
          gt,
          type,
          gte,
          lt,
          lte,
          eq,
        });

        // 確保 data.data 是數組
        const movers = Array.isArray(data.data) ? data.data : [];

        if (movers.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: `未找到市場 ${market} 的股票漲跌幅排行`,
              },
            ],
          };
        }

        // 限制回傳筆數
        const limitedMovers = movers.slice(0, limit);

        // 構建回應內容
        let responseText = `【${market}】股票${
          direction === "up" ? "上漲" : "下跌"
        }${change === "percent" ? "漲跌幅" : "漲跌值"}排行：\n\n`;

        // 添加日期和時間信息
        responseText += `日期：${data.date || "無日期資訊"}\n`;
        responseText += `時間：${data.time || "無時間資訊"}\n\n`;

        // 添加篩選條件信息
        let filterInfo = [];
        if (gt !== undefined) filterInfo.push(`大於 ${gt}`);
        if (gte !== undefined) filterInfo.push(`大於等於 ${gte}`);
        if (lt !== undefined) filterInfo.push(`小於 ${lt}`);
        if (lte !== undefined) filterInfo.push(`小於等於 ${lte}`);
        if (eq !== undefined) filterInfo.push(`等於 ${eq}`);
        if (type !== undefined) filterInfo.push(`類型為 ${type}`);

        if (filterInfo.length > 0) {
          responseText += `篩選條件：${filterInfo.join(", ")}\n\n`;
        }

        // 表格頭部
        responseText +=
          "代碼 | 名稱 | 收盤價 | 漲跌 | 漲跌幅(%) | 成交量(張) | 成交金額(元)\n";
        responseText +=
          "-----|------|--------|------|-----------|------------|-------------\n";

        // 表格內容
        limitedMovers.forEach((mover) => {
          // 格式化最後更新時間
          const lastUpdated = mover.lastUpdated
            ? DateTime.fromMillis(
                Math.floor(mover.lastUpdated / 1000)
              ).toFormat("HH:mm:ss")
            : "-";

          responseText += `${mover.symbol} | ${mover.name || "-"} | ${
            mover.closePrice || "-"
          } | ${
            mover.change !== undefined
              ? mover.change > 0
                ? `+${mover.change}`
                : mover.change
              : "-"
          } | ${
            mover.changePercent !== undefined
              ? mover.changePercent > 0
                ? `+${mover.changePercent.toFixed(2)}`
                : mover.changePercent.toFixed(2)
              : "-"
          } | ${
            mover.tradeVolume ? mover.tradeVolume.toLocaleString() : "-"
          } | ${mover.tradeValue ? mover.tradeValue.toLocaleString() : "-"}\n`;
        });

        // 添加統計信息
        if (limitedMovers.length > 1) {
          responseText += "\n統計資訊：\n";

          // 計算平均漲跌幅
          const avgChangePercent =
            limitedMovers.reduce(
              (sum, mover) => sum + (mover.changePercent || 0),
              0
            ) / limitedMovers.length;
          responseText += `平均${
            direction === "up" ? "上漲" : "下跌"
          }幅度：${Math.abs(avgChangePercent).toFixed(2)}%\n`;

          // 計算最大和最小漲跌幅
          const changePercentValues = limitedMovers
            .map((mover) => mover.changePercent || 0)
            .filter((value) => value !== 0);

          if (changePercentValues.length > 0) {
            const maxChangePercent = Math.max(...changePercentValues);
            const minChangePercent = Math.min(...changePercentValues);
            responseText += `最大${direction === "up" ? "上漲" : "下跌"}幅度：${
              direction === "up"
                ? maxChangePercent.toFixed(2)
                : Math.abs(minChangePercent).toFixed(2)
            }%\n`;
            responseText += `最小${direction === "up" ? "上漲" : "下跌"}幅度：${
              direction === "up"
                ? minChangePercent.toFixed(2)
                : Math.abs(maxChangePercent).toFixed(2)
            }%\n`;
          }

          // 計算總成交量和總成交金額
          const totalVolume = limitedMovers.reduce(
            (sum, mover) => sum + (mover.tradeVolume || 0),
            0
          );
          const totalValue = limitedMovers.reduce(
            (sum, mover) => sum + (mover.tradeValue || 0),
            0
          );
          responseText += `總成交量：${totalVolume.toLocaleString()} 張\n`;
          responseText += `總成交金額：${totalValue.toLocaleString()} 元\n`;
        }

        // 如果數據被截斷，添加提示
        if (movers.length > limit) {
          responseText += `\n僅顯示前 ${limit} 筆資料，共有 ${movers.length} 筆符合條件的資料。`;
        }

        return {
          content: [{ type: "text", text: responseText }],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `查詢市場 ${market} 股票漲跌幅排行時發生錯誤: ${
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
