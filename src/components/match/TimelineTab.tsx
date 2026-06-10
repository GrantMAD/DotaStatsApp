import React, { useState, useMemo } from 'react';
import { View, Text, Image, ScrollView, Dimensions, Pressable } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { MatchDetails } from '../../services/types';
import { getHeroImageUrl, getItemImageUrlByName } from '../../services/constants';
import { calculateLaningGrade } from '../../utils/matchAnalytics';
import PressableScale from '../PressableScale';
import { ParseInstructions } from './ParseInstructions';

interface TimelineTabProps {
  matchData: MatchDetails;
  parseRequested: boolean;
  isParsing: boolean;
  onRequestParse: () => void;
}

export const TimelineTab: React.FC<TimelineTabProps> = ({
  matchData,
  parseRequested,
  isParsing,
  onRequestParse,
}) => {
  const [selectedEvent, setSelectedEvent] = useState<{
    time: number;
    label: string;
    description: string;
    icon?: string;
    imageUrl?: string;
    color?: string;
    type: string;
  } | null>(null);
  const [scrubTime, setScrubTime] = useState<number | null>(null);

  const durationMins = Math.ceil(matchData.duration / 60);
  const screenWidth = Dimensions.get('window').width - 64;

  const objectives = useMemo(() => {
    if (!matchData.objectives) return [];

    return matchData.objectives.filter(obj =>
      ['building_kill', 'chat_roshan_kill', 'chat_aegis_pickup', 'chat_aegis_snatch', 'courier_kill'].includes(obj.type)
    ).map(obj => {
      let icon = 'castle';
      let imageUrl = null;
      let color = '#9ca3af';
      let label = 'Objective';
      let teamColor = obj.team === 2 ? 'text-win' : obj.team === 3 ? 'text-loss' : 'text-gray-400';
      let description = '';

      if (obj.type.includes('roshan')) {
        icon = 'skull';
        color = '#f59e0b';
        label = 'Roshan Slain';
        description = 'The immortal beast has fallen.';
      } else if (obj.type.includes('aegis')) {
        imageUrl = getItemImageUrlByName('aegis');
        color = '#8b5cf6';
        label = obj.type.includes('snatch') ? 'Aegis Snatched!' : 'Aegis Picked Up';
        description = obj.type.includes('snatch') ? 'A daring heist!' : 'Immortality claimed.';
      } else if (obj.type === 'courier_kill') {
        icon = 'package-variant';
        color = '#f59e0b';
        label = 'Courier Sniped!';
        description = 'Supply lines disrupted.';
      } else if (obj.type === 'building_kill') {
        const buildingName = obj.key?.replace('npc_dota_', '').replace(/_/g, ' ') || 'Building';
        label = buildingName.charAt(0).toUpperCase() + buildingName.slice(1);
        description = `${obj.team === 2 ? 'Radiant' : 'Dire'} lost a vital structure.`;
        if (obj.team === 2) {
          color = '#22c55e';
        } else {
          color = '#ef4444';
        }
      }

      return { ...obj, icon, imageUrl, color, label, teamColor, description };
    });
  }, [matchData.objectives]);

  const teamfights = useMemo(() => {
    if (!matchData.kill_log || matchData.kill_log.length < 3) return [];
    const kills = [...matchData.kill_log].sort((a, b) => a.time - b.time);
    const result: { time: number; count: number; description: string }[] = [];

    let currentGroup: typeof kills = [];
    for (let i = 0; i < kills.length; i++) {
      if (currentGroup.length === 0 || kills[i].time <= currentGroup[0].time + 40) {
        currentGroup.push(kills[i]);
      } else {
        if (currentGroup.length >= 3) {
          result.push({
            time: Math.floor(currentGroup[0].time + (currentGroup[currentGroup.length - 1].time - currentGroup[0].time) / 2),
            count: currentGroup.length,
            description: `${currentGroup.length} heroes perished in this clash.`
          });
        }
        currentGroup = [kills[i]];
      }
    }
    if (currentGroup.length >= 3) {
      result.push({
        time: Math.floor(currentGroup[0].time + (currentGroup[currentGroup.length - 1].time - currentGroup[0].time) / 2),
        count: currentGroup.length,
        description: `${currentGroup.length} heroes perished in this clash.`
      });
    }
    return result;
  }, [matchData.kill_log]);

  if (!matchData.version) {
    return (
      <ParseInstructions
        matchId={matchData.match_id}
        message="Timeline visualization requires parsed match data to track specific player events."
        parseRequested={parseRequested}
        isParsing={isParsing}
        onRequestParse={onRequestParse}
      />
    );
  }

  const handleScrub = (event: any) => {
    const x = event.nativeEvent.locationX;
    const time = Math.max(0, Math.min(matchData.duration, Math.floor(((x - 140) / 60) * 60)));
    setScrubTime(time);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getAdvantageAt = (time: number) => {
    if (!matchData.radiant_gold_adv) return 0;
    const index = Math.floor(time / 60);
    return matchData.radiant_gold_adv[index] || 0;
  };

  return (
    <View>
      <Text className="text-gray-400 uppercase tracking-widest text-[10px] font-bold mb-3 pl-1">Strategic Event Trajectory</Text>
      <View className="bg-[#2a2a2a] rounded-xl p-4 border border-zinc-800 relative">
        {/* Event Tooltip Overlay */}
        {selectedEvent && (
          <View className="absolute top-2 right-4 left-4 z-50 bg-[#1a1a1a]/95 border border-white/10 p-3 rounded-lg shadow-2xl flex-row items-center">
            <View className="p-2 bg-white/5 rounded-md mr-3">
              {selectedEvent.imageUrl ? (
                <Image source={{ uri: selectedEvent.imageUrl }} className="w-8 h-6" resizeMode="contain" />
              ) : (
                <MaterialCommunityIcons name={selectedEvent.icon as any} size={20} color={selectedEvent.color || '#fff'} />
              )}
            </View>
            <View className="flex-1">
              <View className="flex-row justify-between items-center mb-0.5">
                <Text className="text-white font-black text-xs uppercase">{selectedEvent.label}</Text>
                <Text className="text-gray-500 text-[10px] font-bold">{formatTime(selectedEvent.time)}</Text>
              </View>
              <Text className="text-gray-400 text-[10px] leading-tight">{selectedEvent.description}</Text>
            </View>
            <Pressable onPress={() => setSelectedEvent(null)} className="ml-2 p-1">
              <Ionicons name="close" size={16} color="#6b7280" />
            </Pressable>
          </View>
        )}

        <ScrollView horizontal nestedScrollEnabled={true} showsHorizontalScrollIndicator={true} className="mb-2">
          <View style={{ width: Math.max(screenWidth * 2, (matchData.duration / 60) * 60 + 400) }}>
            {/* Time scale */}
            <View className="flex-row mb-6 border-b border-zinc-800 pb-2">
              <View style={{ width: 180 }} />
              {Array.from({ length: Math.ceil(matchData.duration / 60 / 5) + 1 }).map((_, i) => (
                <View key={i} style={{ position: 'absolute', left: 180 + 140 + (i * 5 * 60) }}>
                  <Text className="text-[10px] text-gray-500 font-bold">{i * 5}'</Text>
                  <View className="w-[1px] h-3 bg-zinc-800 mt-1" />
                </View>
              ))}
            </View>

            {/* Advantage Ribbon (Interactive Scrubber) */}
            <View className="flex-row items-center h-12 mb-4">
              <View style={{ width: 180 }} className="flex-row items-center pr-4">
                <Ionicons name="trending-up" size={12} color="#6b7280" />
                <View className="ml-2">
                  <Text className="text-gray-500 text-[9px] font-black uppercase">Momentum</Text>
                  {scrubTime !== null && (
                    <Text className={`text-[8px] font-bold ${getAdvantageAt(scrubTime) >= 0 ? 'text-win' : 'text-loss'}`}>
                      {getAdvantageAt(scrubTime) > 0 ? '+' : ''}{getAdvantageAt(scrubTime).toLocaleString()} Gold
                    </Text>
                  )}
                </View>
              </View>
              <Pressable
                className="flex-1 h-full bg-black/40 rounded border border-white/5 overflow-hidden relative"
                onPress={handleScrub}
                onLongPress={handleScrub}
              >
                <View className="absolute top-1/2 left-0 right-0 h-px bg-white/10" />
                <View className="flex-row h-full">
                  {matchData.radiant_gold_adv?.filter((_, i) => i % 5 === 0).map((gold, i) => {
                    const h = Math.min(Math.abs(gold) / 1500, 20);
                    return (
                      <View key={i} style={{ flex: 1, backgroundColor: gold >= 0 ? '#10b981' : '#ef4444', height: h, marginTop: gold >= 0 ? -h : h, alignSelf: 'center', opacity: 0.25 }} />
                    );
                  })}
                </View>

                {/* Scrubber Line */}
                {scrubTime !== null && (
                  <View
                    style={{ position: 'absolute', left: 140 + (scrubTime / 60) * 60, top: 0, bottom: 0, width: 2, backgroundColor: '#3b82f6', zIndex: 30 }}
                  >
                    <View className="absolute -top-1 -left-1 w-2.5 h-2.5 rounded-full bg-blue-500 shadow-lg border border-white/20" />
                  </View>
                )}
              </Pressable>
            </View>

            {/* Teamfights Row */}
            <View className="flex-row items-center h-10 mb-4">
              <View style={{ width: 180 }} className="flex-row items-center pr-4">
                <MaterialCommunityIcons name="sword-cross" size={12} color="#f87171" />
                <Text className="text-gray-500 text-[9px] font-black uppercase ml-2">Teamfights</Text>
              </View>
              <View className="flex-1 h-full bg-red-500/5 rounded border border-red-500/10 relative">
                {teamfights.map((tf, i) => {
                  const leftPos = 140 + (tf.time / 60) * 60;
                  return (
                    <View key={i} style={{ position: 'absolute', left: leftPos, top: '50%', transform: [{ translateY: -10 }, { translateX: -10 }] }} className="z-20">
                      <PressableScale
                        onPress={() => setSelectedEvent({
                          time: tf.time,
                          label: 'Major Teamfight',
                          description: tf.description,
                          icon: 'sword-cross',
                          color: '#f87171',
                          type: 'teamfight'
                        })}
                        className="p-1 rounded bg-black/60 border border-red-500/40"
                      >
                        <MaterialCommunityIcons name="sword-cross" size={12} color="#f87171" />
                      </PressableScale>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Objectives Row */}
            <View className="flex-row items-center h-10 mb-4">
              <View style={{ width: 180 }} className="flex-row items-center pr-4">
                <MaterialCommunityIcons name="castle" size={12} color="#6b7280" />
                <Text className="text-gray-500 text-[9px] font-black uppercase ml-2">Objectives</Text>
              </View>
              <View className="flex-1 h-full bg-white/5 rounded border border-white/5 relative">
                {objectives.map((obj, oIdx) => {
                  const leftPos = 140 + (obj.time / 60) * 60;
                  return (
                    <View key={oIdx} style={{ position: 'absolute', left: leftPos, top: '50%', transform: [{ translateY: -10 }, { translateX: -10 }] }} className="z-20">
                      <PressableScale
                        onPress={() => setSelectedEvent({
                          time: obj.time,
                          label: obj.label,
                          description: obj.description,
                          icon: obj.icon,
                          imageUrl: obj.imageUrl || undefined,
                          color: obj.color,
                          type: 'objective'
                        })}
                        className="p-1 rounded border bg-black/80 shadow-md" style={{ borderColor: obj.color + '40' }}
                      >
                        {obj.imageUrl ? (
                          <Image source={{ uri: obj.imageUrl }} className="w-5 h-4" resizeMode="contain" />
                        ) : (
                          <MaterialCommunityIcons name={obj.icon as any} size={10} color={obj.color} />
                        )}
                      </PressableScale>
                    </View>
                  );
                })}
              </View>
            </View>

            {matchData.players.map((p, pIdx) => {
              const laningGrade = calculateLaningGrade(p.lane_efficiency_pct || null, p.benchmarks?.lhten?.pct || null);
              const events: { time: number; type: 'purchase' | 'buyback' | 'milestone'; key?: string; icon?: any; label?: string; color?: string; description?: string }[] = [];

              if (p.purchase_log) {
                p.purchase_log.forEach(item => {
                  const minorItems = ['recipe', 'ward_observer', 'ward_sentry', 'smoke_of_deceit', 'dust', 'clarity', 'flask', 'tango', 'enchanted_mango', 'bottle', 'tpscroll', 'ward_dispenser', 'faerie_fire'];
                  if (!minorItems.some(minor => item.key.includes(minor))) {
                    events.push({
                      time: item.time,
                      type: 'purchase',
                      key: item.key,
                      label: item.key.replace('item_', '').replace(/_/g, ' '),
                      description: `Purchased by ${p.personaname || 'Player'}`
                    });
                  }
                });
              }
              if (p.buyback_log) {
                p.buyback_log.forEach(bb => events.push({
                  time: bb.time,
                  type: 'buyback',
                  key: 'buyback',
                  label: 'Buyback Used',
                  description: `${p.personaname || 'Player'} returned to the battle.`
                }));
              }

              // Triple Kills Detection
              if (p.kill_log) {
                let comboCount = 0;
                let lastKillTime = -100;
                p.kill_log.forEach((k) => {
                  if (k.time <= lastKillTime + 18) {
                    comboCount++;
                    if (comboCount >= 3) {
                      let label = 'Triple Kill!';
                      if (comboCount === 4) label = 'Ultra Kill!';
                      if (comboCount >= 5) label = 'RAMPAGE!';
                      events.push({
                        time: k.time,
                        type: 'milestone',
                        icon: 'trophy',
                        label,
                        color: '#10b981',
                        description: `${p.personaname || 'Player'} is on a tear!`
                      });
                    }
                  } else {
                    comboCount = 1;
                  }
                  lastKillTime = k.time;
                });
              }

              // Courier Kills Detection
              (matchData.objectives || []).forEach(obj => {
                if (obj.type === 'courier_kill' && (obj.player_slot === p.player_slot || obj.slot === p.player_slot)) {
                  events.push({
                    time: obj.time,
                    type: 'milestone',
                    icon: 'package-variant',
                    label: 'Courier Sniped!',
                    color: '#f59e0b',
                    description: 'A critical supply line was severed.'
                  });
                }
              });

              return (
                <View key={pIdx} className="flex-row items-center h-14 border-b border-zinc-800/30">
                  <View style={{ width: 180 }} className="flex-row items-center pr-4 bg-[#2a2a2a] z-20">
                    <View className="relative">
                      <Image source={{ uri: getHeroImageUrl(p.hero_id) }} className="w-12 h-8 rounded-sm border border-white/10" />
                    </View>
                    <View className="ml-3 flex-1">
                      <Text className="text-white text-xs font-bold" numberOfLines={1}>{p.personaname || 'Anonymous'}</Text>
                      <Text className="text-gray-500 text-[8px] uppercase font-bold">Slot {p.player_slot}</Text>
                    </View>
                  </View>

                  <View className="flex-1 relative h-full justify-center overflow-hidden">
                    <View className="absolute left-0 right-0 h-[1px] bg-zinc-800/50" />

                    {/* Lane Outcome Marker */}
                    {laningGrade && durationMins >= 10 && (
                      <View
                        style={{ position: 'absolute', left: 140 + (10 * 60), top: '50%', transform: [{ translateY: -10 }, { translateX: -10 }] }}
                        className="z-10"
                      >
                        <PressableScale
                          onPress={() => setSelectedEvent({
                            time: 600,
                            label: `Lane Outcome: ${laningGrade.label}`,
                            description: `Efficiency: ${p.lane_efficiency_pct || 0}%\nLH@10: ${p.benchmarks?.lhten?.raw || 0} (${laningGrade.grade})`,
                            icon: laningGrade.grade.startsWith('A') ? "star" : "flash",
                            color: laningGrade.color === 'text-win' ? '#10b981' : laningGrade.color === 'text-loss' ? '#ef4444' : '#f59e0b',
                            type: 'milestone'
                          })}
                          className="shadow-lg bg-black/80 rounded-full border border-white/10 p-0.5"
                        >
                          <Ionicons
                            name={laningGrade.grade.startsWith('A') ? "checkmark-circle" : laningGrade.grade.startsWith('B') || laningGrade.grade.startsWith('C+') ? "remove-circle" : "close-circle"}
                            size={14}
                            color={laningGrade.color === 'text-win' ? '#10b981' : laningGrade.color === 'text-loss' ? '#ef4444' : '#f59e0b'}
                          />
                        </PressableScale>
                      </View>
                    )}

                    {(() => {
                      const usedPositions: Record<number, number> = {};
                      return events.map((event, eIdx) => {
                        const baseLeft = 140 + (event.time / 60) * 60;
                        const bucket = Math.round(baseLeft / 8) * 8;
                        const offsetCount = usedPositions[bucket] || 0;
                        usedPositions[bucket] = offsetCount + 1;
                        const horizontalOffset = offsetCount * 22;
                        const finalLeft = baseLeft + horizontalOffset;
                        const buybackIcon = 'https://www.opendota.com/assets/images/dota2/buyback_icon.png';
                        return (
                          <View key={eIdx} style={{ position: 'absolute', left: finalLeft, top: '50%', marginTop: -12, transform: [{ translateX: -15 }] }} className="z-10 shadow-md">
                            <PressableScale
                              onPress={() => setSelectedEvent({
                                time: event.time,
                                label: event.label || 'Event',
                                description: event.description || '',
                                icon: event.icon,
                                imageUrl: event.type === 'buyback' ? buybackIcon : getItemImageUrlByName(event.key || ''),
                                color: event.color,
                                type: event.type
                              })}
                              className={`p-[1px] rounded-[3px] border ${
                                event.type === 'buyback' ? 'bg-orange-500 border-orange-300' :
                                  event.type === 'milestone' ? 'bg-black/60 border-white/20' :
                                    'bg-zinc-800 border-zinc-600'
                                }`}
                            >
                              {event.type === 'buyback' ? (
                                <Image source={{ uri: buybackIcon }} className="w-7 h-5 rounded-[2px]" resizeMode="cover" />
                              ) : event.type === 'milestone' ? (
                                <MaterialCommunityIcons name={event.icon} size={14} color={event.color} style={{ marginHorizontal: 2 }} />
                              ) : (
                                <Image source={{ uri: getItemImageUrlByName(event.key || '') }} className="w-7 h-5 rounded-[2px]" resizeMode="cover" />
                              )}
                            </PressableScale>
                          </View>
                        );
                      });
                    })()}
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </View>
    </View>
  );
};
