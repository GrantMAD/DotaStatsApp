import React, { useState } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity, Image, ActivityIndicator,
  Modal, Pressable, StyleSheet
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useSteamAuth } from '../../src/hooks/useSteamAuth';
import { useSupabaseAuth } from '../../src/context/SupabaseAuthContext';
import { useSearchPlayers, usePlayerPeers, useHeroStats } from '../../src/hooks/useOpenDota';
import { useFriends } from '../../src/hooks/useFriends';
import { supabase } from '../../src/services/supabase';
import {
  SearchResult,
  Peer,
  HeroStats,
} from '../../src/services/opendota';
import { useMenu } from './_layout';
import { getHeroImageUrl } from '../../src/services/constants';
import { useModals } from '../../src/context/ModalContext';
import GlassHeader from '../../src/components/GlassHeader';
import NotificationBell from '../../src/components/NotificationBell';
import PressableScale from '../../src/components/PressableScale';
import Skeleton from '../../src/components/Skeleton';

function SearchSkeleton() {
  return (
    <View style={{ paddingVertical: 20 }}>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
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
  const { q } = useLocalSearchParams<{ q: string }>();
  const { user, session, steamAccountId } = useSupabaseAuth();
  const { setMenuVisible } = useMenu();
  const { pushModal } = useModals();
  const [query, setQuery] = useState(q || '');
  const [activeQuery, setActiveQuery] = useState(q || '');
  const [searchMode, setSearchMode] = useState<'global' | 'steam'>('global');

  const { data: globalResults = [], isLoading: searchingGlobal, error } = useSearchPlayers(activeQuery);
  const { data: peers = [], isLoading: loadingPeers } = usePlayerPeers(searchMode === 'steam' ? steamAccountId : null);
  const { data: heroesData = [] } = useHeroStats();
  const { sendFriendRequest, followUser, unfollowUser, isFollowing, isFriend } = useFriends();

  // Cross-reference with app users
  const [appUsersMap, setAppUsersMap] = useState<Record<number, string>>({});
  const [steamFriendsResults, setSteamFriendsResults] = useState<SearchResult[]>([]);

  // Hero & Match ID Results
  const matchingHeroes = React.useMemo(() => {
    if (!activeQuery || searchMode === 'steam') return [];
    const qLower = activeQuery.toLowerCase().trim();
    return heroesData.filter(h => h.localized_name.toLowerCase().includes(qLower)).slice(0, 5);
  }, [heroesData, activeQuery, searchMode]);

  const matchingMatchId = React.useMemo(() => {
    if (!activeQuery || searchMode === 'steam') return null;
    const isMatchId = /^\d+$/.test(activeQuery.trim());
    return isMatchId ? parseInt(activeQuery.trim()) : null;
  }, [activeQuery, searchMode]);

  const results = searchMode === 'global'
    ? globalResults
    : steamFriendsResults.filter(p => p.personaname.toLowerCase().includes(query.toLowerCase()));
  const searching = searchMode === 'global' ? searchingGlobal : loadingPeers;

  // Handle incoming query param
  React.useEffect(() => {
    if (q) {
      setQuery(q);
      setActiveQuery(q);
    }
  }, [q]);

  // Reset search when navigating away
  useFocusEffect(
    React.useCallback(() => {
      return () => {
        // This runs when the screen is blurred (navigated away)
        setQuery('');
        setActiveQuery('');
      };
    }, [])
  );

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

  const handleSearch = () => {
    if (!query.trim()) return;
    setActiveQuery(query);
  };

  const renderResult = ({ item, index }: { item: SearchResult, index: number }) => {
    const appUserId = appUsersMap[item.account_id];
    const following = isFollowing(item.account_id.toString());
    const friend = appUserId ? isFriend(appUserId) : false;

    return (
      <PressableScale onPress={() => pushModal('player', item.account_id)}>
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
                Find players, heroes, or match IDs from the archives.
              </Text>

              <View style={{
                flexDirection: 'row',
                marginBottom: 16,
                backgroundColor: '#1e1e1e',
                padding: 4,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: '#2a2a3e'
              }}>
                <TouchableOpacity
                  onPress={() => setSearchMode('global')}
                  style={{
                    flex: 1,
                    paddingVertical: 8,
                    borderRadius: 10,
                    alignItems: 'center',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    backgroundColor: searchMode === 'global' ? '#8b5cf6' : 'transparent'
                  }}
                >
                  <Ionicons name="globe-outline" size={16} color={searchMode === 'global' ? "white" : "#9ca3af"} />
                  <Text style={{
                    fontFamily: 'Outfit_700Bold',
                    fontSize: 12,
                    marginLeft: 8,
                    color: searchMode === 'global' ? 'white' : '#9ca3af'
                  }}>
                    GLOBAL
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setSearchMode('steam')}
                  style={{
                    flex: 1,
                    paddingVertical: 8,
                    borderRadius: 10,
                    alignItems: 'center',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    backgroundColor: searchMode === 'steam' ? '#8b5cf6' : 'transparent'
                  }}
                >
                  <Ionicons name="logo-steam" size={16} color={searchMode === 'steam' ? "white" : "#9ca3af"} />
                  <Text style={{
                    fontFamily: 'Outfit_700Bold',
                    fontSize: 12,
                    marginLeft: 8,
                    color: searchMode === 'steam' ? 'white' : '#9ca3af'
                  }}>
                    STEAM FRIENDS
                  </Text>
                </TouchableOpacity>
              </View>

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
                <View style={{
                  backgroundColor: 'rgba(30, 58, 138, 0.2)',
                  padding: 16,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: 'rgba(59, 130, 246, 0.3)',
                  flexDirection: 'row',
                  alignItems: 'center'
                }}>
                  <Ionicons name="information-circle" size={24} color="#60a5fa" />
                  <Text style={{
                    color: '#bfdbfe',
                    fontSize: 12,
                    fontFamily: 'Outfit_600SemiBold',
                    marginLeft: 12,
                    flex: 1
                  }}>
                    Showing players who have played with you and are registered on the app.
                  </Text>
                </View>
              )}

              {!results.length && !searching && !matchingHeroes.length && !matchingMatchId && (
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
                      : (!steamAccountId ? "Steam Not Linked" : "No Friends Found")}
                  </Text>
                  <Text style={{ color: '#6b7280', textAlign: 'center', marginTop: 8, fontFamily: 'Outfit_400Regular' }}>
                    {searchMode === 'global'
                      ? "Search for players by name or Steam ID."
                      : (!steamAccountId ? "Link your Steam account to find your frequent teammates here." : "We've matched your Steam frequent teammates with our users.")}
                  </Text>
                  {!steamAccountId && searchMode === 'steam' && (
                    <TouchableOpacity 
                      onPress={() => router.push('/profile')}
                      style={{
                        marginTop: 20,
                        backgroundColor: '#8b5cf6',
                        paddingHorizontal: 20,
                        paddingVertical: 10,
                        borderRadius: 10
                      }}
                    >
                      <Text style={{ color: 'white', fontFamily: 'Outfit_700Bold' }}>Go to Profile</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {/* Hero Results Section */}
              {matchingHeroes.length > 0 && searchMode === 'global' && (
                <View style={{ marginTop: 20 }}>
                  <Text style={{ color: '#8b5cf6', fontSize: 12, fontFamily: 'Outfit_800ExtraBold', marginBottom: 12, letterSpacing: 1 }}>
                    MATCHING HEROES
                  </Text>
                  {matchingHeroes.map(hero => (
                    <TouchableOpacity 
                      key={hero.id} 
                      onPress={() => pushModal('hero', hero.id)} 
                      style={{ 
                        flexDirection: 'row', 
                        alignItems: 'center', 
                        padding: 12,
                        backgroundColor: '#1E1E2E',
                        marginBottom: 8,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: '#2a2a3e'
                      }}
                    >
                      <Image 
                        source={{ uri: getHeroImageUrl(hero.id) }} 
                        style={{ width: 44, height: 26, borderRadius: 4, marginRight: 12 }}
                      />
                      <Text style={{ color: '#fff', fontSize: 16, fontFamily: 'Outfit_700Bold', flex: 1 }}>
                        {hero.localized_name}
                      </Text>
                      <Ionicons name="chevron-forward" size={16} color="#4b5563" />
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Match ID Section */}
              {matchingMatchId && searchMode === 'global' && (
                <View style={{ marginTop: 20 }}>
                  <Text style={{ color: '#3b82f6', fontSize: 12, fontFamily: 'Outfit_800ExtraBold', marginBottom: 12, letterSpacing: 1 }}>
                    MATCH ID
                  </Text>
                  <TouchableOpacity 
                    onPress={() => pushModal('match', matchingMatchId)}
                    style={{ 
                      flexDirection: 'row', 
                      alignItems: 'center', 
                      padding: 16,
                      backgroundColor: '#1E1E2E',
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: '#3b82f6'
                    }}
                  >
                    <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#111', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                      <Ionicons name="game-controller" size={18} color="#3b82f6" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: '#fff', fontSize: 16, fontFamily: 'Outfit_700Bold' }}>Match {matchingMatchId}</Text>
                      <Text style={{ color: '#3b82f6', fontSize: 10, fontFamily: 'Outfit_600SemiBold' }}>VIEW DETAILS</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#3b82f6" />
                  </TouchableOpacity>
                </View>
              )}

              {/* Players Header */}
              {results.length > 0 && (
                <Text style={{ color: '#22c55e', fontSize: 12, fontFamily: 'Outfit_800ExtraBold', marginTop: 24, marginBottom: 12, letterSpacing: 1 }}>
                  PLAYERS
                </Text>
              )}
            </View>
          }
          ListFooterComponent={searching && !matchingHeroes.length && !matchingMatchId ? <SearchSkeleton /> : null}
          contentContainerStyle={{ paddingBottom: 40 }}
        />

        {error && !matchingHeroes.length && !matchingMatchId && (
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
    </LinearGradient>
  );
  }