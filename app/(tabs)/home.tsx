import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import {
  View, Text, Image, TouchableOpacity, TextInput,
  ScrollView, FlatList, ActivityIndicator, RefreshControl,
} from 'react-native';
import { useSteamAuth } from '../../src/hooks/useSteamAuth';
import { Ionicons } from '@expo/vector-icons';
import { getHeroStats, getProMatches, HeroStats, ProMatch } from '../../src/services/opendota';
import HeroStatsCard from '../../src/components/HeroStatsCard';
import ProMatchCard from '../../src/components/ProMatchCard';
import HeroDetailModal from '../../src/components/HeroDetailModal';
import { MatchOverviewModal } from '../../src/components/MatchOverviewModal';
import UnifiedSearchModal from '../../src/components/UnifiedSearchModal';
import PlayerDetailModal from '../../src/components/PlayerDetailModal';
import LiveGameCard from '../../src/components/LiveGameCard';
import RecordCard from '../../src/components/RecordCard';
import { 
  searchPlayers, SearchResult,
  getLiveGames, getGlobalRecords,
  LiveGame, GlobalRecord
} from '../../src/services/opendota';

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

function LoadingSkeleton() {
  return (
    <View style={{ flexDirection: 'row', paddingHorizontal: 20 }}>
      {[1, 2, 3].map(i => (
        <View key={i} style={{
          width: 140, height: 160, backgroundColor: '#1e1e2e',
          borderRadius: 12, marginRight: 12,
        }}>
          <ActivityIndicator color="#8b5cf6" style={{ flex: 1 }} />
        </View>
      ))}
    </View>
  );
}

