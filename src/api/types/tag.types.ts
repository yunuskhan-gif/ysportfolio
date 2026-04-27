export interface UpsertTagRequest {
  tagName: string;
  description?: string;
  segment: 'EQUITY' | 'OPTION' | 'CRYPTO_FUT';
  userid: string;
  email: string;
}

export interface UpsertTagResponse {
  success: boolean;
  message: string;
  data: {
    _id: string;
    userId: string;
    tagName: string;
    __v: number;
    description?: string;
    email: string;
    segment: string;
    tagId: string;
  };
  error: Record<string, never>;
}

export interface Tag {
  _id: string;
  userId: string;
  tagName: string;
  __v: number;
  description?: string;
  email: string;
  segment: string;
  tagId: string;
}

export interface GetTagsResponse {
  success: boolean;
  message: string;
  data: Tag[];
  error: Record<string, never>;
}

export interface AddTagsToTradeRequest {
  userid: string;
  mode: 'trading' | 'playground';
  tradetype: 'EQUITY' | 'OPTION' | 'CRYPTO_FUT';
  tradeId: string;
  customTagList?: string[];
  tagList?: string[];
}

export interface AddTagsToTradeResponse {
  success: boolean;
  message: string;
  data: {
    trade: {
      _id: string;
      tradeId: string;
      userId: string;
      __v: number;
      aiInsight: null;
      broker: string;
      customTags: string[];
      direction: 'BUY' | 'SELL';
      email: string;
      exchange: string;
      metrices: {
        pnl: number | null;
        avgPrice: number;
        netQuantity: number;
      };
      notes: string;
      price: number;
      psychology: string;
      quantity: number;
      symbol: string;
      tags: string[];
      timestamp: string;
      timezone: string;
      username: string;
    };
  };
  error: Record<string, never>;
}

export interface DeleteTagsFromTradeRequest {
  userid: string;
  email: string;
  mode: 'trading' | 'playground';
  tradetype: 'EQUITY' | 'OPTION' | 'CRYPTO_FUT';
  tradeId: string;
  tags?: string[];
  customTags?: string[];
}

export interface DeleteTagsFromTradeResponse {
  success: boolean;
  message: string;
  data: {
    trade: {
      _id: string;
      tradeId: string;
      userId: string;
      __v: number;
      aiInsight: null;
      broker: string;
      customTags: string[];
      direction: 'BUY' | 'SELL';
      email: string;
      exchange: string;
      metrices: {
        pnl: number | null;
        avgPrice: number;
        netQuantity: number;
      };
      notes: string;
      price: number;
      psychology: string;
      quantity: number;
      symbol: string;
      tags: string[];
      timestamp: string;
      timezone: string;
      username: string;
    };
    deletedCustomTags: string[];
    notFoundCustomTags: string[];
    notFoundTagsInArray: string[];
    notFoundCustomTagsInArray: string[];
    message: string;
  };
  error: Record<string, never>;
}

export interface UpdateNotesRequest {
  userid: string;
  tradeId: string;
  tradetype: 'EQUITY' | 'OPTION' | 'CRYPTO_FUT';
  mode: 'trading' | 'playground';
  notes?: string;
  psychology?: string;
}

export interface UpdateNotesResponse {
  success: boolean;
  message: string;
  data: Record<string, never>;
  error: {
    statusCode: number;
    explanation: string;
  };
}