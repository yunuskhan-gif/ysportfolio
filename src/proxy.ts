import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip verification for the auth API itself and static files
  if (
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname === "/"
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get("app_auth_token")?.value;

  if (!token) {
    // If no token, we don't redirect to a login page because we use a PasswordGate component.
    // Instead, we could return a specific header or just let the layout handle it.
    // But for a true protection, we should redirect to a login route if we had one.
    // Since we don't have a separate /login route, we'll let the RootLayout PasswordGate handle it.
    return NextResponse.next();
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch (err) {
    // If token is invalid, we could clear the cookie
    const response = NextResponse.next();
    response.cookies.delete("app_auth_token");
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};
