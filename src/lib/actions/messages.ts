"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { query } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { optionalStr, str, type ActionState } from "./shared";

export async function sendMessageAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const name = str(formData, "name");
  const email = str(formData, "email");
  const message = str(formData, "message");

  const fieldErrors: Record<string, string> = {};
  if (!name) fieldErrors.name = "Tell me who you are.";
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) fieldErrors.email = "Enter a working email.";
  if (message.length < 12) fieldErrors.message = "A sentence or two about the project helps.";
  if (Object.keys(fieldErrors).length) {
    return { ok: false, error: "Fix the highlighted fields.", fieldErrors };
  }

  await query(
    `INSERT INTO messages (name, email, project_type, budget, message)
     VALUES ($1,$2,$3,$4,$5)`,
    [name, email, optionalStr(formData, "project_type"), optionalStr(formData, "budget"), message]
  );

  revalidatePath("/admin/messages");
  revalidatePath("/admin");
  return { ok: true, message: "Sent. You'll get a reply within two business days." };
}

export async function markMessageReadAction(formData: FormData) {
  const user = await getSessionUser();
  if (!user) redirect("/admin/login");
  const id = str(formData, "id");
  if (!id) return;
  await query("UPDATE messages SET is_read = NOT is_read WHERE id = $1", [id]);
  revalidatePath("/admin/messages");
  revalidatePath("/admin");
}

export async function deleteMessageAction(formData: FormData) {
  const user = await getSessionUser();
  if (!user) redirect("/admin/login");
  const id = str(formData, "id");
  if (!id) return;
  await query("DELETE FROM messages WHERE id = $1", [id]);
  revalidatePath("/admin/messages");
  revalidatePath("/admin");
}
