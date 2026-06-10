import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';

interface ParseInstructionsProps {
  matchId: number | null;
  message: string;
  parseRequested: boolean;
  isParsing: boolean;
  onRequestParse: () => void;
}

export const ParseInstructions: React.FC<ParseInstructionsProps> = ({
  matchId,
  message,
  parseRequested,
  isParsing,
  onRequestParse,
}) => {
  return (
    <View className="bg-[#2a2a2a] p-8 rounded-2xl border border-zinc-800 items-center justify-center">
      <View className="bg-zinc-800/50 p-4 rounded-full mb-4">
        <Ionicons name="analytics-outline" size={32} color="#8b5cf6" />
      </View>
      <Text className="text-white font-bold text-center mb-2">Parsed Data Required</Text>
      <Text className="text-gray-400 text-center text-xs mb-6 px-4">
        {message}
      </Text>

      {!parseRequested ? (
        <TouchableOpacity
          onPress={onRequestParse}
          disabled={isParsing}
          className="bg-gamingAccent px-6 py-3 rounded-xl flex-row items-center active:bg-gamingAccent/80"
        >
          {isParsing ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <Ionicons name="cloud-upload-outline" size={18} color="white" />
              <Text className="text-white font-bold ml-2">Request Parse</Text>
            </>
          )}
        </TouchableOpacity>
      ) : (
        <View className="bg-green-500/10 border border-green-500/20 px-4 py-3 rounded-xl flex-row items-center">
          <Ionicons name="checkmark-circle" size={18} color="#22c55e" />
          <Text className="text-green-500 font-bold ml-2 text-xs">Parse Requested! Check back in a few minutes.</Text>
        </View>
      )}

      {matchId && (
        <TouchableOpacity
          onPress={() => Linking.openURL(`https://www.opendota.com/matches/${matchId}`)}
          className="mt-6 flex-row items-center"
        >
          <Text className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mr-1">View on OpenDota</Text>
          <Ionicons name="open-outline" size={12} color="#71717a" />
        </TouchableOpacity>
      )}
    </View>
  );
};
