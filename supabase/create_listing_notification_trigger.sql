-- ============================================================
-- CAMPUSBAZAAR: AUTOMATIC IN-APP NOTIFICATION TRIGGERS & RPC
-- ============================================================
-- Features:
-- 1. Automatic PostgreSQL trigger for new listings (notifies all campus members, excludes seller)
-- 2. Backwards-compatible RPC create_listing_notifications(target_listing_id)
-- 3. Automatic PostgreSQL trigger for new messages (notifies recipient, excludes sender, respects blocks)
-- 4. Atomic execution inside PostgreSQL (immune to client-side RLS read restrictions)
-- ============================================================

-- 1. NEW LISTING IN-APP NOTIFICATION TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION public.handle_new_listing_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Fire only when listing is active (either on INSERT or when status transitions to 'active')
  IF (TG_OP = 'INSERT' AND NEW.status = 'active') OR 
     (TG_OP = 'UPDATE' AND OLD.status <> 'active' AND NEW.status = 'active') THEN
    INSERT INTO public.notifications (
      user_id,
      type,
      title,
      body,
      data,
      is_read
    )
    SELECT
      u.id,
      'new_listing',
      'New listing on CampusBazaar',
      'New listing: ' || NEW.title,
      jsonb_build_object(
        'listing_id', NEW.id,
        'title', NEW.title,
        'price', NEW.price,
        'url', '/product/' || NEW.id
      ),
      false
    FROM auth.users u
    WHERE u.id <> NEW.seller_id;
  END IF;

  RETURN NEW;
END;
$$;

-- Drop and recreate trigger on public.listings
DROP TRIGGER IF EXISTS trigger_notify_new_listing ON public.listings;
CREATE TRIGGER trigger_notify_new_listing
  AFTER INSERT OR UPDATE OF status ON public.listings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_listing_notification();

-- 2. BACKWARDS-COMPATIBLE RPC FOR CREATING LISTING NOTIFICATIONS
CREATE OR REPLACE FUNCTION public.create_listing_notifications(target_listing_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_listing RECORD;
  v_count INTEGER := 0;
BEGIN
  SELECT id, title, price, seller_id, status
  INTO v_listing
  FROM public.listings
  WHERE id = target_listing_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Listing not found');
  END IF;

  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    body,
    data,
    is_read
  )
  SELECT
    u.id,
    'new_listing',
    'New listing on CampusBazaar',
    'New listing: ' || v_listing.title,
    jsonb_build_object(
      'listing_id', v_listing.id,
      'title', v_listing.title,
      'price', v_listing.price,
      'url', '/product/' || v_listing.id
    ),
    false
  FROM auth.users u
  WHERE u.id <> v_listing.seller_id;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN jsonb_build_object('success', true, 'inserted_count', v_count);
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_listing_notifications(UUID) TO authenticated;

-- 3. NEW MESSAGE IN-APP NOTIFICATION TRIGGER FUNCTION
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
  -- Only trigger for active (non-deleted) messages
  IF NEW.is_deleted IS TRUE THEN
    RETURN NEW;
  END IF;

  -- Fetch conversation participants
  SELECT buyer_id, seller_id, listing_id
  INTO v_conv
  FROM public.conversations
  WHERE id = NEW.conversation_id;

  IF NOT FOUND THEN
    RETURN NEW;
  END IF;

  -- Determine recipient
  IF NEW.sender_id = v_conv.buyer_id THEN
    v_recipient_id := v_conv.seller_id;
  ELSE
    v_recipient_id := v_conv.buyer_id;
  END IF;

  -- Safety: Do not notify sender
  IF v_recipient_id = NEW.sender_id THEN
    RETURN NEW;
  END IF;

  -- Check if communication is blocked
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

  -- Fetch sender's name
  SELECT COALESCE(full_name, 'Campus Student')
  INTO v_sender_name
  FROM public.profiles
  WHERE id = NEW.sender_id;

  -- Create short, privacy-safe preview
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

  -- Insert in-app notification for recipient
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

-- Drop and recreate trigger on public.messages
DROP TRIGGER IF EXISTS trigger_notify_new_message ON public.messages;
CREATE TRIGGER trigger_notify_new_message
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_message_notification();

-- 4. RELOAD SCHEMA CACHE
NOTIFY pgrst, 'reload schema';
