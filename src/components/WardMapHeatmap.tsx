import React, { useState, useMemo } from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { WardMapData } from '../services/opendota';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MAP_SIZE = SCREEN_WIDTH - 48; // Standard padding

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
      Object.entries(yMap as Record<string, number>).forEach(([yStr, count]) => {
        const y = parseInt(yStr);
        result.push({ x, y, count });
      });
    });

    const maxCount = Math.max(...result.map(p => p.count), 1);
    
    return result.map(p => ({
      ...p,
      left: (p.x / 256) * 100,
      top: (1 - (p.y / 256)) * 100,
      opacity: Math.max(0.2, (p.count / maxCount)),
      size: 4 + (p.count / maxCount) * 12
    }));
  }, [data, type]);

  if (loading) {
    return (
      <View className="py-20 items-center justify-center">
        <ActivityIndicator color="#8b5cf6" />
        <Text className="text-gray-500 text-xs font-outfit-semibold mt-4">Generating vision map...</Text>
      </View>
    );
  }

  if (!data || (Object.keys(data.obs).length === 0 && Object.keys(data.sen).length === 0)) {
    return (
      <View className="py-10 items-center justify-center bg-zinc-900/40 rounded-3xl border border-dashed border-zinc-800 mx-5">
        <Ionicons name="map-outline" size={40} color="#3f3f46" />
        <Text className="text-gray-500 font-outfit-semibold text-center mt-4 px-10 text-xs">
          No warding data found. OpenDota only generates ward maps for parsed matches.
        </Text>
      </View>
    );
  }

  return (
    <Animated.View entering={FadeInUp.duration(500)} className="mb-8">
      <View className="flex-row items-center justify-between mb-6 px-6">
        <View>
          <Text className="text-white font-outfit-black text-lg uppercase tracking-tight">Vision Heatmap</Text>
          <Text className="text-gray-500 text-[9px] font-outfit-semibold uppercase tracking-widest mt-0.5">Aggregated Wards</Text>
        </View>
        
        <View className="flex-row bg-zinc-900 p-1 rounded-xl border border-zinc-800">
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

      <View className="bg-black rounded-3xl overflow-hidden border border-zinc-800 p-1 self-center mb-6">
        <View style={{ width: MAP_SIZE, height: MAP_SIZE, position: 'relative' }}>
          <Image 
            source={{ uri: 'https://www.dotabuff.com/assets/maps/minimap-7.33-d8c973a903337e75369666c88825866164293f064f27572621764663d237b600.png' }}
            style={{ width: '100%', height: '100%', opacity: 0.6 }}
            resizeMode="cover"
          />
          
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
                }}
              />
            ))}
          </View>
        </View>
      </View>
      
      <View className="px-6">
         <View className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800">
            <View className="flex-row items-center mb-3">
               <MaterialCommunityIcons name="layers-triple" size={16} color="#8b5cf6" />
               <Text className="text-gray-400 text-[9px] font-outfit-bold uppercase ml-2 tracking-widest">Density Analysis</Text>
            </View>
            <Text className="text-white text-[11px] font-outfit-medium leading-4 opacity-70">
               Brighter spots indicate high-priority warding locations favored in these matches.
            </Text>
            <View className="flex-row items-center justify-between mt-5 p-3 bg-black/40 rounded-xl">
               <Text className="text-[9px] font-outfit-bold text-gray-500 uppercase">Parsed Data Points</Text>
               <Text className="text-xs font-outfit-black text-white">{points.length.toLocaleString()}</Text>
            </View>
         </View>
      </View>
    </Animated.View>
  );
}
