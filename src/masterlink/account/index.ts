import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Account, MasterlinkSDK } from "masterlink-sdk";

// 匯出所有帳戶管理相關工具
import { registerBankBalanceTools } from "./bank-balance";
import { registerInventoriesTools } from "./inventories";
import { registerRealizedProfitAndLossesTools } from "./realized-profit-and-loses";
import { registerSkbankBalanceTools } from "./skbank-balance";
import { registerAccountStatementTools } from "./statement";
import { registerTodayTradeSummaryTools } from "./today-trade-summary";
import { registerTodaySettlementTools } from "./today-settlement";
import { registerTotalPnlTools } from "./total-pnl";

// 確保匯出
export {
  registerBankBalanceTools,
  registerInventoriesTools,
  registerRealizedProfitAndLossesTools,
  registerSkbankBalanceTools,
  registerAccountStatementTools,
  registerTodayTradeSummaryTools,
  registerTodaySettlementTools,
  registerTotalPnlTools
};

// 定義一個函數來註冊所有帳戶管理工具
export const registerAllAccountTools = (
  server: McpServer,
  sdk: MasterlinkSDK,
  account: Account
) => {
  registerBankBalanceTools(server, sdk, account);
  registerInventoriesTools(server, sdk, account);
  registerRealizedProfitAndLossesTools(server, sdk, account);
  registerSkbankBalanceTools(server, sdk, account);
  registerAccountStatementTools(server, sdk, account);
  registerTodayTradeSummaryTools(server, sdk, account);
  registerTodaySettlementTools(server, sdk, account);
  registerTotalPnlTools(server, sdk, account);
  
  console.log("所有帳戶管理相關工具已註冊到 MCP Server");
};
