import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProTeam } from '../services/opendota';

interface Props {
  team: ProTeam;
  rank: number;
  onPress: (id: number) => void;
}

export default function TeamListItem({ team, rank, onPress }: Props) {
  const winRate = team.wins + team.losses > 0
    ? (team.wins / (team.wins + team.losses) * 100).toFixed(1)
    : '0.0';

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => onPress(team.team_id)}
      style={{
        backgroundColor: '#1E1E2E',
        borderRadius: 14,
        padding: 12,
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#2a2a3e',
      }}
    >
      <View style={{ width: 30, alignItems: 'center' }}>
        <Text style={{
          color: rank <= 3 ? '#8b5cf6' : '#444',
          fontWeight: '900',
          fontSize: 16
        }}>
          {rank}
        </Text>
      </View>

      <View style={{
        width: 44,
        height: 44,
        borderRadius: 10,
        backgroundColor: '#151525',
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 12,
        borderWidth: 1,
        borderColor: '#2a2a3e',
        overflow: 'hidden'
      }}>
        {team.logo_url ? (
          <Image
            source={{ uri: team.logo_url }}
            style={{ width: 32, height: 32 }}
            resizeMode="contain"
          />
        ) : (
          <Ionicons name="shield-outline" size={24} color="#333" />
        )}
      </View>

      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ color: '#fff', fontSize: 15, fontWeight: '800' }} numberOfLines={1}>
            {team.name}
          </Text>
          {typeof team.tag === 'string' && team.tag.length > 0 && (
            <Text style={{ color: '#666', fontSize: 11, marginLeft: 6 }}>
              [{team.tag}]
            </Text>
          )}
        </View>
        <Text style={{ color: '#444', fontSize: 11, marginTop: 2 }}>
          {`${winRate}% Win Rate • ${(team.wins + team.losses) || 0} Games`}
        </Text>
      </View>

      <View style={{ alignItems: 'flex-end', marginLeft: 8 }}>
        <Text style={{ color: '#8b5cf6', fontSize: 16, fontWeight: '900' }}>
          {Math.round(team.rating || 0)}
        </Text>
        <Text style={{ color: '#444', fontSize: 9, fontWeight: '700', textTransform: 'uppercase' }}>
          Rating
        </Text>
      </View>
    </TouchableOpacity>
  );
}
