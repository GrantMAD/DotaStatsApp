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

type DashboardTab = 'Recent' | 'Lifetime';

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
}

export function PlayerOverviewContent({ 
  accountId, 
  profile, 
  wl, 
  matches, 
  onMatchPress,
  onRefresh,
  refreshing = false
}: PlayerOverviewContentProps) {
  const [activeTab, setActiveTab] = useState<DashboardTab>('Recent');
  
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
    <View className="bg-[#1e1e1e] p-6 rounded-b-3xl shadow-lg mb-4">
      <View className="flex-row items-center mb-6">
        {profile?.profile?.avatarfull ? (
          <Image source={{ uri: profile.profile.avatarfull }} className="w-20 h-20 rounded-full border-2 border-gamingAccent mr-4" />
        ) : (
          <View className="w-20 h-20 rounded-full bg-gray-600 mr-4" />
        )}
        <View className="flex-1">
          <Text className="text-2xl text-white font-bold" numberOfLines={1}>{profile?.profile?.personaname || 'Unknown Player'}</Text>
          <Text className="text-gray-400">Account ID: {accountId}</Text>
        </View>
        <RankBadge rankTier={profile?.rank_tier || null} leaderboardRank={profile?.leaderboard_rank || null} size={60} />
      </View>
      
      {activeTab === 'Recent' && wl && (
        <View className="flex-row justify-between bg-[#2a2a2a] p-4 rounded-xl mb-6">
          <View className="items-center">
            <Text className="text-gray-400 text-xs uppercase tracking-widest">Wins</Text>
            <Text className="text-win text-xl font-bold">{wl.win}</Text>
          </View>
          <View className="items-center">
            <Text className="text-gray-400 text-xs uppercase tracking-widest">Losses</Text>
            <Text className="text-loss text-xl font-bold">{wl.lose}</Text>
          </View>
          <View className="items-center">
            <Text className="text-gray-400 text-xs uppercase tracking-widest">Win Rate</Text>
            <Text className="text-white text-xl font-bold">{wl.win + wl.lose > 0 ? ((wl.win / (wl.win + wl.lose)) * 100).toFixed(2) : '0.00'}%</Text>
          </View>
        </View>
      )}

      {activeTab === 'Lifetime' && totals.length > 0 && (
        <View className="flex-col bg-[#2a2a2a] p-4 rounded-xl mb-6">
          <View className="flex-row justify-between mb-4 pb-4 border-b border-white/5">
            <View className="items-center flex-1">
              <Text className="text-gray-400 text-[10px] uppercase tracking-widest font-bold">Total Matches</Text>
              <Text className="text-white text-xl font-bold">{wl ? wl.win + wl.lose : 0}</Text>
            </View>
            <View className="items-center flex-1 border-x border-white/5">
              <Text className="text-gray-400 text-[10px] uppercase tracking-widest font-bold">Win Rate</Text>
              <Text className={`text-xl font-bold ${wl && wl.win / (wl.win + wl.lose) >= 0.5 ? 'text-win' : 'text-loss'}`}>
                {wl && wl.win + wl.lose > 0 ? ((wl.win / (wl.win + wl.lose)) * 100).toFixed(2) : '0.00'}%
              </Text>
            </View>
            <View className="items-center flex-1">
              <Text className="text-gray-400 text-[10px] uppercase tracking-widest font-bold">K/D/A</Text>
              <Text className="text-white text-xl font-bold">
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
              <Text className="text-gray-400 text-[10px] uppercase tracking-widest font-bold">Avg GPM</Text>
              <Text className="text-yellow-500 text-lg font-bold">
                {Math.round((totals.find(t => t.field === 'gold_per_min')?.sum || 0) / (totals.find(t => t.field === 'gold_per_min')?.n || 1))}
              </Text>
            </View>
            <View className="items-center">
              <Text className="text-gray-400 text-[10px] uppercase tracking-widest font-bold">Avg XPM</Text>
              <Text className="text-blue-500 text-lg font-bold">
                {Math.round((totals.find(t => t.field === 'xp_per_min')?.sum || 0) / (totals.find(t => t.field === 'xp_per_min')?.n || 1))}
              </Text>
            </View>
            <View className="items-center">
              <Text className="text-gray-400 text-[10px] uppercase tracking-widest font-bold">Impact</Text>
              <Text className="text-red-500 text-lg font-bold">
                {Math.round((totals.find(t => t.field === 'hero_damage')?.sum || 0) / (totals.find(t => t.field === 'hero_damage')?.n || 1)).toLocaleString()}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Dashboard Tabs */}
      <View className="flex-row bg-[#2a2a2a] rounded-xl p-1">
        {(['Recent', 'Lifetime'] as DashboardTab[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 rounded-lg items-center ${activeTab === tab ? 'bg-gamingAccent shadow-md' : 'bg-transparent'}`}
          >
            <Text className={`font-bold text-sm ${activeTab === tab ? 'text-white' : 'text-gray-400'}`}>
              {tab === 'Recent' ? 'RECENT MATCHES' : 'LIFETIME STATS'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStatSection = (title: string, icon: string, stats: CategoryStats[]) => (
    <View key={title} className="mx-4 mb-6 bg-[#1e1e1e] rounded-2xl overflow-hidden border border-white/5">
      <View className="flex-row items-center bg-zinc-800/50 p-4 border-b border-white/5">
        <Ionicons name={icon as any} size={20} color="#8b5cf6" />
        <Text className="text-white font-bold ml-3 uppercase tracking-widest text-xs">{title}</Text>
      </View>
      <View className="p-4">
        {stats.map((stat, i) => (
          <View key={i} className={`flex-row justify-between items-center ${i !== stats.length - 1 ? 'mb-4 pb-4 border-b border-white/5' : ''}`}>
            <View>
              <Text className="text-white font-semibold">{stat.label}</Text>
              <Text className="text-gray-500 text-xs mt-1">{stat.total} Matches • {stat.win}W - {stat.lose}L</Text>
            </View>
            <View className="items-end">
              <Text className={`text-lg font-bold ${stat.win / stat.total >= 0.5 ? 'text-win' : 'text-loss'}`}>
                {stat.total > 0 ? ((stat.win / stat.total) * 100).toFixed(2) : '0.00'}%
              </Text>
              <Text className="text-gray-600 text-[10px] uppercase font-bold">Win Rate</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const renderLifetimeContent = () => (
    <ScrollView 
      refreshControl={onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8b5cf6" /> : undefined}
      className="flex-1"
    >
      {renderHeader()}
      {statsLoading ? (
        <View className="py-20 items-center">
          <ActivityIndicator color="#8b5cf6" />
          <Text className="text-gray-500 mt-4">Analyzing lifetime data...</Text>
        </View>
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

  const renderMatch = ({ item }: { item: RecentMatch }) => {
    const isRadiant = item.player_slot < 128;
    const isWin = (isRadiant && item.radiant_win) || (!isRadiant && !item.radiant_win);
    const heroName = HEROES[item.hero_id]?.localized_name || `Hero ${item.hero_id}`;
    
    return (
      <TouchableOpacity 
        onPress={() => onMatchPress(item.match_id)}
        className={`bg-[#1e1e1e] p-4 mx-4 mb-3 rounded-xl border-l-4 flex-row justify-between items-center active:bg-zinc-800 ${isWin ? 'border-win' : 'border-loss'}`}
      >
        <View className="flex-row items-center flex-1">
          <Image 
            source={{ uri: getHeroImageUrl(item.hero_id) }} 
            className="w-12 h-12 rounded-lg mr-3"
            resizeMode="cover"
          />
          <View className="flex-1">
            <Text className={`font-bold text-lg ${isWin ? 'text-win' : 'text-loss'}`}>{isWin ? 'Victory' : 'Defeat'}</Text>
            <Text className="text-gray-300 text-sm font-semibold">{heroName}</Text>
            <Text className="text-gray-500 text-xs">KDA: {item.kills}/{item.deaths}/{item.assists}</Text>
          </View>
        </View>
        <View className="items-end">
          <Text className="text-gray-300 font-semibold">{Math.floor(item.duration / 60)}:{String(item.duration % 60).padStart(2, '0')}</Text>
          <Ionicons name="chevron-forward" size={16} color="#4b5563" className="mt-1" />
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
      ) : (
        renderLifetimeContent()
      )}
    </View>
  );
}
