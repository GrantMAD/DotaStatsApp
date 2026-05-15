import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface DataPrivacyIndicatorProps {
  type: 'private' | 'restricted';
  accountId?: string | number;
}

const DataPrivacyIndicator: React.FC<DataPrivacyIndicatorProps> = ({ type, accountId }) => {
  const isPrivate = type === 'private';
  
  const handleOpenGuide = () => {
    WebBrowser.openBrowserAsync('https://steamcommunity.com/my/edit/settings');
  };

  return (
    <Animated.View 
      entering={FadeInDown.duration(400).springify()}
      className={`p-4 rounded-2xl mb-6 border ${
        isPrivate 
          ? 'bg-red-500/10 border-red-500/20' 
          : 'bg-amber-500/10 border-amber-500/20'
      }`}
    >
      <View className="flex-row items-center mb-3">
        <View className={`p-2 rounded-full mr-3 ${
          isPrivate ? 'bg-red-500/20' : 'bg-amber-500/20'
        }`}>
          <Ionicons 
            name={isPrivate ? "eye-off-outline" : "alert-circle-outline"} 
            size={20} 
            color={isPrivate ? "#ef4444" : "#f59e0b"} 
          />
        </View>
        <View className="flex-1">
          <Text className={`font-outfit-bold text-sm ${
            isPrivate ? 'text-red-500' : 'text-amber-500'
          }`}>
            {isPrivate ? 'Private Steam Profile' : 'Restricted Match Data'}
          </Text>
          <Text className="text-gray-400 text-[10px] font-outfit-bold uppercase tracking-widest mt-0.5">
            Privacy Restriction Active
          </Text>
        </View>
      </View>

      <Text className="text-gray-300 text-xs font-outfit leading-relaxed mb-4">
        {isPrivate 
          ? "This Steam account is set to private. We cannot retrieve identity or match history data unless the profile is set to public."
          : "Identity is public, but 'Expose Public Match Data' is disabled in the Dota 2 client. Statistics and recent matches are hidden."}
      </Text>

      <TouchableOpacity 
        onPress={handleOpenGuide}
        activeOpacity={0.7}
        className={`flex-row items-center justify-center py-2.5 rounded-xl border ${
          isPrivate 
            ? 'bg-red-500/5 border-red-500/30' 
            : 'bg-amber-500/5 border-amber-500/30'
        }`}
      >
        <Ionicons 
          name="help-circle-outline" 
          size={16} 
          color={isPrivate ? "#ef4444" : "#f59e0b"} 
          className="mr-2"
        />
        <Text className={`font-outfit-bold text-[10px] uppercase tracking-widest ${
          isPrivate ? 'text-red-500' : 'text-amber-500'
        }`}>
          How to fix this
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default DataPrivacyIndicator;
