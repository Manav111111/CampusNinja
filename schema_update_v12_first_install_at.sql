-- ============================================================
-- ADD FIRST_INSTALL_AT COLUMN TO DEVICE_TOKENS
-- Run this in your Supabase SQL Editor so new user push notifications
-- can be filtered by installation timestamp if needed.
-- ============================================================

ALTER TABLE device_tokens ADD COLUMN IF NOT EXISTS first_install_at TIMESTAMPTZ DEFAULT now();
CREATE INDEX IF NOT EXISTS idx_device_tokens_first_install_at ON device_tokens(first_install_at);
