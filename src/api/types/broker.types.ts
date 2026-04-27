// Common response wrapper
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  error: Record<string, unknown>;
}

// Upstox Types
export interface UpstoxCredentialsRequest {
  clientId: string;
  apiKey: string;
  apiSecret: string;
}

export interface UpstoxCredentialsResponse {
  upstoxCredentials: {
    _id: string;
    email: string;
    __v: number;
    apiKey: string;
    apiSecret: string;
    clientId: string;
    createdAt: string;
    isVerified: boolean;
    lastLoginAt: string | null;
    tokens: Record<string, unknown> | null;
    updatedAt: string;
  };
}

// Zerodha Types
export interface ZerodhaCredentialsRequest {
  clientId: string;
  apiKey: string;
  apiSecret: string;
}

export interface ZerodhaCredentialsResponse {
  zerodhaCredentials: {
    _id: string;
    email: string;
    __v: number;
    apiKey: string;
    apiSecret: string;
    clientId: string;
    createdAt: string;
    isVerified: boolean;
    lastLoginAt: string | null;
    tokens: Record<string, unknown> | null;
    updatedAt: string;
  };
}

// Fyers Types
export interface FyersCredentialsRequest {
  fyersId: string;
  appId: string;
  appSecret: string;
}

export interface FyersCredentialsResponse {
  fyersCredentials: {
    _id: string;
    __v: number;
    app_id: string;
    app_secret: string;
    app_type: string;
    createdAt: string;
    email: string;
    fyers_id: string;
    isVerified: boolean;
    lastLoginAt: string | null;
    tokens: Record<string, unknown> | null;
    updatedAt: string;
  };
}

// AngelOne Types
export interface AngelOneTokens {
  accessToken: string;
  refreshToken: string;
  feedToken: string;
  tokenGeneratedAt: string;
  tokenExpiryAt: string;
}

export interface AngelOneCredentialsRequest {
  clientId: string;
  apiKey: string;
  tokens?: AngelOneTokens;
}

export interface AngelOneCredentialsResponse {
  angelOneCredentials: {
    _id: string;
    email: string;
    __v: number;
    apiKey: string;
    clientId: string;
    createdAt: string;
    isVerified: boolean;
    lastLoginAt: string | null;
    tokens: AngelOneTokens | null;
    updatedAt: string;
  };
}

// CoinDCX Types
export interface CoinDcxCredentialsRequest {
  apiKey: string;
  secretKey: string;
}

export interface CoinDcxCredentialsResponse {
  coinDcxCredentials: {
    _id: string;
    email: string;
    __v: number;
    apiKey: string;
    createdAt: string;
    isVerified: boolean;
    lastLoginAt: string | null;
    tokens: {
      apiKey: string;
      secretKey: string;
      tokenGeneratedAt: string;
      tokenExpiryAt: string;
    } | null;
    updatedAt: string;
  };
}

// Delta Exchange Types
export interface DeltaExchangeCredentialsRequest {
  apiKey: string;
  secretKey: string;
}

export interface DeltaExchangeCredentialsResponse {
  deltaExchangeCredentials: {
    _id: string;
    email: string;
    __v: number;
    apiKey: string;
    createdAt: string;
    isVerified: boolean;
    lastLoginAt: string | null;
    tokens: {
      apiKey: string;
      secretKey: string;
      tokenGeneratedAt: string;
      tokenExpiryAt: string;
    } | null;
    updatedAt: string;
  };
}

// Broker Login Response - backend handles redirect automatically
export interface BrokerLoginResponse {
  success: boolean;
  message: string;
  data: null; // Backend handles redirect, no data needed
  error: Record<string, unknown>;
}

// Broker status type for UI
export type BrokerType =
  | "upstox"
  | "zerodha"
  | "fyers"
  | "angelone"
  | "coindcx"
  | "deltaexchange";

export interface BrokerStatus {
  isConnected: boolean;
  isVerified: boolean;
  broker: BrokerType;
  lastLoginAt: string | null;
}

// Union type for all broker credentials
export type BrokerCredentials =
  | UpstoxCredentialsRequest
  | ZerodhaCredentialsRequest
  | FyersCredentialsRequest
  | AngelOneCredentialsRequest
  | CoinDcxCredentialsRequest
  | DeltaExchangeCredentialsRequest;

// Union type for all broker responses
export type BrokerCredentialsResponse =
  | UpstoxCredentialsResponse
  | ZerodhaCredentialsResponse
  | FyersCredentialsResponse
  | AngelOneCredentialsResponse
  | CoinDcxCredentialsResponse
  | DeltaExchangeCredentialsResponse;

  // Sync Brokers Types
export interface SyncBrokersPayload {
  brokers?: string[];
  mode: "testing" | "playground" | "trading";
}
export interface SyncBrokersResponse {
  success: boolean;
  message: string;
  data: {
    syncedBrokers: BrokerType[];
    failedBrokers?: BrokerType[];
  } | null;
  error: Record<string, unknown>;
}

export interface CryptoSyncResponse {
  success: boolean;
  message: string;
  data: {
    syncedBrokers: string[];
    skippedBrokers: string[];
    cryptoFut: {
      inserted: number;
      updated: number;
      filteredOut: number;
    };
    cryptoOpt: {
      inserted: number;
      updated: number;
      filteredOut: number;
    };
  } | null;
  error: Record<string, unknown>;
}