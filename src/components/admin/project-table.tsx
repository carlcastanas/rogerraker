"use client";

import * as React from "react";
import Link from "next/link";
import { FolderOpen, Pencil, Plus, Search } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input, Select } from "@/components/ui/field";
import { deleteProjectAction, toggleProjectPublishedAction } from "@/lib/actions/projects";
import type { Project } from "@/lib/types";
import { ConfirmAction } from "./confirm-action";
import { EmptyState, Thumb } from "./primitives";
import { PublishToggle } from "./publish-toggle";

function RowActions({ project }: { project: Project }) {
  return (
    <div className="flex items-center justify-end gap-1.5">
      <Link
        href={`/admin/projects/${project.id}`}
        aria-label={`Edit ${project.title}`}
        className="grid h-8 w-8 place-items-center rounded-[2px] border border-stroke text-muted transition-colors hover:border-cyan/50 hover:text-cyan"
      >
        <Pencil size={15} strokeWidth={1.5} />
      </Link>
      <ConfirmAction
        action={deleteProjectAction}
        id={project.id}
        triggerLabel={`Delete ${project.title}`}
        body={`Remove "${project.title}" from the site? This can't be undone.`}
      />
    </div>
  );
}

export function ProjectTable({
  projects,
  categories,
}: {
  projects: Project[];
  categories: string[];
}) {
  const [term, setTerm] = React.useState("");
  const [category, setCategory] = React.useState("all");

  const options = React.useMemo(() => {
    const set = new Set(categories.filter(Boolean));
    projects.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set).sort();
  }, [categories, projects]);

  const filtered = React.useMemo(() => {
    const q = term.trim().toLowerCase();
    return projects.filter((p) => {
      if (category !== "all" && (p.category ?? "") !== category) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        (p.client ?? "").toLowerCase().includes(q) ||
        (p.category ?? "").toLowerCase().includes(q)
      );
    });
  }, [projects, term, category]);

  if (!projects.length) {
    return (
      <div className="panel rounded-[2px]">
        <EmptyState
          icon={FolderOpen}
          title="No films yet"
          body="Add the first film or vlog and it shows up on the films page as soon as you publish it."
          action={
            <ButtonLink href="/admin/projects/new">
              <Plus size={15} strokeWidth={1.5} />
              New project
            </ButtonLink>
          }
        />
      </div>
    );
  }

  return (
    <div className="panel rounded-[2px]">
      <div className="flex flex-wrap items-center gap-3 border-b border-stroke px-4 py-3">
        <div className="relative min-w-[200px] flex-1">
          <Search
            size={15}
            strokeWidth={1.5}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint"
          />
          <Input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Search title, client, or slug"
            aria-label="Search projects"
            className="pl-9"
          />
        </div>
        <Select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          aria-label="Filter by category"
          className="w-auto min-w-[160px]"
        >
          <option value="all">All categories</option>
          {options.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
        <p className="tnum ml-auto text-[12px] text-faint">
          {filtered.length} of {projects.length}
        </p>
      </div>

      {!filtered.length ? (
        <EmptyState
          icon={Search}
          title="Nothing matches"
          body="No project matches that search and filter. Clear one of them to see the rest."
        />
      ) : (
        <>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[840px] border-collapse text-left">
              <thead>
                <tr className="border-b border-stroke">
                  <th className="label px-4 py-2.5 font-normal">Project</th>
                  <th className="label px-4 py-2.5 font-normal">Category</th>
                  <th className="label px-4 py-2.5 font-normal">Client</th>
                  <th className="label px-4 py-2.5 text-right font-normal">Year</th>
                  <th className="label px-4 py-2.5 font-normal">Published</th>
                  <th className="label px-4 py-2.5 text-right font-normal">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stroke">
                {filtered.map((p) => (
                  <tr key={p.id} className="transition-colors hover:bg-[rgba(245,245,247,.02)]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Thumb src={p.cover_image_url} alt="" className="h-11 w-16" />
                        <div className="min-w-0">
                          <Link
                            href={`/admin/projects/${p.id}`}
                            className="display-tight block max-w-[32ch] truncate text-[14px] text-ink transition-colors hover:text-cyan"
                          >
                            {p.title}
                          </Link>
                          <span className="block max-w-[32ch] truncate text-[11px] text-faint">
                            /work/{p.slug}
                          </span>
                        </div>
                        {p.featured ? <Badge tone="ember">Featured</Badge> : null}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[13px] text-muted">{p.category ?? "—"}</td>
                    <td className="max-w-[20ch] truncate px-4 py-3 text-[13px] text-muted">
                      {p.client ?? "—"}
                    </td>
                    <td className="tnum px-4 py-3 text-right text-[13px] text-muted">
                      {p.year ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <PublishToggle
                        id={p.id}
                        published={p.is_published}
                        toggle={toggleProjectPublishedAction}
                        label={p.title}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <RowActions project={p} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="divide-y divide-stroke md:hidden">
            {filtered.map((p) => (
              <li key={p.id} className="p-4">
                <div className="flex items-start gap-3">
                  <Thumb src={p.cover_image_url} alt="" className="h-14 w-20" />
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/admin/projects/${p.id}`}
                      className="display-tight block truncate text-[14px] text-ink"
                    >
                      {p.title}
                    </Link>
                    <span className="block truncate text-[11px] text-faint">/work/{p.slug}</span>
                    <p className="tnum mt-1 text-[12px] text-muted">
                      {[p.category, p.client, p.year ? String(p.year) : null]
                        .filter(Boolean)
                        .join(" · ") || "No details yet"}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <PublishToggle
                    id={p.id}
                    published={p.is_published}
                    toggle={toggleProjectPublishedAction}
                    label={p.title}
                  />
                  <RowActions project={p} />
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
