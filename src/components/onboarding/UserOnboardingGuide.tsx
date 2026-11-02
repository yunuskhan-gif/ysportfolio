"use client";

import React, { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  X,
  MousePointerClick,
} from "lucide-react";

interface TourStep {
  targetSelector: string;
  title: string;
  description: string;
  placement: "right" | "bottom" | "left";
}

const TOUR_STEPS: TourStep[] = [
  {
    targetSelector: '[data-tour-id="tour-nav-dashboard"]',
    title: "Executive Dashboard",
    description:
      "Yahan se aap apni total portfolio net worth, profit/loss, aur graphical growth track kar sakte hain.",
    placement: "right",
  },
  {
    targetSelector: '[data-tour-id="tour-nav-crude-oil"]',
    title: "Live Crude Oil & Commodities",
    description:
      "Global Crude Oil, Brent, Gold, Forex, Crypto aur Indices ke real-time rates seedha TradingEconomics se yahan dekhein.",
    placement: "right",
  },
  {
    targetSelector: '[data-tour-id="tour-nav-chat"]',
    title: "Community Chat Box",
    description:
      "WhatsApp-style group chat jahan saare registered users aur investors real-time baat kar sakte hain.",
    placement: "right",
  },
  {
    targetSelector: '[data-tour-id="tour-nav-portfolio"]',
    title: "Stocks & Equity Holdings",
    description:
      "Apne direct equity stocks add karein, live NSE/BSE price changes aur portfolio allocation manage karein.",
    placement: "right",
  },
  {
    targetSelector: '[data-tour-id="tour-nav-mutual-funds"]',
    title: "Mutual Funds & AMFI NAV",
    description:
      "Mutual Fund schemes track karein, XIRR calculate karein aur CAS statements upload karein.",
    placement: "right",
  },
  {
    targetSelector: '[data-tour-id="tour-action-add-stock"]',
    title: "Quick Add Stock",
    description:
      "Is button par click karke kisi bhi waqt naya stock ya mutual fund apne portfolio me turant add karein.",
    placement: "right",
  },
];

