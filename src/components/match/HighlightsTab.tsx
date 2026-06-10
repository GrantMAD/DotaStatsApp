import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { MatchDetails } from '../../services/types';

interface HighlightsTabProps {
  matchData: MatchDetails;
}

export const HighlightsTab: React.FC<HighlightsTabProps> = ({ matchData }) => {
  const getHighlights = (match: MatchDetails) => {
    const sortedPlayers = [...match.players];
    const topDamage = [...sortedPlayers].sort((a, b) => b.hero_damage - a.hero_damage)[0];
    const topNetWorth = [...sortedPlayers].sort((a, b) => b.net_worth - a.net_worth)[0];
    const topTowers = [...sortedPlayers].sort((a, b) => b.tower_damage - a.tower_damage)[0];
    const topHealing = [...sortedPlayers].sort((a, b) => b.hero_healing - a.hero_healing)[0];
    const topStacks = [...sortedPlayers].sort((a, b) => (b.camps_stacked || 0) - (a.camps_stacked || 0))[0];
    const topWards = [...sortedPlayers].sort((a, b) => ((b.obs_placed || 0) + (b.sen_placed || 0)) - ((a.obs_placed || 0) + (a.sen_placed || 0)))[0];
    return { topDamage, topNetWorth, topTowers, topHealing, topStacks, topWards };
  };

  const h = getHighlights(matchData);

  return (
    <View>
      <View className="flex-row gap-3 mb-3">
        <View className="flex-1 bg-[#2a2a2a] p-4 rounded-xl flex-row items-center border border-red-900/20">
          <View className="bg-red-500/10 p-2 rounded-full mr-3"><Ionicons name="flame" size={20} color="#ef4444" /></View>
          <View className="flex-1">
            <Text className="text-red-500 text-[8px] font-bold uppercase">Hero Damage</Text>
            <Text className="text-white font-bold text-xs" numberOfLines={1}>{h.topDamage.personaname || 'Anonymous'}</Text>
            <Text className="text-gray-400 text-[10px]">{h.topDamage.hero_damage.toLocaleString()}</Text>
          </View>
        </View>
        <View className="flex-1 bg-[#2a2a2a] p-4 rounded-xl flex-row items-center border border-yellow-900/20">
          <View className="bg-yellow-500/10 p-2 rounded-full mr-3"><Ionicons name="cash" size={20} color="#eab308" /></View>
          <View className="flex-1">
            <Text className="text-yellow-500 text-[8px] font-bold uppercase">Net Worth</Text>
            <Text className="text-white font-bold text-xs" numberOfLines={1}>{h.topNetWorth.personaname || 'Anonymous'}</Text>
            <Text className="text-gray-400 text-[10px]">{(h.topNetWorth.net_worth / 1000).toFixed(1)}k</Text>
          </View>
        </View>
      </View>

      <View className="flex-row gap-3 mb-3">
        <View className="flex-1 bg-[#2a2a2a] p-4 rounded-xl flex-row items-center border border-orange-900/20">
          <View className="bg-orange-500/10 p-2 rounded-full mr-3"><MaterialCommunityIcons name="castle" size={20} color="#f97316" /></View>
          <View className="flex-1">
            <Text className="text-orange-500 text-[8px] font-bold uppercase">Tower Damage</Text>
            <Text className="text-white font-bold text-xs" numberOfLines={1}>{h.topTowers.personaname || 'Anonymous'}</Text>
            <Text className="text-gray-400 text-[10px]">{h.topTowers.tower_damage.toLocaleString()}</Text>
          </View>
        </View>
        <View className="flex-1 bg-[#2a2a2a] p-4 rounded-xl flex-row items-center border border-blue-900/20">
          <View className="bg-blue-500/10 p-2 rounded-full mr-3"><Ionicons name="heart" size={20} color="#3b82f6" /></View>
          <View className="flex-1">
            <Text className="text-blue-500 text-[8px] font-bold uppercase">Hero Healing</Text>
            <Text className="text-white font-bold text-xs" numberOfLines={1}>{h.topHealing.personaname || 'Anonymous'}</Text>
            <Text className="text-gray-400 text-[10px]">{h.topHealing.hero_healing.toLocaleString()}</Text>
          </View>
        </View>
      </View>

      <View className="flex-row gap-3">
        <View className="flex-1 bg-[#2a2a2a] p-4 rounded-xl flex-row items-center border border-green-900/20">
          <View className="bg-green-500/10 p-2 rounded-full mr-3"><Ionicons name="eye" size={20} color="#22c55e" /></View>
          <View className="flex-1">
            <Text className="text-green-500 text-[8px] font-bold uppercase">Vision Support</Text>
            <Text className="text-white font-bold text-xs" numberOfLines={1}>{h.topWards.personaname || 'Anonymous'}</Text>
            <Text className="text-gray-400 text-[10px]">{(h.topWards.obs_placed || 0) + (h.topWards.sen_placed || 0)} Wards</Text>
          </View>
        </View>
        <View className="flex-1 bg-[#2a2a2a] p-4 rounded-xl flex-row items-center border border-purple-900/20">
          <View className="bg-purple-500/10 p-2 rounded-full mr-3"><MaterialCommunityIcons name="layers" size={20} color="#a855f7" /></View>
          <View className="flex-1">
            <Text className="text-purple-500 text-[8px] font-bold uppercase">Stack Master</Text>
            <Text className="text-white font-bold text-xs" numberOfLines={1}>{h.topStacks.personaname || 'Anonymous'}</Text>
            <Text className="text-gray-400 text-[10px]">{h.topStacks.camps_stacked || 0} Stacks</Text>
          </View>
        </View>
      </View>
    </View>
  );
};
