"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ShieldCheck,
  Building2,
  Users2,
  Users,
  IndianRupee,
  SearchCheck,
  ChevronDown,
  ArrowRight,
  TrendingUp,
  LineChart,
  BarChart3,
  Coins,
  BrainCircuit,
  Lock,
  Loader2,
  PieChart,
  Calculator,
  Calendar,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Scale,
  FileText,
  Info,
  Check,
  Landmark,
  BookOpen,
  Briefcase,
  Menu,
  X,
  TrendingDown,
  Globe,
  Star,
  Award,
  Zap,
  ChevronRight,
  ArrowUpRight,
  Activity,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import toast from "react-hot-toast";

export default function Home() {
  const router = useRouter();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState<boolean>(false);
  const [termsType, setTermsType] = useState<"terms" | "privacy" | "disclaimer">("terms");
  const [showcaseTab, setShowcaseTab] = useState<"overview" | "mf" | "fii" | "ai">("overview");
  const [calcType, setCalcType] = useState<"sip" | "lumpsum">("sip");
  const [monthlyInvestment, setMonthlyInvestment] = useState<number>(25000);
  const [lumpsumInvestment, setLumpsumInvestment] = useState<number>(500000);
  const [expectedReturnRate, setExpectedReturnRate] = useState<number>(14);
  const [investmentYears, setInvestmentYears] = useState<number>(10);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setIsLoggedIn(data.verified);
          setCurrentUsername(data.user || "main");
        } else {
          setIsLoggedIn(false);
          setCurrentUsername(null);
        }
      } catch (err) {
        setIsLoggedIn(false);
        setCurrentUsername(null);
      }
    }
    checkSession();
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    setAuthLoading(true);
    try {
      const res = await fetch("/api/auth/verify-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim() || undefined, password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsLoggedIn(true);
        setCurrentUsername(data.user || username.trim() || "main");
        toast.success(`Welcome ${data.user || "Investor"}!`);
        setIsLoginModalOpen(false);
        router.push("/dashboard");
      } else {
        setShake(true);
        setTimeout(() => setShake(false), 500);
        toast.error("Invalid credentials. Please verify your password.");
      }
    } catch (err) {
      toast.error("Network error. Please try again.");
    } finally {
      setAuthLoading(false);
    }
  };

  const calculatorResults = useMemo(() => {
    const rateMonthly = expectedReturnRate / 12 / 100;
    const months = investmentYears * 12;
    if (calcType === "sip") {
      const invested = monthlyInvestment * months;
      const total = monthlyInvestment * ((Math.pow(1 + rateMonthly, months) - 1) / rateMonthly) * (1 + rateMonthly);
      const returns = total - invested;
      return { invested: Math.round(invested), returns: Math.round(returns), total: Math.round(total) };
    } else {
      const invested = lumpsumInvestment;
      const total = lumpsumInvestment * Math.pow(1 + expectedReturnRate / 100, investmentYears);
      const returns = total - invested;
      return { invested: Math.round(invested), returns: Math.round(returns), total: Math.round(total) };
    }
  }, [calcType, monthlyInvestment, lumpsumInvestment, expectedReturnRate, investmentYears]);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);

  const openTerms = (type: "terms" | "privacy" | "disclaimer") => {
    setTermsType(type);
    setShowTermsModal(true);
  };

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileMenuOpen(false);
  };

  const faqItems = [
    {
      q: "What is YS Digital Portfolio?",
      a: "YS Digital Portfolio is an institutional wealth intelligence suite built by Y S CAPITAL. It consolidates your Mutual Funds across all AMCs, direct equities from any broker, cash deposits, gold bonds, and liabilities into a single unified real-time analytics command center.",
    },
    {
      q: "How does automated CAS & Excel statement parsing work?",
      a: "You can import your Consolidated Account Statement (CAS) or broker spreadsheet with a single click. The backend engine automatically extracts scheme names, folio IDs, ISIN codes, transaction dates, quantity, and purchase prices without manual data entry.",
    },
    {
      q: "Is my personal financial data secure and private?",
      a: "Yes, 100%. YS Portfolio operates on a strictly host-isolated architecture. Your investment values, trade history, and ledgers remain solely on your authenticated private database. No sensitive portfolio data is shared with third parties.",
    },
    {
      q: "How are Mutual Fund NAVs and stock prices updated?",
      a: "Mutual fund NAVs are refreshed daily through direct integration with AMFI official database API. Direct equity prices and market indices are fetched via real-time market scrapers with live intraday tracking.",
    },
  ];

  const stats = [
    { icon: ShieldCheck, label: "AMFI Registered", sub: "MF Distributor", color: "text-amber-400", bg: "bg-amber-400/10" },
    { icon: Building2, label: "AMFI Registered", sub: "SIF Distributor", color: "text-blue-400", bg: "bg-blue-400/10" },
    { icon: Users2, label: "APMI Registered", sub: "PMS Distributor", color: "text-purple-400", bg: "bg-purple-400/10" },
    { icon: Users, label: "500+ Clients", sub: "Families Served", color: "text-emerald-400", bg: "bg-emerald-400/10" },
    { icon: IndianRupee, label: "₹1200 Cr+", sub: "Assets Managed", color: "text-amber-400", bg: "bg-amber-400/10" },
    { icon: SearchCheck, label: "Research Driven", sub: "Investment Products", color: "text-cyan-400", bg: "bg-cyan-400/10" },
  ];



  const whyUsCards = [
    {
      icon: Calendar,
      title: "23+ Years Experience",
      desc: "Trusted distributor across generations since 2001, steering capital through multiple market cycles.",
      gradient: "from-blue-500 to-blue-700",
    },
    {
      icon: ShieldCheck,
      title: "AMFI & APMI Certified",
      desc: "Strict adherence to SEBI, AMFI, and APMI governance standards with verified regulatory credentials.",
      gradient: "from-amber-500 to-orange-600",
    },
    {
      icon: Activity,
      title: "360° Digital Tracking",
      desc: "Seamless multi-asset consolidation across Mutual Funds, Direct Equity, Bonds, and Cash ledgers.",
      gradient: "from-emerald-500 to-teal-600",
    },
    {
      icon: Users,
      title: "500+ HNW Families",
      desc: "Over ₹1200 Cr+ in assets managed with personalized wealth advisory and family office care.",
      gradient: "from-purple-500 to-purple-700",
    },
  ];

  return (
    <div className="relative min-h-screen w-full bg-white text-[#0a2540] font-sans antialiased">

      {/* ─────────────────────────────────────────────────────────────── */}
      {/* NAVBAR                                                          */}
      {/* ─────────────────────────────────────────────────────────────── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-xl shadow-sm border-b border-slate-200/70"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[72px] flex items-center justify-between">

          {/* Brand Logo — only image */}
          <div
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center cursor-pointer group select-none"
          >
            <div className={`relative h-11 w-8 rounded-lg overflow-hidden flex items-center justify-center transition-all duration-300 ${scrolled ? "bg-black shadow-sm" : "bg-black/90"}`}>
              <Image src="/ys_logo.png" alt="YS" fill className="object-contain p-0.5" priority />
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            <button
              onClick={() => scrollTo("why-us-section")}
              className={`px-4 py-2 text-[15px] font-semibold tracking-wide rounded-lg transition-all ${
                scrolled
                  ? "text-slate-600 hover:text-[#0047AB] hover:bg-slate-50"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              Why Us
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={`flex items-center gap-1 px-4 py-2 text-[15px] font-semibold tracking-wide rounded-lg transition-all outline-none ${
                    scrolled
                      ? "text-slate-600 hover:text-[#0047AB] hover:bg-slate-50"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                  }`}
                >
                  Products <ChevronDown className="h-3.5 w-3.5 opacity-70" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                sideOffset={8}
                className="w-64 p-2 bg-white border border-slate-200/80 shadow-2xl rounded-2xl"
              >
                {[
                  { label: "Mutual Funds (AMFI Hub)", route: "/mutual-funds" },
                  { label: "Direct Equity & Stocks", route: "/portfolio" },
                  { label: "FII & DII Market Flow", route: "/fii-dii-tracker" },
                  { label: "Cash Book Accounting", route: "/cashbook" },
                  { label: "AI Portfolio Rebalancing", route: "/ai-insights" },
                ].map((item) => (
                  <DropdownMenuItem
                    key={item.route}
                    onClick={() => {
                      if (isLoggedIn) router.push(item.route);
                      else scrollTo("digital-portfolio-section");
                    }}
                    className="cursor-pointer text-[13px] font-medium py-2.5 px-3 rounded-xl text-slate-700 hover:text-[#0047AB] hover:bg-blue-50/70 flex items-center justify-between group"
                  >
                    <span>{item.label}</span>
                    <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-60 transition-opacity" />
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <button
              onClick={() => scrollTo("digital-portfolio-section")}
              className={`px-4 py-2 text-[15px] font-bold tracking-wide rounded-lg transition-all relative ${
                scrolled
                  ? "text-[#0047AB] hover:bg-blue-50"
                  : "text-white hover:bg-white/10"
              }`}
            >
              Digital Portfolio
              <span className="absolute bottom-1.5 left-4 right-4 h-0.5 bg-current rounded-full opacity-60" />
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={`flex items-center gap-1 px-4 py-2 text-[15px] font-semibold tracking-wide rounded-lg transition-all outline-none ${
                    scrolled
                      ? "text-slate-600 hover:text-[#0047AB] hover:bg-slate-50"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                  }`}
                >
                  Resources <ChevronDown className="h-3.5 w-3.5 opacity-70" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                sideOffset={8}
                className="w-60 p-2 bg-white border border-slate-200/80 shadow-2xl rounded-2xl"
              >
                <DropdownMenuItem
                  onClick={() => scrollTo("calculators-section")}
                  className="cursor-pointer text-[13px] font-medium py-2.5 px-3 rounded-xl text-slate-700 hover:text-[#0047AB] hover:bg-blue-50/70 flex items-center justify-between group"
                >
                  <span>SIP & Wealth Calculators</span>
                  <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-60 transition-opacity" />
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => scrollTo("faq-section")}
                  className="cursor-pointer text-[13px] font-medium py-2.5 px-3 rounded-xl text-slate-700 hover:text-[#0047AB] hover:bg-blue-50/70 flex items-center justify-between group"
                >
                  <span>Investor FAQ & Guides</span>
                  <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-60 transition-opacity" />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <button
              onClick={() => scrollTo("contact-section")}
              className={`px-4 py-2 text-[15px] font-semibold tracking-wide rounded-lg transition-all ${
                scrolled
                  ? "text-slate-600 hover:text-[#0047AB] hover:bg-slate-50"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              Contact
            </button>
          </nav>

          {/* Right CTA */}
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <Button
                onClick={() => router.push("/dashboard")}
                className="h-10 px-5 bg-[#0047AB] hover:bg-[#003882] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-blue-900/20 hover:shadow-xl hover:shadow-blue-900/30 transition-all cursor-pointer flex items-center gap-2"
              >
                Dashboard <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            ) : (
              <Button
                onClick={() => router.push("/login")}
                className={`h-10 px-6 font-bold text-[15px] rounded-xl transition-all cursor-pointer ${
                  scrolled
                    ? "bg-[#0047AB] hover:bg-[#003882] text-white shadow-lg shadow-blue-900/20"
                    : "bg-white text-[#0047AB] hover:bg-white/90 shadow-lg"
                }`}
              >
                Client Login
              </Button>
            )}

            {/* Mobile Hamburger */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`lg:hidden h-10 w-10 rounded-xl ${scrolled ? "text-slate-700 hover:bg-slate-100" : "text-white hover:bg-white/10"}`}
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] p-0 bg-white flex flex-col">
                <SheetHeader className="p-6 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-8 rounded-lg overflow-hidden bg-black flex-shrink-0">
                      <Image src="/ys_logo.png" alt="YS" fill className="object-contain p-0.5" />
                    </div>
                    <div>
                      <SheetTitle className="text-base font-black font-serif text-[#0a2540] tracking-widest">YS CAPITAL</SheetTitle>
                      <span className="text-[10px] text-slate-400">ARN 145084 · AMFI · APMI</span>
                    </div>
                  </div>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto py-4 px-4 space-y-1">
                  {[
                    { label: "Why Us", id: "why-us-section" },
                    { label: "Digital Portfolio", id: "digital-portfolio-section" },
                    { label: "Wealth Calculators", id: "calculators-section" },
                    { label: "FAQ & Guides", id: "faq-section" },
                    { label: "Contact Us", id: "contact-section" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => scrollTo(item.id)}
                      className="w-full text-left px-4 py-3 rounded-xl text-[14px] font-semibold text-slate-700 hover:text-[#0047AB] hover:bg-blue-50 transition-all"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                <div className="p-4 border-t border-slate-100">
                  <Button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      if (isLoggedIn) router.push("/dashboard");
                      else router.push("/login");
                    }}
                    className="w-full h-12 bg-[#0047AB] hover:bg-[#003882] text-white font-bold text-sm rounded-xl"
                  >
                    {isLoggedIn ? "Open Dashboard" : "Client Login"}
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────── */}
      {/* HERO SECTION                                                    */}
      {/* ─────────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col justify-center overflow-hidden">
        {/* Background Video */}
        <div className="absolute inset-0 overflow-hidden">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover object-center"
          >
            <source src="/herosection.mp4" type="video/mp4" />
            {/* Fallback image if video fails */}
            <Image
              src="/hero_serene_sunset.png"
              alt="Hero Background"
              fill
              className="object-cover object-center"
              priority
            />
          </video>
          {/* Dark Black Overlay — subtle, lets video breathe */}
          <div className="absolute inset-0 bg-black/55" />
          {/* Subtle dot pattern */}
          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 w-full">
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-180px)] text-center">

            {/* Hero Content — centered */}
            <div className="space-y-8 max-w-3xl w-full">

              {/* Headline */}
              <div className="space-y-2">
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black font-serif tracking-tight text-white leading-[1.05]">
                  Your Wealth.
                </h1>
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black font-serif tracking-tight leading-[1.05]"
                  style={{
                    background: "linear-gradient(135deg, #f5c842 0%, #e8a020 50%, #c58b35 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  One Dashboard.
                </h1>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <div className="w-12 h-[3px] bg-amber-400 rounded-full" />
                  <div className="w-4 h-[3px] bg-amber-400/50 rounded-full" />
                </div>
              </div>

              {/* Description */}
              <p className="text-white/70 text-base sm:text-lg leading-relaxed max-w-2xl font-light mx-auto">
                Track all your Mutual Funds, Direct Equity, Fixed Deposits, Bonds, and Loans in one unified real-time command center.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3.5 pt-2 justify-center">
                <button
                  onClick={() => {
                    if (isLoggedIn) router.push("/dashboard");
                    else router.push("/login");
                  }}
                  className="group inline-flex items-center justify-center gap-2.5 h-13 px-8 bg-[#0047AB] hover:bg-[#003882] text-white font-bold text-sm rounded-xl shadow-xl shadow-blue-900/40 hover:shadow-2xl hover:shadow-blue-900/50 transition-all duration-300 cursor-pointer"
                  style={{ height: "52px" }}
                >
                  <span>{isLoggedIn ? "Open My Dashboard" : "Open Portfolio Dashboard"}</span>
                  <ArrowRight className="h-4.5 w-4.5 group-hover:translate-x-0.5 transition-transform" />
                </button>

                <button
                  onClick={() => scrollTo("platform-features-section")}
                  className="inline-flex items-center justify-center gap-2 h-13 px-8 bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/40 font-semibold text-sm rounded-xl backdrop-blur-sm transition-all duration-300 cursor-pointer"
                  style={{ height: "52px" }}
                >
                  Explore Features
                </button>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap items-center justify-center gap-5 pt-2">
                {[
                  "Live NAV & NSE Prices",
                  "AI Risk Diagnostics",
                  "CAS & Excel Import",
                  "Host-Isolated & Private",
                ].map((t) => (
                  <div key={t} className="flex items-center gap-2 text-white/70 text-xs font-medium">
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    {t}
                  </div>
                ))}
              </div>

            </div>

          </div>
        </div>

        {/* Stats Strip */}
        <div className="relative z-10 w-full border-t border-white/10 bg-black/30 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 divide-x divide-white/10">
              {stats.map((s, i) => (
                <div key={i} className={`flex flex-col items-center text-center gap-1 px-2 ${i > 0 ? "border-l border-white/10" : ""} ${i > 0 && i < 3 ? "sm:border-l" : ""}`}>
                  <div className={`h-8 w-8 rounded-lg ${s.bg} flex items-center justify-center ${s.color}`}>
                    <s.icon className="h-4 w-4" />
                  </div>
                  <span className="text-white text-xs font-bold leading-tight">{s.label}</span>
                  <span className="text-white/50 text-[10px] font-medium">{s.sub}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────── */}
      {/* DIGITAL PORTFOLIO SHOWCASE                                     */}
      {/* ─────────────────────────────────────────────────────────────── */}
      <section id="digital-portfolio-section" className="py-20 sm:py-28 bg-gradient-to-b from-white via-slate-50/70 to-white relative overflow-hidden">
        {/* Subtle background ambient gradients */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[750px] h-[400px] bg-gradient-to-br from-blue-500/10 via-indigo-500/10 to-amber-500/10 rounded-full blur-3xl pointer-events-none -z-0" />
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:28px_28px] opacity-40 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10 space-y-3.5">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-serif text-[#0a2540] tracking-tight leading-[1.15]">
              Integrated Wealth <br />
              <span className="bg-gradient-to-r from-[#0047AB] via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Management Platform
              </span>
            </h2>
            
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto font-light">
              Consolidate your Mutual Funds, Direct Equities, Active Loans, and Cash Book Ledgers into one executive real-time command center.
            </p>

            <div className="flex items-center justify-center gap-3 pt-1">
              <Button
                onClick={() => { if (isLoggedIn) router.push("/dashboard"); else router.push("/login"); }}
                className="h-10 px-6 bg-[#0047AB] hover:bg-[#003882] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-blue-900/20 hover:shadow-lg hover:shadow-blue-900/30 transition-all cursor-pointer flex items-center gap-2"
              >
                <span>{isLoggedIn ? "Open My Dashboard" : "Experience Live Dashboard"}</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* MAIN 3D SHOWCASE MOCKUP DISPLAY - REDUCED SIZE */}
          <div className="relative mx-auto max-w-3xl my-2 group">
            {/* Ambient Backlight glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/15 via-indigo-400/10 to-emerald-400/15 rounded-3xl blur-2xl -z-10 group-hover:scale-105 transition-transform duration-700 opacity-70" />
            
            {/* Image Container with compact and sleek height */}
            <div className="relative w-full aspect-[16/10] max-h-[460px] flex items-center justify-center">
              <Image
                src="/showcase_dashboard.png"
                alt="YS Portfolio Wealth Dashboard Showcase"
                fill
                sizes="(max-width: 1024px) 95vw, 850px"
                priority
                className="object-contain object-center drop-shadow-[0_20px_30px_rgba(0,0,0,0.12)] hover:scale-[1.01] transition-transform duration-500 select-none"
              />
            </div>
          </div>

          {/* 4 Feature Cards Below the Showcase matching the dashboard widgets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-8 sm:mt-12">
            {[
              {
                icon: PieChart,
                badge: "Asset Allocation",
                title: "Multi-Asset Distribution",
                desc: "Interactive visual split across Stocks, Mutual Funds, Cash, and Loans with automatic rebalancing alerts.",
                color: "text-blue-600",
                bg: "bg-blue-50",
                border: "border-blue-100",
              },
              {
                icon: TrendingUp,
                badge: "Live Valuation",
                title: "Real-Time NAV & P&L",
                desc: "Direct integration with AMFI daily declarations and NSE stock market ticks for accurate net-worth tracking.",
                color: "text-emerald-600",
                bg: "bg-emerald-50",
                border: "border-emerald-100",
              },
              {
                icon: Coins,
                badge: "Cashflow & Ledgers",
                title: "Integrated Cash Book",
                desc: "Double-entry tracking of dividend payouts, SIP debits, loan EMIs, and liquid emergency reserves.",
                color: "text-amber-600",
                bg: "bg-amber-50",
                border: "border-amber-100",
              },
              {
                icon: ShieldCheck,
                badge: "Host-Isolated",
                title: "1-Click CAS & Excel Import",
                desc: "Effortlessly import your CAMS, KFintech CAS, or Motilal Oswal statements directly into your private database.",
                color: "text-indigo-600",
                bg: "bg-indigo-50",
                border: "border-indigo-100",
              },
            ].map((f, i) => (
              <div
                key={i}
                className="bg-white border border-slate-200/90 hover:border-blue-300 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`h-11 w-11 rounded-xl ${f.bg} border ${f.border} flex items-center justify-center ${f.color} group-hover:scale-105 transition-transform`}>
                      <f.icon className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
                      {f.badge}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-[#0047AB] transition-colors">
                    {f.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────── */}
      {/* WHY US SECTION                                                  */}
      {/* ─────────────────────────────────────────────────────────────── */}
      <section id="why-us-section" className="py-24 bg-[#0a192f]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/70 text-xs font-bold uppercase tracking-widest">
              <Star className="h-3.5 w-3.5 text-amber-400" />
              Why Choose Us
            </div>
            <h2 className="text-4xl sm:text-5xl font-black font-serif text-white tracking-tight">
              A Legacy of Trust, <br />Disciplined Growth
            </h2>
            <p className="text-slate-400 text-base leading-relaxed">
              We guide families, HNW investors, and institutions through generational wealth creation with customized financial solutions.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {whyUsCards.map((card, i) => (
              <div
                key={i}
                className="group relative bg-white/5 border border-white/10 rounded-2xl p-7 hover:bg-white/8 hover:border-white/20 transition-all duration-300 overflow-hidden"
              >
                {/* Gradient accent */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${card.gradient} opacity-80 rounded-t-2xl`} />
                <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${card.gradient} bg-opacity-20 flex items-center justify-center mb-5 shadow-lg`}>
                  <card.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{card.title}</h3>
                <p className="text-slate-400 text-xs leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>


        </div>
      </section>



      {/* ─────────────────────────────────────────────────────────────── */}
      {/* PLATFORM FEATURES DEEP DIVE                                     */}
      {/* ─────────────────────────────────────────────────────────────── */}
      <section id="platform-features-section" className="py-24 bg-slate-50 relative overflow-hidden">
        {/* Subtle top accent */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">

          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-[#0047AB] text-xs font-bold uppercase tracking-widest">
              <Sparkles className="h-3.5 w-3.5" />
              Dashboard Features
            </div>
            <h2 className="text-4xl sm:text-5xl font-black font-serif text-[#0a2540] tracking-tight">
              Everything Inside <br />Your Dashboard
            </h2>
            <p className="text-slate-500 text-base leading-relaxed">
              A complete suite of institutional-grade tools — built for serious investors who demand clarity, speed, and intelligence.
            </p>
          </div>

          {/* FEATURE 1: Dashboard Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold uppercase tracking-widest">
                <PieChart className="h-3.5 w-3.5" />
                Dashboard Overview
              </div>
              <h3 className="text-3xl font-black font-serif text-[#0a2540] tracking-tight leading-snug">
                Your Entire Wealth at a Single Glance
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                The main dashboard consolidates all your investments — Mutual Funds, Direct Stocks, Fixed Deposits, Gold Bonds, Loans, and Cash — into one real-time command center. See your total net worth, day&apos;s P&L, XIRR, and asset allocation instantly.
              </p>
              <ul className="space-y-3">
                {[
                  "Live total portfolio valuation with day change",
                  "XIRR-based overall return calculation",
                  "Multi-asset allocation donut chart",
                  "Top gainers & losers across all holdings",
                  "Sector-wise exposure breakdown",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-slate-600">
                    <div className="h-5 w-5 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="h-3 w-3 text-blue-700" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => { if (isLoggedIn) router.push("/dashboard"); else router.push("/login"); }}
                className="inline-flex items-center gap-2 text-[#0047AB] text-sm font-bold hover:gap-3 transition-all cursor-pointer group"
              >
                Open Live Dashboard <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Visual mockup */}
            <div className="relative">
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-2xl shadow-slate-200">
                {/* Mock header */}
                <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Net Portfolio Value</p>
                    <p className="text-2xl font-black text-[#0a2540] font-mono">₹38,45,280</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <TrendingUp className="h-3 w-3 text-emerald-500" />
                      <span className="text-xs font-bold text-emerald-600">+₹32,650 (+0.85%) Today</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-2.5 text-center">
                      <p className="text-[9px] text-emerald-600 font-bold uppercase">XIRR</p>
                      <p className="text-sm font-black text-emerald-700">+31.1%</p>
                    </div>
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-2.5 text-center">
                      <p className="text-[9px] text-blue-600 font-bold uppercase">Gain</p>
                      <p className="text-sm font-black text-blue-700">+₹9.1L</p>
                    </div>
                  </div>
                </div>
                {/* Mock chart */}
                <div className="h-28 w-full bg-slate-50 rounded-xl overflow-hidden mb-4 relative">
                  <svg className="w-full h-full" viewBox="0 0 300 100" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="dashGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0047AB" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#0047AB" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path d="M0,80 C30,75 60,65 90,68 C120,71 150,50 180,46 C210,42 240,25 270,22 L300,15 L300,100 L0,100 Z" fill="url(#dashGrad)" />
                    <path d="M0,80 C30,75 60,65 90,68 C120,71 150,50 180,46 C210,42 240,25 270,22 L300,15" fill="none" stroke="#0047AB" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
                {/* Mini allocations */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Equity", pct: 52, color: "bg-blue-500", textColor: "text-blue-700" },
                    { label: "Mutual Funds", pct: 32, color: "bg-amber-500", textColor: "text-amber-700" },
                    { label: "Fixed Inc.", pct: 16, color: "bg-emerald-500", textColor: "text-emerald-700" },
                  ].map((a) => (
                    <div key={a.label} className="bg-slate-50 border border-slate-100 rounded-xl p-2.5">
                      <div className={`text-xs font-black ${a.textColor}`}>{a.pct}%</div>
                      <div className="text-[9px] text-slate-400 font-medium">{a.label}</div>
                      <div className="w-full bg-slate-200 h-1 rounded-full mt-1.5 overflow-hidden">
                        <div className={`${a.color} h-full rounded-full`} style={{ width: `${a.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Floating label */}
              <div className="absolute -top-4 -right-4 bg-[#0047AB] text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-lg">
                Live Updates
              </div>
            </div>
          </div>

          {/* FEATURE 2: Mutual Funds */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Visual mockup first on desktop */}
            <div className="relative order-2 lg:order-1">
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-2xl shadow-slate-200">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                  <div>
                    <p className="text-xs font-bold text-[#0a2540]">Mutual Fund Portfolio</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">AMFI API · Live NAV · 40+ AMCs</p>
                  </div>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">6 Schemes</span>
                </div>
                <div className="space-y-3">
                  {[
                    { name: "Quant Small Cap — Direct Growth", isin: "Small Cap · XIRR: +44.2%", val: "₹5,04,700", gain: "+₹1,54,700", up: true },
                    { name: "Parag Parikh Flexi Cap — Direct", isin: "Flexi Cap · XIRR: +28.6%", val: "₹5,14,400", gain: "+₹1,14,400", up: true },
                    { name: "Mirae Asset Large Cap — Direct", isin: "Large Cap · XIRR: +18.4%", val: "₹2,64,800", gain: "+₹64,800", up: true },
                  ].map((f) => (
                    <div key={f.name} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">{f.name}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{f.isin}</p>
                      </div>
                      <div className="text-right ml-3 flex-shrink-0">
                        <p className="text-xs font-bold text-slate-800 font-mono">{f.val}</p>
                        <p className="text-[10px] text-emerald-600 font-bold">{f.gain}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center">
                  <span className="text-xs text-slate-500">Total MF Value</span>
                  <span className="text-sm font-black text-[#0a2540] font-mono">₹12,83,900</span>
                </div>
              </div>
              <div className="absolute -bottom-3 -left-3 bg-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-lg">
                Daily NAV Sync
              </div>
            </div>

            <div className="space-y-6 order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-50 border border-amber-100 text-amber-700 text-xs font-bold uppercase tracking-widest">
                <Coins className="h-3.5 w-3.5" />
                Mutual Funds Tracker
              </div>
              <h3 className="text-3xl font-black font-serif text-[#0a2540] tracking-tight leading-snug">
                All Your MF Folios in One Place — Real-Time
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Import your Consolidated Account Statement (CAS) with one click and get automatic daily NAV updates from the official AMFI API. Track XIRR, absolute returns, SIP performance, and dividend history across all 40+ AMCs.
              </p>
              <ul className="space-y-3">
                {[
                  "CAS PDF one-click import & auto parsing",
                  "Live NAV from official AMFI database API",
                  "XIRR return calculation per scheme & total",
                  "SIP vs Lumpsum performance comparison",
                  "Dividend & IDCW payout history tracking",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-slate-600">
                    <div className="h-5 w-5 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="h-3 w-3 text-amber-700" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => { if (isLoggedIn) router.push("/mutual-funds"); else router.push("/login"); }}
                className="inline-flex items-center gap-2 text-amber-600 text-sm font-bold hover:gap-3 transition-all cursor-pointer group"
              >
                View MF Dashboard <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* FEATURE 3: Direct Equity / Portfolio */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-widest">
                <LineChart className="h-3.5 w-3.5" />
                Direct Equity Portfolio
              </div>
              <h3 className="text-3xl font-black font-serif text-[#0a2540] tracking-tight leading-snug">
                Stock Holdings with Live Prices & Screener
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Import your equity holdings from Motilal Oswal, Zerodha, Groww or any broker via Excel export. Get real-time LTP, day change, P&L per stock, and powerful screener tools with balance sheet ratios like P/E, ROE, and debt analysis.
              </p>
              <ul className="space-y-3">
                {[
                  "Broker Excel / CAS import (Motilal, Zerodha, Groww)",
                  "Real-time LTP with live day change %",
                  "P&L, cost average & quantity tracking per stock",
                  "Built-in stock screener with financial ratios",
                  "Sector-wise & market-cap exposure analysis",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-slate-600">
                    <div className="h-5 w-5 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="h-3 w-3 text-emerald-700" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => { if (isLoggedIn) router.push("/portfolio"); else router.push("/login"); }}
                className="inline-flex items-center gap-2 text-emerald-600 text-sm font-bold hover:gap-3 transition-all cursor-pointer group"
              >
                View Equity Portfolio <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Visual mockup */}
            <div className="relative">
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-2xl shadow-slate-200">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                  <div>
                    <p className="text-xs font-bold text-[#0a2540]">Direct Equity Holdings</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">NSE / BSE · Real-time LTP</p>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">18 Stocks</span>
                </div>
                <div className="space-y-2.5">
                  {[
                    { ticker: "RELIANCE", name: "Reliance Industries", qty: "50", ltp: "₹2,945", gain: "+₹18,250", pct: "+14.2%", up: true },
                    { ticker: "HDFCBANK", name: "HDFC Bank Ltd.", qty: "80", ltp: "₹1,724", gain: "+₹12,800", pct: "+10.3%", up: true },
                    { ticker: "TCS", name: "Tata Consultancy", qty: "15", ltp: "₹4,185", gain: "-₹4,500", pct: "-6.7%", up: false },
                    { ticker: "INFY", name: "Infosys Ltd.", qty: "35", ltp: "₹1,932", gain: "+₹7,350", pct: "+12.2%", up: true },
                  ].map((s) => (
                    <div key={s.ticker} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                      <div className="h-8 w-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0">
                        <span className="text-[8px] font-black text-slate-600">{s.ticker.slice(0, 3)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-800">{s.name}</p>
                        <p className="text-[10px] text-slate-400">Qty: {s.qty} · LTP: {s.ltp}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className={`text-xs font-bold ${s.up ? "text-emerald-600" : "text-rose-500"}`}>{s.pct}</p>
                        <p className={`text-[10px] font-bold ${s.up ? "text-emerald-500" : "text-rose-400"}`}>{s.gain}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute -top-4 -right-4 bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-lg">
                Live LTP
              </div>
            </div>
          </div>

          {/* FEATURE 4: FII/DII Tracker */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Visual first */}
            <div className="relative order-2 lg:order-1">
              <div className="bg-[#0a192f] border border-slate-700 rounded-3xl p-5 shadow-2xl">
                <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-700">
                  <div>
                    <p className="text-xs font-bold text-white">Institutional Flow Tracker</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">NSE Cash Market · Daily Updated</p>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/30 px-2.5 py-1 rounded-lg">Bullish Mood</span>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4">
                    <p className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">FII Net</p>
                    <p className="text-xl font-black text-emerald-400 font-mono mt-1">+₹2,140 Cr</p>
                    <p className="text-[9px] text-slate-500 mt-1">Buyers today</p>
                  </div>
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4">
                    <p className="text-[9px] font-bold text-blue-400 uppercase tracking-widest">DII Net</p>
                    <p className="text-xl font-black text-blue-400 font-mono mt-1">+₹1,865 Cr</p>
                    <p className="text-[9px] text-slate-500 mt-1">Buyers today</p>
                  </div>
                </div>
                {/* Mini bar chart */}
                <div className="space-y-1.5">
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Last 5 Trading Days</p>
                  <div className="flex items-end gap-1.5 h-16">
                    {[60, 80, 40, 90, 75].map((h, i) => (
                      <div key={i} className="flex-1 flex flex-col justify-end gap-0.5">
                        <div className="bg-emerald-500/80 rounded-sm" style={{ height: `${h}%` }} />
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                    <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-3 -left-3 bg-purple-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-lg">
                Institutional Intel
              </div>
            </div>

            <div className="space-y-6 order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-50 border border-purple-100 text-purple-700 text-xs font-bold uppercase tracking-widest">
                <BarChart3 className="h-3.5 w-3.5" />
                FII &amp; DII Flow Tracker
              </div>
              <h3 className="text-3xl font-black font-serif text-[#0a2540] tracking-tight leading-snug">
                Track Institutional Money to Time the Market
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Follow the &ldquo;smart money&rdquo; — see exactly what Foreign Institutional Investors (FIIs) and Domestic Institutional Investors (DIIs) are buying and selling on NSE every day. Understand market momentum before making investment decisions.
              </p>
              <ul className="space-y-3">
                {[
                  "Daily FII & DII gross buy/sell data from NSE",
                  "Net position with weekly & monthly aggregates",
                  "Market mood indicator (Bullish / Bearish / Neutral)",
                  "Historical trend charts for 30/90/365 days",
                  "Correlation analysis with NIFTY 50 movement",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-slate-600">
                    <div className="h-5 w-5 rounded-full bg-purple-100 border border-purple-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="h-3 w-3 text-purple-700" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => { if (isLoggedIn) router.push("/fii-dii-tracker"); else router.push("/login"); }}
                className="inline-flex items-center gap-2 text-purple-600 text-sm font-bold hover:gap-3 transition-all cursor-pointer group"
              >
                Open FII/DII Tracker <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* FEATURE 5: Cash Book + AI in 2-col grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Cash Book */}
            <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 space-y-5">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-bold uppercase tracking-widest mb-1">
                    Accounting
                  </div>
                  <h3 className="text-lg font-black text-[#0a2540]">Cash Book Ledger</h3>
                </div>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed">
                A full double-entry accounting ledger to track bank balances, liquid reserves, dividend inflows, business expenses, and personal cash flow. Know your exact liquid net worth at any moment.
              </p>
              <ul className="space-y-2.5">
                {[
                  "Bank account balance tracking",
                  "Income & expense categorization",
                  "Dividend & interest inflow logging",
                  "Cash flow reports by month/quarter",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-xs text-slate-600">
                    <Check className="h-3.5 w-3.5 text-indigo-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => { if (isLoggedIn) router.push("/cashbook"); else router.push("/login"); }}
                className="inline-flex items-center gap-2 text-indigo-600 text-sm font-bold hover:gap-3 transition-all cursor-pointer group"
              >
                Open Cash Book <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* AI Insights */}
            <div className="bg-gradient-to-br from-[#0a192f] to-[#04122b] border border-slate-700 rounded-3xl p-8 shadow-xl space-y-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />
              <div className="flex items-center gap-4 relative z-10">
                <div className="h-12 w-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center">
                  <BrainCircuit className="h-6 w-6 text-rose-400" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-400 text-[10px] font-bold uppercase tracking-widest mb-1">
                    AI-Powered
                  </div>
                  <h3 className="text-lg font-black text-white">AI Portfolio Doctor</h3>
                </div>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed relative z-10">
                Automated AI diagnostics that scan your entire portfolio for risk concentration, asset drift, overdue ELSS maturity, and profit-booking opportunities. Get smart alerts before problems become losses.
              </p>
              <ul className="space-y-2.5 relative z-10">
                {[
                  "Sector over-concentration alerts",
                  "Asset drift from target allocation",
                  "ELSS lock-in & maturity reminders",
                  "AI rebalancing recommendations",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-xs text-slate-400">
                    <Check className="h-3.5 w-3.5 text-rose-400 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => { if (isLoggedIn) router.push("/ai-insights"); else router.push("/login"); }}
                className="inline-flex items-center gap-2 text-rose-400 text-sm font-bold hover:gap-3 transition-all cursor-pointer group relative z-10"
              >
                Open AI Insights <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* FEATURE 6: Other Investments + Loans in grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Other Investments */}
            <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 space-y-5">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center">
                  <Landmark className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-amber-50 border border-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-widest mb-1">
                    Fixed Income
                  </div>
                  <h3 className="text-lg font-black text-[#0a2540]">Other Investments</h3>
                </div>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed">
                Track Fixed Deposits, Sovereign Gold Bonds (SGBs), PPF, NPS, NSC, Post Office Schemes, and other alternative investments with maturity tracking, interest calculations, and net worth integration.
              </p>
              <ul className="space-y-2.5">
                {[
                  "Fixed Deposits with maturity & interest calc",
                  "Sovereign Gold Bond (SGB) tracking",
                  "PPF / NPS / NSC balance tracking",
                  "Total fixed income net worth summary",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-xs text-slate-600">
                    <Check className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => { if (isLoggedIn) router.push("/other-investments"); else router.push("/login"); }}
                className="inline-flex items-center gap-2 text-amber-600 text-sm font-bold hover:gap-3 transition-all cursor-pointer group"
              >
                View Investments <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Loans */}
            <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 space-y-5">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center">
                  <Scale className="h-6 w-6 text-rose-600" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-rose-50 border border-rose-100 text-rose-700 text-[10px] font-bold uppercase tracking-widest mb-1">
                    Liabilities
                  </div>
                  <h3 className="text-lg font-black text-[#0a2540]">Loans & Liabilities</h3>
                </div>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed">
                Track all your loans — Home Loan, Car Loan, Personal Loan, Business Loan — with outstanding balance, EMI schedules, interest paid, and true net worth after liabilities deduction.
              </p>
              <ul className="space-y-2.5">
                {[
                  "Multiple loan accounts tracking",
                  "EMI schedule & outstanding balance",
                  "Total interest paid vs principal breakup",
                  "Net worth after liability deduction",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-xs text-slate-600">
                    <Check className="h-3.5 w-3.5 text-rose-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => { if (isLoggedIn) router.push("/loans"); else router.push("/login"); }}
                className="inline-flex items-center gap-2 text-rose-600 text-sm font-bold hover:gap-3 transition-all cursor-pointer group"
              >
                View Loans <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="text-center pt-4">
            <div className="inline-flex flex-col items-center gap-5 bg-gradient-to-br from-[#0047AB] to-[#03256C] text-white rounded-3xl px-12 py-10 shadow-2xl shadow-blue-900/30">
              <Sparkles className="h-8 w-8 text-amber-300" />
              <h3 className="text-2xl font-black font-serif tracking-tight">Ready to See Your Entire Wealth?</h3>
              <p className="text-blue-100/80 text-sm max-w-md">
                Login with your client credentials to access your private, real-time wealth intelligence dashboard.
              </p>
              <button
                onClick={() => { if (isLoggedIn) router.push("/dashboard"); else router.push("/login"); }}
                className="h-12 px-8 bg-white text-[#0047AB] hover:bg-blue-50 font-bold text-sm uppercase tracking-wider rounded-2xl shadow-lg cursor-pointer transition-all flex items-center gap-2.5"
              >
                <Lock className="h-4 w-4" />
                {isLoggedIn ? "Open My Dashboard" : "Access Your Portfolio"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────── */}
      {/* WEALTH CALCULATORS                                              */}
      {/* ─────────────────────────────────────────────────────────────── */}
      <section id="calculators-section" className="py-24 bg-[#0a192f] relative overflow-hidden">
        {/* BG decoration */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "32px 32px" }}
        />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[#0047AB]/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-amber-400 text-xs font-bold uppercase tracking-widest">
              <Calculator className="h-3.5 w-3.5" />
              Planning & Projections
            </div>
            <h2 className="text-4xl sm:text-5xl font-black font-serif text-white tracking-tight">
              Interactive Wealth Calculator
            </h2>
            <p className="text-slate-400 text-base leading-relaxed">
              Model your future corpus with compound interest projections on Mutual Fund SIPs or Lumpsum investments.
            </p>
          </div>

          <div className="max-w-4xl mx-auto bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl">

            {/* Toggle */}
            <div className="flex items-center gap-2 mb-10 p-1.5 bg-white/5 rounded-2xl w-fit mx-auto border border-white/10">
              {[
                { id: "sip", label: "SIP Calculator (Monthly)" },
                { id: "lumpsum", label: "Lumpsum (One-Time)" },
              ].map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => setCalcType(btn.id as any)}
                  className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide cursor-pointer transition-all ${
                    calcType === btn.id
                      ? "bg-[#0047AB] text-white shadow-lg"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-7 space-y-7">
                {/* Investment Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      {calcType === "sip" ? "Monthly Investment" : "Initial Lumpsum"}
                    </span>
                    <span className="font-mono font-black text-amber-400 text-base">
                      {formatCurrency(calcType === "sip" ? monthlyInvestment : lumpsumInvestment)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={calcType === "sip" ? 1000 : 10000}
                    max={calcType === "sip" ? 200000 : 2000000}
                    step={calcType === "sip" ? 1000 : 10000}
                    value={calcType === "sip" ? monthlyInvestment : lumpsumInvestment}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      if (calcType === "sip") setMonthlyInvestment(v);
                      else setLumpsumInvestment(v);
                    }}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-[#0047AB]"
                    style={{ background: `linear-gradient(to right, #0047AB ${((calcType === "sip" ? monthlyInvestment : lumpsumInvestment) - (calcType === "sip" ? 1000 : 10000)) / ((calcType === "sip" ? 200000 : 2000000) - (calcType === "sip" ? 1000 : 10000)) * 100}%, #334155 0%)` }}
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>{calcType === "sip" ? "₹1,000" : "₹10,000"}</span>
                    <span>{calcType === "sip" ? "₹2,00,000" : "₹20,00,000"}</span>
                  </div>
                </div>

                {/* Return Rate */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Expected Return (% CAGR)</span>
                    <span className="font-mono font-black text-emerald-400 text-base">{expectedReturnRate}% p.a.</span>
                  </div>
                  <input
                    type="range" min={5} max={30} step={0.5}
                    value={expectedReturnRate}
                    onChange={(e) => setExpectedReturnRate(Number(e.target.value))}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    style={{ background: `linear-gradient(to right, #10b981 ${(expectedReturnRate - 5) / 25 * 100}%, #334155 0%)` }}
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>5% (Safe)</span><span>14% (NIFTY)</span><span>30% (Aggressive)</span>
                  </div>
                </div>

                {/* Tenure */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Time Horizon</span>
                    <span className="font-mono font-black text-blue-400 text-base">{investmentYears} Years</span>
                  </div>
                  <input
                    type="range" min={1} max={35} step={1}
                    value={investmentYears}
                    onChange={(e) => setInvestmentYears(Number(e.target.value))}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    style={{ background: `linear-gradient(to right, #3b82f6 ${(investmentYears - 1) / 34 * 100}%, #334155 0%)` }}
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>1 Year</span><span>15 Years</span><span>35 Years</span>
                  </div>
                </div>
              </div>

              {/* Result */}
              <div className="lg:col-span-5 bg-slate-900/80 border border-slate-700 rounded-2xl p-6 space-y-5">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Estimated Wealth</span>

                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs pb-3 border-b border-slate-800">
                    <span className="text-slate-400">Total Invested</span>
                    <span className="font-mono font-bold text-white">{formatCurrency(calculatorResults.invested)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs pb-3 border-b border-slate-800">
                    <span className="text-slate-400">Est. Returns</span>
                    <span className="font-mono font-bold text-emerald-400">+{formatCurrency(calculatorResults.returns)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-sm font-bold text-white">Maturity Value</span>
                    <span className="text-2xl font-black text-amber-400 font-mono">{formatCurrency(calculatorResults.total)}</span>
                  </div>
                </div>

                {/* Bar */}
                <div className="space-y-2">
                  <div className="w-full bg-slate-700 h-3 rounded-full overflow-hidden flex">
                    <div className="bg-slate-500 h-full transition-all" style={{ width: `${Math.max(5, (calculatorResults.invested / calculatorResults.total) * 100)}%` }} />
                    <div className="bg-emerald-500 h-full transition-all" style={{ width: `${Math.max(5, (calculatorResults.returns / calculatorResults.total) * 100)}%` }} />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span className="flex items-center gap-1"><span className="h-2 w-2 bg-slate-500 rounded-sm inline-block" />Invested: {Math.round((calculatorResults.invested / calculatorResults.total) * 100)}%</span>
                    <span className="flex items-center gap-1"><span className="h-2 w-2 bg-emerald-500 rounded-sm inline-block" />Returns: {Math.round((calculatorResults.returns / calculatorResults.total) * 100)}%</span>
                  </div>
                </div>

                <Button
                  onClick={() => { if (isLoggedIn) router.push("/dashboard"); else router.push("/login"); }}
                  className="w-full h-11 bg-[#0047AB] hover:bg-[#003882] text-white font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer"
                >
                  Start Investing Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────── */}
      {/* FAQ SECTION                                                     */}
      {/* ─────────────────────────────────────────────────────────────── */}
      <section id="faq-section" className="py-24 bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-[#0047AB] text-xs font-bold uppercase tracking-widest">
              <Info className="h-3.5 w-3.5" />
              Knowledge Base
            </div>
            <h2 className="text-4xl sm:text-5xl font-black font-serif text-[#0a2540] tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-500 text-sm">
              Common questions regarding statement syncing, security, and market calculations.
            </p>
          </div>

          <div className="space-y-3">
            {faqItems.map((item, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className={`bg-white border rounded-2xl overflow-hidden transition-all duration-200 ${isOpen ? "border-blue-200 shadow-md" : "border-slate-200 hover:border-slate-300 hover:shadow-sm"}`}
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer"
                  >
                    <span className={`font-bold text-sm ${isOpen ? "text-[#0047AB]" : "text-[#0a2540]"}`}>{item.q}</span>
                    <div className={`h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${isOpen ? "bg-[#0047AB] text-white" : "bg-slate-100 text-slate-400"}`}>
                      <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                    </div>
                  </button>
                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-5 text-sm text-slate-600 leading-relaxed border-t border-blue-50">
                      <div className="pt-3">{item.a}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────── */}
      {/* CONTACT SECTION                                                 */}
      {/* ─────────────────────────────────────────────────────────────── */}
      <section id="contact-section" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-[#0047AB] to-[#03256C] rounded-3xl overflow-hidden shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">

              {/* Left */}
              <div className="p-10 sm:p-14 space-y-7">
                <div>
                  <span className="text-blue-200 text-xs font-bold uppercase tracking-widest block mb-3">Get In Touch</span>
                  <h2 className="text-3xl sm:text-4xl font-black font-serif text-white tracking-tight">
                    Speak with a Certified <br />Wealth Advisor
                  </h2>
                  <p className="text-blue-100/70 text-sm leading-relaxed mt-3">
                    Connect with our advisory desk for personalized portfolio analysis, tax-efficient restructuring, or estate planning.
                  </p>
                </div>

                <div className="space-y-4">
                  {[
                    { icon: MapPin, text: "Sewree, Mumbai, Maharashtra, India" },
                    { icon: Phone, text: "+91 22 4152 3000" },
                    { icon: Mail, text: "clientservices@yscapital.com" },
                  ].map((c, i) => (
                    <div key={i} className="flex items-center gap-3 text-blue-100/80 text-sm">
                      <div className="h-9 w-9 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                        <c.icon className="h-4 w-4 text-white" />
                      </div>
                      {c.text}
                    </div>
                  ))}
                </div>
              </div>

              {/* Right */}
              <div className="p-10 sm:p-14 bg-white/5 border-l border-white/10 flex flex-col justify-center space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Authorized Client Access</h3>
                  <p className="text-blue-100/70 text-sm leading-relaxed">
                    Registered account holders can sign in directly to inspect real-time valuations and trade histories.
                  </p>
                </div>

                <Button
                  onClick={() => { if (isLoggedIn) router.push("/dashboard"); else router.push("/login"); }}
                  className="h-13 bg-white text-[#0047AB] hover:bg-blue-50 font-bold text-sm uppercase tracking-wider rounded-2xl shadow-xl cursor-pointer transition-all flex items-center justify-center gap-2.5"
                  style={{ height: "52px" }}
                >
                  <Lock className="h-4 w-4" />
                  {isLoggedIn ? "Open My Dashboard" : "Launch Client Portal"}
                  <ArrowRight className="h-4 w-4" />
                </Button>

                <div className="flex items-center gap-2.5 text-blue-200/60 text-xs">
                  <Shield className="h-3.5 w-3.5" />
                  Host-isolated architecture · 256-bit SSL encryption
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────── */}
      {/* FOOTER                                                          */}
      {/* ─────────────────────────────────────────────────────────────── */}
      <footer className="bg-[#030c1e] text-slate-400 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">

          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-12">

            {/* Brand */}
            <div className="md:col-span-5 space-y-5">
              <div className="flex items-center gap-3">
                <div className="relative h-11 w-9 rounded-lg overflow-hidden bg-black border border-white/10">
                  <Image src="/ys_logo.png" alt="YS" fill className="object-contain p-0.5" />
                </div>
                <div>
                  <span className="font-black text-lg font-serif text-white tracking-widest block">YS CAPITAL</span>
                  <span className="text-[10px] text-slate-500">ARN 145084 · AMFI · APMI</span>
                </div>
              </div>
              <p className="text-slate-500 text-xs leading-relaxed max-w-xs">
                India&apos;s leading integrated distributor of financial products — Mutual Funds, Fixed Deposits, Insurance, Bonds, PMS, AIFs, and Digital Wealth Management.
              </p>
              <div className="space-y-1 text-[11px] text-slate-600 font-mono">
                <div>AMFI Registered Mutual Fund Distributor | ARN 145084</div>
                <div>APMI Registered PMS Distributor</div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="md:col-span-3 space-y-4">
              <h4 className="text-[11px] font-bold text-white uppercase tracking-widest">Quick Navigation</h4>
              <ul className="space-y-2.5 text-xs">
                {[
                  { label: "Digital Portfolio", id: "digital-portfolio-section" },
                  { label: "Dashboard Features", id: "platform-features-section" },
                  { label: "Wealth Calculators", id: "calculators-section" },
                  { label: "Investor FAQ", id: "faq-section" },
                  { label: "Contact Us", id: "contact-section" },
                ].map((l) => (
                  <li key={l.id}>
                    <button
                      onClick={() => scrollTo(l.id)}
                      className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 group"
                    >
                      <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-60 transition-opacity" />
                      {l.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div className="md:col-span-4 space-y-4">
              <h4 className="text-[11px] font-bold text-white uppercase tracking-widest">Legal & Compliance</h4>
              <ul className="space-y-2.5 text-xs">
                {[
                  { label: "Terms & Conditions", type: "terms" as const, icon: Scale },
                  { label: "Privacy Statement", type: "privacy" as const, icon: FileText },
                  { label: "SEBI & AMFI Risk Advisory", type: "disclaimer" as const, icon: Info },
                ].map((l) => (
                  <li key={l.type}>
                    <button
                      onClick={() => openTerms(l.type)}
                      className="hover:text-white transition-colors flex items-center gap-2 cursor-pointer group"
                    >
                      <l.icon className="h-3.5 w-3.5 text-slate-600 group-hover:text-slate-400 transition-colors" />
                      {l.label}
                    </button>
                  </li>
                ))}
              </ul>

              <div className="pt-4">
                <Button
                  onClick={() => { if (isLoggedIn) router.push("/dashboard"); else router.push("/login"); }}
                  className="h-10 px-5 bg-[#0047AB] hover:bg-[#003882] text-white font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer shadow-lg shadow-blue-900/30"
                >
                  {isLoggedIn ? "Dashboard" : "Client Login"}
                </Button>
              </div>
            </div>
          </div>

          {/* Divider & bottom bar */}
          <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-600">
            <div>© {new Date().getFullYear()} Y S CAPITAL. All Rights Reserved.</div>
            <div className="flex items-center gap-5">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Servers Protected · 256-Bit SSL</span>
              </div>
              <div className="text-slate-700">Built for wealth, designed with trust.</div>
            </div>
          </div>
        </div>
      </footer>

      {/* ─────────────────────────────────────────────────────────────── */}
      {/* LOGIN DIALOG                                                    */}
      {/* ─────────────────────────────────────────────────────────────── */}
      <Dialog open={isLoginModalOpen} onOpenChange={setIsLoginModalOpen}>
        <DialogContent className="sm:max-w-md bg-white p-8 rounded-3xl border border-slate-200 shadow-2xl">
          <DialogHeader className="text-center space-y-3 pt-2">
            <div className="h-14 w-14 rounded-2xl bg-[#0047AB] flex items-center justify-center mx-auto shadow-lg shadow-blue-900/30">
              <Lock className="h-7 w-7 text-white" />
            </div>
            <DialogTitle className="text-2xl font-black font-serif text-[#0a2540]">
              Client & Partner Login
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500">
              Enter your authorized security password to access your private YS Portfolio.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleLoginSubmit} className={`space-y-4 pt-2 ${shake ? "animate-bounce" : ""}`}>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">User ID (Optional)</label>
              <Input
                type="text"
                placeholder="e.g. main / client code"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-11 text-sm rounded-xl border-slate-200 focus:border-[#0047AB] focus:ring-[#0047AB]/20"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Master Password</label>
              <Input
                type="password"
                placeholder="Enter security password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 text-sm rounded-xl border-slate-200 focus:border-[#0047AB] focus:ring-[#0047AB]/20 tracking-widest"
              />
            </div>
            <Button
              type="submit"
              disabled={authLoading || !password}
              className="w-full h-12 bg-[#0047AB] hover:bg-[#003882] text-white font-bold text-sm uppercase tracking-wider rounded-xl shadow-lg shadow-blue-900/20 cursor-pointer transition-all mt-2"
            >
              {authLoading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "Unlock Portfolio & Enter"}
            </Button>
          </form>

          <div className="text-center text-[11px] text-slate-400 flex items-center justify-center gap-2 pt-1">
            <Shield className="h-3.5 w-3.5" />
            YS CAPITAL Private Host Verification
          </div>
        </DialogContent>
      </Dialog>

      {/* ─────────────────────────────────────────────────────────────── */}
      {/* TERMS DIALOG                                                    */}
      {/* ─────────────────────────────────────────────────────────────── */}
      <Dialog open={showTermsModal} onOpenChange={setShowTermsModal}>
        <DialogContent className="sm:max-w-2xl bg-white p-6 rounded-2xl border border-slate-200 shadow-2xl max-h-[85vh] flex flex-col">
          <DialogHeader className="border-b border-slate-100 pb-4 flex flex-row items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#0047AB]">
              <Scale className="h-4 w-4" />
            </div>
            <DialogTitle className="text-sm font-bold uppercase tracking-wider text-slate-800">
              {termsType === "terms" && "Terms & Conditions"}
              {termsType === "privacy" && "Privacy Statement"}
              {termsType === "disclaimer" && "Regulatory Risk Disclosure"}
            </DialogTitle>
          </DialogHeader>

          <div className="overflow-y-auto space-y-4 text-xs text-slate-600 leading-relaxed py-4 pr-1">
            {termsType === "terms" && (
              <>
                <p className="font-bold text-slate-900">1. Private Portfolio Intelligence</p>
                <p>YS Portfolio is an institutional utility application engineered for tracking multi-asset portfolios. Access is granted to verified session keyholders only.</p>
                <p className="font-bold text-slate-900">2. Password Gate Verification</p>
                <p>Authentication utilizes master session verification cookies stored locally within your browser. Maintaining password confidentiality is the responsibility of the account holder.</p>
              </>
            )}
            {termsType === "privacy" && (
              <>
                <p className="font-bold text-slate-900">1. Data Ownership & Self-Hosting</p>
                <p>All uploaded CAS PDFs, broker Excel files, stock quantities, buy prices, and cash book ledgers reside strictly within your authenticated database instance.</p>
                <p className="font-bold text-slate-900">2. Zero Third-Party Monetization</p>
                <p>No personal portfolio or banking data is transferred, sold, or shared with commercial advertising or lead-generation networks.</p>
              </>
            )}
            {termsType === "disclaimer" && (
              <>
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800">
                  <span className="font-bold uppercase tracking-wider text-[10px] block mb-1">Important Notice</span>
                  Mutual Fund investments and equity shares are subject to market risks. Please read all scheme-related documents carefully before investing.
                </div>
                <p className="font-bold text-slate-900">1. Informational Purpose</p>
                <p>YS Digital Portfolio provides analytical calculation, historical XIRR computation, and tracking metrics. It does not replace independent research or certified financial planning.</p>
              </>
            )}
          </div>

          <div className="border-t border-slate-100 pt-4 flex justify-end">
            <Button
              onClick={() => setShowTermsModal(false)}
              className="bg-[#0047AB] hover:bg-[#003882] text-white font-bold text-xs px-6 h-10 uppercase tracking-wider rounded-xl cursor-pointer"
            >
              Close Window
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