export default function UserOnboardingGuide() {
  const pathname = usePathname() || "";
  const [active, setActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [username, setUsername] = useState<string>("");
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  // Measure target element position
  const updateTargetPosition = useCallback(() => {
    if (!active) return;
    const step = TOUR_STEPS[currentStep];
    if (!step) return;

    const el = document.querySelector(step.targetSelector) as HTMLElement | null;
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "nearest" });
      const rect = el.getBoundingClientRect();
      setTargetRect(rect);
    } else {
      setTargetRect(null);
    }
  }, [active, currentStep]);

  useEffect(() => {
    // Do not interrupt user while they are completing their profile on /profile
    if (pathname.includes("/profile")) {
      setActive(false);
      return;
    }

    async function checkUserOnboarding() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          const user = data.user || "investor";
          setUsername(user);

          const storageKey = `ys_tour_v2_completed_${user.toLowerCase()}`;
          const isCompleted = localStorage.getItem(storageKey);

          if (!isCompleted) {
            const timer = setTimeout(() => {
              setActive(true);
            }, 900);
            return () => clearTimeout(timer);
          }
        }
      } catch (err) {
        console.warn("Could not check onboarding status", err);
      }
    }

    checkUserOnboarding();
  }, [pathname]);

  useEffect(() => {
    if (!active) return;
    updateTargetPosition();

    const handleResize = () => updateTargetPosition();
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleResize, true);

    const timer = setTimeout(updateTargetPosition, 200);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleResize, true);
      clearTimeout(timer);
    };
  }, [active, currentStep, updateTargetPosition]);

  const handleFinish = () => {
    if (username) {
      localStorage.setItem(`ys_tour_v2_completed_${username.toLowerCase()}`, "true");
    }
    setActive(false);
  };

  if (!active) return null;

  const step = TOUR_STEPS[currentStep];

  // Calculate tooltip position relative to targetRect
  let tooltipTop = 120;
  let tooltipLeft = 280;
  let isMobileView = typeof window !== "undefined" && window.innerWidth < 768;

  if (targetRect && !isMobileView) {
    tooltipTop = Math.max(16, Math.min(window.innerHeight - 240, targetRect.top - 10));
    tooltipLeft = targetRect.right + 28;
  } else if (isMobileView) {
    tooltipTop = window.innerHeight - 250;
    tooltipLeft = 16;
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9998] pointer-events-auto overflow-hidden">
        {/* Semi-transparent dark backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/55 backdrop-blur-[1.5px]"
          onClick={handleFinish}
        />

        {/* Highlight Box around actual UI element */}
        {targetRect && (
          <motion.div
            layout
            initial={false}
            animate={{
              top: targetRect.top - 5,
              left: targetRect.left - 5,
              width: targetRect.width + 10,
              height: targetRect.height + 10,
            }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="fixed z-[9999] rounded-xl border-2 border-blue-400 bg-blue-500/10 shadow-[0_0_0_9999px_rgba(0,0,0,0.45),0_0_25px_rgba(59,130,246,0.8)] pointer-events-none"
          >
            {/* Pulsing beacon on target */}
            <span className="absolute -right-1.5 -top-1.5 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-blue-500 border border-white"></span>
            </span>
          </motion.div>
        )}

        {/* Animated Bouncing Pointer Arrow pointing at the target element */}
        {targetRect && !isMobileView && (
          <motion.div
            initial={false}
            animate={{
              top: targetRect.top + targetRect.height / 2 - 14,
              left: targetRect.right + 4,
            }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="fixed z-[10000] pointer-events-none flex items-center"
          >
            <motion.div
              animate={{ x: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 0.9, ease: "easeInOut" }}
              className="flex items-center"
            >
              {/* Left-pointing sharp SVG arrow */}
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                className="text-blue-500 drop-shadow-[0_2px_8px_rgba(59,130,246,0.9)]"
              >
                <path
                  d="M19 12H5M5 12L11 18M5 12L11 6"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.div>
          </motion.div>
        )}

        {/* Floating Tour Callout Card */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 15, scale: 0.95 }}
          animate={{
            opacity: 1,
            x: 0,
            scale: 1,
            top: tooltipTop,
            left: tooltipLeft,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 26 }}
          style={{
            position: "fixed",
            width: isMobileView ? "calc(100vw - 32px)" : "340px",
          }}
          className="z-[10000] rounded-2xl bg-slate-900 text-white border border-blue-500/40 shadow-2xl p-5 select-none"
        >
          {/* Left Pointer Triangle on Desktop */}
          {!isMobileView && targetRect && (
            <div
              style={{
                top: Math.max(
                  18,
                  Math.min(180, targetRect.top - tooltipTop + targetRect.height / 2 - 8)
                ),
              }}
              className="absolute -left-2.5 w-5 h-5 bg-slate-900 border-l border-b border-blue-500/40 rotate-45 pointer-events-none"
            />
          )}

          {/* Step counter & close */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-blue-600 text-white rounded-md">
                Step {currentStep + 1} of {TOUR_STEPS.length}
              </span>
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <MousePointerClick className="h-3 w-3 text-blue-400" />
                Interactive Guide
              </span>
            </div>
            <button
              onClick={handleFinish}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
              title="Close Guide"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Content */}
          <h3 className="text-base font-bold text-white tracking-tight mt-1">
            {step.title}
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed mt-1.5">
            {step.description}
          </p>

          {/* Progress Dots & Buttons */}
          <div className="flex items-center justify-between mt-5 pt-3 border-t border-slate-800">
            <div className="flex items-center gap-1.5">
              {TOUR_STEPS.map((_, idx) => (
                <span
                  key={idx}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === currentStep ? "w-5 bg-blue-500" : "w-1.5 bg-slate-700"
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentStep((prev) => prev - 1)}
                  className="h-8 px-2.5 text-xs bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-white"
                >
                  <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                  Back
                </Button>
              )}

              {currentStep < TOUR_STEPS.length - 1 ? (
                <Button
                  size="sm"
                  onClick={() => setCurrentStep((prev) => prev + 1)}
                  className="h-8 px-3.5 text-xs bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg shadow-md shadow-blue-600/30"
                >
                  Next
                  <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={handleFinish}
                  className="h-8 px-3.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg shadow-md shadow-emerald-600/30"
                >
                  <Check className="h-3.5 w-3.5 mr-1" />
                  Done
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
