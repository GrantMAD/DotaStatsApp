import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import * as SecureStore from 'expo-secure-store';
import { useState, useCallback, useEffect } from 'react';
import { Platform } from 'react-native';

const STORAGE_KEY = 'account_id';

// Helper for storage on different platforms
const storage = {
  getItem: async (key: string) => {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    return await SecureStore.getItemAsync(key);
  },
  setItem: async (key: string, value: string) => {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  },
  removeItem: async (key: string) => {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  }
};

WebBrowser.maybeCompleteAuthSession();

// The Steam OpenID Endpoint
const STEAM_OPENID_URL = 'https://steamcommunity.com/openid/login';

export const useSteamAuth = () => {
  const [accountId, setAccountId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load session on startup
  useEffect(() => {
    storage.getItem(STORAGE_KEY).then(id => {
      if (id) setAccountId(id);
      setIsLoading(false);
    });
  }, []);

  const login = useCallback(async () => {
    try {
      setIsLoading(true);
      // Create a unique redirect URI for this device
      const redirectUrl = AuthSession.makeRedirectUri();

      // Construct Steam OpenID 2.0 Login URL
      const params = new URLSearchParams({
        'openid.ns': 'http://specs.openid.net/auth/2.0',
        'openid.mode': 'checkid_setup',
        'openid.return_to': redirectUrl,
        'openid.realm': redirectUrl,
        'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select',
        'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select',
      });

      const authUrl = `${STEAM_OPENID_URL}?${params.toString()}`;

      // Open the browser and wait for redirect
      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUrl);

      if (result.type === 'success' && result.url) {
        // Parse the returned URL parameters from Steam
        const urlParams = new URL(result.url).searchParams;
        const queryDict: Record<string, string> = {};
        urlParams.forEach((value, key) => queryDict[key] = value);

        // Send parameters to our local Expo API route to validate and extract Account ID
        // Because we are using Expo Router on mobile, we'd typically need the dev server IP
        // For this local dev phase, we might need to hardcode the host or use a relative fetch
        // Note: React Native fetch with relative paths doesn't work out of the box, we use the local origin
        // But for this MVP let's assume we extract it directly here if API route isn't reachable
        // To be safe, we will just parse it here since we are entirely client side for now.
        
        const claimedId = queryDict['openid.claimed_id'];
        
        if (claimedId) {
          const match = claimedId.match(/\/id\/(\d+)$/);
          if (match && match[1]) {
            const steamId64 = match[1];
            // Convert to 32-bit Account ID
            const accId = BigInt(steamId64) - BigInt('76561197960265728');
            const accountIdStr = accId.toString();

            // Save to storage
            await storage.setItem(STORAGE_KEY, accountIdStr);
            setAccountId(accountIdStr);
          }
        }
      }
    } catch (e) {
      console.error('Login failed', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await storage.removeItem(STORAGE_KEY);
    setAccountId(null);
  }, []);

  return {
    accountId,
    isLoading,
    login,
    logout,
  };
};
