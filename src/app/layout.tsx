import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { HeaderNav, HeaderNavFallback } from "@/components/header-nav";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Client Portal | Skill-Wanderer",
    template: "%s | Skill-Wanderer Client Portal",
  },
  description:
    "Sign in to follow your Skill-Wanderer project, from the free working prototype to launch and beyond.",
  icons: { icon: { url: "/skill-wanderer-favicon.svg", type: "image/svg+xml" } },
  // A private portal: keep it out of search results.
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#1a1a1a",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[1100] focus:rounded-full focus:bg-primary focus:px-5 focus:py-2.5 focus:text-white"
        >
          Skip to content
        </a>
        <SiteHeader>
          {/* The header shell is static; who is signed in streams in behind this boundary. */}
          <Suspense fallback={<HeaderNavFallback />}>
            <HeaderNav />
          </Suspense>
        </SiteHeader>
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
