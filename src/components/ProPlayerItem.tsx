import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProPlayer } from '../services/opendota';

interface Props {
  player: ProPlayer;
  onPress: (id: number) => void;
}

export default function ProPlayerItem({ player, onPress }: Props) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => onPress(player.account_id)}
      style={{
        backgroundColor: '#1E1E2E',
        borderRadius: 14,
        padding: 12,
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#2a2a3e',
        marginHorizontal: 16,
      }}
    >
      <View style={{
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#151525',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#3b82f6',
        overflow: 'hidden'
      }}>
        {player.avatar ? (
          <Image
            source={{ uri: player.avatar }}
            style={{ width: '100%', height: '100%' }}
          />
        ) : (
          <Ionicons name="person" size={24} color="#333" />
        )}
      </View>

      <View style={{ flex: 1, marginLeft: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800' }} numberOfLines={1}>
            {player.personaname}
          </Text>
          {typeof player.country_code === 'string' && player.country_code.length === 2 && (
            <Text style={{ fontSize: 12, marginLeft: 6 }}>
              {player.country_code
                .toUpperCase()
                .split('')
                .map(char => String.fromCodePoint(char.charCodeAt(0) + 127397))
                .join('')}
            </Text>
          )}
        </View>
        <Text style={{ color: '#666', fontSize: 12, marginTop: 2 }} numberOfLines={1}>
          {player.full_name || 'Professional Player'}
        </Text>
      </View>

      <View style={{ alignItems: 'flex-end', marginLeft: 8 }}>
        <View style={{
          backgroundColor: '#3b82f615',
          paddingHorizontal: 8,
          paddingVertical: 2,
          borderRadius: 6,
          borderWidth: 1,
          borderColor: '#3b82f630'
        }}>
          <Text style={{ color: '#3b82f6', fontSize: 10, fontWeight: '800' }}>
            {player.team_tag || 'Free Agent'}
          </Text>
        </View>
        <Text style={{ color: '#444', fontSize: 9, marginTop: 4, fontWeight: '700' }}>
          {player.team_name || 'NO TEAM'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
