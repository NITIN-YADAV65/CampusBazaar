import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Send,
  ShieldCheck,
  Image as ImageIcon,
  Smile,
  X,
  ArrowLeft,
  Loader2,
  Trash2,
  Edit2,
  AlertCircle,
  Pin,
  PinOff,
  MoreVertical,
  Reply,
  Ban,
  Flag,
  UserCheck,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMarketplace } from '../context/MarketplaceContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Conversation, Message, MessageReaction, UserReportReason } from '../lib/database.types';
import { ChatEmojiPicker } from '../components/chat/ChatEmojiPicker';
import { MessageActionsMenu, ReactionBadges } from '../components/chat/MessageActionsMenu';

// Helper to detect if message consists only of 1-3 emojis
const isEmojiOnlyText = (text: string | null | undefined): boolean => {
  if (!text) return false;
  const trimmed = text.trim();
  // Match 1 to 3 emojis with optional spaces
  const emojiRegex = /^(\p{Extended_Pictographic}|\p{Emoji_Presentation}|\s){1,10}$/u;
  // Make sure it doesn't contain standard alphanumeric characters
  const hasLettersOrDigits = /[a-zA-Z0-9]/i.test(trimmed);
  return !hasLettersOrDigits && emojiRegex.test(trimmed) && trimmed.length > 0;
};

// Format file size for preview
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

