import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getRecentlyViewed, RecentlyViewedItem } from '../services/analytics';
import { getHeroImageUrl } from '../services/constants';
import Animated, { FadeInRight } from 'react-native-reanimated';
import PressableScale from './PressableScale';
import { formatDistanceToNow } from 'date-fns';

interface Props {
  onPressItem: (item: RecentlyViewedItem) => void;
  refreshTrigger?: number;
  compact?: boolean;
  hideHeader?: boolean;
}

export default function RecentlyViewed({ onPressItem, refreshTrigger = 0, compact = false, hideHeader = false }: Props) {
  const [items, setItems] = useState<RecentlyViewedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecentItems();
  }, [refreshTrigger]);

  const loadRecentItems = async () => {
    setLoading(true);
    const recent = await getRecentlyViewed(10);
    setItems(recent);
    setLoading(false);
  };

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

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 4 }}
        snapToInterval={compact ? 172 : 212}
        decelerationRate="fast"
      >
        {items.map((item, index) => (
          <Animated.View 
            key={item.id} 
            entering={FadeInRight.delay(index * 80)}
          >
            <PressableScale onPress={() => onPressItem(item)}>
              <View style={{
                width: compact ? 160 : 200,
                height: compact ? 48 : 64,
                backgroundColor: compact ? 'rgba(255, 255, 255, 0.05)' : '#161625',
                borderRadius: compact ? 12 : 16,
                marginRight: 12,
                padding: compact ? 8 : 10,
                borderWidth: 1,
                borderColor: compact ? 'rgba(255, 255, 255, 0.05)' : '#252538',
                flexDirection: 'row',
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: compact ? 0 : 4
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
                       <Ionicons name="stats-chart" size={compact ? 14 : 20} color="#8b5cf6" />
                     ) : (
                       <Ionicons name="person" size={compact ? 14 : 20} color="#2dd4bf" />
                     )}
                   </View>
                   
                   {/* Small Status Type Indicator */}
                   {!compact && (
                     <View style={{
                       position: 'absolute',
                       bottom: -2,
                       right: -2,
                       backgroundColor: '#0f172a',
                       borderRadius: 6,
                       width: 14,
                       height: 14,
                       alignItems: 'center',
                       justifyContent: 'center',
                       borderWidth: 1,
                       borderColor: '#2a2a3e'
                     }}>
                       <Ionicons 
                         name={item.type === 'hero' ? 'flash' : item.type === 'match' ? 'trophy' : 'people'} 
                         size={8} 
                         color={item.type === 'hero' ? '#fbbf24' : item.type === 'match' ? '#8b5cf6' : '#2dd4bf'} 
                       />
                     </View>
                   )}
                </View>

                {/* Content Section */}
                <View style={{ flex: 1, justifyContent: 'center' }}>
                  <Text style={{ color: '#fff', fontSize: compact ? 11 : 12, fontWeight: '800' }} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                    <Text style={{ color: '#64748b', fontSize: compact ? 9 : 10, fontWeight: '600' }} numberOfLines={1}>
                      {formatDistanceToNow(new Date(item.timestamp), { addSuffix: false })} ago
                    </Text>
                  </View>
                </View>

                {!compact && <Ionicons name="chevron-forward" size={14} color="#2a2a3e" style={{ marginLeft: 4 }} />}
              </View>
            </PressableScale>
          </Animated.View>
        ))}
      </ScrollView>
    </View>
  );
}
