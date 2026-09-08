-- ============================================================
-- CAMPUSBAZAAR: CHAT SYSTEM COMPLETE DATABASE MIGRATION
-- ============================================================
-- Creates profiles, conversations, messages, foreign keys, 
-- robust RLS policies, auto-timestamp triggers, and realtime.
-- ============================================================

-- 1. Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 2. PROFILES TABLE & AUTOMATIC SYNC
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT 'Campus Student',
  phone TEXT,
  avatar_url TEXT,
  bio TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Backfill profiles for all existing auth users
INSERT INTO public.profiles (id, full_name, phone, avatar_url, role)
SELECT 
  id, 
  COALESCE(raw_user_meta_data->>'full_name', 'Campus Student'),
  raw_user_meta_data->>'phone',
  raw_user_meta_data->>'avatar_url',
  'user'
FROM auth.users
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  phone = COALESCE(EXCLUDED.phone, public.profiles.phone),
  avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url);

-- Automatic trigger on auth.users signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, avatar_url, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Campus Student'),
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'avatar_url',
    'user'
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = COALESCE(EXCLUDED.phone, public.profiles.phone),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Public can view profiles" 
  ON public.profiles FOR SELECT 
  USING (true);

CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- ============================================================
-- 3. CONVERSATIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_listing_buyer UNIQUE (listing_id, buyer_id)
);

-- Fast lookup indexes
CREATE INDEX IF NOT EXISTS idx_conversations_buyer_id ON public.conversations(buyer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_seller_id ON public.conversations(seller_id);
CREATE INDEX IF NOT EXISTS idx_conversations_listing_id ON public.conversations(listing_id);
CREATE INDEX IF NOT EXISTS idx_conversations_participants ON public.conversations(buyer_id, seller_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON public.conversations(updated_at DESC);

-- Enable RLS on conversations
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Participants can view conversations" ON public.conversations;
DROP POLICY IF EXISTS "Authenticated users can start conversation" ON public.conversations;
DROP POLICY IF EXISTS "Participants can update conversation" ON public.conversations;
DROP POLICY IF EXISTS "Participants can delete conversation" ON public.conversations;

-- SELECT: Both buyer and seller can view their conversations
CREATE POLICY "Participants can view conversations" 
  ON public.conversations FOR SELECT 
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- INSERT: Either participant (usually buyer initiating) can create conversation
CREATE POLICY "Authenticated users can start conversation" 
  ON public.conversations FOR INSERT 
  WITH CHECK (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- UPDATE: Either participant can touch updated_at
CREATE POLICY "Participants can update conversation" 
  ON public.conversations FOR UPDATE 
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- DELETE: Either participant can delete conversation
CREATE POLICY "Participants can delete conversation" 
  ON public.conversations FOR DELETE 
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- ============================================================
-- 4. MESSAGES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for messages
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at ASC);

-- Enable RLS on messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Participants can view messages" ON public.messages;
DROP POLICY IF EXISTS "Participants can insert messages" ON public.messages;
DROP POLICY IF EXISTS "Participants can update messages" ON public.messages;

-- SELECT: Only buyer or seller in the conversation can view messages
CREATE POLICY "Participants can view messages" 
  ON public.messages FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = messages.conversation_id AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
    )
  );

-- INSERT: Sender must be the authenticated user and must belong to conversation
CREATE POLICY "Participants can insert messages" 
  ON public.messages FOR INSERT 
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = messages.conversation_id AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
    )
  );

-- UPDATE: Participants can mark messages as read
CREATE POLICY "Participants can update messages" 
  ON public.messages FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = messages.conversation_id AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
    )
  );

-- ============================================================
-- 5. AUTO-UPDATE CONVERSATION TIMESTAMP ON NEW MESSAGE
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.conversations
  SET updated_at = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_update_conversation_timestamp ON public.messages;
CREATE TRIGGER trg_update_conversation_timestamp
  AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.update_conversation_timestamp();

-- ============================================================
-- 6. ENABLE SUPABASE REALTIME REPLICATION
-- ============================================================
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
  EXCEPTION
    WHEN duplicate_object THEN NULL;
    WHEN others THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  EXCEPTION
    WHEN duplicate_object THEN NULL;
    WHEN others THEN NULL;
  END;
END $$;

ALTER TABLE public.conversations REPLICA IDENTITY FULL;
ALTER TABLE public.messages REPLICA IDENTITY FULL;

-- ============================================================
-- 7. OPTIONAL FOREIGN KEY FROM LISTINGS TO PROFILES
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_listings_seller_profile'
  ) THEN
    ALTER TABLE public.listings
      ADD CONSTRAINT fk_listings_seller_profile
      FOREIGN KEY (seller_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
EXCEPTION
  WHEN others THEN NULL;
END $$;

-- Reload schema cache
NOTIFY pgrst, 'reload schema';
