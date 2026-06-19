import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();
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
