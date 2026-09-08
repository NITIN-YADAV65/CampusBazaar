-- ============================================================
-- CAMPUSBAZAAR: SUPABASE STORAGE RLS POLICIES FOR 'listing-images'
-- ============================================================
-- Execute this entire script in Supabase Dashboard -> SQL Editor.
-- This immediately resolves: "new row violates row-level security policy"
-- ============================================================

-- 1. ENSURE THE BUCKET IS MARKED PUBLIC (DO NOT RECREATE)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'listing-images',
  'listing-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg'];

-- 2. ENABLE RLS ON storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. REMOVE ALL OLD / CONFLICTING POLICIES ON storage.objects
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE tablename = 'objects' AND schemaname = 'storage'
  LOOP
    IF pol.policyname ILIKE '%listing%' 
       OR pol.policyname ILIKE '%upload%'
       OR pol.policyname ILIKE '%image%'
       OR pol.policyname ILIKE '%public access%'
    THEN
      EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', pol.policyname);
    END IF;
  END LOOP;
END $$;

-- 4. CREATE CLEAN, ROBUST RLS POLICIES FOR 'listing-images' BUCKET

-- A. PUBLIC READ: Anyone (logged in or anonymous) can view listing and avatar images
CREATE POLICY "listing_images_public_select"
ON storage.objects FOR SELECT
USING ( bucket_id = 'listing-images' );

-- B. OWNER INSERT: Authenticated users can only upload into their own folder ({user_id}/...)
-- Prevents uploading into other users' folders
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

-- C. OWNER UPDATE: Authenticated users can only update/replace files in their own folder
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

-- D. OWNER DELETE: Authenticated users can only delete files in their own folder
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

-- 5. ENSURE public.listing_images TABLE EXISTS AND HAS RLS
CREATE TABLE IF NOT EXISTS public.listing_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_listing_images_listing_id ON public.listing_images(listing_id);

ALTER TABLE public.listing_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view listing images" ON public.listing_images;
DROP POLICY IF EXISTS "Owners can add images" ON public.listing_images;
DROP POLICY IF EXISTS "Owners can delete images" ON public.listing_images;
DROP POLICY IF EXISTS "listing_images_public_read" ON public.listing_images;
DROP POLICY IF EXISTS "listing_images_owner_insert" ON public.listing_images;
DROP POLICY IF EXISTS "listing_images_owner_delete" ON public.listing_images;

CREATE POLICY "listing_images_public_read"
ON public.listing_images FOR SELECT
USING (true);

CREATE POLICY "listing_images_owner_insert"
ON public.listing_images FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.listings
    WHERE id = listing_id AND seller_id = auth.uid()
  )
);

CREATE POLICY "listing_images_owner_delete"
ON public.listing_images FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.listings
    WHERE id = listing_id AND seller_id = auth.uid()
  )
);

-- 6. ENSURE public.profiles TABLE & FOREIGN KEY FOR RELATIONAL JOINS
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  bio TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Public can view profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_listings_profiles' AND table_name = 'listings'
  ) THEN
    BEGIN
      ALTER TABLE public.listings
      ADD CONSTRAINT fk_listings_profiles
      FOREIGN KEY (seller_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Notice: %', SQLERRM;
    END;
  END IF;
END $$;
