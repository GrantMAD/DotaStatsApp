import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { openDotaApi } from '../../src/services/opendota';
import { getHeroImageUrl } from '../../src/services/constants';
import { PlayerSelectModal } from '../../src/components/PlayerSelectModal';
import CompareStatRow from '../../src/components/CompareStatRow';
import { trackComparisonView } from '../../src/services/analytics';

const { width } = Dimensions.get('window');

export default function CompareScreen() {
  const [p1, setP1] = useState<any>(null);
  const [p2, setP2] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectingFor, setSelectingFor] = useState<'p1' | 'p2' | null>(null);

  const [data1, setData1] = useState<any>(null);
  const [data2, setData2] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (p1 && p2) {
      loadData();
      trackComparisonView('player_vs_player', 2);
    }
  }, [p1, p2]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [details1, wl1, heroes1, details2, wl2, heroes2] = await Promise.all([
        openDotaApi.getPlayerProfile(p1.account_id),
        openDotaApi.getPlayerWinLoss(p1.account_id),
        openDotaApi.getPlayerHeroes(p1.account_id),
        openDotaApi.getPlayerProfile(p2.account_id),
        openDotaApi.getPlayerWinLoss(p2.account_id),
        openDotaApi.getPlayerHeroes(p2.account_id),
      ]);

      setData1({ details: details1, wl: wl1, heroes: heroes1 });
      setData2({ details: details2, wl: wl2, heroes: heroes2 });
    } catch (error) {
      console.error('Error loading comparison data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenSelect = (target: 'p1' | 'p2') => {
    setSelectingFor(target);
    setModalVisible(true);
  };

  const handleSelect = (player: any) => {
    if (selectingFor === 'p1') setP1(player);
    else setP2(player);
    setModalVisible(false);
    setSelectingFor(null);
  };

  const winRate1 = data1?.wl ? (data1.wl.win / (data1.wl.win + data1.wl.lose) * 100).toFixed(1) : '0';
  const winRate2 = data2?.wl ? (data2.wl.win / (data2.wl.win + data2.wl.lose) * 100).toFixed(1) : '0';

  return (
    <LinearGradient colors={['#0f0f13', '#16161e']} className="flex-1">
      <View className="pt-14 pb-4 px-6 border-b border-zinc-800/50 bg-zinc-900/50">
        <Text className="text-3xl font-black text-white italic tracking-tighter">COMPARE</Text>
        <Text className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest mt-1">Player Statistics Battle</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Selection Area */}
        <View className="flex-row p-4 gap-4">
          <TouchableOpacity 
            onPress={() => handleOpenSelect('p1')}
            className="flex-1 aspect-square bg-zinc-900 rounded-3xl border border-zinc-800 items-center justify-center overflow-hidden"
          >
            {p1 ? (
              <>
                <Image source={{ uri: p1.avatarfull }} className="w-full h-full absolute opacity-40" />
                <View className="bg-black/40 w-full h-full items-center justify-center p-4">
                  <Image source={{ uri: p1.avatarfull }} className="w-16 h-16 rounded-2xl border-2 border-white/20 mb-2" />
                  <Text className="text-white font-black text-center text-xs" numberOfLines={1}>{p1.personaname}</Text>
                </View>
              </>
            ) : (
              <>
                <View className="w-16 h-16 rounded-2xl bg-zinc-800 items-center justify-center mb-2">
                  <Ionicons name="add" size={32} color="#555" />
                </View>
                <Text className="text-zinc-500 font-bold text-[10px] uppercase">Select Player 1</Text>
              </>
            )}
          </TouchableOpacity>

          <View className="items-center justify-center">
            <View className="w-10 h-10 rounded-full bg-purple-500 items-center justify-center shadow-lg shadow-purple-500/50">
              <Text className="text-white font-black italic">VS</Text>
            </View>
          </View>

          <TouchableOpacity 
            onPress={() => handleOpenSelect('p2')}
            className="flex-1 aspect-square bg-zinc-900 rounded-3xl border border-zinc-800 items-center justify-center overflow-hidden"
          >
            {p2 ? (
              <>
                <Image source={{ uri: p2.avatarfull }} className="w-full h-full absolute opacity-40" />
                <View className="bg-black/40 w-full h-full items-center justify-center p-4">
                  <Image source={{ uri: p2.avatarfull }} className="w-16 h-16 rounded-2xl border-2 border-white/20 mb-2" />
                  <Text className="text-white font-black text-center text-xs" numberOfLines={1}>{p2.personaname}</Text>
                </View>
              </>
            ) : (
              <>
                <View className="w-16 h-16 rounded-2xl bg-zinc-800 items-center justify-center mb-2">
                  <Ionicons name="add" size={32} color="#555" />
                </View>
                <Text className="text-zinc-500 font-bold text-[10px] uppercase">Select Player 2</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {loading ? (
          <View className="py-20">
            <ActivityIndicator size="large" color="#a855f7" />
          </View>
        ) : data1 && data2 ? (
          <View className="p-4">
            {/* Main Stats Card */}
            <View className="bg-zinc-900/80 rounded-3xl border border-zinc-800 p-6 mb-6">
              <Text className="text-zinc-500 font-black text-[10px] uppercase tracking-widest mb-6 text-center">Core Performance</Text>
              
              <CompareStatRow 
                label="WIN RATE"
                val1={winRate1}
                val2={winRate2}
                unit="%"
              />

              <CompareStatRow 
                label="RANK TIER"
                val1={data1.details?.rank_tier || '??'}
                val2={data2.details?.rank_tier || '??'}
              />

              <CompareStatRow 
                label="TOTAL GAMES"
                val1={data1.wl.win + data1.wl.lose}
                val2={data2.wl.win + data2.wl.lose}
              />
            </View>

            {/* Hero Battle */}
            <View className="bg-zinc-900/80 rounded-3xl border border-zinc-800 p-6">
              <Text className="text-zinc-500 font-black text-[10px] uppercase tracking-widest mb-6 text-center">Top Hero comparison</Text>
              
              {[0, 1, 2, 3, 4].map((idx) => {
                const h1 = data1.heroes[idx];
                const h2 = data2.heroes[idx];

                return (
                  <View key={idx} className="flex-row items-center mb-6 last:mb-0">
                    {/* Hero 1 */}
                    <View className="flex-1 items-center">
                      {h1 ? (
                        <>
                          <Image 
                            source={{ uri: getHeroImageUrl(Number(h1.hero_id)) }} 
                            className="w-12 h-12 rounded-lg mb-2"
                          />
                          <Text className="text-white font-bold text-xs">{h1.games > 0 ? (h1.win / h1.games * 100).toFixed(0) : 0}% WR</Text>
                          <Text className="text-zinc-500 text-[10px]">{h1.games} games</Text>
                        </>
                      ) : (
                        <View className="w-12 h-12 rounded-lg bg-zinc-800" />
                      )}
                    </View>

                    <View className="px-4">
                      <Text className="text-zinc-700 font-black text-xs">#{idx + 1}</Text>
                    </View>

                    {/* Hero 2 */}
                    <View className="flex-1 items-center">
                      {h2 ? (
                        <>
                          <Image 
                            source={{ uri: getHeroImageUrl(Number(h2.hero_id)) }} 
                            className="w-12 h-12 rounded-lg mb-2"
                          />
                          <Text className="text-white font-bold text-xs">{h2.games > 0 ? (h2.win / h2.games * 100).toFixed(0) : 0}% WR</Text>
                          <Text className="text-zinc-500 text-[10px]">{h2.games} games</Text>
                        </>
                      ) : (
                        <View className="w-12 h-12 rounded-lg bg-zinc-800" />
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        ) : (
          <View className="py-20 px-8 items-center">
            <Ionicons name="stats-chart" size={64} color="#333" />
            <Text className="text-zinc-500 text-center mt-4 font-bold">
              Select two players to start the comparison
            </Text>
            <TouchableOpacity 
              className="mt-8 bg-purple-500/20 border border-purple-500/50 px-8 py-3 rounded-2xl"
              onPress={() => handleOpenSelect('p1')}
            >
              <Text className="text-purple-400 font-black">BROWSE PLAYERS</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <PlayerSelectModal 
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSelect={handleSelect}
        title={selectingFor === 'p1' ? 'Select Player 1' : 'Select Player 2'}
      />
    </LinearGradient>
  );
}
