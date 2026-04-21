import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ProMatchCardProps {
  radiantName: string | null;
  direName: string | null;
  radiantScore: number;
  direScore: number;
  radiantWin: boolean | null;
  duration: number;
  leagueName: string;
  startTime: number;
  compact?: boolean;
  fullWidth?: boolean;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function timeAgo(unixTimestamp: number): string {
  const now = Math.floor(Date.now() / 1000);
  const diff = now - unixTimestamp;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function ProMatchCard({
  radiantName, direName, radiantScore, direScore,
  radiantWin, duration, leagueName, startTime,
  compact = false, fullWidth = false
}: ProMatchCardProps) {
  return (
    <View style={{
      width: fullWidth ? '100%' : 260,
      backgroundColor: '#1e1e2e',
      borderRadius: 12,
      marginRight: fullWidth ? 0 : 12,
      padding: compact ? 10 : 14,
      borderWidth: 1,
      borderColor: '#2a2a3e',
    }}>
      {/* League & Time */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <Ionicons name="trophy" size={12} color="#f59e0b" style={{ marginRight: 4 }} />
          <Text style={{ color: '#f59e0b', fontSize: 11, fontWeight: '600' }} numberOfLines={1}>
            {leagueName || 'Pro Match'}
          </Text>
        </View>
        <Text style={{ color: '#555', fontSize: 10 }}>{timeAgo(startTime)}</Text>
      </View>

      {/* Teams & Score */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Radiant */}
        <View style={{ flex: 1, alignItems: 'flex-start' }}>
          <Text style={{
            color: radiantWin ? '#22c55e' : '#ccc',
            fontSize: 13,
            fontWeight: '700',
          }} numberOfLines={1}>
            {radiantName || 'Radiant'}
          </Text>
          {radiantWin && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
              <Ionicons name="checkmark-circle" size={10} color="#22c55e" />
              <Text style={{ color: '#22c55e', fontSize: 9, marginLeft: 2, fontWeight: '600' }}>WIN</Text>
            </View>
          )}
        </View>

        {/* Score */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#151525',
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 8,
          marginHorizontal: 8,
        }}>
          <Text style={{
            color: radiantWin ? '#22c55e' : '#ccc',
            fontSize: 18,
            fontWeight: '800',
          }}>
            {radiantScore}
          </Text>
          <Text style={{ color: '#444', fontSize: 14, marginHorizontal: 6 }}>-</Text>
          <Text style={{
            color: radiantWin === false ? '#22c55e' : '#ccc',
            fontSize: 18,
            fontWeight: '800',
          }}>
            {direScore}
          </Text>
        </View>

        {/* Dire */}
        <View style={{ flex: 1, alignItems: 'flex-end' }}>
          <Text style={{
            color: radiantWin === false ? '#22c55e' : '#ccc',
            fontSize: 13,
            fontWeight: '700',
          }} numberOfLines={1}>
            {direName || 'Dire'}
          </Text>
          {radiantWin === false && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
              <Ionicons name="checkmark-circle" size={10} color="#22c55e" />
              <Text style={{ color: '#22c55e', fontSize: 9, marginLeft: 2, fontWeight: '600' }}>WIN</Text>
            </View>
          )}
        </View>
      </View>

      {/* Duration */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 10 }}>
        <Ionicons name="time-outline" size={12} color="#666" style={{ marginRight: 4 }} />
        <Text style={{ color: '#666', fontSize: 11 }}>{formatDuration(duration)}</Text>
      </View>
    </View>
  );
}
