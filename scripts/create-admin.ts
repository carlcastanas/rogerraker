/* Creates or updates an admin panel login.
 *
 * scripts/seed.ts is for local demo data only and its password is in the public
 * repository, so production admins are created with this instead. Nothing here
 * is ever written to source.
 *
 * Usage on the server:
 *   cd /srv/rogerraker
 *   ADMIN_EMAIL=roger@example.com ADMIN_PASSWORD='...' ADMIN_NAME='Roger Raker' \
 *     npx tsx scripts/create-admin.ts
 *
 * Re-running with the same email resets that account's password.
 */
import "dotenv/config";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const email = process.env.ADMIN_EMAIL?.trim();
const password = process.env.ADMIN_PASSWORD;
const name = process.env.ADMIN_NAME?.trim() ?? null;

if (!email || !password) {
  console.error("Set ADMIN_EMAIL and ADMIN_PASSWORD in the environment.");
  process.exit(1);
}
if (password.length < 12) {
  console.error("Use a password of at least 12 characters.");
  process.exit(1);
}

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ?? "postgresql://localhost:5432/roger_raker",
});

async function main() {
  const hash = await bcrypt.hash(password!, 12);
  const { rows } = await pool.query(
    `INSERT INTO admin_users (email, password_hash, name)
     VALUES ($1, $2, $3)
     ON CONFLICT (email) DO UPDATE
       SET password_hash = EXCLUDED.password_hash,
           name = COALESCE(EXCLUDED.name, admin_users.name)
     RETURNING id, email, (xmax = 0) AS created`,
    [email!.toLowerCase(), hash, name]
  );
  const row = rows[0];
  console.log(
    `${row.created ? "Created" : "Updated"} admin ${row.email}. Sign in at /admin/login.`
  );
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