export const MessagesPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const targetListingId = searchParams.get('listingId');
  const targetSellerId = searchParams.get('sellerId');
  const targetConversationId = searchParams.get('conversationId');

  const { user } = useAuth();
  const { listings, refreshUnreadCount } = useMarketplace();

  // Conversations state: empty when Supabase is configured, or preview mock
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    if (isSupabaseConfigured) return [];
    return [
      {
        id: 'conv-1',
        listing_id: 'mock-1',
        buyer_id: user?.id || 'current-user',
        seller_id: 'seller-mock',
        created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
        updated_at: new Date(Date.now() - 3600000 * 2).toISOString(),
        unread_count: 1,
        listing: listings[0],
        seller: {
          id: 'seller-mock',
          full_name: 'Campus Student',
          avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
          role: 'user',
          created_at: '',
          updated_at: ''
        },
        last_message: {
          id: 'msg-1',
          conversation_id: 'conv-1',
          sender_id: 'seller-mock',
          content: 'Hi! Is the item still available?',
          is_read: false,
          created_at: new Date(Date.now() - 3600000 * 2).toISOString()
        }
      }
    ];
  });

  const [activeConversationId, setActiveConversationId] = useState<string>(() => {
    return isSupabaseConfigured ? (targetConversationId || '') : 'conv-1';
  });
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Photo sharing state
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Emoji picker state
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Edit message state
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [editText, setEditText] = useState('');

  // Delete message confirmation modal state
  const [deleteConfirmMsg, setDeleteConfirmMsg] = useState<Message | null>(null);

  // Hovered message for actions menu on desktop
  const [hoveredMsgId, setHoveredMsgId] = useState<string | null>(null);

  // User-specific conversation settings (pinning & hiding)
  const [userSettings, setUserSettings] = useState<Record<string, { is_pinned?: boolean; is_hidden?: boolean }>>(() => {
    if (!user?.id) return {};
    try {
      const saved = localStorage.getItem(`cb_conv_settings_${user.id}`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Swipe-to-pin and hover state for conversation list
  const [swipedConvId, setSwipedConvId] = useState<string | null>(null);
  const [hoveredConvId, setHoveredConvId] = useState<string | null>(null);
  const [touchStartPos, setTouchStartPos] = useState<{ x: number; y: number } | null>(null);

  // Three-dot header menu state & delete chat confirmation modal
  const [showHeaderMenu, setShowHeaderMenu] = useState(false);
  const [showDeleteChatConfirm, setShowDeleteChatConfirm] = useState(false);
  const headerMenuRef = useRef<HTMLDivElement>(null);

  // Feature 1: Reply to message state
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [highlightedMsgId, setHighlightedMsgId] = useState<string | null>(null);
  const touchMessageStartRef = useRef<{ x: number; y: number; msgId: string } | null>(null);

  // Features 2 & 3: Block & Report user state
  const [blockedUserIds, setBlockedUserIds] = useState<string[]>(() => {
    if (!user?.id) return [];
    try {
      const saved = localStorage.getItem(`cb_blocked_users_${user.id}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isBlockedByOther, setIsBlockedByOther] = useState(false);
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);
  const [showUnblockConfirm, setShowUnblockConfirm] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState<UserReportReason>('Scam / Fraud');
  const [reportDescription, setReportDescription] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [reportSuccessToast, setReportSuccessToast] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatStreamRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  // Helper to fetch all conversations for the current authenticated user (as buyer OR seller)
  const fetchConversations = useCallback(async () => {
    if (!isSupabaseConfigured || !user) return;

    try {
      let { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          listing:listings(*, images:listing_images(*)),
          seller:profiles!seller_id(*),
          buyer:profiles!buyer_id(*)
        `)
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order('updated_at', { ascending: false });

      if (error) {
        console.warn('Joined profiles query failed, falling back to listings join:', error.message);
        const fallbackRes = await supabase
          .from('conversations')
          .select(`
            *,
            listing:listings(*, images:listing_images(*))
          `)
          .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
          .order('updated_at', { ascending: false });

        if (!fallbackRes.error && fallbackRes.data) {
          data = fallbackRes.data;
          error = null;
        }
      }

      if (error) {
        console.error('Error fetching conversations:', error);
        return;
      }

      if (data) {
        const convIds = data.map((c: any) => c.id);
        const latestMessages: Record<string, Message> = {};
        if (convIds.length > 0) {
          try {
            const { data: recentMsgs } = await supabase
              .from('messages')
              .select('*')
              .in('conversation_id', convIds)
              .order('created_at', { ascending: false });

            if (recentMsgs) {
              recentMsgs.forEach((m: any) => {
                if (!latestMessages[m.conversation_id]) {
                  latestMessages[m.conversation_id] = m;
                }
              });
            }
          } catch (e) {
            console.warn('Could not load latest message previews:', e);
          }
        }

        const mapped: Conversation[] = data.map((conv: any) => ({
          ...conv,
          seller: conv.seller || {
            id: conv.seller_id,
            full_name: 'Campus Student',
            avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
            role: 'user',
            created_at: conv.created_at,
            updated_at: conv.updated_at
          },
          buyer: conv.buyer || {
            id: conv.buyer_id,
            full_name: 'Campus Student',
            avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
            role: 'user',
            created_at: conv.created_at,
            updated_at: conv.updated_at
          },
          last_message: latestMessages[conv.id] || conv.last_message
        }));

        setConversations(mapped);

        // Auto-select first conversation if none selected and not explicitly querying a listing
        setActiveConversationId(prev => {
          if (prev) return prev;
          if (targetConversationId && mapped.some(c => c.id === targetConversationId)) {
            return targetConversationId;
          }
          if (mapped.length > 0 && !targetListingId) {
            return mapped[0].id;
          }
          return '';
        });
      }
    } catch (err) {
      console.error('Exception fetching conversations:', err);
    }
  }, [user, targetListingId, targetConversationId]);

  // Initial fetch on mount or user change
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Fetch user settings (pins & hidden chats)
  const fetchUserSettings = useCallback(async () => {
    if (!isSupabaseConfigured || !user) return;
    try {
      const { data, error } = await supabase
        .from('conversation_user_settings')
        .select('*')
        .eq('user_id', user.id);

      if (!error && data) {
        const map: Record<string, { is_pinned?: boolean; is_hidden?: boolean }> = {};
        data.forEach((s: any) => {
          map[s.conversation_id] = {
            is_pinned: s.is_pinned,
            is_hidden: s.is_hidden
          };
        });
        setUserSettings(prev => {
          const merged = { ...prev, ...map };
          try {
            localStorage.setItem(`cb_conv_settings_${user.id}`, JSON.stringify(merged));
          } catch {}
          return merged;
        });
      }
    } catch (e) {
      console.warn('Could not load conversation user settings:', e);
    }
  }, [user]);

  useEffect(() => {
    fetchUserSettings();
  }, [fetchUserSettings]);

  // Close header menu on outside click
  useEffect(() => {
    if (!showHeaderMenu) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (headerMenuRef.current && !headerMenuRef.current.contains(e.target as Node)) {
        setShowHeaderMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showHeaderMenu]);

  // Toggle Pin for a conversation (persists per-user)
  const handleTogglePin = async (convId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const currentPinned = Boolean(userSettings[convId]?.is_pinned);
    const newPinned = !currentPinned;

    setUserSettings(prev => {
      const next = {
        ...prev,
        [convId]: { ...prev[convId], is_pinned: newPinned }
      };
      if (user?.id) {
        try {
          localStorage.setItem(`cb_conv_settings_${user.id}`, JSON.stringify(next));
        } catch {}
      }
      return next;
    });

    if (isSupabaseConfigured && user) {
      try {
        await supabase
          .from('conversation_user_settings')
          .upsert({
            conversation_id: convId,
            user_id: user.id,
            is_pinned: newPinned,
            updated_at: new Date().toISOString()
          }, { onConflict: 'conversation_id,user_id' });
      } catch (err) {
        console.warn('Error syncing pin setting with Supabase:', err);
      }
    }
  };

  // Hide conversation for current user only ("Delete chat")
  const handleHideConversation = async (convId: string) => {
    setUserSettings(prev => {
      const next = {
        ...prev,
        [convId]: { ...prev[convId], is_hidden: true }
      };
      if (user?.id) {
        try {
          localStorage.setItem(`cb_conv_settings_${user.id}`, JSON.stringify(next));
        } catch {}
      }
      return next;
    });

    setShowHeaderMenu(false);
    setShowDeleteChatConfirm(false);

    // If the active conversation was hidden, deselect it
    setActiveConversationId(prev => (prev === convId ? '' : prev));

    if (isSupabaseConfigured && user) {
      try {
        await supabase
          .from('conversation_user_settings')
          .upsert({
            conversation_id: convId,
            user_id: user.id,
            is_hidden: true,
            updated_at: new Date().toISOString()
          }, { onConflict: 'conversation_id,user_id' });
      } catch (err) {
        console.warn('Error syncing hide setting with Supabase:', err);
      }
    }
    refreshUnreadCount();
  };

  // Re-fetch conversations when window regains focus
  useEffect(() => {
    const handleFocus = () => {
      fetchConversations();
      fetchUserSettings();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchConversations, fetchUserSettings]);

  const markingReadRef = useRef<Set<string>>(new Set());

  // Helper to mark unread messages in a conversation as read
  const markMessagesAsRead = useCallback(async (convId: string) => {
    if (!isSupabaseConfigured || !user?.id || !convId) return;
    if (markingReadRef.current.has(convId)) return;

    markingReadRef.current.add(convId);
    try {
      const { data, error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', convId)
        .neq('sender_id', user.id)
        .eq('is_read', false)
        .select('id');

      if (!error && data && data.length > 0) {
        setMessages(prev =>
          prev.map(m =>
            m.conversation_id === convId && m.sender_id !== user.id && !m.is_read
              ? { ...m, is_read: true }
              : m
          )
        );

        setConversations(prev =>
          prev.map(c =>
            c.id === convId && c.last_message && c.last_message.sender_id !== user.id
              ? { ...c, last_message: { ...c.last_message, is_read: true }, unread_count: 0 }
              : c
          )
        );

        refreshUnreadCount();
      }
    } catch (err) {
      console.warn('Error marking messages as read:', err);
    } finally {
      markingReadRef.current.delete(convId);
    }
  }, [user?.id, refreshUnreadCount]);

  // Fetch real messages & reactions for the active conversation
  const fetchMessages = useCallback(async (convId: string) => {
    if (!isSupabaseConfigured || !user || !convId) return;

    try {
      const { data: msgs, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', convId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        return;
      }

      if (msgs) {
        const msgIds = msgs.map((m: any) => m.id);
        if (msgIds.length > 0) {
          try {
            const { data: reactionsData } = await supabase
              .from('message_reactions')
              .select(`*, user:profiles!user_id(id, full_name, avatar_url)`)
              .in('message_id', msgIds);

            if (reactionsData) {
              const reactionsByMsgId: Record<string, MessageReaction[]> = {};
              reactionsData.forEach((r: any) => {
                if (!reactionsByMsgId[r.message_id]) reactionsByMsgId[r.message_id] = [];
                reactionsByMsgId[r.message_id].push(r);
              });

              msgs.forEach((m: any) => {
                m.reactions = reactionsByMsgId[m.id] || [];
              });
            }
          } catch (reactErr) {
            console.warn('Reactions fetch skipped or table not initialized:', reactErr);
          }
        }
        setMessages(msgs);

        // If there are unread incoming messages in this active conversation, mark them as read
        const hasUnread = msgs.some((m: any) => m.sender_id !== user.id && !m.is_read);
        if (hasUnread) {
          markMessagesAsRead(convId);
        }
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  }, [user, markMessagesAsRead]);

  useEffect(() => {
    if (activeConversationId) {
      fetchMessages(activeConversationId);
    } else {
      setMessages([]);
    }
  }, [activeConversationId, fetchMessages]);

  // Handle URL params: find existing conversation first, otherwise create one in Supabase
  useEffect(() => {
    if (!isSupabaseConfigured || !user || !targetListingId || !targetSellerId) return;

    if (user.id === targetSellerId) {
      return;
    }

    let isMounted = true;

    const initConversation = async () => {
      try {
        const { data: existingConv } = await supabase
          .from('conversations')
          .select(`
            *,
            listing:listings(*, images:listing_images(*)),
            seller:profiles!seller_id(*),
            buyer:profiles!buyer_id(*)
          `)
          .eq('listing_id', targetListingId)
          .eq('buyer_id', user.id)
          .maybeSingle();

        if (existingConv && isMounted) {
          setActiveConversationId(existingConv.id);
          setConversations(prev => {
            if (prev.some(c => c.id === existingConv.id)) {
              return prev.map(c => c.id === existingConv.id ? (existingConv as Conversation) : c);
            }
            return [existingConv as Conversation, ...prev];
          });
          return;
        }

        const { data: newConv, error: createError } = await supabase
          .from('conversations')
          .insert({
            listing_id: targetListingId,
            buyer_id: user.id,
            seller_id: targetSellerId
          })
          .select(`
            *,
            listing:listings(*, images:listing_images(*)),
            seller:profiles!seller_id(*),
            buyer:profiles!buyer_id(*)
          `)
          .single();

        if (newConv && isMounted) {
          setActiveConversationId(newConv.id);
          setConversations(prev => {
            if (prev.some(c => c.id === newConv.id)) return prev;
            return [newConv as Conversation, ...prev];
          });
          return;
        }

        if (createError && isMounted) {
          console.warn('Conversation insert error, fetching existing:', createError.message);
          const { data: fallbackConv } = await supabase
            .from('conversations')
            .select(`
              *,
              listing:listings(*, images:listing_images(*)),
              seller:profiles!seller_id(*),
              buyer:profiles!buyer_id(*)
            `)
            .eq('listing_id', targetListingId)
            .eq('buyer_id', user.id)
            .maybeSingle();

          if (fallbackConv && isMounted) {
            setActiveConversationId(fallbackConv.id);
            setConversations(prev => {
              if (prev.some(c => c.id === fallbackConv.id)) return prev;
              return [fallbackConv as Conversation, ...prev];
            });
          }
        }
      } catch (err) {
        console.error('Error finding or creating conversation:', err);
      }
    };

    initConversation();

    return () => {
      isMounted = false;
    };
  }, [targetListingId, targetSellerId, user]);

  // Real-time messages subscription (INSERT, UPDATE, DELETE) for active conversation
  useEffect(() => {
    if (!isSupabaseConfigured || !activeConversationId) return;

    const channel = supabase
      .channel(`chat-messages:${activeConversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${activeConversationId}`
        },
        (payload) => {
          const newMsg = payload.new as Message;
          newMsg.reactions = [];
          setMessages(prev => {
            if (prev.some(m => m.id === newMsg.id)) {
              return prev.map(m => m.id === newMsg.id ? { ...newMsg, reactions: m.reactions || [] } : m);
            }
            return [...prev, newMsg];
          });

          setConversations(prev =>
            prev.map(c =>
              c.id === activeConversationId
                ? { ...c, last_message: newMsg, updated_at: newMsg.created_at }
                : c
            )
          );

          // If incoming message is from the other party and currently active, mark as read immediately
          if (newMsg.sender_id !== user?.id) {
            markMessagesAsRead(activeConversationId);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${activeConversationId}`
        },
        (payload) => {
          const updated = payload.new as Message;
          setMessages(prev =>
            prev.map(m => (m.id === updated.id ? { ...m, ...updated, reactions: m.reactions } : m))
          );
          setConversations(prev =>
            prev.map(c =>
              c.id === activeConversationId && c.last_message?.id === updated.id
                ? { ...c, last_message: { ...c.last_message, ...updated } }
                : c
            )
          );
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${activeConversationId}`
        },
        (payload) => {
          setMessages(prev => prev.filter(m => m.id !== (payload.old as any).id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeConversationId, user?.id, markMessagesAsRead]);

  // Real-time reactions subscription for the active conversation
  useEffect(() => {
    if (!isSupabaseConfigured || !activeConversationId) return;

    const reactionsChannel = supabase
      .channel(`chat-reactions:${activeConversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'message_reactions'
        },
        (payload) => {
          const newReaction = payload.new as MessageReaction;
          setMessages(prev =>
            prev.map(msg => {
              if (msg.id === newReaction.message_id) {
                const existing = msg.reactions || [];
                if (existing.some(r => r.id === newReaction.id)) return msg;
                return { ...msg, reactions: [...existing, newReaction] };
              }
              return msg;
            })
          );
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'message_reactions'
        },
        (payload) => {
          const deletedReaction = payload.old as { id: string };
          setMessages(prev =>
            prev.map(msg => ({
              ...msg,
              reactions: (msg.reactions || []).filter(r => r.id !== deletedReaction.id)
            }))
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(reactionsChannel);
    };
  }, [activeConversationId]);

  // Global realtime subscription for inbox updates
  useEffect(() => {
    if (!isSupabaseConfigured || !user) return;

    const inboxChannel = supabase
      .channel(`chat-inbox:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations'
        },
        () => {
          fetchConversations();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(inboxChannel);
    };
  }, [user, fetchConversations]);

  // Auto scroll internal chat stream to bottom when messages update, without scrolling window/page
  useEffect(() => {
    if (chatStreamRef.current) {
      chatStreamRef.current.scrollTo({
        top: chatStreamRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages]);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  // Handle Photo Selection
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      alert(`Image is too large (${formatFileSize(file.size)}). Maximum allowed size is 5MB.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Validate MIME type
    if (!file.type.startsWith('image/')) {
      alert('Only image files (JPEG, PNG, WebP, GIF) are supported.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }

    const preview = URL.createObjectURL(file);
    setSelectedImage(file);
    setImagePreviewUrl(preview);
  };

  // Remove selected photo before sending
  const handleCancelSelectedImage = () => {
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    setSelectedImage(null);
    setImagePreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Insert emoji into input
  const handleInsertEmoji = (emoji: string) => {
    if (editingMessage) {
      setEditText(prev => prev + emoji);
      editInputRef.current?.focus();
    } else {
      setInputText(prev => prev + emoji);
      inputRef.current?.focus();
    }
  };

  // Toggle Message Reaction
  const handleToggleReaction = async (messageId: string, emoji: string) => {
    if (!user) {
      alert('Please log in to react to messages.');
      return;
    }

    const targetMsg = messages.find(m => m.id === messageId);
    if (!targetMsg || targetMsg.is_deleted) return;

    const existingReaction = targetMsg.reactions?.find(
      r => r.reaction === emoji && r.user_id === user.id
    );

    if (existingReaction) {
      // Optimistic delete
      setMessages(prev =>
        prev.map(m =>
          m.id === messageId
            ? { ...m, reactions: (m.reactions || []).filter(r => r.id !== existingReaction.id) }
            : m
        )
      );

      if (isSupabaseConfigured) {
        try {
          await supabase
            .from('message_reactions')
            .delete()
            .match({ message_id: messageId, user_id: user.id, reaction: emoji });
        } catch (err) {
          console.error('Error removing reaction:', err);
        }
      }
    } else {
      // Optimistic add
      const tempId = `temp-${Date.now()}`;
      const newReaction: MessageReaction = {
        id: tempId,
        message_id: messageId,
        user_id: user.id,
        reaction: emoji,
        created_at: new Date().toISOString(),
        user: {
          id: user.id,
          full_name: (user.user_metadata?.full_name as string) || 'You',
          role: 'user',
          created_at: '',
          updated_at: ''
        }
      };

      setMessages(prev =>
        prev.map(m =>
          m.id === messageId
            ? { ...m, reactions: [...(m.reactions || []), newReaction] }
            : m
        )
      );

      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase
            .from('message_reactions')
            .insert({
              message_id: messageId,
              user_id: user.id,
              reaction: emoji
            })
            .select('*')
            .single();

          if (!error && data) {
            // Replace temp id with real id
            setMessages(prev =>
              prev.map(m =>
                m.id === messageId
                  ? {
                      ...m,
                      reactions: (m.reactions || []).map(r => (r.id === tempId ? { ...r, id: data.id } : r))
                    }
                  : m
              )
            );
          }
        } catch (err) {
          console.error('Error adding reaction:', err);
        }
      }
    }
  };

  // Start editing a message
  const handleStartEdit = (msg: Message) => {
    if (msg.is_deleted || msg.sender_id !== (user?.id || 'current-user')) return;
    setEditingMessage(msg);
    setEditText(msg.content || '');
    setTimeout(() => {
      editInputRef.current?.focus();
    }, 50);
  };

  // Cancel edit mode
  const handleCancelEdit = () => {
    setEditingMessage(null);
    setEditText('');
  };

  // Save edited message
  const handleSaveEdit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editingMessage) return;

    const trimmed = editText.trim();
    if (!trimmed && !editingMessage.image_url) {
      alert('Message cannot be empty. If you wish to delete it, please use the Delete option.');
      return;
    }

    if (trimmed === editingMessage.content) {
      handleCancelEdit();
      return;
    }

    const updatedTime = new Date().toISOString();

    // Optimistic update
    setMessages(prev =>
      prev.map(m =>
        m.id === editingMessage.id
          ? { ...m, content: trimmed, is_edited: true, edited_at: updatedTime }
          : m
      )
    );

    const messageId = editingMessage.id;
    handleCancelEdit();

    if (isSupabaseConfigured) {
      try {
        let { error } = await supabase
          .from('messages')
          .update({
            content: trimmed,
            is_edited: true,
            edited_at: updatedTime
          })
          .eq('id', messageId);

        // Fallback if is_edited/edited_at columns do not exist yet in DB
        if (error && (error.message?.includes('is_edited') || error.message?.includes('schema cache'))) {
          const fallbackRes = await supabase
            .from('messages')
            .update({ content: trimmed })
            .eq('id', messageId);
          error = fallbackRes.error;
        }

        if (error) {
          console.error('Error saving edited message:', error);
          alert('Could not update message: ' + error.message);
        }
      } catch (err) {
        console.error('Exception saving edited message:', err);
      }
    }
  };

  // Delete message confirmation
  const handleConfirmDelete = async () => {
    if (!deleteConfirmMsg) return;
    const msgId = deleteConfirmMsg.id;
    const deletedTime = new Date().toISOString();

    // Optimistic update
    setMessages(prev =>
      prev.map(m =>
        m.id === msgId
          ? {
              ...m,
              is_deleted: true,
              deleted_at: deletedTime,
              content: null,
              image_url: null,
              reactions: []
            }
          : m
      )
    );

    setDeleteConfirmMsg(null);

    if (isSupabaseConfigured) {
      try {
        let { error } = await supabase
          .from('messages')
          .update({
            is_deleted: true,
            deleted_at: deletedTime,
            content: null,
            image_url: null
          })
          .eq('id', msgId);

        // Fallback if is_deleted column does not exist yet in DB
        if (error && (error.message?.includes('is_deleted') || error.message?.includes('schema cache'))) {
          const fallbackRes = await supabase
            .from('messages')
            .update({ content: 'This message was deleted' })
            .eq('id', msgId);
          error = fallbackRes.error;
        }

        if (error) {
          console.error('Error deleting message:', error);
          alert('Could not delete message: ' + error.message);
        }
      } catch (err) {
        console.error('Exception deleting message:', err);
      }
    }
  };

  const activeConv = conversations.find(c => c.id === activeConversationId);
  const activeListing = activeConv?.listing || listings.find(l => l.id === activeConv?.listing_id);
  const otherUserProfile = activeConv?.seller?.id === user?.id ? activeConv?.buyer : activeConv?.seller;
  const otherUserId = activeConv ? (activeConv.seller_id === user?.id ? activeConv.buyer_id : activeConv.seller_id) : '';
  const otherUserName = otherUserProfile?.full_name || 'Campus Student';
  const isBlockedByMe = Boolean(otherUserId && blockedUserIds.includes(otherUserId));

  // Fetch block status for current user and active conversation partner
  const fetchBlockStatus = useCallback(async () => {
    if (!isSupabaseConfigured || !user?.id || !otherUserId) {
      setIsBlockedByOther(false);
      return;
    }

    try {
      // 1. Check if other user blocked me
      const { data: blockedByOtherData } = await supabase
        .from('user_blocks')
        .select('id')
        .eq('blocker_id', otherUserId)
        .eq('blocked_id', user.id)
        .maybeSingle();

      setIsBlockedByOther(Boolean(blockedByOtherData));

      // 2. Also refresh who I blocked
      const { data: myBlocksData } = await supabase
        .from('user_blocks')
        .select('blocked_id')
        .eq('blocker_id', user.id);

      if (myBlocksData) {
        const ids = myBlocksData.map((b: any) => b.blocked_id);
        setBlockedUserIds(ids);
        try {
          localStorage.setItem(`cb_blocked_users_${user.id}`, JSON.stringify(ids));
        } catch {}
      }
    } catch (err) {
      console.warn('Block status check skipped or table not initialized:', err);
    }
  }, [user?.id, otherUserId]);

  useEffect(() => {
    fetchBlockStatus();
  }, [fetchBlockStatus]);

  // Block user handler
  const handleBlockUser = async () => {
    if (!otherUserId || !user?.id) return;
    if (otherUserId === user.id) {
      alert('You cannot block yourself.');
      return;
    }

    // Optimistic update
    setBlockedUserIds(prev => {
      const next = Array.from(new Set([...prev, otherUserId]));
      try {
        localStorage.setItem(`cb_blocked_users_${user.id}`, JSON.stringify(next));
      } catch {}
      return next;
    });

    setShowBlockConfirm(false);
    setShowHeaderMenu(false);

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('user_blocks')
          .insert({
            blocker_id: user.id,
            blocked_id: otherUserId
          });

        if (error && !error.message?.includes('duplicate key') && !error.message?.includes('unique_user_block')) {
          console.warn('Error saving block to Supabase:', error.message);
        }
      } catch (err) {
        console.warn('Error executing block on Supabase:', err);
      }
    }
  };

  // Unblock user handler
  const handleUnblockUser = async () => {
    if (!otherUserId || !user?.id) return;

    // Optimistic update
    setBlockedUserIds(prev => {
      const next = prev.filter(id => id !== otherUserId);
      try {
        localStorage.setItem(`cb_blocked_users_${user.id}`, JSON.stringify(next));
      } catch {}
      return next;
    });

    setShowUnblockConfirm(false);
    setShowHeaderMenu(false);

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('user_blocks')
          .delete()
          .eq('blocker_id', user.id)
          .eq('blocked_id', otherUserId);

        if (error) {
          console.warn('Error unblocking user in Supabase:', error.message);
        }
      } catch (err) {
        console.warn('Error executing unblock on Supabase:', err);
      }
    }
  };

  // Report user handler
  const handleReportUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otherUserId || !user?.id) return;

    if (otherUserId === user.id) {
      alert('You cannot report yourself.');
      return;
    }

    setIsSubmittingReport(true);

    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase
          .from('user_reports')
          .insert({
            reporter_user_id: user.id,
            reported_user_id: otherUserId,
            conversation_id: activeConversationId || null,
            reason: reportReason,
            description: reportDescription.trim() || null
          });

        if (error) {
          if (error.message?.includes('duplicate') || error.message?.includes('unique')) {
            console.log('Report already submitted for this reason');
          } else {
            console.warn('Error submitting report to Supabase:', error.message);
          }
        }
      }

      // Store in localStorage as well
      try {
        const savedReports = JSON.parse(localStorage.getItem(`cb_reports_${user.id}`) || '[]');
        savedReports.push({
          reporter_id: user.id,
          reported_id: otherUserId,
          conversation_id: activeConversationId,
          reason: reportReason,
          description: reportDescription,
          created_at: new Date().toISOString()
        });
        localStorage.setItem(`cb_reports_${user.id}`, JSON.stringify(savedReports));
      } catch {}

      setShowReportModal(false);
      setReportDescription('');
      setReportSuccessToast(`Report submitted. Our campus moderation team has received your report about ${otherUserName}.`);
      setTimeout(() => {
        setReportSuccessToast(null);
      }, 5000);
    } catch (err: any) {
      console.error('Report submission error:', err);
      alert('Failed to submit report. Please try again.');
    } finally {
      setIsSubmittingReport(false);
    }
  };

  // Feature 1: Reply handlers
  const handleStartReply = (msg: Message) => {
    if (msg.is_deleted) return;
    setReplyingTo(msg);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
  };

  const handleScrollToMessage = (targetMsgId: string) => {
    const el = document.getElementById(`msg-${targetMsgId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setHighlightedMsgId(targetMsgId);
      setTimeout(() => {
        setHighlightedMsgId(prev => (prev === targetMsgId ? null : prev));
      }, 1800);
    }
  };

  // Send message handler (with photo upload & reply support)
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    // If in edit mode, save edit instead
    if (editingMessage) {
      handleSaveEdit(e);
      return;
    }

    if (isBlockedByMe) {
      alert(`You have blocked ${otherUserName}. Please unblock them to send new messages.`);
      return;
    }

    if (isBlockedByOther) {
      alert(`You cannot send messages to this user because communication is blocked.`);
      return;
    }

    const textContent = inputText.trim();
    if ((!textContent && !selectedImage) || isSending) return;

    if (!activeConversationId) {
      console.warn('Cannot send message: no active conversation');
      return;
    }

    setIsSending(true);

    let uploadedImageUrl: string | null = null;

    try {
      // 1. Upload photo if selected
      if (selectedImage && isSupabaseConfigured && user) {
        const sanitizedName = selectedImage.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const storagePath = `${user.id}/chat/${Date.now()}-${sanitizedName}`;

        const { error: uploadError } = await supabase.storage
          .from('listing-images')
          .upload(storagePath, selectedImage, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('Image upload failed:', uploadError);
          alert('Failed to upload image: ' + uploadError.message);
          setIsSending(false);
          return;
        }

        const { data: publicUrlData } = supabase.storage
          .from('listing-images')
          .getPublicUrl(storagePath);

        uploadedImageUrl = publicUrlData.publicUrl;
      } else if (selectedImage && !isSupabaseConfigured) {
        // Mock fallback for preview without backend
        uploadedImageUrl = imagePreviewUrl;
      }

      // 2. Insert message to Supabase
      if (isSupabaseConfigured && user) {
        // Standard text message payload matches the existing database schema exactly:
        // (conversation_id, sender_id, content, is_read)
        const insertPayload: Record<string, any> = {
          conversation_id: activeConversationId,
          sender_id: user.id,
          content: textContent || (uploadedImageUrl ? '[Photo]' : ''),
          is_read: false
        };

        // ONLY attach image_url if a photo was actually selected and uploaded
        if (uploadedImageUrl) {
          insertPayload.image_url = uploadedImageUrl;
        }

        // ONLY attach reply_to_message_id if replying to a message
        if (replyingTo?.id) {
          insertPayload.reply_to_message_id = replyingTo.id;
        }

        let { data, error } = await supabase
          .from('messages')
          .insert(insertPayload)
          .select('*')
          .single();

        // Fallback: If reply_to_message_id column is not yet in the DB schema cache,
        // retry inserting without it so message sending never breaks, and inform user.
        if (error && (error.message?.includes('reply_to_message_id') || error.message?.includes('schema cache')) && insertPayload.reply_to_message_id) {
          console.warn('reply_to_message_id column missing, falling back to standard message insert');
          delete insertPayload.reply_to_message_id;
          const retryRes = await supabase
            .from('messages')
            .insert(insertPayload)
            .select('*')
            .single();
          data = retryRes.data;
          error = retryRes.error;
        }

        if (error) {
          console.error('Error sending message to Supabase:', error);
          if (uploadedImageUrl && (error.message?.includes('image_url') || error.message?.includes('schema cache'))) {
            alert('Photo sharing requires the database update to be executed in Supabase SQL Editor. Please run supabase/update_chat_features.sql');
          } else {
            alert(`Could not send message: ${error.message || 'Please check your connection and permissions.'}`);
          }
          setIsSending(false);
          return;
        }

        // On success: clear inputs & reply state
        setInputText('');
        handleCancelSelectedImage();
        setReplyingTo(null);
        setShowEmojiPicker(false);

        if (data) {
          data.reactions = [];
          setMessages(prev => {
            if (prev.some(m => m.id === data.id)) return prev;
            return [...prev, data];
          });

          await supabase
            .from('conversations')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', activeConversationId);

          setConversations(prev =>
            prev.map(c =>
              c.id === activeConversationId
                ? { ...c, last_message: data, updated_at: data.created_at }
                : c
            )
          );

          // Dispatch notification to conversation recipient
          const currentConv = conversations.find(c => c.id === activeConversationId);
          const recipientId = currentConv
            ? (currentConv.buyer_id === user.id ? currentConv.seller_id : currentConv.buyer_id)
            : null;

          if (recipientId) {
            try {
              const previewText = uploadedImageUrl && !textContent
                ? 'Sent a photo'
                : (textContent.length > 60 ? textContent.substring(0, 60) + '...' : textContent);
              const senderName = user.user_metadata?.full_name || 'Campus Student';

              // Ensure in-app notification exists if trigger has not executed
              const { data: existingNotif } = await supabase
                .from('notifications')
                .select('id')
                .eq('data->>message_id', data.id)
                .maybeSingle();

              let notifId = existingNotif?.id;

              if (!notifId) {
                const { data: insertedNotif } = await supabase
                  .from('notifications')
                  .insert({
                    user_id: recipientId,
                    type: 'new_message',
                    title: 'New message on CampusBazaar',
                    body: `New message from ${senderName}: ${previewText}`,
                    data: {
                      conversation_id: activeConversationId,
                      message_id: data.id,
                      sender_id: user.id,
                      url: `/messages?conversationId=${activeConversationId}`
                    },
                    is_read: false
                  })
                  .select('id')
                  .single();
                notifId = insertedNotif?.id;
              }

              // Send Web Push to recipient's subscribed device(s)
              await supabase.functions.invoke('send-push', {
                body: notifId ? { notification_id: notifId } : {
                  user_ids: [recipientId],
                  title: 'New message on CampusBazaar',
                  body: `New message from ${senderName}: ${previewText}`,
                  data: {
                    conversation_id: activeConversationId,
                    url: `/messages?conversationId=${activeConversationId}`
                  }
                }
              });
            } catch (notifErr) {
              console.warn('Could not dispatch push notification for message:', notifErr);
            }
          }
        }
      } else {
        // Mock preview fallback
        const mockMsg: Message = {
          id: `msg-${Date.now()}`,
          conversation_id: activeConversationId,
          sender_id: user?.id || 'current-user',
          content: textContent || null,
          image_url: uploadedImageUrl,
          reply_to_message_id: replyingTo?.id || null,
          is_read: false,
          created_at: new Date().toISOString(),
          reactions: []
        };
        setMessages(prev => [...prev, mockMsg]);
        setInputText('');
        handleCancelSelectedImage();
        setReplyingTo(null);
        setShowEmojiPicker(false);
      }
    } catch (err: any) {
      console.error('Exception sending message:', err);
      alert('Error sending message: ' + (err?.message || 'Unknown error'));
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: '1.5rem', paddingBottom: '3rem' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '320px 1fr',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-md)',
          height: '78vh',
          minHeight: '580px',
          overflow: 'hidden',
          position: 'relative'
        }}
        className="chat-layout"
      >
        {/* Left Col: Conversation List */}
        <div
          className={`chat-sidebar ${activeConversationId ? 'chat-sidebar-hidden-mobile' : ''}`}
          style={{
            borderRight: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#fafbfc',
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '1.25rem',
              borderBottom: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--bg-surface)'
            }}
          >
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Messages
            </h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Secure student-to-student conversations
            </p>
          </div>

          {/* List */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {(() => {
              const visibleConversations = conversations
                .filter(conv => !userSettings[conv.id]?.is_hidden)
                .sort((a, b) => {
                  const aPinned = Boolean(userSettings[a.id]?.is_pinned);
                  const bPinned = Boolean(userSettings[b.id]?.is_pinned);
                  if (aPinned && !bPinned) return -1;
                  if (!aPinned && bPinned) return 1;
                  return new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime();
                });

              if (visibleConversations.length === 0) {
                return (
                  <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    No active conversations yet
                  </div>
                );
              }

              return visibleConversations.map((conv) => {
                const isCurrent = conv.id === activeConversationId;
                const isPinned = Boolean(userSettings[conv.id]?.is_pinned);
                const isSwiped = swipedConvId === conv.id;
                const otherUser = conv.seller?.id === user?.id ? conv.buyer : conv.seller;

                let lastPreview = 'Tap to view conversation';
                if (conv.last_message?.is_deleted) {
                  lastPreview = 'Message deleted';
                } else if (conv.last_message?.image_url && !conv.last_message?.content) {
                  lastPreview = '📷 Photo';
                } else if (conv.last_message?.content) {
                  lastPreview = conv.last_message.content;
                }

                return (
                  <div
                    key={conv.id}
                    onMouseEnter={() => setHoveredConvId(conv.id)}
                    onMouseLeave={() => setHoveredConvId(null)}
                    onTouchStart={(e) => {
                      setTouchStartPos({ x: e.touches[0].clientX, y: e.touches[0].clientY });
                    }}
                    onTouchEnd={(e) => {
                      if (!touchStartPos) return;
                      const diffX = touchStartPos.x - e.changedTouches[0].clientX;
                      const diffY = Math.abs(touchStartPos.y - e.changedTouches[0].clientY);
                      // Right-to-left swipe (>40px horizontal) reveals Pin action
                      if (diffX > 40 && diffY < 40) {
                        setSwipedConvId(conv.id);
                      } else if (diffX < -40 && diffY < 40) {
                        if (swipedConvId === conv.id) {
                          setSwipedConvId(null);
                        }
                      }
                      setTouchStartPos(null);
                    }}
                    style={{
                      position: 'relative',
                      overflow: 'hidden',
                      borderBottom: '1px solid var(--border-subtle)'
                    }}
                  >
                    {/* Swipe Reveal Action Button (Mobile Right-to-Left Swipe) */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTogglePin(conv.id, e);
                        setSwipedConvId(null);
                      }}
                      title={isPinned ? 'Unpin' : 'Pin'}
                      style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        bottom: 0,
                        width: '72px',
                        backgroundColor: isPinned ? '#475569' : '#0d9488',
                        color: '#ffffff',
                        border: 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                        fontSize: '0.6875rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        zIndex: 1
                      }}
                    >
                      {isPinned ? <PinOff size={16} /> : <Pin size={16} />}
                      <span>{isPinned ? 'Unpin' : 'Pin'}</span>
                    </button>

                    {/* Main Conversation Item Card (Slides left when swiped) */}
                    <div
                      onClick={() => {
                        if (isSwiped) {
                          setSwipedConvId(null);
                        } else {
                          setActiveConversationId(conv.id);
                        }
                      }}
                      style={{
                        padding: '1rem 1.25rem',
                        backgroundColor: isCurrent ? '#ffffff' : (isPinned ? '#f0fdfa' : '#fafbfc'),
                        borderLeft: isCurrent ? '4px solid var(--primary)' : (isPinned ? '4px solid #0d9488' : '4px solid transparent'),
                        cursor: 'pointer',
                        position: 'relative',
                        zIndex: 2,
                        transform: isSwiped ? 'translateX(-72px)' : 'translateX(0)',
                        transition: 'transform 0.2s ease, background-color var(--transition-fast)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
                        <img
                          src={otherUser?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                          alt=""
                          style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', minWidth: 0 }}>
                              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {otherUser?.full_name || 'Campus Student'}
                              </span>
                              {isPinned && (
                                <span title="Pinned conversation" style={{ display: 'inline-flex', alignItems: 'center', color: '#0d9488', flexShrink: 0 }}>
                                  <Pin size={12} fill="#0d9488" />
                                </span>
                              )}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                                {conv.updated_at ? new Date(conv.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                              </span>

                              {/* Desktop Pin/Unpin Action Button on hover */}
                              <button
                                type="button"
                                onClick={(e) => handleTogglePin(conv.id, e)}
                                title={isPinned ? 'Unpin conversation' : 'Pin to top'}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  padding: '2px 4px',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  color: isPinned ? '#0d9488' : '#94a3b8',
                                  display: (isPinned || hoveredConvId === conv.id) ? 'inline-flex' : 'none',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  transition: 'color 0.15s ease'
                                }}
                              >
                                {isPinned ? <PinOff size={13} /> : <Pin size={13} />}
                              </button>
                            </div>
                          </div>

                          <p style={{
                            fontSize: '0.75rem',
                            color: 'var(--primary)',
                            fontWeight: 600,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {conv.listing?.title || 'Listing item'}
                          </p>
                        </div>
                      </div>

                      <p style={{
                        fontSize: '0.8125rem',
                        color: 'var(--text-secondary)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        paddingLeft: '46px'
                      }}>
                        {lastPreview}
                      </p>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>

        {/* Right Col: Active Chat Window */}
        <div
          className={`chat-main ${!activeConversationId ? 'chat-main-hidden-mobile' : ''}`}
          style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: 'var(--bg-surface)', overflow: 'hidden' }}
        >
          {activeConv ? (
            <>
              {/* Chat Header with Listing Details and 3-Dot Actions Menu */}
              <div style={{
                padding: '0.75rem 1.25rem',
                borderBottom: '1px solid var(--border-subtle)',
                backgroundColor: 'var(--bg-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.75rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                  {/* Mobile Back Button */}
                  <button
                    type="button"
                    onClick={() => setActiveConversationId('')}
                    className="chat-back-mobile"
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '6px',
                      cursor: 'pointer',
                      borderRadius: '8px',
                      color: 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    title="Back to conversations"
                  >
                    <ArrowLeft size={20} />
                  </button>

                  {activeListing ? (
                    <>
                      <img
                        src={activeListing.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=150&q=80'}
                        alt=""
                        style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
                      />
                      <div style={{ minWidth: 0 }}>
                        <Link to={`/product/${activeListing.id}`} style={{ textDecoration: 'none' }}>
                          <h4 style={{
                            fontSize: '0.875rem',
                            fontWeight: 700,
                            color: 'var(--text-primary)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {activeListing.title}
                          </h4>
                        </Link>
                        <span style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--primary)' }}>
                          ₹{activeListing.price.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div style={{ minWidth: 0 }}>
                      <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {(activeConv.seller?.id === user?.id ? activeConv.buyer?.full_name : activeConv.seller?.full_name) || 'Campus Student'}
                      </h4>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', position: 'relative' }}>
                  {activeListing && (
                    <Link to={`/product/${activeListing.id}`} className="btn btn-outline btn-sm" style={{ whiteSpace: 'nowrap' }}>
                      View Item
                    </Link>
                  )}

                  {/* Three-Dot Menu Button for Chat Actions */}
                  <div style={{ position: 'relative' }}>
                    <button
                      type="button"
                      onClick={() => setShowHeaderMenu(prev => !prev)}
                      title="Chat options"
                      style={{
                        background: showHeaderMenu ? '#e2e8f0' : '#f1f5f9',
                        border: 'none',
                        borderRadius: '8px',
                        width: '34px',
                        height: '34px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: 'var(--text-secondary)',
                        transition: 'background-color 0.15s ease'
                      }}
                    >
                      <MoreVertical size={18} />
                    </button>

                    {/* Three-Dot Dropdown Menu */}
                    {showHeaderMenu && (
                      <div
                        ref={headerMenuRef}
                        style={{
                          position: 'absolute',
                          top: 'calc(100% + 6px)',
                          right: 0,
                          backgroundColor: '#ffffff',
                          borderRadius: '12px',
                          boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
                          border: '1px solid var(--border-subtle)',
                          padding: '6px',
                          minWidth: '165px',
                          zIndex: 40,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '2px',
                          animation: 'chatPickerFadeIn 0.15s ease'
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setShowHeaderMenu(false);
                            handleTogglePin(activeConversationId);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 12px',
                            border: 'none',
                            background: 'transparent',
                            borderRadius: '8px',
                            fontSize: '0.8125rem',
                            color: 'var(--text-primary)',
                            cursor: 'pointer',
                            textAlign: 'left',
                            width: '100%'
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          <Pin size={15} color={userSettings[activeConversationId]?.is_pinned ? '#0d9488' : '#64748b'} />
                          <span>{userSettings[activeConversationId]?.is_pinned ? 'Unpin chat' : 'Pin chat'}</span>
                        </button>

                        {/* Block / Unblock User Option */}
                        {otherUserId && otherUserId !== user?.id && (
                          <button
                            type="button"
                            onClick={() => {
                              setShowHeaderMenu(false);
                              if (isBlockedByMe) {
                                setShowUnblockConfirm(true);
                              } else {
                                setShowBlockConfirm(true);
                              }
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '8px 12px',
                              border: 'none',
                              background: 'transparent',
                              borderRadius: '8px',
                              fontSize: '0.8125rem',
                              color: isBlockedByMe ? '#16a34a' : '#dc2626',
                              cursor: 'pointer',
                              textAlign: 'left',
                              width: '100%'
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = isBlockedByMe ? '#f0fdf4' : '#fef2f2')}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                          >
                            {isBlockedByMe ? <UserCheck size={15} color="#16a34a" /> : <Ban size={15} color="#dc2626" />}
                            <span>{isBlockedByMe ? 'Unblock user' : 'Block user'}</span>
                          </button>
                        )}

                        {/* Report User Option */}
                        {otherUserId && otherUserId !== user?.id && (
                          <button
                            type="button"
                            onClick={() => {
                              setShowHeaderMenu(false);
                              setShowReportModal(true);
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '8px 12px',
                              border: 'none',
                              background: 'transparent',
                              borderRadius: '8px',
                              fontSize: '0.8125rem',
                              color: '#dc2626',
                              cursor: 'pointer',
                              textAlign: 'left',
                              width: '100%'
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fef2f2')}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                          >
                            <Flag size={15} color="#dc2626" />
                            <span>Report user</span>
                          </button>
                        )}

                        <div style={{ height: '1px', backgroundColor: '#e2e8f0', margin: '2px 0' }} />

                        <button
                          type="button"
                          onClick={() => {
                            setShowHeaderMenu(false);
                            setShowDeleteChatConfirm(true);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 12px',
                            border: 'none',
                            background: 'transparent',
                            borderRadius: '8px',
                            fontSize: '0.8125rem',
                            color: '#dc2626',
                            cursor: 'pointer',
                            textAlign: 'left',
                            width: '100%'
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fef2f2')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          <Trash2 size={15} color="#dc2626" />
                          <span>Delete chat</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Chat Messages Stream */}
              <div
                ref={chatStreamRef}
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  backgroundColor: '#f8fafc'
                }}
              >
                {/* Safety Prompt */}
                <div style={{
                  backgroundColor: '#f0fdfa',
                  border: '1px solid #ccfbf1',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.65rem 1rem',
                  textAlign: 'center',
                  fontSize: '0.75rem',
                  color: 'var(--primary-hover)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}>
                  <ShieldCheck size={16} />
                  <span>Campus safety tip: Inspect items in public campus areas (e.g. Central Library, UniMall) before payment.</span>
                </div>

                {messages.length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', margin: 'auto', fontSize: '0.875rem' }}>
                    No messages yet. Send a message or photo to start the conversation!
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMine = msg.sender_id === (user?.id || 'current-user');
                    const isSystem = msg.sender_id === 'system';
                    const isDeleted = msg.is_deleted;
                    const isEmojiOnly = !isDeleted && isEmojiOnlyText(msg.content);
                    const isHovered = hoveredMsgId === msg.id;

                    if (isSystem) {
                      return (
                        <div key={msg.id} style={{ textAlign: 'center', margin: '0.5rem 0' }}>
                          <span style={{
                            fontSize: '0.75rem',
                            color: 'var(--text-muted)',
                            backgroundColor: '#ffffff',
                            padding: '0.25rem 0.75rem',
                            borderRadius: 'var(--radius-full)',
                            border: '1px solid var(--border-subtle)'
                          }}>
                            {msg.content}
                          </span>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={msg.id}
                        id={`msg-${msg.id}`}
                        onMouseEnter={() => setHoveredMsgId(msg.id)}
                        onMouseLeave={() => setHoveredMsgId(null)}
                        onTouchStart={(e) => {
                          touchMessageStartRef.current = {
                            x: e.touches[0].clientX,
                            y: e.touches[0].clientY,
                            msgId: msg.id
                          };
                        }}
                        onTouchEnd={(e) => {
                          if (!touchMessageStartRef.current || touchMessageStartRef.current.msgId !== msg.id) return;
                          const deltaX = e.changedTouches[0].clientX - touchMessageStartRef.current.x;
                          const deltaY = e.changedTouches[0].clientY - touchMessageStartRef.current.y;
                          touchMessageStartRef.current = null;
                          if (deltaX > 55 && Math.abs(deltaY) < 35 && !isDeleted) {
                            handleStartReply(msg);
                          }
                        }}
                        style={{
                          alignSelf: isMine ? 'flex-end' : 'flex-start',
                          maxWidth: '78%',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: isMine ? 'flex-end' : 'flex-start',
                          position: 'relative',
                          backgroundColor: highlightedMsgId === msg.id ? '#fef08a' : 'transparent',
                          borderRadius: '16px',
                          padding: highlightedMsgId === msg.id ? '4px' : '0',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        {/* Message Action Menu (Quick Reactions, Reply, Copy, Edit, Delete) */}
                        {!isDeleted && (
                          <div
                            style={{
                              position: 'absolute',
                              top: '-16px',
                              right: isMine ? '0' : 'auto',
                              left: isMine ? 'auto' : '0',
                              opacity: isHovered ? 1 : 0,
                              pointerEvents: isHovered ? 'auto' : 'none',
                              transition: 'opacity 0.15s ease',
                              zIndex: 5
                            }}
                          >
                            <MessageActionsMenu
                              message={msg}
                              isMine={isMine}
                              currentUserId={user?.id || ''}
                              onReact={(emoji) => handleToggleReaction(msg.id, emoji)}
                              onReply={() => handleStartReply(msg)}
                              onEdit={() => handleStartEdit(msg)}
                              onDelete={() => setDeleteConfirmMsg(msg)}
                            />
                          </div>
                        )}

                        {/* Deleted Message State */}
                        {isDeleted ? (
                          <div
                            style={{
                              padding: '0.6rem 0.9rem',
                              borderRadius: '14px',
                              backgroundColor: '#f1f5f9',
                              color: '#94a3b8',
                              fontSize: '0.8125rem',
                              fontStyle: 'italic',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              border: '1px dashed #cbd5e1'
                            }}
                          >
                            <Trash2 size={13} color="#94a3b8" />
                            <span>This message was deleted</span>
                          </div>
                        ) : (
                          /* Normal Message Bubble */
                          <div
                            style={{
                              borderRadius: isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                              backgroundColor: isEmojiOnly && !msg.image_url ? 'transparent' : isMine ? 'var(--primary)' : '#ffffff',
                              color: isMine ? '#ffffff' : 'var(--text-primary)',
                              fontSize: isEmojiOnly && !msg.image_url ? '2.5rem' : '0.875rem',
                              lineHeight: isEmojiOnly && !msg.image_url ? 1.2 : 1.45,
                              boxShadow: isEmojiOnly && !msg.image_url ? 'none' : '0 1px 3px rgba(0, 0, 0, 0.06)',
                              border: isEmojiOnly && !msg.image_url ? 'none' : isMine ? 'none' : '1px solid var(--border-subtle)',
                              overflow: 'hidden',
                              padding: isEmojiOnly && !msg.image_url ? '0.2rem' : (msg.image_url ? '4px' : '0.75rem 1rem')
                            }}
                          >
                            {/* Quoted Reply Preview inside bubble */}
                            {msg.reply_to_message_id && (() => {
                              const repliedMsg = messages.find(m => m.id === msg.reply_to_message_id);
                              const repliedSenderName = repliedMsg?.sender_id === (user?.id || 'current-user')
                                ? 'You'
                                : otherUserName;

                              return (
                                <div
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleScrollToMessage(msg.reply_to_message_id!);
                                  }}
                                  title="Click to jump to quoted message"
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '5px 8px',
                                    marginBottom: '6px',
                                    borderRadius: '8px',
                                    backgroundColor: isMine ? 'rgba(255, 255, 255, 0.22)' : 'rgba(0, 0, 0, 0.05)',
                                    borderLeft: `3px solid ${isMine ? '#ffffff' : 'var(--primary)'}`,
                                    cursor: 'pointer',
                                    fontSize: '0.75rem',
                                    lineHeight: 1.3,
                                    transition: 'opacity 0.15s ease'
                                  }}
                                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
                                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                                >
                                  <Reply size={13} style={{ flexShrink: 0, opacity: 0.85 }} />
                                  {repliedMsg?.image_url && (
                                    <img
                                      src={repliedMsg.image_url}
                                      alt=""
                                      style={{ width: '22px', height: '22px', borderRadius: '4px', objectFit: 'cover', flexShrink: 0 }}
                                    />
                                  )}
                                  <div style={{ minWidth: 0, flex: 1 }}>
                                    <div style={{ fontWeight: 700, opacity: 0.9 }}>
                                      {repliedSenderName}
                                    </div>
                                    <div style={{
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap',
                                      opacity: 0.85
                                    }}>
                                      {repliedMsg?.is_deleted ? (
                                        <em>Deleted message</em>
                                      ) : (
                                        repliedMsg?.content || (repliedMsg?.image_url ? '📷 Photo' : 'Message')
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })()}
                            {/* Photo in message */}
                            {msg.image_url && (
                              <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '14px' }}>
                                <img
                                  src={msg.image_url}
                                  alt="Chat attachment"
                                  onClick={() => setLightboxImage(msg.image_url || null)}
                                  style={{
                                    maxWidth: '100%',
                                    maxHeight: '260px',
                                    borderRadius: '14px',
                                    objectFit: 'cover',
                                    cursor: 'pointer',
                                    display: 'block',
                                    transition: 'transform 0.2s ease'
                                  }}
                                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.01)')}
                                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                                />
                              </div>
                            )}

                            {/* Text accompanying photo or standalone text */}
                            {msg.content && (
                              <div
                                style={{
                                  padding: msg.image_url ? '0.5rem 0.6rem 0.3rem' : 0,
                                  wordBreak: 'break-word',
                                  whiteSpace: 'pre-wrap'
                                }}
                              >
                                {msg.content}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Reaction Badges */}
                        {!isDeleted && (
                          <ReactionBadges
                            reactions={msg.reactions}
                            currentUserId={user?.id || ''}
                            onToggleReaction={(emoji) => handleToggleReaction(msg.id, emoji)}
                          />
                        )}

                        {/* Timestamp & Edited Indicator */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '0.2rem', padding: '0 0.25rem' }}>
                          <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                            {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                          </span>
                          {!isDeleted && msg.is_edited && (
                            <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                              (edited)
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Editing Message Banner */}
              {editingMessage && (
                <div
                  style={{
                    backgroundColor: '#eff6ff',
                    borderTop: '1px solid #bfdbfe',
                    padding: '8px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                    <Edit2 size={16} color="#2563eb" />
                    <div style={{ minWidth: 0 }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#1e40af' }}>Editing message:</span>
                      <p style={{
                        fontSize: '0.8125rem',
                        color: '#3b82f6',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        margin: 0
                      }}>
                        {editingMessage.content}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#64748b',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    title="Cancel editing"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              {/* Image Preview Banner (before sending) */}
              {imagePreviewUrl && (
                <div
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#f8fafc',
                    borderTop: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                    <img
                      src={imagePreviewUrl}
                      alt="Selected preview"
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '8px',
                        objectFit: 'cover',
                        border: '1px solid #e2e8f0',
                        flexShrink: 0
                      }}
                    />
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <p style={{
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        margin: 0
                      }}>
                        {selectedImage?.name}
                      </p>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {selectedImage && formatFileSize(selectedImage.size)}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleCancelSelectedImage}
                    title="Remove image"
                    style={{
                      background: '#fee2e2',
                      border: 'none',
                      borderRadius: '50%',
                      width: '28px',
                      height: '28px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: '#dc2626',
                      flexShrink: 0
                    }}
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              {/* Replying to Preview Banner */}
              {replyingTo && (
                <div
                  style={{
                    backgroundColor: '#eff6ff',
                    borderTop: '1px solid #bfdbfe',
                    borderLeft: '4px solid var(--primary)',
                    padding: '8px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    animation: 'chatPickerFadeIn 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                    <Reply size={16} color="var(--primary)" style={{ flexShrink: 0 }} />
                    {replyingTo.image_url && (
                      <img
                        src={replyingTo.image_url}
                        alt="Replied preview"
                        style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover', flexShrink: 0 }}
                      />
                    )}
                    <div style={{ minWidth: 0 }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)' }}>
                        Replying to {replyingTo.sender_id === (user?.id || 'current-user') ? 'yourself' : otherUserName}:
                      </span>
                      <p style={{
                        fontSize: '0.8125rem',
                        color: '#475569',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        margin: 0
                      }}>
                        {replyingTo.content || (replyingTo.image_url ? '📷 Photo' : 'Message')}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleCancelReply}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#64748b',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    title="Cancel reply"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              {/* Chat Input Bar */}
              <div className="chat-composer-wrapper" style={{ position: 'relative', width: '100%', boxSizing: 'border-box' }}>
                {isBlockedByMe ? (
                  <div
                    style={{
                      padding: '1rem 1.25rem',
                      borderTop: '1px solid #fecaca',
                      backgroundColor: '#fef2f2',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '1rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#991b1b', fontSize: '0.875rem' }}>
                      <Ban size={18} color="#dc2626" />
                      <span>You have blocked <strong>{otherUserName}</strong>. Unblock them to send new messages.</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowUnblockConfirm(true)}
                      className="btn btn-outline btn-sm"
                      style={{ borderColor: '#dc2626', color: '#dc2626', whiteSpace: 'nowrap' }}
                    >
                      Unblock user
                    </button>
                  </div>
                ) : isBlockedByOther ? (
                  <div
                    style={{
                      padding: '1rem 1.25rem',
                      borderTop: '1px solid #e2e8f0',
                      backgroundColor: '#f8fafc',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: '#64748b',
                      fontSize: '0.875rem'
                    }}
                  >
                    <Ban size={18} color="#94a3b8" />
                    <span>You cannot send messages to this user because communication is blocked.</span>
                  </div>
                ) : (
                  <>
                    {/* Emoji Picker Popup */}
                    <ChatEmojiPicker
                      isOpen={showEmojiPicker}
                      onClose={() => setShowEmojiPicker(false)}
                      onSelectEmoji={handleInsertEmoji}
                    />

                    <form
                      onSubmit={handleSendMessage}
                      className="chat-composer-form"
                      style={{
                        borderTop: '1px solid var(--border-subtle)',
                        backgroundColor: 'var(--bg-surface)',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      {/* Hidden file input for photo upload */}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        onChange={handlePhotoSelect}
                        style={{ display: 'none' }}
                      />

                      {/* Photo picker trigger button */}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isSending || Boolean(editingMessage)}
                        title={editingMessage ? 'Cannot attach photos while editing' : 'Attach photo'}
                        className="chat-composer-btn"
                        style={{
                          background: 'none',
                          border: 'none',
                          borderRadius: '50%',
                          cursor: editingMessage ? 'not-allowed' : 'pointer',
                          color: selectedImage ? 'var(--primary)' : '#64748b',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'background-color 0.15s ease, color 0.15s ease'
                        }}
                        onMouseEnter={(e) => !editingMessage && (e.currentTarget.style.backgroundColor = '#f1f5f9')}
                        onMouseLeave={(e) => !editingMessage && (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        <ImageIcon size={20} />
                      </button>

                      {/* Emoji picker trigger button */}
                      <button
                        type="button"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        title="Insert emoji"
                        className="chat-composer-btn"
                        style={{
                          background: showEmojiPicker ? '#e0e7ff' : 'none',
                          border: 'none',
                          borderRadius: '50%',
                          cursor: 'pointer',
                          color: showEmojiPicker ? 'var(--primary)' : '#64748b',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'background-color 0.15s ease, color 0.15s ease'
                        }}
                        onMouseEnter={(e) => !showEmojiPicker && (e.currentTarget.style.backgroundColor = '#f1f5f9')}
                        onMouseLeave={(e) => !showEmojiPicker && (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        <Smile size={20} />
                      </button>

                      {/* Message Input or Edit Input */}
                      {editingMessage ? (
                        <input
                          ref={editInputRef}
                          type="text"
                          placeholder="Edit your message..."
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          disabled={isSending}
                          className="chat-composer-input"
                          style={{
                            borderRadius: 'var(--radius-full)',
                            border: '1px solid #93c5fd',
                            outline: 'none',
                            backgroundColor: '#eff6ff',
                            color: 'var(--text-primary)'
                          }}
                        />
                      ) : (
                        <input
                          ref={inputRef}
                          type="text"
                          placeholder="Type a message or attach a photo..."
                          value={inputText}
                          onChange={(e) => setInputText(e.target.value)}
                          disabled={isSending}
                          className="chat-composer-input"
                          style={{
                            borderRadius: 'var(--radius-full)',
                            border: '1px solid var(--border-strong)',
                            outline: 'none',
                            backgroundColor: 'var(--bg-muted)'
                          }}
                          onFocus={(e) => {
                            e.currentTarget.style.backgroundColor = '#ffffff';
                            e.currentTarget.style.borderColor = 'var(--primary)';
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--bg-muted)';
                            e.currentTarget.style.borderColor = 'var(--border-strong)';
                          }}
                        />
                      )}

                      {/* Send or Save Button */}
                      <button
                        type="submit"
                        disabled={
                          editingMessage
                            ? !editText.trim() && !editingMessage.image_url
                            : (!inputText.trim() && !selectedImage) || isSending
                        }
                        className="btn btn-primary chat-composer-send-btn"
                        style={{
                          borderRadius: 'var(--radius-full)',
                          padding: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        title={editingMessage ? 'Save changes' : 'Send message'}
                      >
                        {isSending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                      </button>
                    </form>
                  </>
                )}
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              Select a conversation to start chatting
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Modal for Fullscreen Chat Photos */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            animation: 'chatPickerFadeIn 0.2s ease'
          }}
        >
          <button
            type="button"
            onClick={() => setLightboxImage(null)}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#ffffff',
              transition: 'background-color 0.15s ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.4)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)')}
          >
            <X size={24} />
          </button>
          <img
            src={lightboxImage}
            alt="Enlarged view"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '90vw',
              maxHeight: '90vh',
              objectFit: 'contain',
              borderRadius: '8px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
            }}
          />
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmMsg && (
        <div
          onClick={() => setDeleteConfirmMsg(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              maxWidth: '400px',
              width: '100%',
              padding: '1.5rem',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              border: '1px solid #e2e8f0'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: '#fee2e2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#dc2626'
                }}
              >
                <AlertCircle size={22} />
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>
                Delete Message?
              </h3>
            </div>

            <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              Are you sure you want to delete this message? It will be replaced with a deleted message notice and cannot be undone.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setDeleteConfirmMsg(null)}
                className="btn btn-outline btn-sm"
                style={{ padding: '0.5rem 1rem' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                style={{
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.5rem 1.25rem',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Chat Confirmation Modal */}
      {showDeleteChatConfirm && (
        <div
          onClick={() => setShowDeleteChatConfirm(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            animation: 'chatPickerFadeIn 0.18s ease'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              maxWidth: '420px',
              width: '100%',
              padding: '1.5rem',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              border: '1px solid #e2e8f0'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: '#fee2e2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#dc2626'
                }}
              >
                <Trash2 size={20} />
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>
                Delete this chat?
              </h3>
            </div>

            <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              This will remove the conversation from your Messages list. The other participant&apos;s chat will not be affected.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setShowDeleteChatConfirm(false)}
                className="btn btn-outline btn-sm"
                style={{ padding: '0.5rem 1rem' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleHideConversation(activeConversationId)}
                style={{
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.5rem 1.25rem',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Block Confirmation Modal */}
      {showBlockConfirm && (
        <div
          onClick={() => setShowBlockConfirm(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            animation: 'chatPickerFadeIn 0.18s ease'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              maxWidth: '420px',
              width: '100%',
              padding: '1.5rem',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              border: '1px solid #e2e8f0'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: '#fee2e2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#dc2626'
                }}
              >
                <Ban size={20} />
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>
                Block {otherUserName}?
              </h3>
            </div>

            <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              They will not be able to send you new messages, and you will not be able to send messages to them. All existing messages and this conversation will remain preserved.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setShowBlockConfirm(false)}
                className="btn btn-outline btn-sm"
                style={{ padding: '0.5rem 1rem' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBlockUser}
                style={{
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.5rem 1.25rem',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Block user
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unblock Confirmation Modal */}
      {showUnblockConfirm && (
        <div
          onClick={() => setShowUnblockConfirm(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            animation: 'chatPickerFadeIn 0.18s ease'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              maxWidth: '420px',
              width: '100%',
              padding: '1.5rem',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              border: '1px solid #e2e8f0'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: '#dcfce7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#16a34a'
                }}
              >
                <UserCheck size={20} />
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>
                Unblock {otherUserName}?
              </h3>
            </div>

            <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              You and {otherUserName} will be able to send each other messages again.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setShowUnblockConfirm(false)}
                className="btn btn-outline btn-sm"
                style={{ padding: '0.5rem 1rem' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUnblockUser}
                style={{
                  backgroundColor: '#16a34a',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.5rem 1.25rem',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Unblock user
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report User Modal */}
      {showReportModal && (
        <div
          onClick={() => !isSubmittingReport && setShowReportModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            animation: 'chatPickerFadeIn 0.18s ease'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              maxWidth: '460px',
              width: '100%',
              padding: '1.5rem',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              border: '1px solid #e2e8f0'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '0.5rem' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: '#fee2e2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#dc2626'
                }}
              >
                <Flag size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>
                  Report {otherUserName}
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Help keep our campus marketplace safe and trusted
                </span>
              </div>
            </div>

            <form onSubmit={handleReportUser} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                  Reason for report *
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {(['Scam / Fraud', 'Harassment', 'Prohibited item', 'Spam', 'Other'] as UserReportReason[]).map((reason) => (
                    <label
                      key={reason}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: reportReason === reason ? '1px solid var(--primary)' : '1px solid #e2e8f0',
                        backgroundColor: reportReason === reason ? '#eff6ff' : '#f8fafc',
                        cursor: 'pointer',
                        fontSize: '0.8125rem',
                        color: reportReason === reason ? 'var(--primary)' : '#334155',
                        fontWeight: reportReason === reason ? 600 : 400
                      }}
                    >
                      <input
                        type="radio"
                        name="reportReason"
                        value={reason}
                        checked={reportReason === reason}
                        onChange={() => setReportReason(reason)}
                        style={{ accentColor: 'var(--primary)' }}
                      />
                      <span>{reason}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                  Additional details (optional)
                </label>
                <textarea
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  placeholder="Provide any additional context or details..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.8125rem',
                    resize: 'vertical',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0, lineHeight: 1.4 }}>
                Existing messages and chat evidence will be preserved for review by campus administrators.
              </p>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  disabled={isSubmittingReport}
                  className="btn btn-outline btn-sm"
                  style={{ padding: '0.5rem 1rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReport}
                  style={{
                    backgroundColor: '#dc2626',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.5rem 1.25rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {isSubmittingReport ? <Loader2 size={14} className="animate-spin" /> : null}
                  <span>Submit Report</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Report Success Toast */}
      {reportSuccessToast && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            backgroundColor: '#16a34a',
            color: '#ffffff',
            padding: '12px 18px',
            borderRadius: '10px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            zIndex: 10000,
            fontSize: '0.875rem',
            fontWeight: 500,
            animation: 'chatPickerFadeIn 0.2s ease'
          }}
        >
          <Check size={18} />
          <span>{reportSuccessToast}</span>
        </div>
      )}
    </div>
  );
};
