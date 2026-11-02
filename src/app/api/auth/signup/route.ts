import { NextResponse } from "next/server";
import { SignJWT } from "jose";
import { connectToDatabase } from "@/lib/mongodb";
import { getOtpModel } from "@/lib/models/OtpVerification";
import { createNewUser, findUserByUsername } from "@/lib/models/User";
import { sendAdminNewUserAlert, sendWelcomeEmail } from "@/lib/mailer";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, otp, fullName, dob } = body;

    const normalizedEmail = (email || "").trim().toLowerCase();
    const cleanPassword = (password || "").trim();
    const cleanOtp = (otp || "").trim();
    const cleanFullName = (fullName || "").trim();
    const cleanDob = (dob || "").trim();

    if (!normalizedEmail || !cleanPassword || !cleanOtp) {
      return NextResponse.json(
        { error: "Full Name, Email, password, and OTP are required." },
        { status: 400 }
      );
    }

    if (cleanPassword.length < 4) {
      return NextResponse.json(
        { error: "Password must be at least 4 characters long." },
        { status: 400 }
      );
    }

    // 1. Verify OTP
    let isOtpValid = false;
    const now = Date.now();

    // Check memory cache
    const cached = global.__otpCache__?.get(normalizedEmail);
    if (cached && cached.otp === cleanOtp && cached.expiresAt > now) {
      isOtpValid = true;
      global.__otpCache__?.delete(normalizedEmail);
    } else {
      // Check MongoDB
      try {
        await connectToDatabase();
        const OtpModel = getOtpModel();
        const otpRecord = await OtpModel.findOne({
          email: normalizedEmail,
          otp: cleanOtp,
        });

        if (otpRecord) {
          const expTime = new Date(otpRecord.expiresAt).getTime();
          if (expTime > now) {
            isOtpValid = true;
            await OtpModel.deleteMany({ email: normalizedEmail });
          }
        }
      } catch (err) {
        console.warn("DB check OTP error:", err);
      }
    }

    if (!isOtpValid) {
      return NextResponse.json(
        { error: "Invalid or expired OTP. Please check your code or request a new OTP (valid for 5 minutes)." },
        { status: 400 }
      );
    }

    // 2. Check if user already exists
    const existing = await findUserByUsername(normalizedEmail);
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 400 }
      );
    }

    // 3. Create user in database
    const newUser = await createNewUser(
      normalizedEmail,
      cleanPassword,
      cleanFullName || cached?.fullName || "",
      cleanDob
    );

    // 4. Send Welcome ("Thank You for Registration") email to User & Alert email to Admin (ysportfolio143@gmail.com)
    const resolvedFullName = cleanFullName || cached?.fullName;
    try {
      await Promise.allSettled([
        sendWelcomeEmail(newUser.username, resolvedFullName),
        sendAdminNewUserAlert(newUser.username, cleanPassword, resolvedFullName, cleanDob),
      ]);
    } catch (mailErr) {
      console.error("Failed to send post-registration emails:", mailErr);
    }

    // 5. Create auth JWT token & set cookie
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "ys_portfolio_jwt_secret_key_random_123_456");
    const token = await new SignJWT({ user: newUser.username })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("30d")
      .sign(secret);

    const response = NextResponse.json({
      success: true,
      message: "Account created successfully!",
      user: newUser.username,
    });

    response.cookies.set("app_auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create account." },
      { status: 500 }
    );
  }
}
