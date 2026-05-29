import React from 'react';
import { View, Text } from 'react-native';
import { Svg, Path, Defs, LinearGradient, Stop } from 'react-native-svg';

interface AppLogoProps {
  size?: number;
  showText?: boolean;
}

export default function AppLogo({ size = 40, showText = false }: AppLogoProps) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Defs>
          <LinearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#8b5cf6" />
            <Stop offset="100%" stopColor="#3b82f6" />
          </LinearGradient>
        </Defs>
        <Path
          d="M50 5 L10 25 L10 50 C10 75 50 95 50 95 C50 95 90 75 90 50 L90 25 L50 5 Z"
          fill="url(#shieldGrad)"
        />
        <Path
          d="M35 35 L45 35 C55 35 65 45 65 55 C65 65 55 75 45 75 L35 75 L35 35 Z M45 45 L45 65 C50 65 55 60 55 55 C55 50 50 45 45 45 Z"
          fill="white"
        />
      </Svg>
      {showText && (
        <Text style={{ 
          color: '#fff', 
          fontSize: size * 0.5, 
          fontFamily: 'Outfit_900Black', 
          marginLeft: size * 0.25,
          letterSpacing: -1
        }}>
          DotaApp
        </Text>
      )}
    </View>
  );
}
