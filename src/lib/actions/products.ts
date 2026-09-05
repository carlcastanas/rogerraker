"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { query, queryOne } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import type { Product } from "@/lib/types";
import {
  bool, features, list, num, optionalNum, optionalStr, str,
  type ActionState,
} from "./shared";

async function requireAdmin() {
  const user = await getSessionUser();
  if (!user) redirect("/admin/login");
  return user;
}

function revalidateProducts(slug?: string | null) {
  revalidatePath("/");
  revalidatePath("/store");
  revalidatePath("/admin/products");
  revalidatePath("/admin");
  if (slug) revalidatePath(`/store/${slug}`);
}

export async function saveProductAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  const id = str(formData, "id");
  const title = str(formData, "title");
  const description = str(formData, "description");
  const cover = str(formData, "cover_image_url");

  const fieldErrors: Record<string, string> = {};
  if (!title) fieldErrors.title = "Give the product a name.";
  if (!description) fieldErrors.description = "Describe what the buyer gets.";
  if (!cover) fieldErrors.cover_image_url = "A cover image is required.";
  const price = num(formData, "price", -1);
  if (price < 0) fieldErrors.price = "Set a price (use 0 for free).";
  if (Object.keys(fieldErrors).length) {
    return { ok: false, error: "Fix the highlighted fields.", fieldErrors };
  }

  const slug = slugify(str(formData, "slug") || title);
  const clash = await queryOne<{ id: string }>(
    "SELECT id FROM products WHERE slug = $1 AND id <> $2::uuid",
    [slug, id || "00000000-0000-0000-0000-000000000000"]
  );
  if (clash) {
    return { ok: false, error: "That slug is already in use.", fieldErrors: { slug: "Already taken." } };
  }

  const values = [
    title,
    slug,
    optionalStr(formData, "tagline"),
    description,
    price,
    cover,
    optionalStr(formData, "file_url"),
    optionalStr(formData, "category"),
    JSON.stringify(features(formData)),
    bool(formData, "is_published"),
    optionalNum(formData, "compare_at_price"),
    list(formData, "gallery_urls"),
    list(formData, "ramp"),
    optionalStr(formData, "format"),
    optionalStr(formData, "software"),
    num(formData, "rating", 5),
    num(formData, "reviews_count"),
    num(formData, "sales_count"),
    bool(formData, "featured"),
    num(formData, "sort_order"),
  ];

  if (id) {
    await query(
      `UPDATE products SET
         title=$1, slug=$2, tagline=$3, description=$4, price=$5, cover_image_url=$6,
         file_url=$7, category=$8, features=$9::jsonb, is_published=$10,
         compare_at_price=$11, gallery_urls=$12, ramp=$13, format=$14, software=$15,
         rating=$16, reviews_count=$17, sales_count=$18, featured=$19, sort_order=$20,
         updated_at=NOW()
       WHERE id=$21`,
      [...values, id]
    );
  } else {
    await query(
      `INSERT INTO products
        (title, slug, tagline, description, price, cover_image_url, file_url, category,
         features, is_published, compare_at_price, gallery_urls, ramp, format, software,
         rating, reviews_count, sales_count, featured, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)`,
      values
    );
  }

  revalidateProducts(slug);
  redirect("/admin/products?saved=1");
}

export async function toggleProductPublishedAction(id: string, next: boolean) {
  await requireAdmin();
  const row = await queryOne<Pick<Product, "slug">>(
    "UPDATE products SET is_published=$2, updated_at=NOW() WHERE id=$1 RETURNING slug",
    [id, next]
  );
  revalidateProducts(row?.slug);
}

export async function deleteProductAction(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  if (!id) return;
  await query("DELETE FROM orders WHERE product_id = $1", [id]);
  await query("DELETE FROM products WHERE id = $1", [id]);
  revalidateProducts();
  redirect("/admin/products?deleted=1");
}

export async function duplicateProductAction(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  if (!id) return;
  await query(
    `INSERT INTO products (title, slug, tagline, description, price, cover_image_url, file_url,
       category, features, is_published, compare_at_price, gallery_urls, ramp, format, software,
       rating, reviews_count, sales_count, featured, sort_order)
     SELECT title || ' (copy)', slug || '-copy-' || substr(gen_random_uuid()::text, 1, 4), tagline,
       description, price, cover_image_url, file_url, category, features, FALSE, compare_at_price,
       gallery_urls, ramp, format, software, rating, 0, 0, FALSE, sort_order
     FROM products WHERE id = $1`,
    [id]
  );
  revalidateProducts();
  redirect("/admin/products?duplicated=1");
}
