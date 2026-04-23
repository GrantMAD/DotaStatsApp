import React, { useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
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

type TabType = 'Friends' | 'Following';

export default function FriendsScreen() {
  const { session } = useSupabaseAuth();
  const { setMenuVisible } = useMenu();
  const { friends, following, loading, fetchFriends, unfollowUser } = useFriends();
  const [activeTab, setActiveTab] = useState<TabType>('Friends');
  
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [playerModalVisible, setPlayerModalVisible] = useState(false);
  
  const [selectedMatchId, setSelectedMatchId] = useState<number | null>(null);
  const [matchModalVisible, setMatchModalVisible] = useState(false);

  const openPlayerDetails = (accountId: string) => {
    setSelectedPlayerId(accountId);
    setPlayerModalVisible(true);
  };

  const openMatchById = (matchId: number) => {
    setSelectedMatchId(matchId);
    setMatchModalVisible(true);
  };

  const renderFriend = ({ item, index }: { item: any; index: number }) => {
    const friendUser = item.users;
    if (!friendUser) return null;

    return (
      <UserListItem 
        user={friendUser} 
        index={index} 
        onPress={() => openPlayerDetails(friendUser.steam_account_id)} 
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
          <TouchableOpacity 
            onPress={() => unfollowUser(item.followed_steam_id)}
            className="bg-zinc-800 px-3 py-1.5 rounded-lg mr-2"
          >
            <Text className="text-gray-300 text-xs font-outfit-bold">Unfollow</Text>
          </TouchableOpacity>
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

        {/* Tab Selector */}
        <View className="flex-row mx-5 mt-4 mb-2 bg-[#1e1e1e] p-1 rounded-xl border border-zinc-800">
          {(['Friends', 'Following'] as TabType[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
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
            data={activeTab === 'Friends' ? friends : following}
            keyExtractor={(item) => item.id}
            renderItem={activeTab === 'Friends' ? renderFriend : renderFollowing}
            onRefresh={fetchFriends}
            refreshing={loading}
            contentContainerStyle={{ paddingTop: 12, paddingBottom: 40 }}
            ListEmptyComponent={
              <View className="flex-1 justify-center items-center py-20 px-10">
                <Ionicons 
                  name={activeTab === 'Friends' ? "people-outline" : "person-add-outline"} 
                  size={64} 
                  color="#374151" 
                />
                <Text className="text-gray-400 text-center mt-4 font-outfit-semibold text-lg">
                  {activeTab === 'Friends' 
                    ? "No friends yet. Search for players to add them!" 
                    : "You aren't following anyone yet."}
                </Text>
              </View>
            }
          />
        )}
      </View>

      <PlayerDetailModal
        visible={playerModalVisible}
        accountId={selectedPlayerId}
        onClose={() => setPlayerModalVisible(false)}
        onMatchPress={(id) => {
          setPlayerModalVisible(false);
          openMatchById(id);
        }}
      />

      <MatchOverviewModal
        matchId={selectedMatchId}
        visible={matchModalVisible}
        onClose={() => setMatchModalVisible(false)}
        onPushPlayer={(id) => {
          setMatchModalVisible(false);
          openPlayerDetails(id.toString());
        }}
      />
    </LinearGradient>
  );
}
