-- ============================================================
-- CAMPUS NINJA — COMPLETE SUPABASE SQL SCHEMA
-- Production-Ready Database Architecture
-- Generated: 2026-06-19
-- ============================================================

-- ============================================================
-- 1. SUBJECTS TABLE
-- Stores academic subjects filtered by course/branch/semester
-- ============================================================
CREATE TABLE IF NOT EXISTS subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course TEXT NOT NULL,
  branch TEXT NOT NULL,
  semester INTEGER NOT NULL CHECK (semester >= 1 AND semester <= 8),
  name TEXT NOT NULL,
  short_name TEXT,
  description TEXT,
  icon_name TEXT DEFAULT 'book-outline',
  theme_color TEXT DEFAULT '#EA580C',
  accent_color TEXT DEFAULT '#FFEDD5',
  category TEXT NOT NULL DEFAULT 'theory' CHECK (category IN ('theory', 'practical', 'elective')),
  is_pinned BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Composite index: the primary query pattern
CREATE INDEX idx_subjects_course_branch_sem
  ON subjects (course, branch, semester);

-- Sort order index
CREATE INDEX idx_subjects_sort_order
  ON subjects (sort_order);

-- Active filter
CREATE INDEX idx_subjects_active
  ON subjects (is_active) WHERE is_active = true;


-- ============================================================
-- 2. RESOURCES TABLE
-- Stores all academic resources linked to subjects
-- Supports: supabase_file, google_drive, youtube, external_link
-- ============================================================
CREATE TABLE IF NOT EXISTS resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('notes', 'pyq', 'video', 'syllabus', 'important_questions', 'ai_resources')),
  storage_type TEXT NOT NULL CHECK (storage_type IN ('supabase_file', 'google_drive', 'youtube', 'external_link')),
  file_url TEXT,
  drive_url TEXT,
  youtube_url TEXT,
  external_url TEXT,
  thumbnail_url TEXT,
  file_size TEXT,
  file_format TEXT,
  is_popular BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Primary query: resources by subject
CREATE INDEX idx_resources_subject_id
  ON resources (subject_id);

-- Filter by type within a subject
CREATE INDEX idx_resources_subject_type
  ON resources (subject_id, type);

-- Popular resources for home screen
CREATE INDEX idx_resources_popular
  ON resources (is_popular) WHERE is_popular = true;

-- Full-text search on title
CREATE INDEX idx_resources_title_search
  ON resources USING gin (to_tsvector('english', title));


-- ============================================================
-- 3. SKILLS TABLE
-- Career skill paths: DSA, Web Dev, AI, etc.
-- ============================================================
CREATE TABLE IF NOT EXISTS skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon_name TEXT DEFAULT 'code-slash-outline',
  theme_color TEXT DEFAULT '#3B82F6',
  accent_color TEXT DEFAULT '#DBEAFE',
  difficulty_level TEXT DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  total_resources INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_skills_active
  ON skills (is_active, sort_order) WHERE is_active = true;


-- ============================================================
-- 4. SKILL_RESOURCES TABLE
-- Resources within each skill path
-- ============================================================
CREATE TABLE IF NOT EXISTS skill_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('roadmap', 'notes', 'playlist', 'resource', 'project', 'article')),
  storage_type TEXT NOT NULL CHECK (storage_type IN ('supabase_file', 'google_drive', 'youtube', 'external_link')),
  file_url TEXT,
  drive_url TEXT,
  youtube_url TEXT,
  external_url TEXT,
  thumbnail_url TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_skill_resources_skill_id
  ON skill_resources (skill_id);

CREATE INDEX idx_skill_resources_skill_type
  ON skill_resources (skill_id, type);


