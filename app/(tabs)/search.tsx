import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator,
  Modal,
  ScrollView,
  Pressable
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { 
  searchPlayers, 
  getPlayerProfile, 
  getPlayerWinLoss, 
  getRecentMatches,
  getMatchDetails,
  SearchResult,
  PlayerProfile,
  WinLossStats,
  RecentMatch,
  MatchDetails,
  GAME_MODES
} from '../../src/services/opendota';
import { 
  getHeroImageUrl, 
  getItemImageUrl, 
  HEROES, 
  LOBBY_TYPES, 
  REGIONS, 
  LANES, 
  LANE_ROLES 
} from '../../src/services/constants';
import { LineChart } from "react-native-chart-kit";

type MatchTab = 'Scoreboard' | 'Highlights' | 'Economy';
type StackItem = 
  | { type: 'player'; id: string; data?: { profile: PlayerProfile | null; wl: WinLossStats | null; matches: RecentMatch[] } }
  | { type: 'match'; id: number; data?: MatchDetails | null };

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // The Navigation Stack
  const [modalStack, setModalStack] = useState<StackItem[]>([]);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    setError(null);
    setResults([]);
    try {
      const data = await searchPlayers(query);
      setResults(data);
    } catch (e: any) {
      setError(e.message || 'An unexpected error occurred');
    } finally {
      setSearching(false);
    }
  };

  const pushPlayer = (accountId: string) => {
    setModalStack(prev => [...prev, { type: 'player', id: accountId }]);
  };

  const pushMatch = (matchId: number) => {
    setModalStack(prev => [...prev, { type: 'match', id: matchId }]);
  };

  const popStack = () => {
    setModalStack(prev => prev.slice(0, -1));
  };

  const renderResult = ({ item }: { item: SearchResult }) => (
    <TouchableOpacity 
      onPress={() => pushPlayer(item.account_id.toString())}
      className="bg-[#1e1e1e] p-4 mx-4 mb-3 rounded-xl flex-row items-center active:bg-zinc-800"
    >
      <Image 
        source={{ uri: item.avatarfull }} 
        className="w-12 h-12 rounded-full border border-zinc-700 mr-4"
      />
      <View className="flex-1">
        <Text className="text-white font-bold text-lg" numberOfLines={1}>{item.personaname}</Text>
        <Text className="text-gray-500 text-xs">ID: {item.account_id}</Text>
        {item.last_match_time && (
          <Text className="text-gray-600 text-[10px] mt-1">
            Last match: {new Date(item.last_match_time).toLocaleDateString()}
          </Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={20} color="#4b5563" />
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gamingDark">
      {/* Search Header */}
      <View className="pt-12 px-6 pb-6 bg-[#1e1e1e] rounded-b-3xl shadow-lg">
        <View className="flex-row items-center mb-6">
          <Text className="text-2xl text-white font-bold">Search Players</Text>
        </View>

        <View className="flex-row items-center bg-[#2a2a2a] px-4 py-2 rounded-xl border border-zinc-800">
          <Ionicons name="search" size={20} color="#9ca3af" />
          <TextInput 
            className="flex-1 text-white ml-3 py-2"
            placeholder="Search by name or Steam ID..."
            placeholderTextColor="#6b7280"
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={20} color="#6b7280" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity 
          onPress={handleSearch}
          className="bg-gamingAccent mt-4 py-3 rounded-xl items-center shadow-md active:opacity-90"
        >
          <Text className="text-white font-bold">Search</Text>
        </TouchableOpacity>
      </View>

      {/* Search Results */}
      {searching ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#8b5cf6" />
          <Text className="text-gray-400 mt-4">Searching OpenDota database...</Text>
        </View>
      ) : error ? (
        <View className="flex-1 justify-center items-center px-10">
          <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
          <Text className="text-red-500 text-center mt-4 font-semibold text-lg">Search Error</Text>
          <Text className="text-gray-400 text-center mt-2">{error}</Text>
          <TouchableOpacity onPress={handleSearch} className="mt-6 bg-zinc-800 px-6 py-2 rounded-lg">
            <Text className="text-white font-bold">Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : results.length > 0 ? (
        <FlatList
          data={results}
          keyExtractor={(item) => item.account_id.toString()}
          renderItem={renderResult}
          contentContainerStyle={{ paddingTop: 20, paddingBottom: 40 }}
        />
      ) : (
        <View className="flex-1 justify-center items-center px-10">
          <Ionicons name="search-outline" size={64} color="#374151" />
          <Text className="text-gray-400 text-center mt-4 font-semibold text-lg">Who are you looking for?</Text>
        </View>
      )}

      {/* Modal Stack Rendering */}
      {modalStack.map((item, index) => (
        <DrillDownModal 
          key={`${item.type}-${item.id}-${index}`}
          item={item}
          onClose={popStack}
          onPushPlayer={pushPlayer}
          onPushMatch={pushMatch}
          zIndex={index + 100}
        />
      ))}
    </View>
  );
}

/**
 * A self-contained modal that handles its own data fetching and rendering
 * based on whether it's a Player or a Match.
 */
function DrillDownModal({ item, onClose, onPushPlayer, onPushMatch, zIndex }: { 
  item: StackItem; 
  onClose: () => void; 
  onPushPlayer: (id: string) => void;
  onPushMatch: (id: number) => void;
  zIndex: number;
}) {
  const [loading, setLoading] = useState(true);
  const [playerData, setPlayerData] = useState<{ profile: PlayerProfile | null; wl: WinLossStats | null; matches: RecentMatch[] } | null>(null);
  const [matchData, setMatchData] = useState<MatchDetails | null>(null);
  const [activeTab, setActiveTab] = useState<MatchTab>('Scoreboard');

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        if (item.type === 'player') {
          const [pProfile, pWL, pMatches] = await Promise.all([
            getPlayerProfile(item.id),
            getPlayerWinLoss(item.id),
            getRecentMatches(item.id, 10)
          ]);
          setPlayerData({ profile: pProfile, wl: pWL, matches: pMatches });
        } else {
          const details = await getMatchDetails(item.id);
          setMatchData(details);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [item.id, item.type]);

  const getHighlights = (match: MatchDetails) => {
    const topDamage = [...match.players].sort((a, b) => b.hero_damage - a.hero_damage)[0];
    const topNetWorth = [...match.players].sort((a, b) => b.net_worth - a.net_worth)[0];
    const topTowers = [...match.players].sort((a, b) => b.tower_damage - a.tower_damage)[0];
    const topHealing = [...match.players].sort((a, b) => b.hero_healing - a.hero_healing)[0];
    return { topDamage, topNetWorth, topTowers, topHealing };
  };

  const renderPlayerRow = (p: MatchDetails['players'][0], index: number) => {
    const isAnonymous = !p.account_id;
    const mainItems = [p.item_0, p.item_1, p.item_2, p.item_3, p.item_4, p.item_5];

    return (
      <TouchableOpacity 
        key={index} 
        onPress={() => !isAnonymous && onPushPlayer(p.account_id!.toString())}
        disabled={isAnonymous}
        className="py-3 border-b border-zinc-800 active:bg-zinc-700"
      >
        <View className="flex-row items-center px-1">
          <View className="w-12 items-center">
            <Image source={{ uri: getHeroImageUrl(p.hero_id) }} className="w-10 h-7 rounded-sm shadow-sm" resizeMode="cover" />
            <Text className="text-gray-500 text-[8px] mt-1">LVL {p.level}</Text>
          </View>
          <View className="flex-1 ml-2">
            <Text className="text-xs font-bold text-white" numberOfLines={1}>{p.personaname || 'Anonymous'}</Text>
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
          </View>
          <View className="w-3">
            {!isAnonymous && <Ionicons name="chevron-forward" size={10} color="#4b5563" />}
          </View>
        </View>
        {/* Items Row */}
        <View className="flex-row items-center ml-14 mt-2">
          <View className="flex-row items-center bg-black/20 p-1 rounded-md border border-white/5">
            <View className="flex-row">
              {mainItems.map((itemId, i) => (itemId > 0 || i < 6) && (
                <Image key={i} source={{ uri: getItemImageUrl(itemId) }} className="w-7 h-5 mr-1 rounded-[1px] bg-zinc-900/50" resizeMode="cover" />
              ))}
            </View>
            <View className="ml-1 border-l border-zinc-700 pl-2">
              <Image source={{ uri: getItemImageUrl(p.item_neutral) }} className="w-6 h-5 rounded-full bg-zinc-900 border border-zinc-600" resizeMode="cover" />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal animationType="slide" transparent={true} visible={true} onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/60 justify-end" onPress={onClose}>
        <Pressable className="bg-[#1e1e1e] h-[92%] rounded-t-3xl overflow-hidden" onPress={(e) => e.stopPropagation()}>
          {loading ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#8b5cf6" />
              <Text className="text-gray-400 mt-4">Fetching data...</Text>
            </View>
          ) : item.type === 'player' && playerData ? (
            <View className="flex-1">
              {/* Player Header */}
              <View className="flex-row justify-between items-start p-6 border-b border-zinc-800">
                <View className="flex-row items-center">
                  <Image source={{ uri: playerData.profile?.profile.avatarfull }} className="w-16 h-16 rounded-full border-2 border-gamingAccent" />
                  <View className="ml-4">
                    <Text className="text-white text-xl font-bold" numberOfLines={1}>{playerData.profile?.profile.personaname}</Text>
                    <Text className="text-gray-500 text-xs">ID: {playerData.profile?.profile.account_id}</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={onClose}><Ionicons name="close" size={28} color="white" /></TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} className="p-6">
                <View className="flex-row justify-between bg-zinc-900 p-4 rounded-xl mb-6">
                  <View className="items-center"><Text className="text-gray-500 text-[10px] font-bold uppercase">Wins</Text><Text className="text-win text-lg font-bold">{playerData.wl?.win}</Text></View>
                  <View className="items-center"><Text className="text-gray-500 text-[10px] font-bold uppercase">Losses</Text><Text className="text-loss text-lg font-bold">{playerData.wl?.lose}</Text></View>
                  <View className="items-center">
                    <Text className="text-gray-500 text-[10px] font-bold uppercase">Win Rate</Text>
                    <Text className="text-white text-lg font-bold">
                      {playerData.wl && (playerData.wl.win + playerData.wl.lose > 0) ? Math.round((playerData.wl.win / (playerData.wl.win + playerData.wl.lose)) * 100) : 0}%
                    </Text>
                  </View>
                </View>

                <Text className="text-gray-400 uppercase tracking-widest text-[10px] font-bold mb-3 pl-1">Recent Matches</Text>
                {playerData.matches.map((m, idx) => {
                  const mWin = (m.player_slot < 128 && m.radiant_win) || (m.player_slot >= 128 && !m.radiant_win);
                  return (
                    <TouchableOpacity key={idx} onPress={() => onPushMatch(m.match_id)} className="bg-zinc-800/50 p-3 rounded-xl mb-2 flex-row justify-between items-center border-l-2 border-zinc-700 active:bg-zinc-700">
                      <View>
                        <Text className={`text-xs font-bold ${mWin ? 'text-win' : 'text-loss'}`}>{mWin ? 'WIN' : 'LOSS'}</Text>
                        <Text className="text-gray-400 text-[10px]">KDA: {m.kills}/{m.deaths}/{m.assists} • {Math.floor(m.duration/60)}m</Text>
                      </View>
                      <View className="items-end">
                        <Text className="text-gray-500 text-[10px]">{new Date(m.start_time * 1000).toLocaleDateString()}</Text>
                        <Ionicons name="chevron-forward" size={12} color="#4b5563" />
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          ) : item.type === 'match' && matchData ? (
            <View className="flex-1">
              {/* Match Header */}
              <View className="flex-row justify-between items-center p-4 border-b border-zinc-800">
                <View>
                  <Text className="text-white text-xl font-bold">Match Overview</Text>
                  <Text className="text-gray-500 text-[10px]">{GAME_MODES[matchData.game_mode] || 'Standard'} • ID: {matchData.match_id}</Text>
                </View>
                <TouchableOpacity onPress={onClose}><Ionicons name="close" size={28} color="white" /></TouchableOpacity>
              </View>

              <View className="bg-[#2a2a2a] p-4 flex-row justify-around items-center border-b border-zinc-800">
                <View className="items-center"><Text className="text-win font-bold text-3xl">{matchData.radiant_score}</Text><Text className="text-win text-[10px] font-bold">RADIANT</Text></View>
                <View className="items-center">
                  <Text className="text-white text-xs font-bold">{Math.floor(matchData.duration / 60)}:{String(matchData.duration % 60).padStart(2, '0')}</Text>
                  <Text className={`text-[10px] font-bold mt-1 ${matchData.radiant_win ? 'text-win' : 'text-loss'}`}>{matchData.radiant_win ? 'RADIANT WIN' : 'DIRE WIN'}</Text>
                </View>
                <View className="items-center"><Text className="text-loss font-bold text-3xl">{matchData.dire_score}</Text><Text className="text-loss text-[10px] font-bold">DIRE</Text></View>
              </View>

              <View className="flex-row bg-[#1e1e1e] border-b border-zinc-800">
                {(['Scoreboard', 'Highlights', 'Economy'] as MatchTab[]).map((tab) => (
                  <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)} className={`flex-1 py-3 items-center border-b-2 ${activeTab === tab ? 'border-gamingAccent' : 'border-transparent'}`}>
                    <Text className={`text-[11px] font-bold ${activeTab === tab ? 'text-white' : 'text-gray-500'}`}>{tab.toUpperCase()}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <ScrollView showsVerticalScrollIndicator={false} className="p-4">
                {activeTab === 'Scoreboard' && (
                  <>
                    <View className="mb-6">
                      <Text className="text-win font-bold uppercase text-[10px] mb-2 pl-1 tracking-widest">Radiant Team</Text>
                      <View className="bg-[#222] rounded-xl overflow-hidden border border-zinc-800 shadow-sm">
                        {matchData.players.filter(p => p.player_slot < 128).map((p, i) => renderPlayerRow(p, i))}
                      </View>
                    </View>
                    <View className="mb-6">
                      <Text className="text-loss font-bold uppercase text-[10px] mb-2 pl-1 tracking-widest">Dire Team</Text>
                      <View className="bg-[#222] rounded-xl overflow-hidden border border-zinc-800 shadow-sm">
                        {matchData.players.filter(p => p.player_slot >= 128).map((p, i) => renderPlayerRow(p, i))}
                      </View>
                    </View>
                  </>
                )}
                
                {activeTab === 'Highlights' && (
                  <View>
                    {(() => {
                      const h = getHighlights(matchData);
                      return (
                        <>
                          <View className="bg-[#2a2a2a] p-4 rounded-xl mb-3 flex-row items-center border border-red-900/20">
                            <Ionicons name="flame" size={24} color="#ef4444" className="mr-4" />
                            <View className="flex-1">
                              <Text className="text-red-500 text-[10px] font-bold uppercase">Top Hero Damage</Text>
                              <Text className="text-white font-bold">{h.topDamage.personaname || 'Anonymous'}</Text>
                            </View>
                          </View>
                          <View className="bg-[#2a2a2a] p-4 rounded-xl mb-3 flex-row items-center border border-yellow-900/20">
                            <Ionicons name="cash" size={24} color="#eab308" className="mr-4" />
                            <View className="flex-1">
                              <Text className="text-yellow-500 text-[10px] font-bold uppercase">Highest Net Worth</Text>
                              <Text className="text-white font-bold">{h.topNetWorth.personaname || 'Anonymous'}</Text>
                            </View>
                          </View>
                        </>
                      );
                    })()}
                  </View>
                )}

                {activeTab === 'Economy' && (
                  <View className="bg-[#2a2a2a] p-4 rounded-xl border border-zinc-800">
                    <Text className="text-white font-bold mb-4 text-center">Match Trends</Text>
                    {matchData.radiant_gold_adv && (
                      <LineChart
                        data={{
                          labels: matchData.radiant_gold_adv.map((_, index) => index % 10 === 0 ? `${index}` : ''),
                          datasets: [{ data: matchData.radiant_gold_adv }]
                        }}
                        width={300} height={180}
                        chartConfig={{ backgroundColor: "#1e1e1e", backgroundGradientFrom: "#2a2a2a", backgroundGradientTo: "#2a2a2a", color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})` }}
                        bezier style={{ marginVertical: 8, borderRadius: 16 }}
                      />
                    )}
                  </View>
                )}
                <View className="h-20" />
              </ScrollView>
            </View>
          ) : (
            <View className="flex-1 justify-center items-center"><Text className="text-red-500">Failed to load data.</Text><TouchableOpacity onPress={onClose} className="mt-4 bg-zinc-800 px-6 py-2 rounded-lg"><Text className="text-white font-bold">Close</Text></TouchableOpacity></View>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
