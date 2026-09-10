import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Listing, Category } from '../lib/database.types';
import { DEMO_LISTINGS, DEMO_CATEGORIES } from '../lib/demoData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface MarketplaceContextType {
  listings: Listing[];
  categories: Category[];
  favorites: string[];
  loadingListings: boolean;
  unreadMessagesCount: number;
  refreshUnreadCount: () => Promise<void>;
  toggleFavorite: (listingId: string) => Promise<void>;
  isFavorite: (listingId: string) => boolean;
  refreshListings: () => Promise<void>;
  addListing: (listing: Partial<Listing>, imageFiles?: File[]) => Promise<{ id?: string; error?: Error | null }>;
  deleteListing: (listingId: string) => Promise<{ error?: Error | null }>;
  markAsSold: (listingId: string) => Promise<{ error?: Error | null }>;
  recordView: (listingId: string) => Promise<number | undefined>;
}

const MarketplaceContext = createContext<MarketplaceContextType | undefined>(undefined);

export const MarketplaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>(() => {
    return isSupabaseConfigured ? [] : DEMO_LISTINGS;
  });
  const [categories, setCategories] = useState<Category[]>(DEMO_CATEGORIES);
  const [favorites, setFavorites] = useState<string[]>(() => {
    if (isSupabaseConfigured) return [];
    try {
      const saved = localStorage.getItem('cb_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [loadingListings, setLoadingListings] = useState<boolean>(false);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState<number>(0);

  // ============================================================
  // UNREAD MESSAGES COUNT (USER-SPECIFIC & REALTIME)
  // ============================================================
  const fetchUnreadCount = useCallback(async () => {
    if (!isSupabaseConfigured || !user?.id) {
      setUnreadMessagesCount(0);
      return;
    }

    try {
      // 1. Fetch unread messages where current user is the recipient
      // Under Supabase RLS, selecting from messages only returns rows from conversations
      // where the user is buyer or seller. Filtering neq('sender_id', user.id)
      // ensures we only count messages received from the other party.
      const { data: unreadMsgs, error: msgErr } = await supabase
        .from('messages')
        .select('id, conversation_id, sender_id, is_read, is_deleted')
        .neq('sender_id', user.id)
        .eq('is_read', false);

      let msgList: any[] = unreadMsgs || [];

      if (msgErr) {
        // Fallback in case is_deleted column is not in schema cache
        if (msgErr.message?.includes('is_deleted')) {
          const fallback = await supabase
            .from('messages')
            .select('id, conversation_id, sender_id, is_read')
            .neq('sender_id', user.id)
            .eq('is_read', false);
          if (!fallback.error && fallback.data) {
            msgList = fallback.data;
          } else {
            return;
          }
        } else {
          console.warn('Error fetching unread messages count:', msgErr.message);
          return;
        }
      }

      if (!msgList || msgList.length === 0) {
        setUnreadMessagesCount(0);
        return;
      }

      // Exclude soft-deleted messages
      const nonDeletedMsgs = msgList.filter((m: any) => !m.is_deleted);
      if (nonDeletedMsgs.length === 0) {
        setUnreadMessagesCount(0);
        return;
      }

      // 2. Identify hidden/deleted conversations for the current user
      const hiddenConvIds = new Set<string>();
      try {
        const { data: hiddenSettings } = await supabase
          .from('conversation_user_settings')
          .select('conversation_id')
          .eq('user_id', user.id)
          .eq('is_hidden', true);

        if (hiddenSettings) {
          hiddenSettings.forEach((s: any) => hiddenConvIds.add(s.conversation_id));
        }
      } catch (err) {
        console.warn('Could not load hidden settings for unread count:', err);
      }

      // Also check localStorage fallback for immediate local sync
      try {
        const local = localStorage.getItem(`cb_conv_settings_${user.id}`);
        if (local) {
          const parsed = JSON.parse(local);
          Object.keys(parsed).forEach(cid => {
            if (parsed[cid]?.is_hidden) hiddenConvIds.add(cid);
          });
        }
      } catch {}

      // 3. Count only unread messages from active, non-hidden conversations
      const validUnread = nonDeletedMsgs.filter((m: any) => !hiddenConvIds.has(m.conversation_id));
      setUnreadMessagesCount(validUnread.length);
    } catch (err) {
      console.warn('Exception calculating unread count:', err);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!isSupabaseConfigured || !user?.id) {
      setUnreadMessagesCount(0);
      return;
    }

    // Initial fetch on mount or user auth change
    fetchUnreadCount();

    // Supabase Realtime subscription to messages and conversation settings
    const channel = supabase
      .channel(`unread-badge:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages'
        },
        () => {
          fetchUnreadCount();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversation_user_settings',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchUnreadCount();
        }
      )
      .subscribe();

    // Refresh when tab/window regains focus
    const handleFocus = () => {
      fetchUnreadCount();
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener('focus', handleFocus);
    };
  }, [user?.id, fetchUnreadCount]);

  // ============================================================
  // FETCH LISTINGS FROM SUPABASE
  // ============================================================
  const fetchListings = useCallback(async () => {
    setLoadingListings(true);

    if (!isSupabaseConfigured) {
      setListings(DEMO_LISTINGS);
      setLoadingListings(false);
      return;
    }

    try {
      // 1. Attempt full joined query with seller profiles and listing images
      let { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          seller:profiles(*),
          images:listing_images(*)
        `)
        .order('created_at', { ascending: false });

      // 2. If profiles join fails (e.g. FK missing in schema cache), try joining images
      if (error) {
        console.warn('Joined profiles query failed, trying listings with images:', error.message);
        const imgJoinRes = await supabase
          .from('listings')
          .select(`
            *,
            images:listing_images(*)
          `)
          .order('created_at', { ascending: false });

        if (!imgJoinRes.error && imgJoinRes.data) {
          data = imgJoinRes.data;
          error = null;
        }
      }

      // 3. If relations cannot be joined automatically, query listings directly
      if (error) {
        console.warn('Joined listings query failed, falling back to direct listings table:', error.message);
        const directRes = await supabase
          .from('listings')
          .select('*')
          .order('created_at', { ascending: false });

        if (directRes.error) {
          console.error('FETCH LISTINGS ERROR:', directRes.error);
          setListings([]);
          return;
        }
        data = directRes.data;

        // 4. If listings were fetched directly, query listing_images separately to attach images
        if (data && data.length > 0) {
          try {
            const listingIds = data.map((item: any) => item.id);
            let imgRes = await supabase
              .from('listing_images')
              .select('*')
              .in('listing_id', listingIds)
              .order('position', { ascending: true });

            // If ordering by position fails (e.g. column not yet added), query without order
            if (imgRes.error && imgRes.error.message?.toLowerCase().includes('position')) {
              imgRes = await supabase
                .from('listing_images')
                .select('*')
                .in('listing_id', listingIds);
            }

            const imgData = imgRes.data;
            if (!imgRes.error && imgData && imgData.length > 0) {
              const imagesByListing: Record<string, any[]> = {};
              imgData.forEach((img: any) => {
                if (!imagesByListing[img.listing_id]) imagesByListing[img.listing_id] = [];
                imagesByListing[img.listing_id].push(img);
              });
              data = data.map((item: any) => ({
                ...item,
                images: imagesByListing[item.id] || []
              }));
            }
          } catch (e) {
            console.warn('Could not query listing_images separately:', e);
          }
        }
      }

      console.log('SUPABASE LISTINGS FETCHED:', data?.length ?? 0);

      const mappedListings: Listing[] = (data || []).map((item: any) => ({
        ...item,
        seller: item.seller || {
          id: item.seller_id,
          full_name: 'Campus Student',
          avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
          role: 'user',
          created_at: item.created_at,
          updated_at: item.updated_at,
        },
        views_count: Number(item.views_count) || 0,
        likes_count: Number(item.likes_count) || 0,
        images: Array.isArray(item.images) && item.images.length > 0
          ? item.images.sort((a: any, b: any) => a.position - b.position)
          : []
      }));

      // Set listings ONLY from Supabase - never merge with demo data
      setListings(mappedListings);
    } catch (err) {
      console.error('FETCH LISTINGS EXCEPTION:', err);
      setListings([]);
    } finally {
      setLoadingListings(false);
    }
  }, []);

  // ============================================================
  // FETCH CATEGORIES & REAL COUNTS FROM SUPABASE
  // ============================================================
  const fetchCategories = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setCategories(DEMO_CATEGORIES);
      return;
    }

    try {
      // 1. Single efficient Supabase query to count active listings by category
      // Respects the same active/visibility filter as marketplace explore/search queries
      const { data: listingData, error: listingErr } = await supabase
        .from('listings')
        .select('category_id')
        .eq('status', 'active');

      if (listingErr) {
        console.warn('Error fetching listing category counts:', listingErr.message);
      }

      const counts: Record<string, number> = {};
      if (listingData) {
        for (const item of listingData) {
          if (item.category_id) {
            counts[item.category_id] = (counts[item.category_id] || 0) + 1;
          }
        }
      }

      // 2. Query categories table if it exists, otherwise use base categories
      let baseCategories: Category[] = DEMO_CATEGORIES;
      try {
        const { data: catData, error: catErr } = await supabase
          .from('categories')
          .select('*');

        if (!catErr && catData && catData.length > 0) {
          baseCategories = catData;
        }
      } catch {
        // Fallback to base categories if table does not exist
      }

      // 3. Map real item counts from database (defaulting to 0 if category has 0 active listings)
      const categoriesWithRealCounts: Category[] = baseCategories.map(cat => ({
        ...cat,
        itemCount: counts[cat.id] || 0
      }));

      setCategories(categoriesWithRealCounts);
    } catch (err) {
      console.error('FETCH CATEGORIES EXCEPTION:', err);
    }
  }, []);

  // ============================================================
  // FETCH FAVORITES FROM SUPABASE
  // ============================================================
  const fetchFavorites = useCallback(async () => {
    if (!isSupabaseConfigured || !user) {
      return;
    }

    try {
      // Primary: query listing_likes
      let { data, error } = await supabase
        .from('listing_likes')
        .select('listing_id')
        .eq('user_id', user.id);

      // Fallback: favorites table
      if (error) {
        const fallbackRes = await supabase
          .from('favorites')
          .select('listing_id')
          .eq('user_id', user.id);
        data = fallbackRes.data;
        error = fallbackRes.error;
      }

      if (error) {
        console.error('FETCH FAVORITES ERROR:', error);
        return;
      }

      if (data) {
        const favoriteIds = data.map((item: any) => item.listing_id);
        setFavorites(favoriteIds);
        localStorage.setItem('cb_favorites', JSON.stringify(favoriteIds));
      }
    } catch (err) {
      console.error('FETCH FAVORITES EXCEPTION:', err);
    }
  }, [user]);

  // Fetch listings and categories on mount and whenever authenticated user changes
  useEffect(() => {
    fetchListings();
    fetchCategories();
    fetchFavorites();

    const handleFocus = () => {
      fetchListings();
      fetchCategories();
    };
    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchListings, fetchCategories, fetchFavorites, user]);

  // Realtime subscription for listings table changes
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const listingsChannel = supabase
      .channel('public-listings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'listings'
        },
        () => {
          fetchListings();
          fetchCategories();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(listingsChannel);
    };
  }, [fetchListings, fetchCategories]);

  // Fetch user favorites when user changes
  useEffect(() => {
    if (user) {
      fetchFavorites();
    } else {
      if (isSupabaseConfigured) {
        setFavorites([]);
      }
    }
  }, [fetchFavorites, user]);

  // ============================================================
  // TOGGLE FAVORITE / LIKE
  // ============================================================
  const toggleFavorite = async (listingId: string) => {
    const isFav = favorites.includes(listingId);
    const newFavorites = isFav
      ? favorites.filter(id => id !== listingId)
      : [...favorites, listingId];

    setFavorites(newFavorites);
    localStorage.setItem('cb_favorites', JSON.stringify(newFavorites));

    // Optimistically update likes_count on listing in local state
    setListings(prev => prev.map(l => {
      if (l.id === listingId) {
        const currentLikes = l.likes_count || 0;
        return {
          ...l,
          likes_count: Math.max(0, isFav ? currentLikes - 1 : currentLikes + 1)
        };
      }
      return l;
    }));

    if (isSupabaseConfigured && user) {
      try {
        const { data: rpcData, error: rpcError } = await supabase.rpc('toggle_listing_like', {
          target_listing_id: listingId
        });

        if (rpcError) {
          console.warn('RPC toggle_listing_like fallback to table ops:', rpcError.message);
          if (isFav) {
            await supabase.from('listing_likes').delete().eq('user_id', user.id).eq('listing_id', listingId);
          } else {
            await supabase.from('listing_likes').insert({ user_id: user.id, listing_id: listingId });
          }
        } else if (rpcData && typeof rpcData.likes_count === 'number') {
          // Sync exact likes_count from database
          setListings(prev => prev.map(l =>
            l.id === listingId ? { ...l, likes_count: rpcData.likes_count } : l
          ));
        }
      } catch (err) {
        console.error('FAVORITE SYNC EXCEPTION:', err);
      }
    }
  };

  const isFavorite = (listingId: string) => favorites.includes(listingId);

  // ============================================================
  // RECORD LISTING VIEW (Unique per user + listing)
  // ============================================================
  const recordView = async (listingId: string): Promise<number | undefined> => {
    if (!isSupabaseConfigured || !listingId) return undefined;
    try {
      if (user) {
        const { data, error } = await supabase.rpc('record_listing_view', {
          target_listing_id: listingId
        });
        if (!error && typeof data === 'number') {
          setListings(prev => prev.map(l => l.id === listingId ? { ...l, views_count: data } : l));
          return data;
        }
      }
    } catch (err) {
      console.warn('Could not record view:', err);
    }
    return undefined;
  };

  // ============================================================
  // CREATE LISTING (Supabase PostgreSQL + Storage)
  // ============================================================
  const addListing = async (
    newListingData: Partial<Listing>,
    imageFiles?: File[]
  ): Promise<{ id?: string; error?: Error | null }> => {
    try {
      if (isSupabaseConfigured && !user) {
        const authError = new Error('You must be logged in to create a listing.');
        console.error('CREATE LISTING ERROR:', authError);
        return { error: authError };
      }

      // 1. SUPABASE MODE
      if (isSupabaseConfigured && user) {
        console.log('Inserting listing for seller:', user.id);

        // Insert listing record into public.listings
        const { data: listingData, error: listingError } = await supabase
          .from('listings')
          .insert({
            seller_id: user.id,
            title: newListingData.title,
            description: newListingData.description,
            price: Number(newListingData.price),
            condition: newListingData.condition,
            category_id: newListingData.category_id,
            location: newListingData.location || 'LPU Campus, Phagwara',
            contact_preference: newListingData.contact_preference || 'In-app Chat',
            status: 'active',
          })
          .select()
          .single();

        if (listingError) {
          console.error('CREATE LISTING DB ERROR:', listingError);
          return { error: listingError };
        }

        console.log('Listing inserted successfully, ID:', listingData.id);

        // 2. Upload images to Supabase Storage bucket 'listing-images'
        const uploadedImageUrls: string[] = [];

        if (imageFiles && imageFiles.length > 0) {
          for (let i = 0; i < imageFiles.length; i++) {
            const file = imageFiles[i];
            const fileExt = file.name.split('.').pop() || 'jpg';
            const timestamp = Date.now();
            const filePath = `${user.id}/${listingData.id}/${timestamp}-${i}.${fileExt}`;

            console.log(`Uploading image ${i + 1}/${imageFiles.length} to ${filePath}`);

            const { error: uploadError } = await supabase.storage
              .from('listing-images')
              .upload(filePath, file, {
                contentType: file.type || undefined,
                cacheControl: '3600',
                upsert: false
              });

            if (uploadError) {
              console.error('STORAGE UPLOAD ERROR:', uploadError);
              // Clean up listing record so incomplete listings are not left in database
              await supabase.from('listings').delete().eq('id', listingData.id);
              return { 
                error: new Error(`Image upload failed: ${uploadError.message}. Please create the 'listing-images' bucket in Supabase Storage (public).`) 
              };
            }

            const { data: publicUrlData } = supabase.storage
              .from('listing-images')
              .getPublicUrl(filePath);

            if (publicUrlData?.publicUrl) {
              uploadedImageUrls.push(publicUrlData.publicUrl);
            }
          }

          // 3. Insert image records into public.listing_images
          if (uploadedImageUrls.length > 0) {
            const imageRecords = uploadedImageUrls.map((url, index) => ({
              listing_id: listingData.id,
              image_url: url,
              position: index,
            }));

            let { error: imageDbError } = await supabase
              .from('listing_images')
              .insert(imageRecords);

            // Resilient fallback: If position column is not yet present, retry without position
            if (imageDbError && imageDbError.message?.toLowerCase().includes('position')) {
              console.warn('listing_images table lacks position column, retrying insert without position:', imageDbError.message);
              const recordsWithoutPosition = uploadedImageUrls.map((url) => ({
                listing_id: listingData.id,
                image_url: url,
              }));
              const retryRes = await supabase
                .from('listing_images')
                .insert(recordsWithoutPosition);
              imageDbError = retryRes.error;
            }

            if (imageDbError) {
              console.error('INSERT LISTING_IMAGES DB ERROR:', imageDbError);
              // Clean up listing record
              await supabase.from('listings').delete().eq('id', listingData.id);
              return { 
                error: new Error(`Saving images failed: ${imageDbError.message}.`) 
              };
            }
          }
        }

        // 4. Dispatch push notifications to subscribed users via Edge Function (excludes seller)
        // Note: In-app notifications are created atomically by the database trigger 'trigger_notify_new_listing'
        try {
          await supabase.functions.invoke('send-push', {
            body: {
              exclude_user_id: user.id,
              title: 'New listing on CampusBazaar',
              body: `New listing: ${listingData.title}`,
              data: {
                listing_id: listingData.id,
                url: `/product/${listingData.id}`
              }
            }
          });
        } catch (notifErr) {
          console.warn('Could not dispatch new listing push notifications:', notifErr);
        }

        // 5. Refresh listings immediately from Supabase
        await fetchListings();
        await fetchCategories();

        return { id: listingData.id, error: null };
      }

      // 2. LOCAL PREVIEW / DEMO FALLBACK (Only if Supabase is not configured)
      const newId = `user-${Date.now()}`;
      const localImageUrls: string[] = [];

      if (imageFiles && imageFiles.length > 0) {
        imageFiles.forEach(file => {
          localImageUrls.push(URL.createObjectURL(file));
        });
      } else {
        localImageUrls.push('https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80');
      }

      const now = new Date().toISOString();
      const createdListing: Listing = {
        id: newId,
        seller_id: user?.id || 'current-user',
        title: newListingData.title || 'Untitled Item',
        description: newListingData.description || '',
        price: Number(newListingData.price) || 0,
        condition: newListingData.condition || 'Good',
        category_id: newListingData.category_id || 'other',
        location: newListingData.location || 'LPU Campus, Phagwara',
        contact_preference: newListingData.contact_preference || 'In-app Chat',
        status: 'active',
        views_count: 0,
        created_at: now,
        updated_at: now,
        seller: {
          id: user?.id || 'current-user',
          full_name: user?.user_metadata?.full_name || 'Campus Student',
          avatar_url: user?.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
          role: 'user',
          created_at: now,
          updated_at: now,
        },
        images: localImageUrls.map((url, index) => ({
          id: `img-${Date.now()}-${index}`,
          listing_id: newId,
          image_url: url,
          position: index,
          created_at: now,
        })),
      };

      setListings(prev => [createdListing, ...prev]);
      return { id: newId, error: null };
    } catch (err: any) {
      console.error('ERROR IN ADD LISTING:', err);
      return { error: err instanceof Error ? err : new Error(err?.message || 'Failed to create listing.') };
    }
  };

  // ============================================================
  // DELETE LISTING
  // ============================================================
  const deleteListing = async (listingId: string): Promise<{ error?: Error | null }> => {
    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase
          .from('listings')
          .delete()
          .eq('id', listingId);

        if (error) {
          console.error('DELETE LISTING ERROR:', error);
          return { error };
        }
      }

      setListings(prev => prev.filter(item => item.id !== listingId));
      fetchCategories();
      return { error: null };
    } catch (err: any) {
      console.error('DELETE LISTING EXCEPTION:', err);
      return { error: err instanceof Error ? err : new Error('Failed to delete listing.') };
    }
  };

  // ============================================================
  // MARK AS SOLD
  // ============================================================
  const markAsSold = async (listingId: string): Promise<{ error?: Error | null }> => {
    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase
          .from('listings')
          .update({
            status: 'sold',
            updated_at: new Date().toISOString(),
          })
          .eq('id', listingId);

        if (error) {
          console.error('MARK SOLD ERROR:', error);
          return { error };
        }
      }

      setListings(prev =>
        prev.map(item => (item.id === listingId ? { ...item, status: 'sold' } : item))
      );
      fetchCategories();
      return { error: null };
    } catch (err: any) {
      console.error('MARK SOLD EXCEPTION:', err);
      return { error: err instanceof Error ? err : new Error('Failed to mark listing as sold.') };
    }
  };

  return (
    <MarketplaceContext.Provider
      value={{
        listings,
        categories,
        favorites,
        loadingListings,
        unreadMessagesCount,
        refreshUnreadCount: fetchUnreadCount,
        toggleFavorite,
        isFavorite,
        refreshListings: fetchListings,
        addListing,
        deleteListing,
        markAsSold,
        recordView,
      }}
    >
      {children}
    </MarketplaceContext.Provider>
  );
};

export const useMarketplace = () => {
  const context = useContext(MarketplaceContext);
  if (!context) {
    throw new Error('useMarketplace must be used within MarketplaceProvider');
  }
  return context;
};
