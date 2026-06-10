import React from 'react';
import { View, Text, Image, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getHeroImageUrl, getItemImageUrl, getItemImageUrlByName, HEROES } from '../../services/constants';
import { MatchDetails, Peer } from '../../services/types';
import { calculateLaningGrade } from '../../utils/matchAnalytics';

interface PlayerRowProps {
  player: MatchDetails['players'][0];
  index: number;
  peer: Peer | null | undefined;
  onPushPlayer?: (id: number) => void;
}

export const PlayerRow: React.FC<PlayerRowProps> = React.memo(({ player, index, peer, onPushPlayer }) => {
  const isAnonymous = !player.account_id;
  const mainItems = [player.item_0, player.item_1, player.item_2, player.item_3, player.item_4, player.item_5];
  const heroData = HEROES[player.hero_id];

  let attrColor = '#6b7280';
  if (heroData) {
    switch (heroData.primary_attr) {
      case 'str': attrColor = '#ef4444'; break;
      case 'agi': attrColor = '#22c55e'; break;
      case 'int': attrColor = '#06b6d4'; break;
      case 'all': attrColor = '#eab308'; break;
    }
  }

  const laningGrade = calculateLaningGrade(player.lane_efficiency_pct || null, player.benchmarks?.lhten?.pct || null);

  const showPerformanceInfo = () => {
    if (!player.benchmarks) return;
    const b = player.benchmarks;
    const format = (val: any) => val ? `${((val.pct || 0) * 100).toFixed(0)}th` : 'N/A';

    Alert.alert(
      `${player.personaname || 'Player'} Performance`,
      `Global Percentiles for ${HEROES[player.hero_id]?.localized_name || 'Hero'}:\n\n` +
      `• GPM: ${b.gold_per_min?.raw} (${format(b.gold_per_min)} percentile)\n` +
      `• XPM: ${b.xp_per_min?.raw} (${format(b.xp_per_min)} percentile)\n` +
      `• Kills: ${b.kills_per_min?.raw?.toFixed(2)} (${format(b.kills_per_min)})\n` +
      `• Hero Damage: ${b.hero_damage_per_min?.raw?.toFixed(0)} (${format(b.hero_damage_per_min)})\n` +
      `• Last Hits @ 10m: ${b.lhten?.raw} (${format(b.lhten)})\n\n` +
      (laningGrade ? `Laning Grade: ${laningGrade.grade} (${laningGrade.label})` : ''),
      [{ text: "Close", style: "cancel" }]
    );
  };

  return (
    <View className="border-b border-zinc-800 relative overflow-hidden">
      {/* Attribute Glow */}
      <View className="absolute -left-12 top-0 bottom-0 w-32 opacity-10 blur-xl" style={{ backgroundColor: attrColor }} />

      <TouchableOpacity
        onPress={() => !isAnonymous && onPushPlayer?.(player.account_id!)}
        onLongPress={showPerformanceInfo}
        disabled={isAnonymous || !onPushPlayer}
        className="py-3 active:bg-zinc-700 relative z-10"
      >
        <View className="flex-row items-center px-1">
          <View className="w-12 items-center">
            <View className="relative">
              <View className="absolute -inset-0.5 rounded blur-[2px] opacity-40" style={{ backgroundColor: attrColor }} />
              <Image source={{ uri: getHeroImageUrl(player.hero_id) }} className="w-10 h-7 rounded-sm shadow-sm" resizeMode="cover" />
            </View>
            <Text className="text-gray-500 text-[8px] mt-1 uppercase font-black">LVL {player.level}</Text>
          </View>
          <View className="flex-1 ml-2">
            <View className="flex-row items-center">
              <Text className="text-xs font-bold text-white mr-2" numberOfLines={1}>{player.personaname || 'Anonymous'}</Text>
              {isAnonymous && (
                <Ionicons name="eye-off-outline" size={10} color="#4b5563" className="mr-2" />
              )}
              {peer && (
                <View className="bg-gamingAccent/20 px-1.5 py-0.5 rounded border border-gamingAccent/30 flex-row items-center">
                  <Ionicons name="people" size={8} color="#8b5cf6" />
                  <Text className="text-gamingAccent text-[7px] font-bold ml-1 uppercase">History</Text>
                </View>
              )}
            </View>
            <View className="flex-row items-center mt-0.5">
              <Text className="text-[9px] text-gray-500">
                NW: {(player.net_worth / 1000).toFixed(1)}k • G/X: {player.gold_per_min}/{player.xp_per_min}
              </Text>
              {player.benchmarks?.gold_per_min && (
                <View className="ml-2 bg-zinc-800 px-1 rounded flex-row items-center border border-white/5">
                  <Ionicons name="trending-up" size={8} color={player.benchmarks.gold_per_min.pct > 0.8 ? "#10b981" : "#71717a"} />
                  <Text className={`text-[7px] font-black ml-0.5 ${player.benchmarks.gold_per_min.pct > 0.8 ? "text-win" : "text-gray-500"}`}>
                    {Math.round(player.benchmarks.gold_per_min.pct * 100)}%
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Performance Badge */}
          <TouchableOpacity onPress={showPerformanceInfo} className="mx-2 items-center">
            {laningGrade ? (
              <>
                <Text style={{ color: laningGrade.color }} className="text-xs font-black italic">{laningGrade.grade}</Text>
                <Text className="text-gray-600 text-[6px] font-black uppercase">PERF</Text>
              </>
            ) : (
              <>
                <Ionicons name="analytics-outline" size={14} color="#71717a" />
                <Text className="text-gray-600 text-[6px] font-black uppercase">STATS</Text>
              </>
            )}
          </TouchableOpacity>

          <View className="w-16 items-center">
            <Text className="text-white text-[10px] font-bold">{player.kills}/{player.deaths}/{player.assists}</Text>
            <Text className="text-gray-500 text-[9px]">{player.last_hits}/{player.denies}</Text>
          </View>
          <View className="w-20 items-end pr-2">
            <Text className="text-red-500 text-[9px] font-bold leading-tight">{player.hero_damage.toLocaleString()} HD</Text>
            <Text className="text-orange-500 text-[8px] font-bold leading-tight">{player.tower_damage.toLocaleString()} TD</Text>
            {player.hero_healing > 0 && <Text className="text-blue-500 text-[8px] font-bold leading-tight">{player.hero_healing.toLocaleString()} HH</Text>}
          </View>
          <View className="w-3">
            {!isAnonymous && onPushPlayer && <Ionicons name="chevron-forward" size={10} color="#4b5563" />}
          </View>
        </View>
        {/* Items Row */}
        <View className="flex-row items-center ml-14 mt-2">
          <View className="flex-row items-center bg-black/20 p-1 rounded-md border border-white/5">
            <View className="flex-row">
              {mainItems.map((itemId, i) => (
                <Image key={i} source={{ uri: getItemImageUrl(itemId) }} className="w-7 h-5 mr-1 rounded-[1px] bg-zinc-900/50" resizeMode="cover" />
              ))}
            </View>
            <View className="ml-1 border-l border-zinc-700 pl-2">
              <Image source={{ uri: getItemImageUrl(player.item_neutral) }} className="w-6 h-5 rounded-full bg-zinc-900 border border-zinc-600" resizeMode="cover" />
            </View>
          </View>

          {/* Permanent Buffs */}
          {player.permanent_buffs && player.permanent_buffs.length > 0 && (
            <View className="flex-row items-center ml-3">
              {player.permanent_buffs.map((buff, i) => {
                let buffImg = null;
                if (buff.permanent_buff === 'item_ultimate_scepter' || buff.permanent_buff === 'item_ultimate_scepter_2') {
                  buffImg = 'ultimate_scepter';
                } else if (buff.permanent_buff === 'item_aghanims_shard') {
                  buffImg = 'aghanims_shard';
                } else if (buff.permanent_buff === 'item_moon_shard') {
                  buffImg = 'moon_shard';
                }

                if (!buffImg) return null;

                return (
                  <View key={i} className="relative mr-1.5">
                    <Image
                      source={{ uri: getItemImageUrlByName(buffImg) }}
                      className="w-5 h-4 rounded-sm opacity-80"
                      resizeMode="cover"
                    />
                    {buff.stack_count > 1 && (
                      <View className="absolute -bottom-1 -right-1 bg-black/80 px-0.5 rounded">
                        <Text className="text-[6px] text-white font-bold">{buff.stack_count}</Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
});
