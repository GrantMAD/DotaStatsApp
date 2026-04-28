import React, { useState } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity, Image, ActivityIndicator,
  Modal, Pressable, StyleSheet
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSteamAuth } from '../../src/hooks/useSteamAuth';
import {
  SearchResult,
  Peer,
} from '../../src/services/opendota';
import { MatchOverviewModal } from '../../src/components/MatchOverviewModal';
import { PlayerOverviewContent } from '../../src/components/PlayerOverviewContent';
import { useSearchPlayers, usePlayerProfile, usePlayerWinLoss, useRecentMatches, usePlayerPeers } from '../../src/hooks/useOpenDota';
import { useFriends } from '../../src/hooks/useFriends';
import { supabase } from '../../src/services/supabase';
import { useSupabaseAuth } from '../../src/context/SupabaseAuthContext';
import Skeleton, { PlayerProfileSkeleton } from '../../src/components/Skeleton';
import PressableScale from '../../src/components/PressableScale';
import GlassHeader from '../../src/components/GlassHeader';
import GlassModal from '../../src/components/GlassModal';
import NotificationBell from '../../src/components/NotificationBell';
import { useMenu } from './_layout';


type StackItem =
  | { type: 'player', id: number | string }
  | { type: 'match', id: number };

function SearchSkeleton() {
  return (
    <View style={{ paddingVertical: 20 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <View key={i} style={{
          backgroundColor: '#1e1e2e',
          padding: 16,
          marginHorizontal: 16,
          marginBottom: 12,
          borderRadius: 12,
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: '#2a2a3e'
        }}>
          <Skeleton width={48} height={48} borderRadius={24} style={{ marginRight: 16 }} />
          <View style={{ flex: 1 }}>
             <Skeleton width="50%" height={18} borderRadius={4} style={{ marginBottom: 8 }} />
             <Skeleton width="30%" height={12} borderRadius={4} />
          </View>
          <Skeleton width={20} height={20} borderRadius={10} />
        </View>
      ))}
    </View>
  );
}

