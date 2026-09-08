import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Send, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMarketplace } from '../context/MarketplaceContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Conversation, Message } from '../lib/database.types';

export const MessagesPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const targetListingId = searchParams.get('listingId');
  const targetSellerId = searchParams.get('sellerId');
  const targetConversationId = searchParams.get('conversationId');

  const { user } = useAuth();
  const { listings } = useMarketplace();

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Helper to fetch all conversations for the current authenticated user (as buyer OR seller)
  const fetchConversations = useCallback(async () => {
    if (!isSupabaseConfigured || !user) return;

    try {
      // 1. Try joined query with profiles and listings
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

      // 2. Fallback if profiles relationship isn't registered in PostgREST schema cache
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
        // Fetch the latest message for each conversation to display in the inbox preview
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

  // Re-fetch conversations when window regains focus (e.g. seller switches tabs)
  useEffect(() => {
    const handleFocus = () => {
      fetchConversations();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchConversations]);

  // Fetch real messages for the active conversation
  const fetchMessages = useCallback(async (convId: string) => {
    if (!isSupabaseConfigured || !user || !convId) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', convId)
        .order('created_at', { ascending: true });

      if (!error && data) {
        setMessages(data);
      } else if (error) {
        console.error('Error fetching messages:', error);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  }, [user]);

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

    // A seller should not start a conversation with themselves
    if (user.id === targetSellerId) {
      return;
    }

    let isMounted = true;

    const initConversation = async () => {
      try {
        // 1. First check if a conversation already exists in Supabase
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

        // 2. If it does NOT exist, create the conversation row in Supabase
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

        // 3. If duplicate key race condition occurred (unique_listing_buyer), re-fetch
        if (createError && isMounted) {
          console.warn('Conversation insert returned error, fetching existing:', createError.message);
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

  // Real-time messages subscription for the currently active conversation
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
          setMessages(prev => {
            if (prev.some(m => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
          // Update last message in the left conversation list
          setConversations(prev =>
            prev.map(c =>
              c.id === activeConversationId
                ? { ...c, last_message: newMsg, updated_at: newMsg.created_at }
                : c
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeConversationId]);

  // Global realtime subscription for inbox updates (new conversations & messages)
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

  // Auto scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message handler
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isSending) return;

    const content = inputText.trim();

    if (!activeConversationId) {
      console.warn('Cannot send message: no active conversation');
      return;
    }

    setIsSending(true);
    setInputText('');

    if (isSupabaseConfigured && user) {
      try {
        const { data, error } = await supabase
          .from('messages')
          .insert({
            conversation_id: activeConversationId,
            sender_id: user.id,
            content,
            is_read: false
          })
          .select('*')
          .single();

        if (error) {
          console.error('Error sending message to Supabase:', error);
          alert('Could not send message. Please ensure the database tables are created.');
          setInputText(content);
        } else if (data) {
          // Add to local messages list if not received via realtime yet
          setMessages(prev => {
            if (prev.some(m => m.id === data.id)) return prev;
            return [...prev, data];
          });

          // Update updated_at on the conversation so recent chats sort to the top
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
        }
      } catch (err) {
        console.error('Exception sending message:', err);
        setInputText(content);
      } finally {
        setIsSending(false);
      }
    } else {
      // Mock preview fallback
      const mockMsg: Message = {
        id: `msg-${Date.now()}`,
        conversation_id: activeConversationId,
        sender_id: user?.id || 'current-user',
        content,
        is_read: false,
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, mockMsg]);
      setIsSending(false);
    }
  };

  const activeConv = conversations.find(c => c.id === activeConversationId);
  const activeListing = activeConv?.listing || listings.find(l => l.id === activeConv?.listing_id);

  return (
    <div className="container" style={{ paddingTop: '1.5rem', paddingBottom: '3rem' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '320px 1fr',
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-md)',
        height: '76vh',
        minHeight: '560px',
        overflow: 'hidden'
      }} className="chat-layout">
        {/* Left Col: Conversation List */}
        <div style={{
          borderRight: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#fafbfc'
        }}>
          {/* Header */}
          <div style={{
            padding: '1.25rem',
            borderBottom: '1px solid var(--border-subtle)',
            backgroundColor: '#ffffff'
          }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Messages
            </h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Secure student-to-student conversations
            </p>
          </div>

          {/* List */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {conversations.length === 0 ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                No active conversations yet
              </div>
            ) : (
              conversations.map((conv) => {
                const isCurrent = conv.id === activeConversationId;
                const otherUser = conv.seller?.id === user?.id ? conv.buyer : conv.seller;

                return (
                  <div
                    key={conv.id}
                    onClick={() => setActiveConversationId(conv.id)}
                    style={{
                      padding: '1rem 1.25rem',
                      borderBottom: '1px solid var(--border-subtle)',
                      backgroundColor: isCurrent ? '#ffffff' : 'transparent',
                      borderLeft: isCurrent ? '4px solid var(--primary)' : '4px solid transparent',
                      cursor: 'pointer',
                      transition: 'background-color var(--transition-fast)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
                      <img
                        src={otherUser?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                        alt=""
                        style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {otherUser?.full_name || 'Campus Student'}
                          </span>
                          <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                            {conv.updated_at ? new Date(conv.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                          </span>
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
                      {conv.last_message?.content || 'Tap to view conversation'}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Col: Active Chat Window */}
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#ffffff' }}>
          {activeConv ? (
            <>
              {/* Product Preview Bar in Chat Header */}
              {activeListing && (
                <div style={{
                  padding: '0.75rem 1.25rem',
                  borderBottom: '1px solid var(--border-subtle)',
                  backgroundColor: '#f8fafc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                    <img
                      src={activeListing.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=150&q=80'}
                      alt=""
                      style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
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
                  </div>

                  <Link to={`/product/${activeListing.id}`} className="btn btn-outline btn-sm">
                    View Item
                  </Link>
                </div>
              )}

              {/* Chat Messages Stream */}
              <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.875rem',
                backgroundColor: '#f8fafc'
              }}>
                {/* Safety Prompt */}
                <div style={{
                  backgroundColor: '#f0fdfa',
                  border: '1px solid #ccfbf1',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.75rem 1rem',
                  textAlign: 'center',
                  fontSize: '0.75rem',
                  color: 'var(--primary-hover)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}>
                  <ShieldCheck size={16} />
                  <span>Campus safety tip: Inspect items in public places (e.g. UniMall, Central Library) before payment.</span>
                </div>

                {messages.length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', margin: 'auto', fontSize: '0.875rem' }}>
                    No messages yet. Send a message to start the conversation!
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMine = msg.sender_id === (user?.id || 'current-user');
                    const isSystem = msg.sender_id === 'system';

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
                        style={{
                          alignSelf: isMine ? 'flex-end' : 'flex-start',
                          maxWidth: '75%',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: isMine ? 'flex-end' : 'flex-start'
                        }}
                      >
                        <div style={{
                          padding: '0.75rem 1rem',
                          borderRadius: isMine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                          backgroundColor: isMine ? 'var(--primary)' : '#ffffff',
                          color: isMine ? '#ffffff' : 'var(--text-primary)',
                          fontSize: '0.875rem',
                          lineHeight: 1.45,
                          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
                          border: isMine ? 'none' : '1px solid var(--border-subtle)'
                        }}>
                          {msg.content}
                        </div>
                        <span style={{
                          fontSize: '0.6875rem',
                          color: 'var(--text-muted)',
                          marginTop: '0.2rem',
                          padding: '0 0.25rem'
                        }}>
                          {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Bar */}
              <form
                onSubmit={handleSendMessage}
                style={{
                  padding: '1rem',
                  borderTop: '1px solid var(--border-subtle)',
                  backgroundColor: '#ffffff',
                  display: 'flex',
                  gap: '0.75rem',
                  alignItems: 'center'
                }}
              >
                <input
                  type="text"
                  placeholder="Type a message to discuss condition, price, or meetup time..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  disabled={isSending}
                  style={{
                    flex: 1,
                    padding: '0.75rem 1.25rem',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid var(--border-strong)',
                    fontSize: '0.9375rem',
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
                <button
                  type="submit"
                  disabled={!inputText.trim() || isSending}
                  className="btn btn-primary"
                  style={{ borderRadius: 'var(--radius-full)', width: '44px', height: '44px', padding: 0 }}
                >
                  <Send size={18} />
                </button>
              </form>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              Select a conversation to start chatting
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
