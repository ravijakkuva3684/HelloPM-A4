'use client';

import React, { createContext, useContext, useEffect, useState, useTransition } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { UserProfile } from '@/types';
import { INITIAL_PROFILE } from '@/lib/mockData';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  isDemoMode: boolean;
  isConfigured: boolean;
  signIn: (email: string, password?: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password?: string, fullName?: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: string | null }>;
  enableDemoMode: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [, startTransition] = useTransition();

  const configured = isSupabaseConfigured();

  useEffect(() => {
    if (!configured) {
      // Supabase is not configured yet; check localStorage for demo user preference
      const storedDemo = localStorage.getItem('remindly_demo_mode');
      const storedProfile = localStorage.getItem('remindly_user_profile');

      if (storedDemo !== 'false') {
        setIsDemoMode(true);
        setProfile(storedProfile ? JSON.parse(storedProfile) : INITIAL_PROFILE);
      }
      setLoading(false);
      return;
    }

    const supabase = createClient();
    if (!supabase) {
      setLoading(false);
      return;
    }

    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email);
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [configured]);

  const fetchProfile = async (userId: string, email?: string) => {
    const supabase = createClient();
    if (!supabase) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        // Create profile if doesn't exist yet
        const newProf: UserProfile = {
          id: userId,
          email: email || '',
          full_name: email?.split('@')[0] || 'User',
          time_zone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
        };
        await supabase.from('profiles').insert(newProf);
        setProfile(newProf);
      } else if (data) {
        setProfile(data as UserProfile);
      }
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password?: string): Promise<{ error: string | null }> => {
    if (!configured || isDemoMode) {
      const mockProf: UserProfile = {
        id: 'mock-user-1',
        email,
        full_name: email.split('@')[0],
        time_zone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      };
      setProfile(mockProf);
      setIsDemoMode(true);
      localStorage.setItem('remindly_demo_mode', 'true');
      localStorage.setItem('remindly_user_profile', JSON.stringify(mockProf));
      return { error: null };
    }

    const supabase = createClient();
    if (!supabase) return { error: 'Supabase client not initialized' };

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: password || 'Test123456!',
    });

    return { error: error?.message || null };
  };

  const signUp = async (
    email: string,
    password?: string,
    fullName?: string
  ): Promise<{ error: string | null }> => {
    if (!configured || isDemoMode) {
      const mockProf: UserProfile = {
        id: 'mock-user-1',
        email,
        full_name: fullName || email.split('@')[0],
        time_zone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      };
      setProfile(mockProf);
      setIsDemoMode(true);
      localStorage.setItem('remindly_demo_mode', 'true');
      localStorage.setItem('remindly_user_profile', JSON.stringify(mockProf));
      return { error: null };
    }

    const supabase = createClient();
    if (!supabase) return { error: 'Supabase client not initialized' };

    const { error } = await supabase.auth.signUp({
      email,
      password: password || 'Test123456!',
      options: {
        data: {
          full_name: fullName || email.split('@')[0],
        },
      },
    });

    return { error: error?.message || null };
  };

  const signOut = async () => {
    if (isDemoMode || !configured) {
      localStorage.removeItem('remindly_demo_mode');
      localStorage.removeItem('remindly_user_profile');
      setProfile(null);
      setUser(null);
      setSession(null);
      setIsDemoMode(false);
      return;
    }

    const supabase = createClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    setProfile(null);
    setUser(null);
    setSession(null);
  };

  const updateProfile = async (updates: Partial<UserProfile>): Promise<{ error: string | null }> => {
    if (!profile) return { error: 'No user profile to update' };

    const updated = { ...profile, ...updates };

    if (isDemoMode || !configured) {
      setProfile(updated);
      localStorage.setItem('remindly_user_profile', JSON.stringify(updated));
      return { error: null };
    }

    const supabase = createClient();
    if (!supabase) return { error: 'Supabase not initialized' };

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', profile.id);

    if (!error) {
      startTransition(() => {
        setProfile(updated);
      });
    }

    return { error: error?.message || null };
  };

  const enableDemoMode = () => {
    setIsDemoMode(true);
    setProfile(INITIAL_PROFILE);
    localStorage.setItem('remindly_demo_mode', 'true');
    localStorage.setItem('remindly_user_profile', JSON.stringify(INITIAL_PROFILE));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        isDemoMode,
        isConfigured: configured,
        signIn,
        signUp,
        signOut,
        updateProfile,
        enableDemoMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
