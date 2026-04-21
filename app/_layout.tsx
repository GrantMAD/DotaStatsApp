import '../global.css';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { SteamAuthProvider } from '../src/context/SteamAuthContext';

export default function RootLayout() {
  return (
    <SteamAuthProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </SteamAuthProvider>
  );
}
