-- ============================================================
-- CAMPUSBAZAAR: CREATE public.listing_images TABLE & RLS
-- ============================================================
-- Run this in Supabase Dashboard -> SQL Editor to create the
-- listing_images table and reload PostgREST schema cache.
-- ============================================================

-- 1. Create table public.listing_images
CREATE TABLE IF NOT EXISTS public.listing_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create index on listing_id for fast joins and lookups
CREATE INDEX IF NOT EXISTS idx_listing_images_listing_id ON public.listing_images(listing_id);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.listing_images ENABLE ROW LEVEL SECURITY;

-- 4. Clean up any existing policies to avoid duplicates
DROP POLICY IF EXISTS "Public can view listing images" ON public.listing_images;
DROP POLICY IF EXISTS "Owners can add images" ON public.listing_images;
DROP POLICY IF EXISTS "Owners can update images" ON public.listing_images;
DROP POLICY IF EXISTS "Owners can delete images" ON public.listing_images;
DROP POLICY IF EXISTS "listing_images_public_read" ON public.listing_images;
DROP POLICY IF EXISTS "listing_images_owner_insert" ON public.listing_images;
DROP POLICY IF EXISTS "listing_images_owner_update" ON public.listing_images;
DROP POLICY IF EXISTS "listing_images_owner_delete" ON public.listing_images;

-- 5. Policy: Anyone can view listing images (public read)
CREATE POLICY "listing_images_public_read"
ON public.listing_images FOR SELECT
USING (true);

-- 6. Policy: Authenticated users can insert images for listings they own
CREATE POLICY "listing_images_owner_insert"
ON public.listing_images FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.listings
    WHERE id = listing_id AND seller_id = auth.uid()
  )
);

-- 7. Policy: Authenticated users can update images for listings they own
CREATE POLICY "listing_images_owner_update"
ON public.listing_images FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.listings
    WHERE id = listing_id AND seller_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.listings
    WHERE id = listing_id AND seller_id = auth.uid()
  )
);

-- 8. Policy: Authenticated users can delete images for listings they own
CREATE POLICY "listing_images_owner_delete"
ON public.listing_images FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.listings
    WHERE id = listing_id AND seller_id = auth.uid()
  )
);

-- 9. Force PostgREST to reload its schema cache immediately
NOTIFY pgrst, 'reload schema';
