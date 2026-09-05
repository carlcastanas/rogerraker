import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ChevronLeft, Play } from "lucide-react";
import { getAdjacentProjects, getProjectBySlug } from "@/lib/queries";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { ProjectGallery } from "@/components/work/project-gallery";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project || !project.is_published) {
    return { title: "Not found" };
  }
  const description = project.description.slice(0, 180);
  return {
    title: project.title,
    description,
    openGraph: {
      title: project.title,
      description,
      type: "article",
      images: [{ url: project.cover_image_url, alt: `Thumbnail for ${project.title}` }],
    },
  };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project || !project.is_published) notFound();

  const { prev, next } = await getAdjacentProjects(slug);
  const gallery = project.gallery_urls ?? [];
  const views = Number(project.views ?? 0);
  const watchUrl = project.youtube_id
    ? `https://www.youtube.com/watch?v=${project.youtube_id}`
    : null;

  const facts = [
    { term: "Year", detail: project.year === null ? null : String(project.year) },
    { term: "Kind", detail: project.category },
    { term: "Role", detail: project.role },
    { term: "Views", detail: views > 0 ? views.toLocaleString("en-PH") : null },
    { term: "Channel", detail: project.client },
  ].filter((fact): fact is { term: string; detail: string } => Boolean(fact.detail));

  return (
    <article className="shell pt-24 pb-20 md:pt-28 md:pb-28">
      <Link
        href="/work"
        className="inline-flex items-center gap-1.5 text-[13px] text-muted transition-colors hover:text-cyan"
      >
        <ChevronLeft size={14} strokeWidth={1.5} aria-hidden />
        All the films
      </Link>

      <header className="mt-6">
        {project.category ? <p className="label text-cyan">{project.category}</p> : null}
        <h1 className="display mt-2 text-[clamp(1.75rem,3.2vw,2.75rem)] text-ink">
          {project.title}
        </h1>
      </header>

      <div className="mt-8 grid gap-8 md:mt-10 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] lg:gap-10">
        <div className="min-w-0">
          {watchUrl ? (
            <a
              href={watchUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="group grain relative block aspect-video w-full overflow-hidden border border-stroke transition-colors hover:border-stroke-strong"
            >
              <Image
                src={project.cover_image_url}
                alt={`Thumbnail for ${project.title}`}
                fill
                priority
                sizes="(min-width: 1024px) 800px, 100vw"
                className="object-cover"
              />
              <span
                aria-hidden="true"
                className="absolute inset-0 z-[2] bg-void/25 transition-colors duration-300 group-hover:bg-void/10"
              />
              <span className="absolute inset-0 z-[3] flex items-center justify-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-[2px] border border-ink/25 bg-void/70 text-ink backdrop-blur-sm transition-colors duration-300 group-hover:border-cyan/70 group-hover:text-cyan">
                  <Play size={20} strokeWidth={1.5} aria-hidden className="ml-0.5 fill-current" />
                </span>
              </span>
              <span className="sr-only">Watch {project.title} on YouTube</span>
            </a>
          ) : (
            <div className="grain relative aspect-video w-full overflow-hidden border border-stroke">
              <Image
                src={project.cover_image_url}
                alt={`Thumbnail for ${project.title}`}
                fill
                priority
                sizes="(min-width: 1024px) 800px, 100vw"
                className="object-cover"
              />
            </div>
          )}

          <p className="mt-7 max-w-[62ch] text-[16px] leading-[1.8] text-ink/80 md:mt-8 md:text-[17px]">
            {project.description}
          </p>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="panel rounded-[2px]">
            {watchUrl ? (
              <div className="border-b border-stroke p-5">
                <ButtonLink
                  href={watchUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  variant="primary"
                  size="lg"
                  className="w-full"
                >
                  <Play size={16} strokeWidth={1.5} aria-hidden className="fill-current" />
                  Watch on YouTube
                </ButtonLink>
                <p className="mt-3 text-[12px] leading-relaxed text-faint">
                  Opens the video on my YouTube channel.
                </p>
              </div>
            ) : null}

            <dl>
              {facts.map((fact) => (
                <div
                  key={fact.term}
                  className="flex items-baseline gap-4 border-b border-stroke px-5 py-3.5 last:border-b-0"
                >
                  <dt className="label w-20 shrink-0">{fact.term}</dt>
                  <dd className="tnum min-w-0 flex-1 text-[14px] text-ink">{fact.detail}</dd>
                </div>
              ))}
            </dl>

            {project.scope.length > 0 ? (
              <div className="border-t border-stroke px-5 py-4">
                <p className="label">What I did on it</p>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {project.scope.map((item) => (
                    <Badge key={item}>{item}</Badge>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </aside>
      </div>

      {gallery.length > 0 ? (
        <section className="mt-16 md:mt-20">
          <div className="flex items-baseline justify-between gap-4 border-b border-stroke pb-3">
            <h2 className="display-tight text-[15px] text-ink">Frames from it</h2>
            <span className="tnum text-[12px] text-faint">
              {gallery.length} {gallery.length === 1 ? "frame" : "frames"}
            </span>
          </div>
          <ProjectGallery images={gallery} title={project.title} />
        </section>
      ) : null}

      <section className="panel mt-16 rounded-[2px] px-6 py-10 md:mt-20 md:px-10 md:py-12">
        <h2 className="display max-w-[22ch] text-[clamp(1.4rem,2.4vw,2rem)] text-ink">
          Want to cut something like this?
        </h2>
        <p className="mt-4 max-w-[58ch] text-[15px] leading-[1.75] text-ink/75">
          The LUTs, transitions, sound beds, and project files I used on this one are up in the
          toolkit. Everything there came off work you can watch.
        </p>
        <ButtonLink href="/store" variant="primary" size="lg" className="mt-7">
          Browse the toolkit
        </ButtonLink>
      </section>

      {prev || next ? (
        <nav
          aria-label="More from the channel"
          className="mt-14 grid gap-px border border-stroke bg-stroke sm:grid-cols-2"
        >
          {prev ? (
            <Link
              href={`/work/${prev.slug}`}
              className="group flex items-center gap-3 bg-panel px-5 py-5 transition-colors hover:bg-panel-2"
            >
              <ArrowLeft
                size={16}
                strokeWidth={1.5}
                aria-hidden
                className="shrink-0 text-faint transition-colors group-hover:text-cyan"
              />
              <span className="min-w-0">
                <span className="label block">Previous</span>
                <span className="display-tight mt-1 block truncate text-[15px] text-ink">
                  {prev.title}
                </span>
              </span>
            </Link>
          ) : (
            <span className="bg-panel" />
          )}
          {next ? (
            <Link
              href={`/work/${next.slug}`}
              className="group flex items-center justify-end gap-3 bg-panel px-5 py-5 text-right transition-colors hover:bg-panel-2"
            >
              <span className="min-w-0">
                <span className="label block">Next</span>
                <span className="display-tight mt-1 block truncate text-[15px] text-ink">
                  {next.title}
                </span>
              </span>
              <ArrowRight
                size={16}
                strokeWidth={1.5}
                aria-hidden
                className="shrink-0 text-faint transition-colors group-hover:text-cyan"
              />
            </Link>
          ) : (
            <span className="bg-panel" />
          )}
        </nav>
      ) : null}
    </article>
  );
}
