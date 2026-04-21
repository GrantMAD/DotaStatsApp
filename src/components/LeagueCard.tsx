import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { League } from '../services/opendota';

interface Props {
  league: League;
  onPress: (id: number) => void;
}

export default function LeagueCard({ league, onPress }: Props) {
  const getTierColor = (tier: string | null) => {
    switch (tier) {
      case 'premium': return '#8b5cf6'; // Purple
      case 'professional': return '#3b82f6'; // Blue
      default: return '#6b7280'; // Gray
    }
  };

  const tierColor = getTierColor(league.tier);

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onPress(league.leagueid)}
      style={{
        backgroundColor: '#1E1E2E',
        borderRadius: 16,
        marginBottom: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#2a2a3e',
      }}
    >
      {league.banner ? (
        <Image 
          source={{ uri: league.banner }} 
          style={{ width: '100%', height: 120 }} 
          resizeMode="cover"
        />
      ) : (
        <View style={{ width: '100%', height: 80, backgroundColor: '#151525', justifyContent: 'center', alignItems: 'center' }}>
          <Ionicons name="trophy-outline" size={32} color="#333" />
        </View>
      )}

      <View style={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ 
            backgroundColor: `${tierColor}15`, 
            paddingHorizontal: 8, 
            paddingVertical: 4, 
            borderRadius: 6,
            borderWidth: 1,
            borderColor: `${tierColor}30`
          }}>
            <Text style={{ color: tierColor, fontSize: 10, fontWeight: '900', textTransform: 'uppercase' }}>
              {league.tier || 'Unknown Tier'}
            </Text>
          </View>
          <Text style={{ color: '#444', fontSize: 10 }}>ID: {league.leagueid}</Text>
        </View>

        <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800', marginTop: 8 }}>
          {league.name}
        </Text>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
          <Text style={{ color: '#8b5cf6', fontSize: 11, fontWeight: '700' }}>VIEW MATCHES</Text>
          <Ionicons name="chevron-forward" size={14} color="#8b5cf6" style={{ marginLeft: 4 }} />
        </View>
      </View>
    </TouchableOpacity>
  );
}
