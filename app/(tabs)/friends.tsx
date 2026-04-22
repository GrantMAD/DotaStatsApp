import React, { useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFriends } from '../../src/hooks/useFriends';
import GlassHeader from '../../src/components/GlassHeader';
import PressableScale from '../../src/components/PressableScale';
import Animated, { FadeInDown } from 'react-native-reanimated';
import PlayerDetailModal from '../../src/components/PlayerDetailModal';
import { MatchOverviewModal } from '../../src/components/MatchOverviewModal';
import NotificationBell from '../../src/components/NotificationBell';
import { useMenu } from './_layout';
import { useSupabaseAuth } from '../../src/context/SupabaseAuthContext';
import { usePlayerProfile } from '../../src/hooks/useOpenDota';

function FriendItem({ friendUser, index, onPress }: { friendUser: any; index: number; onPress: () => void }) {
  const { data: profile, isLoading } = usePlayerProfile(friendUser.steam_account_id);
  const avatarUrl = profile?.profile?.avatarfull;

  return (
    <PressableScale onPress={onPress}>
      <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
        <View className="bg-[#1e1e1e] p-4 mx-4 mb-3 rounded-xl flex-row items-center border border-zinc-800 shadow-sm">
          <View className="relative">
            {avatarUrl ? (
              <Image 
                source={{ uri: avatarUrl }} 
                className="w-12 h-12 rounded-full border border-zinc-700 mr-4"
                resizeMode="cover"
              />
            ) : (
              <View className="w-12 h-12 rounded-full bg-gamingAccent/20 items-center justify-center mr-4">
                {isLoading ? (
                  <ActivityIndicator size="small" color="#8b5cf6" />
                ) : (
                  <Ionicons name="person" size={24} color="#8b5cf6" />
                )}
              </View>
            )}
          </View>
          <View className="flex-1">
            <Text className="text-white font-outfit-bold text-lg" numberOfLines={1}>
              {friendUser.steam_name || 'Unknown Player'}
            </Text>
            <Text className="text-gray-500 text-xs font-outfit">
              ID: {friendUser.steam_account_id}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#4b5563" />
        </View>
      </Animated.View>
    </PressableScale>
  );
}

export default function FriendsScreen() {
  const { session } = useSupabaseAuth();
  const { setMenuVisible } = useMenu();
  const { friends, loading, fetchFriends } = useFriends();
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
      <FriendItem 
        friendUser={friendUser} 
        index={index} 
        onPress={() => openPlayerDetails(friendUser.steam_account_id)} 
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
        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#8b5cf6" />
          </View>
        ) : (
          <FlatList
            data={friends}
            keyExtractor={(item) => item.id}
            renderItem={renderFriend}
            onRefresh={fetchFriends}
            refreshing={loading}
            ListHeaderComponent={
              <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 }}>
                <Text style={{ color: '#fff', fontSize: 28, fontFamily: 'Outfit_900Black', marginBottom: 4 }}>
                  Friends
                </Text>
                <Text style={{ color: '#9ca3af', fontSize: 14, fontFamily: 'Outfit_400Regular' }}>
                  Manage your friends and track their recent matches.
                </Text>
              </View>
            }
            ListEmptyComponent={
              <View className="flex-1 justify-center items-center py-20 px-10">
                <Ionicons name="people-outline" size={64} color="#374151" />
                <Text className="text-gray-400 text-center mt-4 font-outfit-semibold text-lg">
                  No friends yet. Search for players to add them!
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
