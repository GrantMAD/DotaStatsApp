import React from 'react';
import { View, Text, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getHeroImageUrl } from '../../services/constants';
import { PickBan } from '../../services/types';

interface DraftDisplayProps {
  picksBans: PickBan[];
  gameMode: number;
  draftAdvantage: number;
}

export const DraftDisplay: React.FC<DraftDisplayProps> = React.memo(({ picksBans, gameMode, draftAdvantage }) => {
  const radiantPicks = picksBans.filter(pb => pb.team === 0 && pb.is_pick).sort((a, b) => a.order - b.order);
  const direPicks = picksBans.filter(pb => pb.team === 1 && pb.is_pick).sort((a, b) => a.order - b.order);

  const allBans = picksBans.filter(pb => !pb.is_pick).sort((a, b) => a.order - b.order);
  const radiantBans = allBans.filter(pb => pb.team === 0);
  const direBans = allBans.filter(pb => pb.team === 1);

  const isStructuredDraft = gameMode === 2 || gameMode === 16;

  return (
    <View className="bg-[#2a2a2a] p-5 rounded-2xl mb-6 border border-zinc-800 shadow-xl overflow-hidden relative">
      <View className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-win/20 via-transparent to-loss/20 opacity-30" />

      <Text className="text-gray-500 uppercase tracking-[0.3em] text-[9px] font-black mb-6 text-center">Strategic Draft Analysis</Text>

      <View className="flex-row items-center justify-between mb-6 px-2">
        {/* Radiant Picks */}
        <View className="flex-1 items-center">
          <View className="flex-row flex-wrap justify-center gap-1.5">
            {radiantPicks.map((p, i) => (
              <View key={i} className="relative">
                <Image source={{ uri: getHeroImageUrl(p.hero_id) }} className="w-9 h-5 rounded-sm border border-win/20 shadow-sm" />
                <View className="absolute -bottom-1 -right-1 bg-black/80 px-1 rounded-[2px] border border-win/20">
                  <Text className="text-win text-[6px] font-bold">{i + 1}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Advantage Center */}
        <View className="items-center px-4">
          <View className="flex-row items-center mb-1">
            <Text className={`text-sm font-black italic ${draftAdvantage > 50 ? 'text-win' : 'text-gray-500'}`}>{draftAdvantage.toFixed(0)}%</Text>
            <Text className="text-gray-600 text-[8px] mx-1 font-bold">VS</Text>
            <Text className={`text-sm font-black italic ${draftAdvantage < 50 ? 'text-loss' : 'text-gray-500'}`}>{(100 - draftAdvantage).toFixed(0)}%</Text>
          </View>
          <View className="w-16 h-1 bg-zinc-800 rounded-full flex-row overflow-hidden border border-white/5">
            <View style={{ width: `${draftAdvantage}%` }} className="h-full bg-win" />
            <View style={{ width: `${100 - draftAdvantage}%` }} className="h-full bg-loss" />
          </View>
        </View>

        {/* Dire Picks */}
        <View className="flex-1 items-center">
          <View className="flex-row flex-wrap justify-center gap-1.5">
            {direPicks.map((p, i) => (
              <View key={i} className="relative">
                <Image source={{ uri: getHeroImageUrl(p.hero_id) }} className="w-9 h-5 rounded-sm border border-loss/20 shadow-sm" />
                <View className="absolute -bottom-1 -right-1 bg-black/80 px-1 rounded-[2px] border border-loss/20">
                  <Text className="text-loss text-[6px] font-bold">{i + 1}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Draft Flavor Text */}
      <View className="flex-row items-center justify-center bg-zinc-900/80 py-2.5 px-5 rounded-full self-center border border-white/10 shadow-lg">
        <MaterialCommunityIcons
          name={draftAdvantage > 55 ? "trending-up" : draftAdvantage < 45 ? "trending-down" : "scale-balance"}
          size={14}
          color={draftAdvantage > 55 ? "#10b981" : draftAdvantage < 45 ? "#ef4444" : "#a1a1aa"}
        />
        <Text className={`text-[10px] font-black uppercase tracking-[0.1em] ml-2 ${
          draftAdvantage > 55 ? "text-win" : draftAdvantage < 45 ? "text-loss" : "text-gray-400"
          }`}>
          {draftAdvantage > 55 ? "Radiant Draft Advantage" : draftAdvantage < 45 ? "Dire Draft Advantage" : "Balanced Composition"}
        </Text>
      </View>

      {isStructuredDraft && (
        <View className="flex-row justify-between mt-6 pt-4 border-t border-zinc-800/50 opacity-40 grayscale">
          <View className="flex-row gap-1">
            {radiantBans.map((b, i) => (
              <Image key={i} source={{ uri: getHeroImageUrl(b.hero_id) }} className="w-6 h-4 rounded-sm border border-zinc-700" />
            ))}
          </View>
          <View className="flex-row gap-1">
            {direBans.map((b, i) => (
              <Image key={i} source={{ uri: getHeroImageUrl(b.hero_id) }} className="w-6 h-4 rounded-sm border border-zinc-700" />
            ))}
          </View>
        </View>
      )}
    </View>
  );
});
