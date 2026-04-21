import React from 'react';
import { View, StyleSheet, Platform, ViewStyle, Text } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface GlassHeaderProps {
  title?: string;
  children?: React.ReactNode;
  style?: ViewStyle;
}

export default function GlassHeader({ title, children, style }: GlassHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }, style]}>
      {Platform.OS !== 'web' ? (
        <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
      ) : (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(18, 18, 18, 0.8)' }]} />
      )}
      <View style={styles.content}>
        {title ? (
          <Text style={styles.title}>{title}</Text>
        ) : (
          children
        )}
      </View>
      <View style={styles.border} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    zIndex: 10,
    backgroundColor: 'transparent',
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    minHeight: 56,
    justifyContent: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  border: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    width: '100%',
  }
});
