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
import { useSteamAuth } from '../../src/hooks/useSteamAuth';
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
  LANE_ROLES,
  HERO_NAME_TO_ID
} from '../../src/services/constants';
import { RankBadge } from '../../src/components/RankBadge';
import { MatchOverviewModal } from '../../src/components/MatchOverviewModal';
import { PlayerOverviewContent } from '../../src/components/PlayerOverviewContent';

type MatchTab = 'Scoreboard' | 'Highlights' | 'Combat' | 'Economy';
type StackItem = 
  | { type: 'player', id: number | string; data?: { profile: PlayerProfile | null; wl: WinLossStats | null; matches: RecentMatch[] } }
  | { type: 'match', id: number; data?: MatchDetails | null };

export default function SearchScreen() {
  const router = useRouter();
  const { accountId } = useSteamAuth();
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

  const pushPlayer = (accountId: number | string) => {
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
      onPress={() => pushPlayer(item.account_id)}
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
      <View className="pt-2 px-6 pb-6 bg-[#1e1e2e] rounded-b-3xl shadow-lg">
        <View className="flex-row items-center mb-6">
          {!accountId && (
            <TouchableOpacity 
              onPress={() => router.push('/')}
              className="mr-3 p-1 rounded-full bg-zinc-800"
            >
              <Ionicons name="chevron-back" size={24} color="white" />
            </TouchableOpacity>
          )}
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
  onPushPlayer: (id: number | string) => void;
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

  return (
    <>
      <Modal animationType="slide" transparent={true} visible={item.type === 'player'} onRequestClose={onClose}>
        <Pressable className="flex-1 bg-black/60 justify-end" onPress={onClose}>
          <Pressable className="bg-[#1e1e1e] h-[92%] rounded-t-3xl overflow-hidden" onPress={(e) => e.stopPropagation()}>
            {loading ? (
              <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#8b5cf6" />
                <Text className="text-gray-400 mt-4">Fetching player data...</Text>
              </View>
            ) : item.type === 'player' && playerData ? (
              <View className="flex-1">
                <View className="p-4 border-b border-zinc-800 flex-row justify-between items-center bg-[#1e1e1e]">
                   <Text className="text-white font-bold ml-2">Player Details</Text>
                   <TouchableOpacity onPress={onClose} className="p-2">
                     <Ionicons name="close" size={28} color="white" />
                   </TouchableOpacity>
                </View>
                <PlayerOverviewContent
                  accountId={item.id}
                  profile={playerData.profile}
                  wl={playerData.wl}
                  matches={playerData.matches}
                  onMatchPress={(matchId) => onPushMatch(matchId)}
                />
              </View>
            ) : (
              <View className="flex-1 justify-center items-center"><Text className="text-red-500">Failed to load data.</Text><TouchableOpacity onPress={onClose} className="mt-4 bg-zinc-800 px-6 py-2 rounded-lg"><Text className="text-white font-bold">Close</Text></TouchableOpacity></View>
            )}
          </Pressable>
        </Pressable>
      </Modal>

      {item.type === 'match' && (
        <MatchOverviewModal
          visible={true}
          matchId={item.id as number}
          onClose={onClose}
          onPushPlayer={onPushPlayer}
        />
      )}
    </>
  );
}
