// src/api/types/dashboard.types.ts

export interface DashboardApiResponse {
  success: boolean;
  message: string;
  data: DashboardData;
  error: Record<string, unknown>;
}

export interface DashboardData {
  user: UserInfo;
  cards: MetricCards;
  charts: DashboardCharts;
  openTrades: OpenTrade[];
}

export interface OptionsDashboardApiResponse {
  success: boolean;
  message: string;
  data: OptionsDashboardData;
  error: Record<string, unknown>;
}

export interface OptionsDashboardData {
  user: UserInfo;
  cards: OptionsMetricCards;
  charts: DashboardCharts;
  openTrades: OpenTrade[];
}

export interface UserInfo {
  userId?: string;
  name: string;
  email: string;
}

export interface MetricCards {
  profit: TimeRangeMetric;
  winRate: TimeRangeMetric;
  expectancyRate: TimeRangeMetric;
  drawdown: TimeRangeMetric;
  kellyRatio: TimeRangeMetric;
}

export interface OptionsMetricCards {
  pnl?: TimeRangeMetric;
  greeks?: GreeksData;
  ivAnalysis?: IVAnalysisData;
  pointsCaptured?: PointsCapturedData;
  topTradedOptions?: TopOptionsData;
}

export interface GreeksData {
  '1d': GreeksValues;
  '1w': GreeksValues;
  '1m': GreeksValues;
  '1y': GreeksValues;
}

export interface GreeksValues {
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
}

export interface IVAnalysisData {
  '1d': IVRangeData;
  '1w': IVRangeData;
  '1m': IVRangeData;
  '1y': IVRangeData;
}

export interface IVRangeData {
  buyGraph: number[];
  sellGraph: number[];
}

export interface PointsCapturedData {
  '1d': PointsData;
  '1w': PointsData;
  '1m': PointsData;
  '1y': PointsData;
}

export interface PointsData {
  total: number;
  breakdown: {
    nifty: number;
    banknifty: number;
    finnifty: number;
    others: number;
  };
}

export interface TopOptionsData {
  '1d': TopOption[];
  '1w': TopOption[];
  '1m': TopOption[];
  '1y': TopOption[];
}

export interface TopOption {
  symbol: string;
  count: number;
  pnl?: number;
}

export interface TimeRangeMetric {
  '1d': TimeRangeData;
  '1w': TimeRangeData;
  '1m': TimeRangeData;
  '1y': TimeRangeData;
}

export interface TimeRangeData {
  value: number;
  data: DataPoint[];  // API uses 'data'
  graphData?: DataPoint[]; // Component uses 'graphData' (added by transformation)
}

export interface DataPoint {
  timestamp: string;
  value: number;
}

export interface DashboardCharts {
  fullPnLChart: {
    '1d': PnLDataPoint[];
    '1w': PnLDataPoint[];
    '1m': PnLDataPoint[];
    '1y': PnLDataPoint[];
  };
}

export interface PnLDataPoint {
  timestamp: string;
  profit: number;
  loss: number;
  profitTrades?: number;
  lossTrades?: number;
}

export interface OpenTrade {
  tradeId?: string;
  symbol: string;
  direction: 'BUY' | 'SELL';
  timestamp: string;
  quantity: number;
  price: number;
}