import { useQuery } from '@tanstack/react-query';
import { useFriends } from './useFriends';
import { openDotaApi, ActivityItem as ActivityItemType } from '../services/opendota';
import { useMemo } from 'react';

export interface ActivityItem {
  id: string;
  type: 'win_streak' | 'mvp' | 'rank_up' | 'recent_match';
  timestamp: number;
  player: {
    account_id: number;
    name: string;
    avatar: string;
  };
  details: {
    streakCount?: number;
    heroId?: number;
    kda?: string;
    gpm?: number;
    matchId?: number;
    newRank?: number;
    win?: boolean;
  };
}

export const useActivityFeed = () => {
  const { following, friends, loading: friendsLoading } = useFriends();

  // Combine friends and following to get a list of Steam IDs to check
  const playerIds = useMemo(() => {
    const ids = new Set<string>();
    
    // Add followed Steam IDs
    following.forEach(f => ids.add(f.followed_steam_id.toString()));
    
    // Add friends' Steam IDs
    friends.forEach(f => {
      if (f.users?.steam_account_id) {
        ids.add(f.users.steam_account_id.toString());
      }
    });

    return Array.from(ids).slice(0, 15); // Increased to 15
  }, [following, friends]);

  const { data: activities = [], isLoading, refetch } = useQuery({
    queryKey: ['activityFeed', playerIds],
    queryFn: async () => {
      if (playerIds.length === 0) return [];

      const activityList: ActivityItem[] = [];

      // Fetch profiles and recent matches for each player
      const results = await Promise.allSettled(
        playerIds.map(async (id) => {
          const [profile, matches] = await Promise.all([
            openDotaApi.getPlayerProfile(id),
            openDotaApi.getRecentMatches(id, 10) // Check last 10 for streaks
          ]);
          return { id, profile, matches };
        })
      );

      results.forEach((result) => {
        if (result.status === 'fulfilled' && result.value.profile && result.value.matches) {
          const { profile, matches } = result.value;
          const playerName = profile.profile.personaname;
          const playerAvatar = profile.profile.avatarfull;
          const accountId = profile.profile.account_id;
          const rankTier = profile.rank_tier;

          if (!matches || matches.length === 0) return;

          let playerHasActivity = false;

          // 1. Detect Win Streaks (last 10 matches)
          let currentStreak = 0;
          for (const match of matches) {
            const isWin = (match.player_slot < 128) === match.radiant_win;
            if (isWin) {
              currentStreak++;
            } else {
              break;
            }
          }

          if (currentStreak >= 3) {
            activityList.push({
              id: `streak-${accountId}-${matches[0].match_id}`,
              type: 'win_streak',
              timestamp: matches[0].start_time,
              player: { account_id: accountId, name: playerName, avatar: playerAvatar },
              details: { 
                streakCount: currentStreak,
                matchId: matches[0].match_id,
                heroId: matches[0].hero_id
              }
            });
            playerHasActivity = true;
          }

          // 2. Detect MVP Performances (Lowered thresholds)
          const latestMatch = matches[0];
          const kda = (latestMatch.kills + latestMatch.assists) / Math.max(1, latestMatch.deaths);
          const isHighKda = kda >= 6;
          const isHighGpm = latestMatch.gold_per_min >= 650;

          if (isHighKda || isHighGpm) {
            activityList.push({
              id: `mvp-${accountId}-${latestMatch.match_id}`,
              type: 'mvp',
              timestamp: latestMatch.start_time,
              player: { account_id: accountId, name: playerName, avatar: playerAvatar },
              details: {
                heroId: latestMatch.hero_id,
                kda: kda.toFixed(1),
                gpm: latestMatch.gold_per_min,
                matchId: latestMatch.match_id
              }
            });
            playerHasActivity = true;
          }

          // 3. High Rank Milestone
          if (rankTier && rankTier >= 61) { // Ancient 1 or higher
             activityList.push({
               id: `rank-${accountId}`,
               type: 'rank_up', // Using rank_up type for high rank display
               timestamp: profile.last_match_time ? new Date(profile.last_match_time).getTime() / 1000 : latestMatch.start_time,
               player: { account_id: accountId, name: playerName, avatar: playerAvatar },
               details: {
                 newRank: rankTier
               }
             });
             playerHasActivity = true;
          }

          // 4. Fallback: Recent Match (if no other activity and played in last 24h)
          const oneDayAgo = (Date.now() / 1000) - (24 * 60 * 60);
          if (!playerHasActivity && latestMatch && latestMatch.start_time > oneDayAgo) {
            activityList.push({
              id: `recent-${accountId}-${latestMatch.match_id}`,
              type: 'recent_match',
              timestamp: latestMatch.start_time,
              player: { account_id: accountId, name: playerName, avatar: playerAvatar },
              details: {
                heroId: latestMatch.hero_id,
                matchId: latestMatch.match_id,
                win: (latestMatch.player_slot < 128) === latestMatch.radiant_win
              }
            });
          }
        }
      });

      // Sort by timestamp descending
      return activityList.sort((a, b) => b.timestamp - a.timestamp);
    },
    enabled: playerIds.length > 0 && !friendsLoading,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    activities,
    isLoading: isLoading || friendsLoading,
    refetch
  };
};
