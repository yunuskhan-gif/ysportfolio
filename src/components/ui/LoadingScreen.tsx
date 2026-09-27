"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ShieldCheck } from "lucide-react";

interface LoadingScreenProps {
  text?: string;
  subtext?: string;
  fullScreen?: boolean;
}

const DEFAULT_MESSAGES = [
  "Loading Market Intelligence...",
  "Syncing Live AMFI NAV & NSE Prices...",
  "Encrypting Host-Isolated Workspace...",
  "Preparing Portfolio Command Center...",
];

export default function LoadingScreen({
  text,
  subtext,
  fullScreen = true,
}: LoadingScreenProps) {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    if (text) return;
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % DEFAULT_MESSAGES.length);
    }, 1800);
    return () => clearInterval(interval);
  }, [text]);

  const currentText = text || DEFAULT_MESSAGES[msgIndex];

  return (
    <div
      className={`${
        fullScreen ? "fixed inset-0 min-h-screen z-50" : "w-full min-h-[400px]"
      } flex flex-col items-center justify-center bg-[#0d0f17] text-white overflow-hidden p-6 select-none`}
    >
      {/* Ambient background soft glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] bg-blue-600/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[240px] h-[240px] bg-amber-500/10 rounded-full blur-[80px] pointer-events-none" />

      {/* Center animated logo with orbit ring */}
      <div className="relative mb-8 flex items-center justify-center">
        {/* Outer Pulsing Glow Ring */}
        <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-blue-600/30 via-indigo-500/20 to-amber-500/30 blur-md animate-pulse" />

        {/* Orbit Rotating Border */}
        <div className="absolute -inset-2.5 rounded-2xl border border-blue-500/30 border-t-amber-400 border-r-blue-400 animate-spin [animation-duration:3s]" />

        {/* Logo Container */}
        <div className="relative h-20 w-16 rounded-2xl bg-black/90 border border-white/15 p-2 shadow-2xl flex items-center justify-center backdrop-blur-md">
          <Image
            src="/ys_logo.png"
            alt="YS Portfolio"
            fill
            className="object-contain p-1.5"
            priority
          />
        </div>
      </div>

      {/* Brand & Loading Text */}
      <div className="text-center space-y-2 z-10 max-w-sm">
        <h2 className="text-lg font-bold tracking-[0.25em] font-serif uppercase text-white/95">
          YS PORTFOLIO
        </h2>
        
        {/* Animated Dynamic Status Message */}
        <p className="text-sm font-medium text-white/70 transition-all duration-300 min-h-[22px]">
          {currentText}
        </p>

        {subtext && (
          <p className="text-xs text-white/40 font-light">
            {subtext}
          </p>
        )}
      </div>

      {/* Smooth Shimmer Progress Bar */}
      <div className="relative w-52 h-1 bg-white/10 rounded-full overflow-hidden mt-6 mb-8 z-10">
        <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 via-amber-400 to-emerald-400 w-1/3 rounded-full animate-indeterminate" />
      </div>

      {/* Bottom Security / Trust Pill */}
      <div className="flex items-center gap-2 text-[11px] font-medium text-white/40 bg-white/[0.04] border border-white/[0.08] px-3.5 py-1.5 rounded-full z-10">
        <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
        <span>Host-Isolated & 256-bit Encrypted</span>
      </div>

      <style jsx global>{`
        @keyframes indeterminate {
          0% {
            left: -35%;
            width: 35%;
          }
          50% {
            left: 25%;
            width: 50%;
          }
          100% {
            left: 100%;
            width: 35%;
          }
        }
        .animate-indeterminate {
          animation: indeterminate 1.4s infinite cubic-bezier(0.65, 0.815, 0.735, 0.395);
        }
      `}</style>
    </div>
  );
}