function ProBanItem({ hero, index, onPress }: { hero: ProcessedHero; index: number; onPress: () => void }) {
  const imgUrl = `https://cdn.cloudflare.steamstatic.com${hero.img}`;
  return (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1e1e2e',
        borderRadius: 10,
        padding: 10,
        marginBottom: 8,
        marginHorizontal: 20,
        borderWidth: 1,
        borderColor: '#2a2a3e',
      }}>
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
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { login, accountId } = useSteamAuth();

  const [heroStats, setHeroStats] = useState<HeroStats[]>([]);
  const [proMatches, setProMatches] = useState<ProMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modal state
  const [selectedHero, setSelectedHero] = useState<HeroStats | null>(null);
  const [heroModalVisible, setHeroModalVisible] = useState(false);
  const [selectedMatchId, setSelectedMatchId] = useState<number | null>(null);
  const [matchModalVisible, setMatchModalVisible] = useState(false);

  // Phase 2 Stats State
  const [liveGames, setLiveGames] = useState<LiveGame[]>([]);
  const [records, setRecords] = useState<{ gpm: GlobalRecord | null; kills: GlobalRecord | null; healing: GlobalRecord | null }>({
    gpm: null,
    kills: null,
    healing: null
  });

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [searchResults, setSearchResults] = useState<{ heroes: HeroStats[]; players: SearchResult[]; matchId?: number }>({
    heroes: [],
    players: [],
  });

  // Player Detail within Search
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [playerModalVisible, setPlayerModalVisible] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setSearching(true);
    setSearchModalVisible(true);
    
    try {
      const queryLower = searchQuery.toLowerCase().trim();
      
      // 1. Search Heroes (local filtering on already-fetched heroStats)
      const matchingHeroes = heroStats.filter(h => 
        h.localized_name.toLowerCase().includes(queryLower)
      );

      // 2. Search for Match ID (if numeric)
      const isMatchId = /^\d+$/.test(queryLower);
      const matchId = isMatchId ? parseInt(queryLower) : undefined;

      // 3. Search Players (API call)
      const players = await searchPlayers(searchQuery);

      setSearchResults({
        heroes: matchingHeroes,
        players: players,
        matchId: matchId
      });
    } catch (e) {
      console.error('Search failed:', e);
    } finally {
      setSearching(false);
    }
  };

  const openHeroModal = useCallback((heroId: number) => {
    const hero = heroStats.find(h => h.id === heroId);
    if (hero) {
      setSelectedHero(hero);
      setHeroModalVisible(true);
    }
  }, [heroStats]);

  const openMatchModal = useCallback((match: ProMatch) => {
    setSelectedMatchId(match.match_id);
    setMatchModalVisible(true);
  }, []);

  const openMatchById = useCallback((matchId: number) => {
    setSelectedMatchId(matchId);
    setMatchModalVisible(true);
  }, []);

  const openPlayerDetails = useCallback((accountId: string) => {
    setSelectedPlayerId(accountId);
    setPlayerModalVisible(true);
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [heroes, matches, live, gpmRec, killRec, healRec] = await Promise.all([
        getHeroStats(),
        getProMatches(10),
        getLiveGames(),
        getGlobalRecords('gold_per_min'),
        getGlobalRecords('kills'),
        getGlobalRecords('hero_healing')
      ]);
      setHeroStats(heroes);
      setProMatches(matches);
      setLiveGames(live);
      setRecords({
        gpm: gpmRec[0] || null,
        kills: killRec[0] || null,
        healing: healRec[0] || null
      });
    } catch (e) {
      console.error('Fetch failed:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  const { topWinRate, mostPicked, proPicks, proBans } = processHeroStats(heroStats);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#121212' }}
      contentContainerStyle={{ paddingBottom: 40 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8b5cf6" />
      }
    >
      {/* Header Area */}
      <View style={{ alignItems: 'center', paddingTop: 24, paddingHorizontal: 24 }}>
        <Image
          source={require('../../assets/images/dota_logo_placeholder.png')}
          style={{ width: 48, height: 48, marginBottom: 16 }}
          resizeMode="contain"
        />
        <Text style={{ fontSize: 28, color: '#fff', fontWeight: '800', marginBottom: 6, textAlign: 'center' }}>
          Dota Stuff
        </Text>
        <Text style={{ color: '#888', textAlign: 'center', fontSize: 13, lineHeight: 18, marginBottom: 16 }}>
          Hero stats, pro matches, and performance insights
        </Text>

        {/* Login / Signed-in indicator */}
        {!accountId ? (
          <TouchableOpacity onPress={login} style={{ width: '100%', marginBottom: 16 }}>
            <View style={{
              backgroundColor: '#8b5cf6',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 14,
              borderRadius: 12,
            }}>
              <Ionicons name="logo-steam" size={20} color="#fff" style={{ marginRight: 10 }} />
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>Sign in with Steam</Text>
            </View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            onPress={() => router.push('/dashboard')}
            activeOpacity={0.7}
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
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>View My Dashboard</Text>
              <Ionicons name="chevron-forward" size={16} color="#22c55e" style={{ marginLeft: 8 }} />
            </View>
          </TouchableOpacity>
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
              <TouchableOpacity 
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
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* ─── Section 1: Top Win Rate Heroes ─── */}
      <SectionHeader icon="trophy" title="Highest Win Rate" color="#f59e0b" />
      {loading ? <LoadingSkeleton /> : (
        <FlatList
          data={topWinRate}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20 }}
          keyExtractor={(item) => `wr-${item.id}`}
          renderItem={({ item, index }) => (
            <TouchableOpacity activeOpacity={0.7} onPress={() => openHeroModal(item.id)}>
              <HeroStatsCard
                heroName={item.name}
                heroImg={item.img}
                winRate={item.winRate}
                pickCount={item.picks}
                rank={index + 1}
                mode="winrate"
              />
            </TouchableOpacity>
          )}
        />
      )}

      {/* ─── Section 2: Most Picked Heroes ─── */}
      <SectionHeader icon="flame" title="Most Picked" color="#ef4444" />
      {loading ? <LoadingSkeleton /> : (
        <FlatList
          data={mostPicked}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20 }}
          keyExtractor={(item) => `pk-${item.id}`}
          renderItem={({ item, index }) => (
            <TouchableOpacity activeOpacity={0.7} onPress={() => openHeroModal(item.id)}>
              <HeroStatsCard
                heroName={item.name}
                heroImg={item.img}
                winRate={item.winRate}
                pickCount={item.picks}
                rank={index + 1}
                mode="picks"
              />
            </TouchableOpacity>
          )}
        />
      )}

      {/* ─── Section 3: Pro Scene ─── */}
      <SectionHeader icon="star" title="Pro Scene — Top Picks" color="#8b5cf6" />
      {loading ? <LoadingSkeleton /> : (
        <FlatList
          data={proPicks}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20 }}
          keyExtractor={(item) => `pp-${item.id}`}
          renderItem={({ item, index }) => (
            <TouchableOpacity activeOpacity={0.7} onPress={() => openHeroModal(item.id)}>
              <HeroStatsCard
                heroName={item.name}
                heroImg={item.img}
                winRate={item.winRate}
                pickCount={item.picks}
                rank={index + 1}
                mode="picks"
              />
            </TouchableOpacity>
          )}
        />
      )}

      {/* Pro Bans */}
      <SectionHeader icon="ban" title="Pro Scene — Most Banned" color="#ef4444" />
      {loading ? (
        <View style={{ paddingHorizontal: 20 }}>
          <ActivityIndicator color="#8b5cf6" />
        </View>
      ) : (
        proBans.slice(0, 5).map((hero, index) => (
          <ProBanItem key={`ban-${hero.id}`} hero={hero} index={index} onPress={() => openHeroModal(hero.id)} />
        ))
      )}

      {/* Recent Pro Matches */}
      <SectionHeader icon="game-controller" title="Recent Pro Matches" color="#3b82f6" />
      {loading ? <LoadingSkeleton /> : (
        <FlatList
          data={proMatches}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20 }}
          keyExtractor={(item) => `pm-${item.match_id}`}
          renderItem={({ item }) => (
            <TouchableOpacity activeOpacity={0.7} onPress={() => openMatchModal(item)}>
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
            </TouchableOpacity>
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
            renderItem={({ item }) => (
              <LiveGameCard game={item} onPress={openMatchById} />
            )}
          />
        </>
      )}

      {/* ─── Section 6: Global Records ─── */}
      {(records.gpm || records.kills || records.healing) && (
        <>
          <SectionHeader icon="medal" title="Global All-Time Records" color="#f59e0b" />
          <RecordCard 
            title="Highest GPM Ever" 
            field="gold_per_min" 
            record={records.gpm} 
            icon="cash" 
            color="#eab308" 
            onPress={openMatchById} 
          />
          <RecordCard 
            title="Most Kills in a Match" 
            field="kills" 
            record={records.kills} 
            icon="skull" 
            color="#ef4444" 
            onPress={openMatchById} 
          />
          <RecordCard 
            title="Legendary Support Impact" 
            field="hero_healing" 
            record={records.healing} 
            icon="heart" 
            color="#3b82f6" 
            onPress={openMatchById} 
          />
        </>
      )}

      {/* Modals */}
      <HeroDetailModal
        hero={selectedHero}
        visible={heroModalVisible}
        onClose={() => setHeroModalVisible(false)}
      />
      <MatchOverviewModal
        matchId={selectedMatchId}
        visible={matchModalVisible}
        onClose={() => setMatchModalVisible(false)}
        onPushPlayer={openPlayerDetails}
      />

      {/* Unified Search Modal */}
      <UnifiedSearchModal
        visible={searchModalVisible}
        onClose={() => setSearchModalVisible(false)}
        searching={searching}
        query={searchQuery}
        results={searchResults}
        onHeroPress={(id) => {
          setSearchModalVisible(false);
          openHeroModal(id);
        }}
        onMatchPress={(id) => {
          setSearchModalVisible(false);
          openMatchById(id);
        }}
        onPlayerPress={(id) => {
          openPlayerDetails(id);
        }}
      />

      {/* Player Detail Modal */}
      <PlayerDetailModal
        visible={playerModalVisible}
        accountId={selectedPlayerId}
        onClose={() => setPlayerModalVisible(false)}
        onMatchPress={(id) => {
          setPlayerModalVisible(false);
          setSearchModalVisible(false);
          openMatchById(id);
        }}
      />
    </ScrollView>
  );
}
