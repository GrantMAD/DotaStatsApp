import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle, DimensionValue } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  useSharedValue,
  interpolate
} from 'react-native-reanimated';

interface SkeletonProps {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  style?: ViewStyle;
}

export default function Skeleton({ width, height, borderRadius = 8, style }: SkeletonProps) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.7, { duration: 1000 }),
      -1, // infinite
      true // reverse
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View 
      style={[
        {
          width: width || '100%',
          height: height || 20,
          borderRadius: borderRadius,
          backgroundColor: '#2a2a3e',
        },
        animatedStyle,
        style
      ]}
    />
  );
}

export function PlayerProfileSkeleton() {
  return (
    <View className="flex-1 bg-gamingDark">
      {/* ... existing header ... */}
      <View className="bg-[#1e1e1e] p-6 rounded-b-3xl shadow-lg mb-4">
        <View className="flex-row items-center mb-6">
          <Skeleton width={80} height={80} borderRadius={40} style={{ marginRight: 16 }} />
          <View className="flex-1">
            <Skeleton width="60%" height={24} borderRadius={4} style={{ marginBottom: 8 }} />
            <Skeleton width="40%" height={16} borderRadius={4} />
          </View>
          <Skeleton width={60} height={60} borderRadius={30} />
        </View>
        
        {/* Stats Row Skeleton */}
        <View className="flex-row justify-between bg-[#2a2a2a] p-4 rounded-xl mb-6">
          <View className="items-center flex-1">
             <Skeleton width={40} height={12} borderRadius={2} style={{ marginBottom: 8 }} />
             <Skeleton width={30} height={20} borderRadius={4} />
          </View>
          <View className="items-center flex-1">
             <Skeleton width={40} height={12} borderRadius={2} style={{ marginBottom: 8 }} />
             <Skeleton width={30} height={20} borderRadius={4} />
          </View>
          <View className="items-center flex-1">
             <Skeleton width={40} height={12} borderRadius={2} style={{ marginBottom: 8 }} />
             <Skeleton width={40} height={20} borderRadius={4} />
          </View>
        </View>

        {/* Tab Skeleton */}
        <View className="flex-row bg-[#2a2a2a] rounded-xl p-1">
          <View className="flex-1 py-4 bg-zinc-800 rounded-lg mr-1" />
          <View className="flex-1 py-4 bg-transparent rounded-lg" />
        </View>
      </View>

      {/* Match List Skeleton */}
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
        <View key={i} className="bg-[#1e1e1e] p-4 mx-4 mb-3 rounded-xl flex-row justify-between items-center border-l-4 border-zinc-800">
           <View className="flex-row items-center flex-1">
             <Skeleton width={48} height={48} borderRadius={8} style={{ marginRight: 12 }} />
             <View className="flex-1">
                <Skeleton width="40%" height={18} borderRadius={4} style={{ marginBottom: 6 }} />
                <Skeleton width="60%" height={14} borderRadius={4} style={{ marginBottom: 6 }} />
                <Skeleton width="30%" height={12} borderRadius={4} />
             </View>
           </View>
           <Skeleton width={40} height={14} borderRadius={4} />
        </View>
      ))}
    </View>
  );
}

export function MatchOverviewSkeleton() {
  return (
    <View className="flex-1 bg-gamingDark">
      {/* Header */}
      <View className="p-4 border-b border-zinc-800 flex-row justify-between items-center">
        <View>
          <Skeleton width={120} height={24} borderRadius={4} style={{ marginBottom: 8 }} />
          <Skeleton width={80} height={12} borderRadius={2} />
        </View>
        <Skeleton width={32} height={32} borderRadius={16} />
      </View>

      {/* Scoreboard */}
      <View className="bg-[#2a2a2a] p-4 flex-row justify-around items-center border-b border-zinc-800">
        <View className="items-center">
          <Skeleton width={40} height={32} borderRadius={4} style={{ marginBottom: 4 }} />
          <Skeleton width={50} height={10} borderRadius={2} />
        </View>
        <View className="items-center">
          <Skeleton width={60} height={14} borderRadius={4} style={{ marginBottom: 4 }} />
          <Skeleton width={80} height={10} borderRadius={2} />
        </View>
        <View className="items-center">
          <Skeleton width={40} height={32} borderRadius={4} style={{ marginBottom: 4 }} />
          <Skeleton width={50} height={10} borderRadius={2} />
        </View>
      </View>

      {/* Tab bar */}
      <View className="flex-row p-4 border-b border-zinc-800">
        {[1, 2, 3, 4].map(i => <Skeleton key={i} width={80} height={14} borderRadius={4} style={{ marginRight: 16 }} />)}
      </View>

      {/* Content */}
      <View className="p-4">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
          <View key={i} className="mb-4 bg-[#222] p-3 rounded-xl border border-zinc-800 flex-row items-center">
            <Skeleton width={40} height={28} borderRadius={4} style={{ marginRight: 12 }} />
            <View className="flex-1">
              <Skeleton width="50%" height={14} borderRadius={4} style={{ marginBottom: 6 }} />
              <Skeleton width="30%" height={10} borderRadius={2} />
            </View>
            <Skeleton width={40} height={14} borderRadius={4} />
          </View>
        ))}
      </View>
    </View>
  );
}
