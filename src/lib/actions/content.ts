"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { query, queryOne } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { defaultSiteContent } from "@/lib/site-content";
import type { SiteContent } from "@/lib/types";
import { list, optionalStr, str, type ActionState } from "./shared";

async function requireAdmin() {
  const user = await getSessionUser();
  if (!user) redirect("/admin/login");
  return user;
}

/** Sets `a.b.c` on a nested object, creating objects along the way. */
function setPath(target: Record<string, unknown>, path: string, value: unknown) {
  const keys = path.split(".");
  let node = target;
  for (let i = 0; i < keys.length - 1; i += 1) {
    const key = keys[i];
    if (typeof node[key] !== "object" || node[key] === null) node[key] = {};
    node = node[key] as Record<string, unknown>;
  }
  node[keys[keys.length - 1]] = value;
}

/**
 * Saves the whole site copy. Any `name="hero.headline"` style field is written
 * to that path; the repeatable groups are rebuilt from their indexed inputs.
 */
export async function saveSiteContentAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  const existing = await queryOne<{ content: SiteContent }>(
    "SELECT content FROM site_settings WHERE id = 1"
  );
  const content = structuredClone({
    ...defaultSiteContent,
    ...(existing?.content ?? {}),
  }) as unknown as Record<string, unknown>;

  for (const [key, value] of formData.entries()) {
    if (!key.includes(".") || typeof value !== "string") continue;
    setPath(content, key, value.trim());
  }

  const metricValues = formData.getAll("metric_value").map(String);
  const metricLabels = formData.getAll("metric_label").map(String);
  if (metricValues.length) {
    setPath(
      content,
      "about.metrics",
      metricValues
        .map((value, i) => ({ value: value.trim(), label: (metricLabels[i] ?? "").trim() }))
        .filter((m) => m.value || m.label)
    );
  }

  const processTitles = formData.getAll("process_title").map(String);
  const processBodies = formData.getAll("process_body").map(String);
  if (processTitles.length) {
    setPath(
      content,
      "about.process",
      processTitles
        .map((title, i) => ({ title: title.trim(), body: (processBodies[i] ?? "").trim() }))
        .filter((p) => p.title)
    );
  }

  for (const [field, path] of [
    ["project_types", "contact.project_types"],
    ["budgets", "contact.budgets"],
    ["store_categories", "store_categories"],
    ["work_categories", "work_categories"],
  ] as const) {
    if (formData.has(field)) {
      const values = list(formData, field);
      if (values.length) setPath(content, path, values);
    }
  }

  await query(
    `INSERT INTO site_settings (id, content, updated_at) VALUES (1, $1::jsonb, NOW())
     ON CONFLICT (id) DO UPDATE SET content = EXCLUDED.content, updated_at = NOW()`,
    [JSON.stringify(content)]
  );

  revalidatePath("/", "layout");
  return { ok: true, message: "Site copy updated." };
}

export async function resetSiteContentAction() {
  await requireAdmin();
  await query(
    `INSERT INTO site_settings (id, content, updated_at) VALUES (1, $1::jsonb, NOW())
     ON CONFLICT (id) DO UPDATE SET content = EXCLUDED.content, updated_at = NOW()`,
    [JSON.stringify(defaultSiteContent)]
  );
  revalidatePath("/", "layout");
  redirect("/admin/content?reset=1");
}

/** Roger's own profile — name, bio, avatar, socials, gear list. */
export async function saveProfileAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  const fullName = str(formData, "full_name");
  if (!fullName) return { ok: false, error: "A name is required.", fieldErrors: { full_name: "Required." } };

  const social = {
    x: optionalStr(formData, "social_x"),
    instagram: optionalStr(formData, "social_instagram"),
    youtube: optionalStr(formData, "social_youtube"),
    github: optionalStr(formData, "social_github"),
    linkedin: optionalStr(formData, "social_linkedin"),
  };

  const gearLabels = formData.getAll("gear_label").map(String);
  const gearItems = formData.getAll("gear_items").map(String);
  const gear = gearLabels
    .map((label, i) => ({
      label: label.trim(),
      items: (gearItems[i] ?? "")
        .split(/[\n,]/)
        .map((s) => s.trim())
        .filter(Boolean),
    }))
    .filter((g) => g.label);

  const values = [
    fullName,
    optionalStr(formData, "bio"),
    optionalStr(formData, "avatar_url"),
    JSON.stringify(social),
    optionalStr(formData, "headline"),
    optionalStr(formData, "location"),
    optionalStr(formData, "email"),
    optionalStr(formData, "philosophy"),
    JSON.stringify(gear),
  ];

  const existing = await queryOne<{ id: string }>("SELECT id FROM profiles ORDER BY created_at ASC LIMIT 1");
  if (existing) {
    await query(
      `UPDATE profiles SET full_name=$1, bio=$2, avatar_url=$3, social_links=$4::jsonb,
         headline=$5, location=$6, email=$7, philosophy=$8, gear=$9::jsonb, updated_at=NOW()
       WHERE id=$10`,
      [...values, existing.id]
    );
  } else {
    await query(
      `INSERT INTO profiles (full_name, bio, avatar_url, social_links, headline, location, email, philosophy, gear)
       VALUES ($1,$2,$3,$4::jsonb,$5,$6,$7,$8,$9::jsonb)`,
      values
    );
  }

  revalidatePath("/", "layout");
  return { ok: true, message: "Profile updated." };
}
