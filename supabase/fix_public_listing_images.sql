-- ============================================================
-- CAMPUSBAZAAR: FIX PUBLIC LISTING IMAGES READ ACCESS
-- ============================================================
-- 1. Allows anonymous and authenticated users to VIEW listing images
-- 2. Keeps upload/insert restricted to authenticated listing owners
-- 3. Keeps update/delete restricted to authenticated listing owners
-- 4. Ensures the 'listing-images' storage bucket is public for read
-- ============================================================

-- Step 1: Ensure public.listing_images has the 'position' column
ALTER TABLE public.listing_images
ADD COLUMN IF NOT EXISTS position INTEGER NOT NULL DEFAULT 0;

-- Step 2: Enable Row Level Security
ALTER TABLE public.listing_images ENABLE ROW LEVEL SECURITY;

-- Step 3: Remove old / conflicting policies on public.listing_images
DROP POLICY IF EXISTS "Public can view listing images" ON public.listing_images;
DROP POLICY IF EXISTS "listing_images_public_read" ON public.listing_images;
DROP POLICY IF EXISTS "Users can view listing images" ON public.listing_images;
DROP POLICY IF EXISTS "Anyone can view listing images" ON public.listing_images;
DROP POLICY IF EXISTS "Owners can add images" ON public.listing_images;
DROP POLICY IF EXISTS "Owners can update images" ON public.listing_images;
DROP POLICY IF EXISTS "Owners can delete images" ON public.listing_images;
DROP POLICY IF EXISTS "listing_images_owner_insert" ON public.listing_images;
DROP POLICY IF EXISTS "listing_images_owner_update" ON public.listing_images;
DROP POLICY IF EXISTS "listing_images_owner_delete" ON public.listing_images;

-- Step 4: Create SELECT policy (PUBLIC READ)
-- Allows both anonymous visitors and authenticated users to read listing images
CREATE POLICY "listing_images_public_read"
ON public.listing_images FOR SELECT
TO public
USING (true);

-- Step 5: Create INSERT policy (OWNER ONLY)
-- Only authenticated users can insert images, and ONLY for listings they own
CREATE POLICY "listing_images_owner_insert"
ON public.listing_images FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.listings
    WHERE id = listing_id AND seller_id = auth.uid()
  )
);

-- Step 6: Create UPDATE policy (OWNER ONLY)
-- Only authenticated owners can update image records
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

-- Step 7: Create DELETE policy (OWNER ONLY)
-- Only authenticated owners can delete their images
CREATE POLICY "listing_images_owner_delete"
ON public.listing_images FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.listings
    WHERE id = listing_id AND seller_id = auth.uid()
  )
);

-- ============================================================
-- STORAGE POLICIES FOR 'listing-images' BUCKET
-- ============================================================

-- Step 8: Ensure bucket exists and is marked public
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'listing-images',
  'listing-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg'];

-- Step 9: Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Step 10: Clean up existing storage policies for 'listing-images'
DROP POLICY IF EXISTS "Public Access listing-images" ON storage.objects;
DROP POLICY IF EXISTS "listing_images_public_select" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload listing-images" ON storage.objects;
DROP POLICY IF EXISTS "listing_images_owner_insert" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own listing-images" ON storage.objects;
DROP POLICY IF EXISTS "listing_images_owner_update" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own listing-images" ON storage.objects;
DROP POLICY IF EXISTS "listing_images_owner_delete" ON storage.objects;

-- Step 11: Public Read Access on storage.objects for 'listing-images'
CREATE POLICY "listing_images_public_select"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'listing-images' );

-- Step 12: Authenticated Owner Upload to own folder ({user_id}/...)
CREATE POLICY "listing_images_owner_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'listing-images' AND
  (
    (storage.foldername(name))[1] = auth.uid()::text OR
    ((storage.foldername(name))[1] = 'avatars' AND (storage.foldername(name))[2] = auth.uid()::text)
  )
);

-- Step 13: Authenticated Owner Update
CREATE POLICY "listing_images_owner_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'listing-images' AND
  (
    (storage.foldername(name))[1] = auth.uid()::text OR
    ((storage.foldername(name))[1] = 'avatars' AND (storage.foldername(name))[2] = auth.uid()::text)
  )
)
WITH CHECK (
  bucket_id = 'listing-images' AND
  (
    (storage.foldername(name))[1] = auth.uid()::text OR
    ((storage.foldername(name))[1] = 'avatars' AND (storage.foldername(name))[2] = auth.uid()::text)
  )
);

-- Step 14: Authenticated Owner Delete
CREATE POLICY "listing_images_owner_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'listing-images' AND
  (
    (storage.foldername(name))[1] = auth.uid()::text OR
    ((storage.foldername(name))[1] = 'avatars' AND (storage.foldername(name))[2] = auth.uid()::text)
  )
);

-- Step 15: Force PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';
