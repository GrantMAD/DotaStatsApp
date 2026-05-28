import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import { ActivityItem } from '../hooks/useActivityFeed';
import { useHeroStats } from '../hooks/useOpenDota';
import PressableScale from './PressableScale';
import { STEAM_CDN_BASE } from '../services/constants';

interface Props {
  item: ActivityItem;
  onPressPlayer: (id: number) => void;
  onPressMatch: (id: number) => void;
}

const ActivityFeedItem: React.FC<Props> = ({ item, onPressPlayer, onPressMatch }) => {
  const { data: heroes = [] } = useHeroStats();
  const hero = heroes.find(h => h.id === item.details.heroId);
  const heroImg = hero ? `${STEAM_CDN_BASE}${hero.img}` : null;

  const getTheme = () => {
    switch (item.type) {
      case 'rampage': return { color: "#ef4444", bg: "rgba(239, 68, 68, 0.1)", icon: "skull", label: "Rampage!" };
      case 'ultra_kill': return { color: "#f97316", bg: "rgba(249, 115, 22, 0.1)", icon: "sword-cross", label: "Ultra Kill" };
      case 'triple_kill': return { color: "#f59e0b", bg: "rgba(245, 158, 11, 0.1)", icon: "target", label: "Triple Kill" };
      case 'aegis_snatch': return { color: "#22d3ee", bg: "rgba(34, 211, 238, 0.1)", icon: "shield-alert", label: "Aegis Snatched" };
      case 'rapier': return { color: "#fbbf24", bg: "rgba(251, 191, 36, 0.1)", icon: "sword", label: "Divine Rapier" };
      case 'godlike': return { color: "#a855f7", bg: "rgba(168, 85, 247, 0.1)", icon: "crown", label: "Godlike Streak" };
      case 'benchmark': return { color: "#60a5fa", bg: "rgba(96, 165, 250, 0.1)", icon: "award", label: "Elite Performance" };
      case 'win_streak': return { color: "#f59e0b", bg: "rgba(245, 158, 11, 0.1)", icon: "flame", label: "Win Streak" };
      case 'mvp': return { color: "#8b5cf6", bg: "rgba(139, 92, 246, 0.1)", icon: "medal", label: "MVP" };
      case 'rank_up': return { color: "#22c55e", bg: "rgba(34, 197, 94, 0.1)", icon: "trending-up", label: "Rank Up" };
      default: return { color: "#9ca3af", bg: "rgba(156, 163, 175, 0.1)", icon: item.details.win ? "checkmark-circle" : "close-circle", label: "Recent Match" };
    }
  };

  const theme = getTheme();

  const getMessage = () => {
    switch (item.type) {
      case 'rampage': return "secured a RAMPAGE!";
      case 'ultra_kill': return "got an Ultra Kill!";
      case 'triple_kill': return "got a Triple Kill!";
      case 'aegis_snatch': return "SNATCHED the Aegis!";
      case 'rapier': return "purchased a Divine Rapier!";
      case 'godlike': return "is on a GODLIKE streak!";
      case 'benchmark': return `Top 1% for ${item.details.benchmarkType}!`;
      case 'win_streak': return `${item.details.streakCount}-win streak!`;
      case 'mvp': return "MVP performance!";
      case 'rank_up': return `reached ${getRankName(item.details.newRank || 0)}`;
      case 'recent_match': return `${item.details.win ? 'Won' : 'Played'} as ${hero?.localized_name || 'a hero'}`;
      default: return '';
    }
  };

  const getRankName = (tier: number) => {
    const brackets = ["Herald", "Guardian", "Crusader", "Archon", "Legend", "Ancient", "Divine", "Immortal"];
    const bracketIndex = Math.floor(Math.max(10, Math.min(80, tier)) / 10) - 1;
    return `${brackets[bracketIndex] || 'Unknown'}`;
  };

  return (
    <PressableScale onPress={() => item.details.matchId ? onPressMatch(item.details.matchId) : onPressPlayer(item.player.account_id)}>
      <View style={[styles.card, { borderColor: theme.color + '40' }]}>
        <View style={styles.heroContainer}>
          <Image source={{ uri: heroImg || item.player.avatar }} style={styles.heroImg} />
          <PressableScale onPress={(e) => { e.stopPropagation(); onPressPlayer(item.player.account_id); }} style={styles.avatarOverlay}>
            <Image source={{ uri: item.player.avatar }} style={styles.avatarImg} />
          </PressableScale>
        </View>

        <View style={styles.content}>
          <View style={[styles.badge, { backgroundColor: theme.bg }]}>
            <MaterialCommunityIcons name={theme.icon as any} size={10} color={theme.color} />
            <Text style={[styles.badgeText, { color: theme.color }]}>{theme.label}</Text>
          </View>
          <Text style={styles.message} numberOfLines={2}>
            <Text style={styles.playerName}>{item.player.name}</Text> {getMessage()}
          </Text>
          <Text style={styles.time}>{formatDistanceToNow(new Date(item.timestamp * 1000), { addSuffix: true })}</Text>
        </View>
      </View>
    </PressableScale>
  );
};

const styles = StyleSheet.create({
  card: { width: 300, height: 100, backgroundColor: '#0f172a', borderRadius: 16, padding: 12, marginHorizontal: 8, flexDirection: 'row', alignItems: 'center', borderWidth: 1 },
  heroContainer: { position: 'relative', marginRight: 12 },
  heroImg: { width: 56, height: 56, borderRadius: 28 },
  avatarOverlay: { position: 'absolute', bottom: -4, right: -4, width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#0f172a' },
  avatarImg: { width: 20, height: 20, borderRadius: 10 },
  content: { flex: 1, justifyContent: 'space-between' },
  badge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, gap: 4 },
  badgeText: { fontSize: 9, fontWeight: '800', textTransform: 'uppercase' },
  message: { color: '#e2e8f0', fontSize: 12, marginTop: 4 },
  playerName: { fontWeight: 'bold', color: '#38bdf8' },
  time: { color: '#64748b', fontSize: 10, marginTop: 4 }
});

export default ActivityFeedItem;

