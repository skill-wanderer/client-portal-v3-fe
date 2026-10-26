# Skill-Wanderer Client Portal (v3)

The client portal for [Skill-Wanderer](https://skill-wanderer.com): clients sign in with Skill-Wanderer SSO (Keycloak at `sso.skill-wanderer.com`) to follow their projects. The look and the responsive breakpoints mirror the main site.

## Architecture

This repo is the web frontend only. Business logic, data and email belong to a separate portal API, which will also serve the admin app and, later, a mobile app.

- Pages and Server Actions call the API from the server with the signed-in user's access token (`Authorization: Bearer`, from `getSession()`). The browser never calls the API directly.
- The session cookie and `SESSION_SECRET` stay in this app. The API verifies each Keycloak token on its own.
- The only route handlers here run the sign-in flow. New endpoints and business logic go in the portal API.

## Stack

- [Next.js 16](https://nextjs.org) App Router with Cache Components and Partial Prefetching
- Tailwind CSS v4, with design tokens taken from skill-wanderer.com
- [`openid-client`](https://github.com/panva/openid-client) for OIDC and [`jose`](https://github.com/panva/jose) for the encrypted session cookie
- [`lucide-react`](https://lucide.dev) icons (the same icon style the site uses)

## Getting started

Requires Node.js 22.18 or newer.

```bash
npm install
cp .env.example .env.local
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"   # paste into SESSION_SECRET
npm run dev
```

Open http://localhost:3000. To sign in locally, the Keycloak client must first accept `localhost` (see below).

### Environment

| Variable | Example | Notes |
| --- | --- | --- |
| `APP_URL` | `http://localhost:3000` | Public URL of the portal. The callback is `<APP_URL>/auth/callback`. |
| `KEYCLOAK_ISSUER` | `https://sso.skill-wanderer.com/realms/client-portal` | Realm issuer URL. |
| `KEYCLOAK_CLIENT_ID` | `client-portal-fe` | |
| `KEYCLOAK_CLIENT_SECRET` | *(empty)* | Leave empty for a public client. Set it only if the client uses client authentication. |
| `KEYCLOAK_SCOPE` | `openid profile email` | Add `organization` to show Keycloak organization membership. |
| `SESSION_SECRET` | 32+ random characters | Encrypts the session cookie. Rotating it signs everyone out. |

All values are read on the server at runtime, so one build works in every environment.

## Keycloak setup

The portal uses the existing **`client-portal-fe`** client in the **`client-portal`** realm. It is a public client (no secret) and already accepts `https://client.skill-wanderer.com/*` redirects. In the Keycloak admin console, under *Clients → client-portal-fe → Settings*:

- **Valid redirect URIs:** add `http://localhost:3000/auth/callback` for local development.
- **Valid post logout redirect URIs:** add `http://localhost:3000/*`.
- **Web origins:** nothing needed. Tokens are exchanged server to server.
- *Advanced → Proof Key for Code Exchange Code Challenge Method:* `S256` is recommended, so Keycloak enforces PKCE.

Production on `https://client.skill-wanderer.com` needs no changes.

Keep *Realm settings → Tokens → Revoke Refresh Token* off (the default), or allow at least one reuse. Parallel requests can refresh with the same token at the same moment.

## How sign-in works

The portal acts as a backend-for-frontend: Next.js talks to Keycloak, and the browser never holds a token.

1. A signed-out visit to a portal page (`/dashboard`, `/projects`, `/account`) is redirected by `src/proxy.ts` to `/auth/login?returnTo=…`.
2. `/auth/login` generates PKCE, `state` and `nonce`, stores them in a short-lived encrypted cookie, and redirects to Keycloak.
3. Keycloak sends the user back to `/auth/callback`. The code is exchanged for tokens, which are stored in an encrypted, HttpOnly session cookie (split into chunks, since Keycloak tokens exceed 4 KB), and the user lands on `returnTo`.
4. On every page request, the proxy refreshes the access token shortly before it expires. If Keycloak ends the session, the cookie is cleared and the user signs in again.
5. **Sign out** is a Server Action. It clears the cookie and calls Keycloak's end-session endpoint (RP-initiated logout), which returns to `/?signedOut=1`.

Pages read the user through the data access layer in `src/lib/auth/dal.ts`. `getCurrentUser()` returns a narrow profile for UI. `requireUser()` guards protected content. `getSession()` exposes the access token, server-side only, for calling backend APIs on the user's behalf. Any new Server Action must check the session itself; the proxy deliberately lets POST requests through.

## Project structure

```
src/
  proxy.ts                    token refresh and route protection
  app/
    layout.tsx                header, footer, metadata
    page.tsx                  public landing / sign-in page
    (portal)/                 signed-in pages: dashboard, projects, account
    auth/login/route.ts       starts the OIDC flow
    auth/callback/route.ts    finishes it and creates the session
  components/                 header, nav, footer, page header, icon badge
  lib/
    env.ts                    runtime configuration
    site.ts                   links back to skill-wanderer.com
    auth/                     session cookie, OIDC client, DAL, sign-out action
```

## Styling

`src/app/globals.css` defines the site's palette as Tailwind tokens (`primary` `#ff6b35`, `primary-deep` `#e85d25`, `accent` `#ffd93d`, `dark` `#1a1a1a`, `darker` `#0f0f0f`, `light` `#e0e0e0`) and ports its components: `.btn` variants, `.card`, `.text-gradient`, `.eyebrow`, `.label` and the navbar. Breakpoints follow the site too: the nav collapses into a slide-down menu at 1024px, grids stack at 900 and 768px, and spacing tightens at 480px.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build and server |
| `npm run lint` | ESLint |
| `npm run typecheck` | Route type generation plus `tsc` |
| `npm test` | Unit tests (Node's built-in test runner) |

## Deploying

- Set the environment variables at runtime. `APP_URL` must be the public origin, because redirect URIs are built from it, not from the incoming request. That keeps sign-in working behind a reverse proxy.
- Over HTTPS, cookies get the `Secure` flag and the `__Host-` prefix automatically.
- Sessions are stateless (cookie only), so any number of instances can serve traffic without shared storage.

## Not built yet

- Project data: the projects page is an empty state until the portal API exists.
- Back-channel logout: a sign-out elsewhere in SSO takes effect at the next token refresh, within the access-token lifetime (5 minutes by default), not instantly.

## License

[Apache License 2.0](LICENSE)
