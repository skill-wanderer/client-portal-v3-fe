import "server-only";
import { cacheLife } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { decodeJwt, type JWTPayload } from "jose";
import { getAuthConfig } from "@/lib/env";
import { readSession } from "./session";

/** The narrow view of the signed-in client that pages and components may use. */
export type User = {
  id: string;
  name: string;
  firstName: string;
  initials: string;
  email?: string;
  emailVerified?: boolean;
  username?: string;
  roles: string[];
  organizations: string[];
};

// Keycloak adds these to every user; they say nothing about portal access.
const IMPLICIT_ROLES = new Set(["offline_access", "uma_authorization"]);

/**
 * The raw session, including the access token for calling backend APIs on the
 * user's behalf. Server-only: never pass it to a Client Component.
 */
export async function getSession() {
  return readSession(await cookies());
}

export async function getCurrentUser(): Promise<User | null> {
  "use cache: private";
  // A 5-minute stale time lets authenticated pages join the prefetched App Shell.
  cacheLife({ stale: 300 });

  const session = await getSession();
  if (!session) return null;

  // Both tokens came straight from Keycloak's token endpoint and sit inside our
  // encrypted cookie, so decoding (not re-verifying) them is enough for display.
  const idClaims = claimsOf(session.idToken);
  const accessClaims = claimsOf(session.accessToken);
  return toUser({ ...accessClaims, ...idClaims }, accessClaims);
}

function claimsOf(token: string | undefined): JWTPayload {
  if (!token) return {};
  try {
    return decodeJwt(token);
  } catch {
    return {};
  }
}

/**
 * For protected pages. The proxy already redirects signed-out visitors; this is
 * the check that sits next to the data.
 */
export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");
  return user;
}

function toUser(claims: JWTPayload, accessClaims: JWTPayload): User {
  const str = (key: string) => {
    const value = claims[key];
    return typeof value === "string" && value.trim() ? value.trim() : undefined;
  };

  const fullName =
    str("name") ?? [str("given_name"), str("family_name")].filter(Boolean).join(" ");
  const name = fullName || str("preferred_username") || str("email") || "Client";

  return {
    id: claims.sub ?? "",
    name,
    firstName: str("given_name") ?? name.split(/\s+/)[0],
    initials: initialsOf(name),
    email: str("email"),
    emailVerified: typeof claims.email_verified === "boolean" ? claims.email_verified : undefined,
    username: str("preferred_username"),
    roles: rolesOf(accessClaims),
    organizations: organizationsOf(claims.organization),
  };
}

function rolesOf(claims: JWTPayload): string[] {
  const realmRoles = (claims.realm_access as { roles?: unknown } | undefined)?.roles;
  const clientAccess = claims.resource_access as Record<string, { roles?: unknown }> | undefined;
  const clientRoles = clientAccess?.[getAuthConfig().clientId]?.roles;

  const roles = [realmRoles, clientRoles]
    .flatMap((list) => (Array.isArray(list) ? list : []))
    .filter((role): role is string => typeof role === "string")
    .filter((role) => !IMPLICIT_ROLES.has(role) && !role.startsWith("default-roles-"));
  return [...new Set(roles)].sort();
}

/** Keycloak's `organization` scope emits either a list of aliases or a map keyed by alias. */
function organizationsOf(claim: unknown): string[] {
  if (Array.isArray(claim)) return claim.filter((org): org is string => typeof org === "string");
  if (claim && typeof claim === "object") return Object.keys(claim);
  return [];
}

function initialsOf(name: string) {
  const letters = name
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]);
  return letters.join("").toUpperCase() || "?";
}
