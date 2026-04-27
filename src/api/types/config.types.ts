export interface UserConfigResponse {
  _id: string;
  email: string;
  userId: string;
  __v: number;
  brokers: string[];
  equityCustomTags: string[] | null;
  equityDashboardCards: string[];
  equityStrategies: string[] | null;
  isProfileCreated: boolean;
  lastSyncedAt: Record<string, string | null>;
  lastTrainingSyncedAt: Record<string, string | null>;
  mode: "TRADING" | "PLAYGROUND";
  optionCustomTags: string[] | null;
  optionDashboardCards: string[];
  optionStrategies: string[] | null;
  segments: string[];
  theme: string;
}

export interface ConfigQueryParams {
  userId?: string;
  email?: string;
}

export interface UpdateThemeConfig {
  email: string;
  userId: string;
  mode?: "TRADING" | "PLAYGROUND";
  theme?: string;
}

export interface UpdateSegmentsBrokersConfig {
  email: string;
  userId: string;
  segments?: string[];
  brokers?: string[];
}

export interface UpdateDashboardCardsConfig {
  email: string;
  userId: string;
  equityDashboardCards?: string[];
  optionDashboardCards?: string[];
}

export interface UpdateStrategiesConfig {
  email: string;
  userId: string;
  equityStrategies?: string[];
  optionStrategies?: string[];
}

export interface UpdateTagsConfig {
  email: string;
  userId: string;
  equityCustomTags?: string[];
  optionCustomTags?: string[];
}

export type UpdateConfigPayload = 
  | UpdateThemeConfig
  | UpdateSegmentsBrokersConfig
  | UpdateDashboardCardsConfig
  | UpdateStrategiesConfig
  | UpdateTagsConfig;

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  error: unknown;
}