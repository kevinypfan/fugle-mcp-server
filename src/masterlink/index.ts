import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Account, MasterlinkSDK } from "masterlink-sdk";

import {
  registerAccountStatementTools,
  registerBankBalanceTools,
  registerInventoriesTools,
  registerRealizedProfitAndLossesTools,
  registerSkbankBalanceTools,
  registerTodaySettlementTools,
  registerTodayTradeSummaryTools,
  registerTotalPnlTools,
} from "./account";
import {
  registerAttentionStockTools,
  registerDispositionStockTools,
  registerFilledDetailTools,
  registerFilledHistoryDetailTools,
  registerFilledHistoryTools,
  registerFilledQueryTools,
  registerMarginQuotaTools,
  registerModifyOrderTools,
  registerModifyVolumeTools,
  registerOrderHistoryTools,
  registerOrderResultTools,
  registerPlaceOrderTools,
  registerShortDaytradeQuotaTools,
} from "./trade";

import {
  registerCandlesTools,
  registerQuoteTools,
  registerTickersTools,
  registerTickerTools,
  registerTradesTools,
  registerVolumesTools,
} from "./marketdata/intraday";
import {
  registerActivesTools,
  registerMoversTools,
  registerQuotesTools,
} from "./marketdata/snapshot";
import {
  registerHistoricalCandlesTools,
  registerHistoricalStatsTools,
} from "./marketdata/historical";
import { RestStockClient } from "masterlink-sdk/marketdata/rest/stock/client";

export const registerAccountTools = (
  server: McpServer,
  sdk: MasterlinkSDK,
  account: Account
) => {
  registerTotalPnlTools(server, sdk, account);
  registerBankBalanceTools(server, sdk, account);
  registerInventoriesTools(server, sdk, account);
  registerRealizedProfitAndLossesTools(server, sdk, account);
  registerSkbankBalanceTools(server, sdk, account);
  registerAccountStatementTools(server, sdk, account);
  registerTodayTradeSummaryTools(server, sdk, account);
  registerTodaySettlementTools(server, sdk, account);
};

export const registerTradeTools = (
  server: McpServer,
  sdk: MasterlinkSDK,
  account: Account
) => {
  registerAttentionStockTools(server, sdk, account);
  registerDispositionStockTools(server, sdk, account);
  registerFilledQueryTools(server, sdk, account);
  registerFilledDetailTools(server, sdk, account);
  registerFilledHistoryTools(server, sdk, account);
  registerFilledHistoryDetailTools(server, sdk, account);
  registerMarginQuotaTools(server, sdk, account);
  registerOrderHistoryTools(server, sdk, account);
  registerShortDaytradeQuotaTools(server, sdk, account);
  registerModifyOrderTools(server, sdk, account);
  registerModifyVolumeTools(server, sdk, account);
  registerOrderResultTools(server, sdk, account);
  registerPlaceOrderTools(server, sdk, account);
};

export const registerMarketdataTools = (
  server: McpServer,
  stock: RestStockClient
) => {
  registerHistoricalCandlesTools(server, stock);
  registerHistoricalStatsTools(server, stock);

  registerTickerTools(server, stock);
  registerQuoteTools(server, stock);
  registerCandlesTools(server, stock);
  registerTickersTools(server, stock);
  registerTradesTools(server, stock);
  registerVolumesTools(server, stock);

  registerMoversTools(server, stock);
  registerActivesTools(server, stock);
  registerQuotesTools(server, stock);
};

export class MasterlinkMcp {
  server: McpServer;
  sdk: MasterlinkSDK;
  stock: RestStockClient;
  private accounts: Account[];
  targetAccount: Account;

  constructor(server: McpServer, certPath: string) {
    const { NATIONAL_ID, ACCOUNT, ACCOUNT_PASS, CERT_PASS } = process.env;
    this.server = server;
    this.sdk = new MasterlinkSDK(null);

    // 由於前面已經檢查過 nationalId 是否存在，這裡可以斷言它一定是字符串
    this.accounts = this.sdk.login(
      NATIONAL_ID as string,
      ACCOUNT_PASS as string,
      certPath,
      CERT_PASS as string
    );

    let account;

    if (ACCOUNT) {
      account = this.accounts.find((account) => {
        return account.account === ACCOUNT;
      });
    } else {
      account = this.accounts[0];
    }

    if (!account) {
      console.error("No account found");
      process.exit(1);
    }

    this.targetAccount = account;

    this.sdk.initRealtime(this.targetAccount);
    if (!this.sdk.marketdata) {
      console.error("Failed to initialize marketdata");
      process.exit(1);
    }
    this.stock = this.sdk.marketdata.restClient.stock;

    registerMarketdataTools(this.server, this.stock);
    registerTradeTools(this.server, this.sdk, this.targetAccount);
    registerAccountTools(this.server, this.sdk, this.targetAccount);
  }
}
