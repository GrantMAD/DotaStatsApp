import React from 'react';
import { View, StyleSheet, Platform, ViewStyle, Text, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface GlassHeaderProps {
  title?: string;
  children?: React.ReactNode;
  rightComponent?: React.ReactNode;
  leftComponent?: React.ReactNode;
  onBackPress?: () => void;
  style?: ViewStyle;
}

export default function GlassHeader({ title, children, rightComponent, leftComponent, onBackPress, style }: GlassHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }, style]}>
      {Platform.OS !== 'web' ? (
        <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
      ) : (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(18, 18, 18, 0.8)' }]} />
      )}
      <View style={styles.content}>
        <View style={styles.leftContainer}>
          {onBackPress ? (
            <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
              <Ionicons name="chevron-back" size={24} color="#fff" />
            </TouchableOpacity>
          ) : leftComponent ? (
            <View style={styles.leftComponentContainer}>
              {leftComponent}
            </View>
          ) : null}
          
          <View style={styles.titleContainer}>
            {title ? (
              <Text style={onBackPress ? styles.titleWithBack : styles.title} numberOfLines={1}>
                {title}
              </Text>
            ) : (
              children
            )}
          </View>
        </View>

        {rightComponent && (
          <View style={styles.rightContainer}>
            {rightComponent}
          </View>
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
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftComponentContainer: {
    marginRight: 8,
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  backButton: {
    padding: 8,
    marginRight: 4,
  },
  rightContainer: {
    marginLeft: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontFamily: 'Outfit_900Black',
    letterSpacing: 0.5,
  },
  titleWithBack: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Outfit_800ExtraBold',
    letterSpacing: 0.5,
  },
  border: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    width: '100%',
  }
});
