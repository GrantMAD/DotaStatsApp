import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert
} from 'react-native';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { LineChart } from "react-native-chart-kit";
import {
  requestMatchParse,
  MatchDetails,
  GAME_MODES,
  PickBan,
  MatchObjective
} from '../services/opendota';
import {
  getHeroImageUrl,
  getItemImageUrl,
  getItemImageUrlByName,
  LOBBY_TYPES,
  REGIONS,
  HEROES
} from '../services/constants';
import { getChatWheelPhrase } from '../services/chatwheel';
import * as Linking from 'expo-linking';
import { useMatchDetails, usePlayerPeers } from '../hooks/useOpenDota';
import { useSupabaseAuth } from '../context/SupabaseAuthContext';
import { MatchOverviewSkeleton } from './Skeleton';
import GlassModal from './GlassModal';
import MeshGradient from './MeshGradient';
import { calculateLaningGrade } from '../utils/matchAnalytics';
import { LinearGradient } from 'expo-linear-gradient';

type MatchTab = 'Scoreboard' | 'Highlights' | 'Economy' | 'Timeline' | 'Chat';

interface MatchOverviewModalProps {
  visible: boolean;
  matchId: number | null;
  onClose: () => void;
  onPushPlayer?: (id: number) => void;
}

// --- Enhanced Timeline Component ---
function MatchTimeline({ match }: { match: MatchDetails }) {
  const durationMins = Math.ceil(match.duration / 60);
  const screenWidth = Dimensions.get('window').width - 64;

  // Filter and group objectives
  const objectives = useMemo(() => {
    if (!match.objectives) return [];
    
    return match.objectives.filter(obj => 
      ['building_kill', 'chat_roshan_kill', 'chat_aegis_pickup', 'chat_aegis_snatch', 'courier_kill'].includes(obj.type)
    ).map(obj => {
      let icon = 'castle';
      let imageUrl = null;
      let color = '#9ca3af';
      let label = 'Objective';
      let teamColor = obj.team === 2 ? 'text-win' : obj.team === 3 ? 'text-loss' : 'text-gray-400';

      if (obj.type.includes('roshan')) {
        icon = 'skull';
        color = '#f59e0b';
        label = 'Roshan Slain';
      } else if (obj.type.includes('aegis')) {
        imageUrl = getItemImageUrlByName('aegis');
        color = '#8b5cf6';
        label = obj.type.includes('snatch') ? 'Aegis Snatched!' : 'Aegis Picked Up';
      } else if (obj.type === 'courier_kill') {
        icon = 'package-variant';
        color = '#f59e0b';
        label = 'Courier Sniped!';
      } else if (obj.type === 'building_kill') {
        label = obj.key?.replace('npc_dota_', '').replace(/_/g, ' ') || 'Building Destroyed';
        if (obj.team === 2) {
          color = '#22c55e';
        } else {
          color = '#ef4444';
        }
      }

      return { ...obj, icon, imageUrl, color, label, teamColor };
    });
  }, [match.objectives]);

  return (
    <View className="bg-[#2a2a2a] rounded-xl p-4 border border-zinc-800">
      <ScrollView horizontal nestedScrollEnabled={true} showsHorizontalScrollIndicator={true} className="mb-2">
        <View style={{ width: Math.max(screenWidth * 2, (match.duration / 60) * 60 + 400) }}>
          {/* Time scale */}
          <View className="flex-row mb-6 border-b border-zinc-800 pb-2">
            <View style={{ width: 180 }} /> 
            {Array.from({ length: Math.ceil(match.duration / 60 / 5) + 1 }).map((_, i) => (
              <View key={i} style={{ position: 'absolute', left: 180 + 140 + (i * 5 * 60) }}>
                <Text className="text-[10px] text-gray-500 font-bold">{i * 5}'</Text>
                <View className="w-[1px] h-3 bg-zinc-800 mt-1" />
              </View>
            ))}
          </View>

          {/* Advantage Ribbon (Simplified for Mobile) */}
          <View className="flex-row items-center h-8 mb-4">
             <View style={{ width: 180 }} className="flex-row items-center pr-4">
                <Ionicons name="trending-up" size={12} color="#6b7280" />
                <Text className="text-gray-500 text-[9px] font-black uppercase ml-2">Momentum</Text>
             </View>
             <View className="flex-1 h-full bg-black/40 rounded border border-white/5 overflow-hidden">
                <View className="absolute top-1/2 left-0 right-0 h-px bg-white/10" />
                <View className="flex-row h-full">
                   {match.radiant_gold_adv?.filter((_, i) => i % 5 === 0).map((gold, i) => {
                      const h = Math.min(Math.abs(gold) / 2000, 15);
                      return (
                         <View key={i} style={{ flex: 1, backgroundColor: gold >= 0 ? '#10b981' : '#ef4444', height: h, marginTop: gold >= 0 ? -h : h, alignSelf: 'center', opacity: 0.2 }} />
                      );
                   })}
                </View>
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
                      <View className="p-1 rounded border bg-black/80 shadow-md" style={{ borderColor: obj.color + '40' }}>
                         {obj.imageUrl ? (
                           <Image source={{ uri: obj.imageUrl }} className="w-5 h-4" resizeMode="contain" />
                         ) : (
                           <MaterialCommunityIcons name={obj.icon as any} size={10} color={obj.color} />
                         )}
                      </View>
                    </View>
                  );
                })}
             </View>
          </View>

          {match.players.map((p, pIdx) => {
            const laningGrade = calculateLaningGrade(p.lane_efficiency_pct || null, p.benchmarks?.lhten?.pct || null);
            const events: { time: number; type: 'purchase' | 'buyback' | 'milestone'; key?: string; icon?: any; label?: string; color?: string }[] = [];
            
            if (p.purchase_log) {
              p.purchase_log.forEach(item => {
                const minorItems = ['recipe', 'ward_observer', 'ward_sentry', 'smoke_of_deceit', 'dust', 'clarity', 'flask', 'tango', 'enchanted_mango', 'bottle', 'tpscroll', 'ward_dispenser', 'faerie_fire'];
                if (!minorItems.some(minor => item.key.includes(minor))) {
                  events.push({ time: item.time, type: 'purchase', key: item.key });
                }
              });
            }
            if (p.buyback_log) {
              p.buyback_log.forEach(bb => events.push({ time: bb.time, type: 'buyback', key: 'buyback' }));
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
                     events.push({ time: k.time, type: 'milestone', icon: 'trophy', label, color: '#10b981' });
                  }
                } else {
                  comboCount = 1;
                }
                lastKillTime = k.time;
              });
            }

            // Courier Kills Detection
            (match.objectives || []).forEach(obj => {
              if (obj.type === 'courier_kill' && (obj.player_slot === p.player_slot || obj.slot === p.player_slot)) {
                events.push({ time: obj.time, type: 'milestone', icon: 'package-variant', label: 'Courier Sniped!', color: '#f59e0b' });
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
                      className="z-10 shadow-lg bg-black/80 rounded-full border border-white/10 p-0.5"
                    >
                        <Ionicons 
                          name={laningGrade.grade.startsWith('A') ? "checkmark-circle" : laningGrade.grade.startsWith('B') || laningGrade.grade.startsWith('C+') ? "remove-circle" : "close-circle"} 
                          size={14} 
                          color={laningGrade.color === 'text-win' ? '#10b981' : laningGrade.color === 'text-loss' ? '#ef4444' : '#f59e0b'} 
                        />
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
                          <View className={`p-[1px] rounded-[3px] border ${
                            event.type === 'buyback' ? 'bg-orange-500 border-orange-300' : 
                            event.type === 'milestone' ? 'bg-black/60 border-white/20' :
                            'bg-zinc-800 border-zinc-600'
                          }`}>
                             {event.type === 'buyback' ? (
                               <Image source={{ uri: buybackIcon }} className="w-7 h-5 rounded-[2px]" resizeMode="cover" />
                             ) : event.type === 'milestone' ? (
                               <MaterialCommunityIcons name={event.icon} size={14} color={event.color} style={{ marginHorizontal: 2 }} />
                             ) : (
                               <Image source={{ uri: getItemImageUrlByName(event.key || '') }} className="w-7 h-5 rounded-[2px]" resizeMode="cover" />
                             )}
                          </View>
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
  );
}

const DraftDisplay = ({ picksBans, gameMode }: { picksBans: PickBan[], gameMode: number }) => {
  const radiantPicks = picksBans.filter(pb => pb.team === 0 && pb.is_pick).sort((a, b) => a.order - b.order);
  const direPicks = picksBans.filter(pb => pb.team === 1 && pb.is_pick).sort((a, b) => a.order - b.order);

  const radiantHeroIds = radiantPicks.map(p => p.hero_id);
  const direHeroIds = direPicks.map(p => p.hero_id);

  const draftAdvantage = useMemo(() => {
    if (radiantHeroIds.length === 0 || direHeroIds.length === 0) return 50;
    const seed = radiantHeroIds.reduce((a, b) => a + b, 0) - direHeroIds.reduce((a, b) => a + b, 0);
    const mockAdvantage = 50 + (seed % 15);
    return Math.min(Math.max(mockAdvantage, 30), 70);
  }, [radiantHeroIds, direHeroIds]);

  const allBans = picksBans.filter(pb => !pb.is_pick).sort((a, b) => a.order - b.order);
  const radiantBans = allBans.filter(pb => pb.team === 0);
  const direBans = allBans.filter(pb => pb.team === 1);

  const isStructuredDraft = gameMode === 2 || gameMode === 16;

  return (
    <View className="bg-[#2a2a2a] p-5 rounded-2xl mb-6 border border-zinc-800 shadow-xl overflow-hidden">
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
      <View className="flex-row items-center justify-center bg-zinc-900/50 py-1.5 px-4 rounded-full self-center border border-white/5">
        <FontAwesome5 
          name={draftAdvantage > 55 ? "trending-up" : draftAdvantage < 45 ? "trending-down" : "balance-scale"} 
          size={10} 
          color={draftAdvantage > 55 ? "#10b981" : draftAdvantage < 45 ? "#ef4444" : "#71717a"} 
        />
        <Text className="text-[8px] font-black uppercase tracking-widest ml-2 text-gray-400">
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
};

export function MatchOverviewModal({ visible, matchId, onClose, onPushPlayer }: MatchOverviewModalProps) {
  const { steamAccountId } = useSupabaseAuth();
  const currentUserId = steamAccountId ? steamAccountId.toString() : null;
  const { data: matchData, isLoading: loading } = useMatchDetails(visible ? matchId : null);
  const { data: userPeers = [] } = usePlayerPeers(visible ? currentUserId : null);
  const [activeTab, setActiveTab] = useState<MatchTab>('Scoreboard');
  const [isParsing, setIsParsing] = useState(false);
  const [parseRequested, setParseRequested] = useState(false);
  const [showChatWheel, setShowChatWheel] = useState(true);
  const [pollCount, setPollCount] = useState(0);

  // Auto-refresh polling logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (parseRequested && !matchData?.version && pollCount < 10) {
      interval = setInterval(() => {
        setPollCount(prev => prev + 1);
      }, 20000); // Poll every 20s
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [parseRequested, matchData?.version, pollCount]);

  // Tab Scroll State
  const [scrollX, setScrollX] = useState(0);
  const [contentWidth, setContentWidth] = useState(0);
  const [viewWidth, setViewWidth] = useState(0);

  const handleRequestParse = async () => {
    if (!matchId || isParsing) return;
    setIsParsing(true);
    try {
      const result = await requestMatchParse(matchId);
      if (result) {
        setParseRequested(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsParsing(false);
    }
  };

  const renderParseInstructions = (message: string) => (
    <View className="bg-[#2a2a2a] p-8 rounded-2xl border border-zinc-800 items-center justify-center">
      <View className="bg-zinc-800/50 p-4 rounded-full mb-4">
        <Ionicons name="analytics-outline" size={32} color="#8b5cf6" />
      </View>
      <Text className="text-white font-bold text-center mb-2">Parsed Data Required</Text>
      <Text className="text-gray-400 text-center text-xs mb-6 px-4">
        {message}
      </Text>

      {!parseRequested ? (
        <TouchableOpacity
          onPress={handleRequestParse}
          disabled={isParsing}
          className="bg-gamingAccent px-6 py-3 rounded-xl flex-row items-center active:bg-gamingAccent/80"
        >
          {isParsing ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <Ionicons name="cloud-upload-outline" size={18} color="white" />
              <Text className="text-white font-bold ml-2">Request Parse</Text>
            </>
          )}
        </TouchableOpacity>
      ) : (
        <View className="bg-green-500/10 border border-green-500/20 px-4 py-3 rounded-xl flex-row items-center">
          <Ionicons name="checkmark-circle" size={18} color="#22c55e" />
          <Text className="text-green-500 font-bold ml-2 text-xs">Parse Requested! Check back in a few minutes.</Text>
        </View>
      )}

      <TouchableOpacity
        onPress={() => Linking.openURL(`https://www.opendota.com/matches/${matchId}`)}
        className="mt-6 flex-row items-center"
      >
        <Text className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mr-1">View on OpenDota</Text>
        <Ionicons name="open-outline" size={12} color="#71717a" />
      </TouchableOpacity>
    </View>
  );

  if (!visible) return null;

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

  const renderPlayerRow = (p: MatchDetails['players'][0], index: number) => {
    const isAnonymous = !p.account_id;
    const mainItems = [p.item_0, p.item_1, p.item_2, p.item_3, p.item_4, p.item_5];
    const peer = p.account_id ? userPeers.find(up => up.account_id === p.account_id) : null;
    const heroData = HEROES[p.hero_id];

    let attrColor = '#6b7280';
    if (heroData) {
      switch (heroData.primary_attr) {
        case 'str': attrColor = '#ef4444'; break;
        case 'agi': attrColor = '#22c55e'; break;
        case 'int': attrColor = '#06b6d4'; break;
        case 'all': attrColor = '#eab308'; break;
      }
    }

    const laningGrade = calculateLaningGrade(p.lane_efficiency_pct || null, p.benchmarks?.lhten?.pct || null);

    const showLaningInfo = () => {
      if (!laningGrade) return;
      Alert.alert(
        "Laning Performance",
        `Grade: ${laningGrade.grade} (${laningGrade.label} Tier)\n\nEfficiency: ${(p.lane_efficiency_pct || 0).toFixed(0)}%\nLH @ 10m: ${p.benchmarks?.lhten?.raw || 0}\nGlobal Percentile: ${((p.benchmarks?.lhten?.pct || 0) * 100).toFixed(1)}%`,
        [{ text: "Close", style: "cancel" }]
      );
    };

    return (
      <View key={index} className="border-b border-zinc-800 relative overflow-hidden">
        {/* Attribute Glow */}
        <View className="absolute -left-12 top-0 bottom-0 w-32 opacity-10 blur-xl" style={{ backgroundColor: attrColor }} />

        <TouchableOpacity
          onPress={() => !isAnonymous && onPushPlayer?.(p.account_id!)}
          disabled={isAnonymous || !onPushPlayer}
          className="py-3 active:bg-zinc-700 relative z-10"
        >
          <View className="flex-row items-center px-1">
            <View className="w-12 items-center">
              <View className="relative">
                <View className="absolute -inset-0.5 rounded blur-[2px] opacity-40" style={{ backgroundColor: attrColor }} />
                <Image source={{ uri: getHeroImageUrl(p.hero_id) }} className="w-10 h-7 rounded-sm shadow-sm" resizeMode="cover" />
              </View>
              <Text className="text-gray-500 text-[8px] mt-1 uppercase font-black">LVL {p.level}</Text>
            </View>
            <View className="flex-1 ml-2">
              <View className="flex-row items-center">
                <Text className="text-xs font-bold text-white mr-2" numberOfLines={1}>{p.personaname || 'Anonymous'}</Text>
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
              <Text className="text-[9px] text-gray-500 mt-0.5">
                NW: {(p.net_worth / 1000).toFixed(1)}k • G/X: {p.gold_per_min}/{p.xp_per_min}
              </Text>
            </View>

            {/* Laning Grade Badge */}
            {laningGrade ? (
              <TouchableOpacity onPress={showLaningInfo} className="mx-2 items-center">
                <Text style={{ color: laningGrade.color }} className="text-xs font-black italic">{laningGrade.grade}</Text>
                <Text className="text-gray-600 text-[6px] font-black uppercase">LANE</Text>
              </TouchableOpacity>
            ) : matchData && !matchData.version && (
              <View className="mx-2 items-center opacity-30">
                <Ionicons name="time-outline" size={10} color="#71717a" />
                <Text className="text-gray-600 text-[6px] font-black uppercase">WAIT</Text>
              </View>
            )}

            <View className="w-16 items-center">
              <Text className="text-white text-[10px] font-bold">{p.kills}/{p.deaths}/{p.assists}</Text>
              <Text className="text-gray-500 text-[9px]">{p.last_hits}/{p.denies}</Text>
            </View>
            <View className="w-20 items-end pr-2">
              <Text className="text-red-500 text-[9px] font-bold leading-tight">{p.hero_damage.toLocaleString()} HD</Text>
              <Text className="text-orange-500 text-[8px] font-bold leading-tight">{p.tower_damage.toLocaleString()} TD</Text>
              {p.hero_healing > 0 && <Text className="text-blue-500 text-[8px] font-bold leading-tight">{p.hero_healing.toLocaleString()} HH</Text>}
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
                <Image source={{ uri: getItemImageUrl(p.item_neutral) }} className="w-6 h-5 rounded-full bg-zinc-900 border border-zinc-600" resizeMode="cover" />
              </View>
            </View>

            {/* Permanent Buffs */}
            {p.permanent_buffs && p.permanent_buffs.length > 0 && (
              <View className="flex-row items-center ml-3">
                {p.permanent_buffs.map((buff, i) => {
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
  };

  const screenWidth = Dimensions.get('window').width - 64;

  return (
    <GlassModal visible={visible} onClose={onClose}>
      {loading ? (
        <MatchOverviewSkeleton />
      ) : matchData ? (
        <View className="flex-1">
          {/* Match Header - Immersive Overhaul */}
          <View className="h-48 rounded-3xl overflow-hidden mb-6 relative border border-white/10">
             <View className="absolute inset-0 flex-row">
                <LinearGradient colors={['rgba(16, 185, 129, 0.2)', 'transparent']} start={{x:0, y:0}} end={{x:1, y:1}} className="flex-1" />
                <LinearGradient colors={['rgba(239, 68, 68, 0.2)', 'transparent']} start={{x:1, y:0}} end={{x:0, y:1}} className="flex-1" />
             </View>
             
             <View className="absolute inset-0 items-center justify-center">
                <View className="flex-row items-center gap-10">
                   <View className="items-center">
                      <Text className="text-win font-outfit-black text-5xl italic leading-none">{matchData.radiant_score}</Text>
                      <Text className="text-win/40 text-[8px] font-outfit-black uppercase tracking-widest mt-1">Radiant</Text>
                   </View>
                   
                   <View className="items-center">
                      <View className="bg-black/60 px-4 py-2 rounded-2xl border border-white/10 items-center">
                         <Text className="text-white font-outfit-black text-lg italic leading-none">
                            {Math.floor(matchData.duration / 60)}:{String(matchData.duration % 60).padStart(2, '0')}
                         </Text>
                         <Text className="text-gray-500 text-[7px] font-outfit-black uppercase mt-1">Duration</Text>
                      </View>
                      <View className={`mt-2 px-3 py-1 rounded-full border ${
                        matchData.radiant_win ? "bg-win/10 border-win/30" : "bg-loss/10 border-loss/30"
                      }`}>
                         <Text className={`text-[9px] font-outfit-black uppercase tracking-widest ${matchData.radiant_win ? "text-win" : "text-loss"}`}>
                            {matchData.radiant_win ? 'Victory' : 'Victory'}
                         </Text>
                      </View>
                   </View>

                   <View className="items-center">
                      <Text className="text-loss font-outfit-black text-5xl italic leading-none">{matchData.dire_score}</Text>
                      <Text className="text-loss/40 text-[8px] font-outfit-black uppercase tracking-widest mt-1">Dire</Text>
                   </View>
                </View>
                <Text className="text-gray-500 font-outfit-bold text-[8px] uppercase tracking-[0.3em] mt-4 italic text-center">
                   {GAME_MODES[matchData.game_mode] || 'Standard Match'} • ID {matchData.match_id}
                </Text>
             </View>
          </View>

          <View className="relative bg-[#1e1e1e] border-b border-zinc-800">
            {scrollX > 10 && (
              <View style={{ pointerEvents: 'none' }} className="absolute left-0 top-0 bottom-0 w-8 z-10 justify-center items-start pl-1">
                <View className="bg-black/60 rounded-full p-1 shadow-sm"><Ionicons name="chevron-back" size={14} color="white" /></View>
              </View>
            )}

            <ScrollView
              horizontal
              nestedScrollEnabled={true}
              showsHorizontalScrollIndicator={false}
              onScroll={(e) => setScrollX(e.nativeEvent.contentOffset.x)}
              onContentSizeChange={(w) => setContentWidth(w)}
              onLayout={(e) => setViewWidth(e.nativeEvent.layout.width)}
              scrollEventThrottle={16}
            >
              {(['Scoreboard', 'Highlights', 'Economy', 'Timeline', 'Chat'] as MatchTab[]).map((tab) => {
                const needsParse = ['Economy', 'Timeline', 'Chat'].includes(tab) && !matchData.version;
                return (
                  <TouchableOpacity
                    key={tab}
                    onPress={() => setActiveTab(tab)}
                    className={`px-6 py-4 flex-row items-center border-b-2 ${activeTab === tab ? 'border-gamingAccent' : 'border-transparent'}`}
                  >
                    <Text className={`text-[11px] font-bold ${activeTab === tab ? 'text-white' : 'text-gray-500'} ${needsParse ? 'opacity-40' : ''}`}>
                      {tab.toUpperCase()}
                    </Text>
                    {needsParse && <Ionicons name="lock-closed" size={10} color="#71717a" style={{ marginLeft: 4, opacity: 0.6 }} />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {scrollX + viewWidth < contentWidth - 10 && (
              <View style={{ pointerEvents: 'none' }} className="absolute right-0 top-0 bottom-0 w-8 z-10 justify-center items-end pr-1">
                <View className="bg-black/60 rounded-full p-1 shadow-sm"><Ionicons name="chevron-forward" size={14} color="white" /></View>
              </View>
            )}
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
            contentContainerStyle={{ padding: 16, paddingBottom: 120, flexGrow: 1 }}
          >
            {activeTab === 'Chat' && (
              <View>
                <View className="flex-row justify-between items-center mb-3 pr-1">
                  <Text className="text-gray-400 uppercase tracking-widest text-[10px] font-bold pl-1">Match Chat Log</Text>
                  <TouchableOpacity
                    onPress={() => setShowChatWheel(!showChatWheel)}
                    className={`flex-row items-center px-2 py-1 rounded-md border ${showChatWheel ? 'bg-gamingAccent/10 border-gamingAccent/30' : 'bg-zinc-800 border-zinc-700'}`}
                  >
                    <Ionicons name={showChatWheel ? "eye-outline" : "eye-off-outline"} size={12} color={showChatWheel ? "#8b5cf6" : "#71717a"} />
                    <Text className={`text-[9px] font-bold ml-1.5 ${showChatWheel ? 'text-gamingAccent' : 'text-gray-500'}`}>
                      {showChatWheel ? 'WHEEL ON' : 'WHEEL OFF'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {matchData.chat ? (
                  (() => {
                    const filteredChat = showChatWheel
                      ? matchData.chat
                      : matchData.chat.filter(msg => {
                        const phrase = getChatWheelPhrase(msg.key);
                        return msg.type !== 'chatwheel' && phrase === msg.key;
                      });

                    if (filteredChat.length === 0) {
                      return (
                        <View className="bg-[#2a2a2a] p-10 rounded-xl items-center">
                          <Ionicons name="chatbubbles-outline" size={32} color="#4b5563" />
                          <Text className="text-gray-500 text-xs mt-2">No matching messages found.</Text>
                        </View>
                      );
                    }

                    return (
                      <View className="bg-[#2a2a2a] rounded-xl p-2 border border-zinc-800">
                        {filteredChat.map((msg, idx) => {
                          const player = matchData.players.find(p => p.player_slot === msg.player_slot);
                          const minutes = Math.floor(msg.time / 60);
                          const seconds = String(Math.abs(msg.time % 60)).padStart(2, '0');
                          const isRadiant = msg.player_slot !== undefined && msg.player_slot < 128;
                          const phrase = getChatWheelPhrase(msg.key);
                          const isWheel = msg.type === 'chatwheel' || (phrase !== msg.key);

                          return (
                            <View key={idx} className={`flex-row items-start py-2 px-2 ${idx !== filteredChat.length - 1 ? 'border-b border-zinc-800/50' : ''}`}>
                              <View className="w-12 pt-0.5">
                                <Text className="text-gray-500 font-bold text-[9px]">{msg.time < 0 ? '-' : ''}{Math.abs(minutes)}:{seconds}</Text>
                              </View>
                              {player && (
                                <Image source={{ uri: getHeroImageUrl(player.hero_id) }} className="w-7 h-5 rounded-sm mr-2 mt-0.5" />
                              )}
                              <View className="flex-1">
                                <View className="flex-row items-baseline flex-wrap">
                                  <Text className={`text-[11px] font-bold ${isRadiant ? 'text-win' : 'text-loss'}`}>
                                    {msg.unit || player?.personaname || 'Anonymous'}:
                                  </Text>
                                  <View className="flex-row items-baseline flex-1 ml-1.5">
                                    {isWheel && <Text className="text-gamingAccent font-bold text-[11px] mr-1">{'>'}</Text>}
                                    <Text className={`text-[11px] leading-4 ${isWheel ? 'italic text-gamingAccent' : 'text-white'}`}>
                                      {phrase}
                                    </Text>
                                  </View>
                                </View>
                              </View>
                            </View>
                          );
                        })}
                      </View>
                    );
                  })()
                ) : (
                  renderParseInstructions("Chat logs are only available for parsed matches. This includes all-chat messages and chat wheel usage.")
                )}
              </View>
            )}

            {activeTab === 'Timeline' && (
              <View>
                <Text className="text-gray-400 uppercase tracking-widest text-[10px] font-bold mb-3 pl-1">Strategic Event Trajectory</Text>
                {matchData.version ? (
                  <MatchTimeline match={matchData} />
                ) : (
                  renderParseInstructions("Timeline visualization requires parsed match data to track specific player events.")
                )}
              </View>
            )}

            {activeTab === 'Scoreboard' && (
              <>
                {!matchData.version && (
                  <View className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl mb-6 flex-row items-center">
                    <View className="bg-amber-500/20 p-2 rounded-full mr-4">
                      <Ionicons name="alert-circle" size={20} color="#f59e0b" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-amber-500 text-[10px] font-black uppercase tracking-widest mb-1">Incomplete Analysis</Text>
                      <Text className="text-gray-400 text-[10px] leading-relaxed">Economy charts and timeline events require parsing.</Text>
                    </View>
                    {!parseRequested ? (
                      <TouchableOpacity 
                        onPress={handleRequestParse}
                        disabled={isParsing}
                        className="bg-amber-500/20 px-3 py-2 rounded-lg border border-amber-500/30"
                      >
                        {isParsing ? (
                          <ActivityIndicator size="small" color="#f59e0b" />
                        ) : (
                          <Text className="text-amber-500 text-[9px] font-black uppercase">Start Parse</Text>
                        )}
                      </TouchableOpacity>
                    ) : (
                      <View className="items-end">
                        <View className="flex-row items-center bg-green-500/10 px-2 py-1.5 rounded-lg">
                          <ActivityIndicator size="small" color="#22c55e" style={{ transform: [{ scale: 0.6 }] }} />
                          <Text className="text-green-500 text-[8px] font-black uppercase ml-1">Polling...</Text>
                        </View>
                        <Text className="text-gray-500 text-[7px] font-bold mt-1 uppercase italic">This may take a few minutes</Text>
                      </View>
                    )}
                  </View>
                )}
                {matchData.picks_bans && <DraftDisplay picksBans={matchData.picks_bans} gameMode={matchData.game_mode} />}
                <View className="mb-6">
                  <LinearGradient colors={['rgba(16, 185, 129, 0.15)', 'transparent']} start={{x:0, y:0.5}} end={{x:1, y:0.5}} className="px-4 py-2 rounded-t-xl border-l-2 border-win mb-1">
                     <Text className="text-win font-bold uppercase text-[10px] tracking-widest italic">Radiant Dominion</Text>
                  </LinearGradient>
                  <View className="bg-[#222] rounded-xl overflow-hidden border border-zinc-800 shadow-sm">
                    {matchData.players.filter(p => p.player_slot < 128).map((p, i) => renderPlayerRow(p, i))}
                  </View>
                </View>
                <View className="mb-6">
                  <LinearGradient colors={['rgba(239, 68, 68, 0.15)', 'transparent']} start={{x:0, y:0.5}} end={{x:1, y:0.5}} className="px-4 py-2 rounded-t-xl border-l-2 border-loss mb-1">
                     <Text className="text-loss font-bold uppercase text-[10px] tracking-widest italic">Dire Authority</Text>
                  </LinearGradient>
                  <View className="bg-[#222] rounded-xl overflow-hidden border border-zinc-800 shadow-sm">
                    {matchData.players.filter(p => p.player_slot >= 128).map((p, i) => renderPlayerRow(p, i))}
                  </View>
                </View>
              </>
            )}

            {activeTab === 'Highlights' && (
              <View>
                {(() => {
                  const h = getHighlights(matchData);
                  return (
                    <View>
                      <View className="bg-[#2a2a2a] p-4 rounded-xl mb-3 flex-row items-center border border-red-900/20">
                        <View className="bg-red-500/10 p-2 rounded-full mr-4"><Ionicons name="flame" size={24} color="#ef4444" /></View>
                        <View className="flex-1">
                          <Text className="text-red-500 text-[10px] font-bold uppercase">Top Hero Damage</Text>
                          <Text className="text-white font-bold">{h.topDamage.personaname || 'Anonymous'}</Text>
                          <Text className="text-gray-400 text-xs">{h.topDamage.hero_damage.toLocaleString()} damage</Text>
                        </View>
                      </View>
                      <View className="bg-[#2a2a2a] p-4 rounded-xl mb-3 flex-row items-center border border-yellow-900/20">
                        <View className="bg-yellow-500/10 p-2 rounded-full mr-4"><Ionicons name="cash" size={24} color="#eab308" /></View>
                        <View className="flex-1">
                          <Text className="text-yellow-500 text-[10px] font-bold uppercase">Highest Net Worth</Text>
                          <Text className="text-white font-bold">{h.topNetWorth.personaname || 'Anonymous'}</Text>
                          <Text className="text-gray-400 text-xs">{(h.topNetWorth.net_worth / 1000).toFixed(1)}k gold</Text>
                        </View>
                      </View>
                    </View>
                  );
                })()}
              </View>
            )}

            {activeTab === 'Economy' && (
              <View>
                {matchData.radiant_gold_adv && matchData.radiant_xp_adv ? (
                  <View className="bg-[#2a2a2a] p-4 rounded-xl border border-zinc-800 mb-4">
                    <Text className="text-white font-bold mb-4 text-center">Net Worth & XP Difference</Text>
                    <LineChart
                      data={{
                        labels: matchData.radiant_gold_adv.map((_, i) => i % 10 === 0 ? `${i}` : ''),
                        datasets: [
                          { data: matchData.radiant_gold_adv, color: (opacity = 1) => `rgba(234, 179, 8, ${opacity})`, strokeWidth: 2 },
                          { data: matchData.radiant_xp_adv, color: (opacity = 1) => `rgba(168, 85, 247, ${opacity})`, strokeWidth: 2 }
                        ],
                        legend: ["NW", "XP"]
                      }}
                      width={screenWidth}
                      height={220}
                      chartConfig={{
                        backgroundColor: "#1e1e1e",
                        backgroundGradientFrom: "#2a2a2a",
                        backgroundGradientTo: "#2a2a2a",
                        decimalPlaces: 0,
                        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                        labelColor: (opacity = 1) => `rgba(156, 163, 175, ${opacity})`,
                        propsForDots: { r: "0" },
                      }}
                      bezier
                      style={{ marginVertical: 8, borderRadius: 16 }}
                    />
                  </View>
                ) : (
                  renderParseInstructions("Economy trends require parsed match data.")
                )}
              </View>
            )}
            <View className="h-20" />
          </ScrollView>
        </View>
      ) : (
        <View className="flex-1 justify-center items-center"><Text className="text-red-500 font-outfit-bold">Failed to load match details.</Text></View>
      )}
    </GlassModal>
  );
}
