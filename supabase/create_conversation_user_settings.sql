-- ============================================================
-- CAMPUSBAZAAR: CONVERSATION USER SETTINGS (PIN & HIDE CHAT)
-- ============================================================
-- Allows individual users to:
-- 1. Pin conversations to top of list (only for their account)
-- 2. Hide/delete conversations from their inbox (without deleting
--    shared conversation/messages or affecting the other participant)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.conversation_user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
  is_hidden BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_conversation_user_settings UNIQUE (conversation_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_conv_user_settings_lookup 
  ON public.conversation_user_settings(user_id, conversation_id);

CREATE INDEX IF NOT EXISTS idx_conv_user_settings_pinned 
  ON public.conversation_user_settings(user_id, is_pinned) 
  WHERE is_pinned = TRUE;

CREATE INDEX IF NOT EXISTS idx_conv_user_settings_hidden 
  ON public.conversation_user_settings(user_id, is_hidden) 
  WHERE is_hidden = TRUE;

-- Enable Row Level Security
ALTER TABLE public.conversation_user_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own conversation settings" ON public.conversation_user_settings;
DROP POLICY IF EXISTS "Users can insert own conversation settings" ON public.conversation_user_settings;
DROP POLICY IF EXISTS "Users can update own conversation settings" ON public.conversation_user_settings;
DROP POLICY IF EXISTS "Users can delete own conversation settings" ON public.conversation_user_settings;

-- SELECT: Users can only view their own settings
CREATE POLICY "Users can view own conversation settings"
  ON public.conversation_user_settings FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT: Users can only insert their own settings, and must participate in the conversation
CREATE POLICY "Users can insert own conversation settings"
  ON public.conversation_user_settings FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
    )
  );

-- UPDATE: Users can only update their own settings
CREATE POLICY "Users can update own conversation settings"
  ON public.conversation_user_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- DELETE: Users can only delete their own settings
CREATE POLICY "Users can delete own conversation settings"
  ON public.conversation_user_settings FOR DELETE
  USING (auth.uid() = user_id);

-- Realtime replication
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.conversation_user_settings;
  EXCEPTION
    WHEN duplicate_object THEN NULL;
    WHEN others THEN NULL;
  END;
END $$;

ALTER TABLE public.conversation_user_settings REPLICA IDENTITY FULL;

-- Reload schema cache
NOTIFY pgrst, 'reload schema';
