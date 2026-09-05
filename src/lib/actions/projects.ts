"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { query, queryOne } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import {
  bool, list, num, optionalNum, optionalStr, str, type ActionState,
} from "./shared";

async function requireAdmin() {
  const user = await getSessionUser();
  if (!user) redirect("/admin/login");
  return user;
}

function revalidateProjects(slug?: string | null) {
  revalidatePath("/");
  revalidatePath("/work");
  revalidatePath("/admin/projects");
  revalidatePath("/admin");
  if (slug) revalidatePath(`/work/${slug}`);
}

export async function saveProjectAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  const id = str(formData, "id");
  const title = str(formData, "title");
  const description = str(formData, "description");
  const cover = str(formData, "cover_image_url");

  const fieldErrors: Record<string, string> = {};
  if (!title) fieldErrors.title = "Give the project a title.";
  if (!description) fieldErrors.description = "Write a short description.";
  if (!cover) fieldErrors.cover_image_url = "A cover image is required.";
  if (Object.keys(fieldErrors).length) {
    return { ok: false, error: "Fix the highlighted fields.", fieldErrors };
  }

  const slug = slugify(str(formData, "slug") || title);
  const clash = await queryOne<{ id: string }>(
    "SELECT id FROM projects WHERE slug = $1 AND id <> $2::uuid",
    [slug, id || "00000000-0000-0000-0000-000000000000"]
  );
  if (clash) {
    return { ok: false, error: "That slug is already in use.", fieldErrors: { slug: "Already taken." } };
  }

  const values = [
    title,
    slug,
    description,
    optionalStr(formData, "category"),
    cover,
    list(formData, "gallery_urls"),
    optionalStr(formData, "client"),
    bool(formData, "featured"),
    optionalNum(formData, "year"),
    optionalStr(formData, "role"),
    list(formData, "scope"),
    bool(formData, "is_published"),
    num(formData, "sort_order"),
    optionalStr(formData, "youtube_id"),
    num(formData, "views"),
  ];

  if (id) {
    await query(
      `UPDATE projects SET
         title=$1, slug=$2, description=$3, category=$4, cover_image_url=$5, gallery_urls=$6,
         client=$7, featured=$8, year=$9, role=$10, scope=$11, is_published=$12, sort_order=$13,
         youtube_id=$14, views=$15, updated_at=NOW()
       WHERE id=$16`,
      [...values, id]
    );
  } else {
    await query(
      `INSERT INTO projects
        (title, slug, description, category, cover_image_url, gallery_urls, client, featured,
         year, role, scope, is_published, sort_order, youtube_id, views)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
      values
    );
  }

  revalidateProjects(slug);
  redirect("/admin/projects?saved=1");
}

export async function toggleProjectPublishedAction(id: string, next: boolean) {
  await requireAdmin();
  const row = await queryOne<{ slug: string }>(
    "UPDATE projects SET is_published=$2, updated_at=NOW() WHERE id=$1 RETURNING slug",
    [id, next]
  );
  revalidateProjects(row?.slug);
}

export async function deleteProjectAction(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  if (!id) return;
  await query("DELETE FROM projects WHERE id = $1", [id]);
  revalidateProjects();
  redirect("/admin/projects?deleted=1");
}
