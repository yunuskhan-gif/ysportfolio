"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("ak1119614@gmail.com");
  const [password, setPassword] = useState("••••••••");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e?: React.FormEvent, overridePass?: string, overrideUser?: string) => {
    if (e) e.preventDefault();
    const passToUse = overridePass !== undefined ? overridePass : (password === "••••••••" ? "demo123" : password);
    const userToUse = overrideUser !== undefined ? overrideUser : email;

    if (!passToUse) {
      toast.error("Please enter your password");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: userToUse.trim() || undefined,
          password: passToUse,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`Welcome back, ${data.user || "Investor"}!`);
        // Direct browser navigation to dashboard
        window.location.href = "/dashboard";
      } else {
        toast.error("Invalid credentials. Try password 'demo123' for demo.");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setEmail("demo@ysportfolio.com");
    setPassword("demo123");
    handleSubmit(undefined, "demo123", "demo");
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col lg:flex-row font-sans selection:bg-slate-900 selection:text-white">
      
      {/* LEFT COLUMN: Form */}
      <div className="w-full lg:w-[45%] xl:w-[40%] min-h-screen flex flex-col justify-between px-6 sm:px-14 lg:px-14 xl:px-16 py-8 lg:py-10 bg-white z-10 border-r border-slate-100">
        
        {/* Top bar with logo and back link */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="flex items-center group cursor-pointer" title="YS Portfolio Home">
            <div className="relative h-9 w-7 rounded-lg overflow-hidden bg-black flex items-center justify-center shadow-xs group-hover:opacity-90 transition-opacity">
              <Image src="/ys_logo.png" alt="YS" fill className="object-contain p-0.5" />
            </div>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 px-3.5 py-1.5 rounded-full transition-all"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to website</span>
          </Link>
        </div>

        {/* Center: Main Form Card */}
        <div className="w-full max-w-[380px] mx-auto my-auto space-y-5">
          
          {/* Header */}
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">
            Log In
          </h1>

          {/* Social Logins */}
          <div className="space-y-2.5 pt-1">
            {/* Google */}
            <button
              type="button"
              onClick={() => toast("Google SSO is configured for enterprise clients", { icon: "🔒" })}
              className="w-full h-11 border border-slate-900 hover:bg-slate-50 text-slate-900 font-semibold text-xs rounded-xl flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-xs"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.5 8.9 5 12 5z" />
                <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
                <path fill="#FBBC05" d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.3s.1-1.6.4-2.3L1.6 7.2C.6 9.2 0 11 0 12.4s.6 3.2 1.6 5.2l3.7-2.9z" />
                <path fill="#34A853" d="M12 23.8c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.1-6.7-5l-3.7 2.9C3.5 20.8 7.4 23.8 12 23.8z" />
              </svg>
              <span>Continue with <strong className="font-bold">Google</strong></span>
            </button>

            {/* LinkedIn */}
            <button
              type="button"
              onClick={() => toast("LinkedIn SSO is available for institutional investors", { icon: "💼" })}
              className="w-full h-11 border border-slate-900 hover:bg-slate-50 text-slate-900 font-semibold text-xs rounded-xl flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-xs"
            >
              <svg className="h-4 w-4 fill-[#0A66C2]" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
              </svg>
              <span>Continue with <strong className="font-bold">LinkedIn</strong></span>
            </button>
          </div>

          {/* Divider: or */}
          <div className="relative text-center my-3">
            <span className="text-xs text-slate-400 font-normal">or</span>
          </div>

          {/* Form */}
          <form onSubmit={(e) => handleSubmit(e)} className="space-y-4">
            
            {/* Email field */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-800">
                Email
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="w-full h-11 px-3.5 bg-[#eef3fd] border border-slate-200/90 focus:border-slate-900 focus:bg-white text-slate-900 text-sm rounded-xl outline-none transition-all placeholder:text-slate-400"
              />
            </div>

            {/* Password field with Forgot link */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-800">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => toast("Please contact your YS Portfolio administrator to reset credentials.", { icon: "ℹ️" })}
                  className="text-xs text-slate-600 hover:text-slate-950 font-medium transition-colors cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full h-11 pl-3.5 pr-10 bg-[#eef3fd] border border-slate-200/90 focus:border-slate-900 focus:bg-white text-slate-900 text-sm rounded-xl outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Primary Button: Continue (Black solid button) */}
            <div className="pt-2 space-y-2.5">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-[#121212] hover:bg-black disabled:opacity-50 text-white font-semibold text-sm rounded-xl transition-all duration-200 cursor-pointer shadow-sm active:scale-[0.99] flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Continue</span>
                )}
              </button>

              {/* Secondary Button: Log in with OTP / Demo */}
              <button
                type="button"
                onClick={handleDemoLogin}
                className="w-full h-11 bg-white hover:bg-slate-50 border border-slate-900 text-slate-900 font-semibold text-xs rounded-xl transition-all cursor-pointer shadow-xs active:scale-[0.99]"
              >
                Log in with Demo / OTP
              </button>
            </div>
          </form>

          {/* Legal note */}
          <p className="text-[11px] text-slate-500 pt-1 leading-relaxed text-center sm:text-left">
            By using YS Portfolio, you agree to our{" "}
            <a href="#" className="underline text-slate-700 hover:text-slate-950">Privacy Policy</a> and our{" "}
            <a href="#" className="underline text-slate-700 hover:text-slate-950">Terms of Service</a>.
          </p>

          {/* Sign up prompt */}
          <div className="text-center pt-2 text-xs text-slate-600">
            Don&apos;t have an account?{" "}
            <button
              type="button"
              onClick={handleDemoLogin}
              className="font-bold text-slate-950 underline underline-offset-4 hover:text-blue-700 cursor-pointer"
            >
              Create your account
            </button>
          </div>
        </div>

        {/* Bottom subtle copyright */}
        <div className="pt-6 text-center lg:text-left text-[11px] text-slate-400">
          © {new Date().getFullYear()} YS Portfolio
        </div>
      </div>

      {/* RIGHT COLUMN: Full Screen Video Card Covering Entire Card */}
      <div className="hidden lg:flex lg:w-[55%] xl:w-[60%] h-screen sticky top-0 p-4 sm:p-6 lg:p-7 xl:p-8 bg-white">
        <div className="relative w-full h-full rounded-[28px] sm:rounded-[36px] overflow-hidden shadow-2xl bg-black border border-slate-200/60">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover object-center"
          >
            <source src="/loginpage.mp4" type="video/mp4" />
          </video>
        </div>
      </div>

    </div>
  );
}
