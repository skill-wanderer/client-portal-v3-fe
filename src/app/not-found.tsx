import Link from "next/link";

export default function NotFound() {
  return (
    <main
      id="main"
      className="hero-glow flex flex-1 items-center justify-center px-5 pb-20 pt-[140px] text-center max-md:pt-[120px]"
    >
      <div className="max-w-[560px]">
        <p className="eyebrow mb-4">404</p>
        <h1 className="text-gradient mb-5 text-[clamp(2rem,5vw,3rem)] font-extrabold leading-[1.15]">
          This path leads nowhere
        </h1>
        <p className="mb-10 text-[1.1rem] leading-[1.7] opacity-85">
          The page you&apos;re looking for doesn&apos;t exist or has moved.
        </p>
        <Link href="/" className="btn btn-primary">
          Back to the portal
        </Link>
      </div>
    </main>
  );
}
