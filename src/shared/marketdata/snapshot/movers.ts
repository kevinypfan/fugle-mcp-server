import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StockClientInterface } from "../types";
import { z } from "zod";
import { loadToolMetadata, createToolHandler } from "../../utils/index.js";

/**
 * 註冊股票漲跌幅排行查詢工具到 MCP Server
 * @param {McpServer} server MCP Server 實例
 * @param {StockClientInterface} stock 股票 API 客戶端
 */
export function registerMoversTools(server: McpServer, stock: StockClientInterface) {
  const currentDir = __dirname;
  const { description } = loadToolMetadata(currentDir, 'movers', '取得股票漲跌幅排行（依市場別）');
  
  // 取得股票漲跌幅排行工具
  server.tool(
    "get_stock_snapshot_movers",
    description,
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
        .positive()
        .max(50)
        .optional()
        .describe("限制回傳筆數，預設 30 筆，最多 50 筆"),
    },
    createToolHandler(
      currentDir,
      'movers',
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
        limit = 30,
      }) => {
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

        data.data = data.data.slice(0, limit);
        return data;
      },
      {
        errorMessage: "查詢股票漲跌幅排行時發生錯誤"
      }
    )
  );
}