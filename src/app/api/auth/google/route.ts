import { NextResponse } from "next/server";
import { SignJWT } from "jose";
import { connectToDatabase } from "@/lib/mongodb";
import { getOtpModel } from "@/lib/models/OtpVerification";
import { findUserByUsername, createNewUser, updateUserProfile } from "@/lib/models/User";
import { sendAdminNewUserAlert, sendWelcomeEmail } from "@/lib/mailer";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      credential,
      email: directEmail,
      fullName: directName,
      avatarUrl: directAvatar,
      otp,
    } = body;

    let googleEmail = (directEmail || "").trim().toLowerCase();
    let googleName = (directName || "").trim();
    let googlePicture = directAvatar || "";

    // 1. If official Google ID Token (credential) is provided, verify via Google tokeninfo endpoint
    if (credential) {
      const verifyRes = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`
      );
      if (!verifyRes.ok) {
        return NextResponse.json(
          { error: "Invalid Google ID token" },
          { status: 401 }
        );
      }
      const tokenData = await verifyRes.json();
      googleEmail = (tokenData.email || "").trim().toLowerCase();
      googleName = tokenData.name || googleEmail.split("@")[0];
      googlePicture = tokenData.picture || "";
    } else {
      // Verify 6-digit OTP sent to Gmail account
      const cleanOtp = (otp || "").trim();
      if (!cleanOtp) {
        return NextResponse.json(
          { error: "Please enter the verification code sent to your Google email" },
          { status: 400 }
        );
      }

      let isOtpValid = false;
      const now = Date.now();
      const cached = global.__otpCache__?.get(googleEmail);

      if (cached && cached.otp === cleanOtp && cached.expiresAt > now) {
        isOtpValid = true;
        global.__otpCache__?.delete(googleEmail);
      } else {
        try {
          await connectToDatabase();
          const OtpModel = getOtpModel();
          const otpRecord = await OtpModel.findOne({
            email: googleEmail,
            otp: cleanOtp,
          });
          if (otpRecord && new Date(otpRecord.expiresAt).getTime() > now) {
            isOtpValid = true;
            await OtpModel.deleteMany({ email: googleEmail });
          }
        } catch (err) {
          console.warn("DB check OTP error in Google auth:", err);
        }
      }

      if (!isOtpValid) {
        return NextResponse.json(
          { error: "Invalid or expired verification code." },
          { status: 400 }
        );
      }
    }

    if (!googleEmail || !googleEmail.includes("@")) {
      return NextResponse.json(
        { error: "Valid Google account email is required" },
        { status: 400 }
      );
    }

    // 2. Check if user already exists in DB
    let user = await findUserByUsername(googleEmail);
    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      const randomPass = "GAuth_" + Math.random().toString(36).slice(2, 10);
      const resolvedName = googleName || googleEmail.split("@")[0];
      user = await createNewUser(googleEmail, randomPass, resolvedName);

      if (googlePicture) {
        await updateUserProfile(googleEmail, {
          fullName: resolvedName,
          avatarUrl: googlePicture,
        });
      }

      // Send Welcome Email to User & Admin Notification to ysportfolio143@gmail.com
      try {
        await Promise.allSettled([
          sendWelcomeEmail(googleEmail, resolvedName),
          sendAdminNewUserAlert(
            googleEmail,
            `${randomPass} (Signed in with Google)`,
            resolvedName
          ),
        ]);
      } catch (e) {
        console.error("Google signup email notification error:", e);
      }
    }

    // 3. Issue JWT session cookie
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || "ys_portfolio_jwt_secret_key_random_123_456"
    );
    const token = await new SignJWT({ user: user.username })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("30d")
      .sign(secret);

    const redirectTo = isNewUser || !user.profileCompleted ? "/profile" : "/dashboard";

    const response = NextResponse.json({
      success: true,
      user: user.username,
      fullName: user.fullName || googleName,
      isNewUser,
      redirectTo,
    });

    response.cookies.set("app_auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Google Auth Error:", error);
    return NextResponse.json(
      { error: error.message || "Google authentication failed" },
      { status: 500 }
    );
  }
}
