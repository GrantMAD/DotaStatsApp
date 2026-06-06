import { OPENDOTA_BASE_URL } from './constants';

/**
 * Helper to map game mode IDs to names
 */
export const GAME_MODES: Record<number, string> = {
  0: "Unknown",
  1: "All Pick",
  2: "Captains Mode",
  3: "Random Draft",
  4: "Single Draft",
  5: "All Random",
  22: "Ranked All Pick",
  23: "Turbo",
};

/**
 * Converts a Steam64 ID to a Steam32 Account ID.
 * Dota 2 API uses Steam32 IDs.
 */
export function convertSteam64To32(steam64: string): string {
  try {
    const bigInt64 = BigInt(steam64);
    const offset = BigInt('76561197960265728');
    return (bigInt64 - offset).toString();
  } catch {
    return steam64;
  }
}

/**
 * Checks if a Steam profile is private based on its visibility state.
 * 3 = Public, 1 = Private/Friends Only.
 */
export function isProfilePrivate(profile: any | null): boolean {
  if (!profile || !profile.profile) return true;
  return profile.profile.communityvisibilitystate !== 3;
}

/**
 * Checks if match data is restricted (likely "Expose Public Match Data" is off).
 * Even if a profile is public, match data might be empty.
 */
export function isDataRestricted(profile: any | null, matchCount: number = 0): boolean {
  if (isProfilePrivate(profile)) return true;
  // If profile is public but has no recent matches and it's not a new account
  return matchCount === 0 && !!profile?.last_match_time;
}

/**
 * Custom error class for API-related failures
 */
export class ApiError extends Error {
  status?: number;
  friendlyMessage: string;
  
  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    
    // Map status codes to user-friendly messages
    switch (status) {
      case 404:
        this.friendlyMessage = "The requested data could not be found. It might be private or doesn't exist.";
        break;
      case 429:
        this.friendlyMessage = "Rate limit exceeded. OpenDota's free tier is limited. Please wait a moment.";
        break;
      case 408:
        this.friendlyMessage = "The request timed out. Your connection might be slow.";
        break;
      case 500:
      case 502:
      case 503:
        this.friendlyMessage = "The Dota 2 data service is currently having trouble. Try again shortly.";
        break;
      default:
        this.friendlyMessage = message || "An unexpected network error occurred.";
    }
  }
}

/**
 * Generic fetch wrapper for OpenDota API with standardized timeout and error handling.
 */
export async function fetchFromOpenDota<T>(
  endpoint: string, 
  options: RequestInit = {}, 
  timeoutMs: number = 15000
): Promise<T> {
  const url = endpoint.startsWith('http') ? endpoint : `${OPENDOTA_BASE_URL}${endpoint}`;
  
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  const finalOptions: RequestInit = {
    ...options,
    signal: options.signal 
      ? anySignal([options.signal, controller.signal]) 
      : controller.signal,
  };

  try {
    const response = await fetch(url, finalOptions);
    clearTimeout(id);

    if (!response.ok) {
      throw new ApiError(
        `OpenDota API error: ${response.statusText}`, 
        response.status
      );
    }

    return await response.json();
  } catch (error: any) {
    clearTimeout(id);
    
    if (error instanceof ApiError) throw error;
    
    if (error.name === 'AbortError') {
      throw new ApiError('Request timed out', 408);
    }
    
    throw new ApiError(error.message || 'Network request failed');
  }
}

/**
 * Helper to combine multiple AbortSignals
 */
function anySignal(signals: AbortSignal[]): AbortSignal {
  const controller = new AbortController();
  
  for (const signal of signals) {
    if (signal.aborted) {
      controller.abort();
      return signal;
    }
    signal.addEventListener('abort', () => controller.abort(), { once: true });
  }
  
  return controller.signal;
}
