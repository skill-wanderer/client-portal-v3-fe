import type { Metadata } from "next";
import { ArrowRight, FolderKanban } from "lucide-react";
import { IconBadge } from "@/components/icon-badge";
import { PageHeader } from "@/components/page-header";
import { siteLinks } from "@/lib/site";

export const metadata: Metadata = { title: "Projects" };

// Placeholder until the portal backend exists. Fetch projects through the DAL
// (getSession() for the access token) so the user check stays next to the data.
export default function ProjectsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Projects"
        title="Your projects"
        description="Follow each project from its first working prototype to launch."
      />

      <section className="card mx-auto flex max-w-[640px] flex-col items-center px-8 py-14 text-center max-xs:px-6 max-xs:py-10">
        <IconBadge className="mb-5 size-16 rounded-2xl">
          <FolderKanban size={30} />
        </IconBadge>
        <h2 className="mb-3 text-2xl font-semibold text-white">No projects yet</h2>
        <p className="mb-8 max-w-[440px] leading-[1.7] opacity-80">
          When we start working together, your prototypes, milestones and launch details will show
          up here.
        </p>
        <a href={siteLinks.contact} className="btn btn-primary btn-sm">
          Tell Us About Your Idea
          <ArrowRight size={18} aria-hidden="true" />
        </a>
      </section>
    </>
  );
}
