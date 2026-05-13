import React, { useState, useMemo } from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { WardMapData } from '../services/opendota';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';

const screenWidth = Dimensions.get('window').width;
const MAP_SIZE = screenWidth - 100; // Increased padding for visual breathing room

interface WardMapHeatmapProps {
  data: WardMapData | null;
  loading?: boolean;
}

export default function WardMapHeatmap({ data, loading }: WardMapHeatmapProps) {
  const [type, setType] = useState<'obs' | 'sen'>('obs');

  const points = useMemo(() => {
    if (!data || !data[type]) return [];
    
    const wardData = data[type];
    const result: { x: number; y: number; count: number }[] = [];
    
    Object.entries(wardData).forEach(([xStr, yMap]) => {
      const x = parseInt(xStr);
      Object.entries(yMap).forEach(([yStr, count]) => {
        const y = parseInt(yStr);
        result.push({ x, y, count });
      });
    });

    const maxCount = Math.max(...result.map(p => p.count), 1);
    
    return result.map(p => ({
      ...p,
      left: (p.x / 256) * 100,
      top: (1 - (p.y / 256)) * 100,
      opacity: Math.max(0.3, (p.count / maxCount)),
      size: 4 + (p.count / maxCount) * 10
    }));
  }, [data, type]);

  if (loading) {
    return (
      <View className="py-20 items-center justify-center">
        <ActivityIndicator color="#8b5cf6" />
        <Text className="text-gray-500 font-outfit mt-4">Generating vision map...</Text>
      </View>
    );
  }

  if (!data || (Object.keys(data.obs).length === 0 && Object.keys(data.sen).length === 0)) {
    return (
      <View className="py-10 items-center justify-center bg-zinc-800/20 rounded-3xl border border-dashed border-zinc-700 mx-4">
        <Ionicons name="map" size={48} color="#3f3f46" />
        <Text className="text-gray-500 font-outfit text-center mt-4 px-10">
          No warding data found. OpenDota only generates ward maps for parsed matches.
        </Text>
      </View>
    );
  }

  return (
    <Animated.View entering={FadeInUp.duration(500)} className="px-10 mb-10">
      <View className="flex-row items-center justify-between mb-8 px-10">
        <View>
          <Text className="text-white font-outfit-black text-xl uppercase tracking-tight">Vision Heatmap</Text>
          <Text className="text-gray-500 text-[10px] font-outfit-semibold uppercase tracking-widest">Aggregated Ward Placements</Text>
        </View>
        
        <View className="flex-row bg-zinc-800/60 p-1 rounded-xl border border-white/5">
          <TouchableOpacity
            onPress={() => setType('obs')}
            className={`px-3 py-1.5 rounded-lg flex-row items-center ${type === 'obs' ? 'bg-amber-500' : ''}`}
          >
            <Ionicons name="eye" size={12} color={type === 'obs' ? 'white' : '#6b7280'} />
            <Text className={`text-[9px] font-outfit-bold ml-1 uppercase ${type === 'obs' ? 'text-white' : 'text-gray-500'}`}>Obs</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setType('sen')}
            className={`px-3 py-1.5 rounded-lg flex-row items-center ${type === 'sen' ? 'bg-blue-600' : ''}`}
          >
            <Ionicons name="eye-off" size={12} color={type === 'sen' ? 'white' : '#6b7280'} />
            <Text className={`text-[9px] font-outfit-bold ml-1 uppercase ${type === 'sen' ? 'text-white' : 'text-gray-500'}`}>Sen</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View className="bg-black rounded-3xl overflow-hidden border-2 border-zinc-800 p-1 self-center mb-8 px-10">
        <View style={{ width: MAP_SIZE, height: MAP_SIZE, position: 'relative' }}>
          {/* Minimap Background */}
          <Image 
            source={{ uri: 'https://www.dotabuff.com/assets/maps/minimap-7.33-d8c973a903337e75369666c88825866164293f064f27572621764663d237b600.png' }}
            style={{ width: '100%', height: '100%', opacity: 0.5, tintColor: '#ffffff' }}
            resizeMode="cover"
          />
          
          {/* Heatmap Overlay */}
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
            {points.map((p, i) => (
              <View
                key={i}
                style={{
                  position: 'absolute',
                  left: `${p.left}%`,
                  top: `${p.top}%`,
                  width: p.size,
                  height: p.size,
                  borderRadius: p.size / 2,
                  backgroundColor: type === 'obs' ? '#fbbf24' : '#60a5fa',
                  opacity: p.opacity,
                  transform: [{ translateX: -p.size / 2 }, { translateY: -p.size / 2 }],
                  shadowColor: type === 'obs' ? '#fbbf24' : '#60a5fa',
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.8,
                  shadowRadius: 4,
                }}
              />
            ))}
          </View>
          
          {/* Grid Overlay */}
          <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.1 }}>
             {Array.from({ length: 8 }).map((_, i) => (
               <View key={`v-${i}`} style={{ position: 'absolute', left: `${(i + 1) * 12.5}%`, top: 0, bottom: 0, width: 0.5, backgroundColor: 'white' }} />
             ))}
             {Array.from({ length: 8 }).map((_, i) => (
               <View key={`h-${i}`} style={{ position: 'absolute', top: `${(i + 1) * 12.5}%`, left: 0, right: 0, height: 0.5, backgroundColor: 'white' }} />
             ))}
          </View>
        </View>
      </View>
      
      <View className="space-y-4 px-10">
         <View className="bg-zinc-800/40 p-5 rounded-3xl border border-white/5">
            <View className="flex-row items-center mb-3">
               <Ionicons name="information-circle" size={18} color="#fbbf24" />
               <Text className="text-gray-400 text-[10px] font-outfit-bold uppercase ml-1.5">Density Analysis</Text>
            </View>
            <Text className="text-white text-[11px] font-outfit-medium leading-4">
               Brighter spots indicate high-priority warding locations you favor in your matches.
            </Text>
            <View className="flex-row items-center justify-between mt-5 p-3 bg-black/20 rounded-xl">
               <Text className="text-[9px] font-outfit-bold text-gray-500 uppercase">Data Points</Text>
               <Text className="text-xs font-outfit-black text-white">{points.length.toLocaleString()}</Text>
            </View>
         </View>
      </View>
    </Animated.View>
  );
}
