#!/usr/bin/env node

import fs from "fs";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { MasterlinkSDK, Account } from "masterlink-sdk";
import { RestStockClient } from "masterlink-sdk/marketdata/rest/stock/client";
import { RestFutOptClient } from "masterlink-sdk/marketdata/rest/futopt/client";
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
import { registerHistoricalCandlesTools } from "./marketdata/historical";
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

const { NOTIONAL_ID, ACCOUNT_PASS, CERT_PASS } = process.env;

if (!NOTIONAL_ID || !ACCOUNT_PASS || !CERT_PASS) {
  console.error(
    "All environment variables (NOTIONAL_ID, ACCOUNT_PASS, CERT_PASS) are required"
  );
  process.exit(1);
}

const CERT_PATH = process.env.CERT_PATH || "/app/cert.p12";

if (!fs.existsSync(CERT_PATH)) {
  console.error(`Error: Certificate file not found at ${CERT_PATH}`);
  process.exit(1); // Exit with error code
}

class FugleMcpServer {
  private server: McpServer;
  private sdk: MasterlinkSDK;
  private accounts: Account[];
  private stock: RestStockClient;
  private futopt: RestFutOptClient;

  constructor() {
    this.server = new McpServer({
      name: "fugle-mcp-server",
      version: "1.0.0",
    });

    this.sdk = new MasterlinkSDK(null);

    this.accounts = this.sdk.login(
      NOTIONAL_ID as string,
      ACCOUNT_PASS as string,
      CERT_PATH as string,
      CERT_PASS as string
    );

    this.sdk.initRealtime(this.accounts[0]);
    if (!this.sdk.marketdata) {
      console.error("Failed to initialize marketdata");
      process.exit(1);
    }
    this.stock = this.sdk.marketdata.restClient.stock;
    this.futopt = this.sdk.marketdata.restClient.futopt;

    this.registerMarketdataTools();
    this.registerAccountTools();
    this.registerTradeTools();
  }

  registerAccountTools() {
    registerTotalPnlTools(this.server, this.sdk, this.accounts[0]);
    registerBankBalanceTools(this.server, this.sdk, this.accounts[0]);
    registerInventoriesTools(this.server, this.sdk, this.accounts[0]);
    registerRealizedProfitAndLossesTools(
      this.server,
      this.sdk,
      this.accounts[0]
    );
    registerSkbankBalanceTools(this.server, this.sdk, this.accounts[0]);
    registerAccountStatementTools(this.server, this.sdk, this.accounts[0]);
    registerTodayTradeSummaryTools(this.server, this.sdk, this.accounts[0]);
    registerTodaySettlementTools(this.server, this.sdk, this.accounts[0]);
  }

  registerTradeTools() {
    registerAttentionStockTools(this.server, this.sdk, this.accounts);
    registerDispositionStockTools(this.server, this.sdk, this.accounts);
    registerFilledQueryTools(this.server, this.sdk, this.accounts);
    registerFilledDetailTools(this.server, this.sdk, this.accounts);
    registerFilledHistoryTools(this.server, this.sdk, this.accounts);
    registerFilledHistoryDetailTools(this.server, this.sdk, this.accounts);
    registerMarginQuotaTools(this.server, this.sdk, this.accounts);
    registerOrderHistoryTools(this.server, this.sdk, this.accounts);
    registerShortDaytradeQuotaTools(this.server, this.sdk, this.accounts);
    registerModifyOrderTools(this.server, this.sdk, this.accounts);
    registerModifyVolumeTools(this.server, this.sdk, this.accounts);
    registerOrderResultTools(this.server, this.sdk, this.accounts);
    registerPlaceOrderTools(this.server, this.sdk, this.accounts);
  }

  registerMarketdataTools() {
    this.registerIntradayTools();
    this.registerSnapshotTools();
    this.registerHistoricalTools();
  }

  registerHistoricalTools() {
    registerHistoricalCandlesTools(this.server, this.stock);
  }

  registerIntradayTools() {
    registerTickerTools(this.server, this.stock);
    registerQuoteTools(this.server, this.stock);
    registerCandlesTools(this.server, this.stock);
    registerTickersTools(this.server, this.stock);
    registerTradesTools(this.server, this.stock);
    registerVolumesTools(this.server, this.stock);
  }

  registerSnapshotTools() {
    registerMoversTools(this.server, this.stock);
    registerActivesTools(this.server, this.stock);
    registerQuotesTools(this.server, this.stock);
  }

  async runServer() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Fugle MCP Server running on stdio");
  }
}

function main() {
  const fugleMcpServer = new FugleMcpServer();
  fugleMcpServer.runServer().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
  });
}

main();
