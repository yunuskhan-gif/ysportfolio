"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Camera,
  CreditCard,
  Calendar,
  User,
  CheckCircle2,
  ShieldCheck,
  Loader2,
  ArrowRight,
  Upload,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [panNumber, setPanNumber] = useState("");
  const [dob, setDob] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [profileCompleted, setProfileCompleted] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const data = await res.json();
          if (data.profile) {
            setUsername(data.profile.username || "");
            setFullName(data.profile.fullName || "");
            setPanNumber(data.profile.panNumber || "");
            setDob(data.profile.dob || "");
            setAvatarUrl(data.profile.avatarUrl || "");
            setProfileCompleted(Boolean(data.profile.profileCompleted));
          }
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  // Handle DP Image selection & compress to clean DataURL
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file (JPG, PNG, WEBP)");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_SIZE = 280;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.85);
        setAvatarUrl(compressedBase64);
        toast.success("Profile picture selected!");
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPan = panNumber.trim().toUpperCase();
    const cleanDob = dob.trim();

    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(cleanPan)) {
      toast.error("Invalid PAN format! Must be 10 characters (e.g., ABCDE1234F)");
      return;
    }

    if (!cleanDob) {
      toast.error("Please select your Date of Birth");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          panNumber: cleanPan,
          dob: cleanDob,
          avatarUrl,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Profile completed & verified!");
        const wasIncomplete = !profileCompleted;
        setProfileCompleted(true);
        if (wasIncomplete) {
          // Redirect newly registered user to Dashboard so the Arrow User Guide starts
          setTimeout(() => {
            window.location.href = "/dashboard";
          }, 700);
        }
      } else {
        toast.error(data.error || "Failed to save profile");
      }
    } catch {
      toast.error("Network error while saving profile");
    } finally {
      setSaving(false);
    }
  };

  const initials = (fullName || username || "YS").slice(0, 2).toUpperCase();

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-xl"
      >
        <Card className="border border-border/80 shadow-2xl rounded-3xl overflow-hidden bg-card">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-[#0047AB] via-blue-700 to-indigo-800 px-6 py-7 text-white relative">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge className="bg-white/20 hover:bg-white/20 text-white border-none text-[11px] font-semibold">
                    {profileCompleted ? "KYC Verified" : "Step 1: Complete Your Profile"}
                  </Badge>
                </div>
                <CardTitle className="text-2xl font-bold tracking-tight text-white mt-1">
                  Investor Profile & KYC
                </CardTitle>
                <CardDescription className="text-blue-100 text-xs">
                  Upload your profile picture (DP), PAN Card details & Date of Birth
                </CardDescription>
              </div>
              <ShieldCheck className="h-10 w-10 text-white/30 hidden sm:block" />
            </div>
          </div>

          <CardContent className="p-6 sm:p-8">
            {loading ? (
              <div className="py-16 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
                <span className="text-xs">Loading your profile...</span>
              </div>
            ) : (
              <form onSubmit={handleSaveProfile} className="space-y-6">
                {/* 1. Profile Picture (DP) Upload */}
                <div className="flex flex-col items-center justify-center space-y-3">
                  <div className="relative group">
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="h-28 w-28 rounded-full overflow-hidden border-4 border-blue-500/30 bg-muted flex items-center justify-center shadow-lg cursor-pointer transition-transform group-hover:scale-105 relative"
                    >
                      {avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={avatarUrl}
                          alt="Profile DP"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">
                          {initials}
                        </span>
                      )}

                      {/* Hover Camera Overlay */}
                      <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-semibold">
                        <Camera className="h-5 w-5 mb-0.5" />
                        <span>Change DP</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 h-9 w-9 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-md border-2 border-background cursor-pointer transition-transform active:scale-95"
                      title="Upload Profile Picture"
                    >
                      <Camera className="h-4 w-4" />
                    </button>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </div>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Upload className="h-3 w-3" />
                      {avatarUrl ? "Change Profile Photo (DP)" : "Upload Profile Photo (DP)"}
                    </button>
                    {username && (
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Account: <span className="font-mono font-medium">{username}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Full Name (Read/Edit) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-blue-500" />
                    Full Name (As per PAN)
                  </label>
                  <Input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                    className="h-11 rounded-xl"
                  />
                </div>

                {/* 2. PAN Card Number */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <CreditCard className="h-3.5 w-3.5 text-blue-500" />
                      PAN Card Number
                    </label>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      10-Digit Alpha-Numeric
                    </span>
                  </div>
                  <Input
                    type="text"
                    maxLength={10}
                    value={panNumber}
                    onChange={(e) => setPanNumber(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
                    placeholder="ABCDE1234F"
                    required
                    className="h-11 rounded-xl font-mono uppercase tracking-widest text-sm font-bold"
                  />
                </div>

                {/* 3. Date of Birth */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-blue-500" />
                    Date of Birth
                  </label>
                  <Input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    required
                    className="h-11 rounded-xl text-sm"
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={saving}
                    className="w-full h-11 rounded-xl bg-[#0047AB] hover:bg-blue-800 text-white font-semibold text-sm shadow-lg shadow-blue-600/20 cursor-pointer gap-2"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Saving Profile...</span>
                      </>
                    ) : profileCompleted ? (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Update Profile</span>
                      </>
                    ) : (
                      <>
                        <span>Complete Profile & Continue</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

