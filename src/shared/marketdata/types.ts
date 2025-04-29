/**
 * 向後兼容模塊
 * 
 * 這個模塊現在只是重新導出 StockClient 作為 StockClientInterface
 * 以確保現有的導入不會出錯
 * 
 * 在未來版本中，建議直接使用 StockClient
 */

import { StockClient } from "../factory/stock-client.factory";

// 為了向後兼容，將 StockClient 重新導出為 StockClientInterface
export type StockClientInterface = StockClient;
