import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getOtpModel } from "@/lib/models/OtpVerification";
import { findUserByUsername } from "@/lib/models/User";
import { sendOtpEmail } from "@/lib/mailer";

// In-memory cache fallback for OTPs (with expiry)
type OtpCacheItem = { otp: string; expiresAt: number; fullName?: string };
declare global {
  var __otpCache__: Map<string, OtpCacheItem> | undefined;
}

const memoryOtpCache: Map<string, OtpCacheItem> = global.__otpCache__ || new Map();
global.__otpCache__ = memoryOtpCache;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, fullName, isGoogleAuth } = body;

    const normalizedEmail = (email || "").trim().toLowerCase();
    const cleanFullName = (fullName || "").trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!normalizedEmail || !emailRegex.test(normalizedEmail)) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    // Check if user already exists (only block for manual signup, not Google Sign-In)
    if (!isGoogleAuth) {
      const existing = await findUserByUsername(normalizedEmail);
      if (existing) {
        return NextResponse.json(
          { error: "An account with this email/username already exists. Please log in." },
          { status: 400 }
        );
      }
    }

    // Generate 6-digit OTP (Valid for 5 minutes, Resend cooldown 30 seconds)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // VALID FOR 5 MINUTES

    // Save in memory cache
    memoryOtpCache.set(normalizedEmail, {
      otp,
      expiresAt: expiresAt.getTime(),
      fullName: cleanFullName,
    });

    // Save in MongoDB if available
    try {
      await connectToDatabase();
      const OtpModel = getOtpModel();
      await OtpModel.deleteMany({ email: normalizedEmail });
      await OtpModel.create({
        email: normalizedEmail,
        otp,
        expiresAt,
      });
    } catch (dbErr) {
      console.warn("MongoDB OTP save fallback to memory:", dbErr);
    }

    // Send Email via Nodemailer
    await sendOtpEmail(normalizedEmail, otp, cleanFullName);

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully to " + normalizedEmail,
      resendIn: 30,
      expiresIn: 300,
    });
  } catch (error: any) {
    console.error("Error sending OTP email:", error);
    return NextResponse.json(
      { error: "Failed to send OTP email: " + (error.message || "Unknown error") },
      { status: 500 }
    );
  }
}
