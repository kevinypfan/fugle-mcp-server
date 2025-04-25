import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Account, MasterlinkSDK } from "masterlink-sdk";
import { RestStockClient } from "masterlink-sdk/marketdata/rest/stock/client";
import { registerAllAccountTools } from "./account";
import { registerAllTradeTools } from "./trade";
import { registerAllMarketDataTools } from "./marketdata";

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

    registerAllMarketDataTools(this.server, this.stock);
    registerAllTradeTools(this.server, this.sdk, this.targetAccount);
    registerAllAccountTools(this.server, this.sdk, this.targetAccount);
  }
}
