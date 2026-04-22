import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useNotifications } from '../hooks/useFriends';
import PressableScale from './PressableScale';

export default function NotificationBell() {
  const router = useRouter();
  const { unreadCount } = useNotifications();

  return (
    <PressableScale onPress={() => router.push('/notifications')}>
      <View className="relative w-10 h-10 items-center justify-center rounded-full bg-white/5">
        <Ionicons name="notifications-outline" size={24} color="#fff" />
        {unreadCount > 0 && (
          <View className="absolute top-1 right-1 bg-red-500 w-4 h-4 rounded-full items-center justify-center border-2 border-[#121212]">
            <Text className="text-white text-[9px] font-outfit-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </Text>
          </View>
        )}
      </View>
    </PressableScale>
  );
}
