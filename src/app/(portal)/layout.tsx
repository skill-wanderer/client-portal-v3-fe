import type { ReactNode } from "react";

/** Shell for signed-in pages. Access is enforced by the proxy and by requireUser() in each page. */
export default function PortalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="page-glow flex-1">
      <main
        id="main"
        className="mx-auto w-full max-w-[1200px] px-5 pb-24 pt-[130px] max-md:px-4 max-md:pb-16 max-md:pt-[110px]"
      >
        {children}
      </main>
    </div>
  );
}
