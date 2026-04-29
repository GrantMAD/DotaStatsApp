import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { League, ProTeam, ProPlayer } from '../../src/services/opendota';
import LeagueCard from '../../src/components/LeagueCard';
import TeamListItem from '../../src/components/TeamListItem';
import ProPlayerItem from '../../src/components/ProPlayerItem';
import TeamDetailModal from '../../src/components/TeamDetailModal';
import LeagueDetailModal from '../../src/components/LeagueDetailModal';
import PlayerDetailModal from '../../src/components/PlayerDetailModal';
import { MatchOverviewModal } from '../../src/components/MatchOverviewModal';
import { useLeagues, useProTeams, useProPlayers } from '../../src/hooks/useOpenDota';
import Skeleton from '../../src/components/Skeleton';
import PressableScale from '../../src/components/PressableScale';
import GlassHeader from '../../src/components/GlassHeader';
import NotificationBell from '../../src/components/NotificationBell';
import { useMenu } from './_layout';
import { useSupabaseAuth } from '../../src/context/SupabaseAuthContext';

type TabType = 'Tournaments' | 'Teams' | 'Players';
type SubTabType = 'Premium' | 'Professional' | 'Amateur';

function ProSkeleton() {
  return (
    <View style={{ paddingHorizontal: 20 }}>
      {[1, 2, 3, 4, 5, 6].map(i => (
        <View key={i} style={{
          backgroundColor: '#1e1e2e',
          height: 80,
          borderRadius: 12,
          marginBottom: 12,
          padding: 12,
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: '#2a2a3e'
        }}>
          <Skeleton width={50} height={50} borderRadius={8} style={{ marginRight: 12 }} />
          <View style={{ flex: 1 }}>
             <Skeleton width="60%" height={18} borderRadius={4} style={{ marginBottom: 8 }} />
             <Skeleton width="40%" height={12} borderRadius={4} />
          </View>
          <Skeleton width={30} height={20} borderRadius={6} />
        </View>
      ))}
    </View>
  );
}

