import React, { useState } from 'react';
import { 
  View, Text, Modal, ScrollView, Image, TouchableOpacity, 
  ActivityIndicator, Dimensions 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ProMatchCard from './ProMatchCard';
import { MatchOverviewModal } from './MatchOverviewModal';
import PlayerDetailModal from './PlayerDetailModal';
import { useLeagueMatches } from '../hooks/useOpenDota';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Props {
  visible: boolean;
  league: any | null;
  onClose: () => void;
}

export default function LeagueDetailModal({ visible, league, onClose }: Props) {
  const { data: matchesData = [], isLoading: loading } = useLeagueMatches(visible && league ? league.leagueid : null);
  const matches = matchesData.slice(0, 50);
  
  // Drill-down states
  const [selectedMatchId, setSelectedMatchId] = useState<number | null>(null);
  const [matchModalVisible, setMatchModalVisible] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);
  const [playerModalVisible, setPlayerModalVisible] = useState(false);

  const openMatch = (id: number) => {
    setSelectedMatchId(id);
    setMatchModalVisible(true);
  };

  const openPlayer = (id: number) => {
    setSelectedPlayerId(id);
    setPlayerModalVisible(true);
  };

  if (!league) return null;

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
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: '800' }}>League Details</Text>
            <View style={{ width: 28 }} />
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* League Hero Section */}
            <View style={{ borderBottomWidth: 1, borderBottomColor: '#1e1e2e' }}>
              {league.banner ? (
                <Image source={{ uri: league.banner }} style={{ width: '100%', height: 180 }} resizeMode="cover" />
              ) : (
                <View style={{ height: 120, backgroundColor: '#151525', justifyContent: 'center', alignItems: 'center' }}>
                  <Ionicons name="trophy" size={60} color="#1e1e2e" />
                </View>
              )}
              
              <View style={{ padding: 20 }}>
                <View style={{ 
                  backgroundColor: '#8b5cf615', 
                  paddingHorizontal: 10, 
                  paddingVertical: 4, 
                  borderRadius: 6,
                  alignSelf: 'flex-start',
                  marginBottom: 12
                }}>
                  <Text style={{ color: '#8b5cf6', fontSize: 10, fontWeight: '900', textTransform: 'uppercase' }}>
                    {league.tier} Tier Tournament
                  </Text>
                </View>
                <Text style={{ color: '#fff', fontSize: 24, fontWeight: '900' }}>{league.name}</Text>
                <Text style={{ color: '#444', fontSize: 12, marginTop: 4 }}>League ID: {league.leagueid}</Text>
              </View>
            </View>

            {loading ? (
              <View style={{ padding: 40, alignItems: 'center' }}>
                <ActivityIndicator color="#8b5cf6" size="large" />
                <Text style={{ color: '#666', marginTop: 12 }}>Fetching league match results...</Text>
              </View>
            ) : (
              <View style={{ paddingVertical: 20 }}>
                {matches.length > 0 ? (
                  <>
                    <Text style={{ color: '#fff', fontSize: 18, fontWeight: '800', marginBottom: 16, paddingHorizontal: 20 }}>Recent Matches</Text>
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
                  </>
                ) : (
                  <View style={{ padding: 40, alignItems: 'center' }}>
                    <Ionicons name="calendar-outline" size={48} color="#1e1e2e" />
                    <Text style={{ color: '#666', marginTop: 16 }}>No recent matches found for this league.</Text>
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
