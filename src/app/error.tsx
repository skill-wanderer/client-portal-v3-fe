"use client";

import Link from "next/link";
import { useEffect } from "react";
import { GUILD_MASTER_EMAIL } from "@/lib/site";

export default function Error({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main
      id="main"
      className="hero-glow flex flex-1 items-center justify-center px-5 pb-20 pt-[140px] text-center max-md:pt-[120px]"
    >
      <div className="max-w-[560px]">
        <p className="eyebrow mb-4">Something went wrong</p>
        <h1 className="text-gradient mb-5 text-[clamp(2rem,5vw,3rem)] font-extrabold leading-[1.15]">
          We hit a bump on the path
        </h1>
        <p className="mb-10 text-[1.1rem] leading-[1.7] opacity-85">
          Please try again. If it keeps happening, email{" "}
          <a href={`mailto:${GUILD_MASTER_EMAIL}`}>{GUILD_MASTER_EMAIL}</a>.
        </p>
        <div className="flex flex-wrap justify-center gap-4 max-md:flex-col max-md:items-center">
          <button type="button" onClick={() => retry()} className="btn btn-primary">
            Try again
          </button>
          <Link href="/" className="btn btn-secondary">
            Go to the portal home
          </Link>
        </div>
      </div>
    </main>
  );
}
