import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GlobalRecord } from '../services/opendota';

interface Props {
  title: string;
  field: string;
  record: GlobalRecord | null;
  icon: string;
  color: string;
  onPress: (matchId: number) => void;
}

export default function RecordCard({ title, field, record, icon, color, onPress }: Props) {
  if (!record) return null;

  return (
    <TouchableOpacity 
      activeOpacity={0.8}
      onPress={() => onPress(record.match_id)}
      style={{
        backgroundColor: '#1e1e2e',
        borderRadius: 16,
        padding: 16,
        marginHorizontal: 20,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#2a2a3e',
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <View style={{
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: `${color}15`,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
      }}>
        <Ionicons name={icon as any} size={24} color={color} />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={{ color: '#666', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 }}>
          {title}
        </Text>
        <Text style={{ color: '#fff', fontSize: 24, fontWeight: '900', marginTop: 2 }}>
          {record.score.toLocaleString()}
        </Text>
        <Text style={{ color: '#444', fontSize: 10, marginTop: 4 }}>
          Match ID: {record.match_id} • {new Date(record.start_time * 1000).toLocaleDateString()}
        </Text>
      </View>

      <View style={{ alignItems: 'flex-end' }}>
        <View style={{ 
          backgroundColor: '#0d0d1a', 
          paddingHorizontal: 10, 
          paddingVertical: 4, 
          borderRadius: 8,
          borderWidth: 1,
          borderColor: '#2a2a3e'
        }}>
          <Text style={{ color: color, fontSize: 10, fontWeight: '800' }}>VIEW MATCH</Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color="#333" style={{ marginTop: 8 }} />
      </View>
    </TouchableOpacity>
  );
}
