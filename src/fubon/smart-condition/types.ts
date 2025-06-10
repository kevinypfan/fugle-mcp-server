/**
 * Smart Condition Types for Fubon Neo SDK
 * Based on official Fubon Neo documentation
 */

// Basic result wrapper
export interface Result<T = any> {
  is_success: boolean;
  message?: string;
  data?: T;
}

// Market type enum
export type MarketType = 'Reference' | 'Scheduled';

// Trigger type enum  
export type TriggerType = 'BidPrice' | 'AskPrice' | 'MatchedPrice' | 'TotalQuantity' | 'Time';

// Comparison operator enum
export type ComparisonOperator = 'GreaterThanOrEqual' | 'LessThanOrEqual' | 'GreaterThan' | 'LessThan';

// Buy/Sell action enum
export type BuySellAction = 'Buy' | 'Sell';

// Market session enum
export type MarketSession = 'Common' | 'Fixing' | 'IntradayOdd' | 'Odd';

// Price type enum
export type PriceType = 'Limit' | 'Market' | 'BidPrice' | 'AskPrice' | 'MatchedPrice';

// Time in force enum
export type TimeInForce = 'ROD' | 'IOC' | 'FOK';

// Order type enum
export type OrderType = 'Stock' | 'Margin' | 'Short';

// Stop sign enum
export type StopSign = 'Full' | 'Partial' | 'UntilEnd';

// Trail direction enum
export type TrailDirection = 'Up' | 'Down';

// Time slice method enum
export type TimeSliceMethod = 'Type1' | 'Type2' | 'Type3';

// Condition status enum
export type ConditionStatus = 'Type1' | 'Type2' | 'Type3' | 'Type4' | 'Type5' | 'Type6' | 'Type7' | 'Type8' | 'Type9' | 'Type10' | 'Type11';

// History status enum
export type HistoryStatus = 'Type1' | 'Type2' | 'Type3' | 'Type4' | 'Type5' | 'Type6';

// Core condition object
export interface Condition {
  market_type: MarketType;
  symbol: string;
  trigger: TriggerType;
  trigger_value: number | string;
  comparison: ComparisonOperator;
}

// Order execution object
export interface ConditionOrder {
  buy_sell: BuySellAction;
  symbol: string;
  price: number;
  quantity: number;
  market_type: MarketSession;
  price_type: PriceType;
  time_in_force: TimeInForce;
  order_type: OrderType;
}

// TPSL (Take Profit / Stop Loss) wrapper
export interface TPSLWrapper {
  stop_sign: StopSign;
  tp?: ConditionOrder;
  sl?: ConditionOrder;
  end_date?: string;
  intraday?: boolean;
}

// Trail order object
export interface TrailOrder {
  symbol: string;
  price: number;
  direction: TrailDirection;
  percentage: number;
  buysell: BuySellAction;
  quantity: number;
  price_type: PriceType;
  diff: number;
}

// Time slice description
export interface SplitDescription {
  method: TimeSliceMethod;
  interval: number;
  single_quantity: number;
  total_quantity: number;
  start_time: string;
  end_time: string;
}

// API Input Parameters
export interface SingleConditionParams {
  account: string;
  start_date: string;
  end_date: string;
  stop_sign: StopSign;
  condition: Condition;
  order: ConditionOrder;
  tpsl?: TPSLWrapper;
}

export interface MultiConditionParams {
  account: string;
  start_date: string;
  end_date: string;
  stop_sign: StopSign;
  conditions: Condition[];
  order: ConditionOrder;
  tpsl?: TPSLWrapper;
}

export interface TimeSliceOrderParams {
  account: string;
  start_date: string;
  end_date: string;
  stop_sign: StopSign;
  split_description: SplitDescription;
  order: ConditionOrder;
}

export interface TrailProfitParams {
  account: string;
  start_date: string;
  end_date: string;
  stop_sign: StopSign;
  trail_order: TrailOrder;
}

export interface CancelConditionParams {
  account: string;
  guid: string;
}

export interface GetConditionByIdParams {
  account: string;
  guid: string;
}

export interface GetConditionOrderParams {
  account: string;
  condition_status?: ConditionStatus;
}

export interface GetConditionHistoryParams {
  account: string;
  start_date: string;
  end_date: string;
  history_status?: HistoryStatus;
}

export interface GetTimeSliceOrderParams {
  account: string;
  batch_no: string;
}

export interface GetTrailOrderParams {
  account: string;
}

export interface GetTrailHistoryParams {
  account: string;
  start_date: string;
  end_date: string;
}

// Response data types
export interface ConditionOrderResponse {
  guid: string;
  account: string;
  symbol: string;
  status: string;
  create_time: string;
  [key: string]: any;
}

export interface ConditionHistoryResponse {
  guid: string;
  account: string;
  symbol: string;
  status: string;
  create_time: string;
  end_time?: string;
  [key: string]: any;
}

export interface TimeSliceOrderResponse {
  batch_no: string;
  account: string;
  symbol: string;
  total_quantity: number;
  executed_quantity: number;
  status: string;
  [key: string]: any;
}

export interface TrailOrderResponse {
  guid: string;
  account: string;
  symbol: string;
  price: number;
  direction: TrailDirection;
  percentage: number;
  status: string;
  [key: string]: any;
}

export interface TrailHistoryResponse {
  guid: string;
  account: string;
  symbol: string;
  price: number;
  direction: TrailDirection;
  percentage: number;
  status: string;
  create_time: string;
  end_time?: string;
  [key: string]: any;
}