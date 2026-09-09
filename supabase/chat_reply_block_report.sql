-- ============================================================
-- CAMPUSBAZAAR: CHAT REPLY, USER BLOCKING & REPORTING MIGRATION (NON-DESTRUCTIVE)
-- ============================================================
-- Features:
-- 1. Message Reply reference (reply_to_message_id) with same-conversation check
-- 2. User Blocks table (user_blocks) with server-side block enforcement trigger
-- 3. User Reports table (user_reports) with strict RLS and anti-spam protection
-- ============================================================

-- ============================================================
-- 1. FEATURE 1: MESSAGE REPLIES
-- ============================================================
ALTER TABLE public.messages 
  ADD COLUMN IF NOT EXISTS reply_to_message_id UUID REFERENCES public.messages(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_messages_reply_to_message_id 
  ON public.messages(reply_to_message_id);

-- Enforce that a reply must belong to the exact same conversation
CREATE OR REPLACE FUNCTION public.check_message_reply_same_conversation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.reply_to_message_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.messages m
      WHERE m.id = NEW.reply_to_message_id
        AND m.conversation_id = NEW.conversation_id
    ) THEN
      RAISE EXCEPTION 'reply_to_message_id must reference a message in the same conversation';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER SET search_path = public;

DROP TRIGGER IF EXISTS trg_check_message_reply_same_conversation ON public.messages;
CREATE TRIGGER trg_check_message_reply_same_conversation
  BEFORE INSERT OR UPDATE OF reply_to_message_id ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.check_message_reply_same_conversation();


-- ============================================================
-- 2. FEATURE 2: USER BLOCKING (user_blocks)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_user_block UNIQUE (blocker_id, blocked_id),
  CONSTRAINT chk_no_self_block CHECK (blocker_id <> blocked_id)
);

CREATE INDEX IF NOT EXISTS idx_user_blocks_blocker ON public.user_blocks(blocker_id);
CREATE INDEX IF NOT EXISTS idx_user_blocks_blocked ON public.user_blocks(blocked_id);

-- Enable RLS on user_blocks
ALTER TABLE public.user_blocks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view blocks they created or are targeted by" ON public.user_blocks;
DROP POLICY IF EXISTS "Users can create blocks" ON public.user_blocks;
DROP POLICY IF EXISTS "Users can delete their own blocks" ON public.user_blocks;

-- SELECT: Users can check who they blocked, and if they have been blocked in a conversation
CREATE POLICY "Users can view blocks they created or are targeted by"
  ON public.user_blocks FOR SELECT
  USING (
    auth.uid() = blocker_id 
    OR auth.uid() = blocked_id
  );

-- INSERT: Users can only block other users (never self)
CREATE POLICY "Users can create blocks"
  ON public.user_blocks FOR INSERT
  WITH CHECK (
    auth.uid() = blocker_id 
    AND blocker_id <> blocked_id
  );

-- DELETE: Users can only unblock users they themselves blocked
CREATE POLICY "Users can delete their own blocks"
  ON public.user_blocks FOR DELETE
  USING (auth.uid() = blocker_id);

-- Server-side message block enforcement:
-- When a user attempts to insert a new message, verify neither participant has blocked the other.
CREATE OR REPLACE FUNCTION public.check_message_block_enforcement()
RETURNS TRIGGER AS $$
DECLARE
  v_other_user_id UUID;
BEGIN
  -- Determine the other participant in the conversation
  SELECT 
    CASE 
      WHEN c.buyer_id = NEW.sender_id THEN c.seller_id 
      WHEN c.seller_id = NEW.sender_id THEN c.buyer_id
      ELSE NULL 
    END INTO v_other_user_id
  FROM public.conversations c
  WHERE c.id = NEW.conversation_id;

  IF v_other_user_id IS NOT NULL THEN
    -- Check if sender blocked other user OR other user blocked sender
    IF EXISTS (
      SELECT 1 FROM public.user_blocks ub
      WHERE (ub.blocker_id = NEW.sender_id AND ub.blocked_id = v_other_user_id)
         OR (ub.blocker_id = v_other_user_id AND ub.blocked_id = NEW.sender_id)
    ) THEN
      RAISE EXCEPTION 'Cannot send message: messaging is blocked between these users.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_check_message_block_enforcement ON public.messages;
CREATE TRIGGER trg_check_message_block_enforcement
  BEFORE INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.check_message_block_enforcement();


-- ============================================================
-- 3. FEATURE 3: USER REPORTING (user_reports)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reported_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_no_self_report CHECK (reporter_user_id <> reported_user_id),
  CONSTRAINT chk_report_status CHECK (status IN ('pending', 'resolved', 'dismissed'))
);

CREATE INDEX IF NOT EXISTS idx_user_reports_reporter ON public.user_reports(reporter_user_id);
CREATE INDEX IF NOT EXISTS idx_user_reports_reported ON public.user_reports(reported_user_id);
CREATE INDEX IF NOT EXISTS idx_user_reports_conv ON public.user_reports(conversation_id);

-- Prevent spamming duplicate reports:
-- Note: In standard SQL, UNIQUE index treats multiple NULLs as distinct.
-- We use two partial unique indexes to guarantee duplicate prevention whether conversation_id is present OR NULL.
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_reports_unique_with_conv 
  ON public.user_reports(reporter_user_id, reported_user_id, conversation_id, reason)
  WHERE conversation_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_reports_unique_without_conv 
  ON public.user_reports(reporter_user_id, reported_user_id, reason)
  WHERE conversation_id IS NULL;

-- Enable RLS on user_reports
ALTER TABLE public.user_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert their own reports" ON public.user_reports;
DROP POLICY IF EXISTS "Users can view only their own submitted reports" ON public.user_reports;

-- INSERT: Normal users can submit a report against another user
-- Security check enforces that initial status is strictly 'pending' and reporter cannot be reported
CREATE POLICY "Users can insert their own reports"
  ON public.user_reports FOR INSERT
  WITH CHECK (
    auth.uid() = reporter_user_id 
    AND reporter_user_id <> reported_user_id
    AND status = 'pending'
  );

-- SELECT: Normal users can only inspect reports they themselves created
-- Moderation/report details are never exposed to the reported user or third parties
CREATE POLICY "Users can view only their own submitted reports"
  ON public.user_reports FOR SELECT
  USING (auth.uid() = reporter_user_id);

-- Note: UPDATE and DELETE are not granted to normal users to preserve evidence.
