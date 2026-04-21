import React from 'react';
import {
  View, Text, Modal, ScrollView, TouchableOpacity, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProMatch } from '../services/opendota';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Props {
  match: ProMatch | null;
  visible: boolean;
  onClose: () => void;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatDate(unixTimestamp: number): string {
  const d = new Date(unixTimestamp * 1000);
  return d.toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
    year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function timeAgo(unixTimestamp: number): string {
  const now = Math.floor(Date.now() / 1000);
  const diff = now - unixTimestamp;
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  return `${Math.floor(diff / 86400)} days ago`;
}

function StatRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#1a1a2e' }}>
      <Text style={{ color: '#999', fontSize: 13 }}>{label}</Text>
      <Text style={{ color: color || '#fff', fontSize: 13, fontWeight: '700' }}>{value}</Text>
    </View>
  );
}

export default function MatchDetailModal({ match, visible, onClose }: Props) {
  if (!match) return null;

  const radiantWon = match.radiant_win === true;
  const direWon = match.radiant_win === false;
  const totalKills = match.radiant_score + match.dire_score;

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={{ flex: 1, backgroundColor: '#0d0d1a' }}>
        {/* Header Bar */}
        <View style={{
          paddingTop: 50, paddingBottom: 16, paddingHorizontal: 16,
          backgroundColor: '#151525',
          borderBottomWidth: 1, borderBottomColor: '#2a2a3e',
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <TouchableOpacity onPress={onClose} style={{ padding: 4 }}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={{ color: '#fff', fontSize: 17, fontWeight: '700' }}>Match Details</Text>
            <View style={{ width: 32 }} />
          </View>
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
          {/* League Banner */}
          <View style={{
            backgroundColor: '#1e1e2e', borderRadius: 14, padding: 16, marginBottom: 20,
            borderWidth: 1, borderColor: '#2a2a3e', alignItems: 'center',
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Ionicons name="trophy" size={16} color="#f59e0b" style={{ marginRight: 6 }} />
              <Text style={{ color: '#f59e0b', fontSize: 15, fontWeight: '700' }}>
                {match.league_name || 'Professional Match'}
              </Text>
            </View>
            <Text style={{ color: '#666', fontSize: 12 }}>{formatDate(match.start_time)}</Text>
            <Text style={{ color: '#555', fontSize: 11, marginTop: 2 }}>{timeAgo(match.start_time)}</Text>
          </View>

          {/* Score Display */}
          <View style={{
            backgroundColor: '#1e1e2e', borderRadius: 14, padding: 20, marginBottom: 20,
            borderWidth: 1, borderColor: '#2a2a3e',
          }}>
            {/* Teams */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              {/* Radiant */}
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={{
                  color: radiantWon ? '#22c55e' : '#999',
                  fontSize: 14, fontWeight: '800', textAlign: 'center',
                }} numberOfLines={2}>
                  {match.radiant_name || 'Radiant'}
                </Text>
                {radiantWon && (
                  <View style={{
                    flexDirection: 'row', alignItems: 'center', marginTop: 4,
                    backgroundColor: '#0a2a0a', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6,
                  }}>
                    <Ionicons name="checkmark-circle" size={12} color="#22c55e" />
                    <Text style={{ color: '#22c55e', fontSize: 10, fontWeight: '700', marginLeft: 3 }}>WINNER</Text>
                  </View>
                )}
              </View>

              {/* Score */}
              <View style={{
                flexDirection: 'row', alignItems: 'center',
                backgroundColor: '#0d0d1a', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12,
                marginHorizontal: 12,
              }}>
                <Text style={{
                  color: radiantWon ? '#22c55e' : '#999',
                  fontSize: 32, fontWeight: '900',
                }}>
                  {match.radiant_score}
                </Text>
                <Text style={{ color: '#333', fontSize: 22, marginHorizontal: 10, fontWeight: '300' }}>—</Text>
                <Text style={{
                  color: direWon ? '#22c55e' : '#999',
                  fontSize: 32, fontWeight: '900',
                }}>
                  {match.dire_score}
                </Text>
              </View>

              {/* Dire */}
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={{
                  color: direWon ? '#22c55e' : '#999',
                  fontSize: 14, fontWeight: '800', textAlign: 'center',
                }} numberOfLines={2}>
                  {match.dire_name || 'Dire'}
                </Text>
                {direWon && (
                  <View style={{
                    flexDirection: 'row', alignItems: 'center', marginTop: 4,
                    backgroundColor: '#0a2a0a', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6,
                  }}>
                    <Ionicons name="checkmark-circle" size={12} color="#22c55e" />
                    <Text style={{ color: '#22c55e', fontSize: 10, fontWeight: '700', marginLeft: 3 }}>WINNER</Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Match Info */}
          <View style={{
            backgroundColor: '#1e1e2e', borderRadius: 14, padding: 16, marginBottom: 20,
            borderWidth: 1, borderColor: '#2a2a3e',
          }}>
            <Text style={{ color: '#888', fontSize: 12, fontWeight: '600', marginBottom: 8 }}>
              MATCH INFORMATION
            </Text>
            <StatRow label="Match ID" value={match.match_id.toString()} color="#8b5cf6" />
            <StatRow label="Duration" value={formatDuration(match.duration)} />
            <StatRow label="Total Kills" value={totalKills.toString()} />
            <StatRow label="Radiant Kills" value={match.radiant_score.toString()} color={radiantWon ? '#22c55e' : '#999'} />
            <StatRow label="Dire Kills" value={match.dire_score.toString()} color={direWon ? '#22c55e' : '#999'} />
            <StatRow label="League" value={match.league_name || 'N/A'} color="#f59e0b" />
            <StatRow
              label="Series Type"
              value={match.series_type === 0 ? 'Best of 1' : match.series_type === 1 ? 'Best of 3' : match.series_type === 2 ? 'Best of 5' : `Type ${match.series_type}`}
            />
            <StatRow label="Winner" value={radiantWon ? (match.radiant_name || 'Radiant') : (match.dire_name || 'Dire')} color="#22c55e" />
          </View>

          {/* Team Details */}
          <View style={{
            backgroundColor: '#1e1e2e', borderRadius: 14, padding: 16, marginBottom: 20,
            borderWidth: 1, borderColor: '#2a2a3e',
          }}>
            <Text style={{ color: '#888', fontSize: 12, fontWeight: '600', marginBottom: 8 }}>
              TEAM DETAILS
            </Text>
            <StatRow label="Radiant Team" value={match.radiant_name || 'Unknown'} />
            <StatRow label="Radiant Team ID" value={match.radiant_team_id?.toString() || 'N/A'} color="#666" />
            <StatRow label="Dire Team" value={match.dire_name || 'Unknown'} />
            <StatRow label="Dire Team ID" value={match.dire_team_id?.toString() || 'N/A'} color="#666" />
            <StatRow label="League ID" value={match.leagueid.toString()} color="#666" />
            <StatRow label="Series ID" value={match.series_id.toString()} color="#666" />
          </View>

          {/* Tip */}
          <View style={{
            backgroundColor: '#151525', borderRadius: 10, padding: 12,
            flexDirection: 'row', alignItems: 'center',
          }}>
            <Ionicons name="information-circle" size={16} color="#8b5cf6" style={{ marginRight: 8 }} />
            <Text style={{ color: '#666', fontSize: 11, flex: 1 }}>
              Search for this match by ID to see full player stats, item builds, and gold/XP graphs.
            </Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}
