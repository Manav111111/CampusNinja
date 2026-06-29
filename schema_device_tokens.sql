-- ============================================================
-- DEVICE TOKENS TABLE
-- Stores FCM push notification tokens per user per device.
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor).
-- ============================================================

CREATE TABLE IF NOT EXISTS device_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  platform TEXT NOT NULL DEFAULT 'android',
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast lookups by user (used when sending notifications)
CREATE INDEX IF NOT EXISTS idx_device_tokens_user_id ON device_tokens(user_id);

-- Index for fast lookups/upserts by token
CREATE INDEX IF NOT EXISTS idx_device_tokens_token ON device_tokens(token);

-- Enable Row Level Security
ALTER TABLE device_tokens ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can insert/update/delete their own tokens
CREATE POLICY "Users can manage own tokens"
  ON device_tokens FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Service role can read all tokens (needed by admin panel to send notifications)
CREATE POLICY "Service role can read all tokens"
  ON device_tokens FOR SELECT
  USING (true);
