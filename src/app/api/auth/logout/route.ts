import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { touchUserPresence } from "@/lib/models/User";

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get("app_auth_token")?.value;

  if (token) {
    try {
      const secret = new TextEncoder().encode(
        process.env.JWT_SECRET || "ys_portfolio_jwt_secret_key_random_123_456"
      );
      const { payload } = await jwtVerify(token, secret);
      const username = payload.user as string;
      if (username) {
        await touchUserPresence(username, true);
      }
    } catch {}
  }

  cookieStore.delete("app_auth_token");

  const response = NextResponse.json({ success: true });
  
  // Clear the auth cookie on response
  response.cookies.set("app_auth_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    expires: new Date(0),
    maxAge: 0,
    path: "/",
  });

  return response;
}
