-- ============================================================
-- CAMPUSBAZAAR: PUSH SUBSCRIPTIONS & SCHEMA CACHE RELOAD
-- ============================================================
-- Features:
-- 1. Creates public.push_subscriptions table
-- 2. Enforces unique constraint on endpoint (supports onConflict: 'endpoint')
-- 3. Supports multiple devices/browsers per user (each has unique endpoint)
-- 4. Full Row Level Security (RLS) ensuring users only access their own subscriptions
-- 5. Automatically notifies PostgREST to reload schema cache
-- ============================================================

-- 1. Enable UUID Extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create public.push_subscriptions Table
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Create Indexes for High-Performance Querying
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user ON public.push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint ON public.push_subscriptions(endpoint);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view own push subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Users can insert own push subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Users can update own push subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Users can delete own push subscriptions" ON public.push_subscriptions;

-- 5. Strict RLS Policies: Authenticated users manage ONLY their own subscriptions
CREATE POLICY "Users can view own push subscriptions"
  ON public.push_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own push subscriptions"
  ON public.push_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own push subscriptions"
  ON public.push_subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own push subscriptions"
  ON public.push_subscriptions FOR DELETE
  USING (auth.uid() = user_id);

-- 6. Also ensure notifications table exists with RLS for in-app alerts
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('new_listing', 'new_message', 'listing_sold', 'price_change', 'system')),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read_at TIMESTAMPTZ,
  push_sent_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON public.notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read) WHERE is_read = FALSE;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Authenticated users can insert notifications" ON public.notifications;

CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
  ON public.notifications FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Enable Realtime for notifications
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
      AND schemaname = 'public' 
      AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Realtime publication already configured: %', SQLERRM;
END $$;

-- 7. SECURE PUSH SUBSCRIPTION UPSERT & OWNERSHIP TRANSFER RPC
-- Safely reassigns an existing browser endpoint to the current authenticated user (auth.uid())
-- Prevents RLS USING violations during account switching on the same browser profile
CREATE OR REPLACE FUNCTION public.save_push_subscription(
  p_endpoint TEXT,
  p_p256dh TEXT,
  p_auth TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- 1. Strictly require authentication
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required to register push subscription';
  END IF;

  -- 2. Validate input parameters
  IF p_endpoint IS NULL OR trim(p_endpoint) = '' THEN
    RAISE EXCEPTION 'Invalid push subscription endpoint';
  END IF;
  IF p_p256dh IS NULL OR trim(p_p256dh) = '' THEN
    RAISE EXCEPTION 'Invalid p256dh key';
  END IF;
  IF p_auth IS NULL OR trim(p_auth) = '' THEN
    RAISE EXCEPTION 'Invalid auth secret';
  END IF;

  -- 3. Upsert with safe ownership transfer:
  -- If endpoint is new: inserts with user_id = auth.uid()
  -- If endpoint already exists (e.g. User A previously used this browser):
  -- safely transfers endpoint ownership to the current authenticated user (auth.uid())
  INSERT INTO public.push_subscriptions (
    user_id,
    endpoint,
    p256dh,
    auth,
    updated_at
  ) VALUES (
    v_user_id,
    trim(p_endpoint),
    trim(p_p256dh),
    trim(p_auth),
    NOW()
  )
  ON CONFLICT (endpoint) DO UPDATE
  SET user_id = v_user_id,
      p256dh = EXCLUDED.p256dh,
      auth = EXCLUDED.auth,
      updated_at = NOW();

  RETURN jsonb_build_object('success', true);
END;
$$;

-- Security hardening: Grant execution to authenticated users only; revoke from anon/public
REVOKE EXECUTE ON FUNCTION public.save_push_subscription(TEXT, TEXT, TEXT) FROM public;
REVOKE EXECUTE ON FUNCTION public.save_push_subscription(TEXT, TEXT, TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION public.save_push_subscription(TEXT, TEXT, TEXT) TO authenticated;

-- 8. Reload Supabase PostgREST Schema Cache Immediately
NOTIFY pgrst, 'reload schema';
