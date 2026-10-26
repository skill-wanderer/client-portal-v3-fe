import type { ReactNode } from "react";

/** The tinted square icon used at the top of cards (the site's .rich-menu-icon look). */
export function IconBadge({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={`flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ${className}`}
      aria-hidden="true"
    >
      {children}
    </span>
  );
}