export default function SearchScreen() {
  const router = useRouter();
  const { accountId: steamAccountId } = useSteamAuth();
  const { user, session } = useSupabaseAuth();
  const { setMenuVisible } = useMenu();
  const [query, setQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [searchMode, setSearchMode] = useState<'global' | 'steam'>('global');

  const { data: globalResults = [], isLoading: searchingGlobal, error } = useSearchPlayers(activeQuery);
  const { data: peers = [], isLoading: loadingPeers } = usePlayerPeers(searchMode === 'steam' ? steamAccountId : null);
  const { sendFriendRequest, followUser, unfollowUser, isFollowing, isFriend } = useFriends();

  // Cross-reference with app users
  const [appUsersMap, setAppUsersMap] = useState<Record<number, string>>({});
  const [steamFriendsResults, setSteamFriendsResults] = useState<SearchResult[]>([]);

  const results = searchMode === 'global'
    ? globalResults
    : steamFriendsResults.filter(p => p.personaname.toLowerCase().includes(query.toLowerCase()));
  const searching = searchMode === 'global' ? searchingGlobal : loadingPeers;

  React.useEffect(() => {
    async function checkAppUsers() {
      const sourceResults = searchMode === 'global' ? globalResults : peers;
      if (!sourceResults.length) {
        if (searchMode === 'steam') setSteamFriendsResults([]);
        return;
      }

      const accountIds = sourceResults.map(r => r.account_id.toString());
      const { data, error } = await supabase
        .from('users')
        .select('id, steam_account_id')
        .in('steam_account_id', accountIds);

      if (data && !error) {
        const map: Record<number, string> = {};
        data.forEach(u => {
          map[Number(u.steam_account_id)] = u.id;
        });
        setAppUsersMap(map);

        if (searchMode === 'steam') {
          // Map ALL peers to SearchResult format (don't filter by map[p.account_id])
          const formatted = peers.map(p => ({
            account_id: p.account_id,
            personaname: p.personaname,
            avatarfull: p.avatar,
          }));
          setSteamFriendsResults(formatted);
        }
      } else if (error) {
        console.error('checkAppUsers error:', error);
      }
    }
    checkAppUsers();
  }, [globalResults, peers, searchMode]);

  // The Navigation Stack
  const [modalStack, setModalStack] = useState<StackItem[]>([]);

  const handleSearch = () => {
    if (!query.trim()) return;
    setActiveQuery(query);
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

  const renderResult = ({ item, index }: { item: SearchResult, index: number }) => {
    const appUserId = appUsersMap[item.account_id];
    const following = isFollowing(item.account_id.toString());
    const friend = appUserId ? isFriend(appUserId) : false;

    return (
      <PressableScale onPress={() => pushPlayer(item.account_id)}>
        <Animated.View entering={FadeInDown.delay(Math.min(index, 8) * 50).springify()}>
          <View className="bg-[#1e1e1e] p-4 mx-4 mb-3 rounded-xl flex-row items-center">
            <Image
              source={{ uri: item.avatarfull }}
              className="w-12 h-12 rounded-full border border-zinc-700 mr-4"
            />
            <View className="flex-1">
              <Text className="text-white font-outfit-bold text-lg" numberOfLines={1}>{item.personaname}</Text>
              <Text className="text-gray-500 text-xs font-outfit">ID: {item.account_id}</Text>
              {item.last_match_time && (
                <Text className="text-gray-600 text-[10px] font-outfit mt-1">
                  Last match: {new Date(item.last_match_time).toLocaleDateString()}
                </Text>
              )}

              {steamAccountId !== item.account_id.toString() && (
                <View className="flex-row items-center mt-3">
                  <TouchableOpacity
                    onPress={() => following ? unfollowUser(item.account_id.toString()) : followUser(item.account_id.toString())}
                    className={`${following ? 'bg-zinc-800' : 'bg-blue-600'} px-3 py-1.5 rounded-lg mr-2 flex-row items-center`}
                  >
                    <Ionicons name={following ? "checkmark" : "add"} size={14} color="white" />
                    <Text className="text-white text-xs font-outfit-bold ml-1">
                      {following ? 'Following' : 'Follow'}
                    </Text>
                  </TouchableOpacity>

                  {appUserId && user?.id !== appUserId && !friend && (
                    <TouchableOpacity
                      onPress={() => sendFriendRequest(appUserId)}
                      className="bg-gamingAccent px-3 py-1.5 rounded-lg flex-row items-center"
                    >
                      <Ionicons name="person-add" size={14} color="white" />
                      <Text className="text-white text-xs font-outfit-bold ml-1">Add Friend</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>

            <Ionicons name="chevron-forward" size={20} color="#4b5563" />
          </View>
        </Animated.View>
      </PressableScale>
    );
  };

  return (
    <LinearGradient
      colors={['#1a1a2e', '#121212']}
      style={{ flex: 1 }}
    >
      <GlassHeader
        leftComponent={
          session ? (
            <TouchableOpacity
              onPress={() => setMenuVisible(true)}
              style={{ padding: 8, marginLeft: -8 }}
            >
              <Ionicons name="menu" size={28} color="white" />
            </TouchableOpacity>
          ) : undefined
        }
        rightComponent={<NotificationBell />}
      />

      <View className="flex-1">
        <FlatList
          data={searching ? [] : results}
          keyExtractor={(item) => item.account_id.toString()}
          renderItem={renderResult}
          ListHeaderComponent={
            <View style={{ paddingTop: 8, paddingHorizontal: 20, paddingBottom: 24 }}>
              <Text style={{ color: '#fff', fontSize: 28, fontFamily: 'Outfit_900Black', marginBottom: 4 }}>
                Search
              </Text>
              <Text style={{ color: '#9ca3af', fontSize: 14, fontFamily: 'Outfit_400Regular', marginBottom: 16 }}>
                Find any Dota 2 player by their name or Steam ID.
              </Text>

              {steamAccountId && (
                <View className="flex-row mb-4 bg-[#1e1e1e] p-1 rounded-xl border border-zinc-800">
                  <TouchableOpacity
                    onPress={() => setSearchMode('global')}
                    className={`flex-1 py-2 rounded-lg items-center flex-row justify-center ${searchMode === 'global' ? 'bg-gamingAccent' : ''}`}
                  >
                    <Ionicons name="globe-outline" size={16} color={searchMode === 'global' ? "white" : "#9ca3af"} />
                    <Text className={`font-outfit-bold text-xs ml-2 ${searchMode === 'global' ? 'text-white' : 'text-gray-400'}`}>
                      GLOBAL
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setSearchMode('steam')}
                    className={`flex-1 py-2 rounded-lg items-center flex-row justify-center ${searchMode === 'steam' ? 'bg-gamingAccent' : ''}`}
                  >
                    <Ionicons name="logo-steam" size={16} color={searchMode === 'steam' ? "white" : "#9ca3af"} />
                    <Text className={`font-outfit-bold text-xs ml-2 ${searchMode === 'steam' ? 'text-white' : 'text-gray-400'}`}>
                      STEAM FRIENDS
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#2a2a2a',
                borderRadius: 14,
                borderWidth: 1,
                borderColor: '#3a3a4e',
                paddingLeft: 12,
                paddingRight: 6,
                paddingVertical: 6,
                marginBottom: searchMode === 'steam' ? 16 : 0
              }}>
                <Ionicons name="search" size={20} color="#9ca3af" />
                <TextInput
                  style={{
                    flex: 1,
                    color: '#fff',
                    marginLeft: 10,
                    paddingVertical: 8,
                    fontFamily: 'Outfit_400Regular',
                    fontSize: 16
                  }}
                  placeholder={searchMode === 'global' ? "Search by name or Steam ID..." : "Filter teammates by name..."}
                  placeholderTextColor="#6b7280"
                  value={query}
                  onChangeText={setQuery}
                  onSubmitEditing={searchMode === 'global' ? handleSearch : undefined}
                  returnKeyType={searchMode === 'global' ? "search" : "done"}
                  autoCorrect={false}
                />

                {query.length > 0 && (
                  <TouchableOpacity onPress={() => setQuery('')} style={{ padding: 8 }}>
                    <Ionicons name="close-circle" size={20} color="#6b7280" />
                  </TouchableOpacity>
                )}

                {searchMode === 'global' && (
                  <TouchableOpacity
                    onPress={handleSearch}
                    style={{
                      backgroundColor: '#8b5cf6',
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      marginLeft: 4,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Ionicons name="arrow-forward" size={20} color="#fff" />
                  </TouchableOpacity>
                )}
              </View>

              {searchMode === 'steam' && (
                <View className="bg-blue-900/20 p-4 rounded-xl border border-blue-500/30 flex-row items-center">
                  <Ionicons name="information-circle" size={24} color="#60a5fa" />
                  <Text className="text-blue-200 text-xs font-outfit-semibold ml-3 flex-1">
                    Showing players who have played with you and are registered on the app.
                  </Text>
                </View>
              )}

              {!results.length && !searching && (
                <View style={{ paddingVertical: 80, justifyContent: 'center', alignItems: 'center' }}>
                  <View style={{
                    width: 100,
                    height: 100,
                    borderRadius: 50,
                    backgroundColor: '#1a1a2e',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 20,
                  }}>
                    <Ionicons name={searchMode === 'global' ? "search-outline" : "people-outline"} size={48} color="#374151" />
                  </View>
                  <Text style={{ color: '#9ca3af', textAlign: 'center', fontFamily: 'Outfit_600SemiBold', fontSize: 18 }}>
                    {searchMode === 'global'
                      ? (activeQuery ? `No results found for "${activeQuery}"` : "Who are you looking for?")
                      : "No Steam friends found using the app."}
                  </Text>
                  <Text style={{ color: '#6b7280', textAlign: 'center', marginTop: 8, fontFamily: 'Outfit_400Regular' }}>
                    {searchMode === 'global'
                      ? "Search for players by name or Steam ID."
                      : "We've matched your Steam frequent teammates with our users."}
                  </Text>
                </View>
              )}
            </View>
          }
          ListFooterComponent={searching ? <SearchSkeleton /> : null}
          contentContainerStyle={{ paddingBottom: 40 }}
        />

        {error && (
          <View className="absolute inset-0 justify-center items-center px-10 bg-black/40">
             <View className="bg-[#1e1e1e] p-6 rounded-2xl border border-red-500/30 items-center">
                <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
                <Text className="text-red-500 text-center mt-4 font-semibold text-lg">Search Error</Text>
                <Text className="text-gray-400 text-center mt-2">{(error as any).message || 'An error occurred'}</Text>
                <PressableScale onPress={handleSearch} className="mt-6 bg-zinc-800 px-6 py-2 rounded-lg">
                  <Text className="text-white font-bold">Try Again</Text>
                </PressableScale>
             </View>
          </View>
        )}
      </View>

      {/* Modal Stack Rendering */}
      {modalStack.map((item, index) => (
        <DrillDownModal
          key={`${item.type}-${item.id}-${index}`}
          item={item}
          onClose={popStack}
          onPushPlayer={pushPlayer}
          onPushMatch={pushMatch}
        />
      ))}
    </LinearGradient>
  );
}

/**
 * A self-contained modal that handles its own data fetching via hooks
 */
function DrillDownModal({ item, onClose, onPushPlayer, onPushMatch }: {
  item: StackItem;
  onClose: () => void;
  onPushPlayer: (id: number | string) => void;
  onPushMatch: (id: number) => void;
}) {
  // Player Queries (only enabled if item.type === 'player')
  const { data: profile, isLoading: pProfileLoading } = usePlayerProfile(item.type === 'player' ? item.id : null);
  const { data: wl, isLoading: pWLLoading } = usePlayerWinLoss(item.type === 'player' ? item.id : null);
  const { data: matches = [], isLoading: pMatchesLoading } = useRecentMatches(item.type === 'player' ? item.id : null, 10);

  const loading = pProfileLoading || pWLLoading || pMatchesLoading;
  const isPrivate = profile && !profile.last_match_time;

  return (
    <>
      {item.type === 'player' && ( // Conditionally render GlassModal for player
        <GlassModal visible={true} onClose={onClose}>
          {loading ? (
            <PlayerProfileSkeleton />
          ) : ( // Loading is false, now check profile status
            profile ? ( // Profile data loaded successfully
              <View className="flex-1">
                <View className="p-4 border-b border-zinc-800 flex-row justify-between items-center bg-[#1e1e1e]">
                   <Text className="text-white font-outfit-bold ml-2">Player Details</Text>
                   <TouchableOpacity onPress={onClose} className="p-2">
                     <Ionicons name="close" size={28} color="white" />
                   </TouchableOpacity>
                </View>
                <PlayerOverviewContent
                  accountId={item.id}
                  profile={profile}
                  wl={wl || null}
                  matches={matches}
                  onMatchPress={(matchId) => onPushMatch(matchId)}
                  isPrivate={!!isPrivate}
                />
              </View>
            ) : ( // Profile data is null after loading, likely private or error
              <View className="flex-1 justify-center items-center px-6">
                <Ionicons name="eye-off-outline" size={48} color="#f97316" />
                <Text className="text-orange-500 text-center mt-4 font-bold text-lg">Profile Not Available</Text>
                <Text className="text-gray-400 text-center mt-2 font-outfit text-sm">
                  This player's profile data could not be loaded. They may have a private account or there was an issue fetching the details.
                </Text>
                <PressableScale onPress={onClose} className="mt-8 bg-zinc-800 px-6 py-2 rounded-lg">
                  <Text className="text-white font-outfit-bold">Close</Text>
                </PressableScale>
              </View>
            )
          )}
        </GlassModal>
      )}

      {item.type === 'match' && ( // Conditionally render MatchOverviewModal for match
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