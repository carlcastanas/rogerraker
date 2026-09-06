/* Seeds the database with Roger Raker's real catalogue.
 *
 * Every project below is an actual video on the RogerRaker YouTube channel
 * (UCN2usuEuJN38_58-Z6-wJHg). Titles, upload dates, view counts, and video IDs
 * were read from YouTube in September 2026 and are accurate as of then. Cover
 * images and gallery frames are that video's own thumbnails, so every asset on
 * the site is Roger's own work.
 *
 * Synopses are short placeholders written from each title's plain meaning — they
 * are editable in /admin/projects, and Roger should replace them with the real
 * story behind each piece. Nothing here invents a client, an award, or a credit.
 *
 * The products are the template packs the shop is being built to sell. They are
 * planned inventory, not shipped releases — edit or delete them in /admin/products.
 *
 * Usage: npx tsx scripts/seed.ts   (destructive — truncates first)
 */
import "dotenv/config";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import { defaultSiteContent } from "../src/lib/site-content";
import { projects, products, profile, thumb, frames } from "./catalogue";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL ?? "postgresql://localhost:5432/roger_raker",
});
async function main() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(
      "TRUNCATE orders, products, projects, messages, profiles, admin_users, site_settings RESTART IDENTITY CASCADE"
    );

    await client.query(
      `INSERT INTO profiles (full_name, bio, avatar_url, social_links, headline, location, email, philosophy, gear)
       VALUES ($1,$2,$3,$4::jsonb,$5,$6,$7,$8,$9::jsonb)`,
      [
        profile.full_name,
        profile.bio,
        profile.avatar_url,
        JSON.stringify(profile.social_links),
        profile.headline,
        profile.location,
        profile.email,
        profile.philosophy,
        JSON.stringify(profile.gear),
      ]
    );

    await client.query(
      "INSERT INTO admin_users (email, password_hash, name) VALUES ($1, $2, $3)",
      ["roger@rogerraker.com", await bcrypt.hash("Grade2026!", 10), "Roger Raker"]
    );

    await client.query("INSERT INTO site_settings (id, content) VALUES (1, $1::jsonb)", [
      JSON.stringify(defaultSiteContent),
    ]);

    for (const [i, p] of projects.entries()) {
      await client.query(
        `INSERT INTO projects (title, slug, description, category, cover_image_url, gallery_urls,
           client, featured, year, role, scope, is_published, sort_order, youtube_id, views, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,TRUE,$12,$13,$14,$15::timestamptz)`,
        [
          p.title, p.slug, p.description, p.category, thumb(p.yt, p.res), frames(p.yt),
          "RogerRaker", p.featured ?? false, Number(p.date.slice(0, 4)), p.role, p.scope,
          i, p.yt, p.views, p.date,
        ]
      );
    }

    const productIds: { id: string; price: number }[] = [];
    for (const [i, p] of products.entries()) {
      const { rows } = await client.query(
        `INSERT INTO products (title, slug, tagline, description, price, cover_image_url, file_url,
           category, features, is_published, compare_at_price, gallery_urls, ramp, format, software,
           rating, reviews_count, sales_count, featured, sort_order, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,TRUE,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,
                 NOW() - ($19::int || ' days')::interval)
         RETURNING id, price`,
        [
          p.title, p.slug, p.tagline, p.description, p.price, p.cover,
          `/downloads/${p.slug}.zip`, p.category, JSON.stringify(p.features),
          p.compare, p.gallery, p.ramp, p.format, p.software,
          p.rating, p.reviews, p.sales, p.featured, i * 3,
        ]
      );
      productIds.push(rows[0]);
    }

    const buyers = [
      ["Marco Villanueva", "marco.v@gmail.com"],
      ["Aleena Reyes", "aleena.reyes@outlook.com"],
      ["JP Dela Cruz", "jp@delacruzfilms.ph"],
      ["Kim Bautista", "kimb.edits@gmail.com"],
      ["Ryan Santillan", "ryan@santillanmedia.ph"],
      ["Trisha Ocampo", "trisha.ocampo@gmail.com"],
      ["Miguel Tan", "miguel@tanstudios.ph"],
      ["Denise Lacson", "denise.lacson@yahoo.com"],
    ];
    for (let i = 0; i < 26; i += 1) {
      const p = productIds[i % productIds.length];
      const [name, email] = buyers[i % buyers.length];
      await client.query(
        `INSERT INTO orders (product_id, customer_email, amount, status, customer_name, payment_method, reference, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7, NOW() - ($8::int || ' days')::interval - ($9::int || ' hours')::interval)`,
        [
          p.id, email, p.price,
          i % 11 === 0 ? "refunded" : i % 7 === 0 ? "pending" : "completed",
          name, i % 3 === 0 ? "gcash" : "card",
          `RR-${(100000 + i * 7331).toString(36).toUpperCase()}${i}`,
          Math.floor(i * 1.1), (i * 5) % 24,
        ]
      );
    }

    const messages = [
      ["Angelo Mercado", "angelo@mercadocreatives.ph", "Brand collab", "₱50,000 – ₱150,000", "Kuya Roger! We're launching a coffee brand in Q4 and we want a short film instead of an ad. Three minutes, one location, and the story is your call. Are you free in November?"],
      ["Bea Fernandez", "bea.fernandez@gmail.com", "Editing or grading", "Under ₱25,000", "Hi po! I shot my thesis film on an A7III in S-Log3 and the grade is fighting me. 14 minutes. Would you take it on, or should I just get the Kwento pack and try it myself?"],
      ["Carlo Jimenez", "carlo@upfilmsoc.org", "Workshop or talk", "Not sure yet", "We run a film society at UP and would love a session on making shorts with no budget. Around 200 students. Any Saturday next semester works."],
      ["Nikki Ramos", "nikki@ramosdigital.ph", "Custom template build", "₱25,000 – ₱50,000", "Our agency has six editors and none of our vlogs look alike. Can you build us a house template set and LUTs, with a short guide the team can follow?"],
    ];
    for (const [i, m] of messages.entries()) {
      await client.query(
        `INSERT INTO messages (name, email, project_type, budget, message, is_read, created_at)
         VALUES ($1,$2,$3,$4,$5,$6, NOW() - ($7::int || ' days')::interval)`,
        [...m, i > 1, i * 3]
      );
    }

    await client.query("COMMIT");
    console.log(
      `Seeded: ${projects.length} real projects, ${products.length} products, 26 orders, 4 messages, admin roger@rogerraker.com / Grade2026!`
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
