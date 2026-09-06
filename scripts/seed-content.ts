/* Loads Roger's catalogue into a live database, safely.
 *
 * scripts/seed.ts is the local demo seeder: it TRUNCATES every table and
 * invents orders and enquiries. Never run that against production.
 *
 * This one only touches content, upserting by slug:
 *   - profile, site copy, projects, products
 * It never writes orders, messages, or admin logins, and never deletes a row.
 * Anything Roger has edited in the admin panel is left alone unless you pass
 * --overwrite, which resets the seeded rows back to what is in this repo.
 *
 * Usage on the server:
 *   cd /srv/rogerraker && npx tsx scripts/seed-content.ts
 *   cd /srv/rogerraker && npx tsx scripts/seed-content.ts --overwrite
 */
import "dotenv/config";
import { Pool } from "pg";
import { defaultSiteContent } from "../src/lib/site-content";
import { projects, products, profile, thumb, frames } from "./catalogue";

const overwrite = process.argv.includes("--overwrite");

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ?? "postgresql://localhost:5432/roger_raker",
});

async function main() {
  const client = await pool.connect();
  let added = 0;
  let updated = 0;
  let skipped = 0;

  try {
    await client.query("BEGIN");

    // Profile: one row. Created if missing; only replaced with --overwrite.
    const existingProfile = await client.query("SELECT id FROM profiles LIMIT 1");
    if (existingProfile.rowCount === 0) {
      await client.query(
        `INSERT INTO profiles (full_name, bio, avatar_url, social_links, headline,
           location, email, philosophy, gear)
         VALUES ($1,$2,$3,$4::jsonb,$5,$6,$7,$8,$9::jsonb)`,
        [
          profile.full_name, profile.bio, profile.avatar_url,
          JSON.stringify(profile.social_links), profile.headline, profile.location,
          profile.email, profile.philosophy, JSON.stringify(profile.gear),
        ]
      );
      added += 1;
    } else if (overwrite) {
      await client.query(
        `UPDATE profiles SET full_name=$1, bio=$2, avatar_url=$3, social_links=$4::jsonb,
           headline=$5, location=$6, email=$7, philosophy=$8, gear=$9::jsonb, updated_at=NOW()
         WHERE id=$10`,
        [
          profile.full_name, profile.bio, profile.avatar_url,
          JSON.stringify(profile.social_links), profile.headline, profile.location,
          profile.email, profile.philosophy, JSON.stringify(profile.gear),
          existingProfile.rows[0].id,
        ]
      );
      updated += 1;
    } else {
      skipped += 1;
    }

    // Site copy: singleton row.
    const existingSettings = await client.query("SELECT id FROM site_settings WHERE id = 1");
    if (existingSettings.rowCount === 0 || overwrite) {
      await client.query(
        `INSERT INTO site_settings (id, content, updated_at) VALUES (1, $1::jsonb, NOW())
         ON CONFLICT (id) DO UPDATE SET content = EXCLUDED.content, updated_at = NOW()`,
        [JSON.stringify(defaultSiteContent)]
      );
      existingSettings.rowCount === 0 ? (added += 1) : (updated += 1);
    } else {
      skipped += 1;
    }

    for (const [i, p] of projects.entries()) {
      const found = await client.query("SELECT id FROM projects WHERE slug = $1", [p.slug]);
      if (found.rowCount && !overwrite) {
        skipped += 1;
        continue;
      }
      const values = [
        p.title, p.slug, p.description, p.category, thumb(p.yt, p.res), frames(p.yt), "RogerRaker",
        p.featured ?? false, Number(p.date.slice(0, 4)), p.role, p.scope, i, p.yt, p.views,
      ];
      if (found.rowCount) {
        await client.query(
          `UPDATE projects SET title=$1, description=$3, category=$4, cover_image_url=$5,
             gallery_urls=$6, client=$7, featured=$8, year=$9, role=$10, scope=$11,
             sort_order=$12, youtube_id=$13, views=$14, updated_at=NOW()
           WHERE slug=$2`,
          values
        );
        updated += 1;
      } else {
        await client.query(
          `INSERT INTO projects (title, slug, description, category, cover_image_url,
             gallery_urls, client, featured, year, role, scope, is_published, sort_order,
             youtube_id, views, created_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,TRUE,$12,$13,$14,$15::timestamptz)`,
          [...values, p.date]
        );
        added += 1;
      }
    }

    for (const [i, p] of products.entries()) {
      const found = await client.query("SELECT id FROM products WHERE slug = $1", [p.slug]);
      if (found.rowCount && !overwrite) {
        skipped += 1;
        continue;
      }
      const values = [
        p.title, p.slug, p.tagline, p.description, p.price, p.cover,
        `/downloads/${p.slug}.zip`, p.category, JSON.stringify(p.features),
        p.compare, p.gallery, p.ramp, p.format, p.software,
        p.rating, p.reviews, p.featured, i * 3,
      ];
      if (found.rowCount) {
        // sales_count is real trading data, so it is never overwritten.
        await client.query(
          `UPDATE products SET title=$1, tagline=$3, description=$4, price=$5,
             cover_image_url=$6, file_url=$7, category=$8, features=$9::jsonb,
             compare_at_price=$10, gallery_urls=$11, ramp=$12, format=$13, software=$14,
             rating=$15, reviews_count=$16, featured=$17, sort_order=$18, updated_at=NOW()
           WHERE slug=$2`,
          values
        );
        updated += 1;
      } else {
        await client.query(
          `INSERT INTO products (title, slug, tagline, description, price, cover_image_url,
             file_url, category, features, compare_at_price, gallery_urls, ramp, format,
             software, rating, reviews_count, featured, sort_order, is_published, sales_count)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10,$11,$12,$13,$14,$15,$16,$17,$18,TRUE,0)`,
          values
        );
        added += 1;
      }
    }

    await client.query("COMMIT");
    console.log(
      `Content sync complete. Added ${added}, updated ${updated}, left alone ${skipped}.` +
        (overwrite ? "" : " Pass --overwrite to reset edited rows to the repo version.")
    );
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
