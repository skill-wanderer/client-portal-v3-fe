"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import * as client from "openid-client";
import { getAuthConfig } from "@/lib/env";
import { getOidcConfig } from "./oidc";
import { cookieOptions, readSession, sessionCookieWrites } from "./session";

/**
 * Clears the portal session, then ends the Keycloak SSO session through
 * RP-initiated logout so the next sign-in asks for credentials again.
 */
export async function signOut() {
  const cookieStore = await cookies();
  const session = await readSession(cookieStore);

  for (const write of await sessionCookieWrites(cookieStore, null)) {
    cookieStore.set(write.name, write.value, cookieOptions(write.maxAge));
  }

  const signedOutUrl = new URL("/?signedOut=1", getAuthConfig().appUrl);
  let destination = signedOutUrl.href;
  if (session?.idToken) {
    try {
      const endSession = client.buildEndSessionUrl(await getOidcConfig(), {
        id_token_hint: session.idToken,
        post_logout_redirect_uri: signedOutUrl.href,
      });
      destination = endSession.href;
    } catch (error) {
      // The local session is already gone; skipping Keycloak's logout only leaves the SSO session.
      console.error("[auth] could not build the Keycloak logout URL", error);
    }
  }

  redirect(destination);
}
