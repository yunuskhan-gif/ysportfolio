// src/components/profile/ProfileEditPopup/types.ts

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