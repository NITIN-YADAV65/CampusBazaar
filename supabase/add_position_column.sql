-- ============================================================
-- ADD MISSING 'position' COLUMN TO public.listing_images
-- ============================================================
-- Run this in Supabase Dashboard -> SQL Editor.
-- Does NOT delete or modify any existing listings or images!
-- ============================================================

-- 1. Add position column with integer type and default 0
ALTER TABLE public.listing_images
ADD COLUMN IF NOT EXISTS position INTEGER NOT NULL DEFAULT 0;

-- 2. Force PostgREST to reload its schema cache immediately
NOTIFY pgrst, 'reload schema';
