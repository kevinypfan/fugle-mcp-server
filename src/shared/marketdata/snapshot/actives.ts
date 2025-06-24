import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StockClientInterface } from "../types";
import { z } from "zod";
import { loadToolMetadata, createToolHandler } from "../../utils/index.js";

/**
 * 註冊股票成交量值排行查詢工具到 MCP Server
 * @param {McpServer} server MCP Server 實例
 * @param {StockClientInterface} stock 股票 API 客戶端
 */
export function registerActivesTools(server: McpServer, stock: StockClientInterface) {
  const currentDir = __dirname;
  const { description } = loadToolMetadata(currentDir, 'actives', '取得股票成交量值排行（依市場別）');
  
  // 取得股票成交量值排行工具
  server.tool(
    "get_stock_snapshot_actives",
    description,
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
        .positive()
        .max(50)
        .optional()
        .describe("限制回傳筆數，預設 30 筆，最多 50 筆"),
    },
    createToolHandler(
      currentDir,
      'actives',
      async ({ market, trade, type, limit = 30 }) => {
        // 透過API獲取股票成交量值排行
        const data = await stock.snapshot.actives({
          market,
          trade,
          type,
        });

        data.data = data.data.slice(0, limit);
        return data;
      },
      {
        errorMessage: "查詢股票成交量值排行時發生錯誤"
      }
    )
  );
}