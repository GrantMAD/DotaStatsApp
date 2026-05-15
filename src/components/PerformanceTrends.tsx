import React, { useMemo, useState } from 'react';
import { View, Text, Dimensions, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { RecentMatch, PlayerTotal } from '../services/opendota';
import { RANK_PERFORMANCE_BENCHMARKS } from '../services/constants';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';

interface PerformanceTrendsProps {
  matches: RecentMatch[];
  totals: PlayerTotal[];
  rankTier: number | null;
  loading?: boolean;
}

const screenWidth = Dimensions.get('window').width;

type MetricType = 'kda' | 'gpm' | 'xpm';

export default function PerformanceTrends({ matches, totals, rankTier, loading }: PerformanceTrendsProps) {
  const [activeMetric, setActiveMetric] = useState<MetricType>('kda');

  const trends = useMemo(() => {
    const recent = matches?.slice(0, 20) || [];
    if (recent.length === 0 || loading) return null;

    const recentCount = Math.max(1, recent.length);
    const avgKDA = recent.reduce((acc, m) => acc + (m.kills + m.assists) / Math.max(1, m.deaths), 0) / recentCount;
    const avgGPM = recent.reduce((acc, m) => acc + (m.gold_per_min || 0), 0) / recentCount;
    const avgXPM = recent.reduce((acc, m) => acc + (m.xp_per_min || 0), 0) / recentCount;
    const avgHDM = recent.reduce((acc, m) => acc + (m.hero_damage || 0), 0) / recentCount;
    const avgTD = recent.reduce((acc, m) => acc + (m.tower_damage || 0), 0) / recentCount;
    const avgLH = recent.reduce((acc, m) => acc + (m.last_hits || 0), 0) / recentCount;
    const avgHealing = recent.reduce((acc, m) => acc + (m.hero_healing || 0), 0) / recentCount;
    const avgDuration = recent.reduce((acc, m) => acc + m.duration, 0) / recentCount;
    
    // Lane detection
    const laneCounts: Record<number, number> = {};
    recent.forEach(m => {
      if (m.lane) laneCounts[m.lane] = (laneCounts[m.lane] || 0) + 1;
    });
    const topLaneEntry = Object.entries(laneCounts).sort((a, b) => b[1] - a[1])[0];
    const topLane = topLaneEntry ? Number(topLaneEntry[0]) : null;

    const uniqueHeroes = new Set(recent.map(m => m.hero_id)).size;

    const safeTotals = totals || [];
    const lifetimeKills = safeTotals.find(t => t.field === 'kills')?.sum || 0;
    const lifetimeDeaths = safeTotals.find(t => t.field === 'deaths')?.sum || 0;
    const lifetimeAssists = safeTotals.find(t => t.field === 'assists')?.sum || 0;
    const lifetimeMatches = safeTotals.find(t => t.field === 'kills')?.n || 1;
    
    const lifetimeKDA = (lifetimeKills + lifetimeAssists) / Math.max(1, lifetimeDeaths);
    const lifetimeGPM = (safeTotals.find(t => t.field === 'gold_per_min')?.sum || 0) / lifetimeMatches;
    const lifetimeXPM = (safeTotals.find(t => t.field === 'xp_per_min')?.sum || 0) / lifetimeMatches;
    const lifetimeHDM = (safeTotals.find(t => t.field === 'hero_damage')?.sum || 0) / lifetimeMatches;
    const lifetimeTD = (safeTotals.find(t => t.field === 'tower_damage')?.sum || 0) / lifetimeMatches;
    const lifetimeLH = (safeTotals.find(t => t.field === 'last_hits')?.sum || 0) / lifetimeMatches;
    const lifetimeHealing = (safeTotals.find(t => t.field === 'hero_healing')?.sum || 0) / lifetimeMatches;
    const lifetimeDuration = (safeTotals.find(t => t.field === 'duration')?.sum || 0) / lifetimeMatches;

    const history = [...recent].reverse().map(m => ({
      kda: (m.kills + m.assists) / Math.max(1, m.deaths),
      gpm: m.gold_per_min || 0,
      xpm: m.xp_per_min || 0,
    }));

    const winRateRecent = (recent.filter(m => {
      const isRadiant = m.player_slot < 128;
      return (isRadiant && m.radiant_win) || (!isRadiant && !m.radiant_win);
    }).length / recentCount) * 100;

    const isOnFire = winRateRecent >= 65 || (lifetimeKDA > 0 && avgKDA > lifetimeKDA * 1.25);

    // Get rank benchmark
    const rankDigit = rankTier ? Math.floor(rankTier / 10) : 0;
    const benchmark = RANK_PERFORMANCE_BENCHMARKS[rankDigit] || null;

    return {
      avgKDA, lifetimeKDA,
      avgGPM, lifetimeGPM,
      avgXPM, lifetimeXPM,
      avgHDM, lifetimeHDM,
      avgTD, lifetimeTD,
      avgLH, lifetimeLH,
      avgHealing, lifetimeHealing,
      avgDuration, lifetimeDuration,
      topLane,
      uniqueHeroes,
      history,
      winRateRecent,
      isOnFire,
      benchmark
    };
  }, [matches, totals, loading, rankTier]);

  if (loading) {
    return (
      <View className="py-20 items-center justify-center">
        <ActivityIndicator color="#8b5cf6" />
        <Text className="text-gray-500 font-outfit mt-4">Analyzing trends...</Text>
      </View>
    );
  }

  if (!matches || matches.length < 3) {
    return (
      <View className="py-10 items-center justify-center bg-zinc-800/20 rounded-3xl border border-dashed border-zinc-700 mx-4">
        <Ionicons name="analytics" size={48} color="#3f3f46" />
        <Text className="text-gray-500 font-outfit text-center mt-4 px-10">
          Not enough match data to calculate trends. Play more matches or clear filters!
        </Text>
      </View>
    );
  }

  if (!trends) return null;

  const renderTrendMetric = (label: string, recent: number, lifetime: number, icon: string, color: string, isInteger: boolean = false) => {
    const diff = lifetime > 0 ? ((recent - lifetime) / lifetime) * 100 : 0;
    const isPositive = diff >= 0;

    return (
      <View className="flex-1 bg-zinc-800/40 p-4 rounded-3xl border border-white/5">
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center">
            <Ionicons name={icon as any} size={16} color={color} />
            <Text className="text-gray-400 text-[10px] font-outfit-bold ml-1.5 uppercase tracking-wider">{label}</Text>
          </View>
          {lifetime > 0 && (
            <View className={`px-2 py-0.5 rounded-full ${isPositive ? 'bg-win/10' : 'bg-loss/10'}`}>
              <Text className={`text-[9px] font-outfit-black ${isPositive ? 'text-win' : 'text-loss'}`}>
                {isPositive ? '+' : ''}{diff.toFixed(0)}%
              </Text>
            </View>
          )}
        </View>
        
        <View className="flex-row items-baseline justify-between mt-auto">
          <View>
            <Text className="text-white text-2xl font-outfit-black">
              {isInteger ? Math.round(recent).toLocaleString() : recent.toFixed(1)}
            </Text>
            <Text className="text-gray-500 text-[9px] font-outfit-bold uppercase mt-0.5">Recent Avg</Text>
          </View>
          <View className="items-end">
            <Text className="text-gray-400 text-sm font-outfit-bold">
              {isInteger ? Math.round(lifetime).toLocaleString() : lifetime.toFixed(1)}
            </Text>
            <Text className="text-gray-600 text-[8px] font-outfit-bold uppercase">Lifetime</Text>
          </View>
        </View>
      </View>
    );
  };

  const activeMetricData = trends.history.map(h => h[activeMetric]);
  const activeBenchmarkValue = trends.benchmark ? trends.benchmark[activeMetric] : null;

  return (
    <Animated.View 
      entering={FadeInUp.duration(500)} 
      style={{ paddingHorizontal: 32, marginBottom: 40 }}
    >
      {/* Section Header */}
      <View className="mb-6 flex-row items-center justify-between">
        <View>
          <Text className="text-white font-outfit-black text-xl uppercase tracking-tight">Form Analysis</Text>
          <Text className="text-gray-500 text-[10px] font-outfit-semibold uppercase tracking-widest">Recent vs. Lifetime Stats</Text>
        </View>
        <View className="bg-purple-500/10 p-2 rounded-full">
          <Ionicons name="analytics-outline" size={20} color="#8b5cf6" />
        </View>
      </View>

      {/* On Fire Badge */}
      {trends.isOnFire && (
        <View className="bg-orange-500/20 border border-orange-500/30 p-5 rounded-[32px] mb-8 flex-row items-center">
          <View className="bg-orange-500 p-2 rounded-xl mr-4">
            <Ionicons name="flame" size={24} color="white" />
          </View>
          <View className="flex-1">
            <Text className="text-orange-400 font-outfit-black text-xs uppercase tracking-widest">On Fire</Text>
            <Text className="text-white font-outfit-semibold text-[11px] leading-4">Your current performance is significantly above your lifetime average!</Text>
          </View>
        </View>
      )}

      {/* Stats Grid - 2 per row */}
      <View className="flex-row mb-3">
        {renderTrendMetric('Avg KDA', trends.avgKDA, trends.lifetimeKDA, 'stats-chart', '#8b5cf6')}
        <View style={{ width: 12 }} />
        {renderTrendMetric('Avg GPM', trends.avgGPM, trends.lifetimeGPM, 'flash', '#eab308', true)}
      </View>

      <View className="flex-row mb-3">
        {renderTrendMetric('Avg XPM', trends.avgXPM, trends.lifetimeXPM, 'sparkles', '#3b82f6', true)}
        <View style={{ width: 12 }} />
        {renderTrendMetric('Impact', trends.avgHDM, trends.lifetimeHDM, 'skull', '#ef4444', true)}
      </View>

      <View className="flex-row mb-3">
        {renderTrendMetric('Farming', trends.avgLH, trends.lifetimeLH, 'leaf', '#22c55e', true)}
        <View style={{ width: 12 }} />
        {renderTrendMetric('Objectives', trends.avgTD, trends.lifetimeTD, 'hammer', '#f97316', true)}
      </View>

      <View className="flex-row mb-8">
        {renderTrendMetric('Healing', trends.avgHealing, trends.lifetimeHealing, 'medical', '#10b981', true)}
        <View style={{ width: 12 }} />
        <View className="flex-1" />
      </View>

      {/* Playstyle Summary */}
      <View className="flex-row mb-6">
        {/* Hero Pool Summary */}
        <View className="flex-1 bg-zinc-800/20 p-3 rounded-2xl border border-white/5 mr-2">
          <View className="flex-row items-center mb-1">
            <Ionicons name="people" size={16} color="#3b82f6" />
            <Text className="text-gray-400 text-[10px] font-outfit-bold uppercase ml-1">Diversity (Last 20 Matches)</Text>
          </View>
          <Text className="text-white font-outfit-black text-sm">{trends.uniqueHeroes} Heroes</Text>
          <View className="flex-row mt-1">
            <View className="bg-blue-500/20 px-2 py-0.5 rounded-full">
              <Text className="text-blue-400 text-[8px] font-outfit-black">{((trends.uniqueHeroes / 20) * 100).toFixed(0)}% Flex</Text>
            </View>
          </View>
        </View>

        {/* Lane Summary */}
        <View className="flex-1 bg-zinc-800/20 p-3 rounded-2xl border border-white/5 ml-2">
          <View className="flex-row items-center mb-1">
            <Ionicons name="map" size={16} color="#8b5cf6" />
            <Text className="text-gray-400 text-[10px] font-outfit-bold uppercase ml-1">Current Role</Text>
          </View>
          <Text className="text-white font-outfit-black text-sm">
            {trends.topLane === 1 ? 'Safelane' : 
             trends.topLane === 2 ? 'Midlane' : 
             trends.topLane === 3 ? 'Offlane' : 
             trends.topLane === 4 ? 'Jungle' : 'Roaming/Flex'}
          </Text>
          <View className="flex-row mt-1">
            <View className="bg-purple-500/20 px-2 py-0.5 rounded-full">
              <Text className="text-purple-400 text-[8px] font-outfit-black">PREDOMINANT</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Momentum Chart */}
      <View className="bg-[#1e1e2e] rounded-3xl p-4 border border-white/5">
        <View className="px-2 mb-6">
          <View className="flex-row justify-between items-center mb-4">
            <View>
              <Text className="text-white font-outfit-black text-xs uppercase tracking-widest">Momentum Visualizer</Text>
              <Text className="text-gray-500 text-[10px]">Trajectory vs. Rank Average</Text>
            </View>
            <View className="bg-purple-500/10 px-2 py-1 rounded-lg">
              <Text className="text-purple-400 text-[8px] font-outfit-black">TRENDS</Text>
            </View>
          </View>
          
          <View className="flex-row bg-white/5 p-1 rounded-xl self-start">
            {(['kda', 'gpm', 'xpm'] as const).map((m) => (
              <TouchableOpacity
                key={m}
                onPress={() => setActiveMetric(m)}
                className={`px-4 py-2 rounded-lg ${activeMetric === m ? 'bg-purple-500' : ''}`}
              >
                <Text className={`text-[10px] font-outfit-black uppercase ${activeMetric === m ? 'text-white' : 'text-gray-500'}`}>
                  {m}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View className="items-center overflow-hidden">
          <LineChart
            data={{
              labels: [], 
              datasets: [
                { 
                  data: activeMetricData,
                  color: (opacity = 1) => activeMetric === 'kda' ? `rgba(139, 92, 246, ${opacity})` : activeMetric === 'gpm' ? `rgba(234, 179, 8, ${opacity})` : `rgba(59, 130, 246, ${opacity})`,
                  strokeWidth: 3
                },
                ...(activeBenchmarkValue ? [{
                  data: new Array(activeMetricData.length).fill(activeBenchmarkValue),
                  color: (opacity = 0.5) => `rgba(99, 102, 241, ${opacity})`,
                  strokeWidth: 2,
                  withDots: false,
                }] : [])
              ]
            }}
            width={screenWidth - 96} 
            height={160}
            chartConfig={{
              backgroundColor: "#1e1e2e",
              backgroundGradientFrom: "#1e1e2e",
              backgroundGradientTo: "#1e1e2e",
              decimalPlaces: activeMetric === 'kda' ? 1 : 0,
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              style: { borderRadius: 16 },
              propsForDots: {
                r: "3",
                strokeWidth: "2",
                stroke: activeMetric === 'kda' ? '#8b5cf6' : activeMetric === 'gpm' ? '#eab308' : '#3b82f6'
              }
            }}
            bezier
            style={{
              marginVertical: 12,
              borderRadius: 16,
            }}
            withVerticalLabels={false}
            withHorizontalLabels={true}
            withInnerLines={false}
            withOuterLines={false}
            withShadow={true}
          />
          {activeBenchmarkValue && (
            <View className="absolute right-0 top-1/2">
               <Text className="text-purple-400 text-[7px] font-outfit-black uppercase tracking-tighter" style={{ transform: [{ rotate: '90deg' }] }}>
                 {activeMetric.toUpperCase()} RANK AVG
               </Text>
            </View>
          )}
        </View>
      </View>
    </Animated.View>
  );
}
