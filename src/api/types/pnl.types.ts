// src/api/types/pnl.types.ts
export interface PnLApiResponse {
  success: boolean;
  message: string;
  data: {
    calander: PnLEntry[];
  };
  error: unknown;
}

export interface PnLEntry {
  timestamp: string;
  pnl: number;
  tradesCount: number;
  individualPnL: IndividualPnL[];
}

export interface IndividualPnL {
  tradeId: string;
  name: string;
  trades: number;
  pnl: number;
}