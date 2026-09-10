-- ============================================================
-- CAMPUSBAZAAR: REAL PUSH & IN-APP NOTIFICATIONS MIGRATION
-- ============================================================
-- Features:
-- 1. In-App Notifications table (public.notifications) with RLS
-- 2. Web Push Subscriptions table (public.push_subscriptions) with RLS
-- 3. Automatic Realtime publication for notifications
-- 4. Safe notification triggers for new messages (excluding sender, respects blocks)
-- 5. RPC function for new listing notifications (targets only subscribed users, excludes seller)
-- ============================================================

-- Enable UUID extension if not present
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. PUSH SUBSCRIPTIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for push_subscriptions
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user ON public.push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint ON public.push_subscriptions(endpoint);

-- Enable RLS on push_subscriptions
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view own push subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Users can insert own push subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Users can update own push subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Users can delete own push subscriptions" ON public.push_subscriptions;

-- RLS: Users can only manage their own subscriptions
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

-- ============================================================
-- 2. NOTIFICATIONS TABLE
-- ============================================================
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

-- Indexes for lightning fast notification queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON public.notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read) WHERE is_read = FALSE;

-- Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Authenticated users can insert notifications" ON public.notifications;

-- RLS: Users view, update, delete only their own notifications
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

-- ============================================================
-- 3. ENABLE SUPABASE REALTIME REPLICATION FOR NOTIFICATIONS
-- ============================================================
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
    RAISE NOTICE 'Realtime publication already configured or requires superuser: %', SQLERRM;
END $$;

-- ============================================================
-- 4. NEW LISTING NOTIFICATION RPC FUNCTION
-- ============================================================
-- Generates in-app notifications only for users who have active push subscriptions
-- Excludes the listing creator. Never touches old listings.
CREATE OR REPLACE FUNCTION public.create_listing_notifications(target_listing_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_listing RECORD;
  v_seller_name TEXT;
  v_inserted_count INT := 0;
  v_user RECORD;
  v_notif_title TEXT;
  v_notif_body TEXT;
BEGIN
  -- 1. Fetch listing details
  SELECT l.id, l.title, l.seller_id, l.price, l.category_id
  INTO v_listing
  FROM public.listings l
  WHERE l.id = target_listing_id AND l.status = 'active';

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Listing not found or not active');
  END IF;

  -- 2. Fetch seller name
  SELECT COALESCE(full_name, 'Campus Student')
  INTO v_seller_name
  FROM public.profiles
  WHERE id = v_listing.seller_id;

  v_notif_title := 'New listing on CampusBazaar';
  v_notif_body := 'New listing: ' || v_listing.title;

  -- 3. Insert notification for every distinct user subscribed to push (excluding the seller)
  FOR v_user IN 
    SELECT DISTINCT user_id 
    FROM public.push_subscriptions 
    WHERE user_id <> v_listing.seller_id
  LOOP
    INSERT INTO public.notifications (
      user_id,
      type,
      title,
      body,
      data,
      is_read
    ) VALUES (
      v_user.user_id,
      'new_listing',
      v_notif_title,
      v_notif_body,
      jsonb_build_object(
        'listing_id', v_listing.id,
        'title', v_listing.title,
        'price', v_listing.price,
        'url', '/product/' || v_listing.id
      ),
      false
    );
    v_inserted_count := v_inserted_count + 1;
  END LOOP;

  RETURN jsonb_build_object(
    'success', true, 
    'listing_id', target_listing_id, 
    'notified_count', v_inserted_count
  );
END;
$$;

-- ============================================================
-- 5. NEW MESSAGE NOTIFICATION TRIGGER
-- ============================================================
-- Automatically creates an in-app notification when a new message is inserted
-- Excludes sender; respects blocking if user_blocks table exists
CREATE OR REPLACE FUNCTION public.handle_new_message_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_conv RECORD;
  v_recipient_id UUID;
  v_sender_name TEXT;
  v_preview TEXT;
  v_is_blocked BOOLEAN := FALSE;
BEGIN
  -- Only trigger for non-deleted messages
  IF NEW.is_deleted IS TRUE THEN
    RETURN NEW;
  END IF;

  -- 1. Fetch conversation participants
  SELECT buyer_id, seller_id, listing_id
  INTO v_conv
  FROM public.conversations
  WHERE id = NEW.conversation_id;

  IF NOT FOUND THEN
    RETURN NEW;
  END IF;

  -- 2. Determine recipient (the other participant)
  IF NEW.sender_id = v_conv.buyer_id THEN
    v_recipient_id := v_conv.seller_id;
  ELSE
    v_recipient_id := v_conv.buyer_id;
  END IF;

  -- Safety: Do not notify self
  IF v_recipient_id = NEW.sender_id THEN
    RETURN NEW;
  END IF;

  -- 3. Check if recipient has blocked sender (if user_blocks table exists)
  BEGIN
    IF EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'user_blocks'
    ) THEN
      SELECT EXISTS (
        SELECT 1 FROM public.user_blocks 
        WHERE (blocker_id = v_recipient_id AND blocked_id = NEW.sender_id)
           OR (blocker_id = NEW.sender_id AND blocked_id = v_recipient_id)
      ) INTO v_is_blocked;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    v_is_blocked := FALSE;
  END;

  IF v_is_blocked THEN
    RETURN NEW;
  END IF;

  -- 4. Get sender's display name
  SELECT COALESCE(full_name, 'Campus Student')
  INTO v_sender_name
  FROM public.profiles
  WHERE id = NEW.sender_id;

  -- 5. Safe short preview (do not expose private content)
  IF NEW.image_url IS NOT NULL AND (NEW.content IS NULL OR trim(NEW.content) = '') THEN
    v_preview := 'Sent a photo';
  ELSIF NEW.content IS NOT NULL THEN
    v_preview := substring(trim(NEW.content) FROM 1 FOR 60);
    IF length(trim(NEW.content)) > 60 THEN
      v_preview := v_preview || '...';
    END IF;
  ELSE
    v_preview := 'Sent a message';
  END IF;

  -- 6. Insert in-app notification for recipient
  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    body,
    data,
    is_read
  ) VALUES (
    v_recipient_id,
    'new_message',
    'New message on CampusBazaar',
    'New message from ' || v_sender_name || ': ' || v_preview,
    jsonb_build_object(
      'conversation_id', NEW.conversation_id,
      'message_id', NEW.id,
      'sender_id', NEW.sender_id,
      'url', '/messages?conversationId=' || NEW.conversation_id
    ),
    false
  );

  RETURN NEW;
END;
$$;

-- Drop trigger if already exists and recreate
DROP TRIGGER IF EXISTS trigger_notify_new_message ON public.messages;
CREATE TRIGGER trigger_notify_new_message
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_message_notification();
