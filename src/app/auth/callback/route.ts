import { NextResponse, connection, type NextRequest } from "next/server";
import * as client from "openid-client";
import { getAuthConfig } from "@/lib/env";
import { callbackUrl, getOidcConfig, sessionFromTokens } from "@/lib/auth/oidc";
import {
  cookieOptions,
  readTransaction,
  sessionCookieWrites,
  transactionCookieName,
} from "@/lib/auth/session";

/** Keycloak redirects here with an authorization code; exchange it for tokens and start a session. */
export async function GET(request: NextRequest) {
  await connection();
  const { appUrl } = getAuthConfig();
  const transaction = await readTransaction(request.cookies);

  const fail = (reason: "denied" | "expired" | "failed") => {
    const response = NextResponse.redirect(new URL(`/?authError=${reason}`, appUrl));
    response.cookies.set(transactionCookieName(), "", cookieOptions(0));
    return response;
  };

  const error = request.nextUrl.searchParams.get("error");
  if (error) {
    console.warn(`[auth] Keycloak returned an error: ${error}`);
    return fail(error === "access_denied" ? "denied" : "failed");
  }
  if (!transaction) return fail("expired");

  let tokens: Awaited<ReturnType<typeof client.authorizationCodeGrant>>;
  try {
    // Rebuild the URL from APP_URL: behind a reverse proxy request.url carries the
    // internal host, and openid-client derives the token request's redirect_uri from it.
    const currentUrl = new URL(callbackUrl());
    currentUrl.search = request.nextUrl.search;
    tokens = await client.authorizationCodeGrant(await getOidcConfig(), currentUrl, {
      pkceCodeVerifier: transaction.codeVerifier,
      expectedState: transaction.state,
      expectedNonce: transaction.nonce,
      idTokenExpected: true,
    });
  } catch (err) {
    console.error("[auth] authorization code exchange failed", err);
    return fail("failed");
  }

  const response = NextResponse.redirect(new URL(transaction.returnTo, appUrl));
  for (const write of await sessionCookieWrites(request.cookies, sessionFromTokens(tokens))) {
    response.cookies.set(write.name, write.value, cookieOptions(write.maxAge));
  }
  response.cookies.set(transactionCookieName(), "", cookieOptions(0));
  return response;
}
