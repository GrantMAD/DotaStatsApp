import React from 'react';
import {
  View, Text, Image, Modal, ScrollView, TouchableOpacity, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HeroStats } from '../services/opendota';
import { STEAM_CDN_BASE } from '../services/constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const RANK_LABELS: Record<string, { name: string; color: string }> = {
  '1': { name: 'Herald', color: '#8d8d8d' },
  '2': { name: 'Guardian', color: '#b4c7dc' },
  '3': { name: 'Crusader', color: '#daa520' },
  '4': { name: 'Archon', color: '#3cb371' },
  '5': { name: 'Legend', color: '#4682b4' },
  '6': { name: 'Ancient', color: '#9370db' },
  '7': { name: 'Divine', color: '#cd5c5c' },
  '8': { name: 'Immortal', color: '#ffd700' },
};

export interface PlayerHeroStats {
  hero_id: string;
  last_played: number;
  games: number;
  win: number;
  avg_kills: number;
  avg_deaths: number;
  avg_assists: number;
  kda: number;
}

interface Props {
  hero: HeroStats | null;
  visible: boolean;
  onClose: () => void;
  playerStats?: PlayerHeroStats | null;
}

function StatRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#1a1a2e' }}>
      <Text style={{ color: '#999', fontSize: 13 }}>{label}</Text>
      <Text style={{ color: color || '#fff', fontSize: 13, fontWeight: '700' }}>{value}</Text>
    </View>
  );
}

