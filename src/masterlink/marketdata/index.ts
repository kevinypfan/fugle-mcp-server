import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RestStockClient } from "masterlink-sdk/marketdata/rest/stock/client";

// 從 snapshot 子目錄導入所有工具
import { 
  registerMoversTools,
  registerActivesTools,
  registerQuotesTools
} from "./snapshot";

// 從 intraday 子目錄導入所有工具
import {
  registerQuoteTools,
  registerTickerTools,
  registerCandlesTools,
  registerTradesTools,
  registerTickersTools,
  registerVolumesTools
} from "./intraday";

// 從 historical 子目錄導入所有工具
import {
  registerHistoricalCandlesTools,
  registerHistoricalStatsTools
} from "./historical";

// 確保匯出
export { 
  registerMoversTools,
  registerActivesTools,
  registerQuotesTools,
  registerQuoteTools,
  registerTickerTools,
  registerCandlesTools,
  registerTradesTools,
  registerTickersTools,
  registerVolumesTools,
  registerHistoricalCandlesTools,
  registerHistoricalStatsTools
};

// 定義一個函數來註冊所有市場數據工具
export const registerAllMarketDataTools = (
  server: McpServer,
  stock: RestStockClient
) => {
  // 註冊 snapshot 工具
  registerMoversTools(server, stock);
  registerActivesTools(server, stock);
  registerQuotesTools(server, stock);
  
  // 註冊 intraday 工具
  registerQuoteTools(server, stock);
  registerTickerTools(server, stock);
  registerCandlesTools(server, stock);
  registerTradesTools(server, stock);
  registerTickersTools(server, stock);
  registerVolumesTools(server, stock);
  
  // 註冊 historical 工具
  registerHistoricalCandlesTools(server, stock);
  registerHistoricalStatsTools(server, stock);
  
  console.log("所有市場數據相關工具已註冊到 MCP Server");
};
