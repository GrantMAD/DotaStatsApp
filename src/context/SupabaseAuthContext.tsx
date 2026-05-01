import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../services/supabase';
import { Session, User } from '@supabase/supabase-js';

interface SupabaseAuthContextType {
  session: Session | null;
  user: User | null;
  steamAccountId: string | null;
  matchLimit: number;
  notificationsEnabled: boolean;
  pushToken: string | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateNotificationPrefs: (enabled: boolean, token?: string | null) => Promise<void>;
}

export const SupabaseAuthContext = createContext<SupabaseAuthContextType>({
  session: null,
  user: null,
  steamAccountId: null,
  matchLimit: 20,
  notificationsEnabled: false,
  pushToken: null,
  isLoading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
  updateNotificationPrefs: async () => {},
});

export const useSupabaseAuth = () => useContext(SupabaseAuthContext);

export function SupabaseAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [steamAccountId, setSteamAccountId] = useState<string | null>(null);
  const [matchLimit, setMatchLimit] = useState(20);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProfile = async (currentUser?: User | null) => {
    const activeUser = currentUser !== undefined ? currentUser : user;
    if (!activeUser) {
      setSteamAccountId(null);
      setMatchLimit(20);
      setNotificationsEnabled(false);
      setPushToken(null);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select('steam_account_id, match_limit, notifications_enabled, push_token')
        .eq('id', activeUser.id)
        .single();
        
      if (!error && data) {
        setSteamAccountId(data.steam_account_id);
        if (data.match_limit) {
          setMatchLimit(data.match_limit);
        }
        setNotificationsEnabled(!!data.notifications_enabled);
        setPushToken(data.push_token);
      }
    } catch (e) {
      console.error("Error fetching user profile:", e);
    }
  };

  const updateNotificationPrefs = async (enabled: boolean, token?: string | null) => {
    if (!user) return;

    try {
      const updateData: any = { notifications_enabled: enabled };
      if (token !== undefined) {
        updateData.push_token = token;
      }

      const { error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', user.id);

      if (error) throw error;

      setNotificationsEnabled(enabled);
      if (token !== undefined) setPushToken(token);
    } catch (e) {
      console.error("Error updating notification prefs:", e);
      throw e;
    }
  };

  useEffect(() => {
    // Initial session fetch
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        refreshProfile(session.user).finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        refreshProfile(session.user).finally(() => setIsLoading(false));
      } else {
        setSteamAccountId(null);
        setMatchLimit(20);
        setNotificationsEnabled(false);
        setPushToken(null);
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <SupabaseAuthContext.Provider value={{ 
      session, 
      user, 
      steamAccountId, 
      matchLimit, 
      notificationsEnabled,
      pushToken,
      isLoading, 
      signOut, 
      refreshProfile,
      updateNotificationPrefs
    }}>
      {children}
    </SupabaseAuthContext.Provider>
  );
}
