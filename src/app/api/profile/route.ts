import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { findUserByUsername, updateUserProfile } from "@/lib/models/User";

async function getCurrentUsername(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("app_auth_token")?.value;
  if (!token) return null;

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "ys_portfolio_jwt_secret_key_random_123_456");
    const { payload } = await jwtVerify(token, secret);
    return (payload.user as string) || "main";
  } catch {
    return null;
  }
}

// GET /api/profile - Fetch current user's profile
export async function GET() {
  try {
    const username = await getCurrentUsername();
    if (!username) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await findUserByUsername(username);
    if (!user) {
      return NextResponse.json({
        profile: {
          username,
          fullName: "",
          panNumber: "",
          dob: "",
          avatarUrl: "",
          profileCompleted: false,
        },
      });
    }

    return NextResponse.json({
      profile: {
        username: user.username,
        fullName: user.fullName || "",
        panNumber: user.panNumber || "",
        dob: user.dob || "",
        avatarUrl: user.avatarUrl || "",
        profileCompleted: Boolean(user.profileCompleted),
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    console.error("Failed to fetch profile:", error);
    return NextResponse.json({ error: "Failed to load profile" }, { status: 500 });
  }
}

// PUT /api/profile - Save / Update PAN, DOB, Avatar DP, Full Name
export async function PUT(req: Request) {
  try {
    const username = await getCurrentUsername();
    if (!username) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { fullName, panNumber, dob, avatarUrl } = body;

    const cleanPan = (panNumber || "").trim().toUpperCase();
    const cleanDob = (dob || "").trim();

    // Standard Indian PAN validation (5 letters, 4 digits, 1 letter - e.g. ABCDE1234F)
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!cleanPan || !panRegex.test(cleanPan)) {
      return NextResponse.json(
        { error: "Please enter a valid 10-character PAN number (e.g. ABCDE1234F)" },
        { status: 400 }
      );
    }

    if (!cleanDob) {
      return NextResponse.json(
        { error: "Please enter your Date of Birth" },
        { status: 400 }
      );
    }

    const updated = await updateUserProfile(username, {
      fullName: fullName !== undefined ? fullName : undefined,
      panNumber: cleanPan,
      dob: cleanDob,
      avatarUrl: avatarUrl !== undefined ? avatarUrl : undefined,
    });

    return NextResponse.json({
      success: true,
      message: "Profile completed successfully!",
      profile: {
        username,
        fullName: updated?.fullName || fullName || "",
        panNumber: updated?.panNumber || cleanPan,
        dob: updated?.dob || cleanDob,
        avatarUrl: updated?.avatarUrl || avatarUrl || "",
        profileCompleted: true,
      },
    });
  } catch (error: any) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update profile" },
      { status: 500 }
    );
  }
}

