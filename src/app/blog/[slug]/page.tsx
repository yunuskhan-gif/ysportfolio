import React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  Calendar,
  Share2,
  Tag,
  Sparkles,
  Lock,
  ChevronRight,
  Shield,
  Lightbulb,
  CheckCircle2,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BLOG_POSTS, BlogPost } from "@/lib/blog-data";

export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({
    slug: post.slug,
  }));
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);
  if (!post) return { title: "Article Not Found | YS CAPITAL" };

  return {
    title: `${post.title} | YS CAPITAL Blog`,
    description: post.excerpt,
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `/blog/${post.slug}`,
      type: "article",
      publishedTime: post.date,
      authors: [post.author.name],
      tags: post.tags,
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = BLOG_POSTS.filter((p) => p.slug !== slug).slice(0, 3);

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
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>All Articles</span>
            </Link>

            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 h-9 px-4 bg-[#0047AB] hover:bg-[#003882] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-blue-900/20"
            >
              <Lock className="h-3.5 w-3.5" />
              Client Login
            </Link>
          </div>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────── */}
      {/* ARTICLE HEADER HERO                                             */}
      {/* ─────────────────────────────────────────────────────────────── */}
      <section className="bg-[#030c1e] text-white py-14 sm:py-20 relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/30 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 space-y-5">
          
          {/* Breadcrumbs & Category */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            <Link href="/blog" className="text-slate-400 hover:text-white transition-colors">
              Blog
            </Link>
            <span className="text-slate-600">/</span>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-semibold border border-blue-400/30">
              {post.category}
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400 flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {post.readTime}
            </span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-serif tracking-tight text-white leading-tight">
            {post.title}
          </h1>

          {/* Subtitle / Excerpt */}
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-light">
            {post.excerpt}
          </p>

          {/* Author Badge & Date */}
          <div className="flex items-center gap-3 pt-4 border-t border-white/10 text-xs">
            <div className="h-9 w-9 rounded-full bg-[#0047AB] text-white flex items-center justify-center font-bold text-xs">
              {post.author.avatar}
            </div>
            <div>
              <div className="font-bold text-white">{post.author.name}</div>
              <div className="text-[11px] text-slate-400">{post.author.role} · Published on {post.date}</div>
            </div>
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────── */}
      {/* ARTICLE BODY                                                    */}
      {/* ─────────────────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-12 space-y-10">
        
        {/* Executive Summary / Key Takeaways Box */}
        <div className="bg-blue-50/80 border border-blue-200/80 p-6 sm:p-8 rounded-3xl space-y-4 text-sm">
          <div className="flex items-center gap-2 text-[#0047AB] font-bold text-sm uppercase tracking-wider">
            <Sparkles className="h-4 w-4" />
            Executive Takeaways
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-slate-700">
            {post.content.keyTakeaways.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-[#0047AB] mt-0.5 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Intro */}
        <div className="text-base sm:text-lg text-slate-700 leading-relaxed font-light border-l-4 border-[#0047AB] pl-5 py-1">
          {post.content.intro}
        </div>

        {/* Article Sections */}
        <div className="space-y-10 text-slate-700">
          {post.content.sections.map((section, idx) => (
            <section key={idx} className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold font-serif text-[#0a2540] border-b border-slate-200 pb-2">
                {section.heading}
              </h2>
              {section.paragraphs.map((p, pIdx) => (
                <p key={pIdx} className="text-sm sm:text-base leading-relaxed text-slate-600">
                  {p}
                </p>
              ))}

              {section.bulletPoints && (
                <ul className="list-disc pl-5 space-y-2 text-sm sm:text-base text-slate-600">
                  {section.bulletPoints.map((b, bIdx) => (
                    <li key={bIdx}>{b}</li>
                  ))}
                </ul>
              )}

              {section.proTip && (
                <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-950 flex items-start gap-3 text-xs sm:text-sm">
                  <Lightbulb className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong className="block text-amber-900 font-semibold mb-0.5">Pro Tip:</strong>
                    {section.proTip}
                  </div>
                </div>
              )}
            </section>
          ))}
        </div>

        {/* Conclusion */}
        <div className="bg-slate-100 p-6 sm:p-8 rounded-3xl space-y-3 border border-slate-200">
          <h3 className="text-lg font-bold font-serif text-[#0a2540]">Conclusion</h3>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            {post.content.conclusion}
          </p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-slate-200">
          <span className="text-xs text-slate-400 flex items-center gap-1 font-semibold mr-2">
            <Tag className="h-3.5 w-3.5" />
            Tags:
          </span>
          {post.tags.map((tag) => (
            <span key={tag} className="text-xs bg-white border border-slate-200 px-3 py-1 rounded-full text-slate-600">
              #{tag}
            </span>
          ))}
        </div>

        {/* Next Step CTA */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-[#0047AB] to-[#03256C] text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl shadow-blue-900/10">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-lg font-bold">Ready to track your portfolio?</h4>
            <p className="text-blue-100/80 text-xs sm:text-sm">
              Import your statements or explore the live dashboard demonstration.
            </p>
          </div>
          <Link
            href="/login"
            className="h-11 px-6 bg-white text-[#0047AB] hover:bg-blue-50 font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center gap-2 flex-shrink-0"
          >
            <span>Launch Client Portal</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Related Articles */}
        {relatedPosts.length > 0 && (
          <div className="space-y-6 pt-6 border-t border-slate-200">
            <h3 className="text-xl font-bold font-serif text-[#0a2540]">Related Research Articles</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {relatedPosts.map((rel) => (
                <Link
                  key={rel.slug}
                  href={`/blog/${rel.slug}`}
                  className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-blue-300 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-[#0047AB] uppercase tracking-wider">
                      {rel.category}
                    </span>
                    <h4 className="text-sm font-bold font-serif text-slate-800 group-hover:text-[#0047AB] transition-colors line-clamp-2">
                      {rel.title}
                    </h4>
                  </div>
                  <div className="pt-3 text-[11px] text-slate-400 flex items-center justify-between">
                    <span>{rel.readTime}</span>
                    <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

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
              </ul>
            </div>

            <div className="md:col-span-4 space-y-3">
              <h4 className="text-[11px] font-bold text-white uppercase tracking-widest">Compliance & Policies</h4>
              <ul className="space-y-2 text-xs">
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms & Conditions</Link></li>
                <li><Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/refund-policy" className="hover:text-white transition-colors">Refund & Cancellation Policy</Link></li>
              </ul>
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
