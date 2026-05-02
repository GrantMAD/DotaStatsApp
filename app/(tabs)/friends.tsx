import React, { useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFriends, Follow } from '../../src/hooks/useFriends';
import GlassHeader from '../../src/components/GlassHeader';
import PlayerDetailModal from '../../src/components/PlayerDetailModal';
import { MatchOverviewModal } from '../../src/components/MatchOverviewModal';
import NotificationBell from '../../src/components/NotificationBell';
import { useMenu } from './_layout';
import { useSupabaseAuth } from '../../src/context/SupabaseAuthContext';
import UserListItem from '../../src/components/UserListItem';
import { useModals } from '../../src/context/ModalContext';
import { useRouter } from 'expo-router';

type TabType = 'Friends' | 'Following';

export default function FriendsScreen() {
  const { setMenuVisible } = useMenu();
  const { pushModal } = useModals();
  const router = useRouter();
  const { steamAccountId, session } = useSupabaseAuth();
  const { friends, following, loading, fetchFriends, unfollowUser } = useFriends();
  const [activeTab, setActiveTab] = useState<TabType>('Friends');
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredFriends = friends.filter(friend => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const name = friend.users?.steam_name?.toLowerCase() || '';
    const id = friend.users?.steam_account_id?.toString() || '';
    return name.includes(q) || id.includes(q);
  });

  const filteredFollowing = following.filter(follow => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const id = follow.followed_steam_id.toString();
    return id.includes(q);
  });

  const openPlayerDetails = (accountId: string) => {
    pushModal('player', accountId);
  };

  const openMatchById = (matchId: number) => {
    pushModal('match', matchId);
  };

  const renderFriend = ({ item, index }: { item: any; index: number }) => {
    const friendUser = item.users;
    if (!friendUser) return null;

    return (
      <UserListItem 
        user={friendUser} 
        index={index} 
        onPress={() => openPlayerDetails(friendUser.steam_account_id)} 
        rightComponent={
          steamAccountId && steamAccountId !== friendUser.steam_account_id ? (
            <TouchableOpacity 
              onPress={() => router.push(`/compare?p1=${steamAccountId}&p2=${friendUser.steam_account_id}`)}
              className="bg-purple-500/10 px-3 py-1.5 rounded-lg border border-purple-500/20 mr-2"
            >
              <Ionicons name="git-compare-outline" size={16} color="#c084fc" />
            </TouchableOpacity>
          ) : undefined
        }
      />
    );
  };

  const renderFollowing = ({ item, index }: { item: Follow; index: number }) => {
    return (
      <UserListItem 
        user={{
          id: item.id,
          steam_account_id: item.followed_steam_id,
          steam_name: '' // UserListItem will fetch profile data anyway
        }} 
        index={index} 
        onPress={() => openPlayerDetails(item.followed_steam_id)}
        rightComponent={
          <View className="flex-row items-center">
            {steamAccountId && steamAccountId !== item.followed_steam_id && (
              <TouchableOpacity 
                onPress={() => router.push(`/compare?p1=${steamAccountId}&p2=${item.followed_steam_id}`)}
                className="bg-purple-500/10 px-3 py-1.5 rounded-lg border border-purple-500/20 mr-2"
              >
                <Ionicons name="git-compare-outline" size={16} color="#c084fc" />
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              onPress={() => unfollowUser(item.followed_steam_id)}
              className="bg-zinc-800 px-3 py-1.5 rounded-lg mr-2"
            >
              <Text className="text-gray-300 text-xs font-outfit-bold">Unfollow</Text>
            </TouchableOpacity>
          </View>
        }
      />
    );
  };

  return (
    <LinearGradient colors={['#1a1a2e', '#121212']} style={{ flex: 1 }}>
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
        <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 }}>
          <Text style={{ color: '#fff', fontSize: 28, fontFamily: 'Outfit_900Black', marginBottom: 4 }}>
            Community
          </Text>
          <Text style={{ color: '#9ca3af', fontSize: 14, fontFamily: 'Outfit_400Regular' }}>
            Manage your friends and followed players.
          </Text>
        </View>

        {/* Search Bar */}
        <View className="px-5 mt-4">
          <View className="flex-row items-center bg-[#1e1e2e] rounded-xl px-4 py-3 border border-zinc-800">
            <Ionicons name="search" size={20} color="#4b5563" />
            <TextInput
              placeholder={activeTab === 'Friends' ? "Search by name or ID..." : "Search by ID..."}
              placeholderTextColor="#4b5563"
              className="flex-1 ml-3 text-white font-outfit"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color="#4b5563" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Tab Selector */}
        <View className="flex-row mx-5 mt-4 mb-2 bg-[#1e1e2e] p-1 rounded-xl border border-zinc-800">
          {(['Friends', 'Following'] as TabType[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => {
                setActiveTab(tab);
                setSearchQuery('');
              }}
              className={`flex-1 py-2.5 rounded-lg items-center ${activeTab === tab ? 'bg-gamingAccent' : ''}`}
            >
              <Text className={`font-outfit-bold text-sm ${activeTab === tab ? 'text-white' : 'text-gray-400'}`}>
                {tab.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#8b5cf6" />
          </View>
        ) : (
          <FlatList
            data={activeTab === 'Friends' ? filteredFriends : filteredFollowing}
            keyExtractor={(item) => item.id}
            renderItem={activeTab === 'Friends' ? renderFriend : renderFollowing}
            onRefresh={fetchFriends}
            refreshing={loading}
            contentContainerStyle={{ paddingTop: 12, paddingBottom: 40 }}
            ListEmptyComponent={
              <View className="flex-1 justify-center items-center py-20 px-10">
                <Ionicons 
                  name={searchQuery ? "search-outline" : (activeTab === 'Friends' ? "people-outline" : "person-add-outline")} 
                  size={64} 
                  color="#374151" 
                />
                <Text className="text-gray-400 text-center mt-4 font-outfit-semibold text-lg">
                  {searchQuery 
                    ? `No matches found for "${searchQuery}"`
                    : (activeTab === 'Friends' 
                        ? "No friends yet. Search for players to add them!" 
                        : "You aren't following anyone yet.")}
                </Text>
              </View>
            }
          />
        )}
      </View>
    </LinearGradient>
  );
}
