import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Image,
  RefreshControl,
  TouchableOpacity,
  ScrollView,
  Dimensions
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import {
  PlayerProfile,
  WinLossStats,
  RecentMatch,
  PlayerTotal,
  getPlayerWinLoss,
  getPlayerTotals,
  getPlayerCounts,
  HeroStats
} from '../services/opendota';
import { getHeroImageUrl, HEROES, REGIONS } from '../services/constants';
import { RankBadge } from './RankBadge';
import PressableScale from './PressableScale';
import Skeleton, { PlayerProfileSkeleton } from './Skeleton';
import MeshGradient from './MeshGradient';
import GlassModal from './GlassModal';
import { useSteamAuth } from '../hooks/useSteamAuth';
import { 
  useEncounterHistory, 
  usePlayerHeroes, 
  usePlayerPeers,
  usePlayerProfile,
  usePlayerWinLoss,
  useRecentMatches,
  useHeroStats
} from '../hooks/useOpenDota';
import { useModals } from '../context/ModalContext';
import HeroDetailModal, { PlayerHeroStats } from './HeroDetailModal';

function LifetimeStatsSkeleton() {
  return (
    <View className="flex-1">
      {[1, 2, 3, 4, 5].map(i => (
        <View key={i} className="mx-4 mb-6 bg-[#1e1e1e] rounded-2xl overflow-hidden border border-white/5">
          <View className="flex-row items-center bg-zinc-800/50 p-4 border-b border-white/5">
            <Skeleton width={20} height={20} borderRadius={10} style={{ marginRight: 12 }} />
            <Skeleton width={100} height={14} borderRadius={4} />
          </View>
          <View className="p-4">
            {[1, 2].map(j => (
              <View key={j} className={`flex-row justify-between items-center ${j === 1 ? 'mb-4 pb-4 border-b border-white/5' : ''}`}>
                <View className="flex-1">
                  <Skeleton width="60%" height={16} borderRadius={4} style={{ marginBottom: 8 }} />
                  <Skeleton width="40%" height={12} borderRadius={4} />
                </View>
                <View className="items-end">
                  <Skeleton width={50} height={24} borderRadius={6} style={{ marginBottom: 4 }} />
                  <Skeleton width={30} height={10} borderRadius={2} />
                </View>
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

type ProfileTab = 'Recent' | 'Heroes' | 'Network' | 'Lifetime';

interface CategoryStats {
  label: string;
  win: number;
  lose: number;
  total: number;
}

interface PlayerOverviewContentProps {
  accountId: number | string;
  profile: PlayerProfile | null;
  wl: WinLossStats | null;
  matches: RecentMatch[];
  onMatchPress: (matchId: number) => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  isCurrentUser?: boolean;
  friendsCount?: number;
  followingCount?: number;
  onStatsPress?: () => void;
  isPrivate?: boolean;
  matchesLimit?: number;
  setMatchesLimit?: (limit: number) => void;
}

const MatchItem = React.memo(({ item, index, onMatchPress }: { item: RecentMatch, index: number, onMatchPress: (id: number) => void }) => {
  const isRadiant = item.player_slot < 128;
  const isWin = (isRadiant && item.radiant_win) || (!isRadiant && !item.radiant_win);
  const heroName = HEROES[item.hero_id]?.localized_name || `Hero ${item.hero_id}`;

  return (
    <PressableScale onPress={() => onMatchPress(item.match_id)}>
      <Animated.View
        entering={FadeInDown.delay(Math.min(index, 5) * 50).springify()}
        style={{
          marginHorizontal: 16,
          backgroundColor: '#1e1e2e',
          padding: 16,
          marginBottom: 12,
          borderRadius: 14,
          borderLeftWidth: 4,
          borderLeftColor: isWin ? '#22c55e' : '#ef4444',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.05)'
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <Image
            source={{ uri: getHeroImageUrl(item.hero_id) }}
            style={{ width: 48, height: 48, borderRadius: 8, marginRight: 12 }}
            resizeMode="cover"
          />
          <View style={{ flex: 1 }}>
            <Text style={{ color: isWin ? '#22c55e' : '#ef4444', fontFamily: 'Outfit_700Bold', fontSize: 18 }}>
              {isWin ? 'Victory' : 'Defeat'}
            </Text>
            <Text style={{ color: '#d1d5db', fontFamily: 'Outfit_600SemiBold', fontSize: 14 }}>{heroName}</Text>
            <Text style={{ color: '#6b7280', fontFamily: 'Outfit_400Regular', fontSize: 12 }}>KDA: {item.kills}/{item.deaths}/{item.assists}</Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 12 }}>
          <Text style={{ color: '#9ca3af', fontFamily: 'Outfit_600SemiBold', fontSize: 13, marginRight: 8 }}>
            {Math.floor(item.duration / 60)}:{String(item.duration % 60).padStart(2, '0')}
          </Text>
          <Ionicons name="chevron-forward" size={18} color="#4b5563" />
        </View>
      </Animated.View>
    </PressableScale>
  );
});

export function PlayerOverviewContent({
  accountId,
  profile,
  wl,
  matches,
  onMatchPress,
  onRefresh,
  refreshing = false,
  isCurrentUser = false,
  friendsCount = 0,
  followingCount = 0,
  onStatsPress,
  isPrivate = false,
  matchesLimit = 20,
  setMatchesLimit
}: PlayerOverviewContentProps) {
  const { accountId: currentUserId } = useSteamAuth();
  const peer = useEncounterHistory(currentUserId, accountId);
  const { data: playerHeroes = [], isLoading: heroesLoading } = usePlayerHeroes(accountId);
  const { data: peers = [], isLoading: peersLoading } = usePlayerPeers(accountId);
  const { data: allHeroStats = [] } = useHeroStats();
  const { pushModal } = useModals();
  const [activeTab, setActiveTab] = useState<ProfileTab>('Recent');
  const [networkSubTab, setNetworkSubTab] = useState<'Allies' | 'Opponents'>('Allies');

  // Hero Detail State
  const [selectedHero, setSelectedHero] = useState<HeroStats | null>(null);
  const [selectedPlayerHeroStats, setSelectedPlayerHeroStats] = useState<PlayerHeroStats | null>(null);
  const [heroModalVisible, setHeroModalVisible] = useState(false);

  // Lifetime Stats State
  const [totals, setTotals] = useState<PlayerTotal[]>([]);
  const [lobbyStats, setLobbyStats] = useState<CategoryStats[]>([]);
  const [modeStats, setModeStats] = useState<CategoryStats[]>([]);
  const [regionStats, setRegionStats] = useState<CategoryStats[]>([]);
  const [sideStats, setSideStats] = useState<CategoryStats[]>([]);
  const [statsLoading, setStatsLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'Lifetime' && totals.length === 0) {
      loadLifetimeData();
    }
  }, [activeTab, accountId]);

  const loadLifetimeData = async () => {
    try {
      setStatsLoading(true);
      const [totalsData, countsData] = await Promise.all([
        getPlayerTotals(accountId),
        getPlayerCounts(accountId)
      ]);
      setTotals(totalsData);

      // Parallel fetch for Lifetime categories
      const [normalWL, rankedWL, allPickWL, turboWL, radiantWL, direWL] = await Promise.all([
        getPlayerWinLoss(accountId, { lobby_type: '0' }),
        getPlayerWinLoss(accountId, { lobby_type: '7' }),
        getPlayerWinLoss(accountId, { game_mode: '1' }),
        getPlayerWinLoss(accountId, { game_mode: '23' }),
        getPlayerWinLoss(accountId, { is_radiant: '1' }),
        getPlayerWinLoss(accountId, { is_radiant: '0' }),
      ]);

      const createStat = (label: string, data: WinLossStats | null) => ({
        label,
        win: data?.win || 0,
        lose: data?.lose || 0,
        total: (data?.win || 0) + (data?.lose || 0)
      });

      setLobbyStats([
        createStat('Normal MM', normalWL),
        createStat('Ranked MM', rankedWL)
      ]);

      setModeStats([
        createStat('All Pick', allPickWL),
        createStat('Turbo', turboWL)
      ]);

      setSideStats([
        createStat('Radiant', radiantWL),
        createStat('Dire', direWL)
      ]);

      if (countsData?.region) {
        const sortedRegions = Object.entries(countsData.region)
          .map(([id, data]) => ({
            label: REGIONS[Number(id)] || `Region ${id}`,
            win: data.win,
            lose: data.games - data.win,
            total: data.games
          }))
          .sort((a, b) => b.total - a.total)
          .slice(0, 5);
        setRegionStats(sortedRegions);
      }

    } catch (e) {
      console.error(e);
    } finally {
      setStatsLoading(false);
    }
  };

  const memoizedHeader = useMemo(() => (
    <View className="mb-4">
      <MeshGradient
        intensity="low"
        colors={['#1e1e1e', '#1a1a2e', '#2d1b4e']}
        className="p-6 rounded-b-3xl shadow-lg border-b border-white/5 overflow-hidden"
      >
        <View className="flex-row items-center">
          {profile?.profile?.avatarfull ? (
            <Image source={{ uri: profile.profile.avatarfull }} className="w-20 h-20 rounded-full border-2 border-gamingAccent mr-4" />
          ) : (
            <View className="w-20 h-20 rounded-full bg-gray-600 mr-4" />
          )}
          <View className="flex-1">
            <Text className="text-2xl text-white font-outfit-bold" numberOfLines={1}>{profile?.profile?.personaname || 'Unknown Player'}</Text>
            <Text className="text-gray-400 font-outfit">Account ID: {accountId}</Text>

            {isCurrentUser && (
              <View className="flex-row mt-2">
                <TouchableOpacity
                  onPress={onStatsPress}
                  className="mr-3 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10"
                >
                  <Text className="text-white font-outfit-bold text-xs">
                    {friendsCount} <Text className="text-gray-400 font-outfit-semibold">Friends</Text>
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={onStatsPress}
                  className="bg-white/5 px-3 py-1.5 rounded-lg border border-white/10"
                >
                  <Text className="text-white font-outfit-bold text-xs">
                    {followingCount} <Text className="text-gray-400 font-outfit-semibold">Following</Text>
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
          <RankBadge rankTier={profile?.rank_tier || null} leaderboardRank={profile?.leaderboard_rank || null} size={60} />
        </View>
      </MeshGradient>

      <View className="mt-6 px-4">
        {isPrivate && (
          <View className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-xl mb-6 flex-row items-center">
            <View className="bg-orange-500/20 p-2 rounded-full mr-3">
              <Ionicons name="eye-off-outline" size={20} color="#f97316" />
            </View>
            <View className="flex-1">
              <Text className="text-orange-500 font-outfit-bold text-sm">Private Profile</Text>
              <Text className="text-gray-400 text-[10px] font-outfit">
                This user has not enabled "Expose Public Match Data" in their Dota 2 settings. Statistics may be incomplete or missing.
              </Text>
            </View>
          </View>
        )}

        {/* Profile Tabs */}
        <View className="flex-row bg-[#2a2a2a] rounded-xl p-1 mb-4">
          {(['Recent', 'Heroes', 'Network', 'Lifetime'] as ProfileTab[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 rounded-lg items-center ${activeTab === tab ? 'bg-gamingAccent shadow-md' : 'bg-transparent'}`}
            >
              <Text className={`font-outfit-bold text-[10px] ${activeTab === tab ? 'text-white' : 'text-gray-400'}`}>
                {tab === 'Recent' ? 'RECENT' : tab === 'Heroes' ? 'HEROES' : tab === 'Network' ? 'NETWORK' : 'LIFETIME'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {peer && !isCurrentUser && (
          <View className="bg-gamingAccent/10 border border-gamingAccent/20 p-4 rounded-xl mb-6">
            <View className="flex-row items-center mb-3">
              <View className="bg-gamingAccent/20 p-2 rounded-full mr-3">
                <Ionicons name="people" size={20} color="#8b5cf6" />
              </View>
              <View>
                <Text className="text-white font-outfit-bold text-sm">Your History</Text>
                <Text className="text-gray-400 text-[10px] uppercase font-outfit-bold">Shared Matches: {peer.games}</Text>
              </View>
            </View>

            <View className="flex-row justify-between">
              <View className="flex-1">
                <Text className="text-gray-500 text-[10px] uppercase font-outfit-black mb-1">As Ally</Text>
                <Text className="text-white font-outfit-bold">{peer.with_games} Games</Text>
                <Text className="text-win text-[10px] font-outfit-bold">{peer.with_win} Wins</Text>
              </View>
              <View className="flex-1 border-l border-white/5 pl-4">
                <Text className="text-gray-500 text-[10px] uppercase font-outfit-black mb-1">As Opponent</Text>
                <Text className="text-white font-outfit-bold">{peer.against_games} Games</Text>
                <Text className="text-loss text-[10px] font-outfit-bold">{peer.against_games - peer.against_win} Losses</Text>
              </View>
              <View className="flex-1 border-l border-white/5 pl-4">
                <Text className="text-gray-400 text-[10px] uppercase font-outfit-black mb-1">Last Played</Text>
                <Text className="text-white font-outfit-bold text-[11px] mt-1">
                  {new Date(peer.last_played * 1000).toLocaleDateString()}
                </Text>
              </View>
            </View>
          </View>
        )}

        {activeTab === 'Recent' && wl && (
          <View className="flex-row justify-between bg-[#2a2a2a] p-4 rounded-xl shadow-sm mb-6">
            <View className="items-center">
              <Text className="text-gray-400 text-xs uppercase tracking-widest font-outfit-bold">Wins</Text>
              <Text className="text-win text-xl font-outfit-bold">{wl.win}</Text>
            </View>
            <View className="items-center">
              <Text className="text-gray-400 text-xs uppercase tracking-widest font-outfit-bold">Losses</Text>
              <Text className="text-loss text-xl font-outfit-bold">{wl.lose}</Text>
            </View>
            <View className="items-center">
              <Text className="text-gray-400 text-xs uppercase tracking-widest font-outfit-bold">Win Rate</Text>
              <Text className="text-white text-xl font-outfit-bold">{wl.win + wl.lose > 0 ? ((wl.win / (wl.win + wl.lose)) * 100).toFixed(2) : '0.00'}%</Text>
            </View>
          </View>
        )}

        {activeTab === 'Lifetime' && totals.length > 0 && (
          <View className="flex-col bg-[#2a2a2a] p-4 rounded-xl shadow-sm mb-6">
            <View className="flex-row justify-between mb-4 pb-4 border-b border-white/5">
              <View className="items-center flex-1">
                <Text className="text-gray-400 text-[10px] uppercase tracking-widest font-outfit-black">Total Matches</Text>
                <Text className="text-white text-xl font-outfit-bold">{wl ? wl.win + wl.lose : 0}</Text>
              </View>
              <View className="items-center flex-1 border-x border-white/5">
                <Text className="text-gray-400 text-[10px] uppercase tracking-widest font-outfit-black">Win Rate</Text>
                <Text className={`text-xl font-outfit-bold ${wl && wl.win / (wl.win + wl.lose) >= 0.5 ? 'text-win' : 'text-loss'}`}>
                  {wl && wl.win + wl.lose > 0 ? ((wl.win / (wl.win + wl.lose)) * 100).toFixed(2) : '0.00'}%
                </Text>
              </View>
              <View className="items-center flex-1">
                <Text className="text-gray-400 text-[10px] uppercase tracking-widest font-outfit-black">K/D/A</Text>
                <Text className="text-white text-xl font-outfit-bold">
                  {(() => {
                    const k = totals.find(t => t.field === 'kills')?.sum || 0;
                    const d = totals.find(t => t.field === 'deaths')?.sum || 0;
                    const a = totals.find(t => t.field === 'assists')?.sum || 0;
                    const n = totals.find(t => t.field === 'kills')?.n || 1;
                    return `${(k / n).toFixed(1)}/${(d / n).toFixed(1)}/${(a / n).toFixed(1)}`;
                  })()}
                </Text>
              </View>
            </View>
            <View className="flex-row justify-around">
              <View className="items-center">
                <Text className="text-gray-400 text-[10px] uppercase tracking-widest font-outfit-black">Avg GPM</Text>
                <Text className="text-yellow-500 text-lg font-outfit-bold">
                  {Math.round((totals.find(t => t.field === 'gold_per_min')?.sum || 0) / (totals.find(t => t.field === 'gold_per_min')?.n || 1))}
                </Text>
              </View>
              <View className="items-center">
                <Text className="text-gray-400 text-[10px] uppercase tracking-widest font-outfit-black">Avg XPM</Text>
                <Text className="text-blue-500 text-lg font-outfit-bold">
                  {Math.round((totals.find(t => t.field === 'xp_per_min')?.sum || 0) / (totals.find(t => t.field === 'xp_per_min')?.n || 1))}
                </Text>
              </View>
              <View className="items-center">
                <Text className="text-gray-400 text-[10px] uppercase tracking-widest font-outfit-black">Impact</Text>
                <Text className="text-red-500 text-lg font-outfit-bold">
                  {Math.round((totals.find(t => t.field === 'hero_damage')?.sum || 0) / (totals.find(t => t.field === 'hero_damage')?.n || 1)).toLocaleString()}
                </Text>
              </View>
            </View>
          </View>
        )}
      </View>
    </View>
  ), [profile, accountId, isCurrentUser, onStatsPress, friendsCount, followingCount, isPrivate, activeTab, peer, wl, totals]);

  const renderStatSection = (title: string, icon: string, stats: CategoryStats[]) => (
    <Animated.View
      key={title}
      entering={FadeInDown.delay(200).springify()}
      style={{ marginHorizontal: 16 }}
      className="mb-6 bg-[#1e1e1e] rounded-2xl overflow-hidden border border-white/5"
    >
      <View className="flex-row items-center bg-zinc-800/50 p-4 border-b border-white/5">
        <Ionicons name={icon as any} size={20} color="#8b5cf6" />
        <Text className="text-white font-outfit-bold ml-3 uppercase tracking-widest text-xs">{title}</Text>
      </View>
      <View className="p-4">
        {stats.map((stat, i) => (
          <View key={i} className={`flex-row justify-between items-center ${i !== stats.length - 1 ? 'mb-4 pb-4 border-b border-white/5' : ''}`}>
            <View>
              <Text className="text-white font-outfit-semibold">{stat.label}</Text>
              <Text className="text-gray-500 text-xs font-outfit mt-1">{stat.total} Matches • {stat.win}W - {stat.lose}L</Text>
            </View>
            <View className="items-end">
              <Text className={`text-lg font-outfit-bold ${stat.win / stat.total >= 0.5 ? 'text-win' : 'text-loss'}`}>
                {stat.total > 0 ? ((stat.win / stat.total) * 100).toFixed(2) : '0.00'}%
              </Text>
              <Text className="text-gray-600 text-[10px] uppercase font-outfit-bold">Win Rate</Text>
            </View>
          </View>
        ))}
      </View>
    </Animated.View>
  );

  const renderNetworkContent = () => {
    const sortedPeers = [...peers]
      .filter(p => networkSubTab === 'Allies' ? p.with_games > 0 : p.against_games > 0)
      .sort((a, b) => networkSubTab === 'Allies' 
        ? b.with_games - a.with_games 
        : b.against_games - a.against_games
      );

    const duo = [...peers].sort((a, b) => b.with_games - a.with_games)[0];
    const nemesis = [...peers]
      .filter(p => p.against_games >= 3)
      .sort((a, b) => (a.against_win / a.against_games) - (b.against_win / b.against_games))[0];

    return (
      <FlatList
        data={sortedPeers.slice(0, 50)}
        keyExtractor={(item) => item.account_id.toString()}
        ListHeaderComponent={
          <>
            {memoizedHeader}
            
            {/* Highlights */}
            <View className="flex-row px-4 mb-6">
              {duo && duo.with_games > 1 && (
                <View className="flex-1 bg-win/10 border border-win/20 p-3 rounded-xl mr-2">
                  <Text className="text-win text-[10px] font-outfit-black uppercase mb-2">Dynamic Duo</Text>
                  <View className="flex-row items-center">
                    <Image source={{ uri: duo.avatar }} className="w-8 h-8 rounded-full mr-2" />
                    <View className="flex-1">
                      <Text className="text-white font-outfit-bold text-xs" numberOfLines={1}>{duo.personaname}</Text>
                      <Text className="text-gray-400 text-[10px]">{duo.with_games} Games</Text>
                    </View>
                  </View>
                </View>
              )}
              {nemesis && nemesis.against_games >= 3 && (
                <View className="flex-1 bg-loss/10 border border-loss/20 p-3 rounded-xl ml-2">
                  <Text className="text-loss text-[10px] font-outfit-black uppercase mb-2">Nemesis</Text>
                  <View className="flex-row items-center">
                    <Image source={{ uri: nemesis.avatar }} className="w-8 h-8 rounded-full mr-2" />
                    <View className="flex-1">
                      <Text className="text-white font-outfit-bold text-xs" numberOfLines={1}>{nemesis.personaname}</Text>
                      <Text className="text-gray-400 text-[10px]">{nemesis.against_games} Games</Text>
                    </View>
                  </View>
                </View>
              )}
            </View>

            {/* Sub Tabs */}
            <View className="flex-row px-4 mb-4 border-b border-white/5">
              {(['Allies', 'Opponents'] as const).map((sub) => (
                <TouchableOpacity
                  key={sub}
                  onPress={() => setNetworkSubTab(sub)}
                  className={`mr-6 pb-2 border-b-2 ${networkSubTab === sub ? 'border-gamingAccent' : 'border-transparent'}`}
                >
                  <Text className={`font-outfit-bold text-[10px] ${networkSubTab === sub ? 'text-white' : 'text-gray-500'}`}>
                    {sub.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        }
        renderItem={({ item }) => {
          const games = networkSubTab === 'Allies' ? item.with_games : item.against_games;
          const wins = networkSubTab === 'Allies' ? item.with_win : (item.against_games - item.against_win);
          const winRate = (wins / games) * 100;

          return (
            <TouchableOpacity
              onPress={() => pushModal('player', item.account_id)}
              className="mx-4 mb-3 bg-[#1e1e2e] p-4 rounded-xl border border-white/5 flex-row items-center"
            >
              <Image source={{ uri: item.avatarfull || item.avatar }} className="w-12 h-12 rounded-full mr-4 bg-zinc-900" />
              <View className="flex-1">
                <Text className="text-white font-outfit-bold text-base">{item.personaname}</Text>
                <Text className="text-gray-500 text-xs font-outfit">
                  {games} {networkSubTab === 'Allies' ? 'Matches with' : 'Matches against'}
                </Text>
              </View>
              <View className="items-end">
                <Text className={`font-outfit-bold text-lg ${winRate >= 50 ? 'text-win' : 'text-loss'}`}>
                  {winRate.toFixed(0)}%
                </Text>
                <Text className="text-gray-600 text-[8px] uppercase font-outfit-bold">Win Rate</Text>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          peersLoading ? (
            <View className="py-20 items-center"><ActivityIndicator color="#8b5cf6" /></View>
          ) : (
            <View className="py-20 items-center px-10">
              <Ionicons name="people-outline" size={48} color="#3f3f46" />
              <Text className="text-gray-500 font-outfit text-center mt-4">No network data found for this player.</Text>
            </View>
          )
        }
        ListFooterComponent={<View style={{ height: 40 }} />}
        refreshControl={onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8b5cf6" /> : undefined}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    );
  };

  const renderLifetimeContent = () => (
    <ScrollView
      refreshControl={onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8b5cf6" /> : undefined}
      className="flex-1"
    >
      {memoizedHeader}
      {statsLoading ? (
        <LifetimeStatsSkeleton />
      ) : (
        <>
          {renderStatSection('Lobby Type', 'globe-outline', lobbyStats)}
          {renderStatSection('Game Mode', 'game-controller-outline', modeStats)}
          {renderStatSection('Region', 'navigate-outline', regionStats)}
          {renderStatSection('Side of Map', 'map-outline', sideStats)}
          <View className="h-10" />
        </>
      )}
    </ScrollView>
  );

  const renderMatch = ({ item, index }: { item: RecentMatch, index: number }) => (
    <MatchItem 
      item={item} 
      index={index} 
      onMatchPress={onMatchPress} 
    />
  );

  const renderHeroRow = ({ item, index }: { item: any, index: number }) => {
    const heroInfo = HEROES[Number(item.hero_id)];
    const winRate = (item.win / item.games) * 100;

    return (
      <TouchableOpacity
        onPress={() => {
          const heroStats = allHeroStats.find(
            (h) => h.id === Number(item.hero_id)
          ) || null;

          setSelectedHero(heroStats);
          setSelectedPlayerHeroStats(item);
          setHeroModalVisible(true);
        }}
        className="mx-4 mb-3 bg-[#1e1e2e] p-4 rounded-xl border border-white/5 flex-row items-center"
      >
        <Image
          source={{ uri: getHeroImageUrl(Number(item.hero_id)) }}
          className="w-14 h-14 rounded-lg mr-4 bg-zinc-900"
          resizeMode="cover"
        />
        <View className="flex-1">
          <View className="flex-row justify-between items-center mb-1">
            <Text className="text-white font-outfit-bold text-lg">{heroInfo?.localized_name || 'Hero'}</Text>
            <Text className="text-gray-400 font-outfit-bold text-xs uppercase">{item.games} Games</Text>
          </View>

          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-gray-500 text-[10px] uppercase font-outfit-black mb-0.5">Performance</Text>
              <Text className="text-gamingAccent font-outfit-bold text-sm">
                {item.kda.toFixed(2)} <Text className="text-gray-500 text-[10px] font-outfit">KDA</Text>
              </Text>
              <Text className="text-gray-400 text-[10px] font-outfit">
                {item.avg_kills.toFixed(1)} / {item.avg_deaths.toFixed(1)} / {item.avg_assists.toFixed(1)}
              </Text>
            </View>

            <View className="items-end">
              <Text className="text-gray-500 text-[10px] uppercase font-outfit-black mb-0.5">Win Rate</Text>
              <Text className={`font-outfit-bold text-lg ${winRate >= 55 ? 'text-win' : winRate < 45 ? 'text-loss' : 'text-white'}`}>
                {winRate.toFixed(1)}%
              </Text>
              <View className="w-16 h-1 bg-zinc-800 rounded-full mt-1 overflow-hidden">
                <View style={{ width: `${winRate}%` }} className={`h-full ${winRate >= 55 ? 'bg-win' : winRate < 45 ? 'bg-loss' : 'bg-gray-500'}`} />
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1">
      {activeTab === 'Recent' ? (
        <FlatList
          data={matches}
          keyExtractor={(item) => item.match_id.toString()}
          renderItem={renderMatch}
          ListHeaderComponent={memoizedHeader}
          ListFooterComponent={
            <View style={{ paddingBottom: 60, alignItems: 'center' }}>
              {setMatchesLimit && matches.length >= matchesLimit && (
                <TouchableOpacity 
                  onPress={() => setMatchesLimit(matchesLimit + 20)}
                  style={{ 
                    backgroundColor: '#1e1e2e', 
                    paddingVertical: 12, 
                    paddingHorizontal: 24, 
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: '#8b5cf633',
                    marginTop: 8
                  }}
                >
                  <Text style={{ color: '#8b5cf6', fontFamily: 'Outfit_700Bold' }}>Load More Matches</Text>
                </TouchableOpacity>
              )}
            </View>
          }
          refreshControl={onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8b5cf6" /> : undefined}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      ) : activeTab === 'Heroes' ? (
        <FlatList
          data={playerHeroes.sort((a, b) => b.games - a.games).slice(0, 50)}
          keyExtractor={(item) => item.hero_id}
          renderItem={renderHeroRow}
          ListHeaderComponent={memoizedHeader}
          ListEmptyComponent={
            heroesLoading ? (
              <View className="py-20 items-center"><ActivityIndicator color="#8b5cf6" /></View>
            ) : null
          }
          ListFooterComponent={<View style={{ height: 40 }} />}
          refreshControl={onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8b5cf6" /> : undefined}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      ) : activeTab === 'Network' ? (
        renderNetworkContent()
      ) : (
        renderLifetimeContent()
      )}

      <HeroDetailModal
        visible={heroModalVisible}
        hero={selectedHero}
        playerStats={selectedPlayerHeroStats}
        onClose={() => {
          setHeroModalVisible(false);
          setSelectedHero(null);
          setSelectedPlayerHeroStats(null);
        }}
      />
    </View>
  );
}
