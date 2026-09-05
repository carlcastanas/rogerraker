import "server-only";
import { query, queryOne } from "./db";
import type {
  Message,
  OrderWithProduct,
  Product,
  Profile,
  Project,
  SiteContent,
} from "./types";
import { defaultSiteContent } from "./site-content";

/* ------------------------------- products ------------------------------- */

const PRODUCT_ORDER = "ORDER BY sort_order ASC, created_at DESC";

export async function getProducts(opts: { publishedOnly?: boolean } = {}) {
  const where = opts.publishedOnly ? "WHERE is_published" : "";
  return query<Product>(`SELECT * FROM products ${where} ${PRODUCT_ORDER}`);
}

export async function getFeaturedProducts(limit = 6) {
  return query<Product>(
    `SELECT * FROM products WHERE is_published ${PRODUCT_ORDER} LIMIT $1`,
    [limit]
  );
}

export async function getProductBySlug(slug: string) {
  return queryOne<Product>("SELECT * FROM products WHERE slug = $1", [slug]);
}

export async function getProductById(id: string) {
  return queryOne<Product>("SELECT * FROM products WHERE id = $1", [id]);
}

export async function getRelatedProducts(productId: string, category: string | null, limit = 3) {
  return query<Product>(
    `SELECT * FROM products
     WHERE is_published AND id <> $1
     ORDER BY (category IS NOT DISTINCT FROM $2) DESC, sort_order ASC
     LIMIT $3`,
    [productId, category, limit]
  );
}

/* ------------------------------- projects ------------------------------- */

const PROJECT_ORDER = "ORDER BY sort_order ASC, created_at DESC";

export async function getProjects(opts: { publishedOnly?: boolean } = {}) {
  const where = opts.publishedOnly ? "WHERE is_published" : "";
  return query<Project>(`SELECT * FROM projects ${where} ${PROJECT_ORDER}`);
}

export async function getProjectBySlug(slug: string) {
  return queryOne<Project>("SELECT * FROM projects WHERE slug = $1", [slug]);
}

export async function getProjectById(id: string) {
  return queryOne<Project>("SELECT * FROM projects WHERE id = $1", [id]);
}

export async function getAdjacentProjects(slug: string) {
  const rows = await query<Pick<Project, "title" | "slug">>(
    `SELECT title, slug FROM projects WHERE is_published ${PROJECT_ORDER}`
  );
  const i = rows.findIndex((r) => r.slug === slug);
  return {
    prev: i > 0 ? rows[i - 1] : rows[rows.length - 1] ?? null,
    next: i >= 0 && i < rows.length - 1 ? rows[i + 1] : rows[0] ?? null,
  };
}

/* -------------------------------- orders -------------------------------- */

export async function getOrders(limit = 100) {
  return query<OrderWithProduct>(
    `SELECT o.*, p.title AS product_title, p.slug AS product_slug,
            p.cover_image_url AS product_cover, p.file_url AS product_file_url
     FROM orders o LEFT JOIN products p ON p.id = o.product_id
     ORDER BY o.created_at DESC LIMIT $1`,
    [limit]
  );
}

export async function getOrderByReference(reference: string) {
  return queryOne<OrderWithProduct>(
    `SELECT o.*, p.title AS product_title, p.slug AS product_slug,
            p.cover_image_url AS product_cover, p.file_url AS product_file_url
     FROM orders o LEFT JOIN products p ON p.id = o.product_id
     WHERE o.reference = $1`,
    [reference]
  );
}

/* ------------------------------- messages ------------------------------- */

export async function getMessages(limit = 100) {
  return query<Message>(
    "SELECT * FROM messages ORDER BY created_at DESC LIMIT $1",
    [limit]
  );
}

/* ------------------------------- profile -------------------------------- */

export async function getProfile() {
  return queryOne<Profile>("SELECT * FROM profiles ORDER BY created_at ASC LIMIT 1");
}

/* ---------------------------- site settings ----------------------------- */

/** Falls back to the shipped defaults so the site renders before first save. */
export async function getSiteContent(): Promise<SiteContent> {
  const row = await queryOne<{ content: SiteContent }>(
    "SELECT content FROM site_settings WHERE id = 1"
  );
  if (!row?.content) return defaultSiteContent;
  return { ...defaultSiteContent, ...row.content } as SiteContent;
}

/* ------------------------------ dashboard ------------------------------- */

export interface DashboardStats {
  revenue: number;
  orders: number;
  products: number;
  published_products: number;
  projects: number;
  unread_messages: number;
  revenue_30d: number;
  orders_30d: number;
}

export async function getDashboardStats() {
  const row = await queryOne<DashboardStats>(`
    SELECT
      COALESCE((SELECT SUM(amount) FROM orders WHERE status = 'completed'), 0)::numeric AS revenue,
      (SELECT COUNT(*) FROM orders)::int AS orders,
      (SELECT COUNT(*) FROM products)::int AS products,
      (SELECT COUNT(*) FROM products WHERE is_published)::int AS published_products,
      (SELECT COUNT(*) FROM projects)::int AS projects,
      (SELECT COUNT(*) FROM messages WHERE NOT is_read)::int AS unread_messages,
      COALESCE((SELECT SUM(amount) FROM orders WHERE status = 'completed' AND created_at > NOW() - INTERVAL '30 days'), 0)::numeric AS revenue_30d,
      (SELECT COUNT(*) FROM orders WHERE created_at > NOW() - INTERVAL '30 days')::int AS orders_30d
  `);
  return (
    row ?? {
      revenue: 0, orders: 0, products: 0, published_products: 0,
      projects: 0, unread_messages: 0, revenue_30d: 0, orders_30d: 0,
    }
  );
}

export async function getRevenueByProduct(limit = 6) {
  return query<{ title: string; total: number; count: number }>(
    `SELECT p.title, COALESCE(SUM(o.amount), 0)::numeric AS total, COUNT(o.id)::int AS count
     FROM products p LEFT JOIN orders o ON o.product_id = p.id AND o.status = 'completed'
     GROUP BY p.id, p.title ORDER BY total DESC LIMIT $1`,
    [limit]
  );
}

export async function getDailyRevenue(days = 14) {
  return query<{ day: string; total: number }>(
    `SELECT to_char(d.day, 'YYYY-MM-DD') AS day,
            COALESCE(SUM(o.amount), 0)::numeric AS total
     FROM generate_series(CURRENT_DATE - ($1::int - 1), CURRENT_DATE, '1 day') AS d(day)
     LEFT JOIN orders o ON date_trunc('day', o.created_at) = d.day AND o.status = 'completed'
     GROUP BY d.day ORDER BY d.day ASC`,
    [days]
  );
}
