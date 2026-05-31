import { fetchFromOpenDota } from './apiUtils';
import { ProPlayer, ProTeam, League, ProMatch } from './types';

/**
 * Fetches professional players.
 */
export async function getProPlayers(): Promise<ProPlayer[]> {
  try {
    const data = await fetchFromOpenDota<ProPlayer[]>(`/proPlayers`);
    // Deduplicate by account_id
    return Array.from(new Map(data.map((p: any) => [p.account_id, p])).values()) as ProPlayer[];
  } catch (e) {
    console.error(e);
    return [];
  }
}

/**
 * Fetches professional teams.
 */
export async function getProTeams(): Promise<ProTeam[]> {
  try {
    const data = await fetchFromOpenDota<ProTeam[]>(`/teams`);
    // Deduplicate by team_id
    const uniqueTeams = Array.from(new Map(data.map((t: any) => [t.team_id, t])).values()) as ProTeam[];
    // Sort by rating and slice
    return uniqueTeams.sort((a: any, b: any) => b.rating - a.rating).slice(0, 500);
  } catch (e) {
    console.error(e);
    return [];
  }
}

/**
 * Fetches professional leagues.
 */
export async function getLeagues(): Promise<League[]> {
  try {
    const data = await fetchFromOpenDota<League[]>(`/leagues`);
    // Deduplicate by leagueid
    return Array.from(new Map(data.map((l: any) => [l.leagueid, l])).values()) as League[];
  } catch (e) {
    console.error(e);
    return [];
  }
}

/**
 * Fetches current roster for a team.
 */
export async function getTeamRoster(teamId: number): Promise<ProPlayer[]> {
  try {
    const data = await fetchFromOpenDota<any[]>(`/teams/${teamId}/players`);
    return data.filter((p: any) => p.is_current_team_member);
  } catch (e) {
    console.error(e);
    return [];
  }
}

/**
 * Fetches matches for a team.
 */
export async function getTeamMatches(teamId: number): Promise<ProMatch[]> {
  try {
    return await fetchFromOpenDota<ProMatch[]>(`/teams/${teamId}/matches`);
  } catch (e) {
    console.error(e);
    return [];
  }
}

/**
 * Fetches matches for a league.
 */
export async function getLeagueMatches(leagueId: number): Promise<ProMatch[]> {
  try {
    return await fetchFromOpenDota<ProMatch[]>(`/leagues/${leagueId}/matches`);
  } catch (e) {
    console.error(e);
    return [];
  }
}

/**
 * Fetches recent professional matches.
 */
export async function getProMatches(limit: number = 10): Promise<ProMatch[]> {
  try {
    const data = await fetchFromOpenDota<ProMatch[]>(`/proMatches`);
    return data.slice(0, limit);
  } catch (error) {
    console.error('Error fetching pro matches:', error);
    return [];
  }
}
