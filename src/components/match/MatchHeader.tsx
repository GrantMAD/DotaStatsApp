import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { GAME_MODES } from '../../services/apiUtils';
import { MatchDetails } from '../../services/types';

interface MatchHeaderProps {
  matchData: MatchDetails;
  onClose: () => void;
}

export const MatchHeader: React.FC<MatchHeaderProps> = React.memo(({ matchData, onClose }) => {
  return (
    <View className="h-48 rounded-3xl overflow-hidden mb-6 relative border border-white/10">
      <View className="absolute inset-0 flex-row">
        <LinearGradient colors={['rgba(16, 185, 129, 0.2)', 'transparent']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} className="flex-1" />
        <LinearGradient colors={['rgba(239, 68, 68, 0.2)', 'transparent']} start={{ x: 1, y: 0 }} end={{ x: 0, y: 1 }} className="flex-1" />
      </View>

      {/* Close Button */}
      <TouchableOpacity
        onPress={onClose}
        className="absolute top-4 right-4 z-50 w-8 h-8 rounded-full bg-black/40 border border-white/10 items-center justify-center"
      >
        <Ionicons name="close" size={20} color="white" />
      </TouchableOpacity>

      <View className="absolute inset-0 items-center justify-center">
        <View className="flex-row items-center gap-10">
          <View className="items-center">
            <Text className="text-win font-outfit-black text-5xl italic leading-none">{matchData.radiant_score}</Text>
            <Text className="text-win/40 text-[8px] font-outfit-black uppercase tracking-widest mt-1">Radiant</Text>
          </View>

          <View className="items-center">
            <View className="bg-black/60 px-4 py-2 rounded-2xl border border-white/10 items-center">
              <Text className="text-white font-outfit-black text-lg italic leading-none">
                {Math.floor(matchData.duration / 60)}:{String(matchData.duration % 60).padStart(2, '0')}
              </Text>
              <Text className="text-gray-500 text-[7px] font-outfit-black uppercase mt-1">Duration</Text>
            </View>
            <View className={`mt-2 px-3 py-1 rounded-full border ${
              matchData.radiant_win ? "bg-win/10 border-win/30" : "bg-loss/10 border-loss/30"
              }`}>
              <Text className={`text-[9px] font-outfit-black uppercase tracking-widest ${matchData.radiant_win ? "text-win" : "text-loss"}`}>
                {matchData.radiant_win ? 'Victory' : 'Victory'}
              </Text>
            </View>
          </View>

          <View className="items-center">
            <Text className="text-loss font-outfit-black text-5xl italic leading-none">{matchData.dire_score}</Text>
            <Text className="text-loss/40 text-[8px] font-outfit-black uppercase tracking-widest mt-1">Dire</Text>
          </View>
        </View>
        <Text className="text-gray-500 font-outfit-bold text-[8px] uppercase tracking-[0.3em] mt-4 italic text-center">
          {GAME_MODES[matchData.game_mode] || 'Standard Match'} • ID {matchData.match_id}
        </Text>
      </View>
    </View>
  );
});
