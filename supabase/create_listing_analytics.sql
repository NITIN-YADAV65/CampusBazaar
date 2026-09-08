-- ============================================================
-- CAMPUSBAZAAR: REAL LISTING ANALYTICS (VIEWS & LIKES)
-- ============================================================
-- Creates listing_views, listing_likes, triggers, RLS, and RPCs.
-- ============================================================

-- 1. Table: listing_views
CREATE TABLE IF NOT EXISTS public.listing_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  viewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_listing_viewer UNIQUE (listing_id, viewer_id)
);

CREATE INDEX IF NOT EXISTS idx_listing_views_listing_id ON public.listing_views(listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_views_viewer_id ON public.listing_views(viewer_id);

-- 2. Table: listing_likes
CREATE TABLE IF NOT EXISTS public.listing_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_listing_user_like UNIQUE (listing_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_listing_likes_listing_id ON public.listing_likes(listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_likes_user_id ON public.listing_likes(user_id);

-- 3. Columns on public.listings for atomic, real-time counters
ALTER TABLE public.listings 
ADD COLUMN IF NOT EXISTS likes_count INT NOT NULL DEFAULT 0;

ALTER TABLE public.listings 
ALTER COLUMN views_count SET DEFAULT 0;

-- Synchronize initial counts
UPDATE public.listings l
SET 
  views_count = COALESCE((SELECT COUNT(*) FROM public.listing_views v WHERE v.listing_id = l.id), l.views_count, 0),
  likes_count = COALESCE((SELECT COUNT(*) FROM public.listing_likes k WHERE k.listing_id = l.id), 0);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.listing_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_likes ENABLE ROW LEVEL SECURITY;

-- Clean existing policies if re-running
DROP POLICY IF EXISTS "Authenticated users can create own view records" ON public.listing_views;
DROP POLICY IF EXISTS "Users can view own views" ON public.listing_views;
DROP POLICY IF EXISTS "Authenticated users can insert own likes" ON public.listing_likes;
DROP POLICY IF EXISTS "Users can delete own likes" ON public.listing_likes;
DROP POLICY IF EXISTS "Users can view own likes" ON public.listing_likes;

-- RLS Policies for listing_views
-- Authenticated users can insert their own view record
CREATE POLICY "Authenticated users can create own view records" 
  ON public.listing_views FOR INSERT 
  WITH CHECK (auth.uid() = viewer_id);

-- Users can only select their own views (viewer identities never exposed publicly)
CREATE POLICY "Users can view own views" 
  ON public.listing_views FOR SELECT 
  USING (auth.uid() = viewer_id);

-- RLS Policies for listing_likes
-- Users can insert their own like
CREATE POLICY "Authenticated users can insert own likes" 
  ON public.listing_likes FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own like
CREATE POLICY "Users can delete own likes" 
  ON public.listing_likes FOR DELETE 
  USING (auth.uid() = user_id);

-- Users can select their own likes to check liked status
CREATE POLICY "Users can view own likes" 
  ON public.listing_likes FOR SELECT 
  USING (auth.uid() = user_id);

-- 5. Auto-Synchronize listing counters with Triggers
CREATE OR REPLACE FUNCTION public.sync_listing_views_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.listings
    SET views_count = (SELECT COUNT(*) FROM public.listing_views WHERE listing_id = NEW.listing_id)
    WHERE id = NEW.listing_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.listings
    SET views_count = (SELECT COUNT(*) FROM public.listing_views WHERE listing_id = OLD.listing_id)
    WHERE id = OLD.listing_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_sync_listing_views_count ON public.listing_views;
CREATE TRIGGER trg_sync_listing_views_count
  AFTER INSERT OR DELETE ON public.listing_views
  FOR EACH ROW EXECUTE FUNCTION public.sync_listing_views_count();

CREATE OR REPLACE FUNCTION public.sync_listing_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.listings
    SET likes_count = (SELECT COUNT(*) FROM public.listing_likes WHERE listing_id = NEW.listing_id)
    WHERE id = NEW.listing_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.listings
    SET likes_count = (SELECT COUNT(*) FROM public.listing_likes WHERE listing_id = OLD.listing_id)
    WHERE id = OLD.listing_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_sync_listing_likes_count ON public.listing_likes;
CREATE TRIGGER trg_sync_listing_likes_count
  AFTER INSERT OR DELETE ON public.listing_likes
  FOR EACH ROW EXECUTE FUNCTION public.sync_listing_likes_count();

-- 6. RPC: record_listing_view
-- Atomically inserts unique view for auth.uid() and returns current total view count
CREATE OR REPLACE FUNCTION public.record_listing_view(target_listing_id UUID)
RETURNS INTEGER AS $$
DECLARE
  curr_user_id UUID;
  current_count INTEGER;
BEGIN
  curr_user_id := auth.uid();
  IF curr_user_id IS NOT NULL THEN
    INSERT INTO public.listing_views (listing_id, viewer_id)
    VALUES (target_listing_id, curr_user_id)
    ON CONFLICT (listing_id, viewer_id) DO NOTHING;
  END IF;

  SELECT views_count INTO current_count
  FROM public.listings
  WHERE id = target_listing_id;

  RETURN COALESCE(current_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. RPC: toggle_listing_like
-- Atomically toggles like for auth.uid() and returns { is_liked: boolean, likes_count: int }
CREATE OR REPLACE FUNCTION public.toggle_listing_like(target_listing_id UUID)
RETURNS JSONB AS $$
DECLARE
  curr_user_id UUID;
  already_liked BOOLEAN;
  new_count INTEGER;
BEGIN
  curr_user_id := auth.uid();
  IF curr_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required to like a listing';
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.listing_likes
    WHERE listing_id = target_listing_id AND user_id = curr_user_id
  ) INTO already_liked;

  IF already_liked THEN
    DELETE FROM public.listing_likes
    WHERE listing_id = target_listing_id AND user_id = curr_user_id;
  ELSE
    INSERT INTO public.listing_likes (listing_id, user_id)
    VALUES (target_listing_id, curr_user_id)
    ON CONFLICT (listing_id, user_id) DO NOTHING;
  END IF;

  SELECT likes_count INTO new_count
  FROM public.listings
  WHERE id = target_listing_id;

  RETURN jsonb_build_object(
    'is_liked', NOT already_liked,
    'likes_count', COALESCE(new_count, 0)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
