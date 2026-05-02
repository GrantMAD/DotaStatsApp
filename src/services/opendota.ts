export const OPENDOTA_BASE_URL = 'https://api.opendota.com/api';

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
  gold_per_min: number;
  xp_per_min: number;
  hero_damage?: number;
  tower_damage?: number;
  last_hits?: number;
  hero_healing?: number;
  lane?: number | null;
  lane_role?: number | null;
}

export interface ChatMessage {
  time: number;
  type: string;
  unit?: string;
  key: string;
  slot?: number;
  player_slot?: number;
}

export interface PickBan {
  is_pick: boolean;
  hero_id: number;
  team: number;
  order: number;
}

export interface PermanentBuff {
  permanent_buff: string;
  stack_count: number;
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
  chat?: ChatMessage[];
  picks_bans?: PickBan[];
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
    permanent_buffs?: PermanentBuff[];
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
    hero_damage_taken?: number;
    kill_log?: { time: number; key: string }[];
    camps_stacked?: number;
    obs_placed?: number;
    sen_placed?: number;
    actions_per_min?: number;
    lane_efficiency_pct?: number;
    buyback_count?: number;
    lane?: number;
    lane_role?: number;
    is_roaming?: boolean;
    purchase_log?: { time: number; key: string }[];
    buyback_log?: { time: number; slot: number; type: string; player_slot: number }[];
    avatar?: string;
    avatarfull?: string;
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

export interface Peer {
  account_id: number;
  last_played: number;
  win: number;
  games: number;
  with_win: number;
  with_games: number;
  against_win: number;
  against_games: number;
  personaname: string;
  avatar: string;
  avatarfull?: string;
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
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s for fuzzy search

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
      throw new Error('Search timed out. Try using a Steam ID for instant results.');
    }
    throw error;
  }
}

export interface PlayerHero {
  hero_id: string;
  last_played: number;
  games: number;
  win: number;
  with_games: number;
  with_win: number;
  against_games: number;
  against_win: number;
}

/**
 * Fetches the hero stats for a specific player.
 */
