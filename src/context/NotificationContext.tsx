import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { NotificationItem } from '../lib/database.types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from './AuthContext';
import {
  isPushSupported,
  isIOSPwaRequired,
  getNotificationPermission,
  registerServiceWorker,
  subscribeToPush,
  unsubscribeFromPush,
  syncSubscriptionOnLogin
} from '../lib/pushManager';

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  loading: boolean;
  permissionStatus: NotificationPermission | 'unsupported';
  isSubscribed: boolean;
  isIOSRequired: boolean;
  showOptInPrompt: boolean;
  enablePushNotifications: () => Promise<{ success: boolean; error?: string }>;
  disablePushNotifications: () => Promise<{ success: boolean; error?: string }>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  dismissOptInPrompt: () => void;
  refreshNotifications: () => Promise<void>;
  dispatchPushForNotification: (notificationId: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission | 'unsupported'>('unsupported');
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [isIOSRequired, setIsIOSRequired] = useState<boolean>(false);
  const [showOptInPrompt, setShowOptInPrompt] = useState<boolean>(false);
  const [activeToast, setActiveToast] = useState<{ title: string; body: string } | null>(null);

  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize browser capabilities & Service Worker
  useEffect(() => {
    setPermissionStatus(getNotificationPermission());
    setIsIOSRequired(isIOSPwaRequired());
    registerServiceWorker();
  }, []);

  // Check whether device already has an active subscription in database
  const checkDeviceSubscription = useCallback(async () => {
    if (!isPushSupported() || !isSupabaseConfigured || !user?.id) {
      setIsSubscribed(false);
      return;
    }

    try {
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg?.pushManager?.getSubscription();
        if (sub) {
          // Verify against database
          const { data } = await supabase
            .from('push_subscriptions')
            .select('id')
            .eq('endpoint', sub.endpoint)
            .eq('user_id', user.id)
            .maybeSingle();

          setIsSubscribed(Boolean(data));
          return;
        }
      }
      setIsSubscribed(false);
    } catch (e) {
      console.warn('Error checking push subscription:', e);
      setIsSubscribed(false);
    }
  }, [user?.id]);

  // Fetch recent notifications for authenticated user
  const fetchNotifications = useCallback(async () => {
    if (!isSupabaseConfigured || !user?.id) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(30);

      if (error) {
        console.warn('Error fetching notifications:', error.message);
        return;
      }

      if (data) {
        setNotifications(data as NotificationItem[]);
        const unread = data.filter((n: any) => !n.is_read).length;
        setUnreadCount(unread);
      }
    } catch (err) {
      console.warn('Exception fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Evaluate if opt-in prompt should be shown
  useEffect(() => {
    if (!user?.id) {
      setShowOptInPrompt(false);
      return;
    }

    const currentPermission = getNotificationPermission();
    setPermissionStatus(currentPermission);

    // Only suggest when permission is default (never granted nor denied) and not yet dismissed
    if (currentPermission === 'default') {
      const isDismissed = localStorage.getItem(`cb_push_optin_dismissed_${user.id}`) === 'true';
      setShowOptInPrompt(!isDismissed);
    } else {
      setShowOptInPrompt(false);
    }

    checkDeviceSubscription();
    fetchNotifications();

    if (user?.id) {
      syncSubscriptionOnLogin(user.id);
    }
  }, [user?.id, checkDeviceSubscription, fetchNotifications]);

  // Dismiss custom opt-in prompt and persist dismissal
  const dismissOptInPrompt = useCallback(() => {
    if (user?.id) {
      localStorage.setItem(`cb_push_optin_dismissed_${user.id}`, 'true');
    }
    setShowOptInPrompt(false);
  }, [user?.id]);

  // Enable push notifications
  const enablePushNotifications = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    if (!user?.id) {
      return { success: false, error: 'User must be signed in.' };
    }

    const res = await subscribeToPush(user.id);
    setPermissionStatus(getNotificationPermission());

    if (res.success) {
      setIsSubscribed(true);
      setShowOptInPrompt(false);
      localStorage.setItem(`cb_push_optin_dismissed_${user.id}`, 'true');
    }

    return res;
  }, [user?.id]);

  // Disable push notifications
  const disablePushNotifications = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    if (!user?.id) {
      return { success: false, error: 'User must be signed in.' };
    }

    const res = await unsubscribeFromPush(user.id);
    if (res.success) {
      setIsSubscribed(false);
    }
    return res;
  }, [user?.id]);

  // Mark single notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    if (!user?.id || !isSupabaseConfigured) return;

    // Optimistic UI update
    setNotifications(prev =>
      prev.map(n => (n.id === notificationId ? { ...n, is_read: true, read_at: new Date().toISOString() } : n))
    );
    setUnreadCount(prev => Math.max(0, prev - 1));

    try {
      await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', notificationId)
        .eq('user_id', user.id);
    } catch (err) {
      console.warn('Error marking notification as read:', err);
    }
  }, [user?.id]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!user?.id || !isSupabaseConfigured) return;

    // Optimistic UI update
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() })));
    setUnreadCount(0);

    try {
      await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('is_read', false);
    } catch (err) {
      console.warn('Error marking all notifications as read:', err);
    }
  }, [user?.id]);

  // Dispatch Web Push via Supabase Edge Function
  const dispatchPushForNotification = useCallback(async (notificationId: string) => {
    if (!isSupabaseConfigured || !notificationId) return;

    try {
      await supabase.functions.invoke('send-push', {
        body: { notification_id: notificationId }
      });
    } catch (e) {
      console.warn('Could not trigger push delivery Edge Function:', e);
    }
  }, []);

  // Supabase Realtime subscription for incoming in-app notifications
  useEffect(() => {
    if (!isSupabaseConfigured || !user?.id) return;

    const channel = supabase
      .channel(`notifications-user:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const newNotif = payload.new as NotificationItem;
          if (!newNotif) return;

          setNotifications(prev => {
            if (prev.some(n => n.id === newNotif.id)) return prev;
            return [newNotif, ...prev];
          });
          setUnreadCount(prev => prev + 1);

          // In-app floating toast if document is visible
          if (document.visibilityState === 'visible') {
            setActiveToast({
              title: newNotif.title,
              body: newNotif.body
            });

            if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
            toastTimerRef.current = setTimeout(() => {
              setActiveToast(null);
            }, 5000);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const updated = payload.new as NotificationItem;
          if (!updated) return;

          setNotifications(prev =>
            prev.map(n => (n.id === updated.id ? { ...n, ...updated } : n))
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, [user?.id]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        permissionStatus,
        isSubscribed,
        isIOSRequired,
        showOptInPrompt,
        enablePushNotifications,
        disablePushNotifications,
        markAsRead,
        markAllAsRead,
        dismissOptInPrompt,
        refreshNotifications: fetchNotifications,
        dispatchPushForNotification
      }}
    >
      {children}

      {/* Floating In-App Toast for Active Users */}
      {activeToast && (
        <div
          style={{
            position: 'fixed',
            top: '75px',
            right: '1.25rem',
            zIndex: 9999,
            backgroundColor: '#0f172a',
            color: '#ffffff',
            borderRadius: '12px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.2)',
            padding: '0.875rem 1.25rem',
            maxWidth: '360px',
            width: 'calc(100vw - 2.5rem)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            animation: 'slideDownFade 0.25s ease',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem'
          }}
        >
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary)',
              marginTop: '6px',
              flexShrink: 0
            }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: '0.875rem', fontWeight: 700, margin: 0, color: '#f8fafc' }}>
              {activeToast.title}
            </p>
            <p
              style={{
                fontSize: '0.8125rem',
                margin: '0.25rem 0 0 0',
                color: '#cbd5e1',
                lineHeight: 1.35,
                wordBreak: 'break-word'
              }}
            >
              {activeToast.body}
            </p>
          </div>
          <button
            onClick={() => setActiveToast(null)}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              fontSize: '1rem',
              lineHeight: 1,
              padding: '0.2rem'
            }}
            aria-label="Close"
          >
            &times;
          </button>
        </div>
      )}
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
