import { useQuery } from '@tanstack/react-query';
import { 
  openDotaApi, 
  PlayerHero, 
  HeroStats, 
  OPENDOTA_BASE_URL 
} from '../services/opendota';

/**
 * Hook to fetch a player's profile data.
 */
export function usePlayerProfile(accountId: string | number | null) {
  return useQuery({
    queryKey: ['playerProfile', accountId],
    queryFn: () => (accountId ? openDotaApi.getPlayerProfile(accountId) : null),
    enabled: !!accountId,
  });
}

/**
 * Hook to fetch per-hero statistics for a player.
 */
export function usePlayerHeroes(accountId: string | number | null) {
  return useQuery({
    queryKey: ['playerHeroes', accountId],
    staleTime: 1000 * 60 * 30, // 30 minutes
    queryFn: async () => {
      if (!accountId) return [];

      const [heroes, matches] = await Promise.all([
        openDotaApi.getPlayerHeroes(accountId),
        // Fetch matches with projected fields and limit to 500 for KDA calculation
        fetch(`${OPENDOTA_BASE_URL}/players/${accountId}/matches?project=hero_id&project=kills&project=deaths&project=assists&limit=500`).then(res => res.json())
      ]);
      // Aggregate KDA per hero
      const matchStats: Record<number, { kills: number; deaths: number; assists: number; count: number }> = {};
      matches.forEach((m: any) => {
        if (!matchStats[m.hero_id]) {
          matchStats[m.hero_id] = { kills: 0, deaths: 0, assists: 0, count: 0 };
        }
        matchStats[m.hero_id].kills += m.kills || 0;
        matchStats[m.hero_id].deaths += m.deaths || 0;
        matchStats[m.hero_id].assists += m.assists || 0;
        matchStats[m.hero_id].count += 1;
      });

      // Combine and return
      return heroes.map(h => {
        const stats = matchStats[Number(h.hero_id)];
        return {
          ...h,
          avg_kills: stats ? stats.kills / stats.count : 0,
          avg_deaths: stats ? stats.deaths / stats.count : 0,
          avg_assists: stats ? stats.assists / stats.count : 0,
          kda: stats ? (stats.kills + stats.assists) / Math.max(1, stats.deaths) : 0
        };
      });
    },
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
    staleTime: 1000 * 60 * 60, // Peers don't change that fast, cache for 1 hour
  });
}

/**
 * Hook to check if a target player has been encountered by the current user.
 */
export function useEncounterHistory(currentUserId: string | null, targetId: string | number | null) {
  const { data: peers = [] } = usePlayerPeers(currentUserId);
  
  if (!currentUserId || !targetId) return null;
  
  const targetIdNum = typeof targetId === 'string' ? parseInt(targetId) : targetId;
  const peer = peers.find(p => p.account_id === targetIdNum);
  
  return peer || null;
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
    refetchIntervalInBackground: false,
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
 * Hook to fetch multiple global records in one go.
 */
export function useGlobalRecordsMulti(fields: string[]) {
  return useQuery({
    queryKey: ['globalRecordsMulti', ...fields],
    queryFn: async () => {
      const results = await Promise.all(
        fields.map(field => openDotaApi.getGlobalRecords(field))
      );
      // Map back to an object with fields as keys
      return fields.reduce((acc, field, index) => {
        acc[field] = results[index];
        return acc;
      }, {} as Record<string, any[]>);
    },
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
