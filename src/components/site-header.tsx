"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type MouseEvent, type ReactNode } from "react";

/**
 * Fixed top bar matching skill-wanderer.com: it tightens on scroll and collapses
 * into a slide-down panel at 1024px and below. `children` are the nav items,
 * which stream in once the session is known.
 */
export function SiteHeader({ children }: { children: ReactNode }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  // Close the mobile panel once a link inside it has been followed.
  const closeOnNavigate = (event: MouseEvent<HTMLDivElement>) => {
    if ((event.target as Element).closest("a")) setMenuOpen(false);
  };

  return (
    <>
      <header className={`site-nav${scrolled ? " is-scrolled" : ""}`}>
        <nav className="nav-container" aria-label="Main">
          <Link href="/" className="nav-logo" aria-label="Skill-Wanderer Client Portal home">
            <Image src="/skill-wanderer-favicon.svg" alt="" width={30} height={30} unoptimized />
            SKILL-WANDERER
            <span className="nav-badge max-xs:hidden">Client Portal</span>
          </Link>

          <button
            type="button"
            className="nav-toggle"
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
            aria-controls="site-nav-links"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span />
            <span />
            <span />
          </button>

          <div
            id="site-nav-links"
            className={`nav-links${menuOpen ? " is-open" : ""}`}
            onClick={closeOnNavigate}
          >
            {children}
          </div>
        </nav>
      </header>

      {menuOpen && (
        <div
          className="nav-backdrop min-[1025px]:hidden"
          aria-hidden="true"
          onClick={() => setMenuOpen(false)}
        />
      )}
    </>
  );
}
