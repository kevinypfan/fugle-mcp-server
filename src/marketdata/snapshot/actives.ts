import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RestStockClient } from "masterlink-sdk/marketdata/rest/stock/client";
import { z } from "zod";
import { DateTime } from "luxon";

/**
 * 註冊股票成交量值排行查詢工具到 MCP Server
 * @param {McpServer} server MCP Server 實例
 * @param {RestStockClient} stock 股票 API 客戶端
 */
export function registerActivesTools(
  server: McpServer,
  stock: RestStockClient
) {
  // 取得股票成交量值排行工具
  server.tool(
    "get_stock_snapshot_actives",
    "取得股票成交量值排行（依市場別）",
    {
      market: z
        .enum(["TSE", "OTC", "ESB", "TIB", "PSB"])
        .describe(
          "市場別，可選 TSE 上市；OTC 上櫃；ESB 興櫃一般板；TIB 臺灣創新板；PSB 興櫃戰略新板"
        ),
      trade: z
        .enum(["volume", "value"])
        .describe("成交量／成交值，可選 volume 成交量；value 成交值"),
      type: z
        .enum(["COMMONSTOCK", "ALL", "ALLBUT0999"])
        .optional()
        .describe(
          "標的類型，可選 ALLBUT0999 包含一般股票、特別股及ETF；COMMONSTOCK 為一般股票；ALL 為全部"
        ),
      limit: z
        .number()
        .int()
        .positive()
        .max(50)
        .optional()
        .describe("限制回傳筆數，最多 50 筆"),
    },
    async ({ market, trade, type, limit = 20 }) => {
      try {
        // 透過API獲取股票成交量值排行
        const data = await stock.snapshot.actives({
          market,
          trade,
          type,
        });

        // 確保 data.data 是數組
        const actives = Array.isArray(data.data) ? data.data : [];

        if (actives.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: `未找到市場 ${market} 的股票${
                  trade === "volume" ? "成交量" : "成交值"
                }排行`,
              },
            ],
          };
        }

        // 限制回傳筆數
        const limitedActives = actives.slice(0, limit);

        // 構建回應內容
        let responseText = `【${market}】股票${
          trade === "volume" ? "成交量" : "成交值"
        }排行：\n\n`;

        // 添加日期和時間信息
        responseText += `日期：${data.date || "無日期資訊"}\n`;
        responseText += `時間：${data.time || "無時間資訊"}\n\n`;

        // 添加篩選條件信息
        if (type) {
          responseText += `標的類型：${type}\n\n`;
        }

        // 表格頭部
        if (trade === "volume") {
          responseText +=
            "代碼 | 名稱 | 收盤價 | 漲跌 | 漲跌幅(%) | 成交量(張) | 成交金額(元)\n";
        } else {
          responseText +=
            "代碼 | 名稱 | 收盤價 | 漲跌 | 漲跌幅(%) | 成交金額(元) | 成交量(張)\n";
        }
        responseText +=
          "-----|------|--------|------|-----------|--------------|-------------\n";

        // 表格內容
        limitedActives.forEach((active) => {
          // 格式化最後更新時間
          const lastUpdated = active.lastUpdated
            ? DateTime.fromMillis(
                Math.floor(active.lastUpdated / 1000)
              ).toFormat("HH:mm:ss")
            : "-";

          // 判斷漲跌顏色 (可以在文字前加上 `+` 或 `-` 符號)
          const changeSign =
            active.change > 0 ? "+" : active.change < 0 ? "" : "";
          const changePercentSign =
            active.changePercent > 0 ? "+" : active.changePercent < 0 ? "" : "";

          if (trade === "volume") {
            responseText += `${active.symbol} | ${active.name || "-"} | ${
              active.closePrice || "-"
            } | ${
              active.change !== undefined
                ? `${changeSign}${active.change}`
                : "-"
            } | ${
              active.changePercent !== undefined
                ? `${changePercentSign}${active.changePercent.toFixed(2)}`
                : "-"
            } | ${
              active.tradeVolume ? active.tradeVolume.toLocaleString() : "-"
            } | ${
              active.tradeValue ? active.tradeValue.toLocaleString() : "-"
            }\n`;
          } else {
            responseText += `${active.symbol} | ${active.name || "-"} | ${
              active.closePrice || "-"
            } | ${
              active.change !== undefined
                ? `${changeSign}${active.change}`
                : "-"
            } | ${
              active.changePercent !== undefined
                ? `${changePercentSign}${active.changePercent.toFixed(2)}`
                : "-"
            } | ${
              active.tradeValue ? active.tradeValue.toLocaleString() : "-"
            } | ${
              active.tradeVolume ? active.tradeVolume.toLocaleString() : "-"
            }\n`;
          }
        });

        // 添加統計信息
        if (limitedActives.length > 1) {
          responseText += "\n統計資訊：\n";

          // 計算總成交量和總成交值
          const totalVolume = limitedActives.reduce(
            (sum, active) => sum + (active.tradeVolume || 0),
            0
          );
          const totalValue = limitedActives.reduce(
            (sum, active) => sum + (active.tradeValue || 0),
            0
          );

          // 計算平均成交量和平均成交值
          const avgVolume = totalVolume / limitedActives.length;
          const avgValue = totalValue / limitedActives.length;

          if (trade === "volume") {
            responseText += `平均成交量：${avgVolume.toLocaleString()} 張\n`;
            responseText += `總成交量：${totalVolume.toLocaleString()} 張\n`;
            responseText += `總成交金額：${totalValue.toLocaleString()} 元\n`;

            // 計算最高和最低成交量
            const maxVolume = Math.max(
              ...limitedActives.map((active) => active.tradeVolume || 0)
            );
            const minVolume = Math.min(
              ...limitedActives
                .filter((active) => active.tradeVolume > 0)
                .map((active) => active.tradeVolume || 0)
            );
            responseText += `最高成交量：${maxVolume.toLocaleString()} 張\n`;
            responseText += `最低成交量：${minVolume.toLocaleString()} 張\n`;
          } else {
            responseText += `平均成交金額：${avgValue.toLocaleString()} 元\n`;
            responseText += `總成交金額：${totalValue.toLocaleString()} 元\n`;
            responseText += `總成交量：${totalVolume.toLocaleString()} 張\n`;

            // 計算最高和最低成交值
            const maxValue = Math.max(
              ...limitedActives.map((active) => active.tradeValue || 0)
            );
            const minValue = Math.min(
              ...limitedActives
                .filter((active) => active.tradeValue > 0)
                .map((active) => active.tradeValue || 0)
            );
            responseText += `最高成交金額：${maxValue.toLocaleString()} 元\n`;
            responseText += `最低成交金額：${minValue.toLocaleString()} 元\n`;
          }

          // 計算成交量前三名佔比
          if (limitedActives.length >= 3) {
            const top3Volume = limitedActives
              .slice(0, 3)
              .reduce((sum, active) => sum + (active.tradeVolume || 0), 0);
            const top3Value = limitedActives
              .slice(0, 3)
              .reduce((sum, active) => sum + (active.tradeValue || 0), 0);

            if (trade === "volume") {
              const top3VolumePercentage =
                totalVolume > 0 ? (top3Volume / totalVolume) * 100 : 0;
              responseText += `前三名成交量佔比：${top3VolumePercentage.toFixed(
                2
              )}%\n`;
            } else {
              const top3ValuePercentage =
                totalValue > 0 ? (top3Value / totalValue) * 100 : 0;
              responseText += `前三名成交金額佔比：${top3ValuePercentage.toFixed(
                2
              )}%\n`;
            }
          }
        }

        // 如果數據被截斷，添加提示
        if (actives.length > limit) {
          responseText += `\n僅顯示前 ${limit} 筆資料，共有 ${actives.length} 筆符合條件的資料。`;
        }

        return {
          content: [{ type: "text", text: responseText }],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `查詢市場 ${market} 股票${
                trade === "volume" ? "成交量" : "成交值"
              }排行時發生錯誤: ${error || "未知錯誤"}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
