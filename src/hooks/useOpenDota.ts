import { useQuery } from '@tanstack/react-query';
import * as openDotaApi from '../services/opendota';

/**
 * Hook to fetch a player's profile and core stats.
 */
export function usePlayerProfile(accountId: string | number | null) {
  return useQuery({
    queryKey: ['playerProfile', accountId],
    queryFn: () => (accountId ? openDotaApi.getPlayerProfile(accountId) : null),
    enabled: !!accountId,
  });
}

/**
 * Hook to fetch player's win/loss record.
 */
export function usePlayerWinLoss(accountId: string | number | null) {
  return useQuery({
    queryKey: ['playerWinLoss', accountId],
    queryFn: () => (accountId ? openDotaApi.getPlayerWinLoss(accountId) : null),
    enabled: !!accountId,
  });
}

/**
 * Hook to fetch recent matches for a player.
 */
export function useRecentMatches(accountId: string | number | null, limit: number = 10) {
  return useQuery({
    queryKey: ['recentMatches', accountId, limit],
    queryFn: () => (accountId ? openDotaApi.getRecentMatches(accountId, limit) : []),
    enabled: !!accountId,
  });
}

/**
 * Hook to fetch players who have played in the same matches.
 */
export function usePlayerPeers(accountId: string | number | null) {
  return useQuery({
    queryKey: ['playerPeers', accountId],
    queryFn: () => (accountId ? openDotaApi.getPlayerPeers(accountId) : []),
    enabled: !!accountId,
  });
}

/**
 * Hook to fetch global hero statistics.
 */
export function useHeroStats() {
  return useQuery({
    queryKey: ['heroStats'],
    queryFn: openDotaApi.getHeroStats,
    staleTime: 1000 * 60 * 60, // Hero stats change slowly, cache for 1 hour
  });
}

/**
 * Hook to fetch professional matches.
 */
export function useProMatches(limit: number = 20) {
  return useQuery({
    queryKey: ['proMatches', limit],
    queryFn: () => openDotaApi.getProMatches(limit),
  });
}

/**
 * Hook to fetch live high-MMR games.
 */
export function useLiveGames() {
  return useQuery({
    queryKey: ['liveGames'],
    queryFn: openDotaApi.getLiveGames,
    refetchInterval: 1000 * 60, // Refresh every minute
  });
}

/**
 * Hook to search for players.
 */
export function useSearchPlayers(query: string) {
  return useQuery({
    queryKey: ['searchPlayers', query],
    queryFn: () => openDotaApi.searchPlayers(query),
    enabled: query.trim().length >= 3,
  });
}

/**
 * Hook to fetch pro players.
 */
export function useProPlayers() {
  return useQuery({
    queryKey: ['proPlayers'],
    queryFn: openDotaApi.getProPlayers,
    staleTime: 1000 * 60 * 60 * 24, // Cache for a day
  });
}

/**
 * Hook to fetch pro teams.
 */
export function useProTeams() {
  return useQuery({
    queryKey: ['proTeams'],
    queryFn: openDotaApi.getProTeams,
    staleTime: 1000 * 60 * 60 * 24, // Cache for a day
  });
}

/**
 * Hook to fetch leagues.
 */
export function useLeagues() {
  return useQuery({
    queryKey: ['leagues'],
    queryFn: openDotaApi.getLeagues,
    staleTime: 1000 * 60 * 60 * 24, // Cache for a day
  });
}

/**
 * Hook to fetch roster for a team.
 */
export function useTeamRoster(teamId: number | null) {
  return useQuery({
    queryKey: ['teamRoster', teamId],
    queryFn: () => (teamId ? openDotaApi.getTeamRoster(teamId) : []),
    enabled: !!teamId,
  });
}

/**
 * Hook to fetch matches for a league.
 */
export function useLeagueMatches(leagueId: number | null) {
  return useQuery({
    queryKey: ['leagueMatches', leagueId],
    queryFn: () => (leagueId ? openDotaApi.getLeagueMatches(leagueId) : []),
    enabled: !!leagueId,
  });
}

/**
 * Hook to fetch matches for a team.
 */
export function useTeamMatches(teamId: number | null) {
  return useQuery({
    queryKey: ['teamMatches', teamId],
    queryFn: () => (teamId ? openDotaApi.getTeamMatches(teamId) : []),
    enabled: !!teamId,
  });
}

/**
 * Hook to fetch global records for a specific field.
 */
export function useGlobalRecords(field: string) {
  return useQuery({
    queryKey: ['globalRecords', field],
    queryFn: () => openDotaApi.getGlobalRecords(field),
    staleTime: 1000 * 60 * 60 * 24, // Records don't change often
  });
}

/**
 * Hook to fetch match details.
 */
export function useMatchDetails(matchId: number | null) {
  return useQuery({
    queryKey: ['matchDetails', matchId],
    queryFn: () => (matchId ? openDotaApi.getMatchDetails(matchId) : null),
    enabled: !!matchId,
  });
}
