import React, { useEffect } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { HeroDetailContent } from '../../src/components/HeroDetailContent';
import { useHeroStats } from '../../src/hooks/useOpenDota';
import { trackHeroView } from '../../src/services/analytics';

export default function HeroScreen() {
  const { id } = useLocalSearchParams();
  const { data: heroes = [], isLoading } = useHeroStats();
  
  const hero = heroes.find(h => h.id.toString() === id);

  useEffect(() => {
    if (hero) {
      trackHeroView();
    }
  }, [hero]);

  return (
    <View className="flex-1 bg-[#0d0d1a]">
      <Stack.Screen 
        options={{ 
          title: hero?.localized_name || 'Hero Details',
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
      
      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#8b5cf6" />
        </View>
      ) : hero ? (
        <HeroDetailContent hero={hero} />
      ) : (
        <View className="flex-1 justify-center items-center">
          <Text className="text-red-500">Hero not found.</Text>
        </View>
      )}
    </View>
  );
}
