import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RestStockClient } from "masterlink-sdk/marketdata/rest/stock/client";
import { z } from "zod";

/**
 * 註冊股票分價量表查詢工具到 MCP Server
 * @param {McpServer} server MCP Server 實例
 * @param {RestStockClient} stock 股票 API 客戶端
 */
export function registerVolumesTools(
  server: McpServer,
  stock: RestStockClient
) {
  // 取得股票分價量表工具
  server.tool(
    "get_stock_intraday_volumes",
    "取得股票分價量表（依代碼查詢）",
    {
      symbol: z.string().describe("股票代碼，例如：2330"),
      type: z
        .literal("oddlot")
        .optional()
        .describe("Ticker 類型，可選 oddlot 盤中零股"),
    },
    async ({ symbol, type }) => {
      try {
        // 透過API獲取股票分價量表
        const data = await stock.intraday.volumes({
          symbol,
          type: type === "oddlot" ? "oddlot" : undefined,
        });

        // 確保 data.data 是數組
        const volumes = Array.isArray(data.data) ? data.data : [];

        if (volumes.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: `未找到股票 ${symbol} ${
                  type === "oddlot" ? "(盤中零股)" : ""
                } 的分價量表`,
              },
            ],
          };
        }

        // 構建回應內容
        let responseText = `【${symbol}】分價量表：\n\n`;

        // 添加交易日期和類型資訊
        responseText += `日期：${data.date || "無日期資訊"}\n`;
        responseText += `交易所：${data.exchange || "無交易所資訊"} `;
        responseText += `市場別：${data.market || "無市場別資訊"}\n\n`;

        // 表格頭部
        responseText +=
          "價格 | 累計成交量 | 內盤成交量 | 外盤成交量 | 內外盤比\n";
        responseText +=
          "-----|------------|------------|------------|---------\n";

        // 表格內容
        volumes.forEach((volume) => {
          // 計算內外盤比例
          const totalVolume = volume.volumeAtBid + volume.volumeAtAsk;
          let bidAskRatio = "-";

          if (totalVolume > 0) {
            const bidPercentage = (
              (volume.volumeAtBid / totalVolume) *
              100
            ).toFixed(1);
            const askPercentage = (
              (volume.volumeAtAsk / totalVolume) *
              100
            ).toFixed(1);
            bidAskRatio = `${bidPercentage}% : ${askPercentage}%`;
          }

          responseText += `${
            volume.price
          } | ${volume.volume.toLocaleString()} | ${volume.volumeAtBid.toLocaleString()} | ${volume.volumeAtAsk.toLocaleString()} | ${bidAskRatio}\n`;
        });

        // 添加統計資訊
        if (volumes.length > 1) {
          responseText += "\n統計資訊：\n";

          // 計算加權平均價格
          const totalVolume = volumes.reduce((sum, vol) => sum + vol.volume, 0);
          const weightedSum = volumes.reduce(
            (sum, vol) => sum + vol.price * vol.volume,
            0
          );
          const weightedAvgPrice =
            totalVolume > 0 ? weightedSum / totalVolume : 0;
          responseText += `加權平均價格：${weightedAvgPrice.toFixed(2)}\n`;

          // 計算最高和最低價格
          const highPrice = Math.max(...volumes.map((vol) => vol.price));
          const lowPrice = Math.min(...volumes.map((vol) => vol.price));
          responseText += `最高價格：${highPrice} | 最低價格：${lowPrice}\n`;

          // 計算總成交量
          responseText += `總成交量：${totalVolume.toLocaleString()} 張\n`;

          // 計算總內外盤
          const totalBidVolume = volumes.reduce(
            (sum, vol) => sum + vol.volumeAtBid,
            0
          );
          const totalAskVolume = volumes.reduce(
            (sum, vol) => sum + vol.volumeAtAsk,
            0
          );

          // 內外盤比例
          const totalBidAskVolume = totalBidVolume + totalAskVolume;
          if (totalBidAskVolume > 0) {
            const bidPercentage = (
              (totalBidVolume / totalBidAskVolume) *
              100
            ).toFixed(2);
            const askPercentage = (
              (totalAskVolume / totalBidAskVolume) *
              100
            ).toFixed(2);

            responseText += `總內盤量：${totalBidVolume.toLocaleString()} 張 (${bidPercentage}%)\n`;
            responseText += `總外盤量：${totalAskVolume.toLocaleString()} 張 (${askPercentage}%)\n`;
            responseText += `內外盤比例：${bidPercentage}% : ${askPercentage}%\n`;
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
              text: `查詢股票 ${symbol} 分價量表時發生錯誤: ${
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
