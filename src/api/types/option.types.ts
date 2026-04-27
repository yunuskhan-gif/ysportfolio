export interface OptionGreeks {
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  iv: number;
}

export interface OptionTradeMetrics {
  pnl: number;
  avgIV: number;
  avgTheta: number;
  avgGamma: number;
  avgDelta: number;
  avgVega: number;
  pointsCaptured: number;
  quantity: number;
  totalGreekQty: number;
  timeElapsed: number;
}

export interface OptionTrade {
  email: string;
  userId: string;
  tradeId: string;
  username: string;
  symbol: string;
  lotSize: number;
  expiryDate: string;
  strikePrice: number;
  spotPrice: number;
  optionType: "CE" | "PE";
  direction: "BUY" | "SELL";
  lotsTraded: number;
  price: number;
  quantity: number;
  broker: string;
  exchange: string;
  timestamp: string;
  timezone: string;
  notes?: string;
  psychology?: string;
  tags?: string[];
  customTags?: string[];
  aiInsight?: null | string;
  greeks: OptionGreeks;
  metrices: OptionTradeMetrics;
}

export interface OptionOrderData {
  userId: string;
  email: string;
  tradeId: string;
  tradeType: "option";
  trades: OptionTrade[];
}

export interface OptionOrderResponse {
  success: boolean;
  message: string;
  data: OptionOrderData;
  error?: Record<string, unknown>;
}