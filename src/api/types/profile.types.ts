// src/api/types/profile.types.ts
export interface PublicProfile {
  userId: string;
  profilePicUrl?: string | null;
  username: string;
  bio: string;
}

export interface MentorMentee {
  userId: string;
  profilePicUrl?: string | null;
  username: string;
  bio: string;
}

export interface PendingMentor {
  userId: string;
  profilePicUrl?: string | null;
  username: string;
  bio: string;
}

export interface LifetimeMetrics {
  winRate: number | null;
  totalTrades: number | null;
  avgPnL: number | null;
  totalPnL: number | null;
}

export interface UserProfileResponse {
  publicProfile: PublicProfile;
  email: string;
  segment: string[];
  timezone: string[];
  tradingStyle: string[];
  mentors: {
    [key: string]: MentorMentee[];
  };
  mentees: {
    [key: string]: MentorMentee[];
  };
  pendingMentors: {
    [key: string]: PendingMentor[];
  };
  pendingMentees: {
    [key: string]: PendingMentor[];
  };
  lifetimeEquityMetrices: LifetimeMetrics;
  lifetimeOptionMetrices: LifetimeMetrics;
}

export interface UserJournalConfig {
  _id: string;
  userId: string;
  email: string;
  __v: number;
  brokers: string[];
  equityCustomTags: string[] | null;
  equityDashboardCards: string[];
  equityStrategies: string[] | null;
  isProfileCreated: boolean;
  lastSyncedAt: {
    ANGELONE: string | null;
    FYERS: string | null;
    ZERODHA: string | null;
    UPSTOX: string | null;
    FIVEPAISA: string | null;
  };
  lastTrainingSyncedAt: {
    ANGELONE: string | null;
    FYERS: string | null;
    ZERODHA: string | null;
    UPSTOX: string | null;
    FIVEPAISA: string | null;
  };
  mode: string;
  optionCustomTags: string[] | null;
  optionDashboardCards: string[];
  optionStrategies: string[] | null;
  segments: string[];
  theme: string;
}

export interface UpdateUserIdResponse {
  userProfile: UserProfileResponse;
  userJournalConfig: UserJournalConfig;
}

// src/api/types/profile.types.ts
export interface UserProfileRequest {
  userId?: string;
  publicProfile?: {
    userId?: string;
    profilePicUrl?: string;
    username?: string;
    bio?: string;
  };
  email?: string;
  segment?: string[];
  timezone?: string[];
  tradingStyle?: string[];
}

export interface UpdateProfileRequest {
  userId: string;
  publicProfile?: {
    userId?: string;
    profilePicUrl?: string;
    username?: string;
    bio?: string;
  };
  segment?: string[];
  timezone?: string[];
  tradingStyle?: string[];
}

export interface ProfileEditData {
  name: string;
  username: string;
  userId: string;
  profilePhoto: string;
  location: string;
  selectedTimezones: string[];
  tradingSegments: string[];
  tradingStyles: string[];
  bio: string;
  email: string;
}

export interface ProfileEditPopupProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  currentProfile: ProfileEditData;
  onProfileUpdate?: () => void;
}

export interface ProfileUpdateData {
  userId: string;
  publicProfile: {
    userId: string;
    username: string;
    bio: string;
    profilePicUrl: string;
  };
  tradingStyle: string[];
  segment: string[];
  timezone: string[];
  email: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  error: {
    statusCode?: number;
    explanation?: string;
  };
}

export interface ProfileQueryParams {
  userId?: string;
  email?: string;
}

export interface HeatmapData {
  [date: string]: {
    pnl: number;
    trades: number;
    winRate: number;
  };
}

export interface HeatmapResponse {
  userId: string;
  year: number;
  data: HeatmapData;
}

export type AllUsersResponse = ApiResponse<PublicProfile[]>;