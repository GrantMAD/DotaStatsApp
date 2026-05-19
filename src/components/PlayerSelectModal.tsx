import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  Image,
  ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GlassModal from './GlassModal';
import { useFriends } from '../hooks/useFriends';
import { usePlayerProfile } from '../hooks/useOpenDota';

interface PlayerSelectModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (accountId: string) => void;
  title?: string;
}

function PlayerSelectItem({ 
  accountId, 
  steamName, 
  isFriend, 
  onSelect 
}: { 
  accountId: string; 
  steamName: string; 
  isFriend: boolean; 
  onSelect: (accountId: string) => void;
}) {
  const { data: profile, isLoading } = usePlayerProfile(accountId);
  const avatarUrl = profile?.profile?.avatarfull;

  return (
    <TouchableOpacity 
      onPress={() => onSelect(accountId)}
      className="p-4 mx-4 mb-2 flex-row items-center bg-white/5 rounded-xl border border-transparent active:border-purple-500/50 active:bg-white/10"
    >
      {avatarUrl ? (
        <Image 
          source={{ uri: avatarUrl }} 
          className="w-10 h-10 rounded-full border border-white/10 mr-3"
          resizeMode="cover"
        />
      ) : (
        <View className="w-10 h-10 rounded-full bg-purple-500/10 items-center justify-center border border-purple-500/20 mr-3">
          {isLoading ? (
            <ActivityIndicator size="small" color="#c084fc" />
          ) : (
            <Ionicons name="person" size={18} color="#c084fc" />
          )}
        </View>
      )}

      <View className="flex-1 min-w-0">
        <Text className="text-white font-bold text-sm" numberOfLines={1}>
          {profile?.profile?.personaname || steamName}
        </Text>
        <View className="flex-row items-center mt-0.5">
          <Text className="text-white/40 text-[9px] font-black uppercase tracking-widest mr-2">
            ID: {accountId}
          </Text>
          <View className={`px-1.5 py-0.5 rounded border ${
            isFriend 
              ? 'bg-green-500/10 border-green-500/20' 
              : 'bg-blue-500/10 border-blue-500/20'
          }`}>
            <Text className={`text-[8px] font-black uppercase ${
              isFriend ? 'text-green-500' : 'text-blue-500'
            }`}>
              {isFriend ? 'Friend' : 'Following'}
            </Text>
          </View>
        </View>
      </View>
      
      <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.2)" />
    </TouchableOpacity>
  );
}

export function PlayerSelectModal({ 
  visible, 
  onClose, 
  onSelect, 
  title = "Select Player" 
}: PlayerSelectModalProps) {
  const [query, setQuery] = useState('');
  const [searchMode, setSearchMode] = useState<'friends' | 'following'>('friends');
  const { friends, following, loading } = useFriends();

  const filteredFriends = useMemo(() => {
    if (!query) return friends;
    const q = query.toLowerCase();
    return friends.filter(f => {
      const name = f.users?.steam_name?.toLowerCase() || '';
      const id = f.users?.steam_account_id?.toString() || '';
      return name.includes(q) || id.includes(q);
    });
  }, [friends, query]);

  const filteredFollowing = useMemo(() => {
    if (!query) return following;
    const q = query.toLowerCase();
    return following.filter(f => {
      const name = f.steam_name?.toLowerCase() || '';
      const id = f.followed_steam_id.toString();
      return name.includes(q) || id.includes(q);
    });
  }, [following, query]);

  const renderPlayerItem = ({ item }: { item: any }) => {
    const isFriendsMode = searchMode === 'friends';
    const accountId = isFriendsMode ? item.users?.steam_account_id : item.followed_steam_id;
    const steamName = isFriendsMode 
      ? item.users?.steam_name 
      : (item.steam_name || `Player ${item.followed_steam_id}`);

    if (isFriendsMode && !item.users) return null;

    return (
      <PlayerSelectItem 
        accountId={accountId.toString()}
        steamName={steamName}
        isFriend={isFriendsMode}
        onSelect={(id) => {
          onSelect(id);
          onClose();
        }}
      />
    );
  };

  const activeData = searchMode === 'friends' ? filteredFriends : filteredFollowing;

  return (
    <GlassModal visible={visible} onClose={onClose}>
      <View className="flex-1 pb-6">
        {/* Header */}
        <View className="flex-row justify-between items-center px-6 pt-2 pb-4">
          <Text className="text-white font-black text-xl">{title}</Text>
          <TouchableOpacity onPress={onClose} className="p-1">
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Tab Toggle */}
        <View className="flex-row bg-white/5 p-1 rounded-xl border border-white/10 mx-4 mb-4">
          <TouchableOpacity
            onPress={() => {
              setSearchMode('friends');
              setQuery('');
            }}
            className={`flex-1 flex-row items-center justify-center py-2.5 rounded-lg ${
              searchMode === 'friends' ? 'bg-purple-600' : ''
            }`}
          >
            <Ionicons name="people-outline" size={15} color={searchMode === 'friends' ? 'white' : '#6b7280'} />
            <Text className={`font-bold text-xs uppercase tracking-widest ml-2 ${
              searchMode === 'friends' ? 'text-white' : 'text-gray-500'
            }`}>
              Friends
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setSearchMode('following');
              setQuery('');
            }}
            className={`flex-1 flex-row items-center justify-center py-2.5 rounded-lg ${
              searchMode === 'following' ? 'bg-purple-600' : ''
            }`}
          >
            <Ionicons name="person-add-outline" size={15} color={searchMode === 'following' ? 'white' : '#6b7280'} />
            <Text className={`font-bold text-xs uppercase tracking-widest ml-2 ${
              searchMode === 'following' ? 'text-white' : 'text-gray-500'
            }`}>
              Following
            </Text>
          </TouchableOpacity>
        </View>

        {/* Filter Input */}
        <View className="flex-row items-center bg-white/5 border border-white/10 rounded-xl px-4 py-3 mx-4 mb-4">
          <Ionicons name="search" size={18} color="#6b7280" />
          <TextInput
            placeholder={searchMode === 'friends' ? "Filter friends..." : "Filter followed players..."}
            placeholderTextColor="#6b7280"
            className="flex-1 ml-3 text-white font-bold"
            value={query}
            onChangeText={setQuery}
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={18} color="#6b7280" />
            </TouchableOpacity>
          )}
        </View>

        {/* Results List */}
        <View className="flex-1">
          {loading ? (
            <View className="flex-1 justify-center items-center py-10">
              <ActivityIndicator size="small" color="#8b5cf6" />
            </View>
          ) : activeData.length > 0 ? (
            <FlatList
              data={activeData}
              keyExtractor={(item) => item.id}
              renderItem={renderPlayerItem}
              contentContainerStyle={{ paddingBottom: 20 }}
            />
          ) : (
            <View className="flex-1 justify-center items-center py-10 opacity-40">
              <Ionicons 
                name={searchMode === 'friends' ? "people-outline" : "person-add-outline"} 
                size={40} 
                color="white" 
              />
              <Text className="text-white font-bold mt-2">
                {query 
                  ? `No matches for "${query}"`
                  : (searchMode === 'friends' 
                      ? "No friends yet" 
                      : "Not following anyone yet")}
              </Text>
            </View>
          )}
        </View>
      </View>
    </GlassModal>
  );
}