export default function ProSceneScreen() {
  const { session } = useSupabaseAuth();
  const { setMenuVisible } = useMenu();
  const [activeTab, setActiveTab] = useState<TabType>('Tournaments');
  const [subTab, setSubTab] = useState<SubTabType>('Premium');
  const [searchQuery, setSearchQuery] = useState('');

  // Queries
  const { data: leagues = [], isLoading: loadingLeagues, refetch: refetchLeagues } = useLeagues();
  const { data: teams = [], isLoading: loadingTeams, refetch: refetchTeams } = useProTeams();
  const { data: players = [], isLoading: loadingPlayers, refetch: refetchPlayers } = useProPlayers();

  const loading = loadingLeagues || loadingTeams || loadingPlayers;
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modal State
  const [selectedLeague, setSelectedLeague] = useState<League | null>(null);
  const [leagueModalVisible, setLeagueModalVisible] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<ProTeam | null>(null);
  const [teamModalVisible, setTeamModalVisible] = useState(false);
  const [selectedMatchId, setSelectedMatchId] = useState<number | null>(null);
  const [matchModalVisible, setMatchModalVisible] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);
  const [playerModalVisible, setPlayerModalVisible] = useState(false);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all([
      refetchLeagues(),
      refetchTeams(),
      refetchPlayers()
    ]);
    setIsRefreshing(false);
  }, [refetchLeagues, refetchTeams, refetchPlayers]);

  const filteredLeagues = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    let baseLeagues = leagues;
    if (subTab === 'Premium') {
      baseLeagues = leagues.filter((l) => l.tier === 'premium');
    } else if (subTab === 'Professional') {
      baseLeagues = leagues.filter((l) => l.tier === 'professional');
    } else {
      baseLeagues = leagues.filter((l) => l.tier !== 'premium' && l.tier !== 'professional');
    }
    if (!query) return baseLeagues;
    return baseLeagues.filter((l) => l.name.toLowerCase().includes(query));
  }, [leagues, searchQuery, subTab]);

  const filteredTeams = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    let baseTeams = teams;
    if (subTab === 'Premium') {
      baseTeams = teams.filter((t) => t.rating >= 1400);
    } else if (subTab === 'Professional') {
      baseTeams = teams.filter((t) => t.rating >= 1150 && t.rating < 1400);
    } else {
      baseTeams = teams.filter((t) => t.rating < 1150);
    }
    if (!query) return baseTeams;
    return baseTeams.filter(
      (t) =>
        t.name.toLowerCase().includes(query) || (t.tag && t.tag.toLowerCase().includes(query))
    );
  }, [teams, searchQuery, subTab]);

  const filteredPlayers = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    let basePlayers = players;
    if (subTab === 'Premium') {
      const premiumTeamNames = teams.filter((t) => t.rating >= 1400).map((t) => t.name);
      basePlayers = players.filter((p) => p.team_name && premiumTeamNames.includes(p.team_name));
    } else if (subTab === 'Professional') {
      const premiumTeamNames = teams.filter((t) => t.rating >= 1400).map((t) => t.name);
      basePlayers = players.filter(
        (p) => p.team_name && !premiumTeamNames.includes(p.team_name)
      );
    } else {
      basePlayers = players.filter((p) => !p.team_name);
    }
    if (!query) return basePlayers.slice(0, 50);
    return basePlayers
      .filter(
        (p) =>
          p.personaname.toLowerCase().includes(query) ||
          (p.full_name && p.full_name.toLowerCase().includes(query)) ||
          (p.team_name && p.team_name.toLowerCase().includes(query))
      )
      .slice(0, 100);
  }, [players, teams, searchQuery, subTab]);

  const handleLeaguePress = (id: number) => {
    const league = leagues.find((l) => l.leagueid === id);
    if (league) {
      setSelectedLeague(league);
      setLeagueModalVisible(true);
    }
  };

  const handleTeamPress = (id: number) => {
    const team = teams.find((t) => t.team_id === id);
    if (team) {
      setSelectedTeam(team);
      setTeamModalVisible(true);
    }
  };

  const handlePlayerPress = (id: number) => {
    setSelectedPlayerId(id);
    setPlayerModalVisible(true);
  };

  const handleMatchPress = (id: number) => {
    setSelectedMatchId(id);
    setMatchModalVisible(true);
  };

  const memoizedHeader = useMemo(() => (
    <View style={{ paddingBottom: 20, paddingTop: 10 }}>
      <View style={{ paddingHorizontal: 20, paddingBottom: 16 }}>
        <Text style={{ color: '#fff', fontSize: 28, fontFamily: 'Outfit_900Black', marginBottom: 4 }}>
          Pro Scene
        </Text>
        <Text style={{ color: '#9ca3af', fontSize: 14, fontFamily: 'Outfit_400Regular' }}>
          Stay updated with the professional Dota 2 scene.
        </Text>
      </View>
      <View
        style={{
          flexDirection: 'row',
          backgroundColor: '#1e1e2e',
          padding: 4,
          borderRadius: 12,
          marginBottom: 16,
          marginHorizontal: 20,
        }}
      >
        {(['Tournaments', 'Teams', 'Players'] as TabType[]).map((tab) => (
          <PressableScale
            key={tab}
            onPress={() => {
              setActiveTab(tab);
              setSearchQuery('');
            }}
            style={{
              flex: 1,
              paddingVertical: 10,
              alignItems: 'center',
              backgroundColor: activeTab === tab ? '#8b5cf6' : 'transparent',
              borderRadius: 10,
            }}
          >
            <Text
              style={{
                color: activeTab === tab ? '#fff' : '#666',
                fontSize: 12,
                fontWeight: '800',
                textTransform: 'uppercase',
              }}
            >
              {tab}
            </Text>
          </PressableScale>
        ))}
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 20 }}>
        {(['Premium', 'Professional', 'Amateur'] as SubTabType[]).map((tab) => (
          <PressableScale
            key={tab}
            onPress={() => {
              setSubTab(tab);
              setSearchQuery('');
            }}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 6,
              marginHorizontal: 4,
              backgroundColor: subTab === tab ? '#8b5cf6' : '#1e1e2e',
              borderRadius: 20,
              borderWidth: 1,
              borderColor: subTab === tab ? '#8b5cf6' : '#2a2a3e',
            }}
          >
            <Text
              style={{
                color: subTab === tab ? '#fff' : '#666',
                fontSize: 10,
                fontWeight: '900',
                textTransform: 'uppercase',
              }}
            >
              {tab}
            </Text>
          </PressableScale>
        ))}
      </View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#1e1e2e',
          borderRadius: 12,
          paddingHorizontal: 12,
          height: 48,
          borderWidth: 1,
          borderColor: '#2a2a3e',
          marginHorizontal: 20,
        }}
      >
        <Ionicons name="search" size={18} color="#666" />
        <TextInput
          placeholder={
            activeTab === 'Tournaments'
              ? `Search ${subTab} leagues...`
              : activeTab === 'Teams'
              ? `Search ${subTab} teams...`
              : `Search ${subTab} players...`
          }
          placeholderTextColor="#444"
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={{ flex: 1, color: '#fff', marginLeft: 10, fontSize: 14 }}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color="#444" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  ), [activeTab, subTab, searchQuery]);
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

      <View style={{ flex: 1 }}>
        {loading ? (
          <View style={{ marginTop: 20 }}>
            <ProSkeleton />
          </View>
        ) : (
          <FlatList
            data={
              activeTab === 'Tournaments'
                ? filteredLeagues
                : activeTab === 'Teams'
                ? filteredTeams
                : filteredPlayers
            }
            keyExtractor={(item: any) => {
              if (activeTab === 'Tournaments') return `l-${item.leagueid}`;
              if (activeTab === 'Teams') return `t-${item.team_id}`;
              return `p-${item.account_id}`;
            }}
            ListHeaderComponent={memoizedHeader}
            contentContainerStyle={{ paddingBottom: 40 }}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={onRefresh}
                tintColor="#8b5cf6"
              />
            }
            renderItem={({ item, index }) => {
              if (activeTab === 'Tournaments') {
                return (
                  <Animated.View entering={FadeInDown.delay(Math.min(index, 8) * 50).springify()}>
                    <LeagueCard league={item as League} onPress={handleLeaguePress} />
                  </Animated.View>
                );
              } else if (activeTab === 'Teams') {
                const team = item as ProTeam;
                const rank = teams.indexOf(team) + 1;
                return (
                  <Animated.View entering={FadeInDown.delay(Math.min(index, 8) * 50).springify()}>
                    <TeamListItem team={team} rank={rank} onPress={handleTeamPress} />
                  </Animated.View>
                );
              } else {
                return (
                  <Animated.View entering={FadeInDown.delay(Math.min(index, 8) * 50).springify()}>
                    <ProPlayerItem
                      player={item as ProPlayer}
                      onPress={handlePlayerPress}
                    />
                  </Animated.View>
                );
              }
            }}
            ListEmptyComponent={
              <View style={{ padding: 40, alignItems: 'center' }}>
                <Ionicons name="search-outline" size={48} color="#1e1e2e" />
                <Text style={{ color: '#666', marginTop: 16, textAlign: 'center' }}>
                  No {activeTab.toLowerCase()} found matching "{searchQuery}"
                </Text>
              </View>
            }
          />
        )}
      </View>

      <LeagueDetailModal
        visible={leagueModalVisible}
        league={selectedLeague}
        onClose={() => setLeagueModalVisible(false)}
      />
      <TeamDetailModal
        visible={teamModalVisible}
        team={selectedTeam}
        onClose={() => setTeamModalVisible(false)}
      />
      <PlayerDetailModal
        visible={playerModalVisible}
        accountId={selectedPlayerId}
        onClose={() => setPlayerModalVisible(false)}
        onMatchPress={handleMatchPress}
      />
      <MatchOverviewModal
        visible={matchModalVisible}
        matchId={selectedMatchId}
        onClose={() => setMatchModalVisible(false)}
        onPushPlayer={handlePlayerPress}
      />
    </LinearGradient>
  );
}
