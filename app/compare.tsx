import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator 
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import GlassHeader from '../src/components/GlassHeader';
import { 
  usePlayerProfile, 
  usePlayerWinLoss, 
  usePlayerHeroes,
  usePlayerTotals,
  useRecentMatches,
  usePlayerPeers
} from '../src/hooks/useOpenDota';
import CompareStatRow from '../src/components/CompareStatRow';
import { RankBadge } from '../src/components/RankBadge';
import { STEAM_CDN_BASE, getHeroImageUrl } from '../src/services/constants';

export default function CompareScreen() {
  const { p1, p2 } = useLocalSearchParams<{ p1?: string, p2?: string }>();
  const router = useRouter();

  // Player 1 Data
  const { data: profile1, isLoading: loadingP1 } = usePlayerProfile(p1 || null);
  const { data: wl1 } = usePlayerWinLoss(p1 || null);
  const { data: heroes1 } = usePlayerHeroes(p1 || null);
  const { data: totals1, isLoading: loadingTotals1 } = usePlayerTotals(p1 || null);
  const { data: recent1, isLoading: loadingRecent1 } = useRecentMatches(p1 || null, 20);
  const { data: peers1, isLoading: loadingPeers1 } = usePlayerPeers(p1 || null);

  // Player 2 Data
  const { data: profile2, isLoading: loadingP2 } = usePlayerProfile(p2 || null);
  const { data: wl2 } = usePlayerWinLoss(p2 || null);
  const { data: heroes2 } = usePlayerHeroes(p2 || null);
  const { data: totals2, isLoading: loadingTotals2 } = usePlayerTotals(p2 || null);
  const { data: recent2, isLoading: loadingRecent2 } = useRecentMatches(p2 || null, 20);
  const { data: peers2, isLoading: loadingPeers2 } = usePlayerPeers(p2 || null);

   const isLoading = loadingP1 || loadingP2 || loadingTotals1 || loadingTotals2 || 
                    loadingRecent1 || loadingRecent2 || loadingPeers1 || loadingPeers2;

  const renderPlayerHeader = (profile: any, side: 'left' | 'right') => {
    if (!profile) {
      return (
        <TouchableOpacity 
          className="flex-1 items-center justify-center p-4"
          onPress={() => router.push('/friends')}
        >
          <View className="w-16 h-16 rounded-full bg-zinc-800 items-center justify-center border-2 border-dashed border-zinc-600">
            <Ionicons name="add" size={32} color="#666" />
          </View>
          <Text className="text-zinc-500 mt-2 text-xs font-bold uppercase">Select Player</Text>
        </TouchableOpacity>
      );
    }

    return (
      <View className="flex-1 items-center p-4">
        <View className="relative">
          <Image 
            source={{ uri: profile.profile.avatarfull }} 
            className="w-16 h-16 rounded-2xl border-2 border-purple-500/50"
          />
          <View className="absolute -bottom-2 -right-2 scale-75">
            <RankBadge rankTier={profile.rank_tier} size={40} />
          </View>
        </View>
        <Text className="text-white font-black mt-3 text-center text-sm" numberOfLines={1}>
          {profile.profile.personaname}
        </Text>
      </View>
    );
  };

  const getWR = (wl: any) => {
    if (!wl || (wl.win + wl.lose) === 0) return 0;
    return ((wl.win / (wl.win + wl.lose)) * 100).toFixed(1);
  };

  const getKDA = (heroes: any[]) => {
    if (!heroes || heroes.length === 0) return "0.00";
    const totals = heroes.reduce((acc, h) => {
      acc.kills += h.avg_kills * h.games;
      acc.deaths += h.avg_deaths * h.games;
      acc.assists += h.avg_assists * h.games;
      acc.count += h.games;
      return acc;
    }, { kills: 0, deaths: 0, assists: 0, count: 0 });

    if (totals.count === 0) return "0.00";
    return ((totals.kills + totals.assists) / Math.max(1, totals.deaths)).toFixed(2);
  };

  const getAvg = (totals: any[], field: string) => {
    const entry = totals?.find(t => t.field === field);
    if (!entry || entry.n === 0) return 0;
    return Math.round(entry.sum / entry.n);
  };

  const getRecentWR = (matches: any[]) => {
    if (!matches || matches.length === 0) return 0;
    const wins = matches.filter(m => {
      const isRadiant = m.player_slot < 128;
      return (isRadiant && m.radiant_win) || (!isRadiant && !m.radiant_win);
    }).length;
    return ((wins / matches.length) * 100).toFixed(1);
  };

  const getVersatility = (heroes: any[]) => {
    return heroes?.filter(h => h.games > 0).length || 0;
  };

  const getMatchup = (peers: any[], targetId: string) => {
    const peer = peers?.find(p => p.account_id.toString() === targetId);
    if (!peer) return null;
    return {
      with: `${peer.with_win}W - ${peer.with_games - peer.with_win}L`,
      against: `${peer.against_games - peer.against_win}W - ${peer.against_win}L`, // "My wins against them"
      games: peer.games
    };
  };

  return (
    <LinearGradient colors={['#1a1a2e', '#121212']} style={{ flex: 1 }}>
      <GlassHeader 
        title="Compare Players" 
        leftComponent={
          <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
            <Ionicons name="chevron-back" size={28} color="white" />
          </TouchableOpacity>
        }
      />

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Comparison Header */}
        <View className="flex-row items-center justify-between bg-zinc-900/50 mx-4 mt-4 rounded-3xl border border-zinc-800">
          {renderPlayerHeader(profile1, 'left')}
          <View className="w-[1px] h-12 bg-zinc-800" />
          {renderPlayerHeader(profile2, 'right')}
        </View>

        {isLoading ? (
          <View className="py-20">
            <ActivityIndicator size="large" color="#8b5cf6" />
            <Text className="text-zinc-500 text-center mt-4 font-bold">Calculating Stats...</Text>
          </View>
        ) : profile1 && profile2 ? (
          <View className="px-4 mt-8">
            <CompareStatRow 
              label="Win Rate" 
              val1={getWR(wl1)} 
              val2={getWR(wl2)} 
              unit="%" 
            />
            <CompareStatRow 
              label="Total Matches" 
              val1={wl1 ? wl1.win + wl1.lose : 0} 
              val2={wl2 ? wl2.win + wl2.lose : 0} 
            />
            <CompareStatRow 
              label="Average KDA" 
              val1={getKDA(heroes1 || [])} 
              val2={getKDA(heroes2 || [])} 
            />
            <CompareStatRow 
              label="Avg GPM" 
              val1={getAvg(totals1 || [], 'gold_per_min')} 
              val2={getAvg(totals2 || [], 'gold_per_min')} 
            />
            <CompareStatRow 
              label="Avg XPM" 
              val1={getAvg(totals1 || [], 'xp_per_min')} 
              val2={getAvg(totals2 || [], 'xp_per_min')} 
            />
            <CompareStatRow 
              label="Recent Win Rate (Last 20)" 
              val1={getRecentWR(recent1 || [])} 
              val2={getRecentWR(recent2 || [])} 
              unit="%" 
            />
            <CompareStatRow 
              label="Hero Pool Size" 
              val1={getVersatility(heroes1 || [])} 
              val2={getVersatility(heroes2 || [])} 
              unit=" Heroes"
            />

            {/* Direct Matchup */}
            {getMatchup(peers1 || [], p2!) && (
              <View className="mt-4 bg-purple-500/10 p-4 rounded-3xl border border-purple-500/20">
                <Text className="text-purple-400 text-xs font-black text-center uppercase tracking-widest mb-3">
                  Direct History ({getMatchup(peers1 || [], p2!)?.games} Shared Matches)
                </Text>
                <View className="flex-row justify-between px-4">
                  <View className="items-center">
                    <Text className="text-gray-500 text-[10px] uppercase font-black mb-1">As Allies</Text>
                    <Text className="text-white font-bold">{getMatchup(peers1 || [], p2!)?.with}</Text>
                  </View>
                  <View className="items-center">
                    <Text className="text-gray-500 text-[10px] uppercase font-black mb-1">As Opponents</Text>
                    <Text className="text-white font-bold">{getMatchup(peers1 || [], p2!)?.against}</Text>
                  </View>
                </View>
                <Text className="text-zinc-500 text-[9px] text-center mt-3 italic">
                  *History from {profile1?.profile.personaname}'s perspective
                </Text>
              </View>
            )}

            {/* Top Heroes Comparison */}
            <View className="mt-8">
              <Text className="text-white font-black text-lg mb-6 text-center">Top Heroes Comparison</Text>
              {[0, 1, 2].map((idx) => {
                const h1 = heroes1?.sort((a, b) => b.games - a.games)[idx];
                const h2 = heroes2?.sort((a, b) => b.games - a.games)[idx];
                
                return (
                  <View key={idx} className="flex-row items-center justify-between mb-6 bg-zinc-900/30 p-4 rounded-2xl border border-zinc-800/50">
                    {/* Hero 1 */}
                    <View className="flex-1 items-center">
                      {h1 ? (
                        <>
                          <Image 
                            source={{ uri: getHeroImageUrl(Number(h1.hero_id)) }} 
                            className="w-12 h-12 rounded-lg mb-2"
                          />
                          <Text className="text-white font-bold text-xs">{(h1.win / h1.games * 100).toFixed(0)}% WR</Text>
                          <Text className="text-zinc-500 text-[10px]">{h1.games} games</Text>
                        </>
                      ) : (
                        <View className="w-12 h-12 rounded-lg bg-zinc-800" />
                      )}
                    </View>

                    <View className="px-4">
                      <Text className="text-zinc-700 font-black text-xs">#{idx + 1}</Text>
                    </View>

                    {/* Hero 2 */}
                    <View className="flex-1 items-center">
                      {h2 ? (
                        <>
                          <Image 
                            source={{ uri: getHeroImageUrl(Number(h2.hero_id)) }} 
                            className="w-12 h-12 rounded-lg mb-2"
                          />
                          <Text className="text-white font-bold text-xs">{(h2.win / h2.games * 100).toFixed(0)}% WR</Text>
                          <Text className="text-zinc-500 text-[10px]">{h2.games} games</Text>
                        </>
                      ) : (
                        <View className="w-12 h-12 rounded-lg bg-zinc-800" />
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        ) : (
          <View className="py-20 px-8 items-center">
            <Ionicons name="stats-chart" size={64} color="#333" />
            <Text className="text-zinc-500 text-center mt-4 font-bold">
              Select two players to start the comparison
            </Text>
            <TouchableOpacity 
              className="mt-8 bg-purple-500/20 border border-purple-500/50 px-8 py-3 rounded-2xl"
              onPress={() => router.push('/friends')}
            >
              <Text className="text-purple-400 font-black">BROWSE FRIENDS</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}
