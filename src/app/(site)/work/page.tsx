import type { Metadata } from "next";
import { getProjects, getSiteContent } from "@/lib/queries";
import { ButtonLink } from "@/components/ui/button";
import { WorkIndex } from "@/components/work/work-index";
import { formatViews } from "@/lib/utils";

export const metadata: Metadata = {
  title: "The films",
  description:
    "Every short film, VlogMeyts episode, and music video on the RogerRaker channel. Roger writes, shoots, cuts, and grades all of them.",
};

export default async function WorkPage() {
  const [projects, content] = await Promise.all([
    getProjects({ publishedOnly: true }),
    getSiteContent(),
  ]);

  const totalViews = projects.reduce((sum, p) => sum + Number(p.views ?? 0), 0);
  const years = projects
    .map((p) => p.year)
    .filter((year): year is number => typeof year === "number" && year > 0);

  const stats = [
    { label: "Pieces on the channel", value: String(projects.length) },
    { label: "Views across all of them", value: totalViews > 0 ? formatViews(totalViews) : "—" },
    {
      label: "Uploaded between",
      value: years.length ? `${Math.min(...years)}–${Math.max(...years)}` : "—",
    },
  ];

  return (
    <div className="shell pt-24 pb-20 md:pt-28 md:pb-28">
      <header>
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-[54ch]">
            <h1 className="display text-[clamp(1.75rem,3.2vw,2.75rem)] text-ink">
              {content.work.title}
            </h1>
            <p className="mt-4 max-w-[62ch] text-[15px] leading-[1.75] text-ink/75 md:text-base">
              {content.work.intro}
            </p>
          </div>
          <ButtonLink href="/store" variant="outline" size="md" className="self-start md:self-auto">
            Browse the toolkit
          </ButtonLink>
        </div>

        {projects.length > 0 ? (
          <dl className="mt-8 grid grid-cols-2 gap-px border border-stroke bg-stroke sm:grid-cols-3 md:mt-10">
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                className={
                  i === 2
                    ? "col-span-2 bg-panel px-4 py-4 sm:col-span-1 md:px-5"
                    : "bg-panel px-4 py-4 md:px-5"
                }
              >
                <dt className="label">{stat.label}</dt>
                <dd className="display-tight tnum mt-1.5 text-[18px] text-ink md:text-[20px]">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        ) : null}
      </header>

      <div className="mt-12 md:mt-16">
        {projects.length === 0 ? (
          <div className="panel px-6 py-16 text-center">
            <p className="display-tight text-lg text-ink">Nothing is published yet.</p>
            <p className="mx-auto mt-2.5 max-w-[52ch] text-[15px] leading-relaxed text-ink/70">
              I&apos;m still putting the archive back together. The editing and colour tools I use
              on all of it are already up.
            </p>
            <ButtonLink href="/store" variant="glass" size="md" className="mt-7">
              Go to the toolkit
            </ButtonLink>
          </div>
        ) : (
          <WorkIndex projects={projects} categories={content.work_categories} />
        )}
      </div>
    </div>
  );
}
