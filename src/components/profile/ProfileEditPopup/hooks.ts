// src/components/profile/ProfileEditPopup/hooks.ts
import { useState, useEffect, useRef } from "react";
import type { ProfileEditPopupProps } from "./types";
import type { ApiResponse, UserProfileResponse } from "@/api/types/profile.types";

interface FormData {
  userId: string;
  name: string;
  username: string;
  bio: string;
  email: string;
  location: string;
  profilePhoto: string;
  selectedSegments: string[];
  selectedTimezones: string[];
  selectedTradingStyles: string[];
}

type ProfileQueryResponse = ApiResponse<UserProfileResponse> | { success: boolean; data: null } | undefined;

export const useProfileForm = (
  currentProfile: ProfileEditPopupProps['currentProfile'], 
  profileData: ProfileQueryResponse
) => {
  const [formData, setFormData] = useState<FormData>({
    userId: currentProfile?.userId || "",
    name: currentProfile?.name || "",
    username: currentProfile?.username || "",
    bio: currentProfile?.bio || "",
    email: currentProfile?.email || "",
    location: currentProfile?.location || "",
    profilePhoto: currentProfile?.profilePhoto || "",
    selectedSegments: currentProfile?.tradingSegments || [],
    selectedTimezones: currentProfile?.selectedTimezones || [],
    selectedTradingStyles: currentProfile?.tradingStyles || [],
  });

  const hasInitialized = useRef(false);

  useEffect(() => {
    if (profileData && 'data' in profileData && profileData.data && !hasInitialized.current) {
      const profile = profileData.data;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        userId: profile.publicProfile?.userId || formData.userId,
        name: profile.publicProfile?.username || formData.name,
        username: profile.publicProfile?.userId || formData.username,
        bio: profile.publicProfile?.bio || formData.bio,
        email: profile.email || formData.email,
        location: profile.timezone?.[0] || formData.location,
        profilePhoto: profile.publicProfile?.profilePicUrl || formData.profilePhoto,
        selectedSegments: profile.segment?.filter(s => s !== "DEFAULT") || formData.selectedSegments,
        selectedTradingStyles: profile.tradingStyle?.filter(s => s !== "DEFAULT") || formData.selectedTradingStyles,
        selectedTimezones: profile.timezone || formData.selectedTimezones,
      });
      hasInitialized.current = true;
    }
  }, [profileData]);

  const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return { formData, updateField };
};