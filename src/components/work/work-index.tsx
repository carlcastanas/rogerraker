"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ProjectCard } from "@/components/site/project-card";
import type { Project } from "@/lib/types";
import { cn, formatViews } from "@/lib/utils";

const ALL = "All";

/**
 * Every row comes out full. The leftover columns are spent at the top of the
 * grid, so the pieces that lead the archive get the wider frames and no row
 * ever ends beside an empty column.
 *
 * The grid is six columns at lg: a normal card takes two, a lead card takes
 * three, and the remainder decides how many lead cards there are. Cards stay
 * 16:9 at every width because the sources are YouTube thumbnails — any other
 * ratio would crop Roger's own framing.
 */
function spanClass(i: number, total: number) {
  const span = ["lg:col-span-2"];

  // Two columns at sm: an odd count means the first card runs full width.
  if (total % 2 === 1 && i === 0) span.push("sm:col-span-2");

  const remainder = total % 3;
  if (remainder === 2 && i < 2) span.push("lg:col-span-3");
  if (remainder === 1) {
    // One lone card fills the row; otherwise four halves make two clean rows.
    if (total === 1) span.push("lg:col-span-6");
    else if (i < 4) span.push("lg:col-span-3");
  }

  return span.join(" ");
}

export function WorkIndex({
  projects,
  categories,
}: {
  projects: Project[];
  categories: string[];
}) {
  const reduce = useReducedMotion();
  const [active, setActive] = React.useState<string>(ALL);

  const counts = React.useMemo(() => {
    const map = new Map<string, number>();
    for (const project of projects) {
      if (!project.category) continue;
      map.set(project.category, (map.get(project.category) ?? 0) + 1);
    }
    return map;
  }, [projects]);

  const tabs = React.useMemo(
    () => [ALL, ...categories.filter((c, i) => categories.indexOf(c) === i)],
    [categories]
  );

  const visible = React.useMemo(
    () => (active === ALL ? projects : projects.filter((p) => p.category === active)),
    [projects, active]
  );

  return (
    <div>
      <div className="flex flex-col gap-4 border-b border-stroke pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div
          role="group"
          aria-label="Filter the archive by kind"
          className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1"
        >
          {tabs.map((tab) => {
            const count = tab === ALL ? projects.length : counts.get(tab) ?? 0;
            const isActive = tab === active;
            return (
              <button
                key={tab}
                type="button"
                aria-pressed={isActive}
                onClick={() => setActive(tab)}
                className={cn(
                  "display-tight flex shrink-0 items-baseline gap-2 rounded-[2px] border px-3.5 py-2 text-[13px] transition-colors",
                  isActive
                    ? "border-cyan/50 bg-cyan/10 text-cyan"
                    : "border-stroke text-muted hover:border-stroke-strong hover:text-ink"
                )}
              >
                <span>{tab}</span>
                <span className={cn("tnum text-[11px]", isActive ? "text-cyan/70" : "text-faint")}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <p className="tnum shrink-0 text-[13px] text-muted">
          Showing {visible.length} of {projects.length}
        </p>
      </div>

      {visible.length === 0 ? (
        <div className="panel mt-8 px-6 py-14 text-center">
          <p className="display-tight text-lg text-ink">Nothing under {active} yet.</p>
          <p className="mx-auto mt-2.5 max-w-[52ch] text-[15px] leading-relaxed text-ink/70">
            Switch back to All to see everything that&apos;s up.
          </p>
          <button
            type="button"
            onClick={() => setActive(ALL)}
            className="display-tight mt-7 rounded-[2px] border border-stroke-strong px-4 py-2 text-[13px] text-ink transition-colors hover:border-cyan/60 hover:text-cyan"
          >
            Show everything
          </button>
        </div>
      ) : (
        <motion.div
          layout={!reduce}
          className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 md:gap-6 lg:grid-cols-6"
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {visible.map((project, i) => (
              <motion.div
                key={project.slug}
                layout={!reduce}
                initial={reduce ? false : { opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reduce ? { opacity: 1 } : { opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className={cn("min-w-0", spanClass(i, visible.length))}
              >
                <ProjectCard project={project} priority={i < 4} className="aspect-[16/9]" />
                <div className="mt-2.5 flex items-baseline justify-between gap-3">
                  <span className="tnum text-[12px] text-faint">{project.year ?? ""}</span>
                  <span className="tnum text-[12px] text-muted">
                    {formatViews(Number(project.views ?? 0))} views
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
