-- ============================================================
-- DEVICE TOKENS TABLE
-- Stores FCM push notification tokens per user per device.
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor).
-- ============================================================

-- Drop existing table/policies if they exist (clean slate)
DROP POLICY IF EXISTS "Users can manage own tokens" ON device_tokens;
DROP POLICY IF EXISTS "Service role can read all tokens" ON device_tokens;
DROP POLICY IF EXISTS "Anyone can insert device tokens" ON device_tokens;
DROP POLICY IF EXISTS "Anyone can update device tokens" ON device_tokens;
DROP POLICY IF EXISTS "Anyone can select device tokens" ON device_tokens;
DROP TABLE IF EXISTS device_tokens;

-- Create the table fresh
CREATE TABLE device_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  token TEXT NOT NULL UNIQUE,
  platform TEXT NOT NULL DEFAULT 'android',
  branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
  semester_id UUID REFERENCES semesters(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast lookups by user, branch, and semester (used when sending notifications)
CREATE INDEX idx_device_tokens_user_id ON device_tokens(user_id);
CREATE INDEX idx_device_tokens_branch_semester ON device_tokens(branch_id, semester_id);
CREATE INDEX idx_device_tokens_token ON device_tokens(token);

-- Enable Row Level Security
ALTER TABLE device_tokens ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anonymous and authenticated mobile devices to insert their tokens
CREATE POLICY "Anyone can insert device tokens"
  ON device_tokens FOR INSERT
  WITH CHECK (true);

-- Policy: Allow anonymous and authenticated mobile devices to update their tokens
CREATE POLICY "Anyone can update device tokens"
  ON device_tokens FOR UPDATE
  USING (true);

-- Policy: Allow reading tokens (needed by admin panel and app checks)
CREATE POLICY "Anyone can select device tokens"
  ON device_tokens FOR SELECT
  USING (true);
