import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PlayerMatchFilters } from '../services/opendota';

interface MatchFiltersProps {
  filters: PlayerMatchFilters;
  onFilterChange: (filters: PlayerMatchFilters) => void;
}

const DATE_OPTIONS = [
  { label: 'All Time', value: undefined },
  { label: '30 Days', value: 30 },
  { label: '60 Days', value: 60 },
  { label: '180 Days', value: 180 },
];

const WIN_OPTIONS = [
  { label: 'All Results', value: undefined },
  { label: 'Wins Only', value: 1 },
  { label: 'Losses Only', value: 0 },
];

const MODE_OPTIONS = [
  { label: 'All Modes', value: undefined },
  { label: 'Ranked', value: 7 },
  { label: 'Turbo', value: 23 },
  { label: 'All Pick', value: 1 },
];

type FilterTab = 'win' | 'date' | 'game_mode';

export default function MatchFilters({ filters, onFilterChange }: MatchFiltersProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>('win');

  const hasFilters = filters.win !== undefined || filters.date !== undefined || filters.game_mode !== undefined;

  const tabs: { label: string, key: FilterTab, options: { label: string, value: any }[] }[] = [
    { label: 'Result', key: 'win', options: WIN_OPTIONS },
    { label: 'Timeframe', key: 'date', options: DATE_OPTIONS },
    { label: 'Game Mode', key: 'game_mode', options: MODE_OPTIONS },
  ];

  const currentTab = tabs.find(t => t.key === activeTab)!;

  return (
    <View className="py-2">
      {/* Header & Clear */}
      <View className="flex-row items-center justify-between px-4 mb-3">
        <View className="flex-row items-center">
          <Ionicons name="filter" size={16} color="#8b5cf6" />
          <Text className="text-white font-outfit-bold ml-2 uppercase tracking-tighter">Filters</Text>
        </View>
        {hasFilters && (
          <TouchableOpacity 
            onPress={() => onFilterChange({ limit: filters.limit })}
            className="bg-red-500/10 px-3 py-1 rounded-lg border border-red-500/20"
          >
            <Text className="text-red-400 text-[10px] font-outfit-bold uppercase">Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Tabs */}
      <View className="flex-row px-4 mb-4 border-b border-white/5">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          const isFiltered = filters[tab.key] !== undefined;
          
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              className={`mr-6 pb-2 border-b-2 relative ${isActive ? 'border-purple-500' : 'border-transparent'}`}
            >
              <Text className={`font-outfit-bold text-[11px] uppercase ${isActive ? 'text-white' : 'text-gray-500'}`}>
                {tab.label}
              </Text>
              {isFiltered && !isActive && (
                <View className="absolute -top-1 -right-2 w-1.5 h-1.5 bg-purple-500 rounded-full" />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Options Scroll */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 pb-2">
        {currentTab.options.map((opt, i) => {
          const isActive = filters[activeTab] === opt.value;
          return (
            <TouchableOpacity
              key={i}
              onPress={() => onFilterChange({ ...filters, [activeTab]: opt.value })}
              className={`mr-2 px-4 py-2 rounded-full border ${
                isActive 
                  ? 'bg-purple-500 border-purple-400 shadow-lg shadow-purple-500/50' 
                  : 'bg-zinc-800/50 border-zinc-700'
              }`}
            >
              <Text className={`text-xs font-outfit-bold ${isActive ? 'text-white' : 'text-gray-400'}`}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
