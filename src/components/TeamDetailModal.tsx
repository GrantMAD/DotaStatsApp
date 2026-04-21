import React, { useEffect, useState } from 'react';
import { 
  View, Text, Modal, ScrollView, Image, TouchableOpacity, 
  ActivityIndicator, FlatList, Dimensions, Pressable 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { 
  ProTeam, ProPlayer, getTeamRoster, getTeamMatches, ProMatch 
} from '../services/opendota';
import ProPlayerItem from './ProPlayerItem';
import ProMatchCard from './ProMatchCard';
import { MatchOverviewModal } from './MatchOverviewModal';
import PlayerDetailModal from './PlayerDetailModal';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Props {
  visible: boolean;
  team: ProTeam | null;
  onClose: () => void;
}

export default function TeamDetailModal({ visible, team, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [roster, setRoster] = useState<ProPlayer[]>([]);
  const [matches, setMatches] = useState<ProMatch[]>([]);
  
  // Drill-down states
  const [selectedMatchId, setSelectedMatchId] = useState<number | null>(null);
  const [matchModalVisible, setMatchModalVisible] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);
  const [playerModalVisible, setPlayerModalVisible] = useState(false);

  useEffect(() => {
    if (visible && team) {
      loadTeamDetails();
    }
  }, [visible, team]);

  const loadTeamDetails = async () => {
    if (!team) return;
    setLoading(true);
    try {
      const [rosterData, matchData] = await Promise.all([
        getTeamRoster(team.team_id),
        getTeamMatches(team.team_id)
      ]);
      setRoster(rosterData);
      setMatches(matchData.slice(0, 20)); // Show last 20 matches
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openMatch = (id: number) => {
    setSelectedMatchId(id);
    setMatchModalVisible(true);
  };

  const openPlayer = (id: number) => {
    setSelectedPlayerId(id);
    setPlayerModalVisible(true);
  };

  if (!team) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' }}>
        <View style={{ 
          backgroundColor: '#121212', 
          height: SCREEN_HEIGHT * 0.9, 
          borderTopLeftRadius: 30, 
          borderTopRightRadius: 30,
          overflow: 'hidden'
        }}>
          {/* Header */}
          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            padding: 20,
            borderBottomWidth: 1,
            borderBottomColor: '#2a2a3e'
          }}>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: '800' }}>Team Details</Text>
            <View style={{ width: 28 }} />
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Team Hero Section */}
            <View style={{ padding: 24, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#1e1e2e' }}>
              <View style={{ 
                width: 100, 
                height: 100, 
                borderRadius: 20, 
                backgroundColor: '#1E1E2E', 
                justifyContent: 'center', 
                alignItems: 'center',
                borderWidth: 1,
                borderColor: '#2a2a3e'
              }}>
                {team.logo_url ? (
                  <Image source={{ uri: team.logo_url }} style={{ width: 70, height: 70 }} resizeMode="contain" />
                ) : (
                  <Ionicons name="shield-outline" size={50} color="#333" />
                )}
              </View>
              
              <Text style={{ color: '#fff', fontSize: 24, fontWeight: '900', marginTop: 16 }}>{team.name}</Text>
              <Text style={{ color: '#8b5cf6', fontSize: 14, fontWeight: '700', marginTop: 4 }}>
                {team.tag ? `[${team.tag}] • ` : ''}Rating: {Math.round(team.rating)}
              </Text>
              
              <View style={{ flexDirection: 'row', marginTop: 20, backgroundColor: '#1e1e2e', borderRadius: 12, padding: 12 }}>
                <View style={{ alignItems: 'center', paddingHorizontal: 16 }}>
                  <Text style={{ color: '#22c55e', fontSize: 18, fontWeight: '800' }}>{team.wins}</Text>
                  <Text style={{ color: '#666', fontSize: 10, fontWeight: '700' }}>WINS</Text>
                </View>
                <View style={{ width: 1, backgroundColor: '#2a2a3e' }} />
                <View style={{ alignItems: 'center', paddingHorizontal: 16 }}>
                  <Text style={{ color: '#ef4444', fontSize: 18, fontWeight: '800' }}>{team.losses}</Text>
                  <Text style={{ color: '#666', fontSize: 10, fontWeight: '700' }}>LOSSES</Text>
                </View>
              </View>
            </View>

            {loading ? (
              <View style={{ padding: 40, alignItems: 'center' }}>
                <ActivityIndicator color="#8b5cf6" size="large" />
                <Text style={{ color: '#666', marginTop: 12 }}>Loading roster & matches...</Text>
              </View>
            ) : (
              <View style={{ paddingBottom: 40 }}>
                {/* Roster Section */}
                {roster.length > 0 && (
                  <View style={{ marginTop: 24, paddingHorizontal: 20 }}>
                    <Text style={{ color: '#fff', fontSize: 18, fontWeight: '800', marginBottom: 16 }}>Current Roster</Text>
                    {roster.map(player => (
                      <ProPlayerItem key={player.account_id} player={player} onPress={openPlayer} />
                    ))}
                  </View>
                )}

                {/* Matches Section */}
                {matches.length > 0 && (
                  <View style={{ marginTop: 24 }}>
                    <Text style={{ color: '#fff', fontSize: 18, fontWeight: '800', marginBottom: 16, paddingHorizontal: 20 }}>Recent Pro Matches</Text>
                    {matches.map(item => (
                      <TouchableOpacity key={item.match_id} activeOpacity={0.7} onPress={() => openMatch(item.match_id)}>
                        <View style={{ paddingHorizontal: 20, marginBottom: 12 }}>
                          <ProMatchCard
                            radiantName={item.radiant_name}
                            direName={item.dire_name}
                            radiantScore={item.radiant_score}
                            direScore={item.dire_score}
                            radiantWin={item.radiant_win}
                            duration={item.duration}
                            leagueName={item.league_name}
                            startTime={item.start_time}
                            compact
                            fullWidth={true}
                          />
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            )}
          </ScrollView>
        </View>

        {/* Drill-down Modals */}
        <MatchOverviewModal
          visible={matchModalVisible}
          matchId={selectedMatchId}
          onClose={() => setMatchModalVisible(false)}
          onPushPlayer={openPlayer}
        />
        <PlayerDetailModal
          visible={playerModalVisible}
          accountId={selectedPlayerId}
          onClose={() => setPlayerModalVisible(false)}
          onMatchPress={openMatch}
        />
      </View>
    </Modal>
  );
}
