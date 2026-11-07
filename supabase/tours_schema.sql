-- Extended tours schema for detail page mapping
-- Run this in Supabase SQL editor (or apply as migration)

-- Base table (if not exists)
CREATE TABLE IF NOT EXISTS tours (
  id bigint generated always as identity primary key,
  created_at timestamptz default now()
);

-- Add columns for all detail page fields
ALTER TABLE tours ADD COLUMN IF NOT EXISTS title text;
ALTER TABLE tours ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE tours ADD COLUMN IF NOT EXISTS category text;
ALTER TABLE tours ADD COLUMN IF NOT EXISTS price numeric;
ALTER TABLE tours ADD COLUMN IF NOT EXISTS discount text;
ALTER TABLE tours ADD COLUMN IF NOT EXISTS duration text;
ALTER TABLE tours ADD COLUMN IF NOT EXISTS language text;
ALTER TABLE tours ADD COLUMN IF NOT EXISTS rating text;
ALTER TABLE tours ADD COLUMN IF NOT EXISTS status text DEFAULT 'Active';
ALTER TABLE tours ADD COLUMN IF NOT EXISTS badge text;
ALTER TABLE tours ADD COLUMN IF NOT EXISTS image_url text;

-- Detail page content
ALTER TABLE tours ADD COLUMN IF NOT EXISTS short_description text;
ALTER TABLE tours ADD COLUMN IF NOT EXISTS full_description text;
ALTER TABLE tours ADD COLUMN IF NOT EXISTS pickup_info text;
ALTER TABLE tours ADD COLUMN IF NOT EXISTS price_note text;

-- Gallery (JSON array of image URLs)
ALTER TABLE tours ADD COLUMN IF NOT EXISTS gallery jsonb DEFAULT '[]'::jsonb;

-- Features/highlights shown as icon grid (JSON array of {icon, label})
ALTER TABLE tours ADD COLUMN IF NOT EXISTS features jsonb DEFAULT '[]'::jsonb;

-- Itinerary (JSON array of {title, description, duration})
ALTER TABLE tours ADD COLUMN IF NOT EXISTS itinerary jsonb DEFAULT '[]'::jsonb;

-- Accordion content
ALTER TABLE tours ADD COLUMN IF NOT EXISTS highlights jsonb DEFAULT '[]'::jsonb;
ALTER TABLE tours ADD COLUMN IF NOT EXISTS know_before_you_go text;
ALTER TABLE tours ADD COLUMN IF NOT EXISTS age_policy text;
ALTER TABLE tours ADD COLUMN IF NOT EXISTS cancellation_policy text;

-- Booking sidebar options
ALTER TABLE tours ADD COLUMN IF NOT EXISTS vehicle_options jsonb DEFAULT '[]'::jsonb;
ALTER TABLE tours ADD COLUMN IF NOT EXISTS package_options jsonb DEFAULT '[]'::jsonb;

-- Optional video
ALTER TABLE tours ADD COLUMN IF NOT EXISTS video_url text;

-- RLS (adjust for production)
ALTER TABLE tours ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='tours' AND policyname='tours_select_all') THEN
    CREATE POLICY "tours_select_all" ON tours FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='tours' AND policyname='tours_insert_all') THEN
    CREATE POLICY "tours_insert_all" ON tours FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='tours' AND policyname='tours_update_all') THEN
    CREATE POLICY "tours_update_all" ON tours FOR UPDATE USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='tours' AND policyname='tours_delete_all') THEN
    CREATE POLICY "tours_delete_all" ON tours FOR DELETE USING (true);
  END IF;
END $$;

-- Slug helper (optional): unique index
CREATE UNIQUE INDEX IF NOT EXISTS tours_slug_idx ON tours (slug) WHERE slug IS NOT NULL;

-- Admin-managed users list (for dashboard display / roles). Auth is handled by Supabase Auth.
CREATE TABLE IF NOT EXISTS admin_users (
  id bigint generated always as identity primary key,
  email text not null unique,
  name text,
  role text default 'admin',
  status text default 'Active',
  created_at timestamptz default now()
);
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='admin_users' AND policyname='admin_users_select_all') THEN
    CREATE POLICY "admin_users_select_all" ON admin_users FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='admin_users' AND policyname='admin_users_insert_all') THEN
    CREATE POLICY "admin_users_insert_all" ON admin_users FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='admin_users' AND policyname='admin_users_update_all') THEN
    CREATE POLICY "admin_users_update_all" ON admin_users FOR UPDATE USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='admin_users' AND policyname='admin_users_delete_all') THEN
    CREATE POLICY "admin_users_delete_all" ON admin_users FOR DELETE USING (true);
  END IF;
END $$;

-- To create/login an admin, use Supabase Auth:
-- 1) Supabase Dashboard > Authentication > Users > Add user (email + password), OR enable sign-ups and use supabase.auth.signUp().
-- 2) The /admin/login page signs in with supabase.auth.signInWithPassword({ email, password }).
-- 3) Optionally add a matching record to admin_users for display/roles in the dashboard.


