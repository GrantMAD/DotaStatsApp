import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import PressableScale from '../src/components/PressableScale';
import { Ionicons } from '@expo/vector-icons';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <LinearGradient 
      colors={['#1a1a2e', '#121212']} 
      style={{ flex: 1, justifyContent: 'center', padding: 24 }}
    >
      <Animated.View entering={FadeInDown.delay(100).springify()} style={{ alignItems: 'center', marginBottom: 40 }}>
        <Image
          source={require('../assets/images/dota_logo_placeholder.png')}
          style={{ width: 100, height: 100, marginBottom: 24 }}
          resizeMode="contain"
        />
        <Text style={{ fontSize: 32, color: '#fff', fontWeight: '900', letterSpacing: 1, textAlign: 'center' }}>
          DOTA APP
        </Text>
        <Text style={{ color: '#888', fontSize: 16, marginTop: 12, textAlign: 'center' }}>
          Your ultimate companion for Dota 2 stats and pro scene insights.
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).springify()}>
        <PressableScale onPress={() => router.push('/sign-in')} style={{ width: '100%', marginBottom: 16 }}>
          <View style={{
            backgroundColor: '#8b5cf6',
            paddingVertical: 16,
            borderRadius: 12,
            alignItems: 'center',
          }}>
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>Sign In</Text>
          </View>
        </PressableScale>

        <PressableScale onPress={() => router.push('/sign-up')} style={{ width: '100%' }}>
          <View style={{
            backgroundColor: 'transparent',
            paddingVertical: 16,
            borderRadius: 12,
            borderWidth: 2,
            borderColor: '#8b5cf6',
            alignItems: 'center',
          }}>
            <Text style={{ color: '#8b5cf6', fontSize: 18, fontWeight: '700' }}>Create an Account</Text>
          </View>
        </PressableScale>

        <PressableScale onPress={() => router.push('/(tabs)/home')} style={{ width: '100%', marginTop: 24 }}>
          <View style={{
            alignItems: 'center',
            paddingVertical: 12,
          }}>
            <Text style={{ color: '#aaa', fontSize: 16, fontWeight: '600' }}>Continue as Guest</Text>
          </View>
        </PressableScale>
      </Animated.View>
    </LinearGradient>
  );
}
