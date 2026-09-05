import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { queryOne } from "./db";
import type { AdminUser } from "./types";

const COOKIE = "rr_admin";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days
const SECRET = process.env.AUTH_SECRET ?? "roger-raker-dev-secret-change-me";

function sign(payload: string) {
  return createHmac("sha256", SECRET).update(payload).digest("base64url");
}

function serialize(userId: string) {
  const payload = `${userId}.${Date.now() + MAX_AGE * 1000}`;
  return `${payload}.${sign(payload)}`;
}

function verify(token: string | undefined): string | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [userId, expires, sig] = parts;
  const expected = sign(`${userId}.${expires}`);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  if (Number(expires) < Date.now()) return null;
  return userId;
}

export async function verifyCredentials(email: string, password: string) {
  const row = await queryOne<{ id: string; email: string; name: string | null; password_hash: string }>(
    "SELECT id, email, name, password_hash FROM admin_users WHERE lower(email) = lower($1)",
    [email]
  );
  if (!row) return null;
  const ok = await bcrypt.compare(password, row.password_hash);
  if (!ok) return null;
  return { id: row.id, email: row.email, name: row.name } satisfies AdminUser;
}

export async function createSession(userId: string) {
  const store = await cookies();
  store.set(COOKIE, serialize(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(COOKIE);
}

/** Returns the signed-in admin, or null. */
export async function getSessionUser(): Promise<AdminUser | null> {
  const store = await cookies();
  const userId = verify(store.get(COOKIE)?.value);
  if (!userId) return null;
  return queryOne<AdminUser>(
    "SELECT id, email, name FROM admin_users WHERE id = $1",
    [userId]
  );
}
