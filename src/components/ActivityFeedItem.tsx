import React from 'react';
import { View, Text, Image } from 'react-native';
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
      case 'rampage': return {
        color: "#ef4444",
        bg: "rgba(239, 68, 68, 0.1)",
        icon: <MaterialCommunityIcons name="skull" size={12} color="#ef4444" />,
        label: "Rampage!"
      };
      case 'ultra_kill': return {
        color: "#f97316",
        bg: "rgba(249, 115, 22, 0.1)",
        icon: <MaterialCommunityIcons name="sword-cross" size={12} color="#f97316" />,
        label: "Ultra Kill"
      };
      case 'triple_kill': return {
        color: "#f59e0b",
        bg: "rgba(245, 158, 11, 0.1)",
        icon: <MaterialCommunityIcons name="target" size={12} color="#f59e0b" />,
        label: "Triple Kill"
      };
      case 'aegis_snatch': return {
        color: "#22d3ee",
        bg: "rgba(34, 211, 238, 0.1)",
        icon: <MaterialCommunityIcons name="shield-alert" size={12} color="#22d3ee" />,
        label: "Aegis Snatched"
      };
      case 'rapier': return {
        color: "#fbbf24",
        bg: "rgba(251, 191, 36, 0.1)",
        icon: <MaterialCommunityIcons name="sword" size={12} color="#fbbf24" />,
        label: "Divine Rapier"
      };
      case 'godlike': return {
        color: "#a855f7",
        bg: "rgba(168, 85, 247, 0.1)",
        icon: <MaterialCommunityIcons name="crown" size={12} color="#a855f7" />,
        label: "Godlike Streak"
      };
      case 'benchmark': return {
        color: "#60a5fa",
        bg: "rgba(96, 165, 250, 0.1)",
        icon: <FontAwesome5 name="award" size={10} color="#60a5fa" />,
        label: "Elite Performance"
      };
      case 'win_streak': return {
        color: "#f59e0b",
        bg: "rgba(245, 158, 11, 0.1)",
        icon: <Ionicons name="flame" size={12} color="#f59e0b" />,
        label: "Win Streak"
      };
      case 'mvp': return {
        color: "#8b5cf6",
        bg: "rgba(139, 92, 246, 0.1)",
        icon: <FontAwesome5 name="medal" size={10} color="#8b5cf6" />,
        label: "MVP Performance"
      };
      case 'rank_up': return {
        color: "#22c55e",
        bg: "rgba(34, 197, 94, 0.1)",
        icon: <Ionicons name="trending-up" size={12} color="#22c55e" />,
        label: "Rank Milestone"
      };
      default: return {
        color: "#9ca3af",
        bg: "rgba(156, 163, 175, 0.1)",
        icon: <Ionicons name={item.details.win ? "checkmark-circle" : "close-circle"} size={12} color={item.details.win ? "#22c55e" : "#ef4444"} />,
        label: "Recent Match"
      };
    }
  };

  const theme = getTheme();

  const getMessage = () => {
    const isTurbo = item.details.gameMode === 23;
    const suffix = isTurbo ? ' (Turbo)' : '';

    switch (item.type) {
      case 'rampage': return `secured a RAMPAGE!${suffix}`;
      case 'ultra_kill': return `got an Ultra Kill!${suffix}`;
      case 'triple_kill': return `got a Triple Kill!${suffix}`;
      case 'aegis_snatch': return `SNATCHED the Aegis!${suffix}`;
      case 'rapier': return `purchased a Divine Rapier!${suffix}`;
      case 'godlike': return `is on a GODLIKE streak!${suffix}`;
      case 'benchmark': return `was in the Top 1% for ${item.details.benchmarkType}!${suffix}`;
      case 'win_streak': return `reached a ${item.details.streakCount}-win streak!${suffix}`;
      case 'mvp': return `had an MVP performance!${suffix}`;
      case 'rank_up': return `is ranked at ${getRankName(item.details.newRank || 0)}`;
      case 'recent_match': return `${item.details.win ? 'Won' : 'Played'} a match as ${hero?.localized_name || 'a hero'}${suffix}`;
      default: return '';
    }
  };

  const getRankName = (tier: number) => {
    const brackets = ["Herald", "Guardian", "Crusader", "Archon", "Legend", "Ancient", "Divine", "Immortal"];
    const bracketIndex = Math.floor(Math.max(10, Math.min(80, tier)) / 10) - 1;
    const stars = tier % 10;
    return `${brackets[bracketIndex]} ${stars > 0 ? stars : ''}`;
  };

  const getTimeAgo = () => {
    try {
      return formatDistanceToNow(new Date(item.timestamp * 1000), { addSuffix: true });
    } catch (e) {
      return 'recently';
    }
  };

  return (
    <PressableScale 
      onPress={() => item.details.matchId ? onPressMatch(item.details.matchId) : onPressPlayer(item.player.account_id)}
    >
      <View style={{
        width: 260,
        height: 120,
        backgroundColor: '#1e1e2e',
        borderRadius: 16,
        padding: 12,
        marginRight: 12,
        borderWidth: 1,
        borderColor: '#2a2a3e',
        flexDirection: 'row',
        alignItems: 'center'
      }}>
        {/* Hero or Icon */}
        <View style={{ position: 'relative', marginRight: 12 }}>
          {heroImg ? (
            <Image 
              source={{ uri: heroImg }} 
              style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: '#252538' }}
              resizeMode="cover"
            />
          ) : (
            <View style={{ 
              width: 48, 
              height: 48, 
              borderRadius: 24, 
              backgroundColor: '#252538', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <Image 
                source={{ uri: item.player.avatar }} 
                style={{ width: 48, height: 48, borderRadius: 24 }}
              />
            </View>
          )}
        </View>

        {/* Content */}
        <View style={{ flex: 1, height: '100%', paddingVertical: 2 }}>
          {/* Top Area: Label and Badge */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <View style={{ 
              flexDirection: 'row', 
              alignItems: 'center', 
              backgroundColor: theme.bg, 
              paddingHorizontal: 6, 
              paddingVertical: 2, 
              borderRadius: 4,
              gap: 4
            }}>
              {theme.icon}
              <Text style={{ color: theme.color, fontSize: 9, fontWeight: '800', textTransform: 'uppercase' }}>
                {theme.label}
              </Text>
            </View>
            
            {item.type === 'mvp' && (
              <Text style={{ color: '#6b7280', fontSize: 9, fontWeight: '800' }}>{item.details.kda} KDA</Text>
            )}
            {item.type === 'win_streak' && (
              <Text style={{ color: '#6b7280', fontSize: 9, fontWeight: '800' }}>{item.details.streakCount} WINS</Text>
            )}
            {item.type === 'benchmark' && (
              <Text style={{ color: '#6b7280', fontSize: 9, fontWeight: '800' }}>TOP 1%</Text>
            )}
          </View>

          {/* Middle Area: Message */}
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700' }} numberOfLines={1}>
              {item.player.name}
            </Text>
            <Text style={{ color: '#9ca3af', fontSize: 11, marginTop: 1 }} numberOfLines={2}>
              {getMessage()}
            </Text>
          </View>

          {/* Bottom Area: Time */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
            <Ionicons name="time-outline" size={10} color="#6b7280" />
            <Text style={{ color: '#6b7280', fontSize: 10, marginLeft: 4 }}>
              {getTimeAgo()}
            </Text>
          </View>
        </View>
      </View>
    </PressableScale>
  );
};

export default ActivityFeedItem;
