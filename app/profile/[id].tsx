import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { PlayerOverviewContent } from '../../src/components/PlayerOverviewContent';
import { usePlayerProfile, usePlayerWinLoss } from '../../src/hooks/useOpenDota';
import { useSupabaseAuth } from '../../src/context/SupabaseAuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { steamAccountId } = useSupabaseAuth();
  
  const { data: profile, isLoading: profileLoading, refetch: refetchProfile } = usePlayerProfile(id as string);
  const { data: wl, isLoading: wlLoading, refetch: refetchWl } = usePlayerWinLoss(id as string);

  const loading = profileLoading || wlLoading;
  const isPrivate = profile && !profile.last_match_time;

  const onRefresh = async () => {
    await Promise.all([refetchProfile(), refetchWl()]);
  };

  return (
    <View className="flex-1 bg-[#1e1e1e]">
      <Stack.Screen 
        options={{ 
          title: profile?.profile?.personaname || 'Player Profile',
          headerShown: true,
          headerTransparent: false,
          headerStyle: { 
            backgroundColor: '#121212'
          },
          headerTitleStyle: { color: 'white', fontFamily: 'Outfit-Bold' },
          headerTintColor: 'white',
          headerBackTitleVisible: false,
        }} 
      />
      
      {loading && !profile ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#8b5cf6" />
          <Text className="text-gray-400 mt-4">Fetching player stats...</Text>
        </View>
      ) : profile ? (
        <PlayerOverviewContent
          accountId={id as string}
          profile={profile}
          wl={wl || null}
          onMatchPress={(matchId) => router.push(`/match/${matchId}`)}
          onRefresh={onRefresh}
          refreshing={loading}
          isPrivate={!!isPrivate}
          onComparePress={steamAccountId && steamAccountId !== id?.toString() ? () => {
            router.push(`/compare?p1=${steamAccountId}&p2=${id}`);
          } : undefined}
        />
      ) : (
        <View className="flex-1 justify-center items-center p-6">
          <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
          <Text className="text-white font-bold text-lg mt-4">Failed to load profile</Text>
          <TouchableOpacity 
            onPress={() => router.back()} 
            className="mt-6 bg-zinc-800 px-8 py-3 rounded-xl border border-white/5"
          >
            <Text className="text-white font-black uppercase">Go Back</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
