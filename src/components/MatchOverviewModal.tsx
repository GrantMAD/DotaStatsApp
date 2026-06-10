import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { requestMatchParse } from '../services/matchService';
import { useMatchDetails, usePlayerPeers, useDraftAnalysis } from '../hooks/useOpenDota';
import { useSupabaseAuth } from '../context/SupabaseAuthContext';
import { trackMatchSnapshot, trackOpenDotaMatchView } from '../services/analytics';
import { MatchOverviewSkeleton } from './Skeleton';
import GlassModal from './GlassModal';

// Domain-specific components
import { MatchHeader } from './match/MatchHeader';
import { ScoreboardTab } from './match/ScoreboardTab';
import { HighlightsTab } from './match/HighlightsTab';
import { EconomyTab } from './match/EconomyTab';
import { TimelineTab } from './match/TimelineTab';
import { ChatTab } from './match/ChatTab';

type MatchTab = 'Scoreboard' | 'Highlights' | 'Economy' | 'Timeline' | 'Chat';

interface MatchOverviewModalProps {
  visible: boolean;
  matchId: number | null;
  onClose: () => void;
  onPushPlayer?: (id: number) => void;
}

export function MatchOverviewModal({ visible, matchId, onClose, onPushPlayer }: MatchOverviewModalProps) {
  const { steamAccountId } = useSupabaseAuth();
  const currentUserId = steamAccountId ? steamAccountId.toString() : null;
  const { data: matchData, isLoading: loading } = useMatchDetails(visible ? matchId : null);
  const { data: userPeers = [] } = usePlayerPeers(visible ? currentUserId : null);

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
  const [parseRequested, setParseRequested] = useState(false);
  const [pollCount, setPollCount] = useState(0);

  useEffect(() => {
    if (visible && matchId) {
      trackOpenDotaMatchView(matchId.toString(), false);
    }
  }, [visible, matchId]);

  useEffect(() => {
    if (matchData) {
      trackMatchSnapshot(matchData);
    }
  }, [matchData]);

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

  if (!visible) return null;

  return (
    <GlassModal visible={visible} onClose={onClose}>
      {loading ? (
        <MatchOverviewSkeleton />
      ) : matchData ? (
        <View className="flex-1">
          <MatchHeader matchData={matchData} onClose={onClose} />

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
            {activeTab === 'Scoreboard' && (
              <ScoreboardTab
                matchData={matchData}
                userPeers={userPeers}
                draftAdvantage={draftAdvantage}
                parseRequested={parseRequested}
                isParsing={isParsing}
                onRequestParse={handleRequestParse}
                onPushPlayer={onPushPlayer}
              />
            )}

            {activeTab === 'Highlights' && (
              <HighlightsTab matchData={matchData} />
            )}

            {activeTab === 'Economy' && (
              <EconomyTab
                matchData={matchData}
                parseRequested={parseRequested}
                isParsing={isParsing}
                onRequestParse={handleRequestParse}
              />
            )}

            {activeTab === 'Timeline' && (
              <TimelineTab
                matchData={matchData}
                parseRequested={parseRequested}
                isParsing={isParsing}
                onRequestParse={handleRequestParse}
              />
            )}

            {activeTab === 'Chat' && (
              <ChatTab
                matchData={matchData}
                parseRequested={parseRequested}
                isParsing={isParsing}
                onRequestParse={handleRequestParse}
              />
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
