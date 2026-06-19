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
  Briefcase,
  Scale,
  FileText,
  Check,
  X,
  Info,
  Activity
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

export default function Home() {
  const router = useRouter();
  const [activeGuideTab, setActiveGuideTab] = useState<string>("quick-start");
  const [showTermsModal, setShowTermsModal] = useState<boolean>(false);
  const [termsType, setTermsType] = useState<"terms" | "privacy" | "disclaimer">("terms");

  // Auth states
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [shake, setShake] = useState(false);

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
        setShake(true);
        setTimeout(() => setShake(false), 500);
        toast.error("Invalid password. Please try again.");
      }
    } catch (err) {
      toast.error("Network error. Please try again.");
    } finally {
      setAuthLoading(false);
    }
  };

  const openTerms = (type: "terms" | "privacy" | "disclaimer") => {
    setTermsType(type);
    setShowTermsModal(true);
  };

  const guideTabs = [
    { id: "quick-start", label: "Quick Start Guide", icon: Zap },
    { id: "portfolio-sync", label: "Portfolio & MFs", icon: Wallet },
    { id: "fii-dii-screener", label: "FII DII & Screener", icon: TrendingUp },
    { id: "ai-ledger", label: "AI Insights & Ledgers", icon: BrainCircuit }
  ];

  return (
    <div className="relative min-h-screen w-full bg-black text-white overflow-x-hidden font-sans select-none selection:bg-primary/20 selection:text-white">
      
      {/* Dynamic Animated Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#18181b_1px,transparent_1px),linear-gradient(to_bottom,#18181b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_80%,transparent_100%)] pointer-events-none z-0" />

      {/* Floating Ambient Glowing Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[600px] h-[600px] bg-red-500/10 rounded-full blur-[150px] animate-pulse duration-10000" />
        <div className="absolute top-[30%] right-[5%] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[130px] animate-pulse duration-8000" />
        <div className="absolute bottom-[10%] left-[15%] w-[550px] h-[550px] bg-purple-500/5 rounded-full blur-[140px] animate-pulse duration-9000" />
      </div>

      {/* Large Background Diagonal Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden z-0 opacity-[0.015]">
        <div className="text-[14vw] font-black tracking-[1.3em] text-red-500 -rotate-12 uppercase">
          UNZORA
        </div>
      </div>

      {/* Premium Header Layout */}
      <header className="relative z-20 border-b border-zinc-900/80 bg-black/60 backdrop-blur-xl sticky top-0 transition-all duration-300">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 p-[1px] transition-transform duration-300 group-hover:scale-105">
              <div className="h-full w-full rounded-[11px] bg-black flex items-center justify-center">
                <Database className="h-5 w-5 text-red-500" />
              </div>
            </div>
            <div>
              <span className="font-black text-base tracking-wider text-white flex items-center gap-1.5">
                YS PORTFOLIO
                <span className="text-[8px] bg-red-500/10 text-red-500 border border-red-500/20 px-1.5 py-0.5 rounded font-mono font-bold tracking-normal uppercase">v2.0</span>
              </span>
              <span className="text-[9px] font-bold text-zinc-500 tracking-widest block -mt-0.5 uppercase">Wealth Intelligence Suite</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => document.getElementById("features-section")?.scrollIntoView({ behavior: "smooth" })}
              className="text-xs text-zinc-450 hover:text-white transition-colors cursor-pointer hidden sm:inline-block font-semibold uppercase tracking-wider"
            >
              Features
            </button>
            <button
              onClick={() => document.getElementById("guide-section")?.scrollIntoView({ behavior: "smooth" })}
              className="text-xs text-zinc-450 hover:text-white transition-colors cursor-pointer hidden sm:inline-block font-semibold uppercase tracking-wider"
            >
              Guide
            </button>
            <div className="w-[1px] h-4 bg-zinc-800 hidden sm:block" />
            
            {isLoggedIn === null ? (
              <Loader2 className="h-4 w-4 animate-spin text-red-500" />
            ) : isLoggedIn ? (
              <Button
                onClick={() => router.push("/dashboard")}
                className="h-9 text-xs font-bold gap-1.5 cursor-pointer bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 rounded-lg px-4 transition-all duration-300"
              >
                Go to Dashboard
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            ) : (
              <button
                onClick={() => document.getElementById("login-card")?.scrollIntoView({ behavior: "smooth" })}
                className="h-9 text-xs font-bold bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-650 hover:to-rose-700 text-white rounded-lg px-4 cursor-pointer transition-all shadow-md shadow-red-500/10 flex items-center gap-1.5 active:scale-95"
              >
                <Lock className="h-3.5 w-3.5" />
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Workspace Grid */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 py-12 md:py-16 space-y-20">
        
        {/* Glowing Hero Area */}
        <section className="text-center space-y-6 max-w-4xl mx-auto">
          <Badge variant="outline" className="bg-red-500/10 border-red-500/20 text-red-500 font-bold uppercase tracking-widest text-[9px] px-3.5 py-1.5 mx-auto w-fit flex items-center gap-1.5">
            <Zap className="h-3 w-3 fill-red-500 text-red-500" />
            Personal Enterprise Wealth Suite
          </Badge>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-tight">
            High-Performance <br />
            <span className="bg-gradient-to-r from-red-500 via-rose-400 to-amber-500 bg-clip-text text-transparent drop-shadow-md">
              Market & Portfolio Analytics
            </span>
          </h1>
          
          <p className="text-zinc-450 text-sm md:text-base leading-relaxed max-w-2xl mx-auto">
            Consolidate your financial holdings, track real-time mutual fund NAV histories with exact charts, audit cash flow ledgers, and trace institutional FII/DII market parameters.
          </p>

          {/* Interactive Mock Dashboard Panel */}
          <div className="relative max-w-3xl mx-auto pt-6 group">
            <div className="absolute -inset-1 bg-gradient-to-r from-red-500/20 to-blue-500/20 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
            <div className="relative bg-zinc-950/80 border border-zinc-900 rounded-xl p-5 shadow-2xl flex flex-col md:flex-row gap-5 items-center justify-between text-left">
              <div className="space-y-4 w-full md:w-1/2">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-red-500" />
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Active System Analytics</span>
                </div>
                <div className="space-y-1">
                  <div className="text-[11px] text-zinc-400">Total Portfolio Asset Base</div>
                  <div className="text-2xl font-black text-white flex items-center gap-2">
                    ₹24,85,910.00
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded font-mono font-bold">+18.4%</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="bg-zinc-900/40 p-2.5 rounded-lg border border-zinc-800/60">
                    <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Mutual Funds</div>
                    <div className="text-sm font-extrabold text-white mt-0.5">₹14,50,000</div>
                  </div>
                  <div className="bg-zinc-900/40 p-2.5 rounded-lg border border-zinc-800/60">
                    <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Direct Equity</div>
                    <div className="text-sm font-extrabold text-white mt-0.5">₹10,35,910</div>
                  </div>
                </div>
              </div>
              <div className="w-full md:w-1/2 h-28 bg-zinc-900/60 rounded-xl border border-zinc-850/80 p-3 flex flex-col justify-between relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-zinc-450 uppercase tracking-wider">Market Flow Index</span>
                  <span className="text-[9px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded font-bold uppercase">LIVE</span>
                </div>
                
                {/* SVG Sparkline */}
                <svg className="w-full h-12 stroke-red-500 fill-none" viewBox="0 0 100 20" preserveAspectRatio="none">
                  <path d="M0,15 Q15,5 30,12 T60,4 T90,16 T100,2" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M0,15 Q15,5 30,12 T60,4 T90,16 T100,2 L100,20 L0,20 Z" strokeWidth="0" fill="url(#grad)" opacity="0.08" />
                  <defs>
                    <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#ef4444" />
                      <stop offset="100%" stopColor="transparent" />
                    </linearGradient>
                  </defs>
                </svg>

                <div className="flex items-center justify-between text-[9px] text-zinc-500 font-mono">
                  <span>NSE: NIFTY50</span>
                  <span className="text-emerald-450 font-bold">23,495.60 (+0.85%)</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Security Password Gate Card */}
        <section id="login-card" className="relative max-w-2xl mx-auto scroll-mt-20">
          <div className="absolute -inset-1 bg-gradient-to-r from-red-500/10 via-zinc-900 to-rose-500/10 rounded-3xl blur-xl opacity-80" />
          <div className="relative bg-zinc-950/65 border border-zinc-800 rounded-3xl p-6 md:p-8 overflow-hidden shadow-2xl">
            <div className="absolute -top-10 -right-10 w-[200px] h-[200px] bg-red-500/10 rounded-full blur-[80px]" />
            
            <div className="flex flex-col items-center text-center space-y-5 relative z-10">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-red-500/25 to-rose-600/25 border border-red-500/35 flex items-center justify-center shadow-inner">
                {isLoggedIn ? (
                  <Unlock className="h-6 w-6 text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.3)]" />
                ) : (
                  <Lock className={`h-6 w-6 text-red-500 ${authLoading ? "animate-spin" : "animate-pulse"}`} />
                )}
              </div>
              
              <div className="space-y-1">
                <h2 className="text-xl md:text-2xl font-black tracking-tight text-white">
                  {isLoggedIn ? "Session Authenticated" : "Secure Password Access Gate"}
                </h2>
                <p className="text-zinc-500 text-xs max-w-md mx-auto">
                  {isLoggedIn 
                    ? "Your security token is verified. You have full workspace permission to update assets, parse Excel reports, and search charts."
                    : "Please input the authorized master security password to release the session token and open financial dashboard views."
                  }
                </p>
              </div>

              {isLoggedIn === null ? (
                <Loader2 className="h-6 w-6 animate-spin text-red-500 opacity-50" />
              ) : isLoggedIn ? (
                <div className="w-full max-w-xs pt-2">
                  <Button 
                    onClick={() => router.push("/dashboard")}
                    className="w-full h-11 text-xs font-bold gap-2 uppercase tracking-widest cursor-pointer bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white shadow-lg active:scale-95 transition-transform"
                  >
                    Enter Dashboard Console
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleHomeLogin} className={`w-full max-w-xs space-y-3.5 transition-transform ${shake ? "animate-bounce" : ""}`}>
                  <Input
                    type="password"
                    placeholder="Enter Security Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-zinc-900/50 border-zinc-800 focus:border-red-500/50 focus:ring-red-500/10 h-11 text-center tracking-widest text-white placeholder:text-zinc-650 text-sm rounded-xl"
                    autoFocus
                  />
                  <Button
                    type="submit"
                    className="w-full h-11 text-xs font-bold gap-2 uppercase tracking-widest cursor-pointer bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-650 hover:to-rose-700 text-white rounded-xl active:scale-95"
                    disabled={authLoading || !password}
                  >
                    {authLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        Verify & Unlock
                        <ArrowRight className="h-3.5 w-3.5" />
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </section>

        {/* Feature Grid Section */}
        <section id="features-section" className="space-y-8 scroll-mt-20">
          <div className="text-center space-y-2">
            <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Workspace Capabilities</span>
            <h2 className="text-2xl md:text-3xl font-black text-white">Full-Featured Financial Ecosystem</h2>
            <p className="text-zinc-500 text-xs max-w-md mx-auto">
              Our application offers five distinct high-fidelity modules engineered to monitor, audit, and analyze capital.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
            
            {/* Feature 1 */}
            <div className="bg-zinc-950/40 border border-zinc-900 p-6 rounded-2xl hover:border-zinc-850 hover:bg-zinc-900/10 transition-all group relative overflow-hidden hover:shadow-xl hover:shadow-red-500/[0.02]">
              <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/[0.02] rounded-full blur-xl group-hover:bg-red-500/[0.04] transition-all" />
              <div className="h-10 w-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mb-4 group-hover:scale-105 transition-transform">
                <Wallet className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider mb-2">Automated Portfolio Sync</h3>
              <p className="text-zinc-450 text-xs leading-relaxed">
                Parse Excel files directly from brokers (like Motilal or CAS). The system auto-calculates quantities, average cost prices, holdings weight margins, and unrealized valuations.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-zinc-950/40 border border-zinc-900 p-6 rounded-2xl hover:border-zinc-850 hover:bg-zinc-900/10 transition-all group relative overflow-hidden hover:shadow-xl hover:shadow-blue-500/[0.02]">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/[0.02] rounded-full blur-xl group-hover:bg-blue-500/[0.04] transition-all" />
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-450 mb-4 group-hover:scale-105 transition-transform">
                <LineChart className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider mb-2">Mutual Fund NAV Tracker</h3>
              <p className="text-zinc-450 text-xs leading-relaxed">
                Integrated search for Indian Mutual Funds across `api.mfapi.in` database models. Generates clean interactive NAV history charts with genuine live date-time indices.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-zinc-950/40 border border-zinc-900 p-6 rounded-2xl hover:border-zinc-850 hover:bg-zinc-900/10 transition-all group relative overflow-hidden hover:shadow-xl hover:shadow-amber-500/[0.02]">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/[0.02] rounded-full blur-xl group-hover:bg-amber-500/[0.04] transition-all" />
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 mb-4 group-hover:scale-105 transition-transform">
                <TrendingUp className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider mb-2">FII & DII Flows Monitor</h3>
              <p className="text-zinc-450 text-xs leading-relaxed">
                Analyze net buyer/seller flows for Domestic and Foreign institutional operations in Indian markets. Expand sectors to audit specific weight indexes and stock metrics.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-zinc-950/40 border border-zinc-900 p-6 rounded-2xl hover:border-zinc-850 hover:bg-zinc-900/10 transition-all group relative overflow-hidden hover:shadow-xl hover:shadow-purple-500/[0.02]">
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/[0.02] rounded-full blur-xl group-hover:bg-purple-500/[0.04] transition-all" />
              <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4 group-hover:scale-105 transition-transform">
                <Book className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider mb-2">Cash Book Accounting</h3>
              <p className="text-zinc-450 text-xs leading-relaxed">
                Log credits/debits directly. A lightweight double-entry ledger bookkeeping panel that categorizes assets and monitors liquid capital vs bank deposit sheet logs.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-zinc-950/40 border border-zinc-900 p-6 rounded-2xl hover:border-zinc-850 hover:bg-zinc-900/10 transition-all group relative overflow-hidden hover:shadow-xl hover:shadow-emerald-500/[0.02]">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/[0.02] rounded-full blur-xl group-hover:bg-emerald-500/[0.04] transition-all" />
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-105 transition-transform">
                <BrainCircuit className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider mb-2">AI Allocation Insights</h3>
              <p className="text-zinc-450 text-xs leading-relaxed">
                Leverage local logic audits that inspect sector exposures, weight allocations, cash buffers, and recommend reallocating assets for optimal risk-hedged performance.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-zinc-950/40 border border-zinc-900 p-6 rounded-2xl hover:border-zinc-850 hover:bg-zinc-900/10 transition-all group relative overflow-hidden hover:shadow-xl hover:shadow-zinc-500/[0.02]">
              <div className="absolute top-0 right-0 w-24 h-24 bg-zinc-500/[0.02] rounded-full blur-xl group-hover:bg-zinc-500/[0.04] transition-all" />
              <div className="h-10 w-10 rounded-xl bg-zinc-800/40 border border-zinc-700/30 flex items-center justify-center text-zinc-400 mb-4 group-hover:scale-105 transition-transform">
                <Search className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider mb-2">Screener.in Stock Dialogs</h3>
              <p className="text-zinc-450 text-xs leading-relaxed">
                Query any Indian stock ticker to pull extensive balance sheet profiles, ROCE, P/E data, quarterly margins, and historical price charts inside a overlay card.
              </p>
            </div>

          </div>
        </section>

        {/* User Guide Section */}
        <section id="guide-section" className="bg-zinc-950/30 border border-zinc-900 p-6 md:p-8 rounded-2xl space-y-6 scroll-mt-20">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-900 flex-wrap gap-3">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                <BookOpen className="h-4.5 w-4.5 text-red-500" />
              </div>
              <h2 className="text-lg font-black uppercase tracking-wider text-white">Interactive User Guide</h2>
            </div>
            <Badge variant="outline" className="bg-zinc-900 border-zinc-800 text-zinc-450 text-[10px] font-mono">
              Workspace Docs v2.1
            </Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Guide Menu Options */}
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
                        ? "bg-gradient-to-r from-red-500/15 to-red-500/5 border-red-500/40 text-white font-bold"
                        : "bg-transparent border-transparent text-zinc-500 hover:bg-zinc-900/30 hover:text-zinc-300"
                    }`}
                  >
                    <IconComp className={`h-4.5 w-4.5 ${isSelected ? "text-red-500 animate-pulse" : "text-zinc-500"}`} />
                    <span className="text-xs uppercase tracking-widest font-semibold">{t.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Guide Content Viewer Panel */}
            <div className="lg:col-span-8 bg-zinc-950/80 border border-zinc-900 p-6 rounded-xl flex flex-col justify-between min-h-[300px] shadow-inner relative">
              <div className="absolute top-4 right-4 text-[9px] font-mono text-zinc-600">SECURE LOG</div>
              
              {activeGuideTab === "quick-start" && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2 uppercase tracking-wide">
                    <Zap className="h-4.5 w-4.5 text-red-500 fill-red-500/20" />
                    Quick Start & Workspace Operations
                  </h3>
                  <p className="text-zinc-450 text-xs leading-relaxed">
                    YS Portfolio runs on a secure single-password cookie validation model. Follow these steps to navigate the workspace:
                  </p>
                  <ul className="space-y-3 text-xs text-zinc-400">
                    <li className="flex gap-2.5 items-start">
                      <span className="p-1 bg-zinc-900 border border-zinc-800 rounded text-red-500 text-[10px] font-mono shrink-0 font-bold h-6 w-6 flex items-center justify-center">01</span>
                      <span>Enter the system password in the **Access Gate Card** to unlock secure endpoints.</span>
                    </li>
                    <li className="flex gap-2.5 items-start">
                      <span className="p-1 bg-zinc-900 border border-zinc-800 rounded text-red-500 text-[10px] font-mono shrink-0 font-bold h-6 w-6 flex items-center justify-center">02</span>
                      <span>The sidebar drawer unlocks immediately, letting you browse mutual funds, direct portfolios, or ledgers.</span>
                    </li>
                    <li className="flex gap-2.5 items-start">
                      <span className="p-1 bg-zinc-900 border border-zinc-800 rounded text-red-500 text-[10px] font-mono shrink-0 font-bold h-6 w-6 flex items-center justify-center">03</span>
                      <span>Use the global **Search Console** at the top right of the dashboard screen to load quick asset lookups.</span>
                    </li>
                  </ul>
                </div>
              )}

              {activeGuideTab === "portfolio-sync" && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2 uppercase tracking-wide">
                    <Wallet className="h-4.5 w-4.5 text-red-500" />
                    Syncing Holdings & Parser Settings
                  </h3>
                  <p className="text-zinc-450 text-xs leading-relaxed">
                    Consolidate stock shares, bank allocations, physical assets, and mutual funds within a single view.
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="p-3 bg-zinc-900/20 border border-zinc-850 rounded-xl space-y-1.5 hover:border-zinc-800 transition-colors">
                      <span className="text-[10px] font-bold text-zinc-450 uppercase tracking-widest flex items-center gap-1.5">
                        <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
                        Excel Auto-Parser
                      </span>
                      <p className="text-[11px] text-zinc-550 leading-relaxed">
                        Navigate to **Portfolio** tab, click **Upload Excel**, choose your CAS broker report. The server extracts dates, buys, buys averages, and tickers.
                      </p>
                    </div>

                    <div className="p-3 bg-zinc-900/20 border border-zinc-850 rounded-xl space-y-1.5 hover:border-zinc-800 transition-colors">
                      <span className="text-[10px] font-bold text-zinc-450 uppercase tracking-widest flex items-center gap-1.5">
                        <LineChart className="h-3.5 w-3.5 text-blue-400" />
                        Live Price Scraping
                      </span>
                      <p className="text-[11px] text-zinc-550 leading-relaxed">
                        The app runs asynchronous scraper scripts that query current stock/MF valuations, calculating real-time unrealized gains or losses.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeGuideTab === "fii-dii-screener" && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2 uppercase tracking-wide">
                    <TrendingUp className="h-4.5 w-4.5 text-red-500" />
                    FII DII Tracking & Screener.in Views
                  </h3>
                  <p className="text-zinc-450 text-xs leading-relaxed">
                    Track large institutional investment cycles inside Indian equities:
                  </p>
                  <ul className="space-y-2.5 text-xs text-zinc-400">
                    <li className="flex gap-2 items-start">
                      <CheckCircle2 className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                      <span>**Historical NAV Charts:** Pulls real-time prices for MFs with precise date-times directly from Yahoo Finance and AMFI.</span>
                    </li>
                    <li className="flex gap-2 items-start">
                      <CheckCircle2 className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                      <span>**Sectors Breakdown:** Audit FII/DII Net Flow values and expand weight tables to discover stock weight percentages inside sector logs.</span>
                    </li>
                    <li className="flex gap-2 items-start">
                      <CheckCircle2 className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                      <span>**Screener details:** Pulls ROCE, margins, sales history, P/E ratios, and stock charts dynamically inside single layout overlay panels.</span>
                    </li>
                  </ul>
                </div>
              )}

              {activeGuideTab === "ai-ledger" && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2 uppercase tracking-wide">
                    <BrainCircuit className="h-4.5 w-4.5 text-red-500" />
                    Cash Book Ledgers & AI Rebalancing
                  </h3>
                  <p className="text-zinc-450 text-xs leading-relaxed">
                    Track liquid capital assets and follow algorithmic risk evaluation suggestions.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="p-3 bg-zinc-900/20 border border-zinc-850 rounded-xl space-y-1 hover:border-zinc-800 transition-colors">
                      <span className="text-[10px] font-bold text-zinc-450 uppercase tracking-widest flex items-center gap-1.5">
                        <Book className="h-3.5 w-3.5 text-purple-400" />
                        Double-Entry Cash Book
                      </span>
                      <p className="text-[11px] text-zinc-550 leading-relaxed">
                        Log cash/bank transaction records. Updates cash book balances, credits, and debits, showing cash flow balances immediately.
                      </p>
                    </div>

                    <div className="p-3 bg-zinc-900/20 border border-zinc-850 rounded-xl space-y-1 hover:border-zinc-800 transition-colors">
                      <span className="text-[10px] font-bold text-zinc-450 uppercase tracking-widest flex items-center gap-1.5">
                        <UserCheck className="h-3.5 w-3.5 text-amber-500" />
                        AI Reallocator
                      </span>
                      <p className="text-[11px] text-zinc-550 leading-relaxed">
                        Checks debt ratios, liquidity parameters, extreme industry concentration, and prompts reallocating weights to stabilize assets.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Guide Panel Action Footer */}
              <div className="mt-6 pt-4 border-t border-zinc-900 flex items-center justify-between flex-wrap gap-2 text-xs">
                <span className="text-zinc-500 font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  Guide logs compiled for secure host verified sessions
                </span>
                
                <Button 
                  onClick={() => {
                    if (isLoggedIn) {
                      router.push("/dashboard");
                    } else {
                      document.getElementById("login-card")?.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                  className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white font-extrabold px-3.5 py-1.5 rounded-lg transition-all cursor-pointer text-xs uppercase tracking-wider"
                >
                  {isLoggedIn ? "Go to Dashboard" : "Authenticate Session"}
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Footer Area with legal elements */}
      <footer className="relative z-20 border-t border-zinc-900 bg-zinc-950/80 backdrop-blur-xl mt-24">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-12 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            
            {/* Left Column Brand */}
            <div className="md:col-span-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                  <Database className="h-4 w-4 text-red-500" />
                </div>
                <span className="font-black text-sm tracking-wider text-white uppercase">YS PORTFOLIO</span>
              </div>
              <p className="text-zinc-550 text-xs leading-relaxed max-w-sm">
                A private, high-fidelity wealth management and analytical suite designed for direct equity tracking, mutual fund historical charting, and FII/DII flow research.
              </p>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-zinc-600 tracking-wider">POWERED BY</span>
                <span className="text-[11px] font-black tracking-widest text-red-500">UNZORA</span>
              </div>
            </div>

            {/* Center Column Features */}
            <div className="md:col-span-3 space-y-3">
              <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Workspace Modules</h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <button onClick={() => document.getElementById("features-section")?.scrollIntoView({ behavior: "smooth" })} className="text-zinc-500 hover:text-white transition-colors cursor-pointer bg-transparent border-0 p-0 text-left">
                    Portfolio Syncing
                  </button>
                </li>
                <li>
                  <button onClick={() => document.getElementById("features-section")?.scrollIntoView({ behavior: "smooth" })} className="text-zinc-500 hover:text-white transition-colors cursor-pointer bg-transparent border-0 p-0 text-left">
                    Mutual Funds Charting
                  </button>
                </li>
                <li>
                  <button onClick={() => document.getElementById("features-section")?.scrollIntoView({ behavior: "smooth" })} className="text-zinc-500 hover:text-white transition-colors cursor-pointer bg-transparent border-0 p-0 text-left">
                    FII / DII Flow Tracker
                  </button>
                </li>
                <li>
                  <button onClick={() => document.getElementById("features-section")?.scrollIntoView({ behavior: "smooth" })} className="text-zinc-500 hover:text-white transition-colors cursor-pointer bg-transparent border-0 p-0 text-left">
                    AI Reallocations & Ledgers
                  </button>
                </li>
              </ul>
            </div>

            {/* Right Column Legal */}
            <div className="md:col-span-4 space-y-3">
              <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Legal & Operations</h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <button onClick={() => openTerms("terms")} className="text-zinc-500 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer bg-transparent border-0 p-0 text-left">
                    <Scale className="h-3.5 w-3.5 text-zinc-600" />
                    Terms & Conditions
                  </button>
                </li>
                <li>
                  <button onClick={() => openTerms("privacy")} className="text-zinc-500 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer bg-transparent border-0 p-0 text-left">
                    <FileText className="h-3.5 w-3.5 text-zinc-600" />
                    Privacy Statement
                  </button>
                </li>
                <li>
                  <button onClick={() => openTerms("disclaimer")} className="text-zinc-500 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer bg-transparent border-0 p-0 text-left">
                    <Info className="h-3.5 w-3.5 text-zinc-600" />
                    Disclaimer & Risk Policy
                  </button>
                </li>
              </ul>
            </div>

          </div>

          <div className="border-t border-zinc-900/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-600">
            <div>
              &copy; {new Date().getFullYear()} YS Portfolio. All Rights Reserved. Private Instance.
            </div>
            <div className="flex items-center gap-3">
              <span>Secure Session Cookies enabled</span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Bottom Right Brand Logo */}
      <div className="fixed bottom-4 right-4 z-50 pointer-events-none opacity-40 hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-1.5 bg-zinc-950/90 border border-zinc-900/85 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-2xl">
          <span className="text-[9px] font-bold text-zinc-500 tracking-wider">POWERED BY</span>
          <span className="text-xs font-black tracking-widest text-red-500">UNZORA</span>
        </div>
      </div>

      {/* Custom Terms & Conditions Modal Overlay */}
      {showTermsModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-zinc-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-red-500" />
                <h3 className="text-sm font-extrabold uppercase tracking-widest text-white">
                  {termsType === "terms" && "Terms & Conditions of Usage"}
                  {termsType === "privacy" && "Privacy Statement & Data Policy"}
                  {termsType === "disclaimer" && "System Disclaimer & Risk Agreement"}
                </h3>
              </div>
              <button 
                onClick={() => setShowTermsModal(false)}
                className="h-8 w-8 rounded-lg bg-zinc-900 hover:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body Scroll Area */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs text-zinc-450 leading-relaxed custom-scrollbar">
              {termsType === "terms" && (
                <>
                  <p className="font-bold text-white">1. Scope of Private Utility Application</p>
                  <p>
                    This software system is a private asset tracking portal, engineered exclusively for tracking portfolio metrics and performing equity research. It is restricted to authorized credentials holders. Access by unauthorized entities is strictly prohibited.
                  </p>
                  <p className="font-bold text-white">2. Password Gate Verification Cookies</p>
                  <p>
                    By submitting the verification security password, you agree to the storage of authorization cookies within your client browser. These cookies maintain the session state to allow communication with the REST APIs.
                  </p>
                  <p className="font-bold text-white">3. Third Party Integrations</p>
                  <p>
                    The portal utilizes public third-party endpoints (e.g. Yahoo Finance charts, AMFI mutual fund rates, Screener.in corporate metrics) to display tracking valuations. Users acknowledge that data correctness depends on external services and there is no guarantee of absolute correctness.
                  </p>
                  <p className="font-bold text-white">4. User Account Stewardship</p>
                  <p>
                    The session security relies on a singular master gate password. Disclosing this verification password to third parties can expose personal portfolios, balances, holdings, and ledgers. You hold full accountability for securing your access key.
                  </p>
                </>
              )}

              {termsType === "privacy" && (
                <>
                  <p className="font-bold text-white">1. Localized Context Handling</p>
                  <p>
                    YS Portfolio is built on data safety principles. Uploaded Excel broker statements, Cash Book transaction sheets, and portfolio weights are processed on your host server.
                  </p>
                  <p className="font-bold text-white">2. Absolute Data Control</p>
                  <p>
                    No financial details, broker credentials, or investment balances are shared, distributed, or stored by any external cloud services. All information remains local to your private Next.js database backend configuration.
                  </p>
                  <p className="font-bold text-white">3. Session Expiration</p>
                  <p>
                    Session token cookies automatically clear upon clicking the Log Out action in the sidebar panel. Forcing cookie removal manually in dev-tools also completely terminates all authenticated states.
                  </p>
                  <p className="font-bold text-white">4. Logging & Diagnostics</p>
                  <p>
                    Standard application logs are captured strictly on the system's hosting workspace to trace system behavior and scrape status diagnostics.
                  </p>
                </>
              )}

              {termsType === "disclaimer" && (
                <>
                  <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-500 flex items-start gap-3">
                    <Info className="h-5 w-5 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold uppercase tracking-wider text-[10px] block mb-1">Critical Notice</span>
                      YS Portfolio is a personal tracking tool. It is not registered under SEBI (Securities and Exchange Board of India) or any global regulatory finance body.
                    </div>
                  </div>
                  <p className="font-bold text-white">1. Not Certified Investment Advice</p>
                  <p>
                    None of the metrics shown in the dashboard, FII/DII institutional ratios, Screener.in peer comparisons, or AI reallocation insights constitute certified buying or selling recommendations. Please perform self-directed research or speak with a certified advisor before committing capital.
                  </p>
                  <p className="font-bold text-white">2. Scraping Correctness & Delay Disclaimer</p>
                  <p>
                    Market data, mutual fund NAV valuations, and direct stock pricing are fetched periodically or scraped from external indices. Information may have latency or delays. Users should verify live asset pricing on official exchanges (NSE, BSE, AMFI) prior to executing orders.
                  </p>
                  <p className="font-bold text-white">3. System Warranty</p>
                  <p>
                    This utility application is provided &quot;as-is&quot;, with zero warranties. The developer holds no accountability for tracking errors, network failures, or losses incurred during market operations.
                  </p>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-zinc-900 bg-zinc-950/80 flex justify-end">
              <Button
                onClick={() => setShowTermsModal(false)}
                className="bg-red-500 hover:bg-red-655 text-white font-extrabold text-xs px-5 h-9 uppercase tracking-wider cursor-pointer rounded-lg"
              >
                I Understand & Accept
              </Button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
