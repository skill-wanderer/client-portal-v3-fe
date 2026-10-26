"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, ExternalLink, LogOut, UserRound } from "lucide-react";
import { signOut } from "@/lib/auth/actions";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/projects", label: "Projects" },
  { href: "/account", label: "Account" },
];

type NavUser = {
  name: string;
  firstName: string;
  email?: string;
  initials: string;
};

/** Signed-in navigation: portal links plus a user menu (dropdown on desktop, inline in the mobile panel). */
export function PortalNav({ user, accountConsoleUrl }: { user: NavUser; accountConsoleUrl: string }) {
  const pathname = usePathname();

  return (
    <>
      {links.map(({ href, label }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link key={href} href={href} className="nav-link" aria-current={active ? "page" : undefined}>
            {label}
          </Link>
        );
      })}

      <UserMenu user={user} accountConsoleUrl={accountConsoleUrl} />

      <div className="mobile-only pt-2">
        <div className="flex items-center justify-center gap-3">
          <span className="avatar size-10 text-sm">{user.initials}</span>
          <div className="min-w-0 text-left">
            <p className="truncate font-semibold text-white">{user.name}</p>
            {user.email && <p className="truncate text-sm text-muted">{user.email}</p>}
          </div>
        </div>
        <form action={signOut} className="mt-5 flex justify-center">
          <button type="submit" className="btn btn-outline btn-sm">
            <LogOut size={18} aria-hidden="true" />
            Sign out
          </button>
        </form>
      </div>
    </>
  );
}

function UserMenu({ user, accountConsoleUrl }: { user: NavUser; accountConsoleUrl: string }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={menuRef} className="user-menu desktop-only">
      <button
        type="button"
        className="user-trigger"
        aria-expanded={open}
        aria-controls="user-menu-panel"
        onClick={() => setOpen((value) => !value)}
      >
        <span className="avatar">{user.initials}</span>
        <span className="max-w-[10rem] truncate">{user.firstName}</span>
        <ChevronDown
          size={14}
          aria-hidden="true"
          className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>

      <div id="user-menu-panel" className={`dropdown-menu${open ? " is-open" : ""}`}>
        <div className="mx-4 mb-2 border-b border-primary/15 px-1 pb-3 pt-2">
          <p className="truncate font-semibold text-white">{user.name}</p>
          {user.email && <p className="truncate text-sm text-muted">{user.email}</p>}
        </div>
        <Link href="/account" className="menu-item" onClick={() => setOpen(false)}>
          <span className="menu-icon">
            <UserRound size={16} aria-hidden="true" />
          </span>
          Your account
        </Link>
        <a href={accountConsoleUrl} target="_blank" rel="noopener noreferrer" className="menu-item">
          <span className="menu-icon">
            <ExternalLink size={16} aria-hidden="true" />
          </span>
          Manage SSO account
        </a>
        <div className="menu-divider" />
        <form action={signOut}>
          <button type="submit" className="menu-item">
            <span className="menu-icon">
              <LogOut size={16} aria-hidden="true" />
            </span>
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}
