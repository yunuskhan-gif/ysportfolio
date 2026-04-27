import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("app_auth_token")?.value;

  if (!token) {
    return NextResponse.json({ verified: false }, { status: 401 });
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    await jwtVerify(token, secret);
    return NextResponse.json({ verified: true });
  } catch (err) {
    return NextResponse.json({ verified: false }, { status: 401 });
  }
}
