import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  Image, 
  ActivityIndicator, 
  Modal, 
  ScrollView,
  Pressable,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from "react-native-chart-kit";
import { 
  getMatchDetails,
  requestMatchParse,
  MatchDetails,
  ChatMessage,
  GAME_MODES
} from '../services/opendota';
import { 
  getHeroImageUrl, 
  getItemImageUrl, 
  getItemImageUrlByName,
  LOBBY_TYPES, 
  REGIONS, 
  LANE_ROLES,
  HERO_NAME_TO_ID,
  HEROES
} from '../services/constants';
import { getChatWheelPhrase } from '../services/chatwheel';
import { RankBadge } from './RankBadge';
import * as Linking from 'expo-linking';

type MatchTab = 'Scoreboard' | 'Highlights' | 'Combat' | 'Support' | 'Economy' | 'Timeline' | 'Chat';

interface MatchOverviewModalProps {
  visible: boolean;
  matchId: number | null;
  onClose: () => void;
  onPushPlayer?: (id: number) => void;
}

export function MatchOverviewModal({ visible, matchId, onClose, onPushPlayer }: MatchOverviewModalProps) {
  const [loading, setLoading] = useState(false);
  const [matchData, setMatchData] = useState<MatchDetails | null>(null);
  const [activeTab, setActiveTab] = useState<MatchTab>('Scoreboard');
  const [isParsing, setIsParsing] = useState(false);
  const [parseRequested, setParseRequested] = useState(false);
  const [expandedCombatPlayers, setExpandedCombatPlayers] = useState<number[]>([]);
  const [showChatWheel, setShowChatWheel] = useState(true);
  
  // Tab Scroll State
  const [scrollX, setScrollX] = useState(0);
  const [contentWidth, setContentWidth] = useState(0);
  const [viewWidth, setViewWidth] = useState(0);

  useEffect(() => {
    if (visible && matchId) {
      fetchMatchDetails(matchId);
    } else {
      setMatchData(null);
      setActiveTab('Scoreboard');
      setExpandedCombatPlayers([]);
    }
  }, [visible, matchId]);

  const fetchMatchDetails = async (id: number) => {
    setLoading(true);
    setParseRequested(false);
    setExpandedCombatPlayers([]);
    try {
      const details = await getMatchDetails(id);
      setMatchData(details);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

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

    return (
      <TouchableOpacity 
        key={index} 
        onPress={() => !isAnonymous && onPushPlayer?.(p.account_id!)}
        disabled={isAnonymous || !onPushPlayer}
        className="py-3 border-b border-zinc-800 active:bg-zinc-700"
      >
        <View className="flex-row items-center px-1">
          <View className="w-12 items-center">
            <Image source={{ uri: getHeroImageUrl(p.hero_id) }} className="w-10 h-7 rounded-sm shadow-sm" resizeMode="cover" />
            <Text className="text-gray-500 text-[8px] mt-1">LVL {p.level}</Text>
          </View>
          <View className="flex-1 ml-2">
            <Text className="text-xs font-bold text-white mr-2" numberOfLines={1}>{p.personaname || 'Anonymous'}</Text>
            <Text className="text-[9px] text-gray-500 mt-0.5">
              NW: {(p.net_worth / 1000).toFixed(1)}k • G/X: {p.gold_per_min}/{p.xp_per_min}
            </Text>
          </View>
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
        </View>
      </TouchableOpacity>
    );
  };

  const screenWidth = Dimensions.get('window').width - 64;

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/60 justify-end" onPress={onClose}>
        <Pressable className="bg-[#1e1e1e] h-[92%] rounded-t-3xl overflow-hidden" onPress={(e) => e.stopPropagation()}>
          {loading ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#8b5cf6" />
              <Text className="text-gray-400 mt-4">Fetching match details...</Text>
            </View>
          ) : matchData ? (
            <View className="flex-1">
              {/* Match Header */}
              <View className="flex-row justify-between items-center p-4 border-b border-zinc-800">
                <View>
                  <Text className="text-white text-xl font-bold">Match Overview</Text>
                  <Text className="text-gray-500 text-[10px]">{GAME_MODES[matchData.game_mode] || 'Standard'} • ID: {matchData.match_id}</Text>
                </View>
                <TouchableOpacity onPress={onClose}><Ionicons name="close" size={28} color="white" /></TouchableOpacity>
              </View>

              <View className="bg-[#2a2a2a] p-4 flex-row justify-around items-center border-b border-zinc-800">
                <View className="items-center"><Text className="text-win font-bold text-3xl">{matchData.radiant_score}</Text><Text className="text-win text-[10px] font-bold">RADIANT</Text></View>
                <View className="items-center">
                  <Text className="text-white text-xs font-bold">{Math.floor(matchData.duration / 60)}:{String(matchData.duration % 60).padStart(2, '0')}</Text>
                  <Text className={`text-[10px] font-bold mt-1 ${matchData.radiant_win ? 'text-win' : 'text-loss'}`}>{matchData.radiant_win ? 'RADIANT WIN' : 'DIRE WIN'}</Text>
                </View>
                <View className="items-center"><Text className="text-loss font-bold text-3xl">{matchData.dire_score}</Text><Text className="text-loss text-[10px] font-bold">DIRE</Text></View>
              </View>

              <View className="relative bg-[#1e1e1e] border-b border-zinc-800">
                {/* Left Indicator */}
                {scrollX > 10 && (
                  <View pointerEvents="none" className="absolute left-0 top-0 bottom-0 w-8 z-10 justify-center items-start pl-1">
                    <View className="bg-black/60 rounded-full p-1 shadow-sm"><Ionicons name="chevron-back" size={14} color="white" /></View>
                  </View>
                )}
                
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  onScroll={(e) => setScrollX(e.nativeEvent.contentOffset.x)}
                  onContentSizeChange={(w) => setContentWidth(w)}
                  onLayout={(e) => setViewWidth(e.nativeEvent.layout.width)}
                  scrollEventThrottle={16}
                >
                  {(['Scoreboard', 'Highlights', 'Combat', 'Support', 'Economy', 'Timeline', 'Chat'] as MatchTab[]).map((tab) => (
                    <TouchableOpacity 
                      key={tab} 
                      onPress={() => setActiveTab(tab)} 
                      className={`px-6 py-4 items-center border-b-2 ${activeTab === tab ? 'border-gamingAccent' : 'border-transparent'}`}
                    >
                      <Text className={`text-[11px] font-bold ${activeTab === tab ? 'text-white' : 'text-gray-500'}`}>{tab.toUpperCase()}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* Right Indicator */}
                {scrollX + viewWidth < contentWidth - 10 && (
                  <View pointerEvents="none" className="absolute right-0 top-0 bottom-0 w-8 z-10 justify-center items-end pr-1">
                     <View className="bg-black/60 rounded-full p-1 shadow-sm"><Ionicons name="chevron-forward" size={14} color="white" /></View>
                  </View>
                )}
              </View>

              <ScrollView showsVerticalScrollIndicator={false} className="p-4">
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
                              <Ionicons name="chatbubbles-outline" size={32} color="#4b5563" className="mb-2" />
                              <Text className="text-gray-500 text-xs">No matching messages found.</Text>
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
                    <Text className="text-gray-400 uppercase tracking-widest text-[10px] font-bold mb-3 pl-1">Player Event Timeline</Text>
                    {matchData.version ? (
                      <View className="bg-[#2a2a2a] rounded-xl p-4 border border-zinc-800">
                        <ScrollView horizontal showsHorizontalScrollIndicator={true} className="mb-2">
                          <View style={{ width: Math.max(screenWidth * 2, (matchData.duration / 60) * 60 + 300) }}>
                            {/* Time axis */}
                            <View className="flex-row mb-6 border-b border-zinc-800 pb-2">
                              <View style={{ width: 200 }} /> {/* Spacer for player info */}
                              {Array.from({ length: Math.ceil(matchData.duration / 60 / 5) + 1 }).map((_, i) => (
                                <View key={i} style={{ position: 'absolute', left: 200 + 140 + (i * 5 * 60) }}>
                                  <Text className="text-[10px] text-gray-500 font-bold">{i * 5}'</Text>
                                  <View className="w-[1px] h-3 bg-zinc-800 mt-1" />
                                </View>
                              ))}
                            </View>

                            {/* Player Lanes */}
                            {matchData.players.map((p, pIdx) => {
                              const events: { time: number; type: 'purchase' | 'buyback'; key: string }[] = [];
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

                              return (
                                <View key={pIdx} className="flex-row items-center h-14 border-b border-zinc-800/30">
                                  {/* Player Identity Column */}
                                  <View style={{ width: 200 }} className="flex-row items-center pr-4 bg-[#2a2a2a] z-20">
                                    <View className="relative">
                                      <Image source={{ uri: getHeroImageUrl(p.hero_id) }} className="w-12 h-8 rounded-sm border border-white/10" />
                                      {p.avatar && (
                                        <View className="absolute -bottom-1 -right-1 border border-zinc-900 rounded-full overflow-hidden">
                                          <Image source={{ uri: p.avatar }} className="w-5 h-5" />
                                        </View>
                                      )}
                                    </View>
                                    <View className="ml-3 flex-1">
                                      <Text className="text-white text-xs font-bold" numberOfLines={1}>{p.personaname || 'Anonymous'}</Text>
                                      <Text className="text-gray-500 text-[8px] uppercase font-bold">Slot {p.player_slot}</Text>
                                    </View>
                                  </View>

                                  <View className="flex-1 relative h-full justify-center overflow-hidden">
                                    {/* Lane grid line */}
                                    <View className="absolute left-0 right-0 h-[1px] bg-zinc-800/50" />
                                    
                                    {(() => {
                                      const usedPositions: Record<number, number> = {};

                                      return events.map((event, eIdx) => {
                                        // 140px buffer for pre-game
                                        const baseLeft = 140 + (event.time / 60) * 60;
                                        
                                        const bucket = Math.round(baseLeft / 8) * 8;
                                        const offsetCount = usedPositions[bucket] || 0;
                                        usedPositions[bucket] = offsetCount + 1;
                                        
                                        const horizontalOffset = offsetCount * 22; 
                                        const finalLeft = baseLeft + horizontalOffset;

                                        const buybackIcon = 'https://www.opendota.com/assets/images/dota2/buyback_icon.png';
                                        
                                        return (
                                          <View 
                                            key={eIdx} 
                                            style={{ 
                                              position: 'absolute', 
                                              left: finalLeft, 
                                              top: '50%',
                                              marginTop: -12, 
                                              transform: [{ translateX: -15 }] 
                                            }}
                                            className="z-10 shadow-md"
                                          >
                                            <View className={`p-[1px] rounded-[3px] border ${event.type === 'buyback' ? 'bg-orange-500 border-orange-300' : 'bg-zinc-800 border-zinc-600'}`}>
                                              <Image 
                                                source={{ uri: event.type === 'buyback' ? buybackIcon : getItemImageUrlByName(event.key) }} 
                                                className="w-7 h-5 rounded-[2px]"
                                                resizeMode="cover"
                                              />
                                            </View>
                                            {offsetCount === 0 && (
                                              <View className="absolute -top-4 left-0 right-0 items-center">
                                                <Text className="text-[8px] text-gray-400 font-bold">{Math.floor(event.time / 60)}'</Text>
                                              </View>
                                            )}
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
                        <View className="flex-row mt-4 pt-4 border-t border-zinc-800 justify-center">
                          <View className="flex-row items-center mr-6">
                            <View className="w-3 h-3 rounded-full bg-gamingAccent mr-2" />
                            <Text className="text-gray-400 text-[10px]">Major Item</Text>
                          </View>
                          <View className="flex-row items-center">
                            <View className="w-3 h-3 rounded-full bg-orange-500 mr-2" />
                            <Text className="text-gray-400 text-[10px]">Buyback</Text>
                          </View>
                        </View>
                        <Text className="text-zinc-600 text-[9px] text-center mt-3 italic">Scroll horizontally to see the full match progress</Text>
                      </View>
                    ) : (
                      renderParseInstructions("Timeline visualization requires parsed match data to track specific player events.")
                    )}
                  </View>
                )}

                {activeTab === 'Scoreboard' && (
                  <>
                    <View className="mb-6">
                      <Text className="text-win font-bold uppercase text-[10px] mb-2 pl-1 tracking-widest">Radiant Team</Text>
                      <View className="bg-[#222] rounded-xl overflow-hidden border border-zinc-800 shadow-sm">
                        {matchData.players.filter(p => p.player_slot < 128).map((p, i) => renderPlayerRow(p, i))}
                      </View>
                    </View>
                    <View className="mb-6">
                      <Text className="text-loss font-bold uppercase text-[10px] mb-2 pl-1 tracking-widest">Dire Team</Text>
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
                              <Text className="text-gray-400 text-xs">{h.topDamage.hero_damage.toLocaleString()} total damage dealt</Text>
                            </View>
                          </View>

                          <View className="bg-[#2a2a2a] p-4 rounded-xl mb-3 flex-row items-center border border-yellow-900/20">
                            <View className="bg-yellow-500/10 p-2 rounded-full mr-4"><Ionicons name="cash" size={24} color="#eab308" /></View>
                            <View className="flex-1">
                              <Text className="text-yellow-500 text-[10px] font-bold uppercase">Highest Net Worth</Text>
                              <Text className="text-white font-bold">{h.topNetWorth.personaname || 'Anonymous'}</Text>
                              <Text className="text-gray-400 text-xs">{(h.topNetWorth.net_worth/1000).toFixed(1)}k gold accumulated</Text>
                            </View>
                          </View>

                          <View className="bg-[#2a2a2a] p-4 rounded-xl mb-3 flex-row items-center border border-green-900/20">
                            <View className="bg-green-500/10 p-2 rounded-full mr-4"><Ionicons name="hammer" size={24} color="#22c55e" /></View>
                            <View className="flex-1">
                              <Text className="text-green-500 text-[10px] font-bold uppercase">Top Objective Pusher</Text>
                              <Text className="text-white font-bold">{h.topTowers.personaname || 'Anonymous'}</Text>
                              <Text className="text-gray-400 text-xs">{h.topTowers.tower_damage.toLocaleString()} tower damage</Text>
                            </View>
                          </View>

                          {h.topHealing.hero_healing > 0 && (
                            <View className="bg-[#2a2a2a] p-4 rounded-xl mb-3 flex-row items-center border border-blue-900/20">
                              <View className="bg-blue-500/10 p-2 rounded-full mr-4"><Ionicons name="medkit" size={24} color="#3b82f6" /></View>
                              <View className="flex-1">
                                <Text className="text-blue-500 text-[10px] font-bold uppercase">Top Support Impact</Text>
                                <Text className="text-white font-bold">{h.topHealing.personaname || 'Anonymous'}</Text>
                                <Text className="text-gray-400 text-xs">{h.topHealing.hero_healing.toLocaleString()} total healing provided</Text>
                              </View>
                            </View>
                          )}

                          {(h.topStacks.camps_stacked || 0) > 0 && (
                            <View className="bg-[#2a2a2a] p-4 rounded-xl mb-3 flex-row items-center border border-purple-900/20">
                              <View className="bg-purple-500/10 p-2 rounded-full mr-4"><Ionicons name="layers" size={24} color="#a855f7" /></View>
                              <View className="flex-1">
                                <Text className="text-purple-500 text-[10px] font-bold uppercase">Top Stacker</Text>
                                <Text className="text-white font-bold">{h.topStacks.personaname || 'Anonymous'}</Text>
                                <Text className="text-gray-400 text-xs">{h.topStacks.camps_stacked} neutral camps stacked</Text>
                              </View>
                            </View>
                          )}

                          {((h.topWards.obs_placed || 0) + (h.topWards.sen_placed || 0)) > 0 && (
                            <View className="bg-[#2a2a2a] p-4 rounded-xl mb-3 flex-row items-center border border-indigo-900/20">
                              <View className="bg-indigo-500/10 p-2 rounded-full mr-4"><Ionicons name="eye" size={24} color="#6366f1" /></View>
                              <View className="flex-1">
                                <Text className="text-indigo-500 text-[10px] font-bold uppercase">Vision MVP</Text>
                                <Text className="text-white font-bold">{h.topWards.personaname || 'Anonymous'}</Text>
                                <Text className="text-gray-400 text-xs">{(h.topWards.obs_placed || 0) + (h.topWards.sen_placed || 0)} wards placed</Text>
                              </View>
                            </View>
                          )}

                          <View className="bg-[#2a2a2a] p-4 rounded-xl mt-4">
                            <Text className="text-gray-400 text-[10px] font-bold uppercase mb-2">Match Metadata</Text>
                            <View className="flex-row justify-between py-2 border-b border-zinc-800">
                              <Text className="text-gray-500 text-xs">Lobby Type</Text>
                              <Text className="text-white text-xs">{LOBBY_TYPES[matchData.lobby_type] || 'Standard'}</Text>
                            </View>
                            <View className="flex-row justify-between py-2 border-b border-zinc-800">
                              <Text className="text-gray-500 text-xs">Region</Text>
                              <Text className="text-white text-xs">{REGIONS[matchData.region] || `Region ${matchData.region}`}</Text>
                            </View>
                            <View className="flex-row justify-between py-2 border-b border-zinc-800">
                              <Text className="text-gray-500 text-xs">Patch</Text>
                              <Text className="text-white text-xs">{matchData.patch ? `Patch ${matchData.patch}` : 'Unknown'}</Text>
                            </View>
                            <View className="flex-row justify-between py-2">
                              <Text className="text-gray-500 text-xs">Start Time</Text>
                              <Text className="text-white text-xs">{new Date(matchData.start_time * 1000).toLocaleString()}</Text>
                            </View>
                          </View>

                          {!matchData.version && (
                            <View className="bg-zinc-900/30 p-4 rounded-xl mt-4 border border-zinc-800/50 flex-row items-center">
                              <Ionicons name="information-circle-outline" size={18} color="#6b7280" />
                              <Text className="text-gray-500 text-[10px] ml-3 flex-1">
                                Additional highlights like "Top Stacker" and "Support Impact" are only available for parsed matches.
                              </Text>
                            </View>
                          )}
                        </View>
                      );
                    })()}
                  </View>
                )}

                {activeTab === 'Combat' && (
                  <View>
                    <Text className="text-gray-400 uppercase tracking-widest text-[10px] font-bold mb-3 pl-1">Advanced Combat Performance</Text>
                    
                    {matchData.players.map((p, i) => {
                      const hasCombatStats = p.multi_kills || p.stuns !== undefined || p.hero_damage_targets;
                      if (!hasCombatStats) return null;
                      const isExpanded = expandedCombatPlayers.includes(i);

                      return (
                        <View key={i} className="bg-[#2a2a2a] rounded-xl mb-3 overflow-hidden border border-zinc-800">
                          <TouchableOpacity 
                            onPress={() => {
                              setExpandedCombatPlayers(prev => 
                                prev.includes(i) ? prev.filter(idx => idx !== i) : [...prev, i]
                              );
                            }}
                            className="flex-row items-center p-3 active:bg-zinc-800"
                          >
                            <Image source={{ uri: getHeroImageUrl(p.hero_id) }} className="w-10 h-7 rounded-sm mr-3" />
                            <Text className="text-white font-bold flex-1" numberOfLines={1}>{p.personaname || 'Anonymous'}</Text>
                            <View className="bg-red-500/10 px-2 py-1 rounded mr-3">
                              <Text className="text-red-500 text-[10px] font-bold">{p.hero_damage.toLocaleString()} DMG</Text>
                            </View>
                            <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={16} color="#4b5563" />
                          </TouchableOpacity>

                          {isExpanded && (
                            <View className="p-4 border-t border-zinc-800 bg-black/10">
                              {p.multi_kills && Object.keys(p.multi_kills).length > 0 && (
                                <View className="mb-4">
                                  <Text className="text-gray-500 text-[9px] font-bold uppercase mb-2">Kill Feats</Text>
                                  <View className="flex-row flex-wrap">
                                    {Object.entries(p.multi_kills).map(([key, val]) => {
                                      const label = key === '2' ? 'Double' : key === '3' ? 'Triple' : key === '4' ? 'Ultra' : 'Rampage';
                                      const color = key === '2' ? 'text-blue-400' : key === '3' ? 'text-purple-400' : key === '4' ? 'text-orange-400' : 'text-red-500';
                                      return (
                                        <View key={key} className="bg-zinc-900 px-3 py-1.5 rounded-lg mr-2 mb-2 border border-zinc-800">
                                          <Text className={`${color} text-xs font-bold`}>{val}x {label}</Text>
                                        </View>
                                      );
                                    })}
                                  </View>
                                </View>
                              )}

                              <View className="flex-row justify-between mb-4">
                                {p.stuns !== undefined && (
                                  <View className="flex-1 bg-zinc-900 p-2 rounded-lg mr-2 border border-zinc-800">
                                    <Text className="text-gray-500 text-[8px] font-bold uppercase">Stun Duration</Text>
                                    <Text className="text-white text-sm font-bold">{p.stuns.toFixed(1)}s</Text>
                                  </View>
                                )}
                                <View className="flex-1 bg-zinc-900 p-2 rounded-lg border border-zinc-800">
                                  <Text className="text-gray-500 text-[8px] font-bold uppercase">Damage Taken</Text>
                                  <Text className="text-red-500 text-sm font-bold">{p.hero_damage_taken?.toLocaleString() || 'N/A'}</Text>
                                </View>
                              </View>

                              <View className="flex-row justify-between mb-4">
                                {p.actions_per_min !== undefined && (
                                  <View className="flex-1 bg-zinc-900 p-2 rounded-lg mr-2 border border-zinc-800">
                                    <Text className="text-gray-500 text-[8px] font-bold uppercase">APM</Text>
                                    <Text className="text-white text-sm font-bold">{p.actions_per_min}</Text>
                                  </View>
                                )}
                                {p.kill_streaks && Object.keys(p.kill_streaks).length > 0 && (
                                  <View className="flex-1 bg-zinc-900 p-2 rounded-lg border border-zinc-800">
                                    <Text className="text-gray-500 text-[8px] font-bold uppercase">Max Streak</Text>
                                    <Text className="text-white text-sm font-bold">{Math.max(...Object.keys(p.kill_streaks).map(Number))}</Text>
                                  </View>
                                )}
                              </View>

                              {p.hero_damage_targets && (
                                <View className="mb-0">
                                  <Text className="text-gray-500 text-[9px] font-bold uppercase mb-2">Damage to Enemies</Text>
                                  {Object.entries(p.hero_damage_targets)
                                    .sort(([, a], [, b]) => b - a)
                                    .slice(0, 3)
                                    .map(([targetHeroId, damage]) => (
                                      <View key={targetHeroId} className="flex-row items-center mb-1">
                                        <Image source={{ uri: getHeroImageUrl(Number(targetHeroId)) }} className="w-6 h-4 rounded-sm mr-2" />
                                        <View className="flex-1 h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                                          <View 
                                            style={{ width: `${(damage / p.hero_damage) * 100}%` }} 
                                            className="h-full bg-red-500/60" 
                                          />
                                        </View>
                                        <Text className="text-gray-400 text-[10px] ml-2 w-12 text-right">{damage.toLocaleString()}</Text>
                                      </View>
                                    ))}
                                </View>
                              )}
                            </View>
                          )}
                        </View>
                      );
                    })}

                    {!matchData.version && (
                      renderParseInstructions("Detailed combat stats like multi-kills, stuns, and damage targets are only available for parsed matches.")
                    )}
                  </View>
                )}

                {activeTab === 'Support' && (
                  <View>
                    <Text className="text-gray-400 uppercase tracking-widest text-[10px] font-bold mb-3 pl-1">Vision & Utility Impact</Text>
                    
                    {matchData.players.map((p, i) => {
                      const hasSupportStats = (p.obs_placed || 0) > 0 || (p.sen_placed || 0) > 0 || p.hero_healing > 0 || (p.camps_stacked || 0) > 0;
                      if (!hasSupportStats) return null;
                      const isExpanded = expandedCombatPlayers.includes(i + 100); // Offset for support tab

                      return (
                        <View key={i} className="bg-[#2a2a2a] rounded-xl mb-3 overflow-hidden border border-zinc-800">
                          <TouchableOpacity 
                            onPress={() => {
                              setExpandedCombatPlayers(prev => 
                                prev.includes(i + 100) ? prev.filter(idx => idx !== i + 100) : [...prev, i + 100]
                              );
                            }}
                            className="flex-row items-center p-3 active:bg-zinc-800"
                          >
                            <Image source={{ uri: getHeroImageUrl(p.hero_id) }} className="w-10 h-7 rounded-sm mr-3" />
                            <Text className="text-white font-bold flex-1" numberOfLines={1}>{p.personaname || 'Anonymous'}</Text>
                            <View className="flex-row items-center">
                              <View className="bg-indigo-500/10 px-2 py-1 rounded mr-2 flex-row items-center">
                                <Ionicons name="eye" size={10} color="#6366f1" />
                                <Text className="text-indigo-500 text-[10px] font-bold ml-1">{(p.obs_placed || 0) + (p.sen_placed || 0)}</Text>
                              </View>
                              <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={16} color="#4b5563" />
                            </View>
                          </TouchableOpacity>

                          {isExpanded && (
                            <View className="p-4 border-t border-zinc-800 bg-black/10">
                              <View className="flex-row justify-between mb-4">
                                <View className="flex-1 bg-zinc-900 p-2 rounded-lg mr-2 border border-zinc-800">
                                  <Text className="text-gray-500 text-[8px] font-bold uppercase">Observers</Text>
                                  <Text className="text-white text-sm font-bold">{p.obs_placed || 0}</Text>
                                </View>
                                <View className="flex-1 bg-zinc-900 p-2 rounded-lg border border-zinc-800">
                                  <Text className="text-gray-500 text-[8px] font-bold uppercase">Sentries</Text>
                                  <Text className="text-white text-sm font-bold">{p.sen_placed || 0}</Text>
                                </View>
                              </View>

                              <View className="flex-row justify-between mb-0">
                                <View className="flex-1 bg-zinc-900 p-2 rounded-lg mr-2 border border-zinc-800">
                                  <Text className="text-gray-500 text-[8px] font-bold uppercase">Healing</Text>
                                  <Text className="text-blue-500 text-sm font-bold">{p.hero_healing.toLocaleString()}</Text>
                                </View>
                                <View className="flex-1 bg-zinc-900 p-2 rounded-lg border border-zinc-800">
                                  <Text className="text-gray-500 text-[8px] font-bold uppercase">Camps Stacked</Text>
                                  <Text className="text-purple-500 text-sm font-bold">{p.camps_stacked || 0}</Text>
                                </View>
                              </View>
                            </View>
                          )}
                        </View>
                      );
                    })}

                    {!matchData.version && (
                      renderParseInstructions("Vision stats, camps stacked, and detailed healing are only available for parsed matches.")
                    )}
                  </View>
                )}

                {activeTab === 'Economy' && (
                  <View>
                    <Text className="text-gray-400 uppercase tracking-widest text-[10px] font-bold mb-3 pl-1">Match Trends</Text>
                    
                    {matchData.radiant_gold_adv && matchData.radiant_xp_adv ? (
                      <>
                        <View className="bg-[#2a2a2a] p-5 rounded-xl mb-4 border border-zinc-800">
                          <Text className="text-white font-bold mb-4 text-center">Final Team Advantages</Text>
                          
                          {/* Gold Adv */}
                          <View className="flex-row items-center mb-6">
                            <View className="w-16"><Text className="text-gray-500 text-[10px] font-bold">GOLD</Text></View>
                            <View className="flex-1 h-3 bg-zinc-800 rounded-full overflow-hidden flex-row">
                              {matchData.radiant_gold_adv.slice(-1)[0] > 0 ? (
                                <>
                                  <View className="flex-1" />
                                  <View style={{ width: '50%' }} className="bg-win" />
                                </>
                              ) : (
                                <>
                                  <View style={{ width: '50%' }} className="bg-loss" />
                                  <View className="flex-1" />
                                </>
                              )}
                            </View>
                            <View className="w-20 items-end">
                              <Text className={`text-xs font-bold ${matchData.radiant_gold_adv.slice(-1)[0] > 0 ? 'text-win' : 'text-loss'}`}>
                                {Math.abs(matchData.radiant_gold_adv.slice(-1)[0]).toLocaleString()}
                              </Text>
                            </View>
                          </View>

                          {/* XP Adv */}
                          <View className="flex-row items-center">
                            <View className="w-16"><Text className="text-gray-500 text-[10px] font-bold">XP</Text></View>
                            <View className="flex-1 h-3 bg-zinc-800 rounded-full overflow-hidden flex-row">
                              {matchData.radiant_xp_adv.slice(-1)[0] > 0 ? (
                                <>
                                  <View className="flex-1" />
                                  <View style={{ width: '50%' }} className="bg-win" />
                                </>
                              ) : (
                                <>
                                  <View style={{ width: '50%' }} className="bg-loss" />
                                  <View className="flex-1" />
                                </>
                              )}
                            </View>
                            <View className="w-20 items-end">
                              <Text className={`text-xs font-bold ${matchData.radiant_xp_adv.slice(-1)[0] > 0 ? 'text-win' : 'text-loss'}`}>
                                {Math.abs(matchData.radiant_xp_adv.slice(-1)[0]).toLocaleString()}
                              </Text>
                            </View>
                          </View>
                        </View>

                        <View className="bg-[#2a2a2a] p-4 rounded-xl border border-zinc-800 mb-4">
                          <Text className="text-white font-bold mb-4 text-center">Net Worth & XP Difference</Text>
                          <LineChart
                            data={{
                              labels: matchData.radiant_gold_adv.map((_, i) => i % 10 === 0 ? `${i}` : ''),
                              datasets: [
                                {
                                  data: matchData.radiant_gold_adv,
                                  color: (opacity = 1) => `rgba(234, 179, 8, ${opacity})`, // Gold color
                                  strokeWidth: 2
                                },
                                {
                                  data: matchData.radiant_xp_adv,
                                  color: (opacity = 1) => `rgba(168, 85, 247, ${opacity})`, // Purple color
                                  strokeWidth: 2
                                }
                              ],
                              legend: ["Net Worth", "Experience"]
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
                      </>
                    ) : (
                      renderParseInstructions("Economy trends and graphs are only available for parsed matches.")
                    )}
                  </View>
                )}
                <View className="h-20" />
              </ScrollView>
            </View>
          ) : (
            <View className="flex-1 justify-center items-center">
              <Text className="text-red-500 font-bold">Failed to load match data.</Text>
              <TouchableOpacity onPress={onClose} className="mt-4 bg-zinc-800 px-6 py-2 rounded-lg">
                <Text className="text-white font-bold">Close</Text>
              </TouchableOpacity>
            </View>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
