import { GUILD_MASTER_EMAIL, REPO_URL, siteLinks } from "@/lib/site";

const footerLinks = [
  { href: siteLinks.home, label: "Skill-Wanderer" },
  { href: siteLinks.workWithUs, label: "Work With Us" },
  { href: siteLinks.howItWorks, label: "How It Works" },
  { href: siteLinks.projects, label: "Client Projects" },
  { href: siteLinks.contact, label: "Contact" },
  { href: siteLinks.privacy, label: "Privacy Policy" },
  { href: siteLinks.terms, label: "Terms of Service" },
  { href: siteLinks.cookies, label: "Cookie Policy" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-primary/20 bg-darker px-5 pb-[30px] pt-[60px]">
      <div className="mx-auto max-w-[1200px] text-center">
        <p className="mx-auto mb-3 max-w-[720px] text-[0.95rem] leading-[1.7] opacity-85">
          A social enterprise in the making. We build affordable websites and AI tools for small
          budgets: a free working prototype first, no development fee and no lock-in. That work
          keeps practical education free for everyone who keeps learning.
        </p>
        <p className="mb-[30px] text-[0.95rem] opacity-85">
          Email the Guild Master:{" "}
          <a href={`mailto:${GUILD_MASTER_EMAIL}`} className="font-semibold no-underline hover:underline">
            {GUILD_MASTER_EMAIL}
          </a>
        </p>

        <nav
          aria-label="Footer"
          className="mb-[30px] flex flex-wrap items-center justify-center gap-x-7 gap-y-4 max-md:grid max-md:grid-cols-2 max-md:justify-items-center max-md:gap-x-5 max-md:gap-y-3.5"
        >
          {footerLinks.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className="whitespace-nowrap text-light no-underline transition-colors duration-300 hover:text-primary"
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="mb-5 rounded-lg border border-primary/20 bg-primary/10 p-5 text-sm leading-normal">
          This portal is open source!{" "}
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium no-underline transition-colors duration-300 hover:text-primary-soft hover:underline"
          >
            <span aria-hidden="true">⚡</span> View the source code
          </a>{" "}
          and contribute to the guild&apos;s mission.
        </div>
        <p className="text-sm opacity-70">
          Licensed under the{" "}
          <a href={`${REPO_URL}/blob/main/LICENSE`} target="_blank" rel="noopener noreferrer">
            Apache License 2.0
          </a>
          .
        </p>
      </div>
    </footer>
  );
}
