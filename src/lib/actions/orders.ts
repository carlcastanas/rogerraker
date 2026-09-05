"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { query, queryOne } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { str, type ActionState } from "./shared";
import type { Product } from "@/lib/types";

function reference() {
  return `RR-${Date.now().toString(36).toUpperCase().slice(-5)}${Math.random()
    .toString(36)
    .toUpperCase()
    .slice(2, 5)}`;
}

/**
 * Dummy checkout. No processor is called — the card fields are for show and the
 * order is written straight to the database as completed. Swap this body for a
 * Stripe / Paddle session when a real processor is connected.
 */
export async function placeOrderAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const slug = str(formData, "slug");
  const email = str(formData, "customer_email");
  const name = str(formData, "customer_name");

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return { ok: false, error: "Enter an email we can send the download to." };
  }

  const product = await queryOne<Product>(
    "SELECT * FROM products WHERE slug = $1 AND is_published",
    [slug]
  );
  if (!product) return { ok: false, error: "That product is no longer available." };

  const ref = reference();
  await query(
    `INSERT INTO orders (product_id, customer_email, amount, status, customer_name, payment_method, reference)
     VALUES ($1,$2,$3,'completed',$4,$5,$6)`,
    [product.id, email, product.price, name || null, str(formData, "payment_method") || "card", ref]
  );
  await query("UPDATE products SET sales_count = sales_count + 1 WHERE id = $1", [product.id]);

  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  redirect(`/checkout/success?ref=${ref}`);
}

export async function updateOrderStatusAction(formData: FormData) {
  const user = await getSessionUser();
  if (!user) redirect("/admin/login");
  const id = str(formData, "id");
  const status = str(formData, "status");
  if (!id || !["completed", "pending", "refunded", "failed"].includes(status)) return;
  await query("UPDATE orders SET status = $2 WHERE id = $1", [id, status]);
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
}

export async function deleteOrderAction(formData: FormData) {
  const user = await getSessionUser();
  if (!user) redirect("/admin/login");
  const id = str(formData, "id");
  if (!id) return;
  await query("DELETE FROM orders WHERE id = $1", [id]);
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
}
