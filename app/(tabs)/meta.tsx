import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import GlassHeader from '../../src/components/GlassHeader';
import { ItemTimingAnalyzer } from '../../src/components/meta/ItemTimingAnalyzer';
import { LaneRoleInsights } from '../../src/components/meta/LaneRoleInsights';

export default function MetaScreen() {
  const [activeTab, setActiveTab] = useState<'items' | 'lanes'>('items');

  return (
    <LinearGradient colors={['#1a1a2e', '#121212']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <GlassHeader 
          title="Meta Insights" 
        />
        
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Header Card */}
          <View className="m-4 mt-2 overflow-hidden rounded-3xl bg-purple-500/10 border border-purple-500/20 p-6 relative">
            <View className="flex-row items-center gap-3 mb-4 relative z-10">
              <View className="w-10 h-10 rounded-xl bg-purple-500 items-center justify-center shadow-lg shadow-purple-500/40">
                <Ionicons name="flash" size={20} color="white" />
              </View>
              <Text className="text-white text-xl font-black">Global Trends</Text>
            </View>
            <Text className="text-purple-200/60 text-xs leading-relaxed relative z-10">
              Discover powerful trends across millions of matches. Analyze item timings, lane efficiencies, and hero performance to stay ahead of the current game state.
            </Text>
            
            {/* Background decor */}
            <View className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl" />
          </View>

          {/* Tab Toggler */}
          <View className="px-4 mb-6">
            <View className="flex-row p-1 bg-zinc-900/60 rounded-2xl border border-zinc-800">
              <TouchableOpacity
                onPress={() => setActiveTab('items')}
                className={`flex-1 flex-row items-center justify-center gap-2 py-3 rounded-xl ${activeTab === 'items' ? 'bg-zinc-800 border border-zinc-700' : ''}`}
              >
                <Ionicons name="trending-up" size={16} color={activeTab === 'items' ? '#fff' : '#6b7280'} />
                <Text className={`font-bold text-xs ${activeTab === 'items' ? 'text-white' : 'text-zinc-500'}`}>
                  Item Timings
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setActiveTab('lanes')}
                className={`flex-1 flex-row items-center justify-center gap-2 py-3 rounded-xl ${activeTab === 'lanes' ? 'bg-zinc-800 border border-zinc-700' : ''}`}
              >
                <Ionicons name="map" size={16} color={activeTab === 'lanes' ? '#fff' : '#6b7280'} />
                <Text className={`font-bold text-xs ${activeTab === 'lanes' ? 'text-white' : 'text-zinc-500'}`}>
                  Lane Performance
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Active Content */}
          {activeTab === 'items' ? (
            <ItemTimingAnalyzer />
          ) : (
            <LaneRoleInsights />
          )}

          <View className="h-20" />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
