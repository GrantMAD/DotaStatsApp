import React, { useMemo } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { useHeroMatchups } from '../hooks/useOpenDota';
import { getHeroImageUrl, HEROES } from '../services/constants';
import { Ionicons } from '@expo/vector-icons';

interface MatchupItemProps {
  heroId: number;
  winRate: number;
  isStrong: boolean;
}

function MatchupItem({ heroId, winRate, isStrong }: MatchupItemProps) {
  const hero = HEROES[heroId];
  if (!hero) return null;

  return (
    <View style={styles.matchupItem}>
      <View style={styles.heroInfo}>
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: getHeroImageUrl(heroId) }} 
            style={styles.heroImage}
          />
          <View style={[
            styles.indicator,
            { backgroundColor: isStrong ? '#22c55e' : '#ef4444' }
          ]} />
        </View>
        <View style={styles.nameContainer}>
          <Text style={styles.heroName}>{hero.localized_name}</Text>
          <Text style={styles.heroRoles}>{hero.roles.slice(0, 2).join(' · ')}</Text>
        </View>
      </View>
      <View style={styles.statContainer}>
        <Text style={[styles.winRate, { color: isStrong ? '#22c55e' : '#ef4444' }]}>
          {winRate.toFixed(1)}%
        </Text>
        <Text style={styles.statLabel}>WIN RATE</Text>
      </View>
    </View>
  );
}

export default function HeroMatchups({ heroId }: { heroId: number }) {
  const { data: matchups = [], isLoading } = useHeroMatchups(heroId);

  const { strongAgainst, weakAgainst } = useMemo(() => {
    const sorted = [...matchups].sort((a, b) => (b.wins / b.games_played) - (a.wins / a.games_played));
    return {
      strongAgainst: sorted.slice(0, 5).map(m => ({ id: m.hero_id, wr: (m.wins / m.games_played) * 100 })),
      weakAgainst: sorted.slice(-5).reverse().map(m => ({ id: m.hero_id, wr: (m.wins / m.games_played) * 100 })),
    };
  }, [matchups]);

  if (isLoading) {
    return <ActivityIndicator size="small" color="#8b5cf6" style={{ marginVertical: 20 }} />;
  }

  return (
    <View style={styles.container}>
      {/* Strong Against */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="flash" size={16} color="#22c55e" />
          <Text style={[styles.sectionTitle, { color: '#22c55e' }]}>STRONG AGAINST</Text>
        </View>
        <View style={styles.list}>
          {strongAgainst.map(item => (
            <MatchupItem key={item.id} heroId={item.id} winRate={item.wr} isStrong={true} />
          ))}
        </View>
      </View>

      {/* Weak Against */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="warning" size={16} color="#ef4444" />
          <Text style={[styles.sectionTitle, { color: '#ef4444' }]}>WEAK AGAINST</Text>
        </View>
        <View style={styles.list}>
          {weakAgainst.map(item => (
            <MatchupItem key={item.id} heroId={item.id} winRate={item.wr} isStrong={false} />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 24,
  },
  section: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '900',
    fontStyle: 'italic',
  },
  list: {
    gap: 8,
  },
  matchupItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1e1e2e',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#2a2a3e',
  },
  heroInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  imageContainer: {
    position: 'relative',
  },
  heroImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#0d0d1a',
  },
  indicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#1e1e2e',
  },
  nameContainer: {
    justifyContent: 'center',
  },
  heroName: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },
  heroRoles: {
    color: '#666',
    fontSize: 10,
    fontWeight: '600',
  },
  statContainer: {
    alignItems: 'flex-end',
  },
  winRate: {
    fontSize: 14,
    fontWeight: '900',
    fontStyle: 'italic',
  },
  statLabel: {
    color: '#666',
    fontSize: 8,
    fontWeight: '700',
  },
});
