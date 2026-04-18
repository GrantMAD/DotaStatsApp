import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { getRankBadgeUrl, getRankStarsUrl, RANK_NAMES } from '../services/constants';

interface RankBadgeProps {
  rankTier: number | null;
  leaderboardRank?: number | null;
  size?: number;
  showText?: boolean;
}

export const RankBadge: React.FC<RankBadgeProps> = ({ 
  rankTier, 
  leaderboardRank, 
  size = 40,
  showText = true 
}) => {
  if (!rankTier && !leaderboardRank) return null;

  const badgeUrl = getRankBadgeUrl(rankTier);
  const starsUrl = getRankStarsUrl(rankTier);
  const rankDigit = rankTier ? Math.floor(rankTier / 10) : 0;
  const starsDigit = rankTier ? rankTier % 10 : 0;
  const rankName = RANK_NAMES[rankDigit] || "Unranked";

  return (
    <View className="items-center">
      <View style={{ width: size, height: size }} className="justify-center items-center">
        {/* Base Badge */}
        <Image 
          source={{ uri: badgeUrl }} 
          style={{ width: size, height: size, position: 'absolute' }}
          resizeMode="contain"
        />
        
        {/* Stars Overlay (Not for Immortal/Unranked) */}
        {starsUrl && rankDigit < 8 && (
          <Image 
            source={{ uri: starsUrl }} 
            style={{ width: size, height: size, position: 'absolute' }}
            resizeMode="contain"
          />
        )}

        {/* Leaderboard Rank for Immortal */}
        {rankDigit === 8 && leaderboardRank && (
          <View style={styles.leaderboardContainer}>
            <Text style={styles.leaderboardText}>{leaderboardRank}</Text>
          </View>
        )}
      </View>
      
      {showText && (
        <Text className="text-gamingAccent text-[10px] font-bold mt-1 uppercase">
          {rankName} {rankDigit < 8 && starsDigit > 0 ? starsDigit : ''}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  leaderboardContainer: {
    position: 'absolute',
    bottom: -2,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#d4af37',
  },
  leaderboardText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: 'bold',
  }
});
