import { ArrowUpRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { ProjectCard } from "@/components/site/project-card";
import { SectionHead } from "@/components/site/section-head";
import type { Project, SiteContent } from "@/lib/types";

/**
 * Six films, chosen upstream so the grid always fills: 6 -> 3x2, 2x3, 1x6.
 * The full archive and its filters live on /work; this section stays one idea.
 */
export function FilmsSection({
  content,
  projects,
  total,
}: {
  content: SiteContent["work"];
  projects: Project[];
  /** How many films exist in all, so the link never claims a stale count. */
  total?: number;
}) {
  const rest = typeof total === "number" && total > projects.length ? total : null;
  return (
    <section id="work" className="shell scroll-mt-24 py-20 md:py-28">
      <SectionHead
        index=""
        title={content.title}
        intro={content.intro}
        action={
          <ButtonLink href="/work" variant="outline" size="md" className="display-tight">
            {rest ? `See all ${rest}` : "See every film"}
            <ArrowUpRight size={16} strokeWidth={1.5} />
          </ButtonLink>
        }
      />

      {projects.length ? (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-3">
          {projects.map((project, i) => (
            <ProjectCard key={project.id} project={project} priority={i < 3} />
          ))}
        </div>
      ) : (
        <p className="mt-8 text-[15px] leading-[1.75] text-ink/80">
          Nothing is up here yet. I&apos;m still putting the archive back together.
        </p>
      )}
    </section>
  );
}
