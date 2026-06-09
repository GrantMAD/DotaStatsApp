import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, ScrollView, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getRecentlyViewed, RecentlyViewedItem } from '../services/analytics';
import { getHeroImageUrl } from '../services/constants';
import Animated, { FadeInRight } from 'react-native-reanimated';
import PressableScale from './PressableScale';
import { formatDistanceToNow } from 'date-fns';
import { IntelligenceBadge } from './IntelligenceBadge';

interface Props {
  onPressItem: (item: RecentlyViewedItem) => void;
  refreshTrigger?: number;
  compact?: boolean;
  hideHeader?: boolean;
}

export default function RecentlyViewed({ onPressItem, refreshTrigger = 0, compact = false, hideHeader = false }: Props) {
  const [items, setItems] = useState<RecentlyViewedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'hero' | 'match' | 'player'>('all');

  useEffect(() => {
    loadRecentItems();
  }, [refreshTrigger]);

  const loadRecentItems = async () => {
    setLoading(true);
    const recent = await getRecentlyViewed(10);
    setItems(recent);
    setLoading(false);
  };

  const filteredItems = useMemo(() => {
    if (filter === 'all') return items;
    return items.filter(item => item.type === filter);
  }, [items, filter]);

  const counts = useMemo(() => ({
    all: items.length,
    hero: items.filter(i => i.type === 'hero').length,
    match: items.filter(i => i.type === 'match').length,
    player: items.filter(i => i.type === 'player').length,
  }), [items]);

  if (loading && items.length === 0) {
    return (
      <View style={{ height: compact ? 60 : 80, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color="#8b5cf6" size="small" />
      </View>
    );
  }

  if (items.length === 0) {
    return null;
  }

  const TabButton = ({ type, label }: { type: 'all' | 'hero' | 'match' | 'player', label: string }) => (
    <TouchableOpacity
      onPress={() => setFilter(type)}
      style={{
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginRight: 8,
        backgroundColor: filter === type ? '#8b5cf6' : 'rgba(255, 255, 255, 0.05)',
      }}
    >
      <Text style={{ 
        color: filter === type ? '#fff' : '#94a3b8', 
        fontSize: 10, 
        fontWeight: '900',
        textTransform: 'uppercase',
      }}>
        {label} ({counts[type]})
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ marginTop: hideHeader ? 0 : 24 }}>
      {!hideHeader && (
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          paddingHorizontal: 24, 
          marginBottom: 16 
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ 
              width: 32, 
              height: 32, 
              borderRadius: 10, 
              backgroundColor: 'rgba(139, 92, 246, 0.15)', 
              alignItems: 'center', 
              justifyContent: 'center',
              marginRight: 10,
              borderWidth: 1,
              borderColor: 'rgba(139, 92, 246, 0.3)'
            }}>
              <Ionicons name="time" size={18} color="#a78bfa" />
            </View>
            <View>
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '900', letterSpacing: -0.3 }}>Recently Viewed</Text>
              <Text style={{ color: '#64748b', fontSize: 11, fontWeight: '600' }}>Pick up where you left off</Text>
            </View>
          </View>
        </View>
      )}

      {compact && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, marginBottom: 12 }}>
          <TabButton type="all" label="All" />
          <TabButton type="hero" label="Heroes" />
          <TabButton type="match" label="Matches" />
          <TabButton type="player" label="Players" />
        </ScrollView>
      )}

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 4 }}
        snapToInterval={compact ? 172 : 212}
        decelerationRate="fast"
      >
        {filteredItems.map((item, index) => (
          <Animated.View 
            key={item.id} 
            entering={FadeInRight.delay(index * 80)}
          >
            <PressableScale onPress={() => onPressItem(item)}>
              <View style={{
                width: compact ? 160 : 200,
                height: compact ? 48 : 64,
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                borderRadius: compact ? 12 : 16,
                marginRight: 12,
                padding: compact ? 8 : 10,
                borderWidth: 1,
                borderColor: '#252538',
                flexDirection: 'row',
                alignItems: 'center',
              }}>
                {/* Visual Icon Section */}
                <View style={{ position: 'relative', marginRight: compact ? 8 : 12 }}>
                   <View style={{ 
                     width: compact ? 32 : 44, 
                     height: compact ? 32 : 44, 
                     borderRadius: compact ? 8 : 12, 
                     backgroundColor: '#1e1e2e',
                     overflow: 'hidden',
                     borderWidth: 1,
                     borderColor: '#2a2a3e',
                     alignItems: 'center',
                     justifyContent: 'center'
                   }}>
                     {item.type === 'hero' ? (
                       <Image 
                         source={{ uri: getHeroImageUrl(Number(item.entityId)) }}
                         style={{ width: '100%', height: '100%' }}
                         resizeMode="cover"
                       />
                     ) : item.type === 'match' ? (
                       <Ionicons name="stats-chart" size={compact ? 14 : 20} color="#6366f1" />
                     ) : (
                       <Ionicons name="person" size={compact ? 14 : 20} color="#10b981" />
                     )}
                   </View>
                </View>

                {/* Content Section */}
                <View style={{ flex: 1, justifyContent: 'center' }}>
                  <IntelligenceBadge 
                    type={item.type as 'hero' | 'match' | 'player'} 
                    showIcon={false}
                    className="self-start mb-1"
                  />
                  <Text style={{ color: '#fff', fontSize: compact ? 11 : 12, fontWeight: '800' }} numberOfLines={1}>
                    {item.title}
                  </Text>
                </View>
              </View>
            </PressableScale>
          </Animated.View>
        ))}
      </ScrollView>
    </View>
  );
}
