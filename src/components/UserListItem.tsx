import React from 'react';
import { View, Text, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { usePlayerProfile } from '../hooks/useOpenDota';
import PressableScale from './PressableScale';

interface UserListItemProps {
  user: {
    id: string;
    steam_account_id: string;
    steam_name: string;
  };
  index: number;
  onPress: () => void;
  rightComponent?: React.ReactNode;
}

export default function UserListItem({ user: appUser, index, onPress, rightComponent }: UserListItemProps) {
  const { data: profile, isLoading } = usePlayerProfile(appUser.steam_account_id);
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
              {appUser.steam_name || profile?.profile?.personaname || (isLoading ? 'Loading...' : 'Unknown Player')}
            </Text>
            <Text className="text-gray-500 text-xs font-outfit">
              ID: {appUser.steam_account_id}
            </Text>
          </View>
          
          {rightComponent ? rightComponent : (
            <Ionicons name="chevron-forward" size={20} color="#4b5563" />
          )}
        </View>
      </Animated.View>
    </PressableScale>
  );
}
