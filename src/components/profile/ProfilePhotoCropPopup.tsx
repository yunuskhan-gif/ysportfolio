// src/components/profile/ProfilePhotoCropPopup.tsx
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Loader2, Check, Crop } from "lucide-react";
import { useUploadProfilePicture } from "@/api/hooks/useProfileQuery";
import { toast } from "sonner";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";

interface ProfilePhotoCropPopupProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  imageFile: File;
  onUploadSuccess?: () => void;
}

export const ProfilePhotoCropPopup = ({
  isOpen,
  onClose,
  userId,
  imageFile,
  onUploadSuccess,
}: ProfilePhotoCropPopupProps) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>("");

  const uploadProfilePicture = useUploadProfilePicture();

  useEffect(() => {
    const url = URL.createObjectURL(imageFile);
    setImageUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  if (!isOpen) return null;

  const onCropComplete = (_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const createCroppedImage = async (): Promise<File> => {
    if (!croppedAreaPixels) throw new Error("No crop area selected");

    const image = new Image();
    image.src = imageUrl;
    await new Promise((resolve) => {
      image.onload = resolve;
    });

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not get canvas context");

    canvas.width = croppedAreaPixels.width;
    canvas.height = croppedAreaPixels.height;

    ctx.drawImage(
      image,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("Canvas to blob failed"));
          return;
        }
        const croppedFile = new File([blob], imageFile.name, {
          type: imageFile.type,
        });
        resolve(croppedFile);
      }, imageFile.type);
    });
  };

  const handleUpload = async () => {
    if (!userId || !croppedAreaPixels) return;

    setIsUploading(true);
    try {
      const croppedFile = await createCroppedImage();
      await uploadProfilePicture.mutateAsync({
        userId: userId,
        file: croppedFile,
      });
      toast.success("Profile picture uploaded successfully");
      onUploadSuccess?.();
      onClose();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Failed to upload profile picture");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-sm overflow-hidden">
      <Card className="w-[550px] relative overflow-hidden p-0 shadow-2xl">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 z-10"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>

        <div className="p-6">
          <h2 className="text-2xl font-bold text-center mb-2">
            Crop Profile Photo
          </h2>
          <p className="text-sm text-muted-foreground text-center mb-6">
            Adjust and crop your photo to get the perfect profile picture
          </p>

          <div className="relative h-[300px] w-full bg-muted rounded-lg overflow-hidden mb-4">
            <Cropper
              image={imageUrl}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              cropShape="round"
              showGrid={false}
              classes={{
                containerClassName: "rounded-lg",
              }}
            />
          </div>

          <div className="flex items-center gap-4 mb-6">
            <Crop className="h-4 w-4 text-muted-foreground" />
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="flex gap-3 w-full">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleSkip}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleUpload}
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Save
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
