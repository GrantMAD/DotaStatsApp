const OPENDOTA_BASE_URL = 'https://api.opendota.com/api';

export interface PlayerProfile {
  profile: {
    account_id: number;
    personaname: string;
    avatarfull: string;
    profileurl: string;
    loccountrycode: string | null;
  };
  rank_tier: number | null;
  leaderboard_rank: number | null;
  last_match_time?: string;
}

export interface SearchResult {
  account_id: number;
  personaname: string;
  avatarfull: string;
  last_match_time?: string;
  similarity?: number;
}

export interface WinLossStats {
  win: number;
  lose: number;
}

export interface PlayerTotal {
  field: string;
  n: number;
  sum: number;
}

export interface PlayerCounts {
  leaver_status: Record<string, { games: number; win: number }>;
  game_mode: Record<string, { games: number; win: number }>;
  lobby_type: Record<string, { games: number; win: number }>;
  lane_role: Record<string, { games: number; win: number }>;
  region: Record<string, { games: number; win: number }>;
  patch: Record<string, { games: number; win: number }>;
}

export interface RecentMatch {
  match_id: number;
  player_slot: number;
  radiant_win: boolean;
  duration: number;
  hero_id: number;
  start_time: number;
  kills: number;
  deaths: number;
  assists: number;
}

export interface MatchDetails {
  match_id: number;
  radiant_win: boolean;
  duration: number;
  start_time: number;
  radiant_score: number;
  dire_score: number;
  game_mode: number;
  lobby_type: number;
  region: number;
  patch: number;
  first_blood_time: number;
  radiant_gold_adv: number[];
  radiant_xp_adv: number[];
  players: {
    account_id: number;
    personaname: string;
    hero_id: number;
    kills: number;
    deaths: number;
    assists: number;
    last_hits: number;
    denies: number;
    gold_per_min: number;
    xp_per_min: number;
    level: number;
    net_worth: number;
    hero_damage: number;
    tower_damage: number;
    hero_healing: number;
    item_0: number;
    item_1: number;
    item_2: number;
    item_3: number;
    item_4: number;
    item_5: number;
    item_neutral: number;
    player_slot: number;
    // Advanced/Parsed fields
    benchmarks?: {
      gold_per_min: { raw: number; pct: number };
      xp_per_min: { raw: number; pct: number };
      hero_damage_per_min: { raw: number; pct: number };
      hero_healing_per_min: { raw: number; pct: number };
      tower_damage: { raw: number; pct: number };
      last_hits_per_min: { raw: number; pct: number };
    };
    stuns?: number;
    multi_kills?: Record<string, number>;
    kill_streaks?: Record<string, number>;
    hero_damage_targets?: Record<string, number>;
    kill_log?: { time: number; key: string }[];
    camps_stacked?: number;
    lane_efficiency_pct?: number;
    buyback_count?: number;
    lane?: number;
    lane_role?: number;
    is_roaming?: boolean;
  }[];
  version?: number; // Present if match is parsed
}

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
function convertSteam64To32(steam64: string): string {
  try {
    const bigInt64 = BigInt(steam64);
    const offset = BigInt('76561197960265728');
    return (bigInt64 - offset).toString();
  } catch {
    return steam64;
  }
}

/**
 * Searches for players by name or ID.
 */
export async function searchPlayers(query: string): Promise<SearchResult[]> {
  console.log(`[OpenDota] Searching for: "${query}"`);
  
  let processedQuery = query.trim();

  // If the query is a long number (likely Steam64), convert it
  if (/^\d{17}$/.test(processedQuery)) {
    console.log('[OpenDota] Detected Steam64 ID, converting to Steam32');
    processedQuery = convertSteam64To32(processedQuery);
  }

  // If the query is now a valid Account ID, try to fetch the profile directly
  if (/^\d+$/.test(processedQuery) && processedQuery.length < 12) {
    console.log(`[OpenDota] Performing direct ID lookup for: ${processedQuery}`);
    const profile = await getPlayerProfile(processedQuery);
    if (profile && profile.profile) {
      return [{
        account_id: profile.profile.account_id,
        personaname: profile.profile.personaname,
        avatarfull: profile.profile.avatarfull,
        last_match_time: profile.last_match_time
      }];
    }
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s for fuzzy search

  try {
    const response = await fetch(`${OPENDOTA_BASE_URL}/search?q=${encodeURIComponent(query)}`, {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) throw new Error(`Search failed with status: ${response.status}`);
    const data = await response.json();
    console.log(`[OpenDota] Search successful, found ${data.length} results`);
    return data;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Search request timed out. OpenDota servers are under heavy load. Try using a Steam ID for instant results.');
    }
    throw error;
  }
}

/**
 * Fetches the core profile data for a specific account.
 */
export async function getPlayerProfile(accountId: string): Promise<PlayerProfile | null> {
  try {
    const response = await fetch(`${OPENDOTA_BASE_URL}/players/${accountId}`);
    if (!response.ok) throw new Error('Failed to fetch profile');
    return await response.json();
  } catch (error) {
    console.error('Error fetching player profile:', error);
    return null;
  }
}

/**
 * Fetches the user's overall win/loss record.
 */
export async function getPlayerWinLoss(accountId: string, params: Record<string, string> = {}): Promise<WinLossStats | null> {
  try {
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`${OPENDOTA_BASE_URL}/players/${accountId}/wl${query ? `?${query}` : ''}`);
    if (!response.ok) throw new Error('Failed to fetch W/L stats');
    return await response.json();
  } catch (error) {
    console.error('Error fetching win/loss stats:', error);
    return null;
  }
}

/**
 * Fetches cumulative stats for a player across all matches.
 */
export async function getPlayerTotals(accountId: string, params: Record<string, string> = {}): Promise<PlayerTotal[]> {
  try {
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`${OPENDOTA_BASE_URL}/players/${accountId}/totals${query ? `?${query}` : ''}`);
    if (!response.ok) throw new Error('Failed to fetch player totals');
    return await response.json();
  } catch (error) {
    console.error('Error fetching player totals:', error);
    return [];
  }
}

/**
 * Fetches aggregated counts for various categories (region, game_mode, etc.)
 */
export async function getPlayerCounts(accountId: string): Promise<PlayerCounts | null> {
  try {
    const response = await fetch(`${OPENDOTA_BASE_URL}/players/${accountId}/counts`);
    if (!response.ok) throw new Error('Failed to fetch player counts');
    return await response.json();
  } catch (error) {
    console.error('Error fetching player counts:', error);
    return null;
  }
}

/**
 * Fetches the most recent 10 matches for the player.
 */
export async function getRecentMatches(accountId: string, limit: number = 10): Promise<RecentMatch[]> {
  try {
    const response = await fetch(`${OPENDOTA_BASE_URL}/players/${accountId}/recentMatches?limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch recent matches');
    return await response.json();
  } catch (error) {
    console.error('Error fetching recent matches:', error);
    return [];
  }
}

/**
 * Fetches detailed statistics for a specific match.
 */
export async function getMatchDetails(matchId: number): Promise<MatchDetails | null> {
  try {
    const response = await fetch(`${OPENDOTA_BASE_URL}/matches/${matchId}`);
    if (!response.ok) throw new Error('Failed to fetch match details');
    return await response.json();
  } catch (error) {
    console.error('Error fetching match details:', error);
    return null;
  }
}
