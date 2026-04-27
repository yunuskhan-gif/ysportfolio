// src/components/profile/ProfilePhotoPopup.tsx
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Camera, Crop } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProfilePhotoCropPopup } from "./ProfilePhotoCropPopup";

interface ProfilePhotoPopupProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  currentPhotoUrl?: string | null;
  onUploadSuccess?: () => void;
}

export const ProfilePhotoPopup = ({
  isOpen,
  onClose,
  userId,
  currentPhotoUrl,
  onUploadSuccess,
}: ProfilePhotoPopupProps) => {
  const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showCrop, setShowCrop] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setProfilePicFile(file);
    setShowCrop(true);
  };

  const displayImage = previewUrl || currentPhotoUrl;

  const handleCropClose = () => {
    setShowCrop(false);
    setProfilePicFile(null);
    setPreviewUrl(null);
  };

  const handleCropSuccess = () => {
    setShowCrop(false);
    setProfilePicFile(null);
    setPreviewUrl(null);
    onUploadSuccess?.();
    onClose(); // Added this to close the popup after successful upload
  };

  const handleSkip = () => {
    onClose();
  };

  const handleMainClose = () => {
    if (showCrop) {
      setShowCrop(false);
      setProfilePicFile(null);
      setPreviewUrl(null);
    }
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-sm overflow-hidden">
        <Card className="w-[450px] relative overflow-hidden p-0 shadow-2xl">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 z-10"
            onClick={handleMainClose}
          >
            <X className="h-4 w-4" />
          </Button>

          <div className="p-6">
            <h2 className="text-2xl font-bold text-center mb-2">
              Profile Photo
            </h2>
            <p className="text-sm text-muted-foreground text-center mb-6">
              Add a profile picture to personalize your account
            </p>

            <div className="flex flex-col items-center gap-4">
              <div
                onClick={() =>
                  !profilePicFile &&
                  document.getElementById("photo-upload")?.click()
                }
                className={cn(
                  "h-32 w-32 rounded-full border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary transition relative group",
                  profilePicFile && "opacity-50 cursor-not-allowed",
                )}
              >
                {displayImage ? (
                  <img
                    src={displayImage}
                    alt="Preview"
                    className="h-32 w-32 rounded-full object-cover"
                  />
                ) : (
                  <Camera className="h-8 w-8 text-muted-foreground" />
                )}
              </div>

              <input
                id="photo-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />

              <div className="flex gap-3 w-full mt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleSkip}
                >
                  Skip for now
                </Button>
                <Button
                  className="flex-1"
                  disabled={!profilePicFile}
                  onClick={() => setShowCrop(true)}
                >
                  <Crop className="h-4 w-4 mr-2" />
                  Crop & Upload
                </Button>
              </div>
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
