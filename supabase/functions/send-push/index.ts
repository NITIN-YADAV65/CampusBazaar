// ============================================================
// CAMPUSBAZAAR: SUPABASE EDGE FUNCTION FOR WEB PUSH
// ============================================================
// Securely signs and delivers Web Push notifications using VAPID
// Removes stale/expired subscriptions (404/410 Gone) automatically
// Uses Supabase Service Role client to bypass RLS securely on the server
// ============================================================

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8';
import webpush from 'npm:web-push@3.6.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY');
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY');
    const vapidSubject = Deno.env.get('VAPID_SUBJECT') || 'mailto:contact@campus-bazaar.in';

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: 'Supabase server credentials not configured.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!vapidPublicKey || !vapidPrivateKey) {
      return new Response(
        JSON.stringify({ error: 'VAPID credentials not configured in Supabase secrets.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Configure web-push details
    webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

    // Initialize Supabase Admin Client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    const { notification_id, user_ids, exclude_user_id, title, body: notifBody, data } = body;

    let targetUserIds: string[] = [];
    let pushTitle = title || 'CampusBazaar';
    let pushContent = notifBody || 'You have a new update.';
    let pushData = data || {};

    let subQuery = supabase
      .from('push_subscriptions')
      .select('id, user_id, endpoint, p256dh, auth');

    // 1. If notification_id provided, fetch notification from database
    if (notification_id) {
      const { data: notif, error: notifErr } = await supabase
        .from('notifications')
        .select('*')
        .eq('id', notification_id)
        .single();

      if (notifErr || !notif) {
        return new Response(
          JSON.stringify({ error: 'Notification record not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Duplicate prevention: if push already sent for this notification record, skip
      if (notif.push_sent_at) {
        return new Response(
          JSON.stringify({ success: true, message: 'Push notification already dispatched.' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      targetUserIds = [notif.user_id];
      pushTitle = notif.title;
      pushContent = notif.body;
      pushData = notif.data || {};
      subQuery = subQuery.in('user_id', targetUserIds);
    } else if (Array.isArray(user_ids) && user_ids.length > 0) {
      subQuery = subQuery.in('user_id', user_ids);
    } else if (exclude_user_id) {
      subQuery = subQuery.neq('user_id', exclude_user_id);
    } else {
      return new Response(
        JSON.stringify({ error: 'Either notification_id, user_ids, or exclude_user_id is required.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Fetch active push subscriptions for target users
    const { data: subscriptions, error: subErr } = await subQuery;

    if (subErr) {
      return new Response(
        JSON.stringify({ error: 'Failed to query push subscriptions: ' + subErr.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!subscriptions || subscriptions.length === 0) {
      // Mark notification as processed even if no subscriptions exist
      if (notification_id) {
        await supabase
          .from('notifications')
          .update({ push_sent_at: new Date().toISOString() })
          .eq('id', notification_id);
      }

      return new Response(
        JSON.stringify({ success: true, message: 'No active push subscriptions found for recipient(s).', sent: 0 }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Prepare payload for the Service Worker
    const payload = JSON.stringify({
      title: pushTitle,
      body: pushContent,
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      data: {
        ...pushData,
        timestamp: Date.now()
      }
    });

    let sentCount = 0;
    let failedCount = 0;
    const staleSubscriptionIds: string[] = [];

    // 4. Send pushes concurrently
    await Promise.allSettled(
      subscriptions.map(async (sub) => {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        };

        try {
          await webpush.sendNotification(pushSubscription, payload, {
            TTL: 86400, // 24 hours
            urgency: 'high'
          });
          sentCount++;
        } catch (pushErr: any) {
          failedCount++;
          const statusCode = pushErr.statusCode;
          // HTTP 404 Not Found or 410 Gone means the subscription has expired or user revoked it
          if (statusCode === 404 || statusCode === 410) {
            staleSubscriptionIds.push(sub.id);
          } else {
            console.warn(`Push delivery failed for subscription ${sub.id}:`, pushErr.message);
          }
        }
      })
    );

    // 5. Clean up stale/expired subscriptions automatically
    if (staleSubscriptionIds.length > 0) {
      await supabase
        .from('push_subscriptions')
        .delete()
        .in('id', staleSubscriptionIds);
    }

    // 6. Mark notification as sent for idempotency
    if (notification_id) {
      await supabase
        .from('notifications')
        .update({ push_sent_at: new Date().toISOString() })
        .eq('id', notification_id);
    }

    return new Response(
      JSON.stringify({
        success: true,
        sent: sentCount,
        failed: failedCount,
        stale_cleaned: staleSubscriptionIds.length
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('send-push Edge Function error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal Server Error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
