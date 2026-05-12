import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import GlassHeader from '../../src/components/GlassHeader';
import NotificationBell from '../../src/components/NotificationBell';
import { useMenu } from './_layout';
import { useSupabaseAuth } from '../../src/context/SupabaseAuthContext';
import { ItemTimingAnalyzer } from '../../src/components/meta/ItemTimingAnalyzer';
import { LaneRoleInsights } from '../../src/components/meta/LaneRoleInsights';
import { BracketLeaderboards } from '../../src/components/meta/BracketLeaderboards';
import { CommunityDistribution } from '../../src/components/meta/CommunityDistribution';
import { ScenarioFunFacts } from '../../src/components/meta/ScenarioFunFacts';

export default function MetaScreen() {
  const [activeTab, setActiveTab] = useState<'items' | 'lanes' | 'ranks' | 'community' | 'insights'>('items');
  const { setMenuVisible } = useMenu();
  const { session } = useSupabaseAuth();

  return (
    <LinearGradient colors={['#1a1a2e', '#121212']} style={{ flex: 1 }}>
      <GlassHeader 
        leftComponent={
          session ? (
            <TouchableOpacity 
              onPress={() => setMenuVisible(true)}
              style={{ padding: 8, marginLeft: -8 }}
            >
              <Ionicons name="menu" size={28} color="white" />
            </TouchableOpacity>
          ) : undefined
        }
        rightComponent={<NotificationBell />}
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
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row p-1 bg-zinc-900/60 rounded-2xl border border-zinc-800">
              <TouchableOpacity
                onPress={() => setActiveTab('items')}
                className={`flex-row items-center justify-center gap-2 py-3 px-4 rounded-xl ${activeTab === 'items' ? 'bg-zinc-800 border border-zinc-700' : ''}`}
              >
                <Ionicons name="trending-up" size={16} color={activeTab === 'items' ? '#fff' : '#6b7280'} />
                <Text className={`font-bold text-xs ${activeTab === 'items' ? 'text-white' : 'text-zinc-500'}`}>
                  Items
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setActiveTab('lanes')}
                className={`flex-row items-center justify-center gap-2 py-3 px-4 rounded-xl ${activeTab === 'lanes' ? 'bg-zinc-800 border border-zinc-700' : ''}`}
              >
                <Ionicons name="map" size={16} color={activeTab === 'lanes' ? '#fff' : '#6b7280'} />
                <Text className={`font-bold text-xs ${activeTab === 'lanes' ? 'text-white' : 'text-zinc-500'}`}>
                  Lanes
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setActiveTab('ranks')}
                className={`flex-row items-center justify-center gap-2 py-3 px-4 rounded-xl ${activeTab === 'ranks' ? 'bg-zinc-800 border border-zinc-700' : ''}`}
              >
                <Ionicons name="trophy" size={16} color={activeTab === 'ranks' ? '#fff' : '#6b7280'} />
                <Text className={`font-bold text-xs ${activeTab === 'ranks' ? 'text-white' : 'text-zinc-500'}`}>
                  Ranks
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setActiveTab('community')}
                className={`flex-row items-center justify-center gap-2 py-3 px-4 rounded-xl ${activeTab === 'community' ? 'bg-zinc-800 border border-zinc-700' : ''}`}
              >
                <Ionicons name="people" size={16} color={activeTab === 'community' ? '#fff' : '#6b7280'} />
                <Text className={`font-bold text-xs ${activeTab === 'community' ? 'text-white' : 'text-zinc-500'}`}>
                  Community
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setActiveTab('insights')}
                className={`flex-row items-center justify-center gap-2 py-3 px-4 rounded-xl ${activeTab === 'insights' ? 'bg-zinc-800 border border-zinc-700' : ''}`}
              >
                <Ionicons name="bulb" size={16} color={activeTab === 'insights' ? '#fff' : '#6b7280'} />
                <Text className={`font-bold text-xs ${activeTab === 'insights' ? 'text-white' : 'text-zinc-500'}`}>
                  Insights
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>

        {/* Active Content */}
        <View>
          {activeTab === 'items' && <ItemTimingAnalyzer />}
          {activeTab === 'lanes' && <LaneRoleInsights />}
          {activeTab === 'ranks' && <BracketLeaderboards />}
          {activeTab === 'community' && <CommunityDistribution />}
          {activeTab === 'insights' && <ScenarioFunFacts />}
        </View>

        <View className="h-24" />
      </ScrollView>
    </LinearGradient>
  );
}
