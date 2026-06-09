import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View, 
  Text,
  Image,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
  Pressable,
  useWindowDimensions
} from 'react-native';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { LineChart } from "react-native-chart-kit";
import {
  MatchDetails,
  PickBan
} from '../services/types';
import { requestMatchParse, getParseStatus } from '../services/matchService';
import { GAME_MODES } from '../services/apiUtils';
import {
  getHeroImageUrl,
  getItemImageUrl,
  getItemImageUrlByName,
  HEROES
} from '../services/constants';
import { getChatWheelPhrase } from '../services/chatwheel';
import * as Linking from 'expo-linking';
import { useMatchDetails, usePlayerPeers, useDraftAnalysis } from '../hooks/useOpenDota';
import { useSupabaseAuth } from '../context/SupabaseAuthContext';
import { trackOpenDotaMatchView, trackEvent, trackMatchSnapshot } from '../services/analytics';
import { MatchOverviewSkeleton } from './Skeleton';
import PressableScale from './PressableScale';
import { calculateLaningGrade } from '../utils/matchAnalytics';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

type MatchTab = 'Scoreboard' | 'Highlights' | 'Economy' | 'Timeline' | 'Chat';
type ParseStatus = 'idle' | 'queued' | 'parsing' | 'done' | 'failed';

interface MatchOverviewContentProps {
  matchId: number | string | null;
  onPushPlayer?: (id: number) => void;
  onClose?: () => void;
  isStandalone?: boolean;
}

