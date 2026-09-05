-- =====================================================================
-- Roger Raker — portfolio + digital storefront
-- PostgreSQL migration. Run against an empty database:
--   createdb roger_raker && psql roger_raker -f db/schema.sql
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- gen_random_uuid()

-- ---------------------------------------------------------------------
-- Users / Admin Profile
-- ---------------------------------------------------------------------
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(255) NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  social_links JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- extensions used by the admin panel
  headline VARCHAR(255),
  location VARCHAR(255),
  email VARCHAR(255),
  philosophy TEXT,
  gear JSONB DEFAULT '[]'::jsonb,       -- [{ label, items: [] }]
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- Portfolio Projects
-- ---------------------------------------------------------------------
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100),
  cover_image_url TEXT NOT NULL,
  gallery_urls TEXT[],
  client VARCHAR(255),
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- extensions used by the admin panel
  year INTEGER,
  role VARCHAR(255),
  youtube_id VARCHAR(24),                -- the video this project is published as
  views INTEGER DEFAULT 0,               -- YouTube view count at time of writing
  scope TEXT[] DEFAULT '{}',
  is_published BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX projects_category_idx ON projects (category);
CREATE INDEX projects_featured_idx ON projects (featured) WHERE featured;

-- ---------------------------------------------------------------------
-- Digital Products (Storefront)
-- ---------------------------------------------------------------------
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  tagline VARCHAR(255),
  description TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  cover_image_url TEXT NOT NULL,
  file_url TEXT,
  category VARCHAR(100), -- Presets, Templates, E-books, Assets
  features JSONB,
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- extensions used by the storefront + admin panel
  compare_at_price NUMERIC(10, 2),
  gallery_urls TEXT[] DEFAULT '{}',
  ramp TEXT[] DEFAULT '{}',              -- hex stops rendered as the card's LUT strip
  format VARCHAR(160),                   -- ".cube, .drx, .xmp"
  software VARCHAR(255),                 -- "DaVinci Resolve 18+, Premiere Pro, Lightroom"
  rating NUMERIC(2, 1) DEFAULT 5.0,
  reviews_count INTEGER DEFAULT 0,
  sales_count INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX products_category_idx ON products (category);
CREATE INDEX products_published_idx ON products (is_published) WHERE is_published;

-- ---------------------------------------------------------------------
-- Orders / Transactions
-- ---------------------------------------------------------------------
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id),
  customer_email VARCHAR(255) NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- extensions used by the dummy checkout + admin panel
  customer_name VARCHAR(255),
  payment_method VARCHAR(50) DEFAULT 'card',
  reference VARCHAR(32) UNIQUE,          -- human-readable order reference
  download_token UUID DEFAULT gen_random_uuid()
);

CREATE INDEX orders_created_idx ON orders (created_at DESC);
CREATE INDEX orders_product_idx ON orders (product_id);

-- ---------------------------------------------------------------------
-- Admin auth (panel login)
-- ---------------------------------------------------------------------
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- Editable site content — every string on the marketing site
-- lives here so the admin panel can rewrite it without a deploy.
-- ---------------------------------------------------------------------
CREATE TABLE site_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  content JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT site_settings_singleton CHECK (id = 1)
);

-- ---------------------------------------------------------------------
-- Contact form submissions / booking requests
-- ---------------------------------------------------------------------
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  project_type VARCHAR(100),
  budget VARCHAR(100),
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX messages_created_idx ON messages (created_at DESC);
