export interface CalendarTrade {
  tradeId: string;
  symbol: string;
  direction: "BUY" | "SELL";
  price: number;
  quantity: number;
  timestamp: string;
  timezone: string;
  broker: string;
  exchange: string;
  notes?: string;
  psychology?: string;
  tags?: string[];
  customTags?: string[];
  aiInsight?: null | string;
  netPL?: number;
  netPosition?: number;
  metrices?: {
    pnl: number;
    avgPrice: number;
    netQuantity: number;
  };
  greeks?: {
    delta: number;
    gamma: number;
    theta: number;
    vega: number;
    iv: number;
  };
  optionType?: "CE" | "PE";
  strikePrice?: number;
  expiryDate?: string;
  lotSize?: number;
  lotsTraded?: number;
  spotPrice?: number;
}

export interface CalendarApiResponse {
  [date: string]: CalendarTrade[];
}