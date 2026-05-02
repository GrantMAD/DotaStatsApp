import React, { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'expo-router';
import {
  View, Text, Image, TouchableOpacity, TextInput,
  ScrollView, FlatList, ActivityIndicator, RefreshControl,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useSupabaseAuth } from '../../src/context/SupabaseAuthContext';
import { Ionicons } from '@expo/vector-icons';
import { HeroStats, ProMatch, searchPlayers } from '../../src/services/opendota';
import HeroStatsCard from '../../src/components/HeroStatsCard';
import ProMatchCard from '../../src/components/ProMatchCard';
import HeroDetailModal from '../../src/components/HeroDetailModal';
import { MatchOverviewModal } from '../../src/components/MatchOverviewModal';
import PlayerDetailModal from '../../src/components/PlayerDetailModal';
import LiveGameCard from '../../src/components/LiveGameCard';
import RecordCard from '../../src/components/RecordCard';
import ErrorCard from '../../src/components/ErrorCard';
import { useHeroStats, useProMatches, useLiveGames, useGlobalRecordsMulti, usePlayerProfile } from '../../src/hooks/useOpenDota';
import { queryClient } from '../../src/services/queryClient';
import Skeleton from '../../src/components/Skeleton';
import PressableScale from '../../src/components/PressableScale';
import GlassHeader from '../../src/components/GlassHeader';
import NotificationBell from '../../src/components/NotificationBell';
import { useMenu } from './_layout';
import { useModals } from '../../src/context/ModalContext';
import { calculateTierList, getBracketFromRankTier, BRACKET_NAMES, TierHero } from '../../src/services/tierList';

// Minimum picks threshold to avoid heroes with tiny sample sizes
const MIN_PICKS = 5000;

interface ProcessedHero {
  id: number;
  name: string;
  img: string;
  winRate: number;
  picks: number;
}

function processHeroStats(heroes: HeroStats[]): { topWinRate: ProcessedHero[]; mostPicked: ProcessedHero[]; proPicks: ProcessedHero[]; proBans: ProcessedHero[] } {
  if (!heroes || heroes.length === 0) return { topWinRate: [], mostPicked: [], proPicks: [], proBans: [] };

  // Filter heroes with enough picks
  const eligible = heroes.filter(h => h.pub_pick >= MIN_PICKS);

  const withWinRate = eligible.map(h => ({
    id: h.id,
    name: h.localized_name,
    img: h.img,
    winRate: (h.pub_win / h.pub_pick) * 100,
    picks: h.pub_pick,
  }));

  const topWinRate = [...withWinRate]
    .sort((a, b) => b.winRate - a.winRate)
    .slice(0, 10);

  const mostPicked = [...withWinRate]
    .sort((a, b) => b.picks - a.picks)
    .slice(0, 10);

  // Pro scene - no minimum filter needed
  const proPicks = [...heroes]
    .filter(h => h.pro_pick > 0)
    .sort((a, b) => b.pro_pick - a.pro_pick)
    .slice(0, 10)
    .map(h => ({
      id: h.id,
      name: h.localized_name,
      img: h.img,
      winRate: h.pro_pick > 0 ? (h.pro_win / h.pro_pick) * 100 : 0,
      picks: h.pro_pick,
    }));

  const proBans = [...heroes]
    .filter(h => h.pro_ban > 0)
    .sort((a, b) => b.pro_ban - a.pro_ban)
    .slice(0, 10)
    .map(h => ({
      id: h.id,
      name: h.localized_name,
      img: h.img,
      winRate: h.pro_pick > 0 ? (h.pro_win / h.pro_pick) * 100 : 0,
      picks: h.pro_ban,
    }));

  return { topWinRate, mostPicked, proPicks, proBans };
}

function SectionHeader({ icon, title, color }: { icon: string; title: string; color: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginTop: 28, marginBottom: 14 }}>
      <Ionicons name={icon as any} size={20} color={color} style={{ marginRight: 8 }} />
      <Text style={{ color: '#fff', fontSize: 18, fontWeight: '800', letterSpacing: 0.3 }}>{title}</Text>
    </View>
  );
}

function HeroCardSkeleton() {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
        <View key={i} style={{
          width: 140, height: 180, backgroundColor: '#1e1e2e',
          borderRadius: 12, marginRight: 12, padding: 12,
          borderWidth: 1, borderColor: '#2a2a3e'
        }}>
          <Skeleton width="100%" height={80} borderRadius={8} />
          <Skeleton width="80%" height={16} borderRadius={4} style={{ marginTop: 12 }} />
          <Skeleton width="60%" height={12} borderRadius={4} style={{ marginTop: 8 }} />
          <View style={{ flex: 1 }} />
          <Skeleton width="100%" height={24} borderRadius={6} />
        </View>
      ))}
    </ScrollView>
  );
}

