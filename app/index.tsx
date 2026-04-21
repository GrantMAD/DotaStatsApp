import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSteamAuth } from '../src/hooks/useSteamAuth';
import { Redirect, Link } from 'expo-router';

export default function LandingScreen() {
  const { accountId, isLoading, login } = useSteamAuth();

  if (isLoading) {
    return (
      <View className="flex-1 bg-gamingDark justify-center items-center">
        <ActivityIndicator size="large" color="#8b5cf6" />
      </View>
    );
  }

  // If already authenticated, go straight to dashboard
  if (accountId) {
    return <Redirect href="/(tabs)/dashboard" />;
  }

  return (
    <View className="flex-1 bg-gamingDark flex-col justify-center items-center p-6">
      <View className="mb-12 items-center">
        <Text className="text-4xl text-white font-bold mb-2">Dota2Stats</Text>
        <Text className="text-gray-400 text-center">Analyze your performance, track heroes, and rise through the ranks.</Text>
      </View>

      <TouchableOpacity 
        onPress={login}
        className="bg-gamingAccent px-8 py-4 rounded-xl w-full flex-row justify-center items-center mt-8 active:opacity-80"
      >
        <Text className="text-white text-lg font-bold">Sign in with Steam</Text>
      </TouchableOpacity>

      <Link href="/home" asChild>
        <TouchableOpacity className="mt-6">
          <Text className="text-gray-400 font-semibold border-b border-gray-600 pb-1">Continue without signing in</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}
