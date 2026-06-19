"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  LayoutDashboard,
  TrendingUp,
  Search,
  BrainCircuit,
  Wallet,
  Coins,
  Landmark,
  Book,
  ChevronRight,
  HelpCircle,
  FileSpreadsheet,
  LineChart,
  UserCheck,
  Zap,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Unlock,
  ArrowRight,
  Loader2,
  Database,
  Briefcase
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

export default function Home() {
  const router = useRouter();
  const [activeGuideTab, setActiveGuideTab] = useState<string>("quick-start");

  // Auth states
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Check current session on mount
  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setIsLoggedIn(data.verified);
        } else {
          setIsLoggedIn(false);
        }
      } catch (err) {
        setIsLoggedIn(false);
      }
    }
    checkSession();
  }, []);

  // Handle homepage login submit
  const handleHomeLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    setAuthLoading(true);
    try {
      const res = await fetch("/api/auth/verify-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });

      if (res.ok) {
        setIsLoggedIn(true);
        toast.success("Access Granted! Welcome back.");
        router.push("/dashboard");
      } else {
        toast.error("Invalid password. Please try again.");
      }
    } catch (err) {
      toast.error("Network error. Please try again.");
    } finally {
      setAuthLoading(false);
    }
  };

  const guideTabs = [
    { id: "quick-start", label: "Quick Start Guide", icon: Zap },
    { id: "portfolio-sync", label: "Portfolio & MFs", icon: Wallet },
    { id: "fii-dii-screener", label: "FII DII & Screener", icon: TrendingUp },
    { id: "ai-ledger", label: "AI Insights & Ledgers", icon: BrainCircuit }
  ];

  return (
    <div className="relative min-h-screen w-full bg-black text-white overflow-x-hidden font-sans select-none selection:bg-primary/20 selection:text-white">
      
      {/* 1. Large Background Diagonal Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden z-0 opacity-[0.02] animate-pulse">
        <div className="text-[15vw] font-black tracking-[1.2em] text-red-650 -rotate-12 uppercase">
          UNZORA
        </div>
      </div>

      {/* Background Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[140px]" />
        <div className="absolute top-[40%] right-[10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[10%] left-[20%] w-[45%] h-[45%] bg-purple-500/5 rounded-full blur-[140px]" />
      </div>

      {/* 2. Standalone Landing Page Header */}
      <header className="relative z-20 border-b border-zinc-900 bg-zinc-950/60 backdrop-blur-md sticky top-0">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center">
              <Database className="h-5 w-5 text-primary" />
            </div>
            <div>
              <span className="font-black text-lg tracking-wider text-white">YS PORTFOLIO</span>
              <span className="text-[9px] font-bold text-zinc-500 tracking-widest block -mt-1 uppercase">Wealth Intelligence</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {isLoggedIn === null ? (
              <Loader2 className="h-4 w-4 animate-spin text-primary/50" />
            ) : isLoggedIn ? (
              <Button
                onClick={() => router.push("/dashboard")}
                className="h-9 text-xs font-bold gap-1 cursor-pointer bg-primary/10 hover:bg-primary/20 text-primary border border-primary/35 rounded-lg px-4"
              >
                Go to Dashboard
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            ) : (
              <button
                onClick={() => document.getElementById("login-card")?.scrollIntoView({ behavior: "smooth" })}
                className="h-9 text-xs font-bold bg-primary hover:bg-primary/95 text-primary-foreground rounded-lg px-4 cursor-pointer transition-all shadow-lg shadow-primary/10 flex items-center gap-1"
              >
                <Lock className="h-3.5 w-3.5" />
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 3. Hero & Direct Login Section */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 py-12 md:py-16 space-y-12">
        
        {/* Intro Hero Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <Badge variant="outline" className="bg-red-500/10 border-red-500/20 text-red-500 font-bold uppercase tracking-widest text-[9px] px-3 py-1">
            Unzora Enterprise Wealth Portal
          </Badge>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
            High-Performance <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">Market & Portfolio Intelligence</span>
          </h1>
          <p className="text-zinc-400 text-sm md:text-base leading-relaxed">
            Consolidate your financial assets, analyze real-time FII/DII institutional sector flow parameters, and run Screener.in stock details analysis inside a single unified environment.
          </p>
        </div>

        {/* Standalone Login Gate Card */}
        <div id="login-card" className="bg-zinc-950/60 border border-zinc-800 rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-2xl max-w-2xl mx-auto">
          <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-primary/10 rounded-full blur-[80px]" />
          
          <div className="flex flex-col items-center text-center space-y-5 relative z-10">
            <div className="h-12 w-12 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center">
              {isLoggedIn ? (
                <Unlock className="h-6 w-6 text-emerald-400" />
              ) : (
                <Lock className="h-6 w-6 text-primary animate-pulse" />
              )}
            </div>
            
            <div className="space-y-1">
              <h2 className="text-xl md:text-2xl font-black text-white">
                {isLoggedIn ? "Session Active" : "Protected Portal Login"}
              </h2>
              <p className="text-zinc-500 text-xs max-w-md">
                {isLoggedIn 
                  ? "Your session is authenticated. You can proceed directly to search stocks, edit portfolios, and view AI recommendations."
                  : "Submit your authorization password below to access the secure tracking modules, cash book ledgers, and live NSDL flow data."
                }
              </p>
            </div>

            {isLoggedIn === null ? (
              <Loader2 className="h-6 w-6 animate-spin text-primary opacity-30" />
            ) : isLoggedIn ? (
              <div className="w-full max-w-sm pt-2">
                <Button 
                  onClick={() => router.push("/dashboard")}
                  className="w-full h-11 text-xs font-bold gap-1.5 uppercase tracking-wide cursor-pointer"
                >
                  Enter Dashboard Console
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <form onSubmit={handleHomeLogin} className="w-full max-w-sm space-y-3.5">
                <Input
                  type="password"
                  placeholder="Enter Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-zinc-900/60 border-zinc-800 focus:border-primary focus:ring-primary/20 h-11 text-center tracking-widest text-white placeholder:text-zinc-600 text-sm"
                  autoFocus
                />
                <Button
                  type="submit"
                  className="w-full h-11 text-xs font-bold gap-1.5 uppercase tracking-wide cursor-pointer"
                  disabled={authLoading || !password}
                >
                  {authLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Verify & Open Dashboard
                      <ArrowRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>

        {/* 4. Interactive User Guide Section */}
        <div className="bg-zinc-950/20 border border-zinc-850 p-6 rounded-2xl space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-zinc-850">
            <BookOpen className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-extrabold uppercase tracking-wider text-white">Interactive User Guide</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Guide Left Selector Pills */}
            <div className="lg:col-span-4 flex flex-col gap-2">
              {guideTabs.map(t => {
                const IconComp = t.icon;
                const isSelected = activeGuideTab === t.id;
                
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveGuideTab(t.id)}
                    className={`w-full flex items-center gap-3 p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? "bg-primary/15 border-primary/50 text-white font-bold"
                        : "bg-transparent border-transparent text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-205"
                    }`}
                  >
                    <IconComp className={`h-4.5 w-4.5 ${isSelected ? "text-primary animate-pulse" : "text-zinc-500"}`} />
                    <span className="text-xs uppercase tracking-wider">{t.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Guide Right Content Panel */}
            <div className="lg:col-span-8 bg-zinc-950/40 border border-zinc-900 p-6 rounded-xl flex flex-col justify-between min-h-[300px]">
              
              {activeGuideTab === "quick-start" && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    <Zap className="h-4.5 w-4.5 text-primary" />
                    Quick Start & System Overview
                  </h3>
                  <p className="text-zinc-400 text-xs leading-relaxed">
                    YS Portfolio is configured with an active security gate and automatic scheduler dashboard. Here is how to navigate the portal layout:
                  </p>
                  <ul className="space-y-2.5 text-xs text-zinc-350">
                    <li className="flex gap-2.5 items-start">
                      <span className="p-1 bg-zinc-900 rounded text-primary text-[10px] font-mono shrink-0 font-bold">1</span>
                      <span>Use the **Sidebar Menu** (available after logging in) to jump between Dashboard assets, tracking modules, Cash Book, and settings.</span>
                    </li>
                    <li className="flex gap-2.5 items-start">
                      <span className="p-1 bg-zinc-900 rounded text-primary text-[10px] font-mono shrink-0 font-bold">2</span>
                      <span>Access the **Search Console** at the top right to execute quick lookups across stock symbols.</span>
                    </li>
                    <li className="flex gap-2.5 items-start">
                      <span className="p-1 bg-zinc-900 rounded text-primary text-[10px] font-mono shrink-0 font-bold">3</span>
                      <span>Import your statements directly to integrate external holdings into your account dashboard.</span>
                    </li>
                  </ul>
                </div>
              )}

              {activeGuideTab === "portfolio-sync" && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    <Wallet className="h-4.5 w-4.5 text-primary" />
                    Managing Portfolio Holdings & Statements
                  </h3>
                  <p className="text-zinc-400 text-xs leading-relaxed">
                    The platform allows consolidating your physical assets, stock shares, and mutual funds automatically or manually.
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="p-3 bg-zinc-900/30 border border-zinc-800 rounded-lg space-y-1.5">
                      <span className="text-[10px] font-bold text-zinc-450 uppercase tracking-widest flex items-center gap-1.5">
                        <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
                        Excel Upload
                      </span>
                      <p className="text-[11px] text-zinc-400">
                        Go to the **Stocks Fund** page, click **Upload Excel**, select your broker report (e.g. CAS, Motilal), and upload it. The parser extracts symbols, purchase dates, averages, and quantities automatically.
                      </p>
                    </div>

                    <div className="p-3 bg-zinc-900/30 border border-zinc-800 rounded-lg space-y-1.5">
                      <span className="text-[10px] font-bold text-zinc-450 uppercase tracking-widest flex items-center gap-1.5">
                        <LineChart className="h-3.5 w-3.5 text-sky-400" />
                        Real-time Pricing
                      </span>
                      <p className="text-[11px] text-zinc-400">
                        Once holdings are loaded, the system continuously fetches current market values, computing live unrealized profits, P&L percentages, and daily valuations.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeGuideTab === "fii-dii-screener" && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    <TrendingUp className="h-4.5 w-4.5 text-primary" />
                    FII DII Flow Tracker & Screener Integration
                  </h3>
                  <p className="text-zinc-400 text-xs leading-relaxed">
                    Track the activity of institutional capital in Indian equities:
                  </p>
                  <ul className="space-y-2.5 text-xs text-zinc-350">
                    <li className="flex gap-2 items-start">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>**Dual Flows:** View FII (Foreign Investors) and DII (Domestic Investors) Net Investments and Assets Under Custody (AUC) side-by-side inside the sectors list.</span>
                    </li>
                    <li className="flex gap-2 items-start">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>**Shares Breakdown:** Expand any sector row (e.g. Financial Services) using the `▶ / ▼` chevron. It lists the exact share allocations and weights held by institutional participants.</span>
                    </li>
                    <li className="flex gap-2 items-start">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>**Screener.in Charts:** Click on any stock symbol (e.g. `HDFCBANK`, `RELIANCE`) anywhere in the app to summon a full financial dialog showing P/E ratios, P&L statements, peer ROCEs, and price chart volumes.</span>
                    </li>
                  </ul>
                </div>
              )}

              {activeGuideTab === "ai-ledger" && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    <BrainCircuit className="h-4.5 w-4.5 text-primary" />
                    AI Insights Engine & Financial Ledger
                  </h3>
                  <p className="text-zinc-400 text-xs leading-relaxed">
                    Leverage high-performance analytics to secure and optimize your financial balance sheet.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="p-3 bg-zinc-900/30 border border-zinc-800 rounded-lg space-y-1">
                      <span className="text-[10px] font-bold text-zinc-450 uppercase tracking-widest flex items-center gap-1">
                        <Book className="h-3.5 w-3.5 text-purple-400" />
                        Cash Book Ledger
                      </span>
                      <p className="text-[11px] text-zinc-400">
                        Record day-to-day capital movements. The ledger automatically logs double-entry transactions (Income/Expenses) and updates cash/bank account assets in real time.
                      </p>
                    </div>

                    <div className="p-3 bg-zinc-900/30 border border-zinc-800 rounded-lg space-y-1">
                      <span className="text-[10px] font-bold text-zinc-450 uppercase tracking-widest flex items-center gap-1">
                        <UserCheck className="h-3.5 w-3.5 text-amber-400" />
                        AI Reallocations
                      </span>
                      <p className="text-[11px] text-zinc-400">
                        The AI module checks your asset weights, evaluates debt-to-equity ratios, checks cash liquidity parameters, and prompts actionable reallocation recommendations.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Guide Footer Navigation Quick Button */}
              <div className="mt-6 pt-4 border-t border-zinc-900/80 flex items-center justify-between flex-wrap gap-2 text-xs">
                <span className="text-zinc-500 font-semibold flex items-center gap-1">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  Guide content verified for Unzora tracking modules
                </span>
                
                <Button 
                  onClick={() => {
                    if (isLoggedIn) {
                      router.push("/dashboard");
                    } else {
                      document.getElementById("login-card")?.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                  className="flex items-center gap-1 bg-primary text-primary-foreground font-extrabold px-3 py-1.5 rounded-lg hover:bg-primary/90 transition-all cursor-pointer text-xs"
                >
                  {isLoggedIn ? "Go to Dashboard" : "Lock / Unlock Portal"}
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 5. Floating Bottom Right Watermark Badge */}
      <div className="fixed bottom-4 right-4 z-50 pointer-events-none opacity-45 hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-1.5 bg-zinc-950/85 border border-zinc-800/80 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-xl">
          <span className="text-[9px] font-bold text-zinc-500 tracking-wider">POWERED BY</span>
          <span className="text-xs font-black tracking-widest text-red-500">UNZORA</span>
        </div>
      </div>

    </div>
  );
}
