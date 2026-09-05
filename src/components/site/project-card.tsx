import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn, formatViews } from "@/lib/utils";
import type { Project } from "@/lib/types";

/**
 * A film on the channel. The thumbnail is Roger's own, always 16:9 — both
 * `maxresdefault` (1280x720) and the older `mqdefault` (320x180) share that
 * ratio, so a low-res source fills the frame instead of letterboxing. The
 * panel underneath carries the title, so a soft thumbnail never leaves the
 * card looking broken or unreadable.
 */
export function ProjectCard({
  project,
  priority = false,
  className,
}: {
  project: Project;
  priority?: boolean;
  className?: string;
}) {
  const views = Number(project.views);

  return (
    <Link
      href={`/work/${project.slug}`}
      className={cn(
        "panel group flex h-full flex-col overflow-hidden rounded-[2px] transition-colors duration-300 hover:border-stroke-strong",
        className
      )}
    >
      <div className="relative aspect-video w-full overflow-hidden bg-panel-2">
        <Image
          src={project.cover_image_url}
          alt={`Thumbnail for ${project.title}`}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-[900ms] ease-out-expo group-hover:scale-[1.03]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background: "linear-gradient(180deg, rgba(8,8,10,0) 62%, rgba(8,8,10,.72) 100%)",
          }}
        />
        {Number.isFinite(views) && views > 0 ? (
          <span className="absolute bottom-2.5 right-2.5 rounded-[2px] border border-stroke-strong bg-void/75 px-2 py-0.5 text-[12px] leading-5 text-ink backdrop-blur-sm">
            <span className="tnum">{formatViews(views)}</span> views
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-4 md:p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="display-tight text-[17px] leading-snug text-ink transition-colors group-hover:text-cyan md:text-[19px]">
            {project.title}
          </h3>
          <span
            aria-hidden="true"
            className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-[2px] border border-stroke text-faint transition-colors group-hover:border-cyan/60 group-hover:text-cyan"
          >
            <ArrowUpRight size={15} strokeWidth={1.5} />
          </span>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 pt-4 text-[13px] leading-5">
          <span className="truncate text-cyan">{project.category ?? project.role}</span>
          {project.year ? <span className="tnum shrink-0 text-muted">{project.year}</span> : null}
        </div>
      </div>
    </Link>
  );
}
