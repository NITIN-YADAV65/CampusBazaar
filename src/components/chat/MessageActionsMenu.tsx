import React, { useState, useRef, useEffect } from 'react';
import { Copy, Check, Edit2, Trash2, MoreVertical, Reply } from 'lucide-react';
import type { Message, MessageReaction } from '../../lib/database.types';

export const POPULAR_REACTIONS = ['❤️', '👍', '😂', '😮', '😢', '😡'] as const;

interface MessageActionsMenuProps {
  message: Message;
  isMine: boolean;
  currentUserId: string;
  onReact: (emoji: string) => void;
  onReply: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const MessageActionsMenu: React.FC<MessageActionsMenuProps> = ({
  message,
  isMine,
  currentUserId,
  onReact,
  onReply,
  onEdit,
  onDelete
}) => {
  const [copied, setCopied] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close popup menu when clicking outside
  useEffect(() => {
    if (!showMenu) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!message.content) return;
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setShowMenu(false);
      }, 1200);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleReplyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    onReply();
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    onEdit();
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    onDelete();
  };

  if (message.is_deleted) return null;

  return (
    <div
      ref={menuRef}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '2px',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '20px',
        padding: '2px 6px',
        boxShadow: 'var(--shadow-md)',
        zIndex: 10
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Quick Reaction Bar: 6 requested emojis */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
        {POPULAR_REACTIONS.map((emoji) => {
          const hasReacted = message.reactions?.some(
            (r) => r.reaction === emoji && r.user_id === currentUserId
          );

          return (
            <button
              key={emoji}
              type="button"
              onClick={() => onReact(emoji)}
              title={hasReacted ? `Remove ${emoji}` : `React with ${emoji}`}
              style={{
                background: hasReacted ? 'var(--primary-light)' : 'transparent',
                border: 'none',
                borderRadius: '12px',
                width: '26px',
                height: '26px',
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'transform 0.1s ease, background-color 0.1s ease',
                padding: 0
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.25)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              {emoji}
            </button>
          );
        })}
      </div>

      {/* Divider */}
      <div style={{ width: '1px', height: '16px', backgroundColor: 'var(--border-subtle)', margin: '0 3px' }} />

      {/* Reply button */}
      <button
        type="button"
        onClick={handleReplyClick}
        title="Reply"
        style={{
          background: 'none',
          border: 'none',
          borderRadius: '6px',
          width: '24px',
          height: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: 'var(--text-secondary)',
          transition: 'color 0.1s ease, background-color 0.1s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--primary)';
          e.currentTarget.style.backgroundColor = 'var(--bg-muted)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--text-secondary)';
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        <Reply size={14} />
      </button>

      {/* Copy button */}
      {message.content && (
        <button
          type="button"
          onClick={handleCopy}
          title={copied ? 'Copied!' : 'Copy text'}
          style={{
            background: 'none',
            border: 'none',
            borderRadius: '6px',
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: copied ? 'var(--primary)' : 'var(--text-secondary)',
            transition: 'color 0.1s ease'
          }}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
      )}

      {/* 3-dots dropdown for Options */}
      <div style={{ position: 'relative' }}>
        <button
          type="button"
          onClick={() => setShowMenu(!showMenu)}
          title="More message options"
          style={{
            background: showMenu ? 'var(--bg-muted)' : 'none',
            border: 'none',
            borderRadius: '6px',
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--text-secondary)'
          }}
        >
          <MoreVertical size={14} />
        </button>

        {showMenu && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 4px)',
              right: isMine ? 0 : 'auto',
              left: isMine ? 'auto' : 0,
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '10px',
              boxShadow: 'var(--shadow-lg)',
              padding: '4px',
              minWidth: '130px',
              zIndex: 30,
              display: 'flex',
              flexDirection: 'column',
              gap: '2px'
            }}
          >
            <button
              type="button"
              onClick={handleReplyClick}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: '100%',
                padding: '6px 10px',
                border: 'none',
                background: 'transparent',
                borderRadius: '6px',
                fontSize: '0.8125rem',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-muted)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <Reply size={13} color="var(--primary)" />
              <span>Reply</span>
            </button>

            {message.content && (
              <button
                type="button"
                onClick={handleCopy}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '6px 10px',
                  border: 'none',
                  background: 'transparent',
                  borderRadius: '6px',
                  fontSize: '0.8125rem',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-muted)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                {copied ? <Check size={13} color="var(--primary)" /> : <Copy size={13} color="var(--text-secondary)" />}
                <span>{copied ? 'Copied!' : 'Copy text'}</span>
              </button>
            )}

            {isMine && message.content && (
              <button
                type="button"
                onClick={handleEditClick}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '6px 10px',
                  border: 'none',
                  background: 'transparent',
                  borderRadius: '6px',
                  fontSize: '0.8125rem',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-muted)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <Edit2 size={13} color="var(--primary)" />
                <span>Edit message</span>
              </button>
            )}

            {isMine && (
              <button
                type="button"
                onClick={handleDeleteClick}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '6px 10px',
                  border: 'none',
                  background: 'transparent',
                  borderRadius: '6px',
                  fontSize: '0.8125rem',
                  color: '#dc2626',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.12)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <Trash2 size={13} color="#dc2626" />
                <span>Delete</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Component to display reaction count badges attached beneath the bubble
interface ReactionBadgesProps {
  reactions?: MessageReaction[];
  currentUserId: string;
  onToggleReaction: (emoji: string) => void;
}

export const ReactionBadges: React.FC<ReactionBadgesProps> = ({
  reactions = [],
  currentUserId,
  onToggleReaction
}) => {
  if (!reactions || reactions.length === 0) return null;

  // Group by emoji
  const grouped: Record<string, { count: number; hasMine: boolean; users: string[] }> = {};
  for (const r of reactions) {
    if (!grouped[r.reaction]) {
      grouped[r.reaction] = { count: 0, hasMine: false, users: [] };
    }
    grouped[r.reaction].count += 1;
    if (r.user_id === currentUserId) {
      grouped[r.reaction].hasMine = true;
    }
    if (r.user?.full_name) {
      grouped[r.reaction].users.push(r.user.full_name);
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '4px',
        marginTop: '3px'
      }}
    >
      {Object.entries(grouped).map(([emoji, data]) => (
        <button
          key={emoji}
          type="button"
          onClick={() => onToggleReaction(emoji)}
          title={data.users.length > 0 ? `${emoji} by ${data.users.join(', ')}` : `${emoji} (${data.count})`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3px',
            backgroundColor: data.hasMine ? 'var(--primary-light)' : 'var(--bg-surface-elevated)',
            border: data.hasMine ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
            borderRadius: '12px',
            padding: '2px 7px',
            fontSize: '0.75rem',
            lineHeight: 1.2,
            cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <span>{emoji}</span>
          <span
            style={{
              fontWeight: 600,
              fontSize: '0.6875rem',
              color: data.hasMine ? 'var(--primary)' : 'var(--text-secondary)'
            }}
          >
            {data.count}
          </span>
        </button>
      ))}
    </div>
  );
};
