import { NextResponse } from "next/server";
import { SignJWT } from "jose";
import { findUserByUsername, getAllUsers } from "@/lib/models/User";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username: inputUsername, password } = body;

    const trimmedPass = password?.trim();
    if (!trimmedPass) {
      return NextResponse.json({ success: false, message: "Password is required" }, { status: 400 });
    }

    let authenticatedUser: string | null = null;

    // 1. If explicit username provided
    if (inputUsername && inputUsername.trim()) {
      const targetUser = await findUserByUsername(inputUsername.trim());
      if (targetUser && targetUser.password === trimmedPass) {
        authenticatedUser = targetUser.username;
      }
    } else {
      // 2. Check main admin master password
      const masterPass = process.env.APP_PASSWORD?.trim();
      if (masterPass && trimmedPass === masterPass) {
        authenticatedUser = "main";
      } else if (trimmedPass === "demo123") {
        authenticatedUser = "demo";
      } else {
        // 3. Check all DB users if password matches
        const allUsers = await getAllUsers();
        const matched = allUsers.find((u) => u.password && u.password === trimmedPass);
        if (matched) {
          authenticatedUser = matched.username;
        }
      }
    }

    if (authenticatedUser) {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || "fallback_secret");
      const token = await new SignJWT({ verified: true, user: authenticatedUser })
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime("30d")
        .sign(secret);

      const response = NextResponse.json({ success: true, user: authenticatedUser });

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
      return NextResponse.json({ success: false, message: "Invalid username or password" }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ success: false, message: "Invalid request format" }, { status: 400 });
  }
}
