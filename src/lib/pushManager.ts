// ============================================================
// CAMPUSBAZAAR: BROWSER WEB PUSH MANAGER
// ============================================================
// Manages Service Worker registration, Notification permissions,
// VAPID PushSubscription creation, and database synchronization.
// ============================================================

import { supabase, isSupabaseConfigured } from './supabase';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || 'BER7cZIMoaPMR2LIJKbztY44BAbONUXG9tlHaQqI26AEKKXunMsprRCVIdV82ZGyT1RMjOfmd9nrCCcNxMOAw5M';

// Convert URL-safe base64 string to Uint8Array for PushManager
export const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

// Check if Web Push API is supported in current environment
export const isPushSupported = (): boolean => {
  if (typeof window === 'undefined') return false;
  return (
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
};

// Check if device is running iOS
export const isIOSDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    !(window as any).MSStream
  );
};

// Check if current browser window is running as standalone PWA
export const isStandalonePWA = (): boolean => {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as any).standalone === true
  );
};

// Determine if iOS requires "Add to Home Screen" first
export const isIOSPwaRequired = (): boolean => {
  return isIOSDevice() && !isStandalonePWA();
};

// Get current native notification permission
export const getNotificationPermission = (): NotificationPermission | 'unsupported' => {
  if (!isPushSupported()) return 'unsupported';
  return Notification.permission;
};

// Register the production Service Worker (/sw.js)
export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if (!('serviceWorker' in navigator)) return null;

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    });
    return registration;
  } catch (err) {
    console.error('Service Worker registration failed:', err);
    return null;
  }
};

// Helper to convert ArrayBuffer to Base64
const arrayBufferToBase64 = (buffer: ArrayBuffer | null): string => {
  if (!buffer) return '';
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
};

// Subscribe user's browser to Push Notifications and store in Supabase
export const subscribeToPush = async (_userId?: string): Promise<{ success: boolean; error?: string }> => {
  if (!isPushSupported()) {
    return { success: false, error: 'Push notifications are not supported on this browser.' };
  }

  if (isIOSPwaRequired()) {
    return {
      success: false,
      error: 'On iPhone, please tap the Share button in Safari and select "Add to Home Screen" to enable notifications.'
    };
  }

  try {
    // 1. Request browser permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return { success: false, error: 'Notification permission was not granted.' };
    }

    // 2. Ensure Service Worker is registered and ready
    const registration = await navigator.serviceWorker.ready;
    if (!registration) {
      return { success: false, error: 'Service worker is not ready.' };
    }

    // 3. Check for existing subscription or create new one
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      const convertedVapidKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey as unknown as BufferSource
      });
    }

    if (!subscription) {
      return { success: false, error: 'Failed to create browser push subscription.' };
    }

    // 4. Extract subscription keys
    const p256dhKey = subscription.getKey('p256dh');
    const authKey = subscription.getKey('auth');

    if (!p256dhKey || !authKey) {
      return { success: false, error: 'Failed to extract push encryption keys.' };
    }

    const p256dh = arrayBufferToBase64(p256dhKey);
    const auth = arrayBufferToBase64(authKey);

    // 5. Store/Update in Supabase via secure RPC function (authenticates via auth.uid())
    if (isSupabaseConfigured) {
      const { error: rpcError } = await supabase.rpc('save_push_subscription', {
        p_endpoint: subscription.endpoint,
        p_p256dh: p256dh,
        p_auth: auth
      });

      if (rpcError) {
        console.error('Failed to save push subscription in database:', rpcError);
        return { success: false, error: 'Failed to save subscription in database: ' + rpcError.message };
      }
    }

    return { success: true };
  } catch (err: any) {
    console.error('Error during push subscription flow:', err);
    return { success: false, error: err.message || 'An unexpected error occurred.' };
  }
};

// Unsubscribe user's browser from Push Notifications
export const unsubscribeFromPush = async (userId: string): Promise<{ success: boolean; error?: string }> => {
  if (!('serviceWorker' in navigator)) return { success: true };

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      const endpoint = subscription.endpoint;
      // 1. Unsubscribe from browser push manager
      await subscription.unsubscribe();

      // 2. Delete from Supabase
      if (isSupabaseConfigured && userId) {
        await supabase
          .from('push_subscriptions')
          .delete()
          .eq('endpoint', endpoint);
      }
    }

    return { success: true };
  } catch (err: any) {
    console.error('Error unsubscribing from push:', err);
    return { success: false, error: err.message };
  }
};

// Synchronize device subscription on user login to safely transfer ownership to current user
export const syncSubscriptionOnLogin = async (_userId?: string): Promise<void> => {
  if (!isPushSupported() || !isSupabaseConfigured) return;

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      const p256dhKey = subscription.getKey('p256dh');
      const authKey = subscription.getKey('auth');
      if (p256dhKey && authKey) {
        await supabase.rpc('save_push_subscription', {
          p_endpoint: subscription.endpoint,
          p_p256dh: arrayBufferToBase64(p256dhKey),
          p_auth: arrayBufferToBase64(authKey)
        });
      }
    }
  } catch (e) {
    console.warn('Could not sync subscription on login:', e);
  }
};
