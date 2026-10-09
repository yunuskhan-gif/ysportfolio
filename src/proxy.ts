import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip verification for the auth API itself, static files, and media assets
  if (
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/market") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/blog") ||
    pathname === "/privacy-policy" ||
    pathname === "/terms" ||
    pathname === "/refund-policy" ||
    /\.(mp4|webm|ogg|png|jpg|jpeg|svg|ico|webp)$/i.test(pathname)
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get("app_auth_token")?.value;

  if (!token) {
    return NextResponse.next();
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch (err) {
    const response = NextResponse.next();
    response.cookies.delete("app_auth_token");
    return response;
  }
}

export default proxy;

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api/auth (auth endpoints)
     * - _next/static, _next/image
     * - static media files (mp4, webm, images, etc.)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|webm|ico)).*)",
  ],
};
