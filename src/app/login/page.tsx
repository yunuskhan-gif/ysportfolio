"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Loader2,
  KeyRound,
  Timer,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  Calendar,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");

  // Form states
  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // OTP Signup states
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [timer, setTimer] = useState(0);

  // Google Sign-In Modal states
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleEmail, setGoogleEmail] = useState("");
  const [googleName, setGoogleName] = useState("");
  const [googleOtp, setGoogleOtp] = useState("");
  const [googleOtpSent, setGoogleOtpSent] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleTimer, setGoogleTimer] = useState(0);

  // 30-Second Countdown timer for Signup
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer]);

  // 30-Second Countdown timer for Google Modal
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (googleTimer > 0) {
      interval = setInterval(() => {
        setGoogleTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [googleTimer]);

  // Handle Google Button Click
  const handleGoogleSignInClick = () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const win = window as any;

    if (clientId && win.google?.accounts?.id) {
      win.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response: any) => {
          if (response.credential) {
            setLoading(true);
            try {
              const res = await fetch("/api/auth/google", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ credential: response.credential }),
              });
              const data = await res.json();
              if (res.ok && data.success) {
                toast.success(`Signed in with Google as ${data.fullName || data.user}!`);
                window.location.href = data.redirectTo || "/dashboard";
              } else {
                toast.error(data.error || "Google Sign-In failed");
              }
            } catch {
              toast.error("Error verifying Google account");
            } finally {
              setLoading(false);
            }
          }
        },
      });
      win.google.accounts.id.prompt();
    } else {
      // Open instant Google Account Authenticator Modal
      setShowGoogleModal(true);
      setGoogleOtpSent(false);
      setGoogleOtp("");
    }
  };

  // Send OTP for Google Sign-In Modal
  const handleSendGoogleOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanEmail = googleEmail.trim().toLowerCase();
    const cleanName = googleName.trim() || cleanEmail.split("@")[0];

    if (!cleanEmail || !cleanEmail.includes("@")) {
      toast.error("Please enter your Gmail / Google email address");
      return;
    }

    setGoogleLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: cleanEmail,
          fullName: cleanName,
          isGoogleAuth: true,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Google verification code sent to " + cleanEmail);
        setGoogleOtpSent(true);
        setGoogleTimer(30);
      } else {
        toast.error(data.error || "Failed to send verification code");
      }
    } catch {
      toast.error("Network error sending code");
    } finally {
      setGoogleLoading(false);
    }
  };

  // Complete Google Sign-In with OTP
  const handleVerifyGoogleOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = googleEmail.trim().toLowerCase();
    const cleanName = googleName.trim() || cleanEmail.split("@")[0];
    const cleanOtp = googleOtp.trim();

    if (!cleanOtp || cleanOtp.length !== 6) {
      toast.error("Please enter the 6-digit verification code");
      return;
    }

    setGoogleLoading(true);
    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: cleanEmail,
          fullName: cleanName,
          otp: cleanOtp,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`Signed in with Google as ${data.fullName || data.user}!`);
        setShowGoogleModal(false);
        window.location.href = data.redirectTo || "/dashboard";
      } else {
        toast.error(data.error || "Invalid verification code");
      }
    } catch {
      toast.error("Network error during Google Sign-In");
    } finally {
      setGoogleLoading(false);
    }
  };

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const passToUse = password.trim();
    const userToUse = email.trim();

    if (!userToUse) {
      toast.error("Please enter your email or client ID");
      return;
    }

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
          username: userToUse,
          password: passToUse,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`Welcome back, ${data.user || "Investor"}!`);
        window.location.href = "/dashboard";
      } else {
        toast.error("Invalid credentials. Please verify your email and password.");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Send OTP
  const handleSendOtp = async () => {
    const cleanName = fullName.trim();
    const cleanEmail = email.trim();

    if (!cleanName) {
      toast.error("Please enter your full name first");
      return;
    }

    if (!cleanEmail || !cleanEmail.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setOtpSending(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: cleanEmail,
          fullName: cleanName,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Verification OTP sent to " + cleanEmail);
        setOtpSent(true);
        setTimer(30); // 30 seconds timer
      } else {
        toast.error(data.error || "Failed to send OTP.");
      }
    } catch {
      toast.error("Failed to connect to server.");
    } finally {
      setOtpSending(false);
    }
  };

  // Handle Signup Submit
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = fullName.trim();
    const cleanDob = dob.trim();
    const cleanEmail = email.trim();
    const cleanPass = password.trim();
    const cleanConfirmPass = confirmPassword.trim();
    const cleanOtp = otp.trim();

    if (!cleanName) {
      toast.error("Please enter your full name");
      return;
    }
    if (!cleanDob) {
      toast.error("Please select your Date of Birth");
      return;
    }
    if (!cleanEmail) {
      toast.error("Please enter your email");
      return;
    }
    if (!cleanPass || cleanPass.length < 4) {
      toast.error("Password must be at least 4 characters long");
      return;
    }
    if (cleanPass !== cleanConfirmPass) {
      toast.error("Passwords do not match! Please check Confirm Password.");
      return;
    }
    if (!otpSent) {
      toast.error("Please click 'Send OTP' to receive your verification code");
      return;
    }
    if (!cleanOtp || cleanOtp.length !== 6) {
      toast.error("Please enter the complete 6-digit OTP");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: cleanName,
          dob: cleanDob,
          email: cleanEmail,
          password: cleanPass,
          otp: cleanOtp,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Account created! Please complete your investor profile.");
        window.location.href = "/profile";
      } else {
        toast.error(data.error || "Signup failed");
      }
    } catch {
      toast.error("Network error during signup");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col lg:flex-row font-sans selection:bg-slate-900 selection:text-white overflow-hidden">
      {/* LEFT COLUMN: Animated Form */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className="w-full lg:w-[45%] xl:w-[40%] min-h-screen flex flex-col justify-between px-6 sm:px-14 lg:px-14 xl:px-16 py-6 lg:py-8 bg-white z-10 border-r border-slate-100 relative overflow-y-auto"
      >
        {/* Top bar with logo and back link */}
        <div className="flex items-center justify-between mb-4">
          <Link href="/" className="flex items-center group cursor-pointer" title="YS Portfolio Home">
            <motion.div
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.96 }}
              className="relative h-9 w-7 rounded-lg overflow-hidden bg-black flex items-center justify-center shadow-sm"
            >
              <Image src="/ys_logo.png" alt="YS" fill className="object-contain p-0.5" />
            </motion.div>
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
        <div className="w-full max-w-[400px] mx-auto my-auto space-y-4">
          {/* Header & Animated Mode Switcher */}
          <div className="flex items-center justify-between">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              <h1 className="text-3xl font-bold tracking-tight text-slate-950">
                {mode === "login" ? "Log In" : "Sign Up"}
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                {mode === "login"
                  ? "Access your institutional portfolio dashboard"
                  : "Create your institutional trading account"}
              </p>
            </motion.div>

            {/* Sliding Pill Tab Switcher */}
            <div className="relative flex bg-slate-100 p-1 rounded-xl text-xs font-semibold shrink-0">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setOtpSent(false);
                  setOtp("");
                }}
                className={`relative z-10 px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  mode === "login" ? "text-slate-950 font-bold" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {mode === "login" && (
                  <motion.div
                    layoutId="authTabPill"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    className="absolute inset-0 bg-white rounded-lg shadow-xs -z-10"
                  />
                )}
                Log In
              </button>
              <button
                type="button"
                onClick={() => setMode("signup")}
                className={`relative z-10 px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  mode === "signup" ? "text-slate-950 font-bold" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {mode === "signup" && (
                  <motion.div
                    layoutId="authTabPill"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    className="absolute inset-0 bg-white rounded-lg shadow-xs -z-10"
                  />
                )}
                Sign Up
              </button>
            </div>
          </div>

          {/* Sign in with Google Button */}
          <div className="pt-1">
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={handleGoogleSignInClick}
              className="w-full h-11 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-semibold text-xs sm:text-sm rounded-xl transition-all duration-200 cursor-pointer shadow-xs flex items-center justify-center gap-2.5"
            >
              {/* Official Google Multi-Color SVG Logo */}
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96z"
                />
              </svg>
              <span>Continue with Google</span>
            </motion.button>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center py-0.5">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              or
            </span>
            <div className="border-t border-slate-200 w-full" />
          </div>

          {/* Animated Form Fields */}
          <form
            onSubmit={mode === "login" ? handleLogin : handleSignup}
            className="space-y-3.5"
          >
            <AnimatePresence mode="popLayout">
              {/* Full Name & Date of Birth Fields (Sign Up Only) */}
              {mode === "signup" && (
                <motion.div
                  key="signup-extra-fields"
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-hidden"
                >
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 block">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Mohd Aftab"
                      required
                      className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-950/10 focus:border-slate-900 transition-all placeholder:text-slate-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-slate-500" />
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      required
                      className="w-full h-10 px-3 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-950/10 focus:border-slate-900 transition-all text-slate-700"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email Field with Send OTP Button */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 block">
                  Email Address
                </label>
                {mode === "signup" && !otpSent && (
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.96 }}
                    type="button"
                    onClick={handleSendOtp}
                    disabled={otpSending || !email.trim() || !fullName.trim()}
                    className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 disabled:opacity-40 transition-colors cursor-pointer"
                  >
                    {otpSending ? "Sending OTP..." : "Send OTP →"}
                  </motion.button>
                )}
              </div>

              <div className="relative">
                <input
                  type={mode === "signup" ? "email" : "text"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full h-10 px-3.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-950/10 focus:border-slate-900 transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* OTP Input Field - Appears with spring animation when Send OTP is clicked */}
            <AnimatePresence>
              {mode === "signup" && otpSent && (
                <motion.div
                  key="otp-box"
                  initial={{ opacity: 0, scale: 0.95, y: -8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -8 }}
                  transition={{ type: "spring", stiffness: 320, damping: 25 }}
                  className="p-3 rounded-xl bg-blue-50/60 border border-blue-200 space-y-2 shadow-inner"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <KeyRound className="h-3.5 w-3.5 text-blue-600" />
                      Enter 6-Digit OTP
                    </span>
                    {timer > 0 ? (
                      <span className="text-xs font-bold text-rose-600 flex items-center gap-1">
                        <Timer className="h-3 w-3 animate-spin" />
                        Resend in {timer}s
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={otpSending}
                        className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                      >
                        Resend OTP
                      </button>
                    )}
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                      placeholder="• • • • • •"
                      required
                      autoFocus
                      className="w-full h-10 px-3 text-center tracking-[0.4em] font-mono text-base font-bold bg-white border border-blue-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                    Sent from <strong>ysportfolio143@gmail.com</strong> (Valid for 5 mins)
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Password & Confirm Password Fields */}
            <div className={mode === "signup" ? "grid grid-cols-1 sm:grid-cols-2 gap-3" : "space-y-1"}>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full h-10 px-3.5 pr-9 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-950/10 focus:border-slate-900 transition-all placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              {mode === "signup" && (
                <motion.div
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-1"
                >
                  <label className="text-xs font-semibold text-slate-700 block">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className={`w-full h-10 px-3.5 pr-9 text-sm bg-white border rounded-xl focus:outline-none focus:ring-2 transition-all placeholder:text-slate-400 ${
                        confirmPassword && confirmPassword !== password
                          ? "border-rose-400 focus:border-rose-500 focus:ring-rose-100"
                          : "border-slate-200 focus:border-slate-900 focus:ring-slate-950/10"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1"
                      title={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-3.5 w-3.5" />
                      ) : (
                        <Eye className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Primary Submit Button */}
            <div className="pt-1.5">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading || (mode === "signup" && !otpSent)}
                className="w-full h-11 bg-[#121212] hover:bg-black disabled:opacity-50 text-white font-semibold text-sm rounded-xl transition-all duration-200 cursor-pointer shadow-md flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                    <span>{mode === "login" ? "Signing in..." : "Verifying & Creating..."}</span>
                  </>
                ) : (
                  <span>
                    {mode === "login"
                      ? "Continue to Dashboard"
                      : otpSent
                      ? "Verify OTP & Create Account"
                      : "Send OTP to Register"}
                  </span>
                )}
              </motion.button>
            </div>
          </form>

          <p className="text-[11px] text-slate-500 pt-1 leading-relaxed text-center sm:text-left">
            By using YS Portfolio, you agree to our{" "}
            <Link href="/privacy-policy" className="underline text-slate-700 hover:text-slate-950">
              Privacy Policy
            </Link>{" "}
            and our{" "}
            <Link href="/terms" className="underline text-slate-700 hover:text-slate-950">
              Terms of Service
            </Link>.
          </p>

          {/* Switch Prompt */}
          <div className="text-center pt-1 text-xs text-slate-600">
            {mode === "login" ? (
              <>
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("signup");
                    setOtpSent(false);
                  }}
                  className="font-bold text-slate-950 underline underline-offset-4 hover:text-blue-700 cursor-pointer"
                >
                  Create your account
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setOtpSent(false);
                  }}
                  className="font-bold text-slate-950 underline underline-offset-4 hover:text-blue-700 cursor-pointer"
                >
                  Log in
                </button>
              </>
            )}
          </div>
        </div>

        {/* Bottom subtle copyright */}
        <div className="pt-4 text-center lg:text-left text-[11px] text-slate-400">
          © {new Date().getFullYear()} YS Portfolio
        </div>
      </motion.div>

      {/* RIGHT COLUMN: Animated Trading Visual Showcase Image with Floating Live Widgets */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.65, ease: "easeOut" }}
        className="hidden lg:flex lg:w-[55%] xl:w-[60%] h-screen sticky top-0 p-4 sm:p-6 lg:p-7 xl:p-8 bg-white"
      >
        <div className="relative w-full h-full rounded-[28px] sm:rounded-[36px] overflow-hidden shadow-2xl bg-slate-950 border border-slate-800/80 group">
          {/* Slow Ken Burns pan/zoom effect on background image */}
          <motion.div
            animate={{ scale: [1, 1.07, 1] }}
            transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <Image
              src="/login_trading_bg.jpg"
              alt="Institutional Trading Workstation & Wealth Dashboard"
              fill
              priority
              sizes="(max-width: 1200px) 50vw, 60vw"
              className="object-cover object-center"
            />
          </motion.div>

          {/* Subtle cinematic gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/30 pointer-events-none" />

          {/* Floating Animated Market Widget #1 (Top Left) */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-8 left-8 z-10 px-4 py-3 rounded-2xl bg-black/50 backdrop-blur-md border border-white/15 text-white shadow-xl flex items-center gap-3"
          >
            <div className="h-9 w-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold tracking-wide">NIFTY 50</span>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 px-1.5 py-0.5 rounded">
                  +1.42%
                </span>
              </div>
              <p className="text-xs font-mono text-white/80 mt-0.5">Live Institutional Feed</p>
            </div>
          </motion.div>

          {/* Floating Animated Security Badge #2 (Top Right) */}
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="absolute top-8 right-8 z-10 px-4 py-2.5 rounded-2xl bg-black/50 backdrop-blur-md border border-blue-500/30 text-white shadow-xl flex items-center gap-2.5"
          >
            <ShieldCheck className="h-4 w-4 text-blue-400" />
            <span className="text-xs font-semibold tracking-wide text-white/90">
              256-Bit Encrypted Vault
            </span>
          </motion.div>

          {/* Bottom Institutional Terminal Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="absolute bottom-8 left-8 right-8 z-10 flex items-center justify-between p-5 rounded-2xl bg-black/55 backdrop-blur-md border border-white/15 text-white shadow-2xl"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="h-2 w-2 rounded-full bg-emerald-500 -ml-4" />
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Institutional Terminal Active
                </p>
              </div>
              <p className="text-sm font-semibold text-white/95">
                Real-Time Multi-Asset Portfolio & Algorithmic Wealth Intelligence
              </p>
            </div>
            <div className="text-right hidden sm:block border-l border-white/15 pl-4">
              <span className="text-xs font-mono font-bold text-blue-400">ARN 145084</span>
              <p className="text-[11px] text-white/60">AMFI Registered</p>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Google Account Sign-In Modal */}
      <AnimatePresence>
        {showGoogleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 15 }}
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
              className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden p-6 space-y-5 relative"
            >
              <button
                type="button"
                onClick={() => setShowGoogleModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Google Header */}
              <div className="flex flex-col items-center text-center space-y-2 pt-2">
                <div className="h-12 w-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center shadow-xs">
                  <svg className="h-6 w-6" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96z"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-slate-900">Sign in with Google</h2>
                <p className="text-xs text-slate-500">
                  to continue to <strong className="text-slate-800">YS Portfolio</strong>
                </p>
              </div>

              {!googleOtpSent ? (
                <form onSubmit={handleSendGoogleOtp} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 block">
                      Your Name
                    </label>
                    <input
                      type="text"
                      value={googleName}
                      onChange={(e) => setGoogleName(e.target.value)}
                      placeholder="e.g. Mohd Aftab"
                      required
                      className="w-full h-11 px-3.5 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 block">
                      Google / Gmail Address
                    </label>
                    <input
                      type="email"
                      value={googleEmail}
                      onChange={(e) => setGoogleEmail(e.target.value)}
                      placeholder="yourname@gmail.com"
                      required
                      className="w-full h-11 px-3.5 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={googleLoading}
                    className="w-full h-11 bg-[#1a73e8] hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-blue-600/20"
                  >
                    {googleLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Sending Verification Code...</span>
                      </>
                    ) : (
                      <span>Next</span>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyGoogleOtp} className="space-y-4">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                    <p className="text-xs text-slate-600">
                      Verification code sent to{" "}
                      <strong className="text-slate-900">{googleEmail}</strong>
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800">
                        Enter 6-Digit Google Verification Code
                      </label>
                      {googleTimer > 0 ? (
                        <span className="text-xs font-bold text-rose-600">
                          Resend in {googleTimer}s
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSendGoogleOtp()}
                          className="text-xs font-bold text-blue-600 hover:underline"
                        >
                          Resend Code
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      maxLength={6}
                      value={googleOtp}
                      onChange={(e) => setGoogleOtp(e.target.value.replace(/\D/g, ""))}
                      placeholder="• • • • • •"
                      required
                      autoFocus
                      className="w-full h-11 px-3 text-center tracking-[0.4em] font-mono text-base font-bold bg-white border border-blue-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setGoogleOtpSent(false)}
                      className="px-4 h-11 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={googleLoading}
                      className="flex-1 h-11 bg-[#1a73e8] hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-blue-600/20"
                    >
                      {googleLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Verifying...</span>
                        </>
                      ) : (
                        <span>Verify & Continue</span>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
