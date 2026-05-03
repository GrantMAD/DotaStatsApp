import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import { ActivityItem } from '../hooks/useActivityFeed';
import { useHeroStats } from '../hooks/useOpenDota';
import PressableScale from './PressableScale';

interface Props {
  item: ActivityItem;
  onPressPlayer: (id: number) => void;
  onPressMatch: (id: number) => void;
}

const ActivityFeedItem: React.FC<Props> = ({ item, onPressPlayer, onPressMatch }) => {
  const { data: heroes = [] } = useHeroStats();
  const hero = heroes.find(h => h.id === item.details.heroId);
  const heroImg = hero ? `https://cdn.cloudflare.steamstatic.com${hero.img}` : null;

  const getIcon = () => {
    switch (item.type) {
      case 'win_streak':
        return <Ionicons name="flame" size={16} color="#ef4444" />;
      case 'mvp':
        return <FontAwesome5 name="medal" size={14} color="#f59e0b" />;
      case 'rank_up':
        return <Ionicons name="trending-up" size={16} color="#22c55e" />;
      case 'recent_match':
        return <Ionicons name={item.details.win ? "checkmark-circle" : "close-circle"} size={16} color={item.details.win ? "#22c55e" : "#ef4444"} />;
      default:
        return null;
    }
  };

  const getMessage = () => {
    switch (item.type) {
      case 'win_streak':
        return `reached a ${item.details.streakCount}-win streak!`;
      case 'mvp':
        return `had an MVP performance!`;
      case 'rank_up':
        return `is ranked at ${getRankName(item.details.newRank || 0)}`;
      case 'recent_match':
        return `${item.details.win ? 'Won' : 'Played'} a match as ${hero?.localized_name || 'a hero'}`;
      default:
        return '';
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
          <View style={{
            position: 'absolute',
            bottom: -2,
            right: -2,
            backgroundColor: '#111',
            borderRadius: 10,
            width: 22,
            height: 22,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: '#2a2a3e'
          }}>
            {getIcon()}
          </View>
        </View>

        {/* Content */}
        <View style={{ flex: 1 }}>
          <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700' }} numberOfLines={1}>
            {item.player.name}
          </Text>
          <Text style={{ color: '#9ca3af', fontSize: 11, marginTop: 2 }} numberOfLines={2}>
            {getMessage()}
          </Text>
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
