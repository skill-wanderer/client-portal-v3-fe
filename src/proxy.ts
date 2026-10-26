import { NextResponse, type NextRequest } from "next/server";
import { getAuthConfig } from "@/lib/env";
import { refreshSession } from "@/lib/auth/oidc";
import { isDocumentNavigation } from "@/lib/auth/request";
import { DEFAULT_RETURN_TO } from "@/lib/auth/return-to";
import {
  cookieOptions,
  isExpiring,
  readSession,
  sessionCookieWrites,
  type CookieWrite,
} from "@/lib/auth/session";

const PROTECTED_PREFIXES = ["/dashboard", "/projects", "/account"];

/**
 * Runs before every page render:
 * - refreshes Keycloak tokens shortly before they expire (Server Components can't write cookies),
 * - sends signed-out visitors of portal pages to Keycloak, remembering where they were going,
 * - sends signed-in visitors of the landing page straight to their dashboard.
 *
 * This is an optimistic check only; pages re-check through the DAL (lib/auth/dal.ts).
 */
export async function proxy(request: NextRequest) {
  const { appUrl } = getAuthConfig();
  const { pathname, search } = request.nextUrl;

  let session = await readSession(request.cookies);
  let writes: CookieWrite[] = [];

  if (session && isExpiring(session)) {
    try {
      const refreshed = await refreshSession(session);
      session = refreshed?.session ?? null;
      writes = await sessionCookieWrites(request.cookies, refreshed);
    } catch (error) {
      // Keycloak is unreachable: keep the current session instead of signing the user out.
      console.error("[auth] token refresh failed", error);
    }
  }

  // Server Actions (POST) pass through: they check the session themselves, and
  // signOut must keep working after the session has already expired.
  const isPageRequest = request.method === "GET" || request.method === "HEAD";

  let response: NextResponse;
  if (!session && isProtected(pathname) && isPageRequest) {
    if (isDocumentNavigation(request.headers)) {
      const login = new URL("/auth/login", appUrl);
      login.searchParams.set("returnTo", `${pathname}${search}`);
      response = NextResponse.redirect(login);
    } else {
      // Prefetches and client-side navigations get a 401 instead of a redirect into
      // Keycloak; the router then falls back to a full page load, which lands above.
      response = new NextResponse(null, { status: 401 });
    }
  } else if (session && pathname === "/" && isPageRequest) {
    response = NextResponse.redirect(new URL(DEFAULT_RETURN_TO, appUrl));
  } else {
    // Forward refreshed cookies to this render as well as to the browser.
    for (const write of writes) {
      if (write.maxAge > 0) request.cookies.set(write.name, write.value);
      else request.cookies.delete(write.name);
    }
    response = NextResponse.next({ request: { headers: request.headers } });
  }

  for (const write of writes) {
    response.cookies.set(write.name, write.value, cookieOptions(write.maxAge));
  }
  return response;
}

function isProtected(pathname: string) {
  return PROTECTED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export const config = {
  // Skip Next.js internals, the /auth/* route handlers and any file with an extension.
  matcher: ["/((?!_next/static|_next/image|auth/|.*\\..*).*)"],
};
