import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
import { BadgeCheck, ExternalLink, KeyRound, LogOut } from "lucide-react";
import { IconBadge } from "@/components/icon-badge";
import { CardSkeleton, PageHeader } from "@/components/page-header";
import { signOut } from "@/lib/auth/actions";
import { requireUser } from "@/lib/auth/dal";
import { accountConsoleUrl } from "@/lib/auth/oidc";

export const metadata: Metadata = { title: "Account" };

export default function AccountPage() {
  return (
    <>
      <PageHeader
        eyebrow="Account"
        title="Your account"
        description="Your profile and sign-in are managed by Skill-Wanderer SSO."
      />

      <div className="grid grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] items-start gap-6 max-[900px]:grid-cols-1">
        <Suspense fallback={<CardSkeleton className="min-h-[360px]" />}>
          <ProfileCard />
        </Suspense>
        <Suspense fallback={<CardSkeleton />}>
          <SecurityCard />
        </Suspense>
      </div>
    </>
  );
}

async function ProfileCard() {
  const user = await requireUser();

  return (
    <section aria-labelledby="profile-heading" className="card">
      <div className="mb-8 flex items-center gap-4">
        <span className="avatar size-14 text-lg">{user.initials}</span>
        <div className="min-w-0">
          <h2 id="profile-heading" className="truncate text-xl font-semibold text-white">
            {user.name}
          </h2>
          {user.email && <p className="truncate opacity-80">{user.email}</p>}
        </div>
      </div>

      <dl className="divide-y divide-primary/10 border-y border-primary/10">
        <Row label="Username">{user.username ?? "—"}</Row>
        <Row label="Email">
          <span className="break-all">{user.email ?? "—"}</span>
          {user.emailVerified && (
            <span className="ml-2 inline-flex items-center gap-1 align-middle text-sm text-success">
              <BadgeCheck size={16} aria-hidden="true" />
              Verified
            </span>
          )}
        </Row>
        {user.organizations.length > 0 && (
          <Row label="Organization">
            <Chips items={user.organizations} />
          </Row>
        )}
        <Row label="Roles">
          {user.roles.length > 0 ? <Chips items={user.roles} /> : <span className="opacity-70">None</span>}
        </Row>
        <Row label="User ID">
          <code className="break-all font-mono text-sm opacity-80">{user.id}</code>
        </Row>
      </dl>
    </section>
  );
}

async function SecurityCard() {
  // Signed-in check first: it keeps this card out of the build-time prerender, which has no env.
  await requireUser();

  return (
    <section aria-labelledby="security-heading" className="card flex flex-col">
      <IconBadge className="mb-5">
        <KeyRound size={24} />
      </IconBadge>
      <h2 id="security-heading" className="mb-2.5 text-xl font-semibold text-white">
        Sign-in &amp; security
      </h2>
      <p className="mb-7 leading-[1.7] opacity-80">
        Update your name, password and security settings, and review where you&apos;re signed in,
        in the SSO account console.
      </p>
      <div className="flex flex-col items-start gap-4 max-md:items-center">
        <a
          href={accountConsoleUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-secondary btn-sm"
        >
          Manage SSO account
          <ExternalLink size={18} aria-hidden="true" />
        </a>
        <form action={signOut} className="contents">
          <button type="submit" className="btn btn-outline btn-sm">
            <LogOut size={18} aria-hidden="true" />
            Sign out
          </button>
        </form>
      </div>
    </section>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[9rem_minmax(0,1fr)] gap-4 py-4 max-xs:grid-cols-1 max-xs:gap-1">
      <dt className="text-sm font-bold uppercase tracking-[0.06em] text-muted">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

function Chips({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((item) => (
        <li
          key={item}
          className="rounded-full border border-primary/25 bg-primary/10 px-3 py-0.5 text-sm text-primary"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}
