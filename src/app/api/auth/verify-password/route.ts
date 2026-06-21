import { NextResponse } from "next/server";
import { SignJWT } from "jose";

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    const correctPassword = process.env.APP_PASSWORD;
    const isDemo = password?.trim() === "demo123";

    if (password?.trim() === correctPassword?.trim() || isDemo) {
      const username = isDemo ? "demo" : "main";
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      const token = await new SignJWT({ verified: true, user: username })
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime("30d")
        .sign(secret);

      const response = NextResponse.json({ success: true, user: username });
      
      // Set HttpOnly cookie
      response.cookies.set("app_auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/",
      });

      return response;
    } else {
      return NextResponse.json({ success: false, message: "Incorrect password" }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ success: false, message: "Invalid request" }, { status: 400 });
  }
}
