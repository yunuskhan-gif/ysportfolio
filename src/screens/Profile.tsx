// src/pages/Profile.tsx
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCookie } from "@/hooks/useCookie";
import { User, Mail, MapPin, Shield } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Profile = () => {
  const { userName, userEmail } = useCookie();

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <Card className="shadow-none border-border bg-card">
        <CardHeader className="flex flex-row items-center gap-4 pb-4">
          <Avatar className="h-16 w-16 border-2 border-primary/20">
            <AvatarImage src="" />
            <AvatarFallback className="text-xl font-bold bg-primary/10 text-primary">
              {userName?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-xl">{userName || "User"}</CardTitle>
            <p className="text-sm text-muted-foreground">{userEmail || "No email linked"}</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
              <User className="w-4 h-4 text-primary" />
              <div>
                <p className="text-[10px] uppercase font-bold text-muted-foreground">Username</p>
                <p className="text-sm font-medium">{userName || "N/A"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
              <Mail className="w-4 h-4 text-primary" />
              <div>
                <p className="text-[10px] uppercase font-bold text-muted-foreground">Email</p>
                <p className="text-sm font-medium truncate max-w-[150px]">{userEmail || "N/A"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
              <MapPin className="w-4 h-4 text-primary" />
              <div>
                <p className="text-[10px] uppercase font-bold text-muted-foreground">Location</p>
                <p className="text-sm font-medium">India</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
              <Shield className="w-4 h-4 text-primary" />
              <div>
                <p className="text-[10px] uppercase font-bold text-muted-foreground">Account Type</p>
                <p className="text-sm font-medium">YS Portfolio Pro</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-none border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between p-2 hover:bg-secondary/20 rounded-md cursor-pointer transition-colors">
            <span className="text-sm">Dark Mode</span>
            <div className="w-8 h-4 bg-primary rounded-full relative">
              <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full shadow-sm" />
            </div>
          </div>
          <div className="flex items-center justify-between p-2 hover:bg-secondary/20 rounded-md cursor-pointer transition-colors text-red-500">
            <span className="text-sm">Logout</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
