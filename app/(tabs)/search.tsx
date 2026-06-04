import React, { useState, useRef } from 'react';
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
} from '../../src/services/types';
import { useMenu } from './_layout';
import { getHeroImageUrl } from '../../src/services/constants';
import { trackScreenView, trackOpenDotaPlayerSearch, getRecentSearches } from '../../src/services/analytics';
import { useQueryClient } from '@tanstack/react-query';
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
  const { accountId: steamLocalAccountId } = useSteamAuth();
  const { setMenuVisible } = useMenu();
  const [query, setQuery] = useState(q || '');
  const [activeQuery, setActiveQuery] = useState(q || '');
  const [searchMode, setSearchMode] = useState<'global' | 'steam'>('global');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isHistoryVisible, setIsHistoryVisible] = useState(false);

  const steamAccountIdToUse = steamAccountId ?? steamLocalAccountId;
  const steamNotLinked = !steamAccountId && !steamLocalAccountId;
  const { data: globalResults = [], isLoading: searchingGlobal, error } = useSearchPlayers(activeQuery);
  const { data: peers, isLoading: loadingPeers } = usePlayerPeers(searchMode === 'steam' ? steamAccountIdToUse : null);
  const peersArr: Peer[] = React.useMemo(() => {
    if (!peers || !Array.isArray(peers)) return [] as Peer[];
    return peers as Peer[];
  }, [peers]);
  const queryClient = useQueryClient();
  const { data: heroesData = [] } = useHeroStats();
  const { sendFriendRequest, followUser, unfollowUser, isFollowing, isFriend } = useFriends();
  // Cross-reference with app users
  const [appUsersMap, setAppUsersMap] = useState<Record<number, string>>({});

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

  const steamFriendsResults = React.useMemo(() => {
    if (searchMode !== 'steam') return [];
    const formatted = peersArr.map((p: Peer) => ({
      account_id: p.account_id,
      personaname: p.personaname,
      avatarfull: p.avatar,
      win: p.with_win,
      games: p.with_games,
      against_win: p.against_win,
      against_games: p.against_games,
    }));

    if (!query.trim()) return formatted;
    const qLower = query.toLowerCase();
    return formatted.filter(p => p.personaname.toLowerCase().includes(qLower));
  }, [peersArr, query, searchMode]);

  const results = searchMode === 'global' ? globalResults : steamFriendsResults;
  const searching = searchMode === 'global' ? searchingGlobal : loadingPeers;

  // Force-refetch persisted/possibly-cached peers when switching to Steam mode
  React.useEffect(() => {
    if (searchMode !== 'steam' || !steamAccountIdToUse) return;
    queryClient.invalidateQueries({ queryKey: ['playerPeersV2', steamAccountIdToUse], refetchType: 'all' });
  }, [searchMode, steamAccountIdToUse, queryClient]);

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
        setIsHistoryVisible(false);
      };
    }, [])
  );

  React.useEffect(() => {
    trackScreenView('search');
  }, []);

  React.useEffect(() => {
    if (activeQuery && !searchingGlobal && globalResults) {
      trackOpenDotaPlayerSearch(activeQuery, globalResults.length);
    }
  }, [globalResults, searchingGlobal, activeQuery]);

  React.useEffect(() => {
    async function checkAppUsers() {
      const sourceResults = (searchMode === 'global' ? globalResults : peersArr) as Array<{ account_id: number }>;
      if (!sourceResults || sourceResults.length === 0) return;

      const accountIds = sourceResults.map((r) => r.account_id.toString());
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
      } else if (error) {
        console.error('checkAppUsers error:', error);
      }
    }
    checkAppUsers();
  }, [globalResults, peersArr, searchMode]);

  const handleSearch = (searchQuery: string = query) => {
    if (!searchQuery.trim()) return;
    setActiveQuery(searchQuery);
    setIsHistoryVisible(false);
  };

  const loadRecentSearches = async () => {
    const searches = await getRecentSearches(5);
    setRecentSearches(searches);
    setIsHistoryVisible(true);
  };

  const renderResult = ({ item, index }: { item: any, index: number }) => {
    const appUserId = appUsersMap[item.account_id];
    const following = isFollowing(item.account_id.toString());
    const friend = appUserId ? isFriend(appUserId) : false;
    
    // Calculate win rates for peers
    const hasPeerStats = item.games > 0 || item.against_games > 0;
    const winRateWith = item.games > 0 ? (item.win / item.games) * 100 : 0;
    const winRateAgainst = item.against_games > 0 ? (item.against_win / item.against_games) * 100 : 0;

    return (
      <PressableScale onPress={() => router.push(`/profile/${item.account_id}`)}>
        <Animated.View entering={FadeInDown.delay(Math.min(index, 8) * 50).springify()}>
          <View className="bg-[#1e1e1e] p-4 mx-4 mb-3 rounded-xl border border-zinc-800 shadow-sm">
            <View className="flex-row items-center">
              <Image
                source={{ uri: item.avatarfull }}
                className="w-12 h-12 rounded-full border border-zinc-700 mr-4"
              />
              <View className="flex-1">
                <View className="flex-row items-center flex-wrap gap-x-2">
                  <Text className="text-white font-outfit-bold text-lg" numberOfLines={1}>{item.personaname}</Text>
                  {item.isPro && (
                    <View className="bg-gamingAccent px-1.5 py-0.5 rounded flex-row items-center">
                      <Ionicons name="star" size={8} color="white" />
                      <Text className="text-white text-[8px] font-black ml-1 uppercase">
                        PRO {item.team_tag ? `| ${item.team_tag}` : ''}
                      </Text>
                    </View>
                  )}
                  {(item.isAppUser || appUserId) && !item.isPro && (
                    <View className="bg-green-500/20 border border-green-500/30 px-1.5 py-0.5 rounded flex-row items-center">
                      <Ionicons name="checkmark-circle" size={8} color="#22c55e" />
                      <Text className="text-green-500 text-[8px] font-black ml-1 uppercase">App User</Text>
                    </View>
                  )}
                </View>
                <Text className="text-gray-500 text-xs font-outfit">ID: {item.account_id}</Text>
                
                {hasPeerStats && (
                  <View className="flex-row items-center mt-1 flex-wrap">
                    {item.games > 0 && (
                      <View className="bg-blue-500/10 px-1.5 py-0.5 rounded mr-2 mb-1 flex-row items-center border border-blue-500/20">
                        <Text className="text-blue-400 text-[9px] font-bold uppercase tracking-tighter">
                          With You: {winRateWith.toFixed(0)}% WR ({item.games}g)
                        </Text>
                      </View>
                    )}
                    {item.against_games > 0 && (
                      <View className="bg-orange-500/10 px-1.5 py-0.5 rounded mb-1 flex-row items-center border border-orange-500/20">
                        <Text className="text-orange-400 text-[9px] font-bold uppercase tracking-tighter">
                          Against You: {winRateAgainst.toFixed(0)}% WR ({item.against_games}g)
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                {item.last_match_time && !hasPeerStats && (
                  <Text className="text-gray-600 text-[10px] font-outfit mt-1">
                    Last match: {new Date(item.last_match_time).toLocaleDateString()}
                  </Text>
                )}
              </View>
              
              <Ionicons name="chevron-forward" size={20} color="#4b5563" />
            </View>

            {steamAccountId !== item.account_id.toString() && (
              <View className="flex-row items-center mt-3 border-t border-zinc-800/50 pt-3">
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
                  onFocus={() => loadRecentSearches()}
                  onSubmitEditing={searchMode === 'global' ? () => handleSearch() : undefined}
                  returnKeyType={searchMode === 'global' ? "search" : "done"}
                  autoCorrect={false}
                />

                {query.length > 0 && (
                  <TouchableOpacity onPress={() => {
                    setQuery('');
                    setActiveQuery('');
                  }} style={{ padding: 8 }}>
                    <Ionicons name="close-circle" size={20} color="#6b7280" />
                  </TouchableOpacity>
                )}

                {searchMode === 'global' && (
                  <TouchableOpacity
                    onPress={() => handleSearch()}
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

              {isHistoryVisible && recentSearches.length > 0 && searchMode === 'global' && (
                <View style={{
                  backgroundColor: '#1E1E2E',
                  borderRadius: 12,
                  marginBottom: 16,
                  padding: 8
                }}>
                  <Text style={{ color: '#6b7280', fontSize: 10, fontFamily: 'Outfit_800ExtraBold', textTransform: 'uppercase', marginBottom: 8, paddingHorizontal: 8 }}>Recent Searches</Text>
                  {recentSearches.map((item, index) => (
                    <TouchableOpacity 
                      key={index}
                      onPress={() => {
                        setQuery(item);
                        handleSearch(item);
                      }}
                      style={{ flexDirection: 'row', alignItems: 'center', padding: 8 }}
                    >
                      <Ionicons name="time-outline" size={16} color="#6b7280" />
                      <Text style={{ color: '#fff', fontFamily: 'Outfit_400Regular', marginLeft: 8 }}>{item}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

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
                  <View style={{ flex: 1 }}>
                    <Text style={{
                      color: '#bfdbfe',
                      fontSize: 12,
                      fontFamily: 'Outfit_600SemiBold',
                      marginLeft: 12,
                    }}>
                      Displays your network of frequent teammates and opponents calculated from your public match history. This naturally includes your Steam friends as well as random players you often queue with.
                    </Text>
                  </View>
                </View>
              )}

              {!results.length && !searching && !matchingHeroes.length && !matchingMatchId && !isHistoryVisible && (
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
                      : (steamNotLinked ? "Steam Not Linked" : "No Friends Found")}
                  </Text>
                  <Text style={{ color: '#6b7280', textAlign: 'center', marginTop: 8, fontFamily: 'Outfit_400Regular' }}>
                    {searchMode === 'global'
                      ? "Search for players by name or Steam ID."
                      : (steamNotLinked ? "Link your Steam account to find your frequent teammates here." : "We've matched your Steam frequent teammates with our users.")}
                  </Text>
                  {steamNotLinked && searchMode === 'steam' && (
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
                      onPress={() => router.push(`/hero/${hero.id}`)} 
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
                    onPress={() => router.push(`/match/${matchingMatchId}`)}
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
                <PressableScale onPress={() => handleSearch()} className="mt-6 bg-zinc-800 px-6 py-2 rounded-lg">
                  <Text className="text-white font-bold">Try Again</Text>
                </PressableScale>
             </View>
          </View>
        )}
      </View>
    </LinearGradient>
  );
}
