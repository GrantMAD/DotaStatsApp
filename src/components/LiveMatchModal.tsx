import React, { useMemo } from 'react';
import { View, Text, Image, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useHeroStats, useLiveGames } from '../hooks/useOpenDota';
import { STEAM_CDN_BASE, getHeroImageUrl } from '../services/constants';
import GlassModal from './GlassModal';
import MeshGradient from './MeshGradient';
import { LinearGradient } from 'expo-linear-gradient';
import Skeleton from './Skeleton';

interface Props {
  visible: boolean;
  matchId: number | null;
  onClose: () => void;
  onPushPlayer?: (id: number) => void;
}

export default function LiveMatchModal({ visible, matchId, onClose, onPushPlayer }: Props) {
  const { data: liveGames = [], isLoading: loadingLive } = useLiveGames();
  const { data: heroStats = [] } = useHeroStats();

  const game = useMemo(() => {
    return liveGames.find(g => g.match_id === matchId) || null;
  }, [liveGames, matchId]);

  const formatGold = (gold: number) => {
    const absoluteGold = Math.abs(gold);
    if (absoluteGold >= 1000) return `${(absoluteGold / 1000).toFixed(1)}k`;
    return absoluteGold.toString();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getHeroName = (heroId: number) => {
    const hero = heroStats.find(h => h.id === heroId);
    return hero ? hero.localized_name : 'Unknown Hero';
  };

  const radiantPlayers = useMemo(() => {
    if (!game) return [];
    return game.players.filter(p => p.team === 0 || game.players.indexOf(p) < 5);
  }, [game]);

  const direPlayers = useMemo(() => {
    if (!game) return [];
    return game.players.filter(p => p.team === 1 || game.players.indexOf(p) >= 5);
  }, [game]);

  React.useEffect(() => {
    if (visible && matchId) {
      trackOpenDotaMatchView(matchId.toString(), true);
    }
  }, [visible, matchId]);

  if (!visible) return null;

  return (
    <GlassModal visible={visible} onClose={onClose}>
      <View style={{ flex: 1 }}>
        {/* Custom Header */}
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          paddingHorizontal: 20, 
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(255,255,255,0.05)'
        }}>
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '900', letterSpacing: 0.5 }}>
            {game ? `LIVE MATCH ${game.match_id}` : 'LIVE MATCH'}
          </Text>
          <TouchableOpacity 
            onPress={onClose}
            style={{ 
              width: 32, 
              height: 32, 
              borderRadius: 16, 
              backgroundColor: 'rgba(255,255,255,0.1)', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}
          >
            <Ionicons name="close" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {!game ? (
          <View style={{ padding: 20 }}>
            {loadingLive ? (
              <View style={{ gap: 16 }}>
                <Skeleton width="100%" height={120} borderRadius={16} />
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <Skeleton width="48%" height={300} borderRadius={16} />
                  <Skeleton width="48%" height={300} borderRadius={16} />
                </View>
              </View>
            ) : (
              <View style={{ alignItems: 'center', justifyContent: 'center', height: 300 }}>
                <Ionicons name="alert-circle" size={48} color="#4b5563" />
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700', marginTop: 16 }}>Match not found or finished</Text>
                <Text style={{ color: '#9ca3af', fontSize: 14, marginTop: 8, textAlign: 'center' }}>
                  Live data is only available while the match is in progress.
                </Text>
              </View>
            )}
          </View>
        ) : (
          <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
            {/* Live Indicator & Stats */}
            <View style={{ paddingHorizontal: 20, paddingTop: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                backgroundColor: 'rgba(239, 68, 68, 0.1)', 
                paddingHorizontal: 8, 
                paddingVertical: 4, 
                borderRadius: 6,
                borderWidth: 1,
                borderColor: 'rgba(239, 68, 68, 0.2)'
              }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#ef4444', marginRight: 6 }} />
                <Text style={{ color: '#ef4444', fontSize: 10, fontWeight: '900', textTransform: 'uppercase' }}>Live</Text>
              </View>

              <View style={{ flexDirection: 'row', gap: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Ionicons name="time-outline" size={14} color="#8b5cf6" />
                  <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>{formatTime(game.game_time)}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Ionicons name="people-outline" size={14} color="#f59e0b" />
                  <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>{game.spectators}</Text>
                </View>
              </View>
            </View>

            {/* Scoreboard Card */}
            <View style={{ padding: 20 }}>
              <View style={{ 
                backgroundColor: '#1E1E2E', 
                borderRadius: 24, 
                padding: 24, 
                borderWidth: 1, 
                borderColor: '#2a2a3e',
                overflow: 'hidden'
              }}>
                <MeshGradient intensity={0.1} />
                
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ color: '#22c55e', fontSize: 32, fontWeight: '900', fontStyle: 'italic' }}>{game.radiant_score}</Text>
                    <Text style={{ color: '#6b7280', fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 }}>Radiant</Text>
                  </View>

                  <View style={{ alignItems: 'center', gap: 8 }}>
                    <View style={{ 
                      backgroundColor: 'rgba(0,0,0,0.3)', 
                      paddingHorizontal: 12, 
                      paddingVertical: 6, 
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: 'rgba(255,255,255,0.05)'
                    }}>
                      <Text style={{ 
                        color: game.radiant_lead > 0 ? '#22c55e' : game.radiant_lead < 0 ? '#ef4444' : '#9ca3af',
                        fontSize: 12,
                        fontWeight: '900',
                        fontStyle: 'italic',
                        textTransform: 'uppercase'
                      }}>
                        {game.radiant_lead > 0 ? 'Radiant' : game.radiant_lead < 0 ? 'Dire' : 'Even'}
                        <Text style={{ color: '#fff' }}> +{formatGold(game.radiant_lead)} Gold</Text>
                      </Text>
                    </View>
                    <View style={{ height: 1, width: 30, backgroundColor: '#2a2a3e' }} />
                    <Text style={{ color: '#4b5563', fontSize: 9, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 2 }}>Average MMR: {game.average_mmr}</Text>
                  </View>

                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ color: '#ef4444', fontSize: 32, fontWeight: '900', fontStyle: 'italic' }}>{game.dire_score}</Text>
                    <Text style={{ color: '#6b7280', fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 }}>Dire</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Teams Grid */}
            <View style={{ paddingHorizontal: 20, flexDirection: 'row', gap: 12 }}>
              {/* Radiant */}
              <View style={{ flex: 1, gap: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingLeft: 4 }}>
                  <FontAwesome5 name="trophy" size={10} color="#22c55e" />
                  <Text style={{ color: '#22c55e', fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 }}>Radiant Heroes</Text>
                </View>
                {radiantPlayers.map((player, idx) => (
                  <View key={`rad-${idx}`} style={{ 
                    flexDirection: 'row', 
                    alignItems: 'center', 
                    backgroundColor: 'rgba(255,255,255,0.03)', 
                    padding: 8, 
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: 'rgba(255,255,255,0.05)'
                  }}>
                    <Image 
                      source={{ uri: getHeroImageUrl(player.hero_id) }} 
                      style={{ width: 36, height: 24, borderRadius: 4, marginRight: 8, backgroundColor: '#111' }}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }} numberOfLines={1}>{player.name || 'Anonymous'}</Text>
                      <Text style={{ color: '#6b7280', fontSize: 8, fontWeight: '700', textTransform: 'uppercase' }}>{getHeroName(player.hero_id)}</Text>
                    </View>
                  </View>
                ))}
              </View>

              {/* Dire */}
              <View style={{ flex: 1, gap: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingLeft: 4 }}>
                  <FontAwesome5 name="trophy" size={10} color="#ef4444" />
                  <Text style={{ color: '#ef4444', fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 }}>Dire Heroes</Text>
                </View>
                {direPlayers.map((player, idx) => (
                  <View key={`dire-${idx}`} style={{ 
                    flexDirection: 'row', 
                    alignItems: 'center', 
                    backgroundColor: 'rgba(255,255,255,0.03)', 
                    padding: 8, 
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: 'rgba(255,255,255,0.05)'
                  }}>
                    <Image 
                      source={{ uri: getHeroImageUrl(player.hero_id) }} 
                      style={{ width: 36, height: 24, borderRadius: 4, marginRight: 8, backgroundColor: '#111' }}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }} numberOfLines={1}>{player.name || 'Anonymous'}</Text>
                      <Text style={{ color: '#6b7280', fontSize: 8, fontWeight: '700', textTransform: 'uppercase' }}>{getHeroName(player.hero_id)}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* Privacy Disclaimer */}
            <View style={{ margin: 20, padding: 16, backgroundColor: 'rgba(245, 158, 11, 0.05)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(245, 158, 11, 0.1)', flexDirection: 'row', gap: 12 }}>
              <Ionicons name="shield-checkmark" size={18} color="#f59e0b" style={{ marginTop: 2 }} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#f59e0b', fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 }}>Privacy Notice</Text>
                <Text style={{ color: '#9ca3af', fontSize: 11, fontWeight: '600', lineHeight: 16, marginTop: 4 }}>
                  Some players have protected profiles. Their names and individual statistics may not be fully available in real-time.
                </Text>
              </View>
            </View>

            <View style={{ paddingHorizontal: 20 }}>
              <Text style={{ color: '#4b5563', fontSize: 10, fontWeight: '700', fontStyle: 'italic', textAlign: 'center' }}>
                Full post-match analysis will be available once the game concludes and is parsed by OpenDota.
              </Text>
            </View>
          </ScrollView>
        )}
      </View>
    </GlassModal>
  );
}
