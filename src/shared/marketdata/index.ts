import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StockClient } from "../factory/stock-client.factory";

// 從 snapshot 子目錄導入所有工具
import {
  registerQuotesTools,
  registerActivesTools,
  registerMoversTools,
} from "./snapshot";

// 從 intraday 子目錄導入所有工具
import {
  registerQuoteTools,
  registerTickerTools,
  registerTickersTools,
  registerCandlesTools,
  registerTradesTools,
  registerVolumesTools,
} from "./intraday";

// 從 historical 子目錄導入所有工具
import {
  registerHistoricalCandlesTools,
  registerHistoricalStatsTools,
} from "./historical";

// 確保匯出
export {
  registerQuotesTools,
  registerActivesTools,
  registerMoversTools,
  registerQuoteTools,
  registerTickerTools,
  registerTickersTools,
  registerCandlesTools,
  registerTradesTools,
  registerVolumesTools,
  registerHistoricalCandlesTools,
  registerHistoricalStatsTools,
};

// 定義一個函數來註冊所有市場數據工具
export const registerAllMarketDataTools = (
  server: McpServer,
  stock: StockClient
) => {
  // 註冊 snapshot 工具
  registerQuotesTools(server, stock);
  registerActivesTools(server, stock);
  registerMoversTools(server, stock);

  // 註冊 intraday 工具
  registerQuoteTools(server, stock);
  registerTickerTools(server, stock);
  registerTickersTools(server, stock);
  registerCandlesTools(server, stock);
  registerTradesTools(server, stock);
  registerVolumesTools(server, stock);

  // 註冊 historical 工具
  registerHistoricalCandlesTools(server, stock);
  registerHistoricalStatsTools(server, stock);
};
