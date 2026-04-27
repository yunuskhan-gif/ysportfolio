export type TradeDirection = "BUY" | "SELL";
export type TradeType = "EQUITY" | "OPTION" | "CRYPTO_FUT";
export type OptionType = "CE" | "PE";
export type Exchange = "NSE" | "BSE" | "NFO" | "BINANCE" | "COINDCX" | "DELTA_EXCHANGE";

export interface EquityTradePayload {
  tradeId?: string;
  symbol: string;
  quantity: number;
  price: number;
  direction: TradeDirection;
  timestamp: string;
  timezone: string;
  broker: string;
  exchange: Exchange;
  mode: "trading" | "playground";
  notes?: string;
  psychology?: string;
  tags?: string[];
  customTags?: string[];
}

export interface OptionTradePayload {
  tradeId?: string;
  symbol: string;
  optionType: OptionType;
  strikePrice: number;
  expiryDate: string;
  lotSize: number;
  lots: number;
  quantity: number;
  price: number;
  direction: TradeDirection;
  timestamp: string;
  timezone: string;
  broker: string;
  exchange: Exchange;
  mode: "trading" | "playground";
  spotPrice?: number;
  iv?: number;
  delta?: number;
  gamma?: number;
  theta?: number;
  vega?: number;
  tags?: string[];
  customTags?: string[];
}

export interface CryptoTradePayload {
  tradeId?: string;
  symbol: string;
  direction: TradeDirection;
  status: "OPEN" | "CLOSED";
  price: number;
  futurePrice?: number;
  quantity: number;
  leverage: number;
  fees: number;
  currency: string;
  exchange: string;
  broker: string;
  timestamp: string;
  timezone: string;
  mode: "trading" | "playground";
  notes?: string;
  psychology?: string;
  tags?: string[];
  customTags?: string[];
}

export interface UpsertTradesRequest {
  userid: string;
  tradeType: TradeType;
  trades: EquityTradePayload[] | OptionTradePayload[] | CryptoTradePayload[];
  mode: "trading" | "playground";
  email?: string;
}

export interface UpsertTradesResponse {
  success: boolean;
  message: string;
  data: {
    insertedCount: number;
    updatedCount: number;
    insertedIds: string[];
    updatedIds: string[];
  };
  error: Record<string, unknown>;
}

export interface EquityTradeMetrics {
  pnl: number | null;
  avgPrice: number | null;
  netQuantity: number | null;
}

export interface OptionGreeks {
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  iv: number;
}

export interface OptionTradeMetrics {
  pnl: number | null;
  avgIV: number | null;
  avgTheta: number | null;
  avgGamma: number | null;
  avgDelta: number | null;
  avgVega: number | null;
  pointsCaptured: number | null;
  quantity: number;
  totalGreekQty: number;
  timeElapsed: number | null;
}

export interface Trade {
  tradeId: string;
  symbol: string;
  quantity: number;
  price: number;
  direction: TradeDirection;
  timestamp: string;
  timezone: string;
  broker: string;
  exchange: Exchange;
  tradeType?: TradeType;
  notes?: string;
  psychology?: string;
  tags?: string[];
  customTags?: string[];
  aiInsight?: null | string;
  metrices?: EquityTradeMetrics;
  optionType?: OptionType;
  strikePrice?: number;
  expiryDate?: string;
  lotSize?: number;
  lotsTraded?: number;
  spotPrice?: number;
  fullSymbol?: string;
  greeks?: OptionGreeks;
  optionMetrics?: OptionTradeMetrics;
  leverage?: number;
  fees?: number;
  currency?: string;
  futurePrice?: number;
  status?: "OPEN" | "CLOSED";
}

export interface PaginatedTradesResponse {
  success: boolean;
  message: string;
  data: {
    trades: Trade[];
    totalCount: number;
    pageno: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  error: Record<string, unknown>;
}

export interface PaginatedTradesParams {
  pageno: number;
  limit: number;
  userid: string;
  email?: string;
  tradetype: TradeType;
  mode: "trading" | "playground";
  isAscending?: boolean;
  sortBy?: string;
  fromDate?: string;
  toDate?: string;
  symbols?: string[];
  brokers?: string[];
  search?: string;
}

export interface DeleteTradePayload {
  userid: string;
  tradeType: TradeType;
  tradeId: string | string[];
  mode?: string;
}

export interface DeleteTradeResponse {
  success: boolean;
  message: string;
}

export interface UpdateNotesRequest {
  tradeId: string;
  notes: string;
  userId: string;
  tradeType: TradeType;
}

export interface UpdateNotesResponse {
  success: boolean;
  message: string;
}