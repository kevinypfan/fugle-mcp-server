import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StockClientInterface } from "../types";
import { z } from "zod";
import { loadToolMetadata, createToolHandler } from "../../utils/index.js";
import industryTypeReference from "./references/industry-type.json";

/**
 * 註冊股票列表查詢工具到 MCP Server
 * @param {McpServer} server MCP Server 實例
 * @param {StockClientInterface} stock 股票 API 客戶端
 */
export function registerTickersTools(server: McpServer, stock: StockClientInterface) {
  const currentDir = __dirname;
  const { description } = loadToolMetadata(currentDir, 'tickers', '取得股票列表（依條件查詢）');
  
  // 取得股票列表工具
  server.tool(
    "get_stock_intraday_tickers",
    description,
    {
      type: z
        .literal("oddlot")
        .optional()
        .describe("Ticker 類型，可選 oddlot 盤中零股"),
      market: z
        .string()
        .optional()
        .describe("市場別，可選 TSE 或 OTC"),
      industry: z
        .string()
        .optional()
        .describe("產業別代碼，例如：24 (半導體業)"),
      isNormal: z
        .boolean()
        .optional()
        .describe("是否為正常股票（非注意、處置股票）"),
      isAttention: z
        .boolean()
        .optional()
        .describe("是否為注意股票"),
      isDisposition: z
        .boolean()
        .optional()
        .describe("是否為處置股票"),
      isHalted: z
        .boolean()
        .optional()
        .describe("是否為暫停交易股票"),
    },
    createToolHandler(
      currentDir,
      'tickers',
      async ({
        type,
        market,
        industry,
        isNormal,
        isAttention,
        isDisposition,
        isHalted,
      }) => {
        // 透過API獲取股票列表
        return await stock.intraday.tickers({
          type: type === "oddlot" ? "oddlot" : "EQUITY", // 設定預設值為 "EQUITY"
          market,
          industry,
          isNormal,
          isAttention,
          isDisposition,
          isHalted,
        });
      },
      {
        errorMessage: "查詢股票列表時發生錯誤",
        customFormatter: (result, reference) => {
          let response = `API Response\n\`\`\`json\n${JSON.stringify(result, null, 2)}\n\`\`\``;
          if (reference) {
            response += `\n\nField Description\n\`\`\`json\n${JSON.stringify(reference, null, 2)}\n\`\`\``;
          }
          response += `\n\nIndustry Type Codes\n\`\`\`json\n${JSON.stringify(industryTypeReference, null, 2)}\n\`\`\``;
          return response;
        }
      }
    )
  );
}