/** Types mirror db/schema.sql one-to-one. */

export type Json = Record<string, unknown>;

export interface SocialLinks {
  x?: string;
  instagram?: string;
  youtube?: string;
  github?: string;
  linkedin?: string;
  [key: string]: string | undefined;
}

export interface GearGroup {
  label: string;
  items: string[];
}

export interface Profile {
  id: string;
  full_name: string;
  bio: string | null;
  avatar_url: string | null;
  social_links: SocialLinks | null;
  created_at: string;
  headline: string | null;
  location: string | null;
  email: string | null;
  philosophy: string | null;
  gear: GearGroup[];
  updated_at: string;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string | null;
  cover_image_url: string;
  gallery_urls: string[] | null;
  client: string | null;
  featured: boolean;
  created_at: string;
  year: number | null;
  role: string | null;
  youtube_id: string | null;
  views: number;
  scope: string[];
  is_published: boolean;
  sort_order: number;
  updated_at: string;
}

export interface ProductFeature {
  title: string;
  detail: string;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  tagline: string | null;
  description: string;
  price: number;
  cover_image_url: string;
  file_url: string | null;
  category: string | null;
  features: ProductFeature[];
  is_published: boolean;
  created_at: string;
  compare_at_price: number | null;
  gallery_urls: string[];
  ramp: string[];
  format: string | null;
  software: string | null;
  rating: number;
  reviews_count: number;
  sales_count: number;
  featured: boolean;
  sort_order: number;
  updated_at: string;
}

export type OrderStatus = "completed" | "pending" | "refunded" | "failed";

export interface Order {
  id: string;
  product_id: string | null;
  customer_email: string;
  amount: number;
  status: OrderStatus;
  created_at: string;
  customer_name: string | null;
  payment_method: string | null;
  reference: string | null;
  download_token: string | null;
}

export interface OrderWithProduct extends Order {
  product_title: string | null;
  product_slug: string | null;
  product_cover: string | null;
  product_file_url: string | null;
}

export interface Message {
  id: string;
  name: string;
  email: string;
  project_type: string | null;
  budget: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string | null;
}

/** Every editable string on the public site. Stored as site_settings.content */
export interface SiteContent {
  hero: {
    eyebrow: string;
    headline: string;
    subhead: string;
    primary_cta: string;
    secondary_cta: string;
    before_image: string;
    after_image: string;
    frame_note: string;
  };
  work: {
    title: string;
    intro: string;
  };
  store: {
    title: string;
    intro: string;
    note: string;
  };
  about: {
    title: string;
    intro: string;
    philosophy_title: string;
    process: { title: string; body: string }[];
    metrics: { value: string; label: string }[];
  };
  contact: {
    title: string;
    intro: string;
    email: string;
    response_time: string;
    project_types: string[];
    budgets: string[];
  };
  footer: {
    tagline: string;
    legal: string;
  };
  store_categories: string[];
  work_categories: string[];
}

export interface SiteSettings {
  id: number;
  content: SiteContent;
  updated_at: string;
}
