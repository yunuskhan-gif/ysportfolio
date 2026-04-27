export interface EquityTradeMetrics {
  pnl: number;
  avgPrice: number;
  netQuantity: number;
}

export interface EquityTrade {
  email: string;
  userId: string;
  tradeId: string;
  username: string;
  price: number;
  quantity: number;
  symbol: string;
  direction: "BUY" | "SELL";
  broker: string;
  exchange: string;
  timestamp: string;
  timezone: string;
  notes?: string;
  psychology?: string;
  tags?: string[];
  customTags?: string[];
  aiInsight?: null | string;
  metrices: EquityTradeMetrics;
}

export interface EquityOrderData {
  userId: string;
  email: string;
  tradeId: string;
  tradeType: "equity";
  trades: EquityTrade[];
}

export interface EquityOrderResponse {
  success: boolean;
  message: string;
  data: EquityOrderData;
  error?: Record<string, unknown>;
}

export interface OptionTradeMetrics {
  pnl: number;
  avgPrice: number;
  netQuantity: number;
  premium?: number;
  strike?: number;
  expiry?: string;
  optionType?: 'CE' | 'PE';
}

export interface OptionTrade {
  email: string;
  userId: string;
  tradeId: string;
  username: string;
  price: number;
  quantity: number;
  symbol: string;
  direction: "BUY" | "SELL";
  broker: string;
  exchange: string;
  timestamp: string;
  timezone: string;
  notes?: string;
  psychology?: string;
  tags?: string[];
  customTags?: string[];
  aiInsight?: null | string;
  metrices: OptionTradeMetrics;
  // Option-specific fields
  strikePrice?: number;
  expiryDate?: string;
  optionType?: 'CE' | 'PE';
  contractSize?: number;
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