-- ============================================================
-- 5. MARKETPLACE_SERVICES TABLE
-- Services offered: assignments, projects, lab manuals, etc.
-- ============================================================
CREATE TABLE IF NOT EXISTS marketplace_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon_name TEXT DEFAULT 'cart-outline',
  theme_color TEXT DEFAULT '#8B5CF6',
  accent_color TEXT DEFAULT '#EDE9FE',
  price INTEGER DEFAULT 0,
  original_price INTEGER,
  features JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_marketplace_active
  ON marketplace_services (is_active, sort_order) WHERE is_active = true;


-- ============================================================
-- 6. ORDERS TABLE
-- Marketplace order submissions (no payment)
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES marketplace_services(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  requirement TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'in_progress', 'completed', 'cancelled')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_orders_service_id
  ON orders (service_id);

CREATE INDEX idx_orders_status
  ON orders (status);

CREATE INDEX idx_orders_created_at
  ON orders (created_at DESC);


-- ============================================================
-- 7. COMMUNITY_LINKS TABLE
-- Social and community platform links
-- ============================================================
CREATE TABLE IF NOT EXISTS community_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL CHECK (platform IN ('whatsapp', 'youtube', 'instagram', 'telegram', 'discord', 'linkedin', 'twitter', 'website')),
  title TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  icon_name TEXT NOT NULL,
  theme_color TEXT DEFAULT '#10B981',
  member_count TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_community_active
  ON community_links (is_active, sort_order) WHERE is_active = true;


-- ============================================================
-- 8. SETTINGS TABLE
-- App-wide key-value configuration
-- ============================================================
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX idx_settings_key
  ON settings (key);


-- ============================================================
-- 9. ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on ALL tables
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- SUBJECTS: public read-only
CREATE POLICY "subjects_public_read" ON subjects
  FOR SELECT USING (true);

-- RESOURCES: public read-only
CREATE POLICY "resources_public_read" ON resources
  FOR SELECT USING (true);

-- SKILLS: public read-only
CREATE POLICY "skills_public_read" ON skills
  FOR SELECT USING (true);

-- SKILL_RESOURCES: public read-only
CREATE POLICY "skill_resources_public_read" ON skill_resources
  FOR SELECT USING (true);

-- MARKETPLACE_SERVICES: public read-only
CREATE POLICY "marketplace_public_read" ON marketplace_services
  FOR SELECT USING (true);

-- ORDERS: public insert only (no read, no update, no delete)
CREATE POLICY "orders_public_insert" ON orders
  FOR INSERT WITH CHECK (true);

-- COMMUNITY_LINKS: public read-only
CREATE POLICY "community_public_read" ON community_links
  FOR SELECT USING (true);

-- SETTINGS: public read-only
CREATE POLICY "settings_public_read" ON settings
  FOR SELECT USING (true);


-- ============================================================
-- 10. SUPABASE STORAGE BUCKETS
-- Run these AFTER schema creation in SQL Editor
-- ============================================================

-- Create public bucket for resources
INSERT INTO storage.buckets (id, name, public)
VALUES ('resources', 'resources', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policy for public read access on resource files
CREATE POLICY "resources_bucket_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'resources');

-- RLS policy for admin uploads (via dashboard/service role only)
-- No public upload policy — files are managed via Supabase Dashboard


-- ============================================================
-- SCHEMA COMPLETE
-- ============================================================

-- ============================================================
-- 11. DEVICE_TOKENS TABLE
-- Push notifications registration tokens
-- ============================================================
CREATE TABLE IF NOT EXISTS device_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT NOT NULL UNIQUE,
  branch_id UUID,
  semester_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for tokens by branch/semester for targeted pushes
CREATE INDEX idx_device_tokens_branch_sem ON device_tokens(branch_id, semester_id);

ALTER TABLE device_tokens ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert and update device tokens
CREATE POLICY "device_tokens_public_insert" ON device_tokens
  FOR INSERT WITH CHECK (true);

CREATE POLICY "device_tokens_public_update" ON device_tokens
  FOR UPDATE USING (true) WITH CHECK (true);
