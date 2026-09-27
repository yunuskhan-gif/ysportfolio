"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Lock,
  Shield,
  FileText,
  Scale,
  RotateCcw,
  MapPin,
  Phone,
  Mail,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface LegalPageLayoutProps {
  badge: string;
  badgeIcon: React.ElementType;
  title: string;
  subtitle: string;
  lastUpdated: string;
  children: React.ReactNode;
  activePath: "/privacy-policy" | "/terms" | "/refund-policy";
}

export default function LegalPageLayout({
  badge,
  badgeIcon: BadgeIcon,
  title,
  subtitle,
  lastUpdated,
  children,
  activePath,
}: LegalPageLayoutProps) {
  const router = useRouter();

  const legalLinks = [
    { label: "Terms & Conditions", href: "/terms", icon: Scale },
    { label: "Privacy Policy", href: "/privacy-policy", icon: FileText },
    { label: "Refund & Cancellation", href: "/refund-policy", icon: RotateCcw },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-[#0a2540] font-sans antialiased flex flex-col selection:bg-[#0047AB] selection:text-white">
      {/* ─────────────────────────────────────────────────────────────── */}
      {/* NAVBAR                                                          */}
      {/* ─────────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[68px] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-3 group select-none">
              <div className="relative h-10 w-8 rounded-lg overflow-hidden bg-black flex items-center justify-center shadow-xs">
                <Image src="/ys_logo.png" alt="YS CAPITAL Logo" fill className="object-contain p-0.5" priority />
              </div>
              <div>
                <span className="font-black text-base sm:text-lg font-serif text-[#0a2540] tracking-wider block">
                  YS CAPITAL
                </span>
                <span className="text-[10px] text-slate-500 font-mono">ARN 145084 · AMFI · APMI</span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#0047AB] bg-slate-100 hover:bg-slate-200/70 px-3.5 py-2 rounded-xl transition-all"
            >
              <span>Market Blog</span>
            </Link>

            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#0047AB] bg-slate-100 hover:bg-slate-200/70 px-3.5 py-2 rounded-xl transition-all"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Back to</span> Home
            </Link>

            <Button
              onClick={() => router.push("/login")}
              className="h-9 px-4 bg-[#0047AB] hover:bg-[#003882] text-white font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer shadow-md shadow-blue-900/20"
            >
              <Lock className="h-3.5 w-3.5 mr-1.5" />
              Client Login
            </Button>
          </div>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────── */}
      {/* HERO BANNER                                                     */}
      {/* ─────────────────────────────────────────────────────────────── */}
      <section className="bg-[#030c1e] text-white py-14 sm:py-20 relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/30 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-semibold uppercase tracking-widest">
            <BadgeIcon className="h-3.5 w-3.5" />
            {badge}
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-serif tracking-tight text-white">
            {title}
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-3xl leading-relaxed">
            {subtitle}
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-400">
            <span>Last Updated: <strong className="text-white font-medium">{lastUpdated}</strong></span>
            <span>•</span>
            <span>AMFI Registered MFD (ARN 145084)</span>
            <span>•</span>
            <span>APMI Registered PMS</span>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────── */}
      {/* MAIN CONTENT AREA                                               */}
      {/* ─────────────────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: Quick Navigation Sidebar */}
          <aside className="lg:col-span-4 space-y-5 lg:sticky lg:top-24">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2">
                Legal Documents
              </h3>
              <nav className="space-y-1">
                {legalLinks.map((item) => {
                  const isActive = activePath === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? "bg-[#0047AB] text-white shadow-sm"
                          : "text-slate-600 hover:text-[#0047AB] hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                        <span>{item.label}</span>
                      </div>
                      <ChevronRight className={`h-3.5 w-3.5 opacity-60 ${isActive ? "text-white" : "text-slate-400"}`} />
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Compliance Box */}
            <div className="bg-blue-50/70 border border-blue-100 p-5 rounded-2xl space-y-2.5 text-xs text-blue-900">
              <div className="flex items-center gap-2 font-bold text-[#0047AB]">
                <Shield className="h-4 w-4" />
                SEBI & AMFI Registered
              </div>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                YS CAPITAL complies with all applicable regulations under SEBI (Mutual Funds) Regulations, 1996 and AMFI Code of Conduct.
              </p>
              <div className="pt-1 text-[11px] font-mono text-slate-500">
                ARN: 145084 · EUIN: E248911
              </div>
            </div>

            {/* Quick Contact Box */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 space-y-3 text-xs">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                Grievance & Support Desk
              </h4>
              <p className="text-slate-500 text-[11px]">
                For legal queries, data privacy requests, or grievances:
              </p>
              <div className="space-y-2 text-slate-700 text-[11px]">
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-[#0047AB]" />
                  <a href="mailto:clientservices@yscapital.com" className="hover:underline font-medium">
                    clientservices@yscapital.com
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-[#0047AB]" />
                  <span>+91 22 4152 3000</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="h-3.5 w-3.5 text-[#0047AB] mt-0.5 flex-shrink-0" />
                  <span>Sewree, Mumbai, Maharashtra 400015, India</span>
                </div>
              </div>
            </div>
          </aside>

          {/* RIGHT: Document Body */}
          <article className="lg:col-span-8 bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/80 shadow-xs prose prose-slate max-w-none prose-headings:font-serif prose-headings:text-[#0a2540] prose-a:text-[#0047AB] prose-strong:text-[#0a2540]">
            {children}
          </article>
        </div>
      </main>

      {/* ─────────────────────────────────────────────────────────────── */}
      {/* FOOTER                                                          */}
      {/* ─────────────────────────────────────────────────────────────── */}
      <footer className="bg-[#030c1e] text-slate-400 border-t border-white/5 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-8">
            <div className="md:col-span-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="relative h-10 w-8 rounded-lg overflow-hidden bg-black border border-white/10">
                  <Image src="/ys_logo.png" alt="YS CAPITAL Logo" fill className="object-contain p-0.5" />
                </div>
                <div>
                  <span className="font-black text-base font-serif text-white tracking-widest block">
                    YS CAPITAL
                  </span>
                  <span className="text-[10px] text-slate-500">ARN 145084 · AMFI · APMI</span>
                </div>
              </div>
              <p className="text-slate-500 text-xs leading-relaxed max-w-sm">
                India&apos;s leading integrated distributor of financial products — Mutual Funds, Direct Equities, Fixed Deposits, Insurance, Bonds, PMS, AIFs, and Digital Wealth Management.
              </p>
            </div>

            <div className="md:col-span-3 space-y-3">
              <h4 className="text-[11px] font-bold text-white uppercase tracking-widest">Navigation</h4>
              <ul className="space-y-2 text-xs">
                <li><Link href="/" className="hover:text-white transition-colors">Home & Overview</Link></li>
                <li><Link href="/#digital-portfolio-section" className="hover:text-white transition-colors">Digital Portfolio</Link></li>
                <li><Link href="/#calculators-section" className="hover:text-white transition-colors">Wealth Calculators</Link></li>
                <li><Link href="/#faq-section" className="hover:text-white transition-colors">Investor FAQs</Link></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Client Login</Link></li>
              </ul>
            </div>

            <div className="md:col-span-4 space-y-3">
              <h4 className="text-[11px] font-bold text-white uppercase tracking-widest">Compliance & Policies</h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link href="/terms" className={`hover:text-white transition-colors flex items-center gap-1.5 ${activePath === "/terms" ? "text-blue-400 font-semibold" : ""}`}>
                    <Scale className="h-3.5 w-3.5 opacity-70" />
                    Terms & Conditions
                  </Link>
                </li>
                <li>
                  <Link href="/privacy-policy" className={`hover:text-white transition-colors flex items-center gap-1.5 ${activePath === "/privacy-policy" ? "text-blue-400 font-semibold" : ""}`}>
                    <FileText className="h-3.5 w-3.5 opacity-70" />
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/refund-policy" className={`hover:text-white transition-colors flex items-center gap-1.5 ${activePath === "/refund-policy" ? "text-blue-400 font-semibold" : ""}`}>
                    <RotateCcw className="h-3.5 w-3.5 opacity-70" />
                    Refund & Cancellation Policy
                  </Link>
                </li>
              </ul>
              <div className="pt-2 text-[10px] text-slate-500 leading-normal">
                Mutual Fund investments and securities are subject to market risks. Please read all scheme-related documents carefully before investing.
              </div>
            </div>
          </div>

          <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-600">
            <div>© {new Date().getFullYear()} Y S CAPITAL. All Rights Reserved.</div>
            <div className="flex items-center gap-4">
              <span>ARN-145084</span>
              <span>•</span>
              <span>256-Bit SSL Encrypted</span>
              <span>•</span>
              <span>Sewree, Mumbai</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
