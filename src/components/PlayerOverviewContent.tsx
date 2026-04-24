import React, { useState, useEffect } from 'react';
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
  getPlayerCounts
} from '../services/opendota';
import { getHeroImageUrl, HEROES, REGIONS } from '../services/constants';
import { RankBadge } from './RankBadge';
import PressableScale from './PressableScale';
import Skeleton from './Skeleton';
import MeshGradient from './MeshGradient';
import { useSteamAuth } from '../hooks/useSteamAuth';
import { useEncounterHistory, usePlayerHeroes } from '../hooks/useOpenDota';
import HeroDetailModal from './HeroDetailModal';

function LifetimeStatsSkeleton() {
  return (
    <View className="flex-1">
      {[1, 2, 3].map(i => (
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

type ProfileTab = 'Recent' | 'Heroes' | 'Lifetime';

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
}

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
  onStatsPress
}: PlayerOverviewContentProps) {
  const { accountId: currentUserId } = useSteamAuth();
  const peer = useEncounterHistory(currentUserId, accountId);
  const { data: playerHeroes = [], isLoading: heroesLoading } = usePlayerHeroes(accountId);
  const [activeTab, setActiveTab] = useState<ProfileTab>('Recent');
  
  // Hero Detail State
  const [selectedHeroId, setSelectedHeroId] = useState<number | null>(null);
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

  const renderHeader = () => (
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
        {/* Profile Tabs */}
        <View className="flex-row bg-[#2a2a2a] rounded-xl p-1 mb-4">
          {(['Recent', 'Heroes', 'Lifetime'] as ProfileTab[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 rounded-lg items-center ${activeTab === tab ? 'bg-gamingAccent shadow-md' : 'bg-transparent'}`}
            >
              <Text className={`font-outfit-bold text-[10px] ${activeTab === tab ? 'text-white' : 'text-gray-400'}`}>
                {tab === 'Recent' ? 'RECENT' : tab === 'Heroes' ? 'HEROES' : 'LIFETIME'}
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
                    return `${(k/n).toFixed(1)}/${(d/n).toFixed(1)}/${(a/n).toFixed(1)}`;
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
  );

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

  const renderLifetimeContent = () => (
    <ScrollView 
      refreshControl={onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8b5cf6" /> : undefined}
      className="flex-1"
    >
      {renderHeader()}
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

  const renderMatch = ({ item, index }: { item: RecentMatch, index: number }) => {
    const isRadiant = item.player_slot < 128;
    const isWin = (isRadiant && item.radiant_win) || (!isRadiant && !item.radiant_win);
    const heroName = HEROES[item.hero_id]?.localized_name || `Hero ${item.hero_id}`;
    
    return (
      <PressableScale onPress={() => onMatchPress(item.match_id)}>
        <Animated.View 
          entering={FadeInDown.delay(index * 100).springify()}
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
  };

  const renderHeroRow = ({ item, index }: { item: any, index: number }) => {
    const heroInfo = HEROES[Number(item.hero_id)];
    const winRate = (item.win / item.games) * 100;
    
    return (
      <TouchableOpacity 
        onPress={() => {
          setSelectedHeroId(Number(item.hero_id));
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
          ListHeaderComponent={renderHeader()}
          ListFooterComponent={<View style={{ height: 40 }} />}
          refreshControl={onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8b5cf6" /> : undefined}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      ) : activeTab === 'Heroes' ? (
        <FlatList
          data={playerHeroes.sort((a, b) => b.games - a.games).slice(0, 50)}
          keyExtractor={(item) => item.hero_id}
          renderItem={renderHeroRow}
          ListHeaderComponent={renderHeader()}
          ListEmptyComponent={
            heroesLoading ? (
              <View className="py-20 items-center"><ActivityIndicator color="#8b5cf6" /></View>
            ) : null
          }
          ListFooterComponent={<View style={{ height: 40 }} />}
          refreshControl={onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8b5cf6" /> : undefined}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      ) : (
        renderLifetimeContent()
      )}

      <HeroDetailModal
        visible={heroModalVisible}
        heroId={selectedHeroId}
        onClose={() => setHeroModalVisible(false)}
      />
    </View>
  );
}
