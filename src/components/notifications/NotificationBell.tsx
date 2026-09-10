import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, Store, MessageSquare, Sparkles, Loader2 } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import type { NotificationItem } from '../../lib/database.types';

const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
};

export const NotificationBell: React.FC<{ isMobileHeader?: boolean }> = ({ isMobileHeader = false }) => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    isSubscribed,
    permissionStatus,
    enablePushNotifications,
    isIOSRequired
  } = useNotification();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [enablingPush, setEnablingPush] = useState<boolean>(false);
  const [pushFeedback, setPushFeedback] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close dropdown on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleNotificationClick = async (notif: NotificationItem) => {
    if (!notif.is_read) {
      await markAsRead(notif.id);
    }
    setIsOpen(false);

    const targetUrl = notif.data?.url || (notif.data?.listing_id ? `/product/${notif.data.listing_id}` : '/');
    navigate(targetUrl);
  };

  const handleEnablePush = async () => {
    setEnablingPush(true);
    setPushFeedback(null);
    const res = await enablePushNotifications();
    setEnablingPush(false);
    if (!res.success) {
      setPushFeedback(res.error || 'Permission not granted.');
    }
  };

  return (
    <div style={{ position: 'relative' }} ref={panelRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="btn btn-ghost btn-icon"
        title="Notifications"
        aria-label="View notifications"
        style={{
          position: 'relative',
          padding: isMobileHeader ? '0.45rem' : '0.5rem',
          color: isOpen ? 'var(--primary)' : 'var(--text-primary)'
        }}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: isMobileHeader ? '2px' : '4px',
              right: isMobileHeader ? '2px' : '4px',
              backgroundColor: 'var(--primary)',
              color: '#ffffff',
              fontSize: isMobileHeader ? '0.625rem' : '0.6875rem',
              fontWeight: 700,
              minWidth: isMobileHeader ? '16px' : '18px',
              height: isMobileHeader ? '16px' : '18px',
              padding: '0 3px',
              borderRadius: 'var(--radius-full)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1,
              boxShadow: '0 2px 4px rgba(13, 148, 136, 0.4)'
            }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown Panel */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: isMobileHeader ? '-60px' : 0,
            width: 'clamp(300px, 90vw, 380px)',
            maxHeight: 'min(540px, 80vh)',
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.08)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1150,
            overflow: 'hidden',
            animation: 'slideDownFade 0.2s ease'
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '0.875rem 1rem',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'var(--bg-surface)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span
                  style={{
                    backgroundColor: 'rgba(13, 148, 136, 0.1)',
                    color: 'var(--primary)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '0.1rem 0.5rem',
                    borderRadius: 'var(--radius-full)'
                  }}
                >
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary)',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                <CheckCheck size={14} />
                <span>Mark all as read</span>
              </button>
            )}
          </div>

          {/* Web Push Status Card (If push not yet enabled) */}
          {!isSubscribed && permissionStatus !== 'denied' && (
            <div
              style={{
                backgroundColor: 'rgba(13, 148, 136, 0.06)',
                borderBottom: '1px solid rgba(13, 148, 136, 0.15)',
                padding: '0.75rem 1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={16} color="var(--primary)" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Enable background push alerts
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.35 }}>
                {isIOSRequired
                  ? 'On iPhone: Tap Share in Safari and select "Add to Home Screen" to receive alerts.'
                  : 'Receive instant alerts for new listings and buyer messages even when CampusBazaar is closed.'}
              </p>
              {!isIOSRequired && (
                <button
                  type="button"
                  onClick={handleEnablePush}
                  disabled={enablingPush}
                  className="btn btn-primary btn-sm"
                  style={{ alignSelf: 'flex-start', marginTop: '0.25rem', padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                >
                  {enablingPush ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      <span>Enabling...</span>
                    </>
                  ) : (
                    <span>Enable Push Notifications</span>
                  )}
                </button>
              )}
              {pushFeedback && (
                <span style={{ fontSize: '0.6875rem', color: 'var(--danger)' }}>
                  {pushFeedback}
                </span>
              )}
            </div>
          )}

          {/* Notifications List */}
          <div
            style={{
              overflowY: 'auto',
              flex: 1,
              maxHeight: '400px'
            }}
          >
            {notifications.length === 0 ? (
              <div
                style={{
                  padding: '3rem 1.5rem',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--bg-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-muted)'
                  }}
                >
                  <Bell size={20} />
                </div>
                <p style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                  No new notifications
                </p>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0 }}>
                  You're all caught up!
                </p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleNotificationClick(item)}
                  style={{
                    padding: '0.875rem 1rem',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    cursor: 'pointer',
                    backgroundColor: item.is_read ? 'transparent' : 'rgba(13, 148, 136, 0.04)',
                    borderBottom: '1px solid var(--border-subtle)',
                    transition: 'background-color 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-muted)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = item.is_read ? 'transparent' : 'rgba(13, 148, 136, 0.04)';
                  }}
                >
                  {/* Icon Indicator */}
                  <div
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '10px',
                      backgroundColor: item.type === 'new_message' ? '#eff6ff' : '#ecfdf5',
                      color: item.type === 'new_message' ? '#3b82f6' : '#059669',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px'
                    }}
                  >
                    {item.type === 'new_message' ? <MessageSquare size={16} /> : <Store size={16} />}
                  </div>

                  {/* Notification Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                      <p
                        style={{
                          fontSize: '0.875rem',
                          fontWeight: item.is_read ? 600 : 700,
                          color: 'var(--text-primary)',
                          margin: 0,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {item.title}
                      </p>
                      <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', flexShrink: 0 }}>
                        {formatTimeAgo(item.created_at)}
                      </span>
                    </div>

                    <p
                      style={{
                        fontSize: '0.8125rem',
                        color: item.is_read ? 'var(--text-secondary)' : 'var(--text-primary)',
                        margin: '0.2rem 0 0 0',
                        lineHeight: 1.35,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {item.body}
                    </p>
                  </div>

                  {/* Unread Indicator Dot */}
                  {!item.is_read && (
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--primary)',
                        flexShrink: 0,
                        marginTop: '6px'
                      }}
                    />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
