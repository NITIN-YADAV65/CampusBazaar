-- ============================================================
-- CAMPUSBAZAAR: CHAT SYSTEM ENHANCEMENTS MIGRATION (NON-DESTRUCTIVE)
-- ============================================================
-- Features:
-- 1. Photo sharing (image_url) & flexible content constraint
-- 2. Message editing & soft-deletion tracking
-- 3. Message reactions table (message_reactions) with RLS
-- 4. Server-side update protection trigger (SECURITY INVOKER, sender-only edits, immutable IDs)
-- 5. Realtime replication setup for reactions
-- ============================================================

-- ============================================================
-- 1. EXTEND MESSAGES TABLE
-- ============================================================
ALTER TABLE public.messages 
  ADD COLUMN IF NOT EXISTS image_url TEXT,
  ADD COLUMN IF NOT EXISTS is_edited BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS edited_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Allow NULL content when an image is attached or when a message is soft-deleted
ALTER TABLE public.messages ALTER COLUMN content DROP NOT NULL;

-- Enforce that active messages must have either non-empty text or an image
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_message_content_or_image'
  ) THEN
    ALTER TABLE public.messages 
      ADD CONSTRAINT chk_message_content_or_image 
      CHECK (
        is_deleted = TRUE
        OR (content IS NOT NULL AND trim(content) <> '') 
        OR (image_url IS NOT NULL AND trim(image_url) <> '')
      );
  END IF;
END $$;

-- Index for soft-deleted message queries
CREATE INDEX IF NOT EXISTS idx_messages_deleted ON public.messages(is_deleted);

-- ============================================================
-- 2. MESSAGE REACTIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.message_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reaction TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_message_user_reaction UNIQUE (message_id, user_id, reaction)
);

CREATE INDEX IF NOT EXISTS idx_message_reactions_message_id ON public.message_reactions(message_id);
CREATE INDEX IF NOT EXISTS idx_message_reactions_user_id ON public.message_reactions(user_id);

-- Enable Row Level Security on message_reactions
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Participants can view message reactions" ON public.message_reactions;
DROP POLICY IF EXISTS "Participants can insert message reactions" ON public.message_reactions;
DROP POLICY IF EXISTS "Users can delete own message reactions" ON public.message_reactions;

-- SELECT: Only conversation participants (buyer or seller) can view reactions
CREATE POLICY "Participants can view message reactions"
  ON public.message_reactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.messages m
      JOIN public.conversations c ON c.id = m.conversation_id
      WHERE m.id = message_reactions.message_id
        AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
    )
  );

-- INSERT: Authenticated user can only insert reactions for their own user_id in conversations they participate in
CREATE POLICY "Participants can insert message reactions"
  ON public.message_reactions FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.messages m
      JOIN public.conversations c ON c.id = m.conversation_id
      WHERE m.id = message_reactions.message_id
        AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
    )
  );

-- DELETE: Users can only delete their own reactions
CREATE POLICY "Users can delete own message reactions"
  ON public.message_reactions FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- 3. SENDER-ONLY UPDATE & DELETE PROTECTION TRIGGER
-- ============================================================
-- Uses SECURITY INVOKER (runs with caller privileges) and explicit search_path.
-- Works harmoniously with the existing RLS UPDATE policy:
-- Allows recipients to update is_read, but strictly restricts content/delete modifications to sender.
CREATE OR REPLACE FUNCTION public.handle_message_update_protection()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- 1. Prevent modifying immutable identifiers
  IF (NEW.id IS DISTINCT FROM OLD.id) THEN
    RAISE EXCEPTION 'Cannot modify message id';
  END IF;

  IF (NEW.conversation_id IS DISTINCT FROM OLD.conversation_id) THEN
    RAISE EXCEPTION 'Cannot modify conversation_id';
  END IF;

  IF (NEW.sender_id IS DISTINCT FROM OLD.sender_id) THEN
    RAISE EXCEPTION 'Cannot modify sender_id';
  END IF;

  IF (NEW.created_at IS DISTINCT FROM OLD.created_at) THEN
    RAISE EXCEPTION 'Cannot modify created_at';
  END IF;

  -- 2. Prevent modifying or undeleting an already soft-deleted message
  IF OLD.is_deleted = TRUE THEN
    RAISE EXCEPTION 'Deleted messages cannot be modified or undeleted';
  END IF;

  -- 3. Check if sender-restricted fields are being modified
  IF (NEW.content IS DISTINCT FROM OLD.content)
     OR (NEW.image_url IS DISTINCT FROM OLD.image_url)
     OR (NEW.is_edited IS DISTINCT FROM OLD.is_edited)
     OR (NEW.edited_at IS DISTINCT FROM OLD.edited_at)
     OR (NEW.is_deleted IS DISTINCT FROM OLD.is_deleted)
     OR (NEW.deleted_at IS DISTINCT FROM OLD.deleted_at) THEN
     
    -- Strictly enforce: Only the original sender can edit or delete their message
    IF auth.uid() IS NOT NULL AND auth.uid() <> OLD.sender_id THEN
      RAISE EXCEPTION 'Only the original sender can edit or delete this message';
    END IF;

    -- Handle soft deletion: clear content and photo, record deleted timestamp
    IF NEW.is_deleted = TRUE AND OLD.is_deleted = FALSE THEN
      NEW.deleted_at = NOW();
      NEW.content = NULL;
      NEW.image_url = NULL;
    END IF;

    -- Handle text editing: automatically set edited flag and timestamp
    IF (NEW.content IS DISTINCT FROM OLD.content) AND NEW.is_deleted = FALSE THEN
      NEW.is_edited = TRUE;
      NEW.edited_at = NOW();
    END IF;
  END IF;

  -- Note: Other columns like `is_read` can be updated by conversation participants
  -- as permitted by the "Participants can update messages" RLS policy.
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_message_updates ON public.messages;
CREATE TRIGGER trg_protect_message_updates
  BEFORE UPDATE ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.handle_message_update_protection();

-- ============================================================
-- 4. REALTIME REPLICATION CONFIGURATION
-- ============================================================
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.message_reactions;
  EXCEPTION
    WHEN duplicate_object THEN NULL;
    WHEN others THEN NULL;
  END;
END $$;

ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.message_reactions REPLICA IDENTITY FULL;

-- Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';
