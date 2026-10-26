import { Suspense } from "react";
import { ArrowRight } from "lucide-react";
import { siteLinks } from "@/lib/site";

const notices = {
  signedOut: { tone: "info", text: "You've been signed out. See you next time!" },
  denied: { tone: "error", text: "Sign-in was cancelled." },
  expired: { tone: "error", text: "Your sign-in took too long to finish. Please try again." },
  unavailable: {
    tone: "error",
    text: "We couldn't reach Skill-Wanderer SSO. Please try again in a moment.",
  },
  failed: { tone: "error", text: "We couldn't sign you in. Please try again." },
} as const;

// Signed-in visitors never see this page: the proxy sends them to /dashboard.
export default function HomePage({ searchParams }: PageProps<"/">) {
  return (
    <main
      id="main"
      className="hero-glow flex flex-1 items-center justify-center px-5 pb-20 pt-[140px] max-md:px-4 max-md:pb-[60px] max-md:pt-[120px]"
    >
      <div className="mx-auto w-full max-w-[960px] text-center">
        <p className="eyebrow mb-5 animate-fade-in-up max-md:text-[0.8rem] max-md:tracking-[0.05em]">
          Client Portal
        </p>
        <h1 className="text-gradient mb-6 animate-fade-in-up text-[clamp(2.3rem,6vw,4.2rem)] font-extrabold leading-[1.15] text-balance">
          Your project with <span className="whitespace-nowrap">Skill-Wanderer,</span> all in one
          place.
        </h1>
        <p className="mx-auto mb-10 max-w-[760px] animate-fade-in-up text-[clamp(1.05rem,2.2vw,1.25rem)] leading-[1.75] opacity-85 [animation-delay:200ms]">
          Sign in with your Skill-Wanderer account to follow your project, from the free working
          prototype to launch and beyond.
        </p>

        <Suspense fallback={null}>
          <AuthNotice searchParams={searchParams} />
        </Suspense>

        <div className="mb-8 flex animate-fade-in-up flex-wrap justify-center gap-4 [animation-delay:400ms] max-md:flex-col max-md:items-center">
          {/* Plain <a>: /auth/login redirects to Keycloak and must not be prefetched. */}
          <a href="/auth/login" className="btn btn-primary">
            Sign in to your portal
            <ArrowRight size={20} aria-hidden="true" />
          </a>
          <a href={siteLinks.home} className="btn btn-secondary">
            Visit skill-wanderer.com
          </a>
        </div>

        <ul className="check-list mb-16 flex animate-fade-in-up flex-wrap justify-center gap-x-6 gap-y-2.5 text-[0.95rem] opacity-85 [animation-delay:400ms]">
          <li>No development fee</li>
          <li>No lock-in</li>
          <li>Your project helps fund free education</li>
        </ul>

        <div className="mx-auto grid max-w-[880px] animate-fade-in-up grid-cols-2 gap-5 text-left [animation-delay:600ms] max-md:grid-cols-1">
          <article className="card card-hover flex flex-col items-start gap-3.5">
            <h2 className="label">Already working with us?</h2>
            <p className="flex-1 leading-[1.7] opacity-85">
              Sign in with your Skill-Wanderer account to see where your project stands. Forgot
              your password? You can reset it from the sign-in screen.
            </p>
            <a href="/auth/login" className="inline-flex items-center gap-1.5 font-semibold no-underline hover:underline">
              Sign in
              <ArrowRight size={16} aria-hidden="true" />
            </a>
          </article>
          <article className="card card-hover flex flex-col items-start gap-3.5">
            <h2 className="label">Have an idea to build?</h2>
            <p className="flex-1 leading-[1.7] opacity-85">
              A free working prototype first, then no development fee and prices built for small
              budgets. Your project also funds free education.
            </p>
            <a href={siteLinks.contact} className="btn btn-primary btn-sm">
              Tell Us About Your Idea
              <ArrowRight size={18} aria-hidden="true" />
            </a>
          </article>
        </div>
      </div>
    </main>
  );
}

async function AuthNotice({ searchParams }: { searchParams: PageProps<"/">["searchParams"] }) {
  const params = await searchParams;
  const reason = params.signedOut ? "signedOut" : params.authError;
  if (typeof reason !== "string") return null;

  const notice = notices[reason as keyof typeof notices] ?? notices.failed;
  return (
    <p
      role={notice.tone === "error" ? "alert" : "status"}
      className={`notice notice-${notice.tone} mx-auto mb-8 max-w-[560px]`}
    >
      {notice.text}
    </p>
  );
}
