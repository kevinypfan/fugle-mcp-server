/**
 * 定義股票 API 客戶端通用介面
 * 用於確保不同的實現（masterlink, fubon 等）使用相同的方法簽名
 */
export interface StockClientInterface {
  snapshot: {
    quotes: (params: { 
      market: "TSE" | "OTC" | "ESB" | "TIB" | "PSB"; 
      type?: "COMMONSTOCK" | "ALL" | "ALLBUT0999";
    }) => Promise<any>;
    movers: (params: { 
      market: "TSE" | "OTC" | "ESB" | "TIB" | "PSB"; 
      direction: "up" | "down";
      change: "percent" | "value";
      gt?: number;
      type?: "COMMONSTOCK" | "ALL" | "ALLBUT0999";
      gte?: number;
      lt?: number;
      lte?: number;
      eq?: number;
    }) => Promise<any>;
    actives: (params: { 
      market: "TSE" | "OTC" | "ESB" | "TIB" | "PSB"; 
      trade: "volume" | "value";
      type?: "COMMONSTOCK" | "ALL" | "ALLBUT0999";
    }) => Promise<any>;
  };
  intraday: {
    quote: (params: { symbol: string; type?: "oddlot" }) => Promise<any>;
    ticker: (params: { symbol: string; type?: "oddlot" }) => Promise<any>;
    candles: (params: { 
      symbol: string; 
      type?: "oddlot";
      timeframe?: "1" | "5" | "10" | "15" | "30" | "60"; 
      // 保留 resolution 參數以支持舊的 API
      resolution?: string;
    }) => Promise<any>;
    trades: (params: { 
      symbol: string; 
      type?: "oddlot";
      limit?: number;
      offset?: number;
    }) => Promise<any>;
    tickers: (params: { 
      type: string; 
      market?: string;
      industry?: string;
      isNormal?: boolean;
      isAttention?: boolean;
      isDisposition?: boolean;
      isHalted?: boolean;
    }) => Promise<any>;
    volumes: (params: { symbol: string; type?: "oddlot" }) => Promise<any>;
  };
  historical: {
    candles: (params: { 
      symbol: string; 
      from?: string; 
      to?: string;
      timeframe?: "1" | "5" | "10" | "15" | "30" | "60" | "D" | "W" | "M";
      fields?: string;
      sort?: "asc" | "desc";
    }) => Promise<any>;
    stats: (params: { symbol: string; type?: "price" }) => Promise<any>;
  };
}