// --- Enhanced Timeline Component ---
function MatchTimeline({ match }: { match: MatchDetails }) {
  const durationMins = Math.ceil(match.duration / 60);
  const screenWidth = Dimensions.get('window').width - 64;
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

  // Phase Definitions
  const phases = useMemo(() => {
    const laningEnd = 12; // 0-12m
    const midEnd = 30;    // 12-30m

    const list = [
      { id: 'laning', label: 'Laning', start: 0, end: laningEnd, color: '#10b981', opacity: 0.05, border: 'rgba(16, 185, 129, 0.2)', textColor: 'rgba(16, 185, 129, 0.6)' },
      { id: 'mid', label: 'Mid-Game', start: laningEnd, end: Math.min(midEnd, durationMins), color: '#f59e0b', opacity: 0.05, border: 'rgba(245, 158, 11, 0.2)', textColor: 'rgba(245, 158, 11, 0.6)' },
    ];

    if (durationMins > midEnd) {
      list.push({ id: 'late', label: 'Late-Game', start: midEnd, end: durationMins, color: '#8b5cf6', opacity: 0.05, border: 'rgba(139, 92, 246, 0.2)', textColor: 'rgba(139, 92, 246, 0.6)' });
    }

    return list;
  }, [durationMins]);

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
  }, [match.objectives]);

  // Teamfight Detection
  const teamfights = useMemo(() => {
    if (!match.kill_log || match.kill_log.length < 3) return [];
    const kills = [...match.kill_log].sort((a, b) => a.time - b.time);
    const result: { time: number; count: number; description: string }[] = [];

    let currentGroup: typeof kills = [];
    for (let i = 0; i < kills.length; i++) {
      if (currentGroup.length === 0 || kills[i].time <= currentGroup[0].time + 40) {
        currentGroup.push(kills[i]);
      } else {
        if (currentGroup.length >= 3) {
          result.push({
            time: Math.floor(currentGroup[0].time + (currentGroup[currentGroup.length-1].time - currentGroup[0].time) / 2),
            count: currentGroup.length,
            description: `${currentGroup.length} heroes perished in this clash.`
          });
        }
        currentGroup = [kills[i]];
      }
    }
    if (currentGroup.length >= 3) {
      result.push({
        time: Math.floor(currentGroup[0].time + (currentGroup[currentGroup.length-1].time - currentGroup[0].time) / 2),
        count: currentGroup.length,
        description: `${currentGroup.length} heroes perished in this clash.`
      });
    }
    return result;
  }, [match.kill_log]);

  const handleScrub = (event: any) => {
    const x = event.nativeEvent.locationX;
    const time = Math.max(0, Math.min(match.duration, Math.floor(((x - 140) / 60) * 60)));
    setScrubTime(time);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getAdvantageAt = (time: number) => {
    if (!match.radiant_gold_adv) return 0;
    const index = Math.floor(time / 60);
    return match.radiant_gold_adv[index] || 0;
  };

  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const isPortrait = windowHeight > windowWidth;

  return (
    <View className="bg-[#2a2a2a] rounded-xl p-4 border border-zinc-800 relative">
      {isPortrait && (
        <View className="flex-row items-center justify-center mb-4 px-2 py-1.5 bg-white/5 rounded-lg border border-white/10">
          <MaterialCommunityIcons name="screen-rotation" size={14} color="#8b5cf6" />
          <Text className="text-[10px] font-bold text-gray-400 ml-2 uppercase tracking-tight">
            Rotate device for better view
          </Text>
        </View>
      )}

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
          <TouchableOpacity onPress={() => setSelectedEvent(null)} className="ml-2 p-1">
            <Ionicons name="close" size={16} color="#6b7280" />
          </TouchableOpacity>
        </View>
      )}

      <ScrollView horizontal nestedScrollEnabled={true} showsHorizontalScrollIndicator={true} className="mb-2">
        <View style={{ width: Math.max(screenWidth * 2, (match.duration / 60) * 60 + 400) }}>
          {/* Phase Background Overlays */}
          <View style={{ position: 'absolute', inset: 0, left: 180 + 140, flexDirection: 'row', zIndex: 0 }}>
            {phases.map((phase) => {
              const width = ((phase.end - phase.start) / durationMins) * ((match.duration / 60) * 60);
              return (
                <View
                  key={phase.id}
                  style={{
                    width,
                    height: '100%', 
                    backgroundColor: phase.color,
                    opacity: phase.opacity,
                    borderLeftWidth: 1,
                    borderLeftColor: phase.border
                  }}
                />
              );
            })}
          </View>

          {/* Phase Labels */}
          <View style={{ position: 'relative', height: 20, marginBottom: 8, left: 180 + 140, flexDirection: 'row', zIndex: 10 }}>
            {phases.map((phase) => {
              const width = ((phase.end - phase.start) / durationMins) * ((match.duration / 60) * 60);
              return (
                <View key={phase.id} style={{ width, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: phase.textColor, fontSize: 8, fontWeight: 'bold', fontStyle: 'italic', letterSpacing: 2 }}>
                    {phase.label.toUpperCase()}
                  </Text>
                </View>
              );
            })}
          </View>

          <View className="flex-row mb-6 border-b border-zinc-800 pb-2">
            <View style={{ width: 180 }} />
            {Array.from({ length: Math.ceil(match.duration / 60 / 5) + 1 }).map((_, i) => (
              <View key={i} style={{ position: 'absolute', left: 180 + 140 + (i * 5 * 60) }}>
                <Text className="text-[10px] text-gray-500 font-bold">{i * 5}'</Text>
                <View style={{ width: 1, height: 12, backgroundColor: '#3f3f46', marginTop: 4 }} />
              </View>
            ))}
          </View>

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
             >
                <View className="absolute top-1/2 left-0 right-0 h-px bg-white/10" />
                <View className="flex-row h-full">
                   {match.radiant_gold_adv?.filter((_, i) => i % 5 === 0).map((gold, i) => {
                      const h = Math.min(Math.abs(gold) / 1500, 20);
                      return (
                         <View key={i} style={{ flex: 1, backgroundColor: gold >= 0 ? '#10b981' : '#ef4444', height: h, marginTop: gold >= 0 ? -h : h, alignSelf: 'center', opacity: 0.25 }} />
                      );
                   })}
                </View>
                {scrubTime !== null && (
                  <View style={{ position: 'absolute', left: 140 + (scrubTime / 60) * 60, top: 0, bottom: 0, width: 2, backgroundColor: '#3b82f6', zIndex: 30 }} />
                )}
             </Pressable>
          </View>

          <View className="flex-row items-center h-10 mb-4">
             <View style={{ width: 180 }} className="flex-row items-center pr-4">
                <MaterialCommunityIcons name="sword-cross" size={12} color="#f87171" />
                <Text className="text-gray-500 text-[9px] font-black uppercase ml-2">Teamfights</Text>
             </View>
             <View className="flex-1 h-full bg-red-500/5 rounded border border-red-500/10 relative">
                {teamfights.map((tf, i) => (
                  <View key={i} style={{ position: 'absolute', left: 140 + (tf.time / 60) * 60, top: '50%', transform: [{ translateY: -10 }, { translateX: -10 }] }} className="z-20">
                    <PressableScale
                      onPress={() => setSelectedEvent({ time: tf.time, label: 'Major Teamfight', description: tf.description, icon: 'sword-cross', color: '#f87171', type: 'teamfight' })}
                      className="p-1 rounded bg-black/60 border border-red-500/40"
                    >
                       <MaterialCommunityIcons name="sword-cross" size={12} color="#f87171" />
                    </PressableScale>
                  </View>
                ))}
             </View>
          </View>

          {match.players.map((p, pIdx) => {
            const laningGrade = calculateLaningGrade(p.lane_efficiency_pct || null, p.benchmarks?.lhten?.pct || null);
            const events: any[] = [];
            if (p.purchase_log) {
              p.purchase_log.forEach(item => {
                const minorItems = ['recipe', 'ward_observer', 'ward_sentry', 'smoke_of_deceit', 'dust', 'clarity', 'flask', 'tango', 'enchanted_mango', 'bottle', 'tpscroll', 'ward_dispenser', 'faerie_fire'];
                if (!minorItems.some(minor => item.key.includes(minor))) {
                  events.push({ time: item.time, type: 'purchase', key: item.key, label: item.key.replace('item_', '').replace(/_/g, ' '), description: `Purchased by ${p.personaname || 'Player'}` });
                }
              });
            }
            if (p.buyback_log) {
              p.buyback_log.forEach(bb => events.push({ time: bb.time, type: 'buyback', key: 'buyback', label: 'Buyback Used', description: `${p.personaname || 'Player'} returned to the battle.` }));
            }

            return (
              <View key={pIdx} className="flex-row items-center h-14 border-b border-zinc-800/30">
                <View style={{ width: 180 }} className="flex-row items-center pr-4 bg-[#2a2a2a] z-20">
                  <Image source={{ uri: getHeroImageUrl(p.hero_id) }} className="w-12 h-8 rounded-sm border border-white/10" />
                  <View className="ml-3 flex-1">
                    <Text className="text-white text-xs font-bold" numberOfLines={1}>{p.personaname || 'Anonymous'}</Text>
                    <Text className="text-gray-500 text-[8px] uppercase font-bold">Slot {p.player_slot}</Text>
                  </View>
                </View>

                <View className="flex-1 relative h-full justify-center overflow-hidden">
                  <View className="absolute left-0 right-0 h-[1px] bg-zinc-800/50" />
                  {events.map((event, eIdx) => (
                    <View key={eIdx} style={{ position: 'absolute', left: 140 + (event.time / 60) * 60, top: '50%', marginTop: -12, transform: [{ translateX: -15 }] }} className="z-10 shadow-md">
                      <PressableScale
                        onPress={() => setSelectedEvent({ time: event.time, label: event.label || 'Event', description: event.description || '', icon: event.icon, imageUrl: event.type === 'buyback' ? 'https://www.opendota.com/assets/images/dota2/buyback_icon.png' : getItemImageUrlByName(event.key || ''), color: event.color, type: event.type })}
                        className={`p-[1px] rounded-[3px] border ${event.type === 'buyback' ? 'bg-orange-500 border-orange-300' : 'bg-zinc-800 border-zinc-600'}`}
                      >
                         <Image source={{ uri: event.type === 'buyback' ? 'https://www.opendota.com/assets/images/dota2/buyback_icon.png' : getItemImageUrlByName(event.key || '') }} className="w-7 h-5 rounded-[2px]" resizeMode="cover" />
                      </PressableScale>
                    </View>
                  ))}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const DraftDisplay = ({ picksBans, gameMode, draftAdvantage }: { picksBans: PickBan[], gameMode: number, draftAdvantage: number }) => {
  const radiantPicks = picksBans.filter(pb => pb.team === 0 && pb.is_pick).sort((a, b) => a.order - b.order);
  const direPicks = picksBans.filter(pb => pb.team === 1 && pb.is_pick).sort((a, b) => a.order - b.order);

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
      <View className="flex-row items-center justify-center bg-zinc-900/80 py-2 px-4 rounded-full self-center border border-white/10 shadow-lg">
        <MaterialCommunityIcons 
          name={draftAdvantage > 55 ? "trending-up" : draftAdvantage < 45 ? "trending-down" : "scale-balance"} 
          size={12} 
          color={draftAdvantage > 55 ? "#10b981" : draftAdvantage < 45 ? "#ef4444" : "#a1a1aa"} 
        />
        <Text className={`text-[9px] font-black uppercase tracking-[0.1em] ml-2 ${
          draftAdvantage > 55 ? "text-win" : draftAdvantage < 45 ? "text-loss" : "text-gray-400"
        }`}>
          {draftAdvantage > 55 ? "Radiant Draft Advantage" : draftAdvantage < 45 ? "Dire Draft Advantage" : "Balanced Composition"}
        </Text>
      </View>
    </View>
  );
};

export default function MatchOverviewContent({ matchId, onPushPlayer, onClose, isStandalone }: MatchOverviewContentProps) {
  const { steamAccountId } = useSupabaseAuth();
  const currentUserId = steamAccountId ? steamAccountId.toString() : null;
  const { data: matchData, isLoading: loading, refetch } = useMatchDetails(matchId ? Number(matchId) : null);
  const { data: userPeers = [] } = usePlayerPeers(currentUserId);

  const radiantPicks = useMemo(() => 
    matchData?.picks_bans?.filter(pb => pb.team === 0 && pb.is_pick).map(p => p.hero_id) || [], 
    [matchData]
  );
  const direPicks = useMemo(() => 
    matchData?.picks_bans?.filter(pb => pb.team === 1 && pb.is_pick).map(p => p.hero_id) || [], 
    [matchData]
  );

  const { data: draftAdvantageResult } = useDraftAnalysis(radiantPicks, direPicks);
  const draftAdvantage = draftAdvantageResult || 50;

  const [activeTab, setActiveTab] = useState<MatchTab>('Scoreboard');
  const [isParsing, setIsParsing] = useState(false);
  const [parseStatus, setParseStatus] = useState<ParseStatus>('idle');
  const [showChatWheel, setShowChatWheel] = useState(true);

  useEffect(() => {
    if (matchId) {
      trackOpenDotaMatchView(matchId.toString(), false);
    }
  }, [matchId]);

  useEffect(() => {
    if (matchId) {
      trackEvent({
        eventType: 'opendota_match_view',
        metadata: { matchId: matchId.toString(), section: activeTab.toLowerCase() }
      });
    }
  }, [activeTab, matchId]);

  // Effect to automatically refetch when parsing is "done"
  useEffect(() => {
    if (parseStatus === 'done') {
      const timer = setTimeout(() => {
        refetch();
        // Wait a bit then reset to idle so the banner disappears if version is now present
        setTimeout(() => setParseStatus('idle'), 2000);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [parseStatus, refetch]);

  // Polling logic for parse job
  useEffect(() => {
    let pollInterval: NodeJS.Timeout;
    let timeoutId: NodeJS.Timeout;

    if (parseStatus === 'queued' || parseStatus === 'parsing') {
      const checkStatus = async () => {
        try {
          const jobId = await AsyncStorage.getItem(`parse_job_${matchId}`);
          if (!jobId) {
            setParseStatus('idle');
            return;
          }

          const status = await getParseStatus(jobId);
          if (!status || status.state === 'completed' || status.complete) {
            setParseStatus('done');
            await AsyncStorage.removeItem(`parse_job_${matchId}`);
            Toast.show({
              type: 'success',
              text1: 'Match parsing complete!',
              text2: 'Detailed statistics are now available.'
            });
          } else if (status.state === 'active') {
            setParseStatus('parsing');
          }
        } catch (e) {
          console.error('Error checking parse status:', e);
        }
      };

      pollInterval = setInterval(checkStatus, 5000);

      // 5 minute timeout to prevent infinite polling
      timeoutId = setTimeout(() => {
        clearInterval(pollInterval);
        if (parseStatus !== 'done') {
          setParseStatus('failed');
          Toast.show({
            type: 'error',
            text1: 'Parsing timed out',
            text2: 'OpenDota may be busy. Please try again later.'
          });
        }
      }, 300000);
    }

    return () => {
      if (pollInterval) clearInterval(pollInterval);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [parseStatus, matchId]);

  const handleRequestParse = async () => {
    if (!matchId || isParsing) return;
    setIsParsing(true);
    try {
      const result = await requestMatchParse(Number(matchId));
      if (result && result.job) {
        setParseStatus('queued');
        await AsyncStorage.setItem(`parse_job_${matchId}`, result.job.jobId);
        Toast.show({
          type: 'info',
          text1: 'Parse request submitted',
          text2: 'Waiting for OpenDota to process replay data...'
        });
      }
    } catch (e) { 
      console.error(e); 
      Toast.show({
        type: 'error',
        text1: 'Request failed',
        text2: 'Failed to submit parse request to OpenDota.'
      });
    }
    finally { setIsParsing(false); }
  };

  const renderParseInstructions = (message: string) => (
    <View style={{ 
      backgroundColor: parseStatus === 'idle' ? 'rgba(245, 158, 11, 0.05)' : 
                     (parseStatus === 'queued' || parseStatus === 'parsing') ? 'rgba(139, 92, 246, 0.05)' :
                     parseStatus === 'done' ? 'rgba(34, 197, 94, 0.05)' : 'rgba(239, 68, 68, 0.05)',
      borderColor: parseStatus === 'idle' ? 'rgba(245, 158, 11, 0.1)' :
                  (parseStatus === 'queued' || parseStatus === 'parsing') ? 'rgba(139, 92, 246, 0.1)' :
                  parseStatus === 'done' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
      borderWidth: 1,
      padding: 12,
      borderRadius: 16,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12
    }}>
      <View style={{ 
        backgroundColor: parseStatus === 'idle' ? 'rgba(245, 158, 11, 0.1)' :
                        (parseStatus === 'queued' || parseStatus === 'parsing') ? 'rgba(139, 92, 246, 0.1)' :
                        parseStatus === 'done' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
        padding: 8,
        borderRadius: 10
      }}>
        {parseStatus === 'idle' && <Ionicons name="analytics-outline" size={18} color="#f59e0b" />}
        {(parseStatus === 'queued' || parseStatus === 'parsing') && <ActivityIndicator size="small" color="#8b5cf6" />}
        {parseStatus === 'done' && <Ionicons name="checkmark-circle-outline" size={18} color="#22c55e" />}
        {parseStatus === 'failed' && <Ionicons name="alert-circle-outline" size={18} color="#ef4444" />}
      </View>

      <View style={{ flex: 1 }}>
        <Text style={{ 
          color: parseStatus === 'idle' ? '#f59e0b' :
                 (parseStatus === 'queued' || parseStatus === 'parsing') ? '#8b5cf6' :
                 parseStatus === 'done' ? '#22c55e' : '#ef4444',
          fontWeight: '900',
          textTransform: 'uppercase',
          fontSize: 10,
          letterSpacing: 0.5,
        }}>
          {parseStatus === 'idle' && "Parse Required"}
          {parseStatus === 'queued' && "Queued"}
          {parseStatus === 'parsing' && "Analyzing"}
          {parseStatus === 'done' && "Complete"}
          {parseStatus === 'failed' && "Failed"}
        </Text>
        <Text style={{ color: '#9ca3af', fontSize: 10, fontWeight: '600' }} numberOfLines={1}>
          {parseStatus === 'idle' && "Unlock economy & timeline logs"}
          {parseStatus === 'queued' && "Waiting for OpenDota worker..."}
          {parseStatus === 'parsing' && "Analyzing replay timings..."}
          {parseStatus === 'done' && "Statistics updated."}
          {parseStatus === 'failed' && "OpenDota is busy."}
        </Text>
      </View>

      {parseStatus === 'idle' && (
        <TouchableOpacity 
          onPress={handleRequestParse} 
          disabled={isParsing} 
          style={{ backgroundColor: '#8b5cf6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 }}
        >
          <Text style={{ color: 'white', fontWeight: '900', fontSize: 10, textTransform: 'uppercase' }}>
            {isParsing ? '...' : 'Parse'}
          </Text>
        </TouchableOpacity>
      )}

      {parseStatus === 'failed' && (
        <TouchableOpacity 
          onPress={() => setParseStatus('idle')} 
          style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 }}
        >
          <Text style={{ color: '#ef4444', fontWeight: '900', fontSize: 10, textTransform: 'uppercase' }}>Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderPlayerRow = (p: MatchDetails['players'][0], index: number) => {
    const isAnonymous = !p.account_id;
    const laningGrade = calculateLaningGrade(p.lane_efficiency_pct || null, p.benchmarks?.lhten?.pct || null);

    return (
      <View key={index} className="border-b border-zinc-800 py-3 px-2 flex-row items-center">
        <TouchableOpacity onPress={() => p.account_id && onPushPlayer?.(p.account_id)} className="flex-row items-center flex-1">
          <Image source={{ uri: getHeroImageUrl(p.hero_id) }} className="w-10 h-7 rounded-sm mr-3" />
          <View className="flex-1">
            <Text className="text-white text-xs font-bold" numberOfLines={1}>{p.personaname || 'Anonymous'}</Text>
            <Text className="text-gray-500 text-[9px]">NW: {(p.net_worth / 1000).toFixed(1)}k • G/X: {p.gold_per_min}/{p.xp_per_min}</Text>  
          </View>
        </TouchableOpacity>
        <View className="w-16 items-center">
          <Text className="text-white text-[10px] font-bold">{p.kills}/{p.deaths}/{p.assists}</Text>
        </View>
        <View className="w-16 items-end">
          <Text className="text-red-500 text-[9px] font-bold">{p.hero_damage.toLocaleString()} HD</Text>
        </View>
      </View>
    );
  };

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

  const screenWidth = Dimensions.get('window').width - 64;

  if (loading) return <MatchOverviewSkeleton />;
  if (!matchData) return <View className="flex-1 justify-center items-center"><Text className="text-red-500">Match not found.</Text></View>;   

  return (
    <View className="flex-1">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Simplified Header */}
        <View className="p-6 bg-[#2a2a2a] rounded-b-3xl mb-6 items-center">
          {onClose && (
            <TouchableOpacity onPress={onClose} className="absolute top-4 right-4 z-50">
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          )}
          <View className="flex-row items-center gap-6">
            <Text className="text-win text-4xl font-black italic">{matchData.radiant_score}</Text>
            <View className="items-center">
               <Text className="text-white font-bold text-lg">{Math.floor(matchData.duration / 60)}:{String(matchData.duration % 60).padStart(2, '0')}</Text>
               <Text className={`text-[10px] font-black uppercase tracking-widest mt-1 ${matchData.radiant_win ? 'text-win' : 'text-loss'}`}>{matchData.radiant_win ? 'RADIANT WIN' : 'DIRE WIN'}</Text>
            </View>
            <Text className="text-loss text-4xl font-black italic">{matchData.dire_score}</Text>
          </View>
        </View>

        {/* Global Parse Banner */}
        {!matchData.version && (
          <View className="px-4 mb-6">
            {renderParseInstructions("Detailed statistics for this match are currently unavailable. Request a parse to unlock Economy, Timeline, and Chat logs.")}
          </View>
        )}

        <View className="flex-row border-b border-zinc-800 mb-6">
          {(['Scoreboard', 'Highlights', 'Economy', 'Timeline', 'Chat'] as MatchTab[]).map(tab => {
            const isLocked = ['Economy', 'Timeline', 'Chat'].includes(tab) && !matchData.version;
            return (
              <TouchableOpacity 
                key={tab} 
                onPress={() => setActiveTab(tab)} 
                className={`flex-1 py-3 items-center border-b-2 ${activeTab === tab ? 'border-gamingAccent' : 'border-transparent'} ${isLocked ? 'opacity-40' : ''}`}
              >
                <View className="flex-row items-center gap-1">
                  <Text className={`text-[10px] font-bold ${activeTab === tab ? 'text-white' : 'text-gray-500'}`}>{tab.toUpperCase()}</Text>
                  {isLocked && <Ionicons name="lock-closed" size={8} color="#6b7280" />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View className="px-4">
          {activeTab === 'Scoreboard' && (
            <View>
              {matchData.picks_bans && <DraftDisplay picksBans={matchData.picks_bans} gameMode={matchData.game_mode} draftAdvantage={draftAdvantage} />}
              <Text className="text-win font-bold uppercase text-[10px] tracking-widest mb-2">Radiant</Text>
              <View className="bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 mb-6">
                {matchData.players.filter(p => p.player_slot < 128).map((p, i) => renderPlayerRow(p, i))}
              </View>
              <Text className="text-loss font-bold uppercase text-[10px] tracking-widest mb-2">Dire</Text>
              <View className="bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 mb-6">
                {matchData.players.filter(p => p.player_slot >= 128).map((p, i) => renderPlayerRow(p, i))}
              </View>
            </View>
          )}

          {activeTab === 'Highlights' && (
            <View>
              {(() => {
                const h = getHighlights(matchData);
                return (
                  <View className="flex-row flex-wrap gap-3">
                    {[
                      { label: 'Hero Damage', icon: 'flame', color: '#ef4444', value: h.topDamage.hero_damage.toLocaleString(), player: h.topDamage.personaname },
                      { label: 'Net Worth', icon: 'cash', color: '#eab308', value: `${(h.topNetWorth.net_worth/1000).toFixed(1)}k`, player: h.topNetWorth.personaname },
                      { label: 'Tower Damage', icon: 'castle', color: '#f97316', value: h.topTowers.tower_damage.toLocaleString(), player: h.topTowers.personaname },
                      { label: 'Hero Healing', icon: 'heart', color: '#3b82f6', value: h.topHealing.hero_healing.toLocaleString(), player: h.topHealing.personaname }
                    ].map((item, i) => (
                      <View key={i} className="w-[48%] bg-[#2a2a2a] p-4 rounded-xl border border-white/5">
                        <View className="flex-row items-center mb-2">
                           <Ionicons name={item.icon as any} size={14} color={item.color} />
                           <Text className="text-[8px] font-black text-gray-500 uppercase tracking-widest ml-2">{item.label}</Text>
                        </View>
                        <Text className="text-white font-bold text-sm" numberOfLines={1}>{item.player || 'Anonymous'}</Text>
                        <Text className="text-gray-400 text-xs mt-1">{item.value}</Text>
                      </View>
                    ))}
                  </View>
                );
              })()}
            </View>
          )}

          {activeTab === 'Economy' && (
            <View>
              {matchData.radiant_gold_adv ? (
                <View className="bg-[#2a2a2a] p-4 rounded-xl border border-white/5">
                  <LineChart
                    data={{
                      labels: matchData.radiant_gold_adv.map((_, i) => i % 10 === 0 ? `${i}'` : ''),
                      datasets: [{ data: matchData.radiant_gold_adv }]
                    }}
                    width={screenWidth}
                    height={200}
                    chartConfig={{
                      backgroundColor: "#1e1e1e",
                      backgroundGradientFrom: "#2a2a2a",
                      backgroundGradientTo: "#2a2a2a",
                      decimalPlaces: 0,
                      color: (opacity = 1) => `rgba(139, 92, 246, ${opacity})`,
                      labelColor: (opacity = 1) => `rgba(156, 163, 175, ${opacity})`,
                    }}
                    bezier
                    style={{ borderRadius: 16 }}
                  />
                </View>
              ) : (
                <View className="py-20 items-center justify-center bg-zinc-900/40 rounded-3xl border border-dashed border-zinc-800">
                  <Ionicons name="lock-closed" size={48} color="#3f3f46" />
                  <Text className="text-gray-500 font-bold mt-4">Economy data is locked</Text>
                  <Text className="text-gray-600 text-[10px] mt-1 uppercase tracking-widest">Request parse at the top to unlock</Text>
                </View>
              )}
            </View>
          )}

          {activeTab === 'Timeline' && (
            <View>
               {matchData.version ? <MatchTimeline match={matchData} /> : (
                 <View className="py-20 items-center justify-center bg-zinc-900/40 rounded-3xl border border-dashed border-zinc-800">
                   <Ionicons name="lock-closed" size={48} color="#3f3f46" />
                   <Text className="text-gray-500 font-bold mt-4">Timeline data is locked</Text>
                   <Text className="text-gray-600 text-[10px] mt-1 uppercase tracking-widest">Request parse at the top to unlock</Text>
                 </View>
               )}     
            </View>
          )}

          {activeTab === 'Chat' && (
            <View>
               {matchData.chat ? (
                 <View className="bg-[#2a2a2a] rounded-xl p-4 border border-white/5">
                    {matchData.chat.slice(0, 50).map((msg, i) => (
                      <Text key={i} className="text-gray-400 text-xs mb-2">
                        <Text className="text-white font-bold">{msg.player_slot}: </Text>
                        {getChatWheelPhrase(msg.key)}
                      </Text>
                    ))}
                 </View>
               ) : (
                 <View className="py-20 items-center justify-center bg-zinc-900/40 rounded-3xl border border-dashed border-zinc-800">
                   <Ionicons name="lock-closed" size={48} color="#3f3f46" />
                   <Text className="text-gray-500 font-bold mt-4">Chat data is locked</Text>
                   <Text className="text-gray-600 text-[10px] mt-1 uppercase tracking-widest">Request parse at the top to unlock</Text>
                 </View>
               )}
            </View>
          )}
        </View>

      </ScrollView>
    </View>
  );
}