export async function getPlayerHeroes(accountId: string | number): Promise<PlayerHero[]> {
  try {
    const response = await fetch(`${OPENDOTA_BASE_URL}/players/${accountId}/heroes`);
    if (!response.ok) throw new Error('Failed to fetch player heroes');
    return await response.json();
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
export async function getPlayerWinLoss(accountId: string | number, params: Record<string, string> = {}): Promise<WinLossStats | null> {
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
export async function getPlayerTotals(accountId: string | number, params: Record<string, string> = {}): Promise<PlayerTotal[]> {
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

export interface PlayerMatchFilters {
  win?: number;
  hero_id?: number;
  game_mode?: number;
  lobby_type?: number;
  date?: number;
  limit?: number;
  offset?: number;
}

/**
 * Fetches aggregated counts for various categories (region, game_mode, etc.)
 */
export async function getPlayerCounts(accountId: string | number): Promise<PlayerCounts | null> {
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

    const response = await fetch(`${OPENDOTA_BASE_URL}/players/${accountId}/matches?${params.toString()}`);
    if (!response.ok) throw new Error('Failed to fetch matches');
    return await response.json();
  } catch (error) {
    console.error('Error fetching filtered matches:', error);
    return [];
  }
}

/**
 * Fetches recent matches for the player with a custom limit.
 * (Provides richer data like GPM/XPM than the /matches endpoint)
 */
export async function getRecentMatches(accountId: string | number, limit: number = 20): Promise<RecentMatch[]> {
  try {
    const response = await fetch(`${OPENDOTA_BASE_URL}/players/${accountId}/recentMatches`);
    if (!response.ok) throw new Error('Failed to fetch recent matches');
    const data = await response.json();
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
    const response = await fetch(`${OPENDOTA_BASE_URL}/players/${accountId}/peers`);
    if (!response.ok) throw new Error('Failed to fetch peers');
    return await response.json();
  } catch (error) {
    console.error('Error fetching peers:', error);
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

/**
 * Submits a request to parse a specific match.
 */
export async function requestMatchParse(matchId: number): Promise<{ job: { jobId: string } } | null> {
  try {
    const response = await fetch(`${OPENDOTA_BASE_URL}/request/${matchId}`, {
      method: 'POST'
    });
    if (!response.ok) throw new Error('Failed to request match parse');
    return await response.json();
  } catch (e) {
    console.error(e);
    return null;
  }
}

/** ─── PHASE 2 GLOBAL STATS ─── **/

export interface LiveGame {
  match_id: number;
  server_id: string;
  lobby_id: string;
  game_time: number;
  average_mmr: number;
  players: {
    account_id: number;
    hero_id: number;
    name?: string;
  }[];
}

export interface GlobalRecord {
  match_id: number;
  score: number;
  start_time: number;
}

export async function getLiveGames(): Promise<LiveGame[]> {
  try {
    const response = await fetch(`${OPENDOTA_BASE_URL}/live`);
    if (!response.ok) throw new Error('Failed to fetch live games');
    const data = await response.json();
    // Sort by MMR and return top high-level games
    return data
      .filter((g: any) => g.average_mmr > 0)
      .sort((a: any, b: any) => b.average_mmr - a.average_mmr)
      .slice(0, 10);
  } catch (e) {
    console.error(e);
    return [];
  }
}

export async function getGlobalRecords(field: string): Promise<GlobalRecord[]> {
  try {
    const response = await fetch(`${OPENDOTA_BASE_URL}/records/${field}`);
    if (!response.ok) throw new Error('Failed to fetch global records');
    const data = await response.json();
    return data.slice(0, 5);
  } catch (e) {
    console.error(e);
    return [];
  }
}

/** ─── PRO SCENE HUB ─── **/

export interface ProPlayer {
  account_id: number;
  steamid: string;
  avatar: string;
  personaname: string;
  full_name: string;
  team_id: number;
  team_name: string;
  team_tag: string;
  country_code: string;
}

export interface ProTeam {
  team_id: number;
  rating: number;
  wins: number;
  losses: number;
  last_match_time: number;
  name: string;
  tag: string;
  logo_url?: string;
}

export interface League {
  leagueid: number;
  ticket: string | null;
  banner: string | null;
  tier: 'premium' | 'professional' | 'amateur' | 'excluded' | null;
  name: string;
}

export async function getProPlayers(): Promise<ProPlayer[]> {
  try {
    const response = await fetch(`${OPENDOTA_BASE_URL}/proPlayers`);
    if (!response.ok) throw new Error('Failed to fetch pro players');
    const data = await response.json();
    // Deduplicate by account_id
    return Array.from(new Map(data.map((p: any) => [p.account_id, p])).values()) as ProPlayer[];
  } catch (e) {
    console.error(e);
    return [];
  }
}

export async function getProTeams(): Promise<ProTeam[]> {
  try {
    const response = await fetch(`${OPENDOTA_BASE_URL}/teams`);
    if (!response.ok) throw new Error('Failed to fetch pro teams');
    const data = await response.json();
    
    // Deduplicate by team_id to avoid key errors in FlatLists
    const uniqueTeams = Array.from(new Map(data.map((t: any) => [t.team_id, t])).values()) as ProTeam[];
    
    // Sort and slice
    return uniqueTeams.sort((a: any, b: any) => b.rating - a.rating).slice(0, 500);
  } catch (e) {
    console.error(e);
    return [];
  }
}

export async function getLeagues(): Promise<League[]> {
  try {
    const response = await fetch(`${OPENDOTA_BASE_URL}/leagues`);
    if (!response.ok) throw new Error('Failed to fetch leagues');
    const data = await response.json();
    // Deduplicate by leagueid
    return Array.from(new Map(data.map((l: any) => [l.leagueid, l])).values()) as League[];
  } catch (e) {
    console.error(e);
    return [];
  }
}

export async function getTeamRoster(teamId: number): Promise<ProPlayer[]> {
  try {
    const response = await fetch(`${OPENDOTA_BASE_URL}/teams/${teamId}/players`);
    if (!response.ok) throw new Error('Failed to fetch team players');
    const data = await response.json();
    return data.filter((p: any) => p.is_current_team_member);
  } catch (e) {
    console.error(e);
    return [];
  }
}

export async function getTeamMatches(teamId: number): Promise<ProMatch[]> {
  try {
    const response = await fetch(`${OPENDOTA_BASE_URL}/teams/${teamId}/matches`);
    if (!response.ok) throw new Error('Failed to fetch team matches');
    return await response.json();
  } catch (e) {
    console.error(e);
    return [];
  }
}

export async function getLeagueMatches(leagueId: number): Promise<ProMatch[]> {
  try {
    const response = await fetch(`${OPENDOTA_BASE_URL}/leagues/${leagueId}/matches`);
    if (!response.ok) throw new Error('Failed to fetch league matches');
    return await response.json();
  } catch (e) {
    console.error(e);
    return [];
  }
}

// ─── Global Stats Types & Functions ──────────────────────────────

export interface HeroStats {
  id: number;
  name: string;
  localized_name: string;
  primary_attr: string;
  attack_type: string;
  roles: string[];
  img: string;
  icon: string;
  // Public match stats (all ranks aggregated)
  pub_pick: number;
  pub_win: number;
  // Per-bracket picks/wins (1=Herald ... 8=Immortal)
  '1_pick': number; '1_win': number;
  '2_pick': number; '2_win': number;
  '3_pick': number; '3_win': number;
  '4_pick': number; '4_win': number;
  '5_pick': number; '5_win': number;
  '6_pick': number; '6_win': number;
  '7_pick': number; '7_win': number;
  '8_pick': number; '8_win': number;
  // Pro scene
  pro_pick: number;
  pro_win: number;
  pro_ban: number;
  // Turbo
  turbo_picks: number;
  turbo_wins: number;
}

export interface ProMatch {
  match_id: number;
  duration: number;
  start_time: number;
  radiant_team_id: number | null;
  radiant_name: string | null;
  dire_team_id: number | null;
  dire_name: string | null;
  leagueid: number;
  league_name: string;
  series_id: number;
  series_type: number;
  radiant_score: number;
  dire_score: number;
  radiant_win: boolean | null;
}

/**
 * Fetches global hero stats including pick/win rates across all brackets.
 */
export async function getHeroStats(): Promise<HeroStats[]> {
  try {
    const response = await fetch(`${OPENDOTA_BASE_URL}/heroStats`);
    if (!response.ok) throw new Error('Failed to fetch hero stats');
    return await response.json();
  } catch (error) {
    console.error('Error fetching hero stats:', error);
    return [];
  }
}

/**
 * Fetches recent professional matches.
 */
export async function getProMatches(limit: number = 10): Promise<ProMatch[]> {
  try {
    const response = await fetch(`${OPENDOTA_BASE_URL}/proMatches`);
    if (!response.ok) throw new Error('Failed to fetch pro matches');
    const data = await response.json();
    return data.slice(0, limit);
  } catch (error) {
    console.error('Error fetching pro matches:', error);
    return [];
  }
}

export interface WordCloudData {
  my_word_counts: Record<string, number>;
  all_word_counts: Record<string, number>;
}

/**
 * Fetches the word cloud data for a specific player.
 */
export async function getPlayerWordCloud(accountId: string | number): Promise<WordCloudData | null> {
  try {
    const response = await fetch(`${OPENDOTA_BASE_URL}/players/${accountId}/wordcloud`);
    if (!response.ok) throw new Error('Failed to fetch word cloud');
    return await response.json();
  } catch (error) {
    console.error('Error fetching word cloud:', error);
    return null;
  }
}

export const openDotaApi = {
  searchPlayers,
  getPlayerHeroes,
  getPlayerProfile,
  getPlayerWinLoss,
  getPlayerTotals,
  getPlayerCounts,
  getPlayerMatches,
  getRecentMatches,
  getPlayerPeers,
  getMatchDetails,
  requestMatchParse,
  getLiveGames,
  getGlobalRecords,
  getProPlayers,
  getProTeams,
  getLeagues,
  getTeamRoster,
  getTeamMatches,
  getLeagueMatches,
  getHeroStats,
  getProMatches,
  getPlayerWordCloud,
};
