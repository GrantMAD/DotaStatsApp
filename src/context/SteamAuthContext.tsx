import React, { createContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import * as SecureStore from 'expo-secure-store';
import { useSupabaseAuth } from './SupabaseAuthContext';
import { getPlayerProfile } from '../services/opendota';
import { supabase } from '../services/supabase';

const STORAGE_KEY = 'account_id';
const STEAM_OPENID_URL = 'https://steamcommunity.com/openid/login';

const storage = {
  getItem: async (key: string) => {
    if (Platform.OS === 'web') return localStorage.getItem(key);
    return await SecureStore.getItemAsync(key);
  },
  setItem: async (key: string, value: string) => {
    if (Platform.OS === 'web') localStorage.setItem(key, value);
    else await SecureStore.setItemAsync(key, value);
  },
  removeItem: async (key: string) => {
    if (Platform.OS === 'web') localStorage.removeItem(key);
    else await SecureStore.deleteItemAsync(key);
  }
};

interface SteamAuthContextType {
  accountId: string | null;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

export const SteamAuthContext = createContext<SteamAuthContextType | undefined>(undefined);

WebBrowser.maybeCompleteAuthSession();

export function SteamAuthProvider({ children }: { children: ReactNode }) {
  const [accountId, setAccountId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user, refreshProfile } = useSupabaseAuth();

  useEffect(() => {
    storage.getItem(STORAGE_KEY).then(id => {
      if (id) setAccountId(id);
      setIsLoading(false);
    });
  }, []);

  const login = useCallback(async () => {
    try {
      console.log('Initiating Steam login...');
      setIsLoading(true);
      const redirectUrl = AuthSession.makeRedirectUri();
      console.log('Redirect URL:', redirectUrl);
      
      const params = new URLSearchParams({
        'openid.ns': 'http://specs.openid.net/auth/2.0',
        'openid.mode': 'checkid_setup',
        'openid.return_to': redirectUrl,
        'openid.realm': redirectUrl,
        'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select',
        'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select',
      });

      const authUrl = `${STEAM_OPENID_URL}?${params.toString()}`;
      console.log('Auth URL:', authUrl);
      
      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUrl);
      console.log('Auth Result:', result);

      if (result.type === 'success' && result.url) {
        console.log('Login success, parsing URL:', result.url);
        const urlParams = new URL(result.url).searchParams;
        const claimedId = urlParams.get('openid.claimed_id');
        
        if (claimedId) {
          const match = claimedId.match(/\/id\/(\d+)$/);
          if (match && match[1]) {
            const steamId64 = match[1];
            const accId = BigInt(steamId64) - BigInt('76561197960265728');
            const accountIdStr = accId.toString();

            await storage.setItem(STORAGE_KEY, accountIdStr);
            setAccountId(accountIdStr);

            if (user) {
              const profile = await getPlayerProfile(accountIdStr);
              let steamName = null;
              if (profile && profile.profile) {
                steamName = profile.profile.personaname;
              }
              
              await supabase
                .from('users')
                .update({ steam_account_id: accountIdStr, steam_name: steamName })
                .eq('id', user.id);
                
              await refreshProfile();
            }
          }
        }
      }
    } catch (e) {
      console.error('Login failed', e);
    } finally {
      setIsLoading(false);
    }
  }, [user, refreshProfile]);

  const logout = useCallback(async () => {
    await storage.removeItem(STORAGE_KEY);
    setAccountId(null);
  }, []);

  return (
    <SteamAuthContext.Provider value={{ accountId, isLoading, login, logout }}>
      {children}
    </SteamAuthContext.Provider>
  );
}
