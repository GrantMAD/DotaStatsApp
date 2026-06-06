import { fetchFromOpenDota } from './apiUtils';
import { ProPlayer, ProTeam, League, ProMatch } from './types';

/**
 * Fetches professional players.
 */
export async function getProPlayers(): Promise<ProPlayer[]> {
  const data = await fetchFromOpenDota<ProPlayer[]>(`/proPlayers`);
  // Deduplicate by account_id
  return Array.from(new Map(data.map((p: any) => [p.account_id, p])).values()) as ProPlayer[];
}

/**
 * Fetches professional teams.
 */
export async function getProTeams(): Promise<ProTeam[]> {
  const data = await fetchFromOpenDota<ProTeam[]>(`/teams`);
  // Deduplicate by team_id
  const uniqueTeams = Array.from(new Map(data.map((t: any) => [t.team_id, t])).values()) as ProTeam[];
  // Sort by rating and slice
  return uniqueTeams.sort((a: any, b: any) => b.rating - a.rating).slice(0, 500);
}

/**
 * Fetches professional leagues.
 */
export async function getLeagues(): Promise<League[]> {
  const data = await fetchFromOpenDota<League[]>(`/leagues`);
  // Deduplicate by leagueid
  return Array.from(new Map(data.map((l: any) => [l.leagueid, l])).values()) as League[];
}

/**
 * Fetches current roster for a team.
 */
export async function getTeamRoster(teamId: number): Promise<ProPlayer[]> {
  const data = await fetchFromOpenDota<any[]>(`/teams/${teamId}/players`);
  return data.filter((p: any) => p.is_current_team_member);
}

/**
 * Fetches matches for a team.
 */
export async function getTeamMatches(teamId: number): Promise<ProMatch[]> {
  return await fetchFromOpenDota<ProMatch[]>(`/teams/${teamId}/matches`);
}

/**
 * Fetches matches for a league.
 */
export async function getLeagueMatches(leagueId: number): Promise<ProMatch[]> {
  return await fetchFromOpenDota<ProMatch[]>(`/leagues/${leagueId}/matches`);
}

/**
 * Fetches recent professional matches.
 */
export async function getProMatches(limit: number = 10): Promise<ProMatch[]> {
  const data = await fetchFromOpenDota<ProMatch[]>(`/proMatches`);
  return data.slice(0, limit);
}
