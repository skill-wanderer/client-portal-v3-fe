import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
}) {
  return (
    <header className="mb-12 animate-fade-in-up max-md:mb-10">
      <p className="eyebrow mb-3 max-md:text-[0.8rem] max-md:tracking-[0.05em]">{eyebrow}</p>
      <h1 className="text-gradient mb-4 text-[clamp(2rem,5vw,3rem)] font-extrabold leading-[1.15] text-balance">
        {title}
      </h1>
      {description && (
        <p className="max-w-[720px] text-[clamp(1.05rem,2vw,1.15rem)] leading-[1.75] opacity-85">
          {description}
        </p>
      )}
    </header>
  );
}

export function PageHeaderSkeleton() {
  return (
    <div className="mb-12 max-md:mb-10" aria-hidden="true">
      <div className="skeleton mb-4 h-4 w-28" />
      <div className="skeleton mb-5 h-12 w-full max-w-[520px]" />
      <div className="skeleton h-5 w-full max-w-[640px]" />
    </div>
  );
}

export function CardSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`card flex flex-col gap-4 ${className}`} aria-hidden="true">
      <div className="skeleton size-12 rounded-xl" />
      <div className="skeleton h-6 w-1/2" />
      <div className="skeleton h-4 w-full" />
      <div className="skeleton h-4 w-4/5" />
    </div>
  );
}