function WinRateBar({ picks, wins, label, color }: { picks: number; wins: number; label: string; color: string }) {
  const wr = picks > 0 ? (wins / picks) * 100 : 0;
  const barWidth = Math.max(wr, 2);

  return (
    <View style={{ marginBottom: 10 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
        <Text style={{ color: color, fontSize: 12, fontWeight: '600' }}>{label}</Text>
        <Text style={{ color: '#999', fontSize: 11 }}>
          {wr.toFixed(1)}% · {(picks / 1000).toFixed(1)}k games
        </Text>
      </View>
      <View style={{ height: 6, backgroundColor: '#1a1a2e', borderRadius: 3, overflow: 'hidden' }}>
        <View style={{
          height: '100%',
          width: `${barWidth}%`,
          backgroundColor: wr >= 52 ? '#22c55e' : wr >= 48 ? '#eab308' : '#ef4444',
          borderRadius: 3,
        }} />
      </View>
    </View>
  );
}

export default function HeroDetailModal({ hero, visible, onClose, playerStats }: Props) {
  if (!hero) return null;

  const imgUrl = `${STEAM_CDN_BASE}${hero.img}`;
  const pubWinRate = hero.pub_pick > 0 ? (hero.pub_win / hero.pub_pick) * 100 : 0;
  const proWinRate = hero.pro_pick > 0 ? (hero.pro_win / hero.pro_pick) * 100 : 0;
  const turboWinRate = hero.turbo_picks > 0 ? (hero.turbo_wins / hero.turbo_picks) * 100 : 0;

  // Personal Stats
  const personalWinRate = playerStats && playerStats.games > 0 ? (playerStats.win / playerStats.games) * 100 : 0;
  const lastPlayedDate = playerStats ? new Date(playerStats.last_played * 1000).toLocaleDateString() : '';

  // Build bracket data
  const brackets = ['1', '2', '3', '4', '5', '6', '7', '8'].map(b => {
    const picks = (hero as any)[`${b}_pick`] as number;
    const wins = (hero as any)[`${b}_win`] as number;
    return { bracket: b, picks, wins, ...RANK_LABELS[b] };
  }).filter(b => b.picks > 0);

  const attrColors: Record<string, string> = {
    str: '#ef4444',
    agi: '#22c55e',
    int: '#3b82f6',
    all: '#d4d4d4',
  };

  const attrNames: Record<string, string> = {
    str: 'Strength',
    agi: 'Agility',
    int: 'Intelligence',
    all: 'Universal',
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={{ flex: 1, backgroundColor: '#0d0d1a' }}>
        {/* Hero Banner */}
        <View style={{ position: 'relative' }}>
          <Image
            source={{ uri: imgUrl }}
            style={{ width: SCREEN_WIDTH, height: 200, backgroundColor: '#1a1a2e' }}
            resizeMode="cover"
          />
          <View style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(13,13,26,0.5)',
          }} />

          {/* Close Button */}
          <TouchableOpacity
            onPress={onClose}
            style={{
              position: 'absolute', top: 50, right: 16,
              backgroundColor: 'rgba(0,0,0,0.6)',
              borderRadius: 20, width: 36, height: 36,
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Ionicons name="close" size={22} color="#fff" />
          </TouchableOpacity>

          {/* Hero Name Overlay */}
          <View style={{ position: 'absolute', bottom: 16, left: 16 }}>
            <Text style={{ color: '#fff', fontSize: 28, fontWeight: '900' }}>{hero.localized_name}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
              <View style={{
                backgroundColor: attrColors[hero.primary_attr] || '#666',
                paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginRight: 8,
              }}>
                <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>
                  {attrNames[hero.primary_attr] || hero.primary_attr}
                </Text>
              </View>
              <Text style={{ color: '#aaa', fontSize: 12 }}>{hero.attack_type}</Text>
            </View>
          </View>
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
          {/* Roles */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 }}>
            {hero.roles.map(role => (
              <View key={role} style={{
                backgroundColor: '#1e1e2e', borderRadius: 8,
                paddingHorizontal: 10, paddingVertical: 5,
                marginRight: 6, marginBottom: 6,
                borderWidth: 1, borderColor: '#2a2a3e',
              }}>
                <Text style={{ color: '#ccc', fontSize: 11, fontWeight: '600' }}>{role}</Text>
              </View>
            ))}
          </View>

          {/* Overall Win Rate - Big Display */}
          <View style={{
            backgroundColor: '#1e1e2e', borderRadius: 14, padding: 16, marginBottom: 20,
            borderWidth: 1, borderColor: '#2a2a3e',
          }}>
            <Text style={{ color: '#888', fontSize: 12, fontWeight: '600', marginBottom: 8 }}>
              OVERALL PUBLIC WIN RATE
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
              <Text style={{
                color: pubWinRate >= 52 ? '#22c55e' : pubWinRate >= 48 ? '#eab308' : '#ef4444',
                fontSize: 42, fontWeight: '900',
              }}>
                {pubWinRate.toFixed(1)}
              </Text>
              <Text style={{ color: '#666', fontSize: 20, fontWeight: '600', marginLeft: 2 }}>%</Text>
            </View>
            <Text style={{ color: '#666', fontSize: 12, marginTop: 4 }}>
              {(hero.pub_pick / 1000).toFixed(0)}k matches played
            </Text>
          </View>

          {/* Your Stats (Optional) */}
          {playerStats && (
            <View style={{
              backgroundColor: 'rgba(139, 92, 246, 0.1)', borderRadius: 14, padding: 16, marginBottom: 20,
              borderWidth: 1, borderColor: 'rgba(139, 92, 246, 0.3)',
            }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Text style={{ color: '#8b5cf6', fontSize: 12, fontWeight: '800' }}>
                  YOUR STATS
                </Text>
                <Text style={{ color: '#666', fontSize: 10, fontWeight: '600' }}>
                  LAST PLAYED: {lastPlayedDate}
                </Text>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
                <View>
                  <Text style={{ color: '#fff', fontSize: 24, fontWeight: '900' }}>
                    {personalWinRate.toFixed(1)}%
                  </Text>
                  <Text style={{ color: '#999', fontSize: 10, fontWeight: '600' }}>WIN RATE</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ color: '#fff', fontSize: 24, fontWeight: '900' }}>
                    {playerStats.games}
                  </Text>
                  <Text style={{ color: '#999', fontSize: 10, fontWeight: '600' }}>GAMES</Text>
                </View>
              </View>

              <StatRow label="Average KDA" value={playerStats.kda.toFixed(2)} color="#8b5cf6" />
              <StatRow label="Average Kills" value={playerStats.avg_kills.toFixed(1)} />
              <StatRow label="Average Deaths" value={playerStats.avg_deaths.toFixed(1)} />
              <StatRow label="Average Assists" value={playerStats.avg_assists.toFixed(1)} />
            </View>
          )}

          {/* Key Stats */}
          <View style={{
            backgroundColor: '#1e1e2e', borderRadius: 14, padding: 16, marginBottom: 20,
            borderWidth: 1, borderColor: '#2a2a3e',
          }}>
            <Text style={{ color: '#888', fontSize: 12, fontWeight: '600', marginBottom: 8 }}>
              KEY STATS
            </Text>
            <StatRow label="Public Picks" value={hero.pub_pick.toLocaleString()} />
            <StatRow label="Public Wins" value={hero.pub_win.toLocaleString()} />
            <StatRow label="Public Win Rate" value={`${pubWinRate.toFixed(2)}%`} color={pubWinRate >= 50 ? '#22c55e' : '#ef4444'} />
            <StatRow label="Pro Picks" value={hero.pro_pick.toString()} />
            <StatRow label="Pro Wins" value={hero.pro_win.toString()} />
            <StatRow label="Pro Win Rate" value={hero.pro_pick > 0 ? `${proWinRate.toFixed(1)}%` : 'N/A'} color={proWinRate >= 50 ? '#22c55e' : '#ef4444'} />
            <StatRow label="Pro Bans" value={hero.pro_ban.toString()} color="#ef4444" />
            <StatRow label="Turbo Picks" value={hero.turbo_picks.toLocaleString()} />
            <StatRow label="Turbo Win Rate" value={`${turboWinRate.toFixed(1)}%`} color={turboWinRate >= 50 ? '#22c55e' : '#ef4444'} />
          </View>

          {/* Win Rate by Rank */}
          <View style={{
            backgroundColor: '#1e1e2e', borderRadius: 14, padding: 16, marginBottom: 20,
            borderWidth: 1, borderColor: '#2a2a3e',
          }}>
            <Text style={{ color: '#888', fontSize: 12, fontWeight: '600', marginBottom: 14 }}>
              WIN RATE BY RANK
            </Text>
            {brackets.map(b => (
              <WinRateBar
                key={b.bracket}
                picks={b.picks}
                wins={b.wins}
                label={b.name}
                color={b.color}
              />
            ))}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}
