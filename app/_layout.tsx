import '../global.css';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../src/services/queryClient';

import { SteamAuthProvider } from '../src/context/SteamAuthContext';

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <SteamAuthProvider>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </SteamAuthProvider>
    </QueryClientProvider>
  );
}
