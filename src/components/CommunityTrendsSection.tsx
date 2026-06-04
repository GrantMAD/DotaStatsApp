import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { HeroStats } from '../services/types';
import { STEAM_CDN_BASE } from '../services/constants';
import { getCommunityTrending } from '../services/analytics';
import { ICON_MAP } from '../services/iconMap';
import PressableScale from './PressableScale';
import Skeleton from './Skeleton';

interface CommunityTrendsSectionProps {
  initialHeroesData: HeroStats[];
}

function SectionHeader({ icon, title, description, color }: { icon: keyof typeof ICON_MAP; title: string; description?: string; color: string }) {
  return (
    <View style={{ paddingHorizontal: 20, marginTop: 28, marginBottom: 14 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Ionicons name={ICON_MAP[icon] as any} size={20} color={color} style={{ marginRight: 8 }} />
        <Text style={{ color: '#fff', fontSize: 18, fontWeight: '800', letterSpacing: 0.3 }}>{title}</Text>
      </View>
      {description && (
        <Text style={{ color: '#9ca3af', fontSize: 13, marginTop: 4 }}>
          {description}
        </Text>
      )}
    </View>
  );
}

export default function CommunityTrendsSection({ initialHeroesData }: CommunityTrendsSectionProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [trendingData, setTrendingData] = useState<{
    heroes: Array<{ id: number, name: string, count: number }>,
    searches: string[]
  }>({ heroes: [], searches: [] });

  useEffect(() => {
    async function fetchTrending() {
      const data = await getCommunityTrending();
      setTrendingData(data);
      setIsLoading(false);
    }
    fetchTrending();
  }, []);

  const getHeroInfo = (heroId: number) => {
    return initialHeroesData.find(h => h.id === heroId);
  };

  const handleSearchClick = (query: string) => {
    router.push({ pathname: '/search', params: { q: query } });
  };

  if (!isLoading && trendingData.heroes.length === 0 && trendingData.searches.length === 0) {
    return null;
  }

  return (
    <View>
      <SectionHeader 
        icon="GLOBE" 
        title="Community Trending" 
        description="Popular searches and viewed heroes in our community (48h)."
        color="#8b5cf6" 
      />

      {/* Trending Heroes */}
      <View style={{ paddingHorizontal: 20, marginBottom: 12 }}>
         <Text style={{ color: '#6b7280', fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 }}>Most Viewed Heroes</Text>
      </View>

      {isLoading ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
          {[1, 2, 3].map(i => (
            <View key={i} style={{ width: 120, height: 100, backgroundColor: '#1e1e2e', borderRadius: 12, marginRight: 12, padding: 8, borderWidth: 1, borderColor: '#2a2a3e' }}>
              <Skeleton width="100%" height={50} borderRadius={6} />
              <Skeleton width="80%" height={12} borderRadius={4} style={{ marginTop: 8 }} />
            </View>
          ))}
        </ScrollView>
      ) : (
        <FlatList
          data={trendingData.heroes}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20 }}
          keyExtractor={(item) => `trending-${item.id}`}
          renderItem={({ item, index }) => {
            const heroInfo = getHeroInfo(item.id);
            if (!heroInfo) return null;

            return (
              <PressableScale onPress={() => router.push(`/hero/${item.id}`)}>
                <Animated.View 
                  entering={FadeInDown.delay(index * 50).springify()}
                  style={{
                    width: 130,
                    backgroundColor: '#1e1e2e',
                    borderRadius: 12,
                    marginRight: 12,
                    padding: 8,
                    borderWidth: 1,
                    borderColor: '#2a2a3e',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <View style={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                    backgroundColor: 'rgba(139, 92, 246, 0.2)',
                    paddingHorizontal: 6,
                    paddingVertical: 2,
                    borderRadius: 6,
                    zIndex: 10,
                    borderWidth: 1,
                    borderColor: 'rgba(139, 92, 246, 0.3)'
                  }}>
                    <Text style={{ color: '#a78bfa', fontSize: 8, fontWeight: '900' }}>{item.count} views</Text>
                  </View>

                  <Image
                    source={{ uri: `${STEAM_CDN_BASE}${heroInfo.img}` }}
                    style={{ width: '100%', height: 60, borderRadius: 8, backgroundColor: '#252538' }}
                    resizeMode="cover"
                  />
                  <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700', marginTop: 8, textAlign: 'center' }} numberOfLines={1}>
                    {heroInfo.localized_name}
                  </Text>
                </Animated.View>
              </PressableScale>
            );
          }}
        />
      )}

      {/* Trending Searches */}
      <View style={{ paddingHorizontal: 20, marginTop: 24, marginBottom: 12 }}>
         <Text style={{ color: '#6b7280', fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 }}>Popular Searches</Text>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20 }}>
        {isLoading ? (
          [1, 2, 3, 4].map(i => (
            <Skeleton key={i} width={80} height={32} borderRadius={16} style={{ marginRight: 8, marginBottom: 8 }} />
          ))
        ) : (
          trendingData.searches.map((query, index) => (
            <PressableScale 
              key={index} 
              onPress={() => handleSearchClick(query)}
              style={{
                backgroundColor: 'rgba(255,255,255,0.05)',
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 20,
                marginRight: 8,
                marginBottom: 8,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.1)',
                flexDirection: 'row',
                alignItems: 'center'
              }}
            >
              <Ionicons name="search" size={12} color="#8b5cf6" style={{ marginRight: 6 }} />
              <Text style={{ color: '#e2e8f0', fontSize: 12, fontWeight: '600' }}>{query}</Text>
            </PressableScale>
          ))
        )}
      </View>
    </View>
  );
}
