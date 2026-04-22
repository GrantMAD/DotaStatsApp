import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../services/supabase';
import { Session, User } from '@supabase/supabase-js';

interface SupabaseAuthContextType {
  session: Session | null;
  user: User | null;
  steamAccountId: string | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export const SupabaseAuthContext = createContext<SupabaseAuthContextType>({
  session: null,
  user: null,
  steamAccountId: null,
  isLoading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export const useSupabaseAuth = () => useContext(SupabaseAuthContext);

export function SupabaseAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [steamAccountId, setSteamAccountId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProfile = async (currentUser?: User | null) => {
    const activeUser = currentUser !== undefined ? currentUser : user;
    if (!activeUser) {
      setSteamAccountId(null);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select('steam_account_id')
        .eq('id', activeUser.id)
        .single();
        
      if (!error && data) {
        setSteamAccountId(data.steam_account_id);
      }
    } catch (e) {
      console.error("Error fetching user profile:", e);
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
    <SupabaseAuthContext.Provider value={{ session, user, steamAccountId, isLoading, signOut, refreshProfile }}>
      {children}
    </SupabaseAuthContext.Provider>
  );
}
