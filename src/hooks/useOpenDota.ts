import { useMemo } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
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
    queryKey: ['playerHeroesV2', accountId],
    staleTime: 1000 * 60 * 30, // 30 minutes
    queryFn: async () => {
      if (!accountId) return [];

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const [heroes, matches] = await Promise.all([
        openDotaApi.getPlayerHeroes(accountId),
        // Fetch matches with projected fields and limit to 100 for KDA calculation
        fetch(`${OPENDOTA_BASE_URL}/players/${accountId}/matches?project=hero_id&project=kills&project=deaths&project=assists&limit=100`, {
          signal: controller.signal
        }).then(res => {
          clearTimeout(timeoutId);
          if (!res.ok) return [];
          return res.json();
        }).catch(() => {
          clearTimeout(timeoutId);
          return [];
        })
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
export function useRecentMatches(accountId: string | number | null, limit: number = 20) {
  return useQuery({
    queryKey: ['recentMatches', accountId, limit],
    queryFn: () => (accountId ? openDotaApi.getRecentMatches(accountId, limit) : []),
    enabled: !!accountId,
    placeholderData: keepPreviousData,
  });
}

/**
 * Hook to fetch players who have played in the same matches.
 */
export function usePlayerPeers(accountId: string | number | null) {
  return useQuery({
    queryKey: ['playerPeersV2', accountId],
    queryFn: () => (accountId ? openDotaApi.getPlayerPeers(accountId) : []),
    enabled: !!accountId,
    staleTime: 1000 * 60 * 60, // Peers don't change that fast, cache for 1 hour
  });
}

/**
 * Hook to fetch pinpoint accurate encounter history between two players.
 */
export function useEncounterHistory(accountId: string | number | null, targetId: string | number | null) {
  return useQuery({
    queryKey: ['encounterHistory', accountId, targetId],
    queryFn: () => (accountId && targetId) ? openDotaApi.getSharedStats(accountId, targetId) : null,
    enabled: !!accountId && !!targetId && accountId !== targetId,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook to fetch hero matchups.
 */
export function useHeroMatchups(heroId: number | null) {
  return useQuery({
    queryKey: ['heroMatchups', heroId],
    queryFn: () => (heroId ? openDotaApi.getHeroMatchups(heroId) : []),
    enabled: !!heroId,
    staleTime: 1000 * 60 * 60 * 24,
  });
}

/**
 * Hook to fetch hero durations (win rate over game length).
 */
export function useHeroDurations(heroId: number | null) {
  return useQuery({
    queryKey: ['heroDurations', heroId],
    queryFn: () => (heroId ? openDotaApi.getHeroDurations(heroId) : []),
    enabled: !!heroId,
    staleTime: 1000 * 60 * 60 * 24,
  });
}

/**
 * Hook to fetch hero item popularity.
 */
export function useHeroItemPopularity(heroId: number | null) {
  return useQuery({
    queryKey: ['heroItemPopularity', heroId],
    queryFn: () => (heroId ? openDotaApi.getHeroItemPopularity(heroId) : null),
    enabled: !!heroId,
    staleTime: 1000 * 60 * 60 * 24,
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

/**
 * Hook to fetch player totals.
 */
export function usePlayerTotals(accountId: string | number | null) {
  return useQuery({
    queryKey: ['playerTotals', accountId],
    queryFn: () => (accountId ? openDotaApi.getPlayerTotals(accountId) : []),
    enabled: !!accountId,
  });
}

/**
 * Hook to fetch player counts.
 */
export function usePlayerCounts(accountId: string | number | null) {
  return useQuery({
    queryKey: ['playerCounts', accountId],
    queryFn: () => (accountId ? openDotaApi.getPlayerCounts(accountId) : null),
    enabled: !!accountId,
  });
}

/**
 * Hook to fetch filtered player matches.
 */
export function usePlayerMatches(accountId: string | number | null, filters: any = {}) {
  return useQuery({
    queryKey: ['playerMatches', accountId, filters],
    queryFn: () => (accountId ? openDotaApi.getPlayerMatches(accountId, filters) : []),
    enabled: !!accountId,
  });
}

/**
 * Hook to fetch player word cloud data.
 */
export function usePlayerWordCloud(accountId: string | number | null) {
  return useQuery({
    queryKey: ['playerWordCloud', accountId],
    queryFn: () => (accountId ? openDotaApi.getPlayerWordCloud(accountId) : null),
    enabled: !!accountId,
    staleTime: 1000 * 60 * 60 * 24, // Chat stats change slowly
  });
}

/**
 * Hook to fetch player ward map data.
 */
export function usePlayerWardMap(accountId: string | number | null) {
  return useQuery({
    queryKey: ['playerWardMap', accountId],
    queryFn: () => (accountId ? openDotaApi.getPlayerWardMap(accountId) : null),
    enabled: !!accountId,
    staleTime: 1000 * 60 * 60 * 24,
  });
}

/**
 * Hook to fetch player MMR history.
 */
export function usePlayerRatings(accountId: string | number | null) {
  return useQuery({
    queryKey: ['playerRatings', accountId],
    queryFn: () => (accountId ? openDotaApi.getPlayerRatings(accountId) : []),
    enabled: !!accountId,
    staleTime: 1000 * 60 * 60 * 24,
  });
}

/**
 * Hook to fetch hero matchups.

 */
export function useScenariosItemTimings(item?: string, hero_id?: number) {
  return useQuery({
    queryKey: ['scenariosItemTimings', item, hero_id],
    queryFn: () => openDotaApi.getScenariosItemTimings({ item, hero_id }),
    staleTime: 1000 * 60 * 60 * 24, // Scenarios don't change fast
  });
}

/**
 * Hook to fetch lane role scenarios.
 */
export function useScenariosLaneRoles(lane_role?: number, hero_id?: number) {
  return useQuery({
    queryKey: ['scenariosLaneRoles', lane_role, hero_id],
    queryFn: () => openDotaApi.getScenariosLaneRoles({ lane_role, hero_id }),
    staleTime: 1000 * 60 * 60 * 24, // Scenarios don't change fast
  });
}

/**
 * Hook to fetch miscellaneous scenarios for "Fun Facts".
 */
export function useScenarioFunFacts(scenarios: string[]) {
  return useQuery({
    queryKey: ['scenarioFunFacts', scenarios],
    queryFn: async () => {
      const results = await Promise.all(
        scenarios.map(scenario => openDotaApi.getScenariosMisc({ scenario }))
      );
      
      const processedData: Record<string, { winRate: number; games: number }> = {};
      
      results.forEach((data, index) => {
        const scenarioName = scenarios[index];
        let totalWins = 0;
        let totalGames = 0;
        
        data.forEach(s => {
          totalWins += Number(s.wins || 0);
          totalGames += Number(s.games || 0);
        });
        
        if (totalGames > 0) {
          processedData[scenarioName] = {
            winRate: (totalWins / totalGames) * 100,
            games: totalGames
          };
        }
      });
      
      return processedData;
    },
    staleTime: 1000 * 60 * 60 * 24,
  });
}
