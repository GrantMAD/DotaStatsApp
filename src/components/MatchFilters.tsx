import React from 'react';
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

export default function MatchFilters({ filters, onFilterChange }: MatchFiltersProps) {
  const renderFilterGroup = (
    title: string, 
    options: { label: string, value: any }[], 
    currentValue: any, 
    field: keyof PlayerMatchFilters
  ) => (
    <View className="mb-4">
      <Text className="text-gray-500 text-[10px] uppercase font-outfit-black tracking-widest mb-2 ml-4">
        {title}
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4">
        {options.map((opt, i) => {
          const isActive = currentValue === opt.value;
          return (
            <TouchableOpacity
              key={i}
              onPress={() => onFilterChange({ ...filters, [field]: opt.value })}
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

  const hasFilters = filters.win !== undefined || filters.date !== undefined || filters.game_mode !== undefined;

  return (
    <View className="py-2">
      <View className="flex-row items-center justify-between px-4 mb-4">
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

      {renderFilterGroup('Result', WIN_OPTIONS, filters.win, 'win')}
      {renderFilterGroup('Timeframe', DATE_OPTIONS, filters.date, 'date')}
      {renderFilterGroup('Game Mode', MODE_OPTIONS, filters.game_mode, 'game_mode')}
    </View>
  );
}
