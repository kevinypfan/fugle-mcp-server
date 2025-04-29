import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Account, MasterlinkSDK } from "masterlink-sdk";
import { RestStockClient } from "masterlink-sdk/marketdata/rest/stock/client";
import { registerAllAccountTools } from "./account";
import { registerAllTradeTools } from "./trade";
import { SdkProvider } from "../shared/factory";
import { registerAllMarketDataTools } from "../shared/marketdata";

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
    
    // 使用 SDK Provider 創建具有正確類型的 stock 客戶端
    const sdkProvider = SdkProvider.getInstance();
    const originalStock = this.sdk.marketdata.restClient.stock;
    
    // 用工廠方法創建具有正確類型的客戶端
    // 特別說明: typedStock 會同時具有 MasterlinkStockClient 和 GenericStockClient 的類型
    // 這確保了它有所需的所有方法，且返回類型正確
    const typedStock = sdkProvider.createStockClient(originalStock);
    this.stock = typedStock;

    registerAllMarketDataTools(this.server, typedStock);
    registerAllTradeTools(this.server, this.sdk, this.targetAccount);
    registerAllAccountTools(this.server, this.sdk, this.targetAccount);
  }
}
