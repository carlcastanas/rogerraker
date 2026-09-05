import { Pool, types } from "pg";

// NUMERIC comes back as a string by default; the app wants numbers.
types.setTypeParser(1700, (v) => (v === null ? null : Number(v)));

const globalForDb = globalThis as unknown as { __rrPool?: Pool };

export const pool =
  globalForDb.__rrPool ??
  new Pool({
    connectionString:
      process.env.DATABASE_URL ??
      "postgresql://localhost:5432/roger_raker",
    max: 10,
    idleTimeoutMillis: 30_000,
  });

if (process.env.NODE_ENV !== "production") globalForDb.__rrPool = pool;

export async function query<T = Record<string, unknown>>(
  text: string,
  params: unknown[] = []
): Promise<T[]> {
  const res = await pool.query(text, params);
  return res.rows as T[];
}

export async function queryOne<T = Record<string, unknown>>(
  text: string,
  params: unknown[] = []
): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}
