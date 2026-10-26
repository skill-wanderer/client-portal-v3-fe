export const DEFAULT_RETURN_TO = "/dashboard";

/**
 * Only same-origin paths are allowed as post-login destinations, which keeps
 * /auth/login?returnTo=... from being used as an open redirect.
 */
export function safeReturnTo(value: string | null | undefined): string {
  if (!value || !value.startsWith("/")) return DEFAULT_RETURN_TO;

  const base = "http://portal.invalid";
  let url: URL;
  try {
    url = new URL(value, base);
  } catch {
    return DEFAULT_RETURN_TO;
  }
  // Protocol-relative ("//evil.com") and backslash ("/\evil.com") tricks resolve to another origin.
  if (url.origin !== base || url.pathname.startsWith("/auth/")) return DEFAULT_RETURN_TO;

  const path = `${url.pathname}${url.search}${url.hash}`;
  // Check the normalized result too: "/..//evil.com" normalizes to the protocol-relative "//evil.com".
  return new URL(path, base).origin === base ? path : DEFAULT_RETURN_TO;
}
