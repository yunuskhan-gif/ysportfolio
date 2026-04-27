// src/api/types/reports.types.ts
export interface ReportsRequest {
  userid: string;
  email: string;
  symbols: string[];
  startTime: string;
  endTime: string;
  tradetype: string;
  mode: string;
}

export interface ReportsResponse {
  success: boolean;
  message: string;
  data: {
    netPl: number;
    grossProfit: number;
    grossLoss: number;
    averageProfit: number;
    averageLoss: number;
    averagePlPerTrade: number;
    medianPlPerTrade: number;
    averagePlPerDay: number;
    bestDayPl: number;
    worstDayPl: number;
    meanReturn: number;
    medianReturn: number;
    trimmedMeanReturn: number;
  };
  error: Record<string, never>;
}