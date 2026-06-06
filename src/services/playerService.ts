import { fetchFromOpenDota, convertSteam64To32 } from './apiUtils';
import { 
  SearchResult, 
  PlayerProfile, 
  WinLossStats, 
  PlayerTotal, 
  PlayerCounts, 
  RecentMatch, 
  Peer, 
  PlayerHero, 
  PlayerMatchFilters,
  WordCloudData,
  WardMapData,
  PlayerRating
} from './types';

/**
 * Searches for players by name or ID.
 */
export async function searchPlayers(query: string): Promise<SearchResult[]> {
  let processedQuery = query.trim();

  // If the query is a long number (likely Steam64), convert it
  if (/^\d{17}$/.test(processedQuery)) {
    processedQuery = convertSteam64To32(processedQuery);
  }

  // If the query is now a valid Account ID, try to fetch the profile directly
  if (/^\d+$/.test(processedQuery) && processedQuery.length < 12) {
    try {
      const profile = await getPlayerProfile(processedQuery);
      if (profile && profile.profile) {
        return [{
          account_id: profile.profile.account_id,
          personaname: profile.profile.personaname,
          avatarfull: profile.profile.avatarfull,
          last_match_time: profile.last_match_time
        }];
      }
    } catch {
      // Fallback to fuzzy search if direct lookup fails
    }
  }

  try {
    return await fetchFromOpenDota<SearchResult[]>(`/search?q=${encodeURIComponent(query)}`);
  } catch (error: any) {
    if (error.status === 408) {
      throw new Error('Search timed out. Try using a Steam ID for instant results.');
    }
    throw error;
  }
}

/**
 * Fetches the hero stats for a specific player.
 */
export async function getPlayerHeroes(accountId: string | number): Promise<PlayerHero[]> {
  try {
    return await fetchFromOpenDota<PlayerHero[]>(`/players/${accountId}/heroes`);
  } catch (error) {
    console.error('Error fetching player heroes:', error);
    return [];
  }
}

/**
 * Fetches the core profile data for a specific account.
 */
export async function getPlayerProfile(accountId: string | number): Promise<PlayerProfile | null> {
  try {
    return await fetchFromOpenDota<PlayerProfile>(`/players/${accountId}`);
  } catch (error) {
    console.error('Error fetching player profile:', error);
    return null;
  }
}

/**
 * Fetches the user's overall win/loss record.
 */
export async function getPlayerWinLoss(accountId: string | number, params: Record<string, string> = {}): Promise<WinLossStats | null> {
  try {
    const query = new URLSearchParams(params).toString();
    return await fetchFromOpenDota<WinLossStats>(`/players/${accountId}/wl${query ? `?${query}` : ''}`);
  } catch (error) {
    console.error('Error fetching win/loss stats:', error);
    return null;
  }
}

/**
 * Fetches cumulative stats for a player across all matches.
 */
export async function getPlayerTotals(accountId: string | number, params: Record<string, string> = {}): Promise<PlayerTotal[]> {
  try {
    const query = new URLSearchParams(params).toString();
    return await fetchFromOpenDota<PlayerTotal[]>(`/players/${accountId}/totals${query ? `?${query}` : ''}`);
  } catch (error) {
    console.error('Error fetching player totals:', error);
    return [];
  }
}

/**
 * Fetches aggregated counts for various categories (region, game_mode, etc.)
 */
export async function getPlayerCounts(accountId: string | number): Promise<PlayerCounts | null> {
  try {
    return await fetchFromOpenDota<PlayerCounts>(`/players/${accountId}/counts`);
  } catch (error) {
    console.error('Error fetching player counts:', error);
    return null;
  }
}

/**
 * Fetches matches for a player with filters.
 */
export async function getPlayerMatches(accountId: string | number, filters: PlayerMatchFilters = {}): Promise<RecentMatch[]> {
  try {
    const params = new URLSearchParams();
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.offset) params.append('offset', filters.offset.toString());
    if (filters.win !== undefined) params.append('win', filters.win.toString());
    if (filters.hero_id) params.append('hero_id', filters.hero_id.toString());
    if (filters.game_mode) params.append('game_mode', filters.game_mode.toString());
    if (filters.lobby_type) params.append('lobby_type', filters.lobby_type.toString());
    if (filters.date) params.append('date', filters.date.toString());

    return await fetchFromOpenDota<RecentMatch[]>(`/players/${accountId}/matches?${params.toString()}`);
  } catch (error) {
    console.error('Error fetching filtered matches:', error);
    return [];
  }
}

/**
 * Fetches recent matches for the player with a custom limit.
 */
export async function getRecentMatches(accountId: string | number, limit: number = 20): Promise<RecentMatch[]> {
  try {
    const data = await fetchFromOpenDota<RecentMatch[]>(`/players/${accountId}/recentMatches`);
    return data.slice(0, limit);
  } catch (error) {
    console.error('Error fetching recent matches:', error);
    return [];
  }
}

/**
 * Fetches players who have played in the same matches.
 */
export async function getPlayerPeers(accountId: string | number): Promise<Peer[]> {
  try {
    return await fetchFromOpenDota<Peer[]>(`/players/${accountId}/peers`);
  } catch (error) {
    console.error('Error fetching peers:', error);
    return [];
  }
}

/**
 * Fetches shared stats between two specific players.
 */
export async function getSharedStats(accountId: string | number, targetId: string | number): Promise<Peer | null> {
  try {
    const data = await fetchFromOpenDota<Peer[]>(`/players/${accountId}/peers?included_account_id=${targetId}`);
    return data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error('Error fetching shared stats:', error);
    return null;
  }
}

/**
 * Fetches the word cloud data for a specific player.
 */
export async function getPlayerWordCloud(accountId: string | number): Promise<WordCloudData | null> {
  try {
    return await fetchFromOpenDota<WordCloudData>(`/players/${accountId}/wordcloud`);
  } catch (error) {
    console.error('Error fetching word cloud:', error);
    return null;
  }
}

/**
 * Fetches the ward map data for a specific player.
 */
export async function getPlayerWardMap(accountId: string | number): Promise<WardMapData | null> {
  try {
    return await fetchFromOpenDota<WardMapData>(`/players/${accountId}/wardmap`);
  } catch (error) {
    console.error('Error fetching ward map:', error);
    return null;
  }
}

/**
 * Fetches the rating history for a specific player.
 */
export async function getPlayerRatings(accountId: string | number): Promise<PlayerRating[]> {
  try {
    return await fetchFromOpenDota<PlayerRating[]>(`/players/${accountId}/ratings`);
  } catch (error) {
    console.error('Error fetching ratings:', error);
    return [];
  }
}
