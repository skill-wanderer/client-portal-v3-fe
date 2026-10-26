import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, FolderKanban, LifeBuoy, UserRound } from "lucide-react";
import { IconBadge } from "@/components/icon-badge";
import { CardSkeleton, PageHeader, PageHeaderSkeleton } from "@/components/page-header";
import { requireUser } from "@/lib/auth/dal";
import { GUILD_MASTER_EMAIL, siteLinks } from "@/lib/site";

export const metadata: Metadata = { title: "Dashboard" };

// The client journey, as described on skill-wanderer.com.
const steps = [
  {
    title: "Tell us your idea",
    text: "Send a short message or email Quan. He reads it himself and replies with a time for one short call.",
  },
  {
    title: "Get a free working prototype",
    text: "If it's a good fit, we build a first version you can click through. React to something real. If it's not right, walk away and owe nothing.",
  },
  {
    title: "Launch and grow together",
    text: "No development fee. A monthly fee covers hosting, maintenance, support and occasional changes, and we stay as your tech partner. Leave anytime and take your project with you.",
  },
];

export default function DashboardPage() {
  return (
    <>
      <Suspense fallback={<PageHeaderSkeleton />}>
        <Welcome />
      </Suspense>

      <section aria-label="Overview" className="grid grid-cols-3 gap-6 max-lg:grid-cols-2 max-md:grid-cols-1">
        <article className="card card-hover flex flex-col">
          <IconBadge className="mb-5">
            <FolderKanban size={24} />
          </IconBadge>
          <h2 className="mb-2.5 text-xl font-semibold text-white">Your projects</h2>
          <p className="mb-6 flex-1 leading-[1.7] opacity-80">
            No active projects yet. Prototypes, milestones and launch details will appear here as we
            work together.
          </p>
          <Link href="/projects" className="inline-flex items-center gap-1.5 font-semibold no-underline hover:underline">
            View projects
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </article>

        <Suspense fallback={<CardSkeleton />}>
          <AccountCard />
        </Suspense>

        <article className="card card-hover flex flex-col max-lg:col-span-2 max-md:col-span-1">
          <IconBadge className="mb-5">
            <LifeBuoy size={24} />
          </IconBadge>
          <h2 className="mb-2.5 text-xl font-semibold text-white">Need a hand?</h2>
          <p className="mb-6 flex-1 leading-[1.7] opacity-80">
            Questions about your project, billing or anything else? Email Quan directly.
          </p>
          <a
            href={`mailto:${GUILD_MASTER_EMAIL}`}
            className="inline-flex items-center gap-1.5 break-all font-semibold no-underline hover:underline"
          >
            {GUILD_MASTER_EMAIL}
          </a>
        </article>
      </section>

      <section aria-labelledby="how-it-works" className="mt-24 max-md:mt-16">
        <div className="mx-auto mb-12 max-w-[800px] text-center">
          <h2
            id="how-it-works"
            className="mb-4 text-[clamp(1.75rem,4vw,2.4rem)] font-bold leading-tight text-primary"
          >
            How it works for your project
          </h2>
          <p className="text-[1.1rem] leading-[1.7] opacity-85">
            Three simple steps. You can stop after any of them.
          </p>
        </div>
        <ol className="grid grid-cols-3 gap-6 max-[900px]:mx-auto max-[900px]:max-w-[600px] max-[900px]:grid-cols-1">
          {steps.map((step, index) => (
            <li key={step.title} className="card card-hover">
              <span className="step-number mb-[18px]">{index + 1}</span>
              <h3 className="mb-2.5 text-xl font-semibold text-white">{step.title}</h3>
              <p className="leading-[1.7] opacity-80">{step.text}</p>
            </li>
          ))}
        </ol>
        <p className="mt-10 text-center">
          <a href={siteLinks.howItWorks} className="inline-flex items-center gap-1.5 font-semibold no-underline hover:underline">
            Read the full details
            <ArrowRight size={16} aria-hidden="true" />
          </a>
        </p>
      </section>
    </>
  );
}

async function Welcome() {
  const user = await requireUser();
  return (
    <PageHeader
      eyebrow="Dashboard"
      title={`Welcome back, ${user.firstName}!`}
      description="This is your home for everything you build with Skill-Wanderer."
    />
  );
}

async function AccountCard() {
  const user = await requireUser();
  return (
    <article className="card card-hover flex flex-col">
      <IconBadge className="mb-5">
        <UserRound size={24} />
      </IconBadge>
      <h2 className="mb-2.5 text-xl font-semibold text-white">Your account</h2>
      <div className="mb-6 flex-1 leading-[1.7]">
        <p className="truncate font-semibold text-white">{user.name}</p>
        {user.email && <p className="truncate opacity-80">{user.email}</p>}
      </div>
      <Link href="/account" className="inline-flex items-center gap-1.5 font-semibold no-underline hover:underline">
        Account details
        <ArrowRight size={16} aria-hidden="true" />
      </Link>
    </article>
  );
}
