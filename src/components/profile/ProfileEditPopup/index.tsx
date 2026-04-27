// src/components/profile/ProfileEditPopup/ProfileEditPopup.tsx
import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  X,
  User,
  Briefcase,
  Globe,
  Loader2,
  Clock,
  Save,
  Camera,
} from "lucide-react";
import {
  useProfile,
  useUpdateProfile,
  useUploadProfilePicture,
  useUpdateEmail,
} from "@/api/hooks/useProfileQuery";
import { toast } from "sonner";

import { useProfileForm } from "./hooks";
import type { ProfileEditPopupProps } from "./types";
import type { UserProfileRequest } from "@/api/types/profile.types";
import { timezones, segments, tradingStyles } from "./constants";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { ProfilePhotoCropPopup } from "../ProfilePhotoCropPopup";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "public", label: "Public Profile", icon: User },
  { id: "trading", label: "Trading Preferences", icon: Briefcase },
  { id: "preferences", label: "Regional Settings", icon: Globe },
];

export const ProfileEditPopup = ({
  isOpen,
  onClose,
  userId,
  currentProfile,
  onProfileUpdate,
}: ProfileEditPopupProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    data: profileData,
    isLoading: isLoadingProfile,
    refetch,
  } = useProfile({
    userId,
  });
  const updateProfileMutation = useUpdateProfile();
  const updateEmailMutation = useUpdateEmail();
  const uploadProfilePicture = useUploadProfilePicture();
  const { formData, updateField } = useProfileForm(currentProfile, profileData);

  const [activeTab, setActiveTab] = useState("public");
  const [isUploading, setIsUploading] = useState(false);
  const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showCrop, setShowCrop] = useState(false);

  const [originalData, setOriginalData] = useState({
    bio: "",
    email: "",
    profilePhoto: "",
    selectedSegments: [] as string[],
    selectedTradingStyles: [] as string[],
    selectedTimezones: [] as string[],
    userId: "",
    displayName: "",
  });

  useEffect(() => {
    if (profileData?.data) {
      const profile = profileData.data;
      setOriginalData({
        bio: profile.publicProfile?.bio || "",
        email: profile.email || "",
        profilePhoto: profile.publicProfile?.profilePicUrl || "",
        selectedSegments: profile.segment?.filter((s) => s !== "DEFAULT") || [],
        selectedTradingStyles:
          profile.tradingStyle?.filter((s) => s !== "DEFAULT") || [],
        selectedTimezones: profile.timezone || [],
        userId: profile.publicProfile?.userId || "",
        displayName: profile.publicProfile?.username || "",
      });

      updateField("userId", profile.publicProfile?.userId || "");
      updateField("name", profile.publicProfile?.username || "");
      updateField("bio", profile.publicProfile?.bio || "");
      updateField("email", profile.email || "");
      updateField(
        "selectedSegments",
        profile.segment?.filter((s) => s !== "DEFAULT") || [],
      );
      updateField(
        "selectedTradingStyles",
        profile.tradingStyle?.filter((s) => s !== "DEFAULT") || [],
      );
      updateField("selectedTimezones", profile.timezone || []);
    }
  }, [profileData]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setProfilePicFile(file);
    setShowCrop(true);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const displayImage = previewUrl || formData.profilePhoto;

  const handleCropClose = () => {
    setShowCrop(false);
    setProfilePicFile(null);
    setPreviewUrl(null);
  };

  const handleCropSuccess = () => {
    setShowCrop(false);
    setProfilePicFile(null);
    setPreviewUrl(null);
    refetch();
  };

  const hasProfileFieldsChanged = () => {
    return formData.bio !== originalData.bio;
  };

  const hasTradingFieldsChanged = () => {
    return (
      JSON.stringify(formData.selectedSegments) !==
        JSON.stringify(originalData.selectedSegments) ||
      JSON.stringify(formData.selectedTradingStyles) !==
        JSON.stringify(originalData.selectedTradingStyles)
    );
  };

  const hasTimezoneFieldsChanged = () => {
    return (
      JSON.stringify(formData.selectedTimezones) !==
      JSON.stringify(originalData.selectedTimezones)
    );
  };

  const hasEmailChanged = () => {
    return formData.email !== originalData.email;
  };

  const hasProfilePhotoChanged = () => {
    return (
      profilePicFile !== null ||
      formData.profilePhoto !== originalData.profilePhoto
    );
  };

  const handleProfilePictureUpload = async () => {
    if (!userId || !profilePicFile) return null;

    setIsUploading(true);
    try {
      const response = await uploadProfilePicture.mutateAsync({
        userId: userId,
        file: profilePicFile,
      });

      if (response.data?.publicProfile?.profilePicUrl) {
        const newPhotoUrl = response.data.publicProfile.profilePicUrl;
        updateField("profilePhoto", newPhotoUrl);
        setProfilePicFile(null);
        setPreviewUrl(null);
        toast.success("Profile picture uploaded successfully");
        return newPhotoUrl;
      }
    } catch (error) {
      toast.error("Failed to upload profile picture");
      throw error;
    } finally {
      setIsUploading(false);
    }
    return null;
  };

  const handleSave = async () => {
    if (!userId) {
      toast.error("User ID is missing");
      return;
    }

    const profilePhotoChanged = hasProfilePhotoChanged();
    const profileFieldsChanged = hasProfileFieldsChanged();
    const tradingFieldsChanged = hasTradingFieldsChanged();
    const timezoneFieldsChanged = hasTimezoneFieldsChanged();
    const emailChanged = hasEmailChanged();

    if (
      !profilePhotoChanged &&
      !profileFieldsChanged &&
      !tradingFieldsChanged &&
      !timezoneFieldsChanged &&
      !emailChanged
    ) {
      toast.info("No changes detected");
      onClose();
      return;
    }

    try {
      if (profilePhotoChanged && profilePicFile) {
        await handleProfilePictureUpload();
      }

      if (emailChanged) {
        await updateEmailMutation.mutateAsync({
          userId: userId,
          newEmail: formData.email,
        });
      }

      if (
        profileFieldsChanged ||
        tradingFieldsChanged ||
        timezoneFieldsChanged
      ) {
        const updateData: UserProfileRequest = {
          userId: userId,
        };

        if (profileFieldsChanged) {
          updateData.publicProfile = {
            bio: formData.bio,
          };
        }

        if (tradingFieldsChanged) {
          updateData.tradingStyle = formData.selectedTradingStyles;
          updateData.segment = formData.selectedSegments;
        }

        if (timezoneFieldsChanged) {
          updateData.timezone = formData.selectedTimezones;
        }

        await updateProfileMutation.mutateAsync(updateData);
      }

      await refetch();
      onProfileUpdate?.();
      onClose();
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to update profile");
    }
  };

  const isSaving =
    updateProfileMutation.isPending ||
    isUploading ||
    updateEmailMutation.isPending;

  const renderContent = () => {
    if (isLoadingProfile) {
      return (
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      );
    }

    switch (activeTab) {
      case "public":
        return (
          <div className="space-y-6 pr-3">
            <div>
              <h3 className="text-lg font-semibold mb-4">Profile Photo</h3>
              <div className="flex items-start gap-6">
                <div className="relative group">
                  {/* Profile Image */}
                  <div className="h-24 w-24 rounded-full border-2 border-border overflow-hidden flex-shrink-0 bg-muted">
                    {displayImage ? (
                      <img
                        src={displayImage}
                        alt="Profile"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                        <User className="h-8 w-8" />
                      </div>
                    )}
                  </div>

                  {/* Upload Button with useRef */}
                  <button
                    onClick={handleButtonClick}
                    disabled={isUploading}
                    className={cn(
                      "absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center cursor-pointer shadow-lg transition-all",
                      isUploading
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:scale-110 hover:bg-primary/90",
                    )}
                  >
                    {isUploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Camera className="h-4 w-4" />
                    )}
                  </button>

                  {/* Hidden File Input with useRef */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={isUploading}
                    className="hidden"
                  />
                </div>

                <div className="flex-1 space-y-2">
                  <p className="text-sm font-medium">Upload new photo</p>
                  <p className="text-xs text-muted-foreground">
                    Click the camera icon to upload. Recommended: Square image,
                    at least 400x400px.
                  </p>
                  {isUploading && (
                    <p className="text-xs text-primary flex items-center gap-2">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Uploading...
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  User ID
                </label>
                <div className="flex items-center">
                  <span className="text-muted-foreground bg-muted px-3 py-2 border border-r-0 rounded-l-md text-sm">
                    @
                  </span>
                  <Input
                    value={originalData.userId}
                    disabled={true}
                    className="rounded-l-none bg-muted"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  User ID cannot be changed
                </p>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Display Name
                </label>
                <Input
                  value={originalData.displayName}
                  disabled={true}
                  className="w-full bg-muted"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Display name cannot be changed
                </p>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Email</label>
                <Input
                  value={formData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  placeholder="your.email@example.com"
                  type="email"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Bio</label>
                <Textarea
                  placeholder="Tell others about your trading journey, strategies, and experience..."
                  value={formData.bio}
                  onChange={(e) => updateField("bio", e.target.value)}
                  rows={4}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Brief description for your profile. Max 160 characters.
                </p>
              </div>
            </div>
          </div>
        );

      case "trading":
        return (
          <div className="space-y-6 pr-3">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Trading Segments</h3>
                <Badge variant="secondary" className="px-2">
                  {formData.selectedSegments.length} selected
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {segments.map((segment) => {
                  const isSelected =
                    formData.selectedSegments.includes(segment);
                  return (
                    <div
                      key={segment}
                      className={`flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer ${
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => {
                        const newSegments = isSelected
                          ? formData.selectedSegments.filter(
                              (s) => s !== segment,
                            )
                          : [...formData.selectedSegments, segment];
                        updateField("selectedSegments", newSegments);
                      }}
                    >
                      <span className="text-sm font-medium">{segment}</span>
                      {isSelected ? (
                        <Check className="h-4 w-4 text-primary" />
                      ) : (
                        <div className="h-4 w-4" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Trading Styles</h3>
                <Badge variant="secondary" className="px-2">
                  {formData.selectedTradingStyles.length} selected
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {tradingStyles.map((style) => {
                  const isSelected =
                    formData.selectedTradingStyles.includes(style);
                  return (
                    <div
                      key={style}
                      className={`flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer ${
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => {
                        const newStyles = isSelected
                          ? formData.selectedTradingStyles.filter(
                              (s) => s !== style,
                            )
                          : [...formData.selectedTradingStyles, style];
                        updateField("selectedTradingStyles", newStyles);
                      }}
                    >
                      <span className="text-sm font-medium">{style}</span>
                      {isSelected ? (
                        <Check className="h-4 w-4 text-primary" />
                      ) : (
                        <div className="h-4 w-4" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );

      case "preferences":
        return (
          <div className="space-y-6 pr-3">
            <div>
              <h3 className="text-lg font-semibold mb-4">Location</h3>
              <Input
                value={formData.location || ""}
                onChange={(e) => updateField("location", e.target.value)}
                placeholder="City, Country"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Time Zones</h3>
                <Badge variant="secondary" className="px-2">
                  {formData.selectedTimezones.length} selected
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {timezones.map((tz) => {
                  const isSelected = formData.selectedTimezones.includes(tz);
                  return (
                    <div
                      key={tz}
                      className={`flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer ${
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => {
                        const newTimezones = isSelected
                          ? formData.selectedTimezones.filter((t) => t !== tz)
                          : [...formData.selectedTimezones, tz];
                        updateField("selectedTimezones", newTimezones);
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{tz}</span>
                      </div>
                      {isSelected && <Check className="h-4 w-4 text-primary" />}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-sm overflow-hidden">
        <Card className="w-[1000px] h-[600px] relative overflow-hidden p-0 shadow-2xl flex flex-col">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 z-10"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>

          <div className="flex flex-col h-full">
            <div className="px-6 py-4 border-b border-border">
              <h2 className="text-2xl font-bold">Edit Profile</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Customize your public profile and trading preferences
              </p>
            </div>

            <div className="flex-1 flex min-h-0">
              <div className="w-56 bg-muted/30 border-r border-border p-3">
                <div className="space-y-1">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center cursor-pointer gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                {renderContent()}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-border flex justify-end gap-3">
              <Button variant="outline" onClick={onClose} disabled={isSaving}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {profilePicFile && showCrop && (
        <ProfilePhotoCropPopup
          isOpen={showCrop}
          onClose={handleCropClose}
          userId={userId}
          imageFile={profilePicFile}
          onUploadSuccess={handleCropSuccess}
        />
      )}
    </>
  );
};

export default ProfileEditPopup;
