import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RestStockClient } from "masterlink-sdk/marketdata/rest/stock/client";
import { z } from "zod";
import { DateTime } from "luxon";

/**
 * 註冊股票行情快照查詢工具到 MCP Server
 * @param {McpServer} server MCP Server 實例
 * @param {RestStockClient} stock 股票 API 客戶端
 */
export function registerQuotesTools(server: McpServer, stock: RestStockClient) {
  // 取得股票行情快照工具
  server.tool(
    "get_stock_snapshot_quotes",
    "取得股票行情快照（依市場別）",
    {
      market: z
        .enum(["TSE", "OTC", "ESB", "TIB", "PSB"])
        .describe("市場別，可選 TSE 上市；OTC 上櫃；ESB 興櫃一般板；TIB 臺灣創新板；PSB 興櫃戰略新板"),
      type: z
        .enum(["COMMONSTOCK", "ALL", "ALLBUT0999"])
        .optional()
        .describe("標的類型，可選 ALLBUT0999 包含一般股票、特別股及ETF；COMMONSTOCK 為一般股票；ALL 為全部"),
      limit: z
        .number()
        .int()
        .positive()
        .max(100)
        .optional()
        .describe("限制回傳筆數，最多 100 筆"),
      offset: z
        .number()
        .int()
        .min(0)
        .optional()
        .describe("偏移量，用於分頁查詢"),
      search: z
        .string()
        .optional()
        .describe("搜尋代碼或名稱"),
    },
    async ({ market, type, limit = 50, offset = 0, search }) => {
      try {
        // 透過API獲取股票行情快照
        const data = await stock.snapshot.quotes({
          market,
          type,
        });

        // 確保 data.data 是數組
        let quotes = Array.isArray(data.data) ? data.data : [];

        if (quotes.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: `未找到市場 ${market} 的股票行情快照`,
              },
            ],
          };
        }

        // 如果有提供搜尋條件，先進行過濾
        if (search && search.trim() !== "") {
          const searchTerm = search.trim().toLowerCase();
          quotes = quotes.filter(
            (quote) =>
              quote.symbol?.toLowerCase().includes(searchTerm) ||
              quote.name?.toLowerCase().includes(searchTerm)
          );

          if (quotes.length === 0) {
            return {
              content: [
                {
                  type: "text",
                  text: `在市場 ${market} 中未找到符合搜尋條件 "${search}" 的股票`,
                },
              ],
            };
          }
        }

        // 應用分頁
        const totalItems = quotes.length;
        const totalPages = Math.ceil(totalItems / limit);
        const currentPage = Math.floor(offset / limit) + 1;
        
        quotes = quotes.slice(offset, offset + limit);

        // 構建回應內容
        let responseText = `【${market}】股票行情快照：\n\n`;

        // 添加日期和時間信息
        responseText += `日期：${data.date || "無日期資訊"}\n`;
        responseText += `時間：${data.time || "無時間資訊"}\n\n`;

        // 添加篩選條件信息
        if (type) {
          responseText += `標的類型：${type}\n`;
        }
        if (search) {
          responseText += `搜尋條件：${search}\n`;
        }
        responseText += `顯示第 ${offset + 1} 至 ${Math.min(offset + limit, totalItems)} 筆資料，共 ${totalItems} 筆\n\n`;

        // 表格頭部
        responseText += "代碼 | 名稱 | 收盤價 | 漲跌 | 漲跌幅(%) | 最高價 | 最低價 | 開盤價 | 成交量(張) | 成交金額(元)\n";
        responseText += "-----|------|--------|------|-----------|--------|--------|--------|------------|-------------\n";

        // 表格內容
        quotes.forEach((quote) => {
          // 格式化最後更新時間
          const lastUpdated = quote.lastUpdated
            ? DateTime.fromMillis(Math.floor(quote.lastUpdated / 1000)).toFormat("HH:mm:ss")
            : "-";

          // 判斷漲跌顏色 (可以在文字前加上 `+` 或 `-` 符號)
          const changeSign = quote.change > 0 ? "+" : quote.change < 0 ? "" : "";
          const changePercentSign = quote.changePercent > 0 ? "+" : quote.changePercent < 0 ? "" : "";

          responseText += `${quote.symbol} | ${quote.name || "-"} | ${quote.closePrice || "-"} | ${
            quote.change !== undefined ? `${changeSign}${quote.change}` : "-"
          } | ${
            quote.changePercent !== undefined
              ? `${changePercentSign}${quote.changePercent.toFixed(2)}`
              : "-"
          } | ${quote.highPrice || "-"} | ${quote.lowPrice || "-"} | ${quote.openPrice || "-"} | ${
            quote.tradeVolume ? quote.tradeVolume.toLocaleString() : "-"
          } | ${quote.tradeValue ? quote.tradeValue.toLocaleString() : "-"}\n`;
        });

        // 添加統計信息
        if (quotes.length > 1) {
          responseText += "\n統計資訊：\n";

          // 計算上漲、下跌和平盤的股票數量
          const upCount = quotes.filter((quote) => quote.change > 0).length;
          const downCount = quotes.filter((quote) => quote.change < 0).length;
          const unchangedCount = quotes.filter((quote) => quote.change === 0).length;

          responseText += `上漲：${upCount} 檔 (${((upCount / quotes.length) * 100).toFixed(2)}%)\n`;
          responseText += `下跌：${downCount} 檔 (${((downCount / quotes.length) * 100).toFixed(2)}%)\n`;
          responseText += `平盤：${unchangedCount} 檔 (${((unchangedCount / quotes.length) * 100).toFixed(2)}%)\n`;

          // 計算漲跌停股票數量
          const limitUpCount = quotes.filter((quote) => quote.changePercent >= 9.5).length;
          const limitDownCount = quotes.filter((quote) => quote.changePercent <= -9.5).length;

          if (limitUpCount > 0 || limitDownCount > 0) {
            responseText += `漲停：${limitUpCount} 檔\n`;
            responseText += `跌停：${limitDownCount} 檔\n`;
          }

          // 計算總成交量和成交金額
          const totalVolume = quotes.reduce(
            (sum, quote) => sum + (quote.tradeVolume || 0),
            0
          );
          const totalValue = quotes.reduce(
            (sum, quote) => sum + (quote.tradeValue || 0),
            0
          );

          responseText += `總成交量：${totalVolume.toLocaleString()} 張\n`;
          responseText += `總成交金額：${totalValue.toLocaleString()} 元\n`;
        }

        // 添加分頁資訊
        if (totalPages > 1) {
          responseText += `\n分頁資訊：目前第 ${currentPage} 頁，共 ${totalPages} 頁\n`;
          
          // 提供下一頁或上一頁的提示
          if (currentPage < totalPages) {
            const nextOffset = offset + limit;
            responseText += `下一頁：使用 offset=${nextOffset}\n`;
          }
          
          if (currentPage > 1) {
            const prevOffset = Math.max(0, offset - limit);
            responseText += `上一頁：使用 offset=${prevOffset}\n`;
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
              text: `查詢市場 ${market} 股票行情快照時發生錯誤: ${
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