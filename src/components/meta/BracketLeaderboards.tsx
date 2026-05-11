import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { openDotaApi, HeroStats } from '../../services/opendota';
import { getHeroImageUrl } from '../../services/constants';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInRight } from 'react-native-reanimated';

const RANKS = [
  { id: 1, name: 'Herald' },
  { id: 2, name: 'Guardian' },
  { id: 3, name: 'Crusader' },
  { id: 4, name: 'Archon' },
  { id: 5, name: 'Legend' },
  { id: 6, name: 'Ancient' },
  { id: 7, name: 'Divine' },
  { id: 8, name: 'Immortal' },
];

interface HeroRankData {
  id: number;
  localized_name: string;
  winRate: number;
  pickRate: number;
  games: number;
}

export function BracketLeaderboards() {
  const [selectedRank, setSelectedRank] = useState<number>(8);
  const [data, setData] = useState<HeroRankData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);

      try {
        const stats = await openDotaApi.getHeroStats();

        const rankKey = selectedRank as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
        const isImmortal = selectedRank === 8;

        const pickKey = (
          isImmortal ? 'pro_pick' : `${rankKey}_pick`
        ) as keyof HeroStats;

        const winKey = (
          isImmortal ? 'pro_win' : `${rankKey}_win`
        ) as keyof HeroStats;

        const formatted: HeroRankData[] = stats
          .map(hero => {
            const picks = Number(hero[pickKey] || 0);
            const wins = Number(hero[winKey] || 0);

            return {
              id: hero.id,
              localized_name: hero.localized_name,
              winRate: picks > 0 ? (wins / picks) * 100 : 0,
              pickRate: picks,
              games: picks,
            };
          })
          .filter(h => h.games > (isImmortal ? 20 : 100))
          .sort((a, b) => b.winRate - a.winRate)
          .slice(0, 10);

        setData(formatted);
      } catch (error) {
        console.error('Error fetching bracket stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [selectedRank]);

  return (
    <View className="space-y-6 px-4">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mb-6"
        contentContainerStyle={{ paddingRight: 20 }}
      >
        <View className="flex-row bg-zinc-900/50 p-1.5 rounded-2xl border border-white/5">
          {RANKS.map(rank => (
            <TouchableOpacity
              key={rank.id}
              onPress={() => setSelectedRank(rank.id)}
              className={`px-4 py-2 rounded-xl mr-1 ${selectedRank === rank.id
                  ? 'bg-purple-600 shadow-lg shadow-purple-600/30'
                  : ''
                }`}
            >
              <Text
                className={`text-xs font-outfit-bold ${selectedRank === rank.id
                    ? 'text-white'
                    : 'text-gray-500'
                  }`}
              >
                {rank.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View className="bg-zinc-900/40 rounded-[32px] border border-white/5 overflow-hidden">
        <View className="p-5 border-b border-white/5 flex-row items-center justify-between bg-white/5">
          <View className="flex-row items-center">
            <View className="bg-purple-500/20 p-2 rounded-xl mr-3">
              <Ionicons name="trophy" size={20} color="#a855f7" />
            </View>

            <Text className="text-white font-outfit-black text-lg uppercase">
              Top 10 Heroes
            </Text>
          </View>

          <Text className="text-gray-500 text-[10px] font-outfit-bold uppercase tracking-widest">
            {RANKS.find(r => r.id === selectedRank)?.name} Bracket
          </Text>
        </View>

        <View className="p-2">
          {loading ? (
            <View className="py-20 items-center justify-center">
              <ActivityIndicator color="#a855f7" />

              <Text className="text-gray-500 font-outfit mt-4">
                Crunching numbers...
              </Text>
            </View>
          ) : data.length > 0 ? (
            data.map((hero, index) => (
              <Animated.View
                key={hero.id}
                entering={FadeInRight.delay(index * 50)}
                className="flex-row items-center p-3 mb-1 bg-white/5 rounded-2xl border border-white/5"
              >
                <View className="w-12 h-12 rounded-xl overflow-hidden border border-white/10 shrink-0">
                  <Image
                    source={{ uri: getHeroImageUrl(hero.id) }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                </View>

                <View className="flex-1 ml-4 justify-center">
                  <View className="flex-row justify-between items-baseline mb-1">
                    <Text className="text-white font-outfit-black text-sm uppercase tracking-tight">
                      {hero.localized_name}
                    </Text>

                    <Text
                      className={`font-outfit-black text-sm ${hero.winRate >= 53
                          ? 'text-emerald-400'
                          : 'text-white'
                        }`}
                    >
                      {hero.winRate.toFixed(1)}%
                    </Text>
                  </View>

                  <View className="flex-row items-center gap-2">
                    <View className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <View
                        className={`h-full rounded-full ${hero.winRate >= 53
                            ? 'bg-emerald-500'
                            : 'bg-purple-600'
                          }`}
                        style={{ width: `${hero.winRate}%` }}
                      />
                    </View>

                    <Text className="text-gray-500 text-[9px] font-outfit-black uppercase w-14 text-right">
                      {hero.games.toLocaleString()} GMS
                    </Text>
                  </View>
                </View>
              </Animated.View>
            ))
          ) : (
            <View className="py-20 items-center justify-center">
              <Ionicons
                name="alert-circle-outline"
                size={48}
                color="#3f3f46"
              />

              <Text className="text-gray-500 font-outfit-semibold text-center mt-4">
                No performance data found for this bracket
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}