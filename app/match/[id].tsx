import React, { useEffect } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import MatchOverviewContent from '../../src/components/MatchOverviewContent';
import { trackMatchView } from '../../src/services/analytics';

export default function MatchScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (id) {
      trackMatchView();
    }
  }, [id]);

  return (
    <View className="flex-1 bg-[#1e1e1e]">
      <Stack.Screen 
        options={{ 
          title: `Match ${id}`,
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
      <MatchOverviewContent 
        matchId={id as string} 
        onPushPlayer={(playerId) => router.push(`/profile/${playerId}`)}
        isStandalone={true}
      />
    </View>
  );
}
