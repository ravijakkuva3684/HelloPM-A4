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
  isLoggedIn: boolean;
  hasCompletedOnboarding: boolean;
  signIn: (email: string, password?: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password?: string, fullName?: string) => Promise<{ error: string | null }>;
  loginWithOtp: (identifier: string, type: 'email' | 'phone') => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: string | null }>;
  enableDemoMode: () => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [, startTransition] = useTransition();

  const configured = isSupabaseConfigured();

  useEffect(() => {
    // 1. Check onboarding state from localStorage
    const onboardingDone = typeof window !== 'undefined' && localStorage.getItem('remindly_onboarding_completed') === 'true';
    setHasCompletedOnboarding(onboardingDone);

    // 2. Check if user logged in via OTP/demo
    const storedLogin = typeof window !== 'undefined' && localStorage.getItem('remindly_is_logged_in') === 'true';
    const storedProfile = typeof window !== 'undefined' ? localStorage.getItem('remindly_user_profile') : null;

    if (!configured) {
      if (storedLogin && storedProfile) {
        setIsDemoMode(true);
        try {
          setProfile(JSON.parse(storedProfile));
        } catch {
          setProfile(INITIAL_PROFILE);
        }
      } else {
        setProfile(null);
        setIsDemoMode(false);
      }
      setLoading(false);
      return;
    }

    const supabase = createClient();
    if (!supabase) {
      if (storedLogin && storedProfile) {
        setIsDemoMode(true);
        try {
          setProfile(JSON.parse(storedProfile));
        } catch {
          setProfile(INITIAL_PROFILE);
        }
      }
      setLoading(false);
      return;
    }

    // Check active Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email);
      } else if (storedLogin && storedProfile) {
        // Fallback to local OTP session
        setIsDemoMode(true);
        try {
          setProfile(JSON.parse(storedProfile));
        } catch {
          setProfile(INITIAL_PROFILE);
        }
        setLoading(false);
      } else {
        setProfile(null);
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
      } else if (storedLogin && storedProfile) {
        setIsDemoMode(true);
        try {
          setProfile(JSON.parse(storedProfile));
        } catch {
          setProfile(INITIAL_PROFILE);
        }
        setLoading(false);
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

  const loginWithOtp = async (
    identifier: string,
    type: 'email' | 'phone'
  ): Promise<{ error: string | null }> => {
    try {
      const cleanIdentifier = identifier.trim();
      const isEmail = type === 'email';

      let displayName = '';
      if (isEmail) {
        const username = cleanIdentifier.split('@')[0];
        displayName = username.charAt(0).toUpperCase() + username.slice(1);
      } else {
        const digits = cleanIdentifier.replace(/\D/g, '');
        const lastDigits = digits.slice(-4) || '88';
        displayName = `User (${lastDigits})`;
      }

      const newProf: UserProfile = {
        id: 'otp_user_' + Date.now(),
        email: isEmail ? cleanIdentifier : `${cleanIdentifier.replace(/\D/g, '')}@phone.remindly.app`,
        phone: !isEmail ? cleanIdentifier : undefined,
        full_name: displayName,
        avatar_url: '',
        time_zone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
        created_at: new Date().toISOString(),
      };

      setProfile(newProf);
      setIsDemoMode(true);
      localStorage.setItem('remindly_is_logged_in', 'true');
      localStorage.setItem('remindly_user_profile', JSON.stringify(newProf));
      localStorage.setItem('remindly_auth_identifier', cleanIdentifier);
      localStorage.setItem('remindly_auth_type', type);

      // Reset onboarding so newly authenticated users experience the 4 informative screens
      setHasCompletedOnboarding(false);
      localStorage.removeItem('remindly_onboarding_completed');

      return { error: null };
    } catch (err: any) {
      return { error: err?.message || 'Failed to authenticate with OTP' };
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
      localStorage.setItem('remindly_is_logged_in', 'true');
      localStorage.setItem('remindly_user_profile', JSON.stringify(mockProf));
      setHasCompletedOnboarding(false);
      localStorage.removeItem('remindly_onboarding_completed');
      return { error: null };
    }

    const supabase = createClient();
    if (!supabase) return { error: 'Supabase client not initialized' };

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: password || 'Test123456!',
    });

    if (!error) {
      localStorage.setItem('remindly_is_logged_in', 'true');
    }

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
      localStorage.setItem('remindly_is_logged_in', 'true');
      localStorage.setItem('remindly_user_profile', JSON.stringify(mockProf));
      setHasCompletedOnboarding(false);
      localStorage.removeItem('remindly_onboarding_completed');
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

    if (!error) {
      localStorage.setItem('remindly_is_logged_in', 'true');
    }

    return { error: error?.message || null };
  };

  const signOut = async () => {
    if (configured) {
      const supabase = createClient();
      if (supabase) {
        await supabase.auth.signOut();
      }
    }
    localStorage.removeItem('remindly_is_logged_in');
    localStorage.removeItem('remindly_user_profile');
    localStorage.removeItem('remindly_auth_identifier');
    localStorage.removeItem('remindly_auth_type');
    localStorage.removeItem('remindly_onboarding_completed');
    localStorage.removeItem('remindly_demo_mode');
    setProfile(null);
    setUser(null);
    setSession(null);
    setIsDemoMode(false);
    setHasCompletedOnboarding(false);
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
    localStorage.setItem('remindly_is_logged_in', 'true');
    localStorage.setItem('remindly_demo_mode', 'true');
    localStorage.setItem('remindly_user_profile', JSON.stringify(INITIAL_PROFILE));
    setHasCompletedOnboarding(false);
    localStorage.removeItem('remindly_onboarding_completed');
  };

  const completeOnboarding = () => {
    setHasCompletedOnboarding(true);
    localStorage.setItem('remindly_onboarding_completed', 'true');
  };

  const resetOnboarding = () => {
    setHasCompletedOnboarding(false);
    localStorage.removeItem('remindly_onboarding_completed');
  };

  const isLoggedIn = Boolean(user || profile);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        isDemoMode,
        isConfigured: configured,
        isLoggedIn,
        hasCompletedOnboarding,
        signIn,
        signUp,
        loginWithOtp,
        signOut,
        updateProfile,
        enableDemoMode,
        completeOnboarding,
        resetOnboarding,
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
