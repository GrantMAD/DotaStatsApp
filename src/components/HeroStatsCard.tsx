import React from 'react';
import { View, Text, Image } from 'react-native';

const STEAM_CDN = 'https://cdn.cloudflare.steamstatic.com';

interface HeroStatsCardProps {
  heroName: string;
  heroImg: string;  // e.g. "/apps/dota2/images/dota_react/heroes/antimage.png?"
  winRate: number;  // 0-100
  pickCount: number;
  rank?: number;    // 1, 2, 3... for medal display
  tier?: 'S' | 'A' | 'B' | 'C' | 'D'; // For meta tier display
  mode?: 'winrate' | 'picks';
}

export default function HeroStatsCard({ heroName, heroImg, winRate, pickCount, rank, tier, mode = 'winrate' }: HeroStatsCardProps) {
  const imgUrl = `${STEAM_CDN}${heroImg}`;
  const winColor = winRate >= 52 ? '#22c55e' : winRate >= 48 ? '#eab308' : '#ef4444';

  const tierColors: Record<string, string> = {
    S: '#f59e0b', // Amber/Gold
    A: '#8b5cf6', // Purple
    B: '#3b82f6', // Blue
    C: '#94a3b8', // Slate
    D: '#475569', // Gray
  };

  const formatPicks = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  return (
    <View style={{
      width: 140,
      backgroundColor: '#1e1e2e',
      borderRadius: 12,
      marginRight: 12,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: '#2a2a3e',
    }}>
      {/* Hero Image */}
      <View style={{ position: 'relative' }}>
        <Image
          source={{ uri: imgUrl }}
          style={{ width: 140, height: 79, backgroundColor: '#252538' }}
          resizeMode="cover"
        />
        {rank && rank <= 3 && (
          <View style={{
            position: 'absolute',
            top: 6,
            left: 6,
            backgroundColor: rank === 1 ? '#f59e0b' : rank === 2 ? '#94a3b8' : '#cd7f32',
            borderRadius: 10,
            width: 22,
            height: 22,
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1,
          }}>
            <Text style={{ color: '#000', fontSize: 12, fontWeight: '800' }}>
              {rank}
            </Text>
          </View>
        )}
        {tier && (
          <View style={{
            position: 'absolute',
            top: 6,
            right: 6,
            backgroundColor: tierColors[tier] || '#475569',
            borderRadius: 6,
            paddingHorizontal: 6,
            paddingVertical: 2,
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.2)',
          }}>
            <Text style={{ color: '#fff', fontSize: 10, fontWeight: '900' }}>
              {tier}
            </Text>
          </View>
        )}
      </View>

      {/* Info */}
      <View style={{ padding: 10 }}>
        <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700' }} numberOfLines={1}>
          {heroName}
        </Text>

        {mode === 'winrate' ? (
          <>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
              <Text style={{ color: winColor, fontSize: 18, fontWeight: '800' }}>
                {winRate.toFixed(1)}%
              </Text>
            </View>
            <Text style={{ color: '#666', fontSize: 11, marginTop: 2 }}>
              {formatPicks(pickCount)} matches
            </Text>
          </>
        ) : (
          <>
            <Text style={{ color: '#8b5cf6', fontSize: 18, fontWeight: '800', marginTop: 6 }}>
              {formatPicks(pickCount)}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
              <View style={{
                width: 6, height: 6, borderRadius: 3,
                backgroundColor: winColor, marginRight: 4,
              }} />
              <Text style={{ color: '#999', fontSize: 11 }}>
                {winRate.toFixed(1)}% WR
              </Text>
            </View>
          </>
        )}
      </View>
    </View>
  );
}
