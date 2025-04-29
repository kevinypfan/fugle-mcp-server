// 定義基本類型

// Fugle API 回應的通用結構
export interface FugleApiResponse<T> {
  data: {
    content: {
      contentId: string;
      contentIdParams: string[];
      specName: string;
      rawContent: T;
    };
  };
}

// 近3日價量數據結構 (FCNT000013)
export interface RecentPriceVolumeData {
  date: string;
  volume: number;
  amount: number;
  open: number;
  high: number;
  low: number;
  close: number;
  change: number;
  change_rate: number;
}

// 商品基本資料結構 (FCNT000017)
export interface StockBasicInfo {
  symbol_id: string;
  __v: number;
  aliases: string[];
  available_cards: Array<{
    card_spec_id: string;
    default_score: number;
    updated_at?: string;
  }>;
  category: string;
  country: string;
  created_at: string;
  exchange: string;
  industry: string;
  mkt: string;
  name: string;
  off_date: string | null;
  on_date: string;
  updated_at: string;
  is_tradable: boolean;
  market_tag: string;
}

// 最近重要日期結構 (FCNT000137)
export interface ImportantDates {
  cshDivDate: string | null;
  risuYmd: string | null;
  cshdivPayDate: string | null;
  meetDate: string | null;
  capitalReductionStopTradingDate: string | null;
  capitalReductionRecoverTradingDate: string | null;
  parValueChangedStopTradingDate: string | null;
  parValueChangedRecoverTradingDate: string | null;
  capitalIncreaseRisuYmd: string | null;
  updatedAt: string;
}

// 重大訊息項目結構 (FCNT000004)
export interface NewsItem {
  _id: string;
  symbol_id: string;
  name: string;
  timestamp: string;
  title: string;
  url: string;
  descs: Array<{
    title: string;
    content: string[];
  }>;
}

// 基本資料結構 (FCNT000001)
export interface CompanyProfile {
  category: string;
  companyName: string;
  shortName: string;
  symbolId: string;
  englishFullName: string;
  endlishShortName: string;
  industry: string;
  tel: string;
  address: string;
  chairman: string;
  managers: string;
  speaker: string;
  speakerTitle: string;
  speakerPhone: string;
  altSpeaker: string;
  operations: string;
  foundDate: string;
  taxId: string;
  ipoDate: string;
  listDate: string;
  otcDate: string;
  emDate: string;
  capital: string;
  release: string;
  special: string;
  price: string;
  transferAgency: string;
  agencyTel: string;
  agencyAddress: string;
  accountingAgency: string;
  accounting1: string;
  accounting2: string;
  companyUrl: string;
  prospectusUrl: string;
  shareholdersReportUrl: string;
}

// 每月營收項目結構 (FCNT000006)
export interface MonthlyRevenueItem {
  year: number;
  month: number;
  data: {
    current: {
      revenue: number;
      lastyear: number;
      diff: number;
      yoy: number;
      mom: number;
      momText: string | null;
      yoyText: string | null;
    };
    accu: {
      revenue: number;
      lastyear: number;
      diff: number;
      yoy: number;
      momText: string | null;
      yoyText: string | null;
    };
  };
  symbol_id: string;
  created_at: string;
  updated_at: string;
  __v: number;
}

export interface AutocompleteTerms {
  data: {
    terms: Term[];
  };
}

interface Term {
  normalName: string;
  info: Info;
  card?: string; // 注意：有些項目有 card，有些沒有，所以是 optional
  normal_name: string;
}

interface Info {
  name: string;
  symbol_id: string;
  category: string;
  country: string;
  exchange: string;
  mkt: string;
}
