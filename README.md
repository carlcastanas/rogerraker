# Roger Raker — portfolio & digital storefront

A dark-mode portfolio and digital storefront for **Roger Raker** — a Filipino
filmmaker and YouTuber (1.52M subscribers, uploading since November 2010) known
for Tagalog short films and the VlogMeyts series — with a full admin panel where
every product, project, and string of site copy is editable. Next.js 16 (App
Router, Server Components), TypeScript, Tailwind v4, Motion, Lucide, and
PostgreSQL over `pg`.

## About the content

The seeded projects are his **real** videos. Titles, upload dates, view counts,
and video IDs were read from the RogerRaker channel
(`UCN2usuEuJN38_58-Z6-wJHg`) in September 2026, and every cover and gallery frame
is that video's own YouTube thumbnail — so all imagery on the site is his.
Per-film synopses are short placeholders written from each title's plain meaning
and are meant to be rewritten in `/admin/projects`; no client, award, or credit
is invented anywhere.

The eight products are **planned inventory** for the shop, not shipped releases.
Prices are in Philippine pesos (`formatPrice` in `src/lib/utils.ts` — change the
symbol there to switch currency).

## Running it

```bash
npm install
npm run db:reset      # drops, recreates, migrates and seeds roger_raker
npm run dev           # http://localhost:3000
```

`.env.local`:

```
DATABASE_URL=postgresql://<you>@localhost:5432/roger_raker
AUTH_SECRET=<random hex>
```

Admin panel: <http://localhost:3000/admin> — `roger@rogerraker.com` / `Grade2026!`

## Scripts

| Script | Does |
|---|---|
| `npm run dev` | Next dev server |
| `npm run build` / `start` | Production build and serve |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run db:create` | `createdb roger_raker` |
| `npm run db:schema` | Applies `db/schema.sql` |
| `npm run db:seed` | Seeds demo content (`scripts/seed.ts`) |
| `npm run db:reset` | All three, from scratch — destructive |

## Routes

**Public**

| Route | What |
|---|---|
| `/` | Hero with the draggable before/after grade wipe, selected works, storefront, about, contact |
| `/work` | Every project, filterable by category |
| `/work/[slug]` | Case study with metadata panel and gallery |
| `/store` | Full storefront with category filter and sort |
| `/store/[slug]` | Product detail, features, specs, related packs |
| `/checkout/[slug]` | Demo checkout — writes a real order, charges nothing |
| `/checkout/success` | Receipt and download link |
| `/api/download/[token]` | Serves the demo asset for a completed order |

**Admin** (all guarded by a signed HttpOnly session cookie)

| Route | What |
|---|---|
| `/admin` | Revenue, orders, 14-day chart, recent activity |
| `/admin/products` | List, publish toggle, duplicate, delete |
| `/admin/products/new` · `/[id]` | Full product editor incl. features and the LUT ramp |
| `/admin/projects` · `/new` · `/[id]` | Portfolio CRUD |
| `/admin/orders` | Order log, status changes |
| `/admin/messages` | Contact enquiries |
| `/admin/content` | Every string on the public site |
| `/admin/profile` | Bio, philosophy, socials, gear |

## Database

`db/schema.sql` is the whole migration. The four tables from the brief —
`profiles`, `projects`, `products`, `orders` — are present with their columns
unchanged; each has extra columns appended (clearly marked) that the admin panel
needs, plus three tables the panel requires:

- `admin_users` — bcrypt password hashes for the panel login
- `site_settings` — a single JSONB row holding all editable site copy
- `messages` — contact form submissions

TypeScript types in `src/lib/types.ts` mirror the schema one-to-one.

## Payments

The checkout is deliberately fake. `placeOrderAction` in
`src/lib/actions/orders.ts` validates the email, writes a `completed` order,
increments the product's sales count, and redirects to the receipt. No processor
is contacted and the card fields are decorative. Swapping in Stripe means
replacing that one function body with a Checkout Session and moving the insert
into a webhook.

## Design system

See `docs/DESIGN.md`. Short version: obsidian ground, one cyan accent, ember
reserved for grading instruments, Archivo (variable width) for display and
Instrument Sans for body, 2px radii, hairlines instead of shadows, and motion
only where it answers an action — apart from a single orchestrated hero moment.

## Deployment

The app runs on the same VPS as joshmojica.io (`72.60.208.52`), alongside it
rather than replacing it: its own directory, its own database, its own systemd
unit on its own port, and its own nginx server block.

| Thing | josh-mojica | rogerraker |
|---|---|---|
| Directory | `/srv/josh-mojica` | `/srv/rogerraker` |
| systemd unit | `josh-mojica` | `rogerraker` |
| Port | 3000 | 3100 |
| Database | Prisma/Postgres | Postgres, `roger_raker` |

### One-time server setup

```bash
scp deploy/bootstrap-vps.sh root@72.60.208.52:/tmp/
ssh root@72.60.208.52 'bash /tmp/bootstrap-vps.sh yourdomain.com'
```

The script clones the repo, creates the database, writes `.env.production` with
a fresh `AUTH_SECRET`, installs the systemd unit and nginx block, generates a
deploy key that can only run `scripts/deploy.sh`, and runs the first deploy. It
finishes by printing the one line to paste into GitHub as the `VPS_SSH_KEY`
repository secret.

### Continuous deployment

Every push to `main` runs `.github/workflows/deploy.yml`: typecheck, lint, and a
production build, and only if all three pass does it SSH to the server and run
`scripts/deploy.sh`. That script pulls, installs, applies any pending SQL
migration, builds with the previous build kept for rollback, restarts the
service, and health-checks it.

`scripts/seed.ts` truncates every table, so **the deploy never seeds**. It is a
local command only.

### Putting content on a live server

The deploy never seeds, because `scripts/seed.ts` truncates every table and
invents demo orders and enquiries. To load the real catalogue onto the server:

```bash
cd /srv/rogerraker
npm run seed:content              # adds anything missing, touches nothing else
npm run seed:content -- --overwrite   # resets seeded rows back to the repo
```

It upserts the profile, site copy, 17 projects, and 8 products by slug. It never
writes orders, messages, or logins, never deletes a row, and never overwrites a
product's `sales_count`. Both seeders read the same data from
`scripts/catalogue.ts`.

### Creating the production admin

The seeded login exists only in local demo data and its password is in this
public repository. Create the real one on the server:

```bash
cd /srv/rogerraker
ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='a long passphrase' \
  ADMIN_NAME='Roger Raker' npm run create-admin
```

### Pointing a domain at it

Add two records at whoever manages the domain's DNS:

| Type | Name | Value |
|---|---|---|
| A | `@` | `72.60.208.52` |
| A | `www` | `72.60.208.52` |

Wait for them to resolve (`dig +short yourdomain.com`), then issue the
certificate on the server:

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Certbot rewrites the nginx block to listen on 443 and redirect HTTP, and renews
on its own timer.

### Database migrations after the first release

`db/schema.sql` is only applied to an empty database. Later changes go in
`db/migrations/` as `001-description.sql`, `002-...`, and the deploy applies any
that have not run yet, each in its own transaction, tracked in a
`schema_migrations` table.
