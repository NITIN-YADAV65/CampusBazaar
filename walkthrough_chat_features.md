# Walkthrough: Message Replies, User Blocking & User Reporting

We have implemented the three requested features for the CampusBazaar messaging system:
1. **Reply to Message** (with compact quoted previews, composer preview banner, jump-to-highlight, and mobile swipe-right)
2. **Block & Unblock User** (with confirmation dialog, server-side trigger enforcement, UI disabled composer banner, and historical message preservation)
3. **Report User** (with safety modal, 5 reason categories, optional details, duplicate prevention, and strict RLS)

---

## 1. Non-Destructive SQL Migration

A dedicated, non-destructive migration file has been created at:
[`supabase/chat_reply_block_report.sql`](file:///c:/Users/Prachi%20Yadav/OneDrive/Documents/new_project/supabase/chat_reply_block_report.sql)

> [!IMPORTANT]
> **Manual Execution in Supabase Required**: In accordance with the safety rules, this migration was **not executed automatically**. Please copy and execute the script in your Supabase project's SQL Editor.

### What the Migration Does:
1. **Message Replies (`public.messages`)**:
   - Adds `reply_to_message_id UUID REFERENCES public.messages(id) ON DELETE SET NULL`.
   - Adds index `idx_messages_reply_to_message_id`.
   - Adds trigger `trg_check_message_reply_same_conversation` ensuring a reply only references a message in the same conversation.
2. **User Blocking (`public.user_blocks`)**:
   - Creates `user_blocks` table with `blocker_id`, `blocked_id`, unique constraint, and self-blocking check.
   - Adds RLS policies (`SELECT`, `INSERT`, `DELETE`).
   - Adds `BEFORE INSERT` trigger on `public.messages` (`check_message_block_enforcement`) that blocks sending if either participant has blocked the other.
3. **User Reporting (`public.user_reports`)**:
   - Creates `user_reports` table with `reporter_user_id`, `reported_user_id`, `conversation_id`, `reason`, `description`, and `status`.
   - Adds RLS policies ensuring normal users can insert reports and only view their own reports.
   - Prevents duplicate report spam per conversation and reason.

---

## 2. Changes Made in Codebase

### A. Database Types ([`database.types.ts`](file:///c:/Users/Prachi%20Yadav/OneDrive/Documents/new_project/src/lib/database.types.ts))
- Added `reply_to_message_id?: string | null` and `reply_to?: Message | null` to `Message`.
- Added `UserBlock` and `UserReport` interfaces and `UserReportReason` type.

### B. Message Actions Menu ([`MessageActionsMenu.tsx`](file:///c:/Users/Prachi%20Yadav/OneDrive/Documents/new_project/src/components/chat/MessageActionsMenu.tsx))
- Added `onReply: () => void` prop.
- Added a dedicated quick-action `Reply` button beside `Copy`.
- Added `Reply` action inside the 3-dots message options dropdown for mobile & desktop usability.

### C. Chat UI & Logic ([`MessagesPage.tsx`](file:///c:/Users/Prachi%20Yadav/OneDrive/Documents/new_project/src/pages/MessagesPage.tsx))
- **Reply Experience**:
  - Clicking "Reply" displays a compact "Replying to..." preview banner above the message composer with the original sender's name, shortened text, or photo thumbnail, plus a cancel `✕` button.
  - Automatically focuses the message input field.
  - Sending a reply attaches `reply_to_message_id`. Backward-compatible logic ensures standard messages omit the key and never fail even if the SQL migration hasn't been executed yet.
  - Inside the chat bubble, replied messages show a compact quoted preview with sender name, snippet, or photo thumbnail.
  - Clicking the quoted preview smoothly scrolls the internal chat window to the original message and flashes a golden pulse highlight for 1.8 seconds.
  - Mobile swipe-right gesture on message bubbles initiates Reply smoothly without disrupting vertical scrolling.
- **Block & Unblock User**:
  - Added "Block user" / "Unblock user" inside the existing chat header 3-dot dropdown.
  - Added confirmation modal with clear explanation that historical messages and the conversation remain preserved.
  - Blocker and blocked user cannot send new messages; the composer displays an informational banner with an "Unblock" button.
  - Client state is synchronized with Supabase and cached in `localStorage` for immediate responsiveness.
- **Report User**:
  - Added "Report user" inside the chat header 3-dot dropdown.
  - Report modal allows selecting from the 5 required reasons: `Scam / Fraud`, `Harassment`, `Prohibited item`, `Spam`, and `Other`.
  - Optional textarea for additional details.
  - Submits safely to Supabase `user_reports` with duplicate protection, preserving the conversation as evidence.
  - Shows green confirmation toast upon submission.

---

## 3. Verification & Build Results

- Executed `npm run build`:
  ```bash
  > tsc -b && vite build
  ✓ 1915 modules transformed.
  ✓ built in 679ms
  ```
  **0 TypeScript errors, 0 build errors.**
- Verified non-interference with existing features: text messages, photo sharing, emoji picker, reactions, edit/delete, pin chat, and delete chat remain fully functional.
- Verified no git commits or git push operations were performed.
