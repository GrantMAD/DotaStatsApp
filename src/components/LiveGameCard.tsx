import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LiveGame } from '../services/opendota';
import { getHeroImageUrl } from '../services/constants';

interface Props {
  game: LiveGame;
  onPress: (matchId: number) => void;
}

export default function LiveGameCard({ game, onPress }: Props) {
  // Format game time (seconds to MM:SS)
  const minutes = Math.floor(game.game_time / 60);
  const seconds = game.game_time % 60;
  const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  // Get unique heroes from players (up to 5 for preview)
  const heroIds = game.players.map(p => p.hero_id).filter(id => id > 0).slice(0, 5);

  return (
    <TouchableOpacity 
      activeOpacity={0.8}
      onPress={() => onPress(game.match_id)}
      style={{
        width: 180,
        backgroundColor: '#1E1E2E',
        borderRadius: 14,
        marginRight: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: '#2a2a3e',
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ 
          backgroundColor: '#ef4444', 
          paddingHorizontal: 6, 
          paddingVertical: 2, 
          borderRadius: 4,
          flexDirection: 'row',
          alignItems: 'center'
        }}>
          <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: '#fff', marginRight: 4 }} />
          <Text style={{ color: '#fff', fontSize: 9, fontWeight: '900' }}>LIVE</Text>
        </View>
        <Text style={{ color: '#666', fontSize: 10, fontWeight: '700' }}>{timeStr}</Text>
      </View>

      <View style={{ marginVertical: 12 }}>
        <Text style={{ color: '#8b5cf6', fontSize: 18, fontWeight: '900' }}>
          {Math.round(game.average_mmr).toLocaleString()}
        </Text>
        <Text style={{ color: '#555', fontSize: 10, fontWeight: '700', textTransform: 'uppercase' }}>
          Average MMR
        </Text>
      </View>

      <View style={{ flexDirection: 'row', marginBottom: 12 }}>
        {heroIds.map((id, idx) => (
          <Image 
            key={`${game.match_id}-h-${idx}`}
            source={{ uri: getHeroImageUrl(id) }}
            style={{ 
              width: 24, 
              height: 16, 
              borderRadius: 2, 
              marginRight: -4, 
              borderWidth: 1, 
              borderColor: '#1e1e2e' 
            }}
          />
        ))}
        {game.players.length > 5 && (
          <View style={{ 
            width: 24, height: 16, borderRadius: 2, backgroundColor: '#151525', 
            justifyContent: 'center', alignItems: 'center', marginLeft: 4 
          }}>
            <Text style={{ color: '#444', fontSize: 8 }}>+{game.players.length - 5}</Text>
          </View>
        )}
      </View>

      <View style={{ 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#2a2a3e'
      }}>
        <Text style={{ color: '#999', fontSize: 9 }}>ID: {game.match_id}</Text>
        <Ionicons name="eye" size={12} color="#444" />
      </View>
    </TouchableOpacity>
  );
}
