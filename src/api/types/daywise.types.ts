export interface UpsertAnalysisRequest {
  userid: string;
  email: string;
  tradetype: 'EQUITY' | 'OPTION' | 'CRYPTO_FUT';
  mode: 'trading' | 'playground';
  timezone: string;
  timestamp: string;
  preMarketAnalysis: string;
  postMarketAnalysis: string;
  aiInsights: string;
}

export interface UpsertAnalysisResponse {
  success: boolean;
  message: string;
  data: {
    nModified: number;
    nUpserted: number;
  };
  error: Record<string, never>;
}

export interface DaywiseAnalysis {
  _id: string;
  userid: string;
  email: string;
  tradetype: 'EQUITY' | 'OPTION' | 'CRYPTO_FUT';
  mode: 'trading' | 'playground';
  timezone: string;
  timestamp: string;
  year: number;
  month: number;
  day: number;
  preMarketAnalysis: string;
  postMarketAnalysis: string;
  aiInsights: string;
  __v: number;
}

export interface DaywiseAnalysisResponse {
  success: boolean;
  message: string;
  data: DaywiseAnalysis;
  error: Record<string, never>;
}

export interface MonthlyAnalysisResponse {
  success: boolean;
  message: string;
  data: DaywiseAnalysis[];
  error: Record<string, never>;
}