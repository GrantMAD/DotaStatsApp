import React from 'react';
import {
  View, Text, Image, Modal, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SearchResult, HeroStats } from '../services/opendota';
import { getHeroImageUrl } from '../services/constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface UnifiedSearchModalProps {
  visible: boolean;
  onClose: () => void;
  searching: boolean;
  query: string;
  results: {
    heroes: HeroStats[];
    players: SearchResult[];
    matchId?: number;
  };
  onHeroPress: (heroId: number) => void;
  onPlayerPress: (accountId: string) => void;
  onMatchPress: (matchId: number) => void;
}

export default function UnifiedSearchModal({
  visible, onClose, searching, query, results,
  onHeroPress, onPlayerPress, onMatchPress
}: UnifiedSearchModalProps) {
  const hasResults = results.heroes.length > 0 || results.players.length > 0 || !!results.matchId;

  return (
    <Modal visible={visible} animationType="fade" transparent={true} onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', paddingTop: 60 }}>
        {/* Header */}
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center', 
          paddingHorizontal: 20, 
          paddingBottom: 20,
          borderBottomWidth: 1,
          borderBottomColor: '#2a2a3e'
        }}>
          <TouchableOpacity onPress={onClose} style={{ padding: 4 }}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 16 }}>
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>Search Results</Text>
            <Text style={{ color: '#888', fontSize: 12 }} numberOfLines={1}>Query: "{query}"</Text>
          </View>
        </View>

        {searching ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#8b5cf6" />
            <Text style={{ color: '#888', marginTop: 16 }}>Searching Dota archives...</Text>
          </View>
        ) : (
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }}>
            {!hasResults ? (
              <View style={{ padding: 40, alignItems: 'center' }}>
                <Ionicons name="search-outline" size={64} color="#333" />
                <Text style={{ color: '#666', fontSize: 16, marginTop: 16, textAlign: 'center' }}>
                  No heroes, players, or matches found matching "{query}"
                </Text>
              </View>
            ) : (
              <>
                {/* Hero Results */}
                {results.heroes.length > 0 && (
                  <View style={{ marginTop: 24 }}>
                    <Text style={{ color: '#8b5cf6', fontSize: 12, fontWeight: '800', marginHorizontal: 20, marginBottom: 12, letterSpacing: 1 }}>
                      HEROES
                    </Text>
                    {results.heroes.map(hero => (
                      <TouchableOpacity 
                        key={hero.id} 
                        style={{ 
                          flexDirection: 'row', 
                          alignItems: 'center', 
                          paddingHorizontal: 20, 
                          paddingVertical: 12,
                          backgroundColor: '#1E1E2E',
                          marginHorizontal: 16,
                          marginBottom: 8,
                          borderRadius: 12,
                          borderWidth: 1,
                          borderColor: '#2a2a3e'
                        }}
                        onPress={() => onHeroPress(hero.id)}
                      >
                        <Image 
                          source={{ uri: getHeroImageUrl(hero.id) }} 
                          style={{ width: 50, height: 28, borderRadius: 4, marginRight: 16 }}
                        />
                        <View style={{ flex: 1 }}>
                          <Text style={{ color: '#fff', fontWeight: '700' }}>{hero.localized_name}</Text>
                          <Text style={{ color: '#666', fontSize: 11 }}>{hero.roles.slice(0, 2).join(', ')}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={16} color="#444" />
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {/* Match Result */}
                {results.matchId && (
                  <View style={{ marginTop: 24 }}>
                    <Text style={{ color: '#3b82f6', fontSize: 12, fontWeight: '800', marginHorizontal: 20, marginBottom: 12, letterSpacing: 1 }}>
                      MATCH ID
                    </Text>
                    <TouchableOpacity 
                      style={{ 
                        flexDirection: 'row', 
                        alignItems: 'center', 
                        paddingHorizontal: 20, 
                        paddingVertical: 16,
                        backgroundColor: '#151525',
                        marginHorizontal: 16,
                        marginBottom: 8,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: '#3b82f6',
                        shadowColor: '#3b82f6',
                        shadowOpacity: 0.2,
                        shadowRadius: 4,
                        elevation: 4
                      }}
                      onPress={() => onMatchPress(results.matchId!)}
                    >
                      <View style={{ 
                        width: 40, height: 40, borderRadius: 20, backgroundColor: '#0D0D1A', 
                        alignItems: 'center', justifyContent: 'center', marginRight: 16
                      }}>
                        <Ionicons name="game-controller" size={20} color="#3b82f6" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800' }}>Match {results.matchId}</Text>
                        <Text style={{ color: '#3b82f6', fontSize: 11, fontWeight: '600' }}>GO TO MATCH DETAILS</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color="#3b82f6" />
                    </TouchableOpacity>
                  </View>
                )}

                {/* Player Results */}
                {results.players.length > 0 && (
                  <View style={{ marginTop: 24 }}>
                    <Text style={{ color: '#22c55e', fontSize: 12, fontWeight: '800', marginHorizontal: 20, marginBottom: 12, letterSpacing: 1 }}>
                      PLAYERS
                    </Text>
                    {results.players.map(player => (
                      <TouchableOpacity 
                        key={player.account_id} 
                        style={{ 
                          flexDirection: 'row', 
                          alignItems: 'center', 
                          paddingHorizontal: 16, 
                          paddingVertical: 12,
                          backgroundColor: '#1E1E2E',
                          marginHorizontal: 16,
                          marginBottom: 8,
                          borderRadius: 12,
                          borderWidth: 1,
                          borderColor: '#2a2a3e'
                        }}
                        onPress={() => onPlayerPress(player.account_id.toString())}
                      >
                        <Image 
                          source={{ uri: player.avatarfull }} 
                          style={{ width: 44, height: 44, borderRadius: 22, marginRight: 14, borderWidth: 1, borderColor: '#333' }}
                        />
                        <View style={{ flex: 1 }}>
                          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }} numberOfLines={1}>{player.personaname}</Text>
                          <Text style={{ color: '#666', fontSize: 11, marginTop: 2 }}>ID: {player.account_id}</Text>
                          {player.last_match_time && (
                            <Text style={{ color: '#444', fontSize: 9 }}>
                              Last played: {new Date(player.last_match_time).toLocaleDateString()}
                            </Text>
                          )}
                        </View>
                        <Ionicons name="chevron-forward" size={16} color="#444" />
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </>
            )}
          </ScrollView>
        )}
      </View>
    </Modal>
  );
}