-- Categories (managed in Admin)
CREATE TABLE IF NOT EXISTS categories (
  id bigint generated always as identity primary key,
  name text not null unique,
  created_at timestamptz default now()
);
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='categories' AND policyname='categories_select_all') THEN
    CREATE POLICY "categories_select_all" ON categories FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='categories' AND policyname='categories_insert_all') THEN
    CREATE POLICY "categories_insert_all" ON categories FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='categories' AND policyname='categories_update_all') THEN
    CREATE POLICY "categories_update_all" ON categories FOR UPDATE USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='categories' AND policyname='categories_delete_all') THEN
    CREATE POLICY "categories_delete_all" ON categories FOR DELETE USING (true);
  END IF;
END $$;

INSERT INTO categories (name) VALUES ('Desert Safaris'),('City Tours'),('Water Parks'),('Attractions'),('Cruise and Boat Tours') ON CONFLICT (name) DO NOTHING;

-- Run the categories table block above if /admin shows "categories table not found" (PGRST205).

-- Locations (managed in Admin > Settings)
CREATE TABLE IF NOT EXISTS locations (
  id bigint generated always as identity primary key,
  name text not null unique,
  status text default 'Active',
  created_at timestamptz default now()
);
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='locations' AND policyname='locations_select_all') THEN
    CREATE POLICY "locations_select_all" ON locations FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='locations' AND policyname='locations_insert_all') THEN
    CREATE POLICY "locations_insert_all" ON locations FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='locations' AND policyname='locations_update_all') THEN
    CREATE POLICY "locations_update_all" ON locations FOR UPDATE USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='locations' AND policyname='locations_delete_all') THEN
    CREATE POLICY "locations_delete_all" ON locations FOR DELETE USING (true);
  END IF;
END $$;

INSERT INTO locations (name) VALUES ('Dubai'),('Abu Dhabi'),('Ras Al Khaimah') ON CONFLICT (name) DO NOTHING;

-- Link tours -> locations
ALTER TABLE tours ADD COLUMN IF NOT EXISTS location text; -- display/fallback name
ALTER TABLE tours ADD COLUMN IF NOT EXISTS location_id bigint;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'tours_location_id_fkey'
  ) THEN
    ALTER TABLE tours ADD CONSTRAINT tours_location_id_fkey FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE SET NULL;
  END IF;
END $$;
CREATE INDEX IF NOT EXISTS tours_location_idx ON tours (location);
CREATE INDEX IF NOT EXISTS tours_location_id_idx ON tours (location_id);

-- Backfill location_id from existing location text where possible
UPDATE tours t SET location_id = l.id
FROM locations l
WHERE t.location_id IS NULL AND t.location IS NOT NULL AND lower(trim(t.location)) = lower(trim(l.name));

-- Hero slides (CMS)
CREATE TABLE IF NOT EXISTS hero_slides (
  id bigint generated always as identity primary key,
  title text,
  description text,
  image_url text not null,
  button_text text default 'Book now',
  button_link text default '/',
  sort_order int default 0,
  status text default 'Active',
  created_at timestamptz default now()
);
ALTER TABLE hero_slides ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='hero_slides' AND policyname='hero_slides_select_all') THEN
    CREATE POLICY "hero_slides_select_all" ON hero_slides FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='hero_slides' AND policyname='hero_slides_insert_all') THEN
    CREATE POLICY "hero_slides_insert_all" ON hero_slides FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='hero_slides' AND policyname='hero_slides_update_all') THEN
    CREATE POLICY "hero_slides_update_all" ON hero_slides FOR UPDATE USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='hero_slides' AND policyname='hero_slides_delete_all') THEN
    CREATE POLICY "hero_slides_delete_all" ON hero_slides FOR DELETE USING (true);
  END IF;
END $$;

NOTIFY pgrst, 'reload schema';

-- CMS: Our Experiences (circular categories section)
CREATE TABLE IF NOT EXISTS experience_items (
  id bigint generated always as identity primary key,
  title text not null,
  image_url text not null,
  link_url text,
  sort_order int default 0,
  status text default 'Active',
  created_at timestamptz default now()
);
ALTER TABLE experience_items ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='experience_items' AND policyname='experience_items_select_all') THEN
    CREATE POLICY "experience_items_select_all" ON experience_items FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='experience_items' AND policyname='experience_items_insert_all') THEN
    CREATE POLICY "experience_items_insert_all" ON experience_items FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='experience_items' AND policyname='experience_items_update_all') THEN
    CREATE POLICY "experience_items_update_all" ON experience_items FOR UPDATE USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='experience_items' AND policyname='experience_items_delete_all') THEN
    CREATE POLICY "experience_items_delete_all" ON experience_items FOR DELETE USING (true);
  END IF;
END $$;
NOTIFY pgrst, 'reload schema';

-- Category image (admin upload/URL)
ALTER TABLE categories ADD COLUMN IF NOT EXISTS image_url text;
NOTIFY pgrst, 'reload schema';

-- Trending flag (show in homepage Trending Attractions)
ALTER TABLE tours ADD COLUMN IF NOT EXISTS is_trending boolean default false;
NOTIFY pgrst, 'reload schema';
