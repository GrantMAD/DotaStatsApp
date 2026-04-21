import { View, Text, ActivityIndicator, Image, TouchableOpacity, TextInput } from 'react-native';
import { useSteamAuth } from '../../src/hooks/useSteamAuth';
import { Ionicons } from '@expo/vector-icons'; // Import Ionicons

export default function HomeScreen() {
  const { login, accountId } = useSteamAuth();

  return (
    <View className="flex-1 bg-gamingDark justify-start items-center p-6">
      <Image
        source={require('../../assets/images/dota_logo_placeholder.png')} // Placeholder for an actual logo
        style={{ width: 64, height: 64, marginBottom: 32 }}
        resizeMode="contain"
      />
      <Text className="text-4xl text-white font-bold mb-4 text-center">Welcome to Dota Stuff</Text>
      <Text className="text-gray-400 text-center mb-8">
        Explore game statistics, player performance, and hero data.
        Sign in to unlock personalized insights.
      </Text>

      {/* Add the search bar with icon here */}
      <View className="w-full px-4 mt-4"> {/* Container for the search bar */}
        <View className="flex-row items-center bg-gray-800 p-3 rounded-lg w-full"> {/* New container for icon + input */}
          <Ionicons name="search" size={20} color="#666" className="mr-3" /> {/* Search icon */}
          <TextInput
            placeholder="Search for matches, players, heroes..."
            placeholderTextColor="#666"
            className="flex-1 text-white" // TextInput takes remaining space
          />
        </View>
      </View>
    </View>
  );
}
