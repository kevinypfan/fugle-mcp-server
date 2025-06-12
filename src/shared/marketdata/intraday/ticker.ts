import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StockClientInterface } from "../types";
import { z } from "zod";
import { loadToolMetadata, createToolHandler } from "../../utils/index.js";
import securityTypeReference from "./references/security-type.json";

/**
 * 註冊股票資訊相關的工具到 MCP Server
 * @param {McpServer} server MCP Server 實例
 * @param {StockClientInterface} stock 股票 API 客戶端
 */
export function registerTickerTools(server: McpServer, stock: StockClientInterface) {
  const currentDir = __dirname;
  const { description } = loadToolMetadata(currentDir, 'ticker', '取得股票詳細資訊');
  
  // 獲取股票詳細資訊工具
  server.tool(
    "get_stock_intraday_ticker",
    description,
    {
      symbol: z.string().describe("股票代碼，例如：2330"),
      type: z.literal("oddlot").optional().describe("類型，盤中零股"),
    },
    createToolHandler(
      currentDir,
      'ticker',
      async ({ symbol, type }) => {
        // 透過API獲取股票基本資訊
        return await stock.intraday.ticker({
          symbol,
          type,
        });
      },
      {
        errorMessage: "查詢股票詳細資訊時發生錯誤",
        customFormatter: (result, reference) => {
          let response = `API Response\n\`\`\`json\n${JSON.stringify(result, null, 2)}\n\`\`\``;
          if (reference) {
            response += `\n\nField Description\n\`\`\`json\n${JSON.stringify(reference, null, 2)}\n\`\`\``;
          }
          response += `\n\nSecurity Type Codes\n\`\`\`json\n${JSON.stringify(securityTypeReference, null, 2)}\n\`\`\``;
          return response;
        }
      }
    )
  );
}