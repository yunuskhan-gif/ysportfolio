"use client";

import React from "react";

interface LoadingScreenProps {
  text?: string;
  subtext?: string;
  fullScreen?: boolean;
}

export default function LoadingScreen({
  text,
  subtext,
  fullScreen = true,
}: LoadingScreenProps) {
  return (
    <div
      className={`${
        fullScreen ? "fixed inset-0 min-h-screen z-[9999]" : "w-full min-h-[400px]"
      } flex flex-col items-center justify-center bg-[#0047AB] text-white overflow-hidden p-6 select-none`}
    >
      {/* Soft radial backdrop to give depth to blue */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#1d6ae5_0%,_#003a8c_70%,_#002b66_100%)] pointer-events-none" />

      {/* 3 Bouncing White Dots Container */}
      <div className="relative z-10 flex items-center justify-center gap-3.5 mb-6">
        <span
          className="h-4 w-4 rounded-full bg-white shadow-lg shadow-white/30 animate-bounce"
          style={{ animationDuration: "1s", animationDelay: "0ms" }}
        />
        <span
          className="h-4 w-4 rounded-full bg-white shadow-lg shadow-white/30 animate-bounce"
          style={{ animationDuration: "1s", animationDelay: "180ms" }}
        />
        <span
          className="h-4 w-4 rounded-full bg-white shadow-lg shadow-white/30 animate-bounce"
          style={{ animationDuration: "1s", animationDelay: "360ms" }}
        />
      </div>

      {/* Optional Loading text if provided */}
      {text && (
        <div className="relative z-10 text-center space-y-1 mt-2">
          <p className="text-white font-medium text-sm tracking-wide">
            {text}
          </p>
          {subtext && (
            <p className="text-white/70 text-xs tracking-normal">
              {subtext}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
