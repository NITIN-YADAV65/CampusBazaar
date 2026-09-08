import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Profile } from '../lib/database.types';
import { getAuthRedirectUrl } from '../lib/authUrl';

interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  isEmailVerified: boolean;
  isAdmin: boolean;
  signUp: (data: SignUpData) => Promise<{ error: AuthError | Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | Error | null }>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchProfile = async (userId: string) => {
    if (!isSupabaseConfigured) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!error && data) {
        // Clean legacy blob: URLs if present in database
        if (data.avatar_url && (data.avatar_url.startsWith('blob:') || data.avatar_url.startsWith('data:'))) {
          await supabase
            .from('profiles')
            .update({ avatar_url: null })
            .eq('id', userId);
          data.avatar_url = null;
        }
        setProfile(data as Profile);
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
    }
  };

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    // Get current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async ({ email, password, fullName, phone, avatarUrl }: SignUpData) => {
    if (!isSupabaseConfigured) {
      return { error: new Error('Supabase is not configured. Please set your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.') };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone: phone || null,
          avatar_url: avatarUrl || null,
        },
        emailRedirectTo: getAuthRedirectUrl('/login'),
      },
    });

    if (error) return { error };

    // Also ensure profile record is inserted if triggers are delayed
    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        full_name: fullName,
        phone: phone || null,
        avatar_url: avatarUrl || null,
        role: 'user',
      });
    }

    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      return { error: new Error('Supabase is not configured. Please check your environment variables.') };
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) return { error };

    return { error: null };
  };

  const signOut = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setProfile(null);
    setSession(null);
  };

  const resetPassword = async (email: string) => {
    if (!isSupabaseConfigured) {
      return { error: new Error('Supabase is not configured.') };
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    return { error };
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user || !isSupabaseConfigured) {
      return { error: new Error('User not logged in or Supabase not configured.') };
    }

    // Safety guard: prevent blob: or data: URLs from being stored
    const safeUpdates = { ...updates };
    if (safeUpdates.avatar_url && (safeUpdates.avatar_url.startsWith('blob:') || safeUpdates.avatar_url.startsWith('data:'))) {
      safeUpdates.avatar_url = null;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ ...safeUpdates, updated_at: new Date().toISOString() })
        .eq('id', user.id);

      if (error) return { error };

      setProfile((prev) => (prev ? { ...prev, ...safeUpdates } : null));
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const isEmailVerified = Boolean(user?.email_confirmed_at || user?.confirmed_at);
  const isAdmin = profile?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        isEmailVerified,
        isAdmin,
        signUp,
        signIn,
        signOut,
        resetPassword,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
