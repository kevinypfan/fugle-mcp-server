import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RestStockClient } from "masterlink-sdk/marketdata/rest/stock/client";
import { z } from "zod";

/**
 * 產業別代碼對照表
 */
const INDUSTRY_TYPES: { [key: string]: string } = {
  "01": "水泥工業",
  "02": "食品工業",
  "03": "塑膠工業",
  "04": "紡織纖維",
  "05": "電機機械",
  "06": "電器電纜",
  "08": "玻璃陶瓷",
  "09": "造紙工業",
  "10": "鋼鐵工業",
  "11": "橡膠工業",
  "12": "汽車工業",
  "14": "建材營造",
  "15": "航運業",
  "16": "觀光餐旅",
  "17": "金融保險",
  "18": "貿易百貨",
  "19": "綜合",
  "20": "其他",
  "21": "化學工業",
  "22": "生技醫療業",
  "23": "油電燃氣業",
  "24": "半導體業",
  "25": "電腦及週邊設備業",
  "26": "光電業",
  "27": "通信網路業",
  "28": "電子零組件業",
  "29": "電子通路業",
  "30": "資訊服務業",
  "31": "其他電子業",
  "32": "文化創意業",
  "33": "農業科技業",
  "34": "電子商務",
  "35": "綠能環保",
  "36": "數位雲端",
  "37": "運動休閒",
  "38": "居家生活",
  "80": "管理股票",
};

/**
 * 註冊股票列表查詢工具到 MCP Server
 * @param {McpServer} server MCP Server 實例
 * @param {RestStockClient} stock 股票 API 客戶端
 */
export function registerTickersTools(
  server: McpServer,
  stock: RestStockClient
) {
  // 取得股票列表工具
  server.tool(
    "get_stock_intraday_tickers",
    "取得股票或指數列表（依條件查詢）",
    {
      type: z
        .enum(["EQUITY", "INDEX", "WARRANT", "ODDLOT"])
        .describe(
          "Ticker 類型：EQUITY 股票、INDEX 指數、WARRANT 權證、ODDLOT 盤中零股"
        ),
      exchange: z
        .enum(["TWSE", "TPEx"])
        .optional()
        .describe("交易所：TWSE 臺灣證券交易所、TPEx 證券櫃檯買賣中心"),
      market: z
        .enum(["TSE", "OTC", "ESB", "TIB", "PSB"])
        .optional()
        .describe(
          "市場別：TSE 上市、OTC 上櫃、ESB 興櫃一般板、TIB 臺灣創新板、PSB 興櫃戰略新板"
        ),
      industry: z
        .string()
        .optional()
        .describe("產業別代碼，例如：24（半導體業）"),
      isNormal: z
        .boolean()
        .optional()
        .describe("查詢正常股票（非注意、處置股票）：true"),
      isAttention: z.boolean().optional().describe("查詢注意股票：true"),
      isDisposition: z.boolean().optional().describe("查詢處置股票：true"),
      isHalted: z.boolean().optional().describe("查詢暫停交易股票：true"),
    },
    async (params) => {
      try {
        // 透過API獲取股票列表
        const data = await stock.intraday.tickers(params);

        // 確保 data.data 是數組
        const tickers = Array.isArray(data.data) ? data.data : [];

        if (tickers.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: `未找到符合條件的股票列表`,
              },
            ],
          };
        }

        // 構建列表資訊
        let conditionText = `類型：${params.type}`;

        if (params.exchange) conditionText += `、交易所：${params.exchange}`;
        if (params.market) conditionText += `、市場別：${params.market}`;

        if (params.industry) {
          const industryName =
            INDUSTRY_TYPES[params.industry] || params.industry;
          conditionText += `、產業別：${params.industry} (${industryName})`;
        }

        if (params.isNormal === true) conditionText += "、正常股票";
        if (params.isAttention === true) conditionText += "、注意股票";
        if (params.isDisposition === true) conditionText += "、處置股票";
        if (params.isHalted === true) conditionText += "、暫停交易股票";

        let responseText = `符合條件【${conditionText}】的股票列表：\n\n`;

        // 計算顯示的股票數量
        const displayCount = tickers.length;
        const totalCount = tickers.length;

        responseText += `找到 ${totalCount} 筆符合條件的股票，顯示前 ${displayCount} 筆：\n\n`;

        // 表格頭部
        responseText += "代碼 | 名稱\n";
        responseText += "-----|------\n";

        // 表格內容
        tickers.forEach((ticker) => {
          responseText += `${ticker.symbol} | ${ticker.name}\n`;
        });

        return {
          content: [{ type: "text", text: responseText }],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `查詢股票列表時發生錯誤: ${error || "未知錯誤"}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
