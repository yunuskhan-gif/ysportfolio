// ProfileHeader.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail } from "lucide-react";
import { toast } from "sonner";

interface UserProfile {
  name: string;
  userId: string;
  profilePhoto: string;
  location: string;
  tradingSegments: string[];
  tradingStyles: string[];
  bio: string;
  email: string;
}

interface ProfileHeaderProps {
  userProfile: UserProfile;
  isOwnProfile?: boolean;
  onViewDashboard?: () => void;
  onEditProfile?: () => void;
}

const ProfileHeader = ({
  userProfile,
  isOwnProfile = false,
  onViewDashboard,
  onEditProfile,
}: ProfileHeaderProps) => {
  const handleCopyEmail = () => {
    navigator.clipboard.writeText(userProfile.email);
    toast.success("Email copied to clipboard");
  };

  const handleCopyUserId = () => {
    navigator.clipboard.writeText(userProfile.userId);
    toast.success("User ID copied to clipboard");
  };

  return (
    <Card className="border-0 shadow-none bg-transparent">
      <CardContent className="p-4 space-y-4">
        <div className="flex justify-center">
          <div className="h-32 w-32 md:h-40 md:w-40 rounded-full border shadow-inner p-0.5 overflow-hidden">
            {userProfile.profilePhoto ? (
              <img
                src={userProfile.profilePhoto}
                className="h-full w-full rounded-full object-cover"
                alt="profile"
              />
            ) : (
              <div className="h-full w-full rounded-full bg-muted flex items-center justify-center text-lg font-medium text-muted-foreground">
                {userProfile.name?.charAt(0)?.toUpperCase()}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <h1 className="text-xl font-bold">{userProfile.name}</h1>
            <div
              className="flex items-center gap-1 text-sm text-muted-foreground cursor-pointer hover:text-primary mt-1"
              onClick={handleCopyUserId}
            >
              <span className="font-semibold">@</span>
              <span>{userProfile.userId}</span>
            </div>
          </div>

          <p className="text-xs leading-relaxed">{userProfile.bio}</p>

          {isOwnProfile ? (
            <Button
              size="sm"
              variant="outline"
              className="w-full"
              onClick={onEditProfile}
            >
              Edit Profile
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="w-full"
              onClick={onViewDashboard}
            >
              View Dashboard
            </Button>
          )}

          {userProfile.email && (
            <div
              className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary"
              onClick={handleCopyEmail}
            >
              <Mail className="w-4 h-4" />
              <span>{userProfile.email}</span>
            </div>
          )}

          {userProfile.location && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>📍</span>
              <span>{userProfile.location}</span>
            </div>
          )}

          <div className="pt-2">
            <h3 className="text-sm font-semibold mb-2">Trading Segments</h3>
            <div className="flex flex-wrap gap-2">
              {userProfile.tradingSegments.map((segment, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="px-3 py-1 text-xs"
                >
                  {segment}
                </Badge>
              ))}
            </div>
          </div>

          {userProfile.tradingStyles.length > 0 && (
            <div className="pt-2">
              <h3 className="text-sm font-semibold mb-2">Trading Styles</h3>
              <div className="flex flex-wrap gap-2">
                {userProfile.tradingStyles.map((style, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="px-3 py-1 text-xs"
                  >
                    {style}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileHeader;