function ProMatchSkeleton() {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
        <View key={i} style={{
          width: 280, height: 160, backgroundColor: '#1e1e2e',
          borderRadius: 16, marginRight: 12, padding: 16,
          borderWidth: 1, borderColor: '#2a2a3e'
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
             <Skeleton width={80} height={40} borderRadius={8} />
             <Skeleton width={40} height={20} borderRadius={4} style={{ marginTop: 10 }} />
             <Skeleton width={80} height={40} borderRadius={8} />
          </View>
          <Skeleton width="100%" height={12} borderRadius={4} style={{ marginBottom: 8 }} />
          <Skeleton width="70%" height={12} borderRadius={4} />
          <View style={{ flex: 1 }} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
             <Skeleton width={100} height={10} borderRadius={2} />
             <Skeleton width={60} height={10} borderRadius={2} />
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

function ProBanSkeleton() {
  return (
    <View style={{ paddingHorizontal: 20 }}>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
        <View key={i} style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#1e1e2e',
          borderRadius: 10,
          padding: 10,
          marginBottom: 8,
          borderWidth: 1,
          borderColor: '#2a2a3e',
        }}>
          <Skeleton width={20} height={14} borderRadius={2} style={{ marginRight: 10 }} />
          <Skeleton width={40} height={22} borderRadius={4} style={{ marginRight: 10 }} />
          <Skeleton width="40%" height={14} borderRadius={4} style={{ flex: 1 }} />
          <Skeleton width={60} height={20} borderRadius={6} />
        </View>
      ))}
    </View>
  );
}

