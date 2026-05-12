import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useScenarioFunFacts } from '../../hooks/useOpenDota';
import { Ionicons } from '@expo/vector-icons';

interface FunFact {
  id: string;
  title: string;
  description: string;
  scenario: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  accent: string;
}

const FUN_FACTS: FunFact[] = [
  {
    id: 'first_blood',
    title: 'First Blood Impact',
    description: 'Teams that secure the first kill often dictate the early game tempo.',
    scenario: 'first_blood',
    icon: 'skull-outline',
    color: '#ef4444',
    accent: 'text-red-500'
  },
  {
    id: 'courier_kill',
    title: 'Courier Kill Value',
    description: 'Interrupting enemy logistics by killing their courier has massive hidden value.',
    scenario: 'courier_kill',
    icon: 'cube-outline',
    color: '#f59e0b',
    accent: 'text-amber-500'
  },
  {
    id: 'roshan_kill',
    title: 'The Roshan Factor',
    description: 'Securing the first Roshan kill provides a significant strategic advantage.',
    scenario: 'roshan_kill',
    icon: 'flash-outline',
    color: '#6366f1',
    accent: 'text-indigo-500'
  },
  {
    id: 'tower_kill',
    title: 'Early Tower Pressure',
    description: 'Destroying the first tower opens up the map and boosts win probability.',
    scenario: 'tower_kill',
    icon: 'business-outline',
    color: '#10b981',
    accent: 'text-emerald-500'
  }
];

export function ScenarioFunFacts() {
  const scenarios = FUN_FACTS.map(f => f.scenario);
  const { data, isLoading } = useScenarioFunFacts(scenarios);

  return (
    <View className="px-4 space-y-6">
      {/* Header Info */}
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center gap-2">
          <Ionicons name="bulb" size={20} color="#f59e0b" />
          <Text className="text-white font-bold text-lg">Meta Fun Facts</Text>
        </View>
        <View className="bg-white/5 px-3 py-1 rounded-full border border-white/5">
          <Text className="text-zinc-500 text-[10px] font-bold uppercase">Live Statistics</Text>
        </View>
      </View>

      {/* Facts Grid */}
      <View className="space-y-4">
        {FUN_FACTS.map((fact) => {
          const stats = data?.[fact.scenario];
          const factLoading = isLoading || !stats;

          return (
            <View 
              key={fact.id}
              className="bg-zinc-900/40 rounded-3xl border border-white/5 overflow-hidden flex-row"
              style={{ borderLeftWidth: 4, borderLeftColor: stats?.winRate ? fact.color : '#333' }}
            >
              <View className="p-5 flex-1 flex-row gap-4">
                {/* Icon */}
                <View 
                  className="w-14 h-14 rounded-2xl items-center justify-center"
                  style={{ backgroundColor: fact.color + '15' }}
                >
                  <Ionicons name={fact.icon} size={28} color={fact.color} />
                </View>

                {/* Content */}
                <View className="flex-1">
                  <View className="flex-row justify-between items-center mb-1">
                    <Text className="text-white font-black text-base">{fact.title}</Text>
                    {factLoading ? (
                      <ActivityIndicator size="small" color={fact.color} />
                    ) : (
                      <View className={`px-2 py-0.5 rounded-full ${stats.winRate > 50 ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                        <Text className={`text-[10px] font-black ${stats.winRate > 50 ? 'text-emerald-500' : 'text-red-500'}`}>
                          +{ (stats.winRate - 50).toFixed(1) }% EDGE
                        </Text>
                      </View>
                    )}
                  </View>

                  <Text className="text-zinc-500 text-xs leading-tight mb-4" numberOfLines={2}>
                    {fact.description}
                  </Text>

                  <View className="flex-row items-end justify-between">
                    <View>
                      <Text className="text-zinc-600 text-[10px] font-bold uppercase mb-1">Win Rate</Text>
                      {factLoading ? (
                        <View className="h-6 w-16 bg-white/5 rounded-md animate-pulse" />
                      ) : (
                        <Text className="text-white text-2xl font-black">{stats.winRate.toFixed(1)}%</Text>
                      )}
                    </View>

                    {!factLoading && (
                      <Text className="text-zinc-600 text-[10px] mb-1">
                        {stats.games.toLocaleString()} games
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            </View>
          );
        })}
      </View>

      {/* Insight Box */}
      <View className="bg-indigo-500/5 border border-indigo-500/10 p-5 rounded-3xl flex-row gap-4">
        <View className="w-12 h-12 rounded-xl bg-indigo-500/20 items-center justify-center border border-indigo-500/30">
          <Ionicons name="flash" size={24} color="#818cf8" />
        </View>
        <View className="flex-1">
          <Text className="text-indigo-100 font-bold italic mb-1">"The Power of Momentum"</Text>
          <Text className="text-indigo-300/60 text-[11px] leading-relaxed">
            These statistics highlight the importance of "Winning the Laning Phase". While a 6-10% advantage might seem small, it significantly tilts the scales in millions of analyzed games.
          </Text>
        </View>
      </View>
    </View>
  );
}
