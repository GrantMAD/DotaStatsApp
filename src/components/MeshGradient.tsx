import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface MeshGradientProps extends ViewProps {
  colors?: string[];
  intensity?: 'low' | 'medium' | 'high';
}

export default function MeshGradient({ 
  colors = ['#1a1a2e', '#16213e', '#0f3460'], 
  intensity = 'medium',
  children,
  style,
  ...props 
}: MeshGradientProps) {
  const opacity = intensity === 'low' ? 0.3 : intensity === 'medium' ? 0.5 : 0.8;

  return (
    <View style={[styles.container, style]} {...props}>
      {/* Base Background */}
      <View style={[styles.absolute, { backgroundColor: colors[0] }]} />
      
      {/* Top Left Glow */}
      <LinearGradient
        colors={[colors[1] || '#4ecca3', 'transparent']}
        style={[styles.absolute, styles.glow, { opacity }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.7, y: 0.7 }}
      />
      
      {/* Bottom Right Glow */}
      <LinearGradient
        colors={[colors[2] || '#453a94', 'transparent']}
        style={[styles.absolute, styles.glow, { opacity }]}
        start={{ x: 1, y: 1 }}
        end={{ x: 0.3, y: 0.3 }}
      />
      
      {/* Top Right Glow */}
      <LinearGradient
        colors={['#8b5cf6', 'transparent']}
        style={[styles.absolute, styles.glow, { opacity: opacity * 0.5 }]}
        start={{ x: 1, y: 0 }}
        end={{ x: 0.5, y: 0.5 }}
      />

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  absolute: {
    ...StyleSheet.absoluteFillObject,
  },
  glow: {
    borderRadius: 999,
    transform: [{ scale: 1.5 }],
  }
});
