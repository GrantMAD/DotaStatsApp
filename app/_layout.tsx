import '../global.css';
import { useCallback } from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../src/services/queryClient';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, Outfit_400Regular, Outfit_600SemiBold, Outfit_700Bold, Outfit_800ExtraBold, Outfit_900Black } from '@expo-google-fonts/outfit';
import { SupabaseAuthProvider, useSupabaseAuth } from '../src/context/SupabaseAuthContext';
import { SteamAuthProvider } from '../src/context/SteamAuthContext';
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { addNotificationListeners } from '../src/services/notifications';
import ErrorBoundary from '../src/components/ErrorBoundary';

const toastConfig = {
  success: (props: any) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: '#22c55e', backgroundColor: '#1e1e2e', borderRightWidth: 1, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#2a2a3e' }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 15,
        fontWeight: '700',
        color: '#fff'
      }}
      text2Style={{
        fontSize: 13,
        color: '#aaa'
      }}
    />
  ),
  error: (props: any) => (
    <ErrorToast
      {...props}
      style={{ borderLeftColor: '#ef4444', backgroundColor: '#1e1e2e', borderRightWidth: 1, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#2a2a3e' }}
      text1Style={{
        fontSize: 15,
        fontWeight: '700',
        color: '#fff'
      }}
      text2Style={{
        fontSize: 13,
        color: '#aaa'
      }}
    />
  ),
};

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

function NotificationManager({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { session } = useSupabaseAuth();

  useEffect(() => {
    if (!session) return;

    const removeListeners = addNotificationListeners(
      (notification) => {
        // Handle foreground notification (e.g., show a toast)
        console.log('Foreground notification:', notification.request.content.title);
      },
      (response) => {
        // Handle notification tap
        const data = response.notification.request.content.data;
        if (data?.type === 'friend_request' || data?.notificationId) {
          router.push('/notifications');
        }
      }
    );

    return () => removeListeners();
  }, [session, router]);

  return <>{children}</>;
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Outfit_400Regular,
    Outfit_600SemiBold,
    Outfit_700Bold,
    Outfit_800ExtraBold,
    Outfit_900Black,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SupabaseAuthProvider>
        <NotificationManager>
          <SteamAuthProvider>
            <StatusBar style="light" />
            <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
              <ErrorBoundary>
                <Stack 
                  screenOptions={{ headerShown: false }}
                >
                  <Stack.Screen name="index" />
                  <Stack.Screen name="(tabs)" />
                  <Stack.Screen name="welcome" />
                  <Stack.Screen name="sign-in" />
                  <Stack.Screen name="sign-up" />
                  <Stack.Screen name="notifications" />
                </Stack>
              </ErrorBoundary>
            </View>
            <Toast config={toastConfig} />
          </SteamAuthProvider>
        </NotificationManager>
      </SupabaseAuthProvider>
    </QueryClientProvider>
  );
}
