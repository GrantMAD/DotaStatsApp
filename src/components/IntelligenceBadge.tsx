import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type BadgeType = 'hero' | 'match' | 'player' | 'event';

interface IntelligenceBadgeProps {
  type: BadgeType;
  label?: string;
  className?: string; // Keep as string for nativewind compatibility, if it works without cn
  showIcon?: boolean;
  iconName?: keyof typeof Ionicons.glyphMap;
  customColors?: {
    color: string;
    bg: string;
    border: string;
  };
}

const CONFIG: Record<Exclude<BadgeType, 'event'>, { 
  icon: keyof typeof Ionicons.glyphMap; 
  label: string; 
  color: string; 
  bg: string; 
  border: string;
}> = {
  hero: {
    icon: 'flash',
    label: 'Hero',
    color: '#f59e0b', // amber-500
    bg: 'rgba(245, 158, 11, 0.1)',
    border: 'rgba(245, 158, 11, 0.2)',
  },
  match: {
    icon: 'game-controller',
    label: 'Match',
    color: '#a855f7', // purple-500
    bg: 'rgba(168, 85, 247, 0.1)',
    border: 'rgba(168, 85, 247, 0.2)',
  },
  player: {
    icon: 'person',
    label: 'Player',
    color: '#10b981', // emerald-500
    bg: 'rgba(16, 185, 129, 0.1)',
    border: 'rgba(16, 185, 129, 0.2)',
  }
};

export function IntelligenceBadge({ 
  type, 
  label, 
  className, 
  showIcon = true,
  iconName,
  customColors
}: IntelligenceBadgeProps) {
  const isEvent = type === 'event';
  const config = isEvent ? null : CONFIG[type as Exclude<BadgeType, 'event'>];
  
  const icon = iconName || config?.icon;

  return (
    <View className={className}
    style={{
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 6,
      borderWidth: 1,
      backgroundColor: isEvent ? customColors?.bg : config?.bg,
      borderColor: isEvent ? customColors?.border : config?.border,
    }}
    >
      {showIcon && icon && (
        <Ionicons name={icon} size={10} color={isEvent ? customColors?.color : config?.color} style={{ marginRight: 6 }} />
      )}
      <Text style={{ 
        color: isEvent ? customColors?.color : config?.color,
        fontSize: 10,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 0.5
      }}>
        {label || config?.label}
      </Text>
    </View>
  );
}
