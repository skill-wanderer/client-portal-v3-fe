import { getCurrentUser } from "@/lib/auth/dal";
import { accountConsoleUrl } from "@/lib/auth/oidc";
import { siteLinks } from "@/lib/site";
import { PortalNav } from "./portal-nav";

/** Nav items for the header; reads the session, so it renders inside a Suspense boundary. */
export async function HeaderNav() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <>
        <a href={siteLinks.home} className="nav-link">
          skill-wanderer.com
        </a>
        {/* A plain <a>: /auth/login is a route handler that redirects to Keycloak, so it must not be prefetched. */}
        <a href="/auth/login" className="nav-cta">
          Sign in
        </a>
      </>
    );
  }

  return (
    <PortalNav
      user={{
        name: user.name,
        firstName: user.firstName,
        email: user.email,
        initials: user.initials,
      }}
      accountConsoleUrl={accountConsoleUrl()}
    />
  );
}

export function HeaderNavFallback() {
  return <div className="skeleton desktop-only h-10 w-40 rounded-full" aria-hidden="true" />;
}
