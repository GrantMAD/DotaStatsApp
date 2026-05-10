import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Image } from 'react-native';
import { useScenariosLaneRoles } from '../../hooks/useOpenDota';
import { HEROES, getHeroImageUrl } from '../../services/constants';
import { Ionicons } from '@expo/vector-icons';

const LANE_ROLES = [
  { id: 1, name: 'Safe Lane', icon: 'shield-checkmark' },
  { id: 2, name: 'Mid Lane', icon: 'flash' },
  { id: 3, name: 'Off Lane', icon: 'skull' },
] as const;

export function LaneRoleInsights() {
  const [selectedLane, setSelectedLane] = useState<number>(2); // Mid

  const { data, isLoading } = useScenariosLaneRoles(selectedLane);

  const heroStats = useMemo(() => {
    if (!data) return [];
    
    // Aggregate
    const stats: Record<number, { wins: number; games: number }> = {};
    data.forEach(s => {
      // OpenDota API has corrupted data at the 3600s time slice with inflated games/wins
      if (s.time === 3600) return;

      if (!stats[s.hero_id]) stats[s.hero_id] = { wins: 0, games: 0 };
      stats[s.hero_id].wins += Number(s.wins || 0);
      stats[s.hero_id].games += Number(s.games || 0);
    });

    const formatted = Object.entries(stats)
      .map(([hero_id, s]) => ({
        hero_id: parseInt(hero_id),
        winRate: (s.wins / s.games) * 100,
        games: s.games
      }))
      .filter(h => h.games > 500)
      .sort((a, b) => b.winRate - a.winRate)
      .slice(0, 10);

    return formatted;
  }, [data]);

  return (
    <View className="space-y-6">
      {/* Lane Selector */}
      <View className="px-4">
        <View className="flex-row bg-zinc-900/50 p-1 rounded-2xl border border-zinc-800">
          {LANE_ROLES.map(lane => (
            <TouchableOpacity
              key={lane.id}
              className={`flex-1 flex-row items-center justify-center gap-2 py-3 rounded-xl transition-colors ${selectedLane === lane.id ? 'bg-purple-500' : 'bg-transparent'}`}
              onPress={() => setSelectedLane(lane.id)}
            >
              <Ionicons 
                name={lane.icon as any} 
                size={16} 
                color={selectedLane === lane.id ? '#fff' : '#9ca3af'} 
              />
              <Text className={`font-bold text-xs ${selectedLane === lane.id ? 'text-white' : 'text-zinc-400'}`}>
                {lane.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Header Info */}
      <View className="px-4 flex-row justify-between items-end">
        <View className="flex-row items-center gap-2">
          <View className="w-8 h-8 rounded-lg bg-amber-500/20 items-center justify-center border border-amber-500/30">
            <Ionicons name="trophy" size={16} color="#fbbf24" />
          </View>
          <Text className="text-white font-black text-lg">Top Performers</Text>
        </View>
        <Text className="text-zinc-500 text-[10px] font-bold uppercase mb-1">Min 500 Games</Text>
      </View>

      {/* List */}
      <View className="px-4 pb-8">
        {isLoading ? (
          <View className="py-20 items-center justify-center">
            <ActivityIndicator size="large" color="#fbbf24" />
          </View>
        ) : heroStats.length > 0 ? (
          <View className="bg-zinc-900/40 rounded-3xl border border-white/5 overflow-hidden p-2">
            {heroStats.map((hero, idx) => {
              const heroData = HEROES[hero.hero_id];
              const isExcellent = hero.winRate >= 52;
              
              return (
                <View 
                  key={hero.hero_id}
                  className={`flex-row items-center p-3 rounded-2xl mb-1 ${idx % 2 === 0 ? 'bg-white/[0.02]' : 'bg-transparent'}`}
                >
                  <Text className="text-zinc-600 font-black text-xs w-6 text-center">
                    #{idx + 1}
                  </Text>
                  
                  <Image 
                    source={{ uri: getHeroImageUrl(hero.hero_id) }} 
                    className="w-10 h-10 rounded-lg ml-2" 
                  />
                  
                  <View className="flex-1 ml-4 justify-center py-1">
                    <Text className="text-white font-bold text-sm mb-1.5" numberOfLines={1}>
                      {heroData?.localized_name || `Hero ${hero.hero_id}`}
                    </Text>
                    <View className="flex-row items-center gap-2 mb-1.5">
                      <View className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <View 
                          className={`h-full rounded-full ${isExcellent ? 'bg-emerald-500' : 'bg-purple-500'}`}
                          style={{ width: `${Math.min(100, Math.max(0, hero.winRate))}%` }}
                        />
                      </View>
                      <Text className={`font-mono text-xs font-bold ${isExcellent ? 'text-emerald-400' : 'text-zinc-300'}`}>
                        {hero.winRate.toFixed(1)}%
                      </Text>
                    </View>
                    <Text className="text-zinc-500 text-[10px] font-bold uppercase">
                      {hero.games.toLocaleString()} Matches
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <View className="py-20 items-center justify-center bg-zinc-900/40 rounded-3xl border border-white/5">
            <Ionicons name="sad-outline" size={48} color="#52525b" />
            <Text className="text-zinc-500 mt-4 font-bold">No Data Found</Text>
          </View>
        )}
      </View>
    </View>
  );
}