function ProBanItem({ hero, index, onPress }: { hero: ProcessedHero; index: number; onPress: () => void }) {
  const imgUrl = `https://cdn.cloudflare.steamstatic.com${hero.img}`;
  return (
    <PressableScale onPress={onPress}>
      <Animated.View 
        entering={FadeInDown.delay(Math.min(index, 8) * 80).springify()}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#1e1e2e',
          borderRadius: 10,
          padding: 10,
          marginBottom: 8,
          marginHorizontal: 20,
          borderWidth: 1,
          borderColor: '#2a2a3e',
        }}
      >
        <Text style={{ color: '#ef4444', fontSize: 14, fontWeight: '800', width: 24 }}>
          {index + 1}
        </Text>
        <Image
          source={{ uri: imgUrl }}
          style={{ width: 40, height: 22, borderRadius: 4, marginRight: 10, backgroundColor: '#252538' }}
          resizeMode="cover"
        />
        <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600', flex: 1 }} numberOfLines={1}>
          {hero.name}
        </Text>
        <View style={{
          backgroundColor: '#2a1515',
          paddingHorizontal: 8,
          paddingVertical: 3,
          borderRadius: 6,
        }}>
          <Text style={{ color: '#ef4444', fontSize: 12, fontWeight: '700' }}>
            {hero.picks} bans
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={14} color="#444" style={{ marginLeft: 8 }} />
      </Animated.View>
    </PressableScale>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { session, steamAccountId } = useSupabaseAuth();
  const { setMenuVisible } = useMenu();
  const { pushModal } = useModals();

  // Queries
  const { data: heroesData = [], isLoading: loadingHeroes, isError: errorHeroes, refetch: refetchHeroes } = useHeroStats();
  const { data: proMatchesData = [], isLoading: loadingMatches, isError: errorMatches, refetch: refetchMatches } = useProMatches(10);
  const { data: liveGames = [], refetch: refetchLive } = useLiveGames();
  const { data: multiRecords = {}, refetch: refetchRecords } = useGlobalRecordsMulti(['gold_per_min', 'kills', 'hero_healing']);

  // Get user rank for default bracket
  const { data: userProfile } = usePlayerProfile(steamAccountId || null);
  const userBracket = useMemo(() => getBracketFromRankTier(userProfile?.rank_tier), [userProfile?.rank_tier]);
  const [selectedBracket, setSelectedBracket] = useState<number | null>(null);
  
  // Final bracket to use (user's or manually selected)
  const activeBracket = selectedBracket || userBracket;

  const isLoading = loadingHeroes || loadingMatches;
  const hasError = (errorHeroes && heroesData.length === 0) && (errorMatches && proMatchesData.length === 0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');

  // Pro Bans Expand State
  const [isBansExpanded, setIsBansExpanded] = useState(false);

  const processedStats = useMemo(() => processHeroStats(heroesData), [heroesData]);
  const { topWinRate, mostPicked, proPicks, proBans } = processedStats;

  // Tier List Calculation
  const tierList = useMemo(() => {
    if (!heroesData.length) return [];
    return calculateTierList(heroesData, activeBracket);
  }, [heroesData, activeBracket]);

  const sTier = useMemo(() => tierList.filter(h => h.tier === 'S'), [tierList]);
  const aTier = useMemo(() => tierList.filter(h => h.tier === 'A').slice(0, 10), [tierList]);

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    router.push({ pathname: '/search', params: { q: searchQuery.trim() } });
    setSearchQuery('');
  };

  const openHeroModal = useCallback((heroId: number) => {
    pushModal('hero', heroId);
  }, [pushModal]);

  const openMatchModal = useCallback((match: ProMatch) => {
    pushModal('match', match.match_id);
  }, [pushModal]);

  const openMatchById = useCallback((matchId: number) => {
    pushModal('match', matchId);
  }, [pushModal]);

  const openPlayerDetails = useCallback((accountId: string | number) => {
    pushModal('player', accountId);
  }, [pushModal]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all([
      refetchHeroes(),
      refetchMatches(),
      refetchLive(),
      refetchRecords(),
    ]);
    setIsRefreshing(false);
  }, [refetchHeroes, refetchMatches, refetchLive, refetchRecords]);

  const records = {
    gpm: multiRecords.gold_per_min?.[0] || null,
    kills: multiRecords.kills?.[0] || null,
    healing: multiRecords.hero_healing?.[0] || null
  };

  return (
    <LinearGradient 
      colors={['#1a1a2e', '#121212']} 
      style={{ flex: 1 }}
    >
      <GlassHeader 
        leftComponent={
          session ? (
            <TouchableOpacity 
              onPress={() => setMenuVisible(true)}
              style={{ padding: 8, marginLeft: -8 }}
            >
              <Ionicons name="menu" size={28} color="white" />
            </TouchableOpacity>
          ) : undefined
        }
        rightComponent={<NotificationBell />}
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#8b5cf6" />
        }
      >
        {/* Header Content Area */}
        <View style={{ paddingTop: 20, paddingHorizontal: 24 }}>
          <Text style={{ fontSize: 28, color: '#fff', fontWeight: '800', marginBottom: 6 }}>
            Dota Stuff
          </Text>
          <Text style={{ color: '#888', fontSize: 13, lineHeight: 18, marginBottom: 20 }}>
            Hero stats, pro matches, and performance insights
          </Text>

          {/* Login / Signed-in indicator */}
          {!session ? (
            <PressableScale onPress={() => router.push('/sign-in')} style={{ width: '100%', marginBottom: 16 }}>
              <View style={{
                backgroundColor: '#8b5cf6',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 14,
                borderRadius: 12,
              }}>
                <Ionicons name="log-in" size={20} color="#fff" style={{ marginRight: 10 }} />
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>Sign In</Text>
              </View>
            </PressableScale>
          ) : !steamAccountId ? (
            <PressableScale 
              onPress={() => router.push('/profile')}
              style={{ width: '100%', marginBottom: 16 }}
            >
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#1E1E2E',
                paddingVertical: 14,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: '#eab308',
                borderStyle: 'dashed',
              }}>
                <Ionicons name="link" size={20} color="#eab308" style={{ marginRight: 10 }} />
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>Link Steam Account</Text>
                <Ionicons name="chevron-forward" size={16} color="#eab308" style={{ marginLeft: 8 }} />
              </View>
            </PressableScale>
          ) : (
            <PressableScale 
              onPress={() => router.push('/profile')}
              style={{ width: '100%', marginBottom: 16 }}
            >
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#1E1E2E',
                paddingVertical: 14,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: '#22c55e',
                borderStyle: 'dashed',
              }}>
                <Ionicons name="person-circle" size={20} color="#22c55e" style={{ marginRight: 10 }} />
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>View My Profile</Text>
                <Ionicons name="chevron-forward" size={16} color="#22c55e" style={{ marginLeft: 8 }} />
              </View>
            </PressableScale>
          )}

          {/* Search bar */}
          <View style={{ width: '100%' }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#1e1e2e',
              padding: 12,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: '#2a2a3e',
            }}>
              <Ionicons name="search" size={18} color="#555" style={{ marginRight: 10 }} />
              <TextInput
                placeholder="Search for players, heroes..."
                placeholderTextColor="#555"
                style={{ flex: 1, color: '#fff', fontSize: 14 }}
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearch}
                returnKeyType="search"
                autoCorrect={false}
              />
              {searchQuery.trim().length > 0 && (
                <PressableScale 
                  onPress={handleSearch}
                  style={{
                    backgroundColor: '#8b5cf6',
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginLeft: 10
                  }}
                >
                  <Ionicons name="arrow-forward" size={18} color="#fff" />
                </PressableScale>
              )}
            </View>
          </View>
        </View>

        {hasError ? (
          <ErrorCard 
            message="We couldn't load the latest Dota data. Check your connection and try again."
            onRetry={onRefresh}
          />
        ) : (
          <>
            {/* ─── Section 0: Hero Meta Tier List ─── */}
            <SectionHeader icon="analytics" title="Hero Meta Tier List" color="#8b5cf6" />
            
            {/* Bracket Selector */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              contentContainerStyle={{ paddingHorizontal: 20, marginBottom: 16 }}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((b) => (
                <TouchableOpacity
                  key={`bracket-${b}`}
                  onPress={() => setSelectedBracket(b)}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 20,
                    marginRight: 8,
                    backgroundColor: activeBracket === b ? '#8b5cf6' : '#1e1e2e',
                    borderWidth: 1,
                    borderColor: activeBracket === b ? '#a78bfa' : '#2a2a3e',
                  }}
                >
                  <Text style={{ 
                    color: activeBracket === b ? '#fff' : '#888', 
                    fontSize: 12, 
                    fontWeight: '700' 
                  }}>
                    {BRACKET_NAMES[b]}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {isLoading ? <HeroCardSkeleton /> : (
              <FlatList
                data={[...sTier, ...aTier]}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20 }}
                keyExtractor={(item) => `tier-${item.id}`}
                renderItem={({ item, index }) => (
                  <PressableScale onPress={() => openHeroModal(item.id)}>
                    <Animated.View entering={FadeInDown.delay(Math.min(index, 8) * 80).springify()}>
                      <HeroStatsCard
                        heroName={item.name}
                        heroImg={item.img}
                        winRate={item.winRate}
                        pickCount={item.picks}
                        tier={item.tier}
                        mode="winrate"
                      />
                    </Animated.View>
                  </PressableScale>
                )}
              />
            )}

            {/* ─── Section 1: Top Win Rate Heroes ─── */}
            <SectionHeader icon="trophy" title="Highest Win Rate" color="#f59e0b" />
            {isLoading ? <HeroCardSkeleton /> : (
              <FlatList
                data={topWinRate}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20 }}
                keyExtractor={(item) => `wr-${item.id}`}
                renderItem={({ item, index }) => (
                  <PressableScale onPress={() => openHeroModal(item.id)}>
                    <Animated.View entering={FadeInDown.delay(Math.min(index, 8) * 80).springify()}>
                      <HeroStatsCard
                        heroName={item.name}
                        heroImg={item.img}
                        winRate={item.winRate}
                        pickCount={item.picks}
                        rank={index + 1}
                        mode="winrate"
                      />
                    </Animated.View>
                  </PressableScale>
                )}
              />
            )}

            {/* ─── Section 2: Most Picked Heroes ─── */}
            <SectionHeader icon="flame" title="Most Picked" color="#ef4444" />
            {isLoading ? <HeroCardSkeleton /> : (
              <FlatList
                data={mostPicked}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20 }}
                keyExtractor={(item) => `pk-${item.id}`}
                renderItem={({ item, index }) => (
                  <PressableScale onPress={() => openHeroModal(item.id)}>
                    <Animated.View entering={FadeInDown.delay(Math.min(index, 8) * 80).springify()}>
                      <HeroStatsCard
                        heroName={item.name}
                        heroImg={item.img}
                        winRate={item.winRate}
                        pickCount={item.picks}
                        rank={index + 1}
                        mode="picks"
                      />
                    </Animated.View>
                  </PressableScale>
                )}
              />
            )}

            {/* ─── Section 3: Pro Scene ─── */}
            <SectionHeader icon="star" title="Pro Scene — Top Picks" color="#8b5cf6" />
            {isLoading ? <HeroCardSkeleton /> : (
              <FlatList
                data={proPicks}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20 }}
                keyExtractor={(item) => `pp-${item.id}`}
                renderItem={({ item, index }) => (
                  <PressableScale onPress={() => openHeroModal(item.id)}>
                    <Animated.View entering={FadeInDown.delay(Math.min(index, 8) * 80).springify()}>
                      <HeroStatsCard
                        heroName={item.name}
                        heroImg={item.img}
                        winRate={item.winRate}
                        pickCount={item.picks}
                        rank={index + 1}
                        mode="picks"
                      />
                    </Animated.View>
                  </PressableScale>
                )}
              />
            )}

            {/* Pro Bans */}
            <SectionHeader icon="ban" title="Pro Scene — Most Banned" color="#ef4444" />
            {isLoading ? <ProBanSkeleton /> : (
              <>
                {(isBansExpanded ? proBans : proBans.slice(0, 5)).map((hero, index) => (
                  <ProBanItem key={`ban-${hero.id}`} hero={hero} index={index} onPress={() => openHeroModal(hero.id)} />
                ))}
                
                {proBans.length > 5 && (
                  <TouchableOpacity 
                    onPress={() => setIsBansExpanded(!isBansExpanded)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginTop: 12,
                      paddingVertical: 12,
                      backgroundColor: '#1e1e2e',
                      marginHorizontal: 20,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: '#2a2a3e',
                      marginBottom: 10
                    }}
                  >
                    <Text style={{ color: '#8b5cf6', fontWeight: '800', marginRight: 6, textTransform: 'uppercase', fontSize: 12 }}>
                      {isBansExpanded ? 'Show Less' : `Show All (${proBans.length})`}
                    </Text>
                    <Ionicons 
                      name={isBansExpanded ? "chevron-up" : "chevron-down"} 
                      size={16} 
                      color="#8b5cf6" 
                    />
                  </TouchableOpacity>
                )}
              </>
            )}

            {/* Recent Pro Matches */}
            <SectionHeader icon="game-controller" title="Recent Pro Matches" color="#3b82f6" />
            {isLoading ? <ProMatchSkeleton /> : (
              <FlatList
                data={proMatchesData}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20 }}
                keyExtractor={(item) => `pm-${item.match_id}`}
                renderItem={({ item, index }) => (
                  <PressableScale onPress={() => openMatchModal(item)}>
                    <Animated.View entering={FadeInDown.delay(Math.min(index, 8) * 80).springify()}>
                      <ProMatchCard
                        radiantName={item.radiant_name}
                        direName={item.dire_name}
                        radiantScore={item.radiant_score}
                        direScore={item.dire_score}
                        radiantWin={item.radiant_win}
                        duration={item.duration}
                        leagueName={item.league_name}
                        startTime={item.start_time}
                      />
                    </Animated.View>
                  </PressableScale>
                )}
              />
            )}

            {/* ─── Section 4: Live High-MMR Games ─── */}
            {liveGames.length > 0 && (
              <>
                <SectionHeader icon="radio" title="Live High-MMR Games" color="#ef4444" />
                <FlatList
                  data={liveGames}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 20 }}
                  keyExtractor={(item) => `live-${item.match_id}`}
                  renderItem={({ item, index }) => (
                    <PressableScale onPress={() => openMatchById(item.match_id)}>
                      <Animated.View entering={FadeInDown.delay(Math.min(index, 8) * 80).springify()}>
                        <LiveGameCard game={item} onPress={openMatchById} />
                      </Animated.View>
                    </PressableScale>
                  )}

                />
              </>
            )}

            {/* ─── Section 6: Global Records ─── */}
            {(records.gpm || records.kills || records.healing) && (
              <>
                <SectionHeader icon="medal" title="Global All-Time Records" color="#f59e0b" />
                <Animated.View entering={FadeInDown.delay(100).springify()}>
                  <RecordCard 
                    title="Highest GPM Ever" 
                    field="gold_per_min" 
                    record={records.gpm} 
                    icon="cash" 
                    color="#eab308" 
                    onPress={openMatchById} 
                  />
                </Animated.View>
                <Animated.View entering={FadeInDown.delay(200).springify()}>
                  <RecordCard 
                    title="Most Kills in a Match" 
                    field="kills" 
                    record={records.kills} 
                    icon="skull" 
                    color="#ef4444" 
                    onPress={openMatchById} 
                  />
                </Animated.View>
                <Animated.View entering={FadeInDown.delay(300).springify()}>
                  <RecordCard 
                    title="Legendary Support Impact" 
                    field="hero_healing" 
                    record={records.healing} 
                    icon="heart" 
                    color="#3b82f6" 
                    onPress={openMatchById} 
                  />
                </Animated.View>
              </>
            )}
          </>
        )}
      </ScrollView>
    </LinearGradient>
  );
}
