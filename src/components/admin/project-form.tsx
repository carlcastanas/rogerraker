"use client";

import * as React from "react";
import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Field, Input, Label, Select, Textarea } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { saveProjectAction } from "@/lib/actions/projects";
import { idleState } from "@/lib/actions/shared";
import type { Project } from "@/lib/types";
import { slugify } from "@/lib/utils";
import { FormSection } from "./form-section";
import { FieldError, FormError } from "./primitives";

export function ProjectForm({
  project,
  categories,
}: {
  project?: Project | null;
  categories: string[];
}) {
  const [state, action, pending] = useActionState(saveProjectAction, idleState);
  const errors = state.fieldErrors ?? {};

  const [title, setTitle] = React.useState(project?.title ?? "");
  const [slug, setSlug] = React.useState(project?.slug ?? "");
  const [slugTouched, setSlugTouched] = React.useState(Boolean(project?.slug));
  const [cover, setCover] = React.useState(project?.cover_image_url ?? "");
  const [category, setCategory] = React.useState(project?.category ?? "");
  const [customCategory, setCustomCategory] = React.useState(
    Boolean(project?.category && !categories.includes(project.category))
  );
  const [client, setClient] = React.useState(project?.client ?? "");
  const [year, setYear] = React.useState(project?.year != null ? String(project.year) : "");
  const [scope, setScope] = React.useState((project?.scope ?? []).join("\n"));
  const [published, setPublished] = React.useState(project?.is_published ?? true);
  const [featured, setFeatured] = React.useState(project?.featured ?? false);

  const effectiveSlug = slugTouched ? slug : slugify(title);
  const scopeChips = scope
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <form action={action} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="min-w-0 space-y-6">
        <FormError>{state.error}</FormError>
        {project ? <input type="hidden" name="id" value={project.id} /> : null}

        <FormSection title="Identity" description="How the film reads on the films page.">
          <Field label="Title" htmlFor="title">
            <Input
              id="title"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Sana Merong Tayo"
              required
            />
            <FieldError>{errors.title}</FieldError>
          </Field>

          <Field label="Slug" htmlFor="slug" hint={`/work/${effectiveSlug || "…"}`}>
            <Input
              id="slug"
              name="slug"
              value={effectiveSlug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value);
              }}
              placeholder="sana-merong-tayo"
            />
            <FieldError>{errors.slug}</FieldError>
          </Field>

          <div className="space-y-2">
            <Label htmlFor="category" hint={customCategory ? "Free text" : "From site categories"}>
              Category
            </Label>
            <input type="hidden" name="category" value={category} />
            {customCategory ? (
              <Input
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Short Films"
              />
            ) : (
              <Select
                id="category"
                value={categories.includes(category) ? category : ""}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">No category</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            )}
            <button
              type="button"
              onClick={() => setCustomCategory((v) => !v)}
              className="text-[12px] text-faint transition-colors hover:text-cyan"
            >
              {customCategory ? "Pick from the site categories instead" : "Type a new category instead"}
            </button>
          </div>

          <Field label="Description" htmlFor="description">
            <Textarea
              id="description"
              name="description"
              rows={6}
              defaultValue={project?.description ?? ""}
              placeholder="What the film is about, where you shot it, and anything else worth telling."
              required
            />
            <FieldError>{errors.description}</FieldError>
          </Field>
        </FormSection>

        <FormSection title="Credits" description="The line under the title on the film page.">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Client" htmlFor="client">
              <Input
                id="client"
                name="client"
                value={client}
                onChange={(e) => setClient(e.target.value)}
                placeholder="RogerRaker"
              />
            </Field>
            <Field label="Year" htmlFor="year">
              <Input
                id="year"
                name="year"
                type="number"
                min="1900"
                max="2999"
                step="1"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="2026"
              />
            </Field>
          </div>
          <Field label="Role" htmlFor="role">
            <Input
              id="role"
              name="role"
              defaultValue={project?.role ?? ""}
              placeholder="Creator, editor"
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="YouTube video ID"
              htmlFor="youtube_id"
              hint="The part after watch?v="
            >
              <Input
                id="youtube_id"
                name="youtube_id"
                defaultValue={project?.youtube_id ?? ""}
                placeholder="l-wGeqbcPy0"
              />
            </Field>
            <Field label="Views" htmlFor="views" hint="YouTube view count">
              <Input
                id="views"
                name="views"
                type="number"
                min={0}
                step={1}
                defaultValue={project ? String(project.views) : "0"}
              />
            </Field>
          </div>
          <Field label="Scope" htmlFor="scope" hint="One per line">
            <Textarea
              id="scope"
              name="scope"
              rows={4}
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              placeholder={"Story\nDirection\nEdit"}
            />
          </Field>
        </FormSection>

        <FormSection title="Media" description="Cover frame and the gallery on the film page.">
          <Field label="Cover image URL" htmlFor="cover_image_url">
            <Input
              id="cover_image_url"
              name="cover_image_url"
              value={cover}
              onChange={(e) => setCover(e.target.value)}
              placeholder="https://…/photo.jpg"
              required
            />
            <FieldError>{errors.cover_image_url}</FieldError>
          </Field>
          <Field label="Gallery URLs" htmlFor="gallery_urls" hint="One per line">
            <Textarea
              id="gallery_urls"
              name="gallery_urls"
              rows={5}
              defaultValue={(project?.gallery_urls ?? []).join("\n")}
              placeholder={"https://…\nhttps://…"}
            />
          </Field>
        </FormSection>

        <FormSection title="Publishing" description="Visibility and position in the grid.">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-3">
              <Switch
                checked={published}
                onChange={setPublished}
                name="is_published"
                label="Published"
              />
              <span className="text-[13px] text-muted">
                {published ? "Live on the films page" : "Draft, hidden from the site"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={featured} onChange={setFeatured} name="featured" label="Featured" />
              <span className="text-[13px] text-muted">Featured</span>
            </div>
          </div>
          <Field label="Sort order" htmlFor="sort_order" hint="Lower sorts first">
            <Input
              id="sort_order"
              name="sort_order"
              type="number"
              step="1"
              defaultValue={project ? String(project.sort_order) : "0"}
              className="max-w-[140px]"
            />
          </Field>
        </FormSection>

        <div className="sticky bottom-0 z-20 flex items-center justify-end gap-3 border-t border-stroke bg-void/90 py-4 backdrop-blur-md">
          <Link
            href="/admin/projects"
            className="display-tight px-3 py-2 text-[13px] text-muted transition-colors hover:text-ink"
          >
            Cancel
          </Link>
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : project ? "Save changes" : "Create project"}
          </Button>
        </div>
      </div>

      <aside className="min-w-0">
        <div className="xl:sticky xl:top-[7.5rem]">
          <p className="label mb-2">Work card preview</p>
          <div className="panel overflow-hidden rounded-[2px]">
            <div className="relative aspect-[16/10] bg-panel-2">
              {cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={cover}
                  alt=""
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.visibility = "hidden";
                  }}
                />
              ) : (
                <span className="grid h-full w-full place-items-center text-[12px] text-faint">
                  Cover frame
                </span>
              )}
              <div className="absolute left-3 top-3 flex gap-1.5">
                {category ? <Badge tone="cyan">{category}</Badge> : null}
                {featured ? <Badge tone="ember">Featured</Badge> : null}
              </div>
              {!published ? (
                <div className="absolute right-3 top-3">
                  <Badge tone="muted">Draft</Badge>
                </div>
              ) : null}
            </div>
            <div className="p-4">
              <h3 className="display-tight text-[16px] text-ink">{title || "Untitled project"}</h3>
              <p className="tnum mt-1 text-[12px] text-faint">
                {[client || null, year || null].filter(Boolean).join(" · ") || "Channel and year"}
              </p>
              {scopeChips.length ? (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {scopeChips.slice(0, 5).map((s) => (
                    <Badge key={s} tone="muted">
                      {s}
                    </Badge>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
          <p className="mt-2 text-[12px] leading-relaxed text-faint">
            A rough read of the film card: cover, category, channel, and scope.
          </p>
        </div>
      </aside>
    </form>
  );
}
