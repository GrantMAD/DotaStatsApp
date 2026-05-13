import React, { useMemo } from 'react';
import { View, Text, Dimensions, ActivityIndicator } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { PlayerRating } from '../services/opendota';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { format } from 'date-fns';

const screenWidth = Dimensions.get('window').width;

interface MMRHistoryChartProps {
  ratings: PlayerRating[];
  loading?: boolean;
}

export default function MMRHistoryChart({ ratings, loading }: MMRHistoryChartProps) {
  const chartData = useMemo(() => {
    if (!ratings || !Array.isArray(ratings) || ratings.length === 0) return null;
    
    const validRatings = ratings
      .filter(r => {
        const mmrValue = r.solo_competitive_rank || r.competitive_rank;
        return (
          mmrValue != null && 
          !isNaN(Number(mmrValue)) && 
          r.time != null && 
          !isNaN(Number(r.time))
        );
      })
      .sort((a, b) => a.time - b.time);

    if (validRatings.length === 0) return null;

    // For mobile display, we might want to sample if there are too many points
    // But let's start with all of them and see performance.
    // Usually OpenDota ratings are not too many (one per MMR change).
    
    const values = validRatings.map(r => Number(r.solo_competitive_rank || r.competitive_rank));
    const labels = validRatings.map(r => format(new Date(r.time * 1000), 'MMM yy'));

    // Sample labels for X-axis to avoid overlap
    const sampledLabels = labels.map((l, i) => {
      if (i === 0 || i === labels.length - 1 || i % Math.ceil(labels.length / 4) === 0) {
        return l;
      }
      return "";
    });

    const highest = Math.max(...values);
    const start = values[0];
    const current = values[values.length - 1];
    const gain = current - start;

    return {
      values,
      labels: sampledLabels,
      stats: {
        highest,
        start,
        current,
        gain
      }
    };
  }, [ratings]);

  if (loading) {
    return (
      <View className="py-20 items-center justify-center">
        <ActivityIndicator color="#8b5cf6" />
        <Text className="text-gray-500 font-outfit mt-4">Fetching rank history...</Text>
      </View>
    );
  }

  if (!chartData) {
    return (
      <View className="py-10 items-center justify-center bg-zinc-800/20 rounded-3xl border border-dashed border-zinc-700 mx-4">
        <Ionicons name="trending-up" size={48} color="#3f3f46" />
        <Text className="text-gray-500 font-outfit text-center mt-4 px-10">
          No historical MMR data found for this player.
        </Text>
      </View>
    );
  }

  const { values, labels, stats } = chartData;

  const renderStatCard = (label: string, value: string | number, sublabel: string, color: string, isPositive?: boolean) => (
    <View className="flex-1 bg-zinc-800/40 p-4 rounded-3xl border border-white/5 mx-1">
      <Text className="text-gray-500 text-[9px] font-outfit-bold uppercase tracking-widest mb-1">{label}</Text>
      <Text className={`text-xl font-outfit-black ${isPositive !== undefined ? (isPositive ? 'text-win' : 'text-loss') : 'text-white'}`}>
        {isPositive !== undefined && isPositive ? '+' : ''}{value.toLocaleString()}
      </Text>
      <Text className="text-gray-600 text-[8px] font-outfit-bold uppercase mt-0.5">{sublabel}</Text>
    </View>
  );

  return (
    <Animated.View entering={FadeInUp.duration(500)} className="px-6 mb-10">
      <View className="flex-row items-center justify-between mb-6">
        <View>
          <Text className="text-white font-outfit-black text-xl uppercase tracking-tight">Rank Progress</Text>
          <Text className="text-gray-500 text-[10px] font-outfit-semibold uppercase tracking-widest">Historical MMR Adjustments</Text>
        </View>
        <View className="bg-blue-500/10 p-2 rounded-full">
          <Ionicons name="trending-up-outline" size={20} color="#3b82f6" />
        </View>
      </View>

      <View className="flex-row mb-6">
        {renderStatCard('Peak', stats.highest, 'Highest Recorded', 'text-white')}
        {renderStatCard('Gain/Loss', stats.gain, 'Since Start', stats.gain >= 0 ? 'text-win' : 'text-loss', stats.gain >= 0)}
      </View>

      <View className="bg-[#1e1e2e] rounded-3xl p-4 border border-white/5 overflow-hidden">
        <View className="flex-row justify-between items-center mb-6 px-2">
           <View>
              <Text className="text-white font-outfit-black text-xs uppercase tracking-widest">MMR Over Time</Text>
              <Text className="text-gray-500 text-[10px]">Evolution of solo/competitive rating</Text>
           </View>
           <View className="bg-blue-500/10 px-2 py-1 rounded-lg">
              <Text className="text-blue-400 text-[10px] font-outfit-black">LIFETIME</Text>
           </View>
        </View>

        <LineChart
          data={{
            labels: labels,
            datasets: [{ data: values }]
          }}
          width={screenWidth - 80}
          height={220}
          chartConfig={{
            backgroundColor: "#1e1e2e",
            backgroundGradientFrom: "#1e1e2e",
            backgroundGradientTo: "#1e1e2e",
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(156, 163, 175, ${opacity})`,
            style: { borderRadius: 16 },
            propsForDots: {
              r: "2",
              strokeWidth: "1",
              stroke: "#3b82f6"
            },
            propsForBackgroundLines: {
              strokeDasharray: "", // solid lines
              stroke: "rgba(255, 255, 255, 0.05)"
            }
          }}
          bezier
          style={{
            marginVertical: 8,
            borderRadius: 16,
            marginLeft: -15
          }}
          withVerticalLabels={true}
          withHorizontalLabels={true}
          withInnerLines={true}
          withOuterLines={false}
          withShadow={true}
          segments={4}
        />
      </View>
    </Animated.View>
  );
}
