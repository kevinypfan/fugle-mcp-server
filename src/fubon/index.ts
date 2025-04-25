import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FubonSDK } from "fubon-neo";
import { RestStockClient } from "fubon-neo/marketdata/rest/stock/client";
import { Account } from "fubon-neo/trade";
import { registerAccountManagementTools } from "./account";
import { registerTradeTools } from "./trade";

export class FubonMcp {
  server: McpServer;
  sdk: FubonSDK;
  stock: RestStockClient;
  private accounts: Account[];
  targetAccount: Account;

  constructor(server: McpServer, certPath: string) {
    const { NATIONAL_ID, ACCOUNT, ACCOUNT_PASS, CERT_PASS } = process.env;
    this.server = server;
    this.sdk = new FubonSDK();

    const accountRes = this.sdk.login(
      NATIONAL_ID as string,
      ACCOUNT_PASS as string,
      certPath,
      CERT_PASS as string
    );

    this.accounts = accountRes.data || [];

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

    this.sdk.initRealtime();
    if (!this.sdk.marketdata) {
      console.error("Failed to initialize marketdata");
      process.exit(1);
    }
    this.stock = this.sdk.marketdata.restClient.stock;

    registerAccountManagementTools(this.server, this.sdk, this.targetAccount);
    registerTradeTools(this.server, this.sdk, this.targetAccount);
  }
}
