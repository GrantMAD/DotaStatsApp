import React, { useMemo } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { useHeroItemPopularity } from '../hooks/useOpenDota';
import { getItemImageUrl, ITEM_IDS } from '../services/constants';
import { Ionicons } from '@expo/vector-icons';

interface ItemIconProps {
  itemId: number;
  count: number;
  total: number;
}

function ItemIcon({ itemId, count, total }: ItemIconProps) {
  const percentage = (count / total) * 100;
  
  return (
    <View style={styles.itemIconContainer}>
      <View style={styles.itemImageWrapper}>
        <Image 
          source={{ uri: getItemImageUrl(itemId) }} 
          style={styles.itemImage}
        />
        <View style={styles.percentageBadge}>
          <Text style={styles.percentageText}>{percentage.toFixed(0)}%</Text>
        </View>
      </View>
    </View>
  );
}

interface ItemSectionProps {
  title: string;
  items: [string, number][];
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

function ItemSection({ title, items, icon, color }: ItemSectionProps) {
  const total = useMemo(() => items.reduce((sum, [_, count]) => sum + count, 0), [items]);
  
  return (
    <View style={styles.itemSection}>
      <View style={styles.sectionHeader}>
        <Ionicons name={icon} size={14} color={color} />
        <Text style={[styles.sectionTitle, { color: '#888' }]}>{title}</Text>
      </View>
      <View style={styles.itemsGrid}>
        {items.slice(0, 4).map(([id, count]) => (
          <ItemIcon key={id} itemId={Number(id)} count={count} total={total} />
        ))}
      </View>
    </View>
  );
}

export default function HeroItemBuilds({ heroId }: { heroId: number }) {
  const { data: popularity, isLoading } = useHeroItemPopularity(heroId);

  const sections = useMemo(() => {
    if (!popularity) return [];
    
    return [
      { 
        title: 'STARTING', 
        items: Object.entries(popularity.start_game_items).sort((a, b) => b[1] - a[1]),
        icon: 'cart' as const,
        color: '#eab308'
      },
      { 
        title: 'EARLY', 
        items: Object.entries(popularity.early_game_items).sort((a, b) => b[1] - a[1]),
        icon: 'flash' as const,
        color: '#22c55e'
      },
      { 
        title: 'MID GAME', 
        items: Object.entries(popularity.mid_game_items).sort((a, b) => b[1] - a[1]),
        icon: 'shield' as const,
        color: '#8b5cf6'
      },
      { 
        title: 'LATE GAME', 
        items: Object.entries(popularity.late_game_items).sort((a, b) => b[1] - a[1]),
        icon: 'trophy' as const,
        color: '#a855f7'
      },
    ];
  }, [popularity]);

  if (isLoading) {
    return <ActivityIndicator size="small" color="#8b5cf6" style={{ marginVertical: 20 }} />;
  }

  if (!popularity) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="briefcase" size={16} color="#8b5cf6" />
        <Text style={styles.headerTitle}>OPTIMAL ITEM BUILDS</Text>
      </View>
      
      <View style={styles.grid}>
        {sections.map((section) => (
          <ItemSection key={section.title} {...section} />
        ))}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Based on high-skill pub matches from the current patch.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1e1e2e',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2a2a3e',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  headerTitle: {
    color: '#8b5cf6',
    fontSize: 12,
    fontWeight: '900',
    fontStyle: 'italic',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 20,
  },
  itemSection: {
    width: '45%',
    gap: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  itemIconContainer: {
    // Keep icons small for mobile grid
  },
  itemImageWrapper: {
    position: 'relative',
    width: 36,
    height: 27,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: '#0d0d1a',
    borderWidth: 1,
    borderColor: '#2a2a3e',
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  percentageBadge: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 2,
    borderRadius: 2,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  percentageText: {
    color: '#fff',
    fontSize: 6,
    fontWeight: '900',
    fontStyle: 'italic',
  },
  footer: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#2a2a3e',
  },
  footerText: {
    color: '#666',
    fontSize: 8,
    fontWeight: '600',
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
