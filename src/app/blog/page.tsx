"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Search,
  ArrowRight,
  Clock,
  Calendar,
  Tag,
  Sparkles,
  ArrowLeft,
  Lock,
  ChevronRight,
  Shield,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BLOG_POSTS, BlogPost } from "@/lib/blog-data";

export default function BlogIndexPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const categories = [
    "All",
    "Portfolio Tracking",
    "Calculations & Analytics",
    "Wealth Strategy",
    "Market Intelligence",
    "Personal Finance",
    "Fixed Income",
  ];

  const filteredPosts = useMemo(() => {
    return BLOG_POSTS.filter((post) => {
      const matchesCategory =
        selectedCategory === "All" || post.category === selectedCategory;
      const matchesSearch =
        searchQuery.trim() === "" ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const featuredPost = useMemo(() => {
    return BLOG_POSTS.find((p) => p.featured) || BLOG_POSTS[0];
  }, []);

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
      <section className="bg-[#030c1e] text-white py-16 sm:py-24 relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/40 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-semibold uppercase tracking-widest">
            <BookOpen className="h-3.5 w-3.5" />
            Market & Wealth Intelligence
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-serif tracking-tight text-white max-w-4xl mx-auto leading-tight">
            Research, Insights & Wealth Guides
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto font-light leading-relaxed">
            In-depth analysis on Mutual Funds, CAS statement consolidation, XIRR calculations, FII/DII market flows, and institutional asset allocation strategies.
          </p>

          {/* Search Box */}
          <div className="max-w-xl mx-auto pt-2">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Search articles by title, topic, or keyword (e.g. CAS, XIRR, SIP, FII)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12 pl-11 pr-4 bg-white/10 border-white/20 text-white placeholder:text-slate-400 rounded-2xl text-sm backdrop-blur-md focus:border-blue-400 focus:bg-white/15"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-300 hover:text-white bg-white/10 px-2 py-0.5 rounded-md"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────── */}
      {/* MAIN CONTENT                                                    */}
      {/* ─────────────────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
        
        {/* Category Filter Tabs */}
        <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#0047AB] text-white shadow-md shadow-blue-900/20"
                    : "bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Featured Article Card (only if on 'All' and no search query) */}
        {selectedCategory === "All" && !searchQuery && featuredPost && (
          <div className="bg-gradient-to-br from-white to-blue-50/50 rounded-3xl border border-blue-100 p-6 sm:p-10 shadow-lg shadow-blue-900/5 hover:border-blue-200 transition-all group">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8 space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="px-3 py-1 rounded-full bg-[#0047AB] text-white text-[11px] font-bold uppercase tracking-wider">
                    Featured Deep Dive
                  </span>
                  <span className="px-3 py-1 rounded-full bg-blue-50 text-[#0047AB] text-[11px] font-semibold">
                    {featuredPost.category}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    {featuredPost.readTime}
                  </span>
                </div>

                <Link href={`/blog/${featuredPost.slug}`} className="block group">
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-serif text-[#0a2540] group-hover:text-[#0047AB] transition-colors leading-tight">
                    {featuredPost.title}
                  </h2>
                </Link>

                <p className="text-slate-600 text-sm sm:text-base leading-relaxed line-clamp-3">
                  {featuredPost.excerpt}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                  <div className="flex items-center gap-2.5 text-xs text-slate-500">
                    <div className="h-8 w-8 rounded-full bg-[#0047AB] text-white flex items-center justify-center font-bold text-xs">
                      {featuredPost.author.avatar}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-800 block">{featuredPost.author.name}</span>
                      <span className="text-[10px] text-slate-400">{featuredPost.date}</span>
                    </div>
                  </div>

                  <Link
                    href={`/blog/${featuredPost.slug}`}
                    className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0047AB] hover:text-[#003882] group/btn"
                  >
                    <span>Read Full Guide</span>
                    <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>

              {/* Decorative side illustration card */}
              <div className="lg:col-span-4 bg-[#0a192f] text-white p-6 rounded-2xl space-y-4 border border-white/10 shadow-md">
                <div className="h-10 w-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-sm">Key Takeaways Inside:</h3>
                <ul className="space-y-2 text-xs text-slate-300">
                  {featuredPost.content.keyTakeaways.slice(0, 3).map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-amber-400 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Articles Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <h2 className="text-xl sm:text-2xl font-bold font-serif text-[#0a2540]">
              {selectedCategory === "All" ? "All Research Articles" : `${selectedCategory} Articles`}
            </h2>
            <span className="text-xs text-slate-500 font-medium">
              Showing {filteredPosts.length} article{filteredPosts.length !== 1 ? "s" : ""}
            </span>
          </div>

          {filteredPosts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
              <Search className="h-10 w-10 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No articles found</h3>
              <p className="text-xs text-slate-500">Try adjusting your search terms or selecting another category.</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setSelectedCategory("All"); setSearchQuery(""); }}
                className="mt-2 text-xs"
              >
                Reset All Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post) => (
                <article
                  key={post.slug}
                  className="bg-white rounded-3xl border border-slate-200/80 hover:border-blue-200 shadow-xs hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300 flex flex-col justify-between overflow-hidden group"
                >
                  <div className="p-6 space-y-4">
                    {/* Category & Read Time */}
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-[#0047AB] font-bold uppercase tracking-wider border border-blue-100/60">
                        {post.category}
                      </span>
                      <span className="text-slate-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {post.readTime}
                      </span>
                    </div>

                    {/* Title */}
                    <Link href={`/blog/${post.slug}`} className="block">
                      <h3 className="text-lg font-bold font-serif text-[#0a2540] group-hover:text-[#0047AB] transition-colors leading-snug">
                        {post.title}
                      </h3>
                    </Link>

                    {/* Excerpt */}
                    <p className="text-slate-500 text-xs leading-relaxed line-clamp-3">
                      {post.excerpt}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {post.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-400 text-[11px]">{post.date}</span>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="font-bold text-[#0047AB] hover:underline flex items-center gap-1 text-[11px] uppercase tracking-wider group-hover:translate-x-0.5 transition-transform"
                    >
                      <span>Read</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {/* Wealth Desk Consultation Card */}
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-[#0047AB] to-[#03256C] text-white flex flex-col lg:flex-row items-center justify-between gap-6 shadow-2xl shadow-blue-900/15">
          <div className="space-y-2 text-center lg:text-left">
            <span className="text-[11px] font-bold uppercase tracking-widest text-blue-200">
              Personalized Family Office Advisory
            </span>
            <h3 className="text-2xl sm:text-3xl font-black font-serif">
              Consolidate Your Portfolio with YS CAPITAL
            </h3>
            <p className="text-blue-100/80 text-xs sm:text-sm max-w-xl font-light">
              Get an expert second opinion on your mutual fund allocations, XIRR trajectory, and tax harvesting opportunities.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/#contact-section"
              className="h-11 px-6 bg-white text-[#0047AB] hover:bg-blue-50 font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center gap-2"
            >
              <span>Schedule Review</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Button
              onClick={() => router.push("/login")}
              variant="outline"
              className="h-11 px-5 border-white/30 text-white hover:bg-white/10 font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer"
            >
              Launch Portal
            </Button>
          </div>
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
                <li><Link href="/blog" className="text-blue-400 font-semibold transition-colors">Market & Wealth Blog</Link></li>
                <li><Link href="/#digital-portfolio-section" className="hover:text-white transition-colors">Digital Portfolio</Link></li>
                <li><Link href="/#calculators-section" className="hover:text-white transition-colors">Wealth Calculators</Link></li>
                <li><Link href="/#faq-section" className="hover:text-white transition-colors">Investor FAQs</Link></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Client Login</Link></li>
              </ul>
            </div>

            <div className="md:col-span-4 space-y-3">
              <h4 className="text-[11px] font-bold text-white uppercase tracking-widest">Compliance & Policies</h4>
              <ul className="space-y-2 text-xs">
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms & Conditions</Link></li>
                <li><Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/refund-policy" className="hover:text-white transition-colors">Refund & Cancellation Policy</Link></li>
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
