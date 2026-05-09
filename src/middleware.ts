// Edge middleware — gates everything under /admin (except /admin/login) by
// checking the session cookie. Full DB-backed validation runs server-side
// in the page itself; this middleware just blocks anonymous requests early
// to avoid a flash of admin shell.
import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { SESSION_COOKIE } from "./lib/auth";

const PUBLIC_ADMIN = ["/admin/login"];

function secret() {
  const raw = process.env.SESSION_SECRET ?? "nextwin-dev-secret-change-me-in-production";
  return new TextEncoder().encode(raw);
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Forward the pathname to server components so layouts can branch on
  // public vs. protected routes without re-running their own auth check
  // (avoiding a redirect loop on /admin/login).
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", pathname);
  const passthrough = () => NextResponse.next({ request: { headers: requestHeaders } });

  if (!pathname.startsWith("/admin")) return passthrough();
  if (PUBLIC_ADMIN.includes(pathname)) return passthrough();

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }
  try {
    await jwtVerify(token, secret());
  } catch {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }
  return passthrough();
}

export const config = {
  matcher: ["/admin/:path*"],
};
