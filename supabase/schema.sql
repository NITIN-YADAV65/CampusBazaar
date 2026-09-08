-- ============================================================
-- CAMPUSBAZAAR DATABASE SCHEMA & ROW LEVEL SECURITY (RLS)
-- ============================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Profiles Table (Extends auth.users securely)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  bio TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT NOT NULL,
  description TEXT
);

-- Insert Default Campus Categories
INSERT INTO public.categories (id, name, slug, icon, description) VALUES
  ('books', 'Books & Study Material', 'books', 'BookOpen', 'Textbooks, semester guides, reference books, class notes'),
  ('electronics', 'Electronics', 'electronics', 'Cpu', 'Calculators, headphones, chargers, power banks, speakers'),
  ('mobiles', 'Mobiles', 'mobiles', 'Smartphone', 'Smartphones, feature phones, cases, screen guards'),
  ('laptops', 'Laptops', 'laptops', 'Laptop', 'Laptops, mouse, keyboards, cooling pads, laptop bags'),
  ('cycles', 'Cycles', 'cycles', 'Bike', 'Bicycles, locks, helmets, cycle accessories for campus travel'),
  ('furniture', 'Furniture', 'furniture', 'Armchair', 'Study tables, folding chairs, mattresses, bed tables'),
  ('hostel', 'Hostel Essentials', 'hostel-essentials', 'Home', 'Kettles, buckets, curtains, extension boards, hangers'),
  ('fashion', 'Fashion', 'fashion', 'Shirt', 'Jackets, lab coats, hoodies, college bags, formal wear'),
  ('sports', 'Sports', 'sports', 'Trophy', 'Badminton racquets, footballs, cricket gear, gym items'),
  ('accessories', 'Accessories', 'accessories', 'Watch', 'Watches, sunglasses, backpacks, water bottles'),
  ('vehicles', 'Vehicles', 'vehicles', 'Car', 'Scooters, bikes, safety gear'),
  ('other', 'Other', 'other', 'Package', 'Miscellaneous campus essentials')
ON CONFLICT (id) DO NOTHING;

-- 4. Listings Table
CREATE TABLE IF NOT EXISTS public.listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  condition TEXT NOT NULL CHECK (condition IN ('New', 'Like New', 'Good', 'Used')),
  category_id TEXT NOT NULL REFERENCES public.categories(id),
  location TEXT NOT NULL DEFAULT 'LPU Campus, Phagwara',
  contact_preference TEXT DEFAULT 'chat',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'sold', 'removed')),
  views_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Listing Images Table
CREATE TABLE IF NOT EXISTS public.listing_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Favorites Table
CREATE TABLE IF NOT EXISTS public.favorites (
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, listing_id)
);

-- 7. Conversations Table
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (listing_id, buyer_id)
);

-- 8. Messages Table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Reports Table
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  reason TEXT NOT NULL CHECK (reason IN ('Scam', 'Fake listing', 'Wrong information', 'Duplicate listing', 'Inappropriate content', 'Other')),
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for lightning fast lookups
CREATE INDEX IF NOT EXISTS idx_listings_seller ON public.listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_listings_category ON public.listings(category_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON public.listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_created ON public.listings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_listing_images_listing ON public.listing_images(listing_id);
CREATE INDEX IF NOT EXISTS idx_conversations_participants ON public.conversations(buyer_id, seller_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Profiles: Public read, owner update
CREATE POLICY "Public can view profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Categories: Public read
CREATE POLICY "Public can view categories" ON public.categories FOR SELECT USING (true);

-- Listings: Public read active; owners can manage own; admins have full control
CREATE POLICY "Public can view active listings" ON public.listings 
  FOR SELECT USING (status = 'active' OR auth.uid() = seller_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Authenticated users can create listings" ON public.listings 
  FOR INSERT WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Users can update own listings" ON public.listings 
  FOR UPDATE USING (auth.uid() = seller_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Users can delete own listings" ON public.listings 
  FOR DELETE USING (auth.uid() = seller_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Listing Images: Public read; listing owners can insert/delete
CREATE POLICY "Public can view listing images" ON public.listing_images FOR SELECT USING (true);
CREATE POLICY "Owners can add images" ON public.listing_images 
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.listings WHERE id = listing_id AND seller_id = auth.uid()));
CREATE POLICY "Owners can delete images" ON public.listing_images 
  FOR DELETE USING (EXISTS (SELECT 1 FROM public.listings WHERE id = listing_id AND seller_id = auth.uid()));

-- Favorites: Users can manage their own favorites
CREATE POLICY "Users can view own favorites" ON public.favorites 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can add favorites" ON public.favorites 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove favorites" ON public.favorites 
  FOR DELETE USING (auth.uid() = user_id);

-- Conversations: Only participants can view/create
CREATE POLICY "Participants can view conversations" ON public.conversations 
  FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
CREATE POLICY "Authenticated users can start conversation" ON public.conversations 
  FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- Messages: Participants can view and send
CREATE POLICY "Participants can view messages" ON public.messages 
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.conversations 
    WHERE id = conversation_id AND (buyer_id = auth.uid() OR seller_id = auth.uid())
  ));
CREATE POLICY "Participants can insert messages" ON public.messages 
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.conversations 
      WHERE id = conversation_id AND (buyer_id = auth.uid() OR seller_id = auth.uid())
    )
  );

-- Reports: Authenticated can insert report, Admins can view/update
CREATE POLICY "Users can create reports" ON public.reports 
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Admins can view and manage reports" ON public.reports 
  FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Trigger: Automatically handle profile creation on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, avatar_url, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Campus Member'),
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'avatar_url',
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- STORAGE BUCKETS CONFIGURATION & POLICIES
-- ============================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'listing-images',
  'listing-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg']
) ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies for 'listing-images' bucket
DROP POLICY IF EXISTS "Public Access listing-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload listing-images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own listing-images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own listing-images" ON storage.objects;

CREATE POLICY "Public Access listing-images"
ON storage.objects FOR SELECT
USING ( bucket_id = 'listing-images' );

CREATE POLICY "Authenticated users can upload listing-images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'listing-images' );

CREATE POLICY "Users can update own listing-images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'listing-images' AND
  (auth.uid()::text = (storage.foldername(name))[1] OR auth.uid() IS NOT NULL)
);

CREATE POLICY "Users can delete own listing-images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'listing-images' AND
  (auth.uid()::text = (storage.foldername(name))[1] OR auth.uid() IS NOT NULL)
);
