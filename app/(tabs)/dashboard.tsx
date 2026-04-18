import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  ActivityIndicator, 
  Image, 
  RefreshControl, 
  TouchableOpacity, 
  Modal, 
  ScrollView,
  Pressable
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSteamAuth } from '../../src/hooks/useSteamAuth';
import { 
  getPlayerProfile, 
  getPlayerWinLoss, 
  getRecentMatches, 
  getMatchDetails,
  getPlayerTotals,
  getPlayerCounts,
  PlayerProfile, 
  WinLossStats, 
  RecentMatch,
  MatchDetails,
  PlayerTotal,
  PlayerCounts,
  GAME_MODES
} from '../../src/services/opendota';
import { getHeroImageUrl, getItemImageUrl, HEROES, LOBBY_TYPES, REGIONS, LANES, LANE_ROLES, HERO_NAME_TO_ID } from '../../src/services/constants';
import { RankBadge } from '../../src/components/RankBadge';
import { LineChart } from "react-native-chart-kit"; // Added import

type MatchTab = 'Scoreboard' | 'Highlights' | 'Combat' | 'Economy';
type DashboardTab = 'Recent' | 'Lifetime';

interface CategoryStats {
  label: string;
  win: number;
  lose: number;
  total: number;
}

export default function DashboardScreen() {
  const { accountId } = useSteamAuth();
  
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [wl, setWl] = useState<WinLossStats | null>(null);
  const [matches, setMatches] = useState<RecentMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Tab State
  const [activeTab, setActiveTab] = useState<DashboardTab>('Recent');

  // Lifetime Stats State
  const [totals, setTotals] = useState<PlayerTotal[]>([]);
  const [lobbyStats, setLobbyStats] = useState<CategoryStats[]>([]);
  const [modeStats, setModeStats] = useState<CategoryStats[]>([]);
  const [regionStats, setRegionStats] = useState<CategoryStats[]>([]);
  const [sideStats, setSideStats] = useState<CategoryStats[]>([]);
  const [statsLoading, setStatsLoading] = useState(false);
  
  // Match Details Modal State
  const [selectedMatch, setSelectedMatch] = useState<MatchDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeMatchTab, setActiveMatchTab] = useState<MatchTab>('Scoreboard');

  // Individual Player Detail State
  const [playerModalVisible, setPlayerModalVisible] = useState(false);
  const [playerDetailsLoading, setPlayerDetailsLoading] = useState(false);
  const [selectedPlayerProfile, setSelectedPlayerProfile] = useState<PlayerProfile | null>(null);
  const [selectedPlayerWL, setSelectedPlayerWL] = useState<WinLossStats | null>(null);
  const [selectedPlayerMatches, setSelectedPlayerMatches] = useState<RecentMatch[]>([]);

  const loadData = async () => {
    if (!accountId) return;
    try {
      setStatsLoading(true);
      const [profData, wlData, matchData, totalsData, countsData] = await Promise.all([
        getPlayerProfile(accountId),
        getPlayerWinLoss(accountId),
        getRecentMatches(accountId),
        getPlayerTotals(accountId),
        getPlayerCounts(accountId)
      ]);
      setProfile(profData);
      setWl(wlData);
      setMatches(matchData);
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
      setLoading(false);
      setRefreshing(false);
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [accountId]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleMatchPress = async (matchId: number) => {
    setActiveMatchTab('Scoreboard'); // Reset to default tab
    setModalVisible(true);
    setDetailsLoading(true);
    try {
      const details = await getMatchDetails(matchId);
      setSelectedMatch(details);
    } catch (e) {
      console.error(e);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handlePlayerPress = async (pAccountId: number | null) => {
    if (!pAccountId) return;
    setPlayerModalVisible(true);
    setPlayerDetailsLoading(true);
    try {
      const [pProfile, pWL, pMatches] = await Promise.all([
        getPlayerProfile(pAccountId.toString()),
        getPlayerWinLoss(pAccountId.toString()),
        getRecentMatches(pAccountId.toString(), 5)
      ]);
      setSelectedPlayerProfile(pProfile);
      setSelectedPlayerWL(pWL);
      setSelectedPlayerMatches(pMatches);
    } catch (e) {
      console.error(e);
    } finally {
      setPlayerDetailsLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gamingDark justify-center items-center">
        <ActivityIndicator size="large" color="#8b5cf6" />
      </View>
    );
  }

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
    <View className="mx-4 mb-6 bg-[#1e1e1e] rounded-2xl overflow-hidden border border-white/5">
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
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8b5cf6" />}
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
        onPress={() => handleMatchPress(item.match_id)}
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

  const renderPlayerRow = (p: MatchDetails['players'][0], index: number) => {
    const isLocalUser = p.account_id?.toString() === accountId;
    const isAnonymous = !p.account_id;
    const mainItems = [p.item_0, p.item_1, p.item_2, p.item_3, p.item_4, p.item_5];

    return (
      <TouchableOpacity 
        key={index} 
        onPress={() => !isAnonymous && handlePlayerPress(p.account_id)}
        disabled={isAnonymous}
        className={`py-3 border-b border-zinc-800 active:bg-zinc-700 ${isLocalUser ? 'bg-zinc-800/50' : ''}`}
      >
        <View className="flex-row items-center px-1">
          <View className="w-12 items-center">
            <Image 
              source={{ uri: getHeroImageUrl(p.hero_id) }} 
              className="w-10 h-7 rounded-sm shadow-sm"
              resizeMode="cover"
            />
            <Text className="text-gray-500 text-[8px] mt-1">LVL {p.level}</Text>
          </View>
          <View className="flex-1 ml-2">
            <View className="flex-row items-center">
              <Text className={`text-xs font-bold ${isLocalUser ? 'text-gamingAccent' : 'text-white'}`} numberOfLines={1}>{p.personaname || 'Anonymous'}</Text>
              {p.lane && (
                <View className="bg-zinc-700 px-1 rounded ml-1">
                  <Text className="text-[7px] text-gray-300 font-bold uppercase">{LANES[p.lane] || 'Unknown'}</Text>
                </View>
              )}
              {p.is_roaming && (
                <View className="bg-blue-900/40 px-1 rounded ml-1 border border-blue-500/30">
                  <Text className="text-[7px] text-blue-400 font-bold uppercase">Roaming</Text>
                </View>
              )}
            </View>
            <Text className="text-[10px] text-gray-500">
              {p.lane_role && `${LANE_ROLES[p.lane_role]} • `}
              NW: {(p.net_worth / 1000).toFixed(1)}k • G/X: {p.gold_per_min}/{p.xp_per_min}
            </Text>
          </View>
          <View className="w-16 items-center">
            <Text className="text-white text-[10px] font-bold">{p.kills}/{p.deaths}/{p.assists}</Text>
            <Text className="text-gray-500 text-[9px]">{p.last_hits}/{p.denies}</Text>
          </View>
          <View className="w-20 items-end pr-2">
            <Text className="text-red-500 text-[9px] font-bold leading-tight">{p.hero_damage.toLocaleString()} HD</Text>
            <Text className="text-orange-500 text-[8px] font-bold leading-tight">{p.tower_damage.toLocaleString()} TD</Text>
            {p.hero_healing > 0 && <Text className="text-blue-500 text-[8px] font-bold leading-tight">{p.hero_healing.toLocaleString()} HH</Text>}
          </View>
          <View className="w-3">
            {!isAnonymous && <Ionicons name="chevron-forward" size={10} color="#4b5563" />}
          </View>
        </View>

        {/* Items Row */}
        <View className="flex-row items-center ml-14 mt-2">
          <View className="flex-row items-center bg-black/20 p-1 rounded-md border border-white/5">
            {/* Main Inventory */}
            <View className="flex-row">
              {mainItems.map((itemId, i) => (itemId > 0 || i < 6) && (
                <Image 
                  key={i}
                  source={{ uri: getItemImageUrl(itemId) }} 
                  className="w-7 h-5 mr-1 rounded-[1px] bg-zinc-900/50"
                  resizeMode="cover"
                />
              ))}
            </View>
            {/* Neutral Item */}
            <View className="ml-1 border-l border-zinc-700 pl-2">
              <Image 
                source={{ uri: getItemImageUrl(p.item_neutral) }} 
                className="w-6 h-5 rounded-full bg-zinc-900 border border-zinc-600"
                resizeMode="cover"
              />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const getHighlights = (match: MatchDetails) => {
    const topDamage = [...match.players].sort((a, b) => b.hero_damage - a.hero_damage)[0];
    const topNetWorth = [...match.players].sort((a, b) => b.net_worth - a.net_worth)[0];
    const topTowers = [...match.players].sort((a, b) => b.tower_damage - a.tower_damage)[0];
    const topHealing = [...match.players].sort((a, b) => b.hero_healing - a.hero_healing)[0];
    const topStacks = [...match.players].sort((a, b) => (b.camps_stacked || 0) - (a.camps_stacked || 0))[0];
    return { topDamage, topNetWorth, topTowers, topHealing, topStacks };
  };

  return (
    <View className="flex-1 bg-gamingDark">
      {activeTab === 'Recent' ? (
        <FlatList
          data={matches}
          keyExtractor={(item) => item.match_id.toString()}
          renderItem={renderMatch}
          ListHeaderComponent={renderHeader()}
          ListFooterComponent={<View style={{ height: 80 }} />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8b5cf6" />}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      ) : (
        renderLifetimeContent()
      )}

      {/* Match Details Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={true} onRequestClose={() => setModalVisible(false)}>
        <Pressable className="flex-1 bg-black/70 justify-end" onPress={() => setModalVisible(false)}>
          <Pressable className="bg-[#1e1e1e] h-[95%] rounded-t-3xl overflow-hidden" onPress={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <View className="flex-row justify-between items-center p-4 border-b border-zinc-800">
              <View className="flex-1">
                <View className="flex-row items-center">
                  <Text className="text-white text-xl font-bold">Match Overview</Text>
                  {selectedMatch?.version && (
                    <View className="bg-gamingAccent/20 px-2 py-0.5 rounded ml-2 border border-gamingAccent/30">
                      <Text className="text-gamingAccent text-[8px] font-bold">ADVANCED STATS</Text>
                    </View>
                  )}
                </View>
                {selectedMatch && <Text className="text-gray-500 text-[10px]">{GAME_MODES[selectedMatch.game_mode] || 'Standard'} • ID: {selectedMatch.match_id}</Text>}
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={28} color="white" />
              </TouchableOpacity>
            </View>

            {detailsLoading ? (
              <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#8b5cf6" />
                <Text className="text-gray-400 mt-4">Parsing complete match history...</Text>
              </View>
            ) : selectedMatch ? (
              <View className="flex-1">
                {/* Score Summary (Always visible at top of modal) */}
                <View className="bg-[#2a2a2a] p-4 flex-row justify-around items-center border-b border-zinc-800">
                  <View className="items-center">
                    <Text className="text-win font-bold text-3xl">{selectedMatch.radiant_score}</Text>
                    <Text className="text-win text-[10px] font-bold">RADIANT</Text>
                  </View>
                  <View className="items-center">
                    <Text className="text-white text-xs font-bold">{Math.floor(selectedMatch.duration / 60)}:{String(selectedMatch.duration % 60).padStart(2, '0')}</Text>
                    <Text className={`text-[10px] font-bold mt-1 ${selectedMatch.radiant_win ? 'text-win' : 'text-loss'}`}>
                      {selectedMatch.radiant_win ? 'RADIANT WIN' : 'DIRE WIN'}
                    </Text>
                  </View>
                  <View className="items-center">
                    <Text className="text-loss font-bold text-3xl">{selectedMatch.dire_score}</Text>
                    <Text className="text-loss text-[10px] font-bold">DIRE</Text>
                  </View>
                </View>

                {/* Internal Tab Bar */}
                <View className="flex-row bg-[#1e1e1e] border-b border-zinc-800">
                  {(['Scoreboard', 'Highlights', 'Combat', 'Economy'] as MatchTab[]).map((tab) => (
                    <TouchableOpacity 
                      key={tab}
                      onPress={() => setActiveMatchTab(tab)}
                      className={`flex-1 py-3 items-center border-b-2 ${activeMatchTab === tab ? 'border-gamingAccent' : 'border-transparent'}`}
                    >
                      <Text className={`text-[11px] font-bold ${activeMatchTab === tab ? 'text-white' : 'text-gray-500'}`}>{tab.toUpperCase()}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Tab Content */}
                <ScrollView showsVerticalScrollIndicator={false} className="p-4">
                  {activeMatchTab === 'Scoreboard' && (
                    <>
                      <View className="mb-6">
                        <Text className="text-win font-bold uppercase text-[10px] mb-2 pl-1 tracking-widest">Radiant Team</Text>
                        <View className="bg-[#222] rounded-xl overflow-hidden border border-zinc-800 shadow-sm">
                          <View className="flex-row bg-zinc-800/80 py-1.5 px-2">
                            <Text className="w-12 text-[9px] text-gray-400 font-bold text-center">H</Text>
                            <Text className="flex-1 text-[9px] text-gray-400 font-bold ml-2">PLAYER / NW / G/X</Text>
                            <Text className="w-16 text-[9px] text-gray-400 font-bold text-center">KDA / LH</Text>
                            <Text className="w-28 text-[9px] text-gray-400 font-bold text-right pr-2">ITEMS / DMG</Text>
                          </View>
                          {selectedMatch.players.filter(p => p.player_slot < 128).map((p, i) => renderPlayerRow(p, i))}
                        </View>
                      </View>

                      <View className="mb-6">
                        <Text className="text-loss font-bold uppercase text-[10px] mb-2 pl-1 tracking-widest">Dire Team</Text>
                        <View className="bg-[#222] rounded-xl overflow-hidden border border-zinc-800 shadow-sm">
                          <View className="flex-row bg-zinc-800/80 py-1.5 px-2">
                            <Text className="w-12 text-[9px] text-gray-400 font-bold text-center">H</Text>
                            <Text className="flex-1 text-[9px] text-gray-400 font-bold ml-2">PLAYER / NW / G/X</Text>
                            <Text className="w-16 text-[9px] text-gray-400 font-bold text-center">KDA / LH</Text>
                            <Text className="w-28 text-[9px] text-gray-400 font-bold text-right pr-2">ITEMS / DMG</Text>
                          </View>
                          {selectedMatch.players.filter(p => p.player_slot >= 128).map((p, i) => renderPlayerRow(p, i))}
                        </View>
                      </View>
                    </>
                  )}

                  {activeMatchTab === 'Highlights' && (
                    <View>
                      <Text className="text-gray-400 uppercase tracking-widest text-[10px] font-bold mb-3 pl-1">MVP Performance</Text>
                      {(() => {
                        const h = getHighlights(selectedMatch);
                        return (
                          <View>
                            <View className="bg-[#2a2a2a] p-4 rounded-xl mb-3 flex-row items-center border border-red-900/20">
                              <View className="bg-red-500/10 p-2 rounded-full mr-4"><Ionicons name="flame" size={24} color="#ef4444" /></View>
                              <View className="flex-1">
                                <Text className="text-red-500 text-[10px] font-bold uppercase">Top Hero Damage</Text>
                                <Text className="text-white font-bold">{h.topDamage.personaname || 'Anonymous'}</Text>
                                <Text className="text-gray-400 text-xs">{h.topDamage.hero_damage.toLocaleString()} total damage dealt</Text>
                              </View>
                            </View>

                            <View className="bg-[#2a2a2a] p-4 rounded-xl mb-3 flex-row items-center border border-yellow-900/20">
                              <View className="bg-yellow-500/10 p-2 rounded-full mr-4"><Ionicons name="cash" size={24} color="#eab308" /></View>
                              <View className="flex-1">
                                <Text className="text-yellow-500 text-[10px] font-bold uppercase">Highest Net Worth</Text>
                                <Text className="text-white font-bold">{h.topNetWorth.personaname || 'Anonymous'}</Text>
                                <Text className="text-gray-400 text-xs">{(h.topNetWorth.net_worth/1000).toFixed(1)}k gold accumulated</Text>
                              </View>
                            </View>

                            <View className="bg-[#2a2a2a] p-4 rounded-xl mb-3 flex-row items-center border border-green-900/20">
                              <View className="bg-green-500/10 p-2 rounded-full mr-4"><Ionicons name="hammer" size={24} color="#22c55e" /></View>
                              <View className="flex-1">
                                <Text className="text-green-500 text-[10px] font-bold uppercase">Top Objective Pusher</Text>
                                <Text className="text-white font-bold">{h.topTowers.personaname || 'Anonymous'}</Text>
                                <Text className="text-gray-400 text-xs">{h.topTowers.tower_damage.toLocaleString()} tower damage</Text>
                              </View>
                            </View>

                            {h.topHealing.hero_healing > 0 && (
                              <View className="bg-[#2a2a2a] p-4 rounded-xl mb-3 flex-row items-center border border-blue-900/20">
                                <View className="bg-blue-500/10 p-2 rounded-full mr-4"><Ionicons name="medkit" size={24} color="#3b82f6" /></View>
                                <View className="flex-1">
                                  <Text className="text-blue-500 text-[10px] font-bold uppercase">Top Support Impact</Text>
                                  <Text className="text-white font-bold">{h.topHealing.personaname || 'Anonymous'}</Text>
                                  <Text className="text-gray-400 text-xs">{h.topHealing.hero_healing.toLocaleString()} total healing provided</Text>
                                </View>
                              </View>
                            )}

                            {(h.topStacks.camps_stacked || 0) > 0 && (
                              <View className="bg-[#2a2a2a] p-4 rounded-xl mb-3 flex-row items-center border border-purple-900/20">
                                <View className="bg-purple-500/10 p-2 rounded-full mr-4"><Ionicons name="layers" size={24} color="#a855f7" /></View>
                                <View className="flex-1">
                                  <Text className="text-purple-500 text-[10px] font-bold uppercase">Top Stacker</Text>
                                  <Text className="text-white font-bold">{h.topStacks.personaname || 'Anonymous'}</Text>
                                  <Text className="text-gray-400 text-xs">{h.topStacks.camps_stacked} neutral camps stacked</Text>
                                </View>
                              </View>
                            )}
                          </View>
                        );
                      })()}

                      <View className="bg-[#2a2a2a] p-4 rounded-xl mt-4">
                        <Text className="text-gray-400 text-[10px] font-bold uppercase mb-2">Match Metadata</Text>
                        
                        {(() => {
                          const localPlayer = selectedMatch.players.find(p => p.account_id?.toString() === accountId);
                          if (localPlayer?.benchmarks) {
                            return (
                              <View className="mb-4 pb-4 border-b border-zinc-800">
                                <Text className="text-gamingAccent text-[10px] font-bold uppercase mb-3">Your Performance Percentiles</Text>
                                <View className="flex-row flex-wrap justify-between">
                                  {[
                                    { label: 'GPM', val: localPlayer.benchmarks.gold_per_min.pct },
                                    { label: 'XPM', val: localPlayer.benchmarks.xp_per_min.pct },
                                    { label: 'Damage', val: localPlayer.benchmarks.hero_damage_per_min.pct },
                                    { label: 'Last Hits', val: localPlayer.benchmarks.last_hits_per_min.pct },
                                  ].map((b, i) => (
                                    <View key={i} className="w-[48%] bg-zinc-800/50 p-2 rounded-lg mb-2">
                                      <Text className="text-gray-500 text-[8px] font-bold uppercase">{b.label}</Text>
                                      <Text className={`text-sm font-bold ${b.val >= 0.8 ? 'text-win' : b.val >= 0.5 ? 'text-white' : 'text-loss'}`}>
                                        Top {(100 - (b.val * 100)).toFixed(2)}%
                                      </Text>

                                    </View>
                                  ))}
                                </View>
                              </View>
                            );
                          }
                          return null;
                        })()}

                        <View className="flex-row justify-between py-2 border-b border-zinc-800">
                          <Text className="text-gray-500 text-xs">First Blood Time</Text>
                          <Text className="text-white text-xs">{Math.floor(selectedMatch.first_blood_time / 60)}:{String(selectedMatch.first_blood_time % 60).padStart(2, '0')}</Text>
                        </View>
                        <View className="flex-row justify-between py-2 border-b border-zinc-800">
                          <Text className="text-gray-500 text-xs">Lobby Type</Text>
                          <Text className="text-white text-xs">{LOBBY_TYPES[selectedMatch.lobby_type] || 'Standard'}</Text>
                        </View>
                        <View className="flex-row justify-between py-2 border-b border-zinc-800">
                          <Text className="text-gray-500 text-xs">Region</Text>
                          <Text className="text-white text-xs">{REGIONS[selectedMatch.region] || `Region ${selectedMatch.region}`}</Text>
                        </View>
                        <View className="flex-row justify-between py-2 border-b border-zinc-800">
                          <Text className="text-gray-500 text-xs">Patch</Text>
                          <Text className="text-white text-xs">{selectedMatch.patch ? `Patch ${selectedMatch.patch}` : 'Unknown'}</Text>
                        </View>
                        <View className="flex-row justify-between py-2">
                          <Text className="text-gray-500 text-xs">Start Time</Text>
                          <Text className="text-white text-xs">{new Date(selectedMatch.start_time * 1000).toLocaleString()}</Text>
                        </View>
                      </View>

                      {!selectedMatch.version && (
                        <View className="bg-zinc-900/30 p-4 rounded-xl mt-4 border border-zinc-800/50 flex-row items-center">
                          <Ionicons name="information-circle-outline" size={18} color="#6b7280" />
                          <Text className="text-gray-500 text-[10px] ml-3 flex-1">
                            Additional highlights like "Top Stacker" and "Support Impact" are only available for parsed matches.
                          </Text>
                        </View>
                      )}
                    </View>
                  )}

                  {activeMatchTab === 'Combat' && (
                    <View>
                      <Text className="text-gray-400 uppercase tracking-widest text-[10px] font-bold mb-3 pl-1">Advanced Combat Performance</Text>
                      
                      {selectedMatch.players.map((p, i) => {
                        const hasCombatStats = p.multi_kills || p.stuns !== undefined || p.hero_damage_targets;
                        if (!hasCombatStats) return null;

                        return (
                          <View key={i} className="bg-[#2a2a2a] rounded-xl mb-4 overflow-hidden border border-zinc-800">
                            {/* Player Header */}
                            <View className="flex-row items-center p-3 bg-zinc-800/50 border-b border-zinc-700">
                              <Image source={{ uri: getHeroImageUrl(p.hero_id) }} className="w-10 h-7 rounded-sm mr-3" />
                              <Text className="text-white font-bold flex-1" numberOfLines={1}>{p.personaname || 'Anonymous'}</Text>
                              <View className="bg-red-500/10 px-2 py-1 rounded">
                                <Text className="text-red-500 text-[10px] font-bold">{p.hero_damage.toLocaleString()} DMG</Text>
                              </View>
                            </View>

                            <View className="p-4">
                              {/* Multi-kills */}
                              {p.multi_kills && Object.keys(p.multi_kills).length > 0 && (
                                <View className="mb-4">
                                  <Text className="text-gray-500 text-[9px] font-bold uppercase mb-2">Kill Feats</Text>
                                  <View className="flex-row flex-wrap">
                                    {Object.entries(p.multi_kills).map(([key, val]) => {
                                      const label = key === '2' ? 'Double' : key === '3' ? 'Triple' : key === '4' ? 'Ultra' : 'Rampage';
                                      const color = key === '2' ? 'text-blue-400' : key === '3' ? 'text-purple-400' : key === '4' ? 'text-orange-400' : 'text-red-500';
                                      return (
                                        <View key={key} className="bg-zinc-900 px-3 py-1.5 rounded-lg mr-2 mb-2 border border-zinc-800">
                                          <Text className={`${color} text-xs font-bold`}>{val}x {label}</Text>
                                        </View>
                                      );
                                    })}
                                  </View>
                                </View>
                              )}

                              {/* Stuns & Killstreaks */}
                              <View className="flex-row justify-between mb-4">
                                {p.stuns !== undefined && (
                                  <View className="flex-1 bg-zinc-900 p-2 rounded-lg mr-2 border border-zinc-800">
                                    <Text className="text-gray-500 text-[8px] font-bold uppercase">Stun Duration</Text>
                                    <Text className="text-white text-sm font-bold">{p.stuns.toFixed(1)}s</Text>
                                  </View>
                                )}
                                {p.kill_streaks && Object.keys(p.kill_streaks).length > 0 && (
                                  <View className="flex-1 bg-zinc-900 p-2 rounded-lg border border-zinc-800">
                                    <Text className="text-gray-500 text-[8px] font-bold uppercase">Max Streak</Text>
                                    <Text className="text-white text-sm font-bold">{Math.max(...Object.keys(p.kill_streaks).map(Number))}</Text>
                                  </View>
                                )}
                              </View>

                              {/* Damage Targets */}
                              {p.hero_damage_targets && (
                                <View className="mb-4">
                                  <Text className="text-gray-500 text-[9px] font-bold uppercase mb-2">Damage to Enemies</Text>
                                  {Object.entries(p.hero_damage_targets)
                                    .sort(([, a], [, b]) => b - a)
                                    .slice(0, 3)
                                    .map(([targetHeroId, damage]) => {
                                      return (
                                        <View key={targetHeroId} className="flex-row items-center mb-1">
                                          <Image source={{ uri: getHeroImageUrl(Number(targetHeroId)) }} className="w-6 h-4 rounded-sm mr-2" />
                                          <View className="flex-1 h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                                            <View 
                                              style={{ width: `${(damage / p.hero_damage) * 100}%` }} 
                                              className="h-full bg-red-500/60" 
                                            />
                                          </View>
                                          <Text className="text-gray-400 text-[10px] ml-2 w-12 text-right">{damage.toLocaleString()}</Text>
                                        </View>
                                      );
                                    })}
                                </View>
                              )}

                              {/* Kill Log */}
                              {p.kill_log && p.kill_log.length > 0 && (
                                <View>
                                  <Text className="text-gray-500 text-[9px] font-bold uppercase mb-2">Kill Log</Text>
                                  <View className="flex-row flex-wrap">
                                    {p.kill_log.slice(-10).reverse().map((k, idx) => {
                                      const victimId = HERO_NAME_TO_ID[k.key];
                                      return (
                                        <View key={idx} className="mr-2 mb-2 items-center bg-zinc-900 p-1 rounded-md border border-zinc-800">
                                          <Image source={{ uri: getHeroImageUrl(victimId) }} className="w-8 h-6 rounded-sm mb-1" />
                                          <Text className="text-[7px] text-gray-500 font-bold">{Math.floor(k.time / 60)}:{String(k.time % 60).padStart(2, '0')}</Text>
                                        </View>
                                      );
                                    })}
                                  </View>
                                  {p.kill_log.length > 10 && <Text className="text-[8px] text-gray-600 italic">Showing last 10 kills</Text>}
                                </View>
                              )}
                            </View>
                          </View>
                        );
                      })}

                      {!selectedMatch.version && (
                        <View className="bg-zinc-900/50 p-6 rounded-2xl items-center border border-zinc-800">
                          <Ionicons name="information-circle-outline" size={32} color="#6b7280" />
                          <Text className="text-gray-400 text-center mt-3 text-sm">
                            Detailed combat stats are only available for parsed matches. 
                            This match has not been fully analyzed by OpenDota yet.
                          </Text>
                        </View>
                      )}
                    </View>
                  )}

                  {activeMatchTab === 'Economy' && (
                    <View>
                      <Text className="text-gray-400 uppercase tracking-widest text-[10px] font-bold mb-3 pl-1">Match Trends</Text>
                      
                      <View className="bg-[#2a2a2a] p-5 rounded-xl mb-4 border border-zinc-800">
                        <Text className="text-white font-bold mb-4 text-center">Final Team Advantages</Text>
                        
                        <View className="flex-row items-center mb-6">
                          <View className="w-16"><Text className="text-gray-500 text-[10px] font-bold">GOLD</Text></View>
                          <View className="flex-1 h-3 bg-zinc-800 rounded-full overflow-hidden flex-row">
                            {selectedMatch.radiant_gold_adv?.slice(-1)[0] > 0 ? (
                              <>
                                <View className="flex-1" />
                                <View style={{ width: '50%' }} className="bg-win" />
                              </>
                            ) : (
                              <>
                                <View style={{ width: '50%' }} className="bg-loss" />
                                <View className="flex-1" />
                              </>
                            )}
                          </View>
                          <View className="w-20 items-end"><Text className={`text-xs font-bold ${selectedMatch.radiant_gold_adv?.slice(-1)[0] > 0 ? 'text-win' : 'text-loss'}`}>
                            {Math.abs(selectedMatch.radiant_gold_adv?.slice(-1)[0] || 0).toLocaleString()}
                          </Text></View>
                        </View>

                        <View className="flex-row items-center">
                          <View className="w-16"><Text className="text-gray-500 text-[10px] font-bold">XP</Text></View>
                          <View className="flex-1 h-3 bg-zinc-800 rounded-full overflow-hidden flex-row">
                            {selectedMatch.radiant_xp_adv?.slice(-1)[0] > 0 ? (
                              <>
                                <View className="flex-1" />
                                <View style={{ width: '50%' }} className="bg-win" />
                              </>
                            ) : (
                              <>
                                <View style={{ width: '50%' }} className="bg-loss" />
                                <View className="flex-1" />
                              </>
                            )}
                          </View>
                          <View className="w-20 items-end"><Text className={`text-xs font-bold ${selectedMatch.radiant_xp_adv?.slice(-1)[0] > 0 ? 'text-win' : 'text-loss'}`}>
                            {Math.abs(selectedMatch.radiant_xp_adv?.slice(-1)[0] || 0).toLocaleString()}
                          </Text></View>
                        </View>
                      </View>

                      {/* Chart Component */}
                      <View className="bg-[#2a2a2a] p-4 rounded-xl border border-zinc-800">
                        <Text className="text-white font-bold mb-4 text-center">Match Trends (Gold/XP Advantage)</Text>
                        {selectedMatch.radiant_gold_adv && selectedMatch.radiant_xp_adv && (selectedMatch.radiant_gold_adv.length > 1 || selectedMatch.radiant_xp_adv.length > 1) ? (
                          (() => {
                            const chartLabels = selectedMatch.radiant_gold_adv.map((_, index) => `${index}`);
                            const goldData = selectedMatch.radiant_gold_adv;
                            const xpData = selectedMatch.radiant_xp_adv;

                            const chartData = {
                              labels: chartLabels,
                              datasets: [
                                {
                                  data: goldData,
                                  color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`, // Red for Gold Advantage
                                  strokeWidth: 2
                                },
                                {
                                  data: xpData,
                                  color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`, // Blue for XP Advantage
                                  strokeWidth: 2
                                }
                              ]
                            };

                            const chartConfig = {
                              backgroundColor: "#1e1e1e",
                              backgroundGradientFrom: "#2a2a2a",
                              backgroundGradientTo: "#2a2a2a",
                              decimalPlaces: 0,
                              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                              labelColor: (opacity = 1) => `rgba(156, 163, 175, ${opacity})`,
                              style: {
                                borderRadius: 16
                              },
                              propsForDots: {
                                r: "3",
                                strokeWidth: "1",
                              },
                              useShadow: false,
                            };

                            const screenWidth = 350; // Adjust as needed, or use Dimensions API
                            const chartHeight = 220;

                            return (
                              <LineChart
                                data={chartData}
                                width={screenWidth}
                                height={chartHeight}
                                chartConfig={chartConfig}
                                bezier
                                style={{ marginVertical: 8, borderRadius: 16 }}
                                withDots={false}
                                withInnerLines={true}
                                withOuterLines={true}
                                withHorizontalLabels={true}
                                withVerticalLabels={true}
                                yAxisSuffix=""
                                xLabelsOffset={-5}
                                yAxisInterval={1}
                              />
                            );
                          })()
                        ) : (
                          <View className="items-center justify-center py-10">
                            <Text className="text-gray-500">Not enough data to display trend.</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  )}
                  <View className="h-20" />
                </ScrollView>
              </View>
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>

      {/* Player Detail Modal */}
      <Modal visible={playerModalVisible} animationType="slide" transparent={true} onRequestClose={() => setPlayerModalVisible(false)}>
        <Pressable className="flex-1 bg-black/80 justify-end" onPress={() => setPlayerModalVisible(false)}>
          <Pressable className="bg-[#1e1e1e] h-[85%] rounded-t-3xl p-6" onPress={(e) => e.stopPropagation()}>
            {playerDetailsLoading ? (
              <View className="flex-1 justify-center items-center"><ActivityIndicator size="large" color="#8b5cf6" /><Text className="text-gray-400 mt-4">Loading player profile...</Text></View>
            ) : selectedPlayerProfile ? (
              <View className="flex-1">
                <View className="flex-row justify-between items-start mb-6">
                  <View className="flex-row items-center">
                    <Image source={{ uri: selectedPlayerProfile.profile.avatarfull }} className="w-16 h-16 rounded-full border-2 border-gamingAccent" />
                    <View className="ml-4 flex-1">
                      <Text className="text-white text-xl font-bold" numberOfLines={1}>{selectedPlayerProfile.profile.personaname}</Text>
                      <Text className="text-gray-500 text-xs">ID: {selectedPlayerProfile.profile.account_id}</Text>
                    </View>
                    <RankBadge 
                      rankTier={selectedPlayerProfile.rank_tier} 
                      leaderboardRank={selectedPlayerProfile.leaderboard_rank} 
                      size={50} 
                    />
                  </View>
                  <TouchableOpacity onPress={() => setPlayerModalVisible(false)}><Ionicons name="close" size={28} color="white" /></TouchableOpacity>
                </View>
                <ScrollView showsVerticalScrollIndicator={false}>
                  <View className="flex-row justify-between bg-zinc-900 p-4 rounded-xl mb-6">
                    <View className="items-center"><Text className="text-gray-500 text-[10px] font-bold uppercase">Wins</Text><Text className="text-win text-lg font-bold">{selectedPlayerWL?.win}</Text></View>
                    <View className="items-center"><Text className="text-gray-500 text-[10px] font-bold uppercase">Losses</Text><Text className="text-loss text-lg font-bold">{selectedPlayerWL?.lose}</Text></View>
                    <View className="items-center">
                      <Text className="text-gray-500 text-[10px] font-bold uppercase">Win Rate</Text>
                      <Text className="text-white text-lg font-bold">{selectedPlayerWL && (selectedPlayerWL.win + selectedPlayerWL.lose > 0) ? ((selectedPlayerWL.win / (selectedPlayerWL.win + selectedPlayerWL.lose)) * 100).toFixed(2) : '0.00'}%</Text>
                    </View>
                  </View>
                  <Text className="text-gray-400 uppercase tracking-widest text-[10px] font-bold mb-3">Recent Matches</Text>
                  {selectedPlayerMatches.map((m, idx) => {
                    const mWin = (m.player_slot < 128 && m.radiant_win) || (m.player_slot >= 128 && !m.radiant_win);
                    return (
                      <TouchableOpacity key={idx} onPress={() => { setPlayerModalVisible(false); handleMatchPress(m.match_id); }} className="bg-zinc-800/50 p-3 rounded-xl mb-2 flex-row justify-between items-center border-l-2 border-zinc-700">
                        <View><Text className={`text-xs font-bold ${mWin ? 'text-win' : 'text-loss'}`}>{mWin ? 'WIN' : 'LOSS'}</Text><Text className="text-gray-400 text-[10px]">Hero: {m.hero_id} • {m.kills}/{m.deaths}/{m.assists}</Text></View>
                        <View className="items-end"><Text className="text-gray-500 text-[10px]">{new Date(m.start_time * 1000).toLocaleDateString()}</Text><Ionicons name="chevron-forward" size={12} color="#4b5563" /></View>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}