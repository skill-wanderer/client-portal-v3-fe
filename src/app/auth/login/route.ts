import { NextResponse, connection, type NextRequest } from "next/server";
import * as client from "openid-client";
import { getAuthConfig } from "@/lib/env";
import { callbackUrl, getOidcConfig } from "@/lib/auth/oidc";
import { isDocumentNavigation } from "@/lib/auth/request";
import { safeReturnTo } from "@/lib/auth/return-to";
import {
  TRANSACTION_MAX_AGE,
  cookieOptions,
  sealTransaction,
  transactionCookieName,
} from "@/lib/auth/session";

/** Starts the Authorization Code + PKCE flow against Keycloak. */
export async function GET(request: NextRequest) {
  // Never prerender: every sign-in needs its own state, nonce and PKCE verifier.
  await connection();

  // Only a top-level navigation may start a sign-in. A prefetch or router fetch
  // would otherwise replace the transaction cookie of a sign-in already in progress.
  if (!isDocumentNavigation(request.headers)) {
    return new NextResponse(null, { status: 204 });
  }

  const { appUrl, scope } = getAuthConfig();

  let config: client.Configuration;
  try {
    config = await getOidcConfig();
  } catch (error) {
    console.error("[auth] Keycloak discovery failed", error);
    return NextResponse.redirect(new URL("/?authError=unavailable", appUrl));
  }

  const codeVerifier = client.randomPKCECodeVerifier();
  const state = client.randomState();
  const nonce = client.randomNonce();
  const authorizationUrl = client.buildAuthorizationUrl(config, {
    redirect_uri: callbackUrl().href,
    scope,
    state,
    nonce,
    code_challenge: await client.calculatePKCECodeChallenge(codeVerifier),
    code_challenge_method: "S256",
  });

  const response = NextResponse.redirect(authorizationUrl);
  response.cookies.set(
    transactionCookieName(),
    await sealTransaction({
      state,
      nonce,
      codeVerifier,
      returnTo: safeReturnTo(request.nextUrl.searchParams.get("returnTo")),
    }),
    cookieOptions(TRANSACTION_MAX_AGE),
  );
  return response;
}
