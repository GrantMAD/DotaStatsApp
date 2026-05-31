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
 * Generic fetch wrapper for OpenDota API.
 */
export async function fetchFromOpenDota<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = endpoint.startsWith('http') ? endpoint : `${OPENDOTA_BASE_URL}${endpoint}`;
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`OpenDota API error: ${response.status} ${response.statusText}`);
  }
  return response.json();
}
