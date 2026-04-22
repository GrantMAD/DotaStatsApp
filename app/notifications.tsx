import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useNotifications, AppNotification } from '../src/hooks/useFriends';
import GlassHeader from '../src/components/GlassHeader';
import PressableScale from '../src/components/PressableScale';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function NotificationsScreen() {
  const router = useRouter();
  const { notifications, markAsRead, markAllAsRead, handleFriendRequest } = useNotifications();

  const renderItem = ({ item, index }: { item: AppNotification; index: number }) => {
    return (
      <Animated.View 
        entering={FadeInDown.delay(index * 50).springify()}
        className={`bg-[#1e1e1e] p-4 mx-4 mb-3 rounded-xl border ${item.is_read ? 'border-zinc-800' : 'border-gamingAccent/50'}`}
      >
        <View className="flex-row items-center mb-2">
          <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${item.is_read ? 'bg-zinc-800' : 'bg-gamingAccent/20'}`}>
            <Ionicons 
              name={item.type === 'friend_request' ? 'person-add' : 'notifications'} 
              size={20} 
              color={item.is_read ? '#6b7280' : '#8b5cf6'} 
            />
          </View>
          <View className="flex-1">
            <Text className="text-white font-outfit-bold text-base mb-1">{item.message}</Text>
            <Text className="text-gray-500 text-xs font-outfit">
              {new Date(item.created_at).toLocaleString()}
            </Text>
          </View>
        </View>

        {item.type === 'friend_request' && !item.is_read && (
          <View className="flex-row mt-3 space-x-3">
            <TouchableOpacity 
              onPress={() => handleFriendRequest(item, true)}
              className="flex-1 bg-gamingAccent py-2 rounded-lg items-center"
            >
              <Text className="text-white font-outfit-bold">Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => handleFriendRequest(item, false)}
              className="flex-1 bg-zinc-800 py-2 rounded-lg items-center"
            >
              <Text className="text-white font-outfit-bold">Decline</Text>
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>
    );
  };

  return (
    <LinearGradient colors={['#1a1a2e', '#121212']} style={{ flex: 1 }}>
      <GlassHeader title="Notifications" rightComponent={
        notifications.some(n => !n.is_read) ? (
          <TouchableOpacity onPress={markAllAsRead} className="px-3 py-1 bg-zinc-800 rounded-lg">
            <Text className="text-gray-300 font-outfit text-xs">Mark all read</Text>
          </TouchableOpacity>
        ) : undefined
      } />
      
      <View className="flex-1 pt-4">
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center py-20 px-10">
              <Ionicons name="notifications-off-outline" size={64} color="#374151" />
              <Text className="text-gray-400 text-center mt-4 font-outfit-semibold text-lg">
                No notifications yet.
              </Text>
            </View>
          }
        />
      </View>
      
      <View className="px-4 pb-8 pt-4">
        <PressableScale onPress={() => router.back()} className="bg-zinc-800 py-3 rounded-xl items-center">
          <Text className="text-white font-outfit-bold">Back</Text>
        </PressableScale>
      </View>
    </LinearGradient>
  );
}
