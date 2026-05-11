import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator, Image, TextInput } from 'react-native';
import { useScenariosItemTimings } from '../../hooks/useOpenDota';
import { HEROES, ITEM_IDS, getHeroImageUrl } from '../../services/constants';
import { LineChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import GlassModal from '../GlassModal';
import { BlurView } from 'expo-blur';

const screenWidth = Dimensions.get("window").width;

export function ItemTimingAnalyzer() {
  const [selectedHero, setSelectedHero] = useState<number>(1); // Anti-Mage
  const [selectedItem, setSelectedItem] = useState<string>('bfury');

  const [isHeroModalOpen, setIsHeroModalOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading } = useScenariosItemTimings(selectedItem, selectedHero);

  const heroList = useMemo(() => Object.entries(HEROES).map(([id, hero]) => ({
    id: parseInt(id),
    ...hero
  })).sort((a, b) => a.localized_name.localeCompare(b.localized_name)), []);

  const itemList = useMemo(() => Object.entries(ITEM_IDS)
    .map(([id, name]) => ({ id: parseInt(id), name }))
    .filter(item => item.name && !item.name.includes('recipe'))
    .sort((a, b) => a.name.localeCompare(b.name)), []);

  const filteredHeroes = heroList.filter(h => h.localized_name.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredItems = itemList.filter(i => i.name.replace(/_/g, ' ').toLowerCase().includes(searchQuery.toLowerCase()));

  const chartData = useMemo(() => {
    if (!data) return [];
    return data.map(d => {
      const games = parseInt(String(d.games || 0));
      const wins = parseInt(String(d.wins || 0));
      const time = parseInt(String(d.time || 0));
      return {
        time: Math.floor(time / 60),
        winRate: games > 0 ? parseFloat(((wins / games) * 100).toFixed(1)) : 0,
        games: games
      };
    })
      .filter(d => d.time > 0)
      .sort((a, b) => a.time - b.time);
  }, [data]);

  const criticalPoint = chartData.find((d, i) => i > 0 && d.winRate < 50 && chartData[i - 1].winRate >= 50);

  const chartLabels = chartData.map(d => d.time.toString());
  const chartWinRates = chartData.map(d => d.winRate);

  const heroName = HEROES[selectedHero]?.localized_name || 'Hero';
  const itemName = selectedItem.replace(/_/g, ' ');

  return (
    <View className="space-y-6">
      {/* Selectors */}
      <View className="flex-row gap-4 px-4">
        <TouchableOpacity
          className="flex-1 bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800"
          onPress={() => { setSearchQuery(''); setIsHeroModalOpen(true); }}
        >
          <Text className="text-zinc-500 text-xs font-bold uppercase mb-2">Hero</Text>
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <Image source={{ uri: getHeroImageUrl(selectedHero) }} className="w-8 h-8 rounded-lg" />
              <Text className="text-white font-bold max-w-[80%]" numberOfLines={1}>{heroName}</Text>
            </View>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-1 bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800"
          onPress={() => { setSearchQuery(''); setIsItemModalOpen(true); }}
        >
          <Text className="text-zinc-500 text-xs font-bold uppercase mb-2">Item</Text>
          <View className="flex-row items-center justify-between">
            <Text className="text-white font-bold capitalize max-w-[80%]" numberOfLines={1}>{itemName}</Text>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Chart Section */}
      <View className="bg-zinc-900/40 mx-4 p-4 rounded-3xl border border-white/5">
        <View className="flex-row justify-between items-start mb-6">
          <View className="flex-row items-center gap-3 flex-1">
            <View className="w-10 h-10 rounded-xl bg-purple-500/20 items-center justify-center border border-purple-500/30">
              <Ionicons name="trending-up" size={20} color="#c084fc" />
            </View>
            <View className="flex-1">
              <Text className="text-white font-black text-base">Win Rate by Time</Text>
              <Text className="text-zinc-400 text-xs">{heroName} with {itemName}</Text>
            </View>
          </View>

          {criticalPoint && (
            <View className="flex-row items-center gap-1 bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20">
              <Ionicons name="warning" size={12} color="#ef4444" />
              <Text className="text-red-500 text-xs font-bold">{criticalPoint.time}m drop-off</Text>
            </View>
          )}
        </View>

        {isLoading ? (
          <View className="h-56 items-center justify-center">
            <ActivityIndicator size="large" color="#c084fc" />
          </View>
        ) : chartData.length > 0 ? (
          <View className="-ml-10">
            <LineChart
              data={{
                labels: chartLabels.length > 10 ? chartLabels.filter((_, i) => i % Math.ceil(chartLabels.length / 8) === 0) : chartLabels,
                datasets: [{ data: chartWinRates }]
              }}
              width={screenWidth - 25}
              height={220}
              yAxisSuffix="%"
              withInnerLines={false}
              withOuterLines={false}
              chartConfig={{
                backgroundColor: 'transparent',
                backgroundGradientFromOpacity: 0,
                backgroundGradientToOpacity: 0,
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(168, 85, 247, ${opacity})`, // Purple 500
                labelColor: (opacity = 1) => `rgba(161, 161, 170, ${opacity})`, // Zinc 400
                propsForDots: {
                  r: "4",
                  strokeWidth: "2",
                  stroke: "#18181b", // bg-zinc-900 equivalent
                },
              }}
              bezier
              style={{ paddingRight: 70, paddingLeft: 10, marginVertical: 8, borderRadius: 16 }}
            />
          </View>
        ) : (
          <View className="h-56 items-center justify-center">
            <Ionicons name="information-circle-outline" size={32} color="#52525b" />
            <Text className="text-zinc-500 mt-2 font-medium">Not enough data for this combo</Text>
          </View>
        )}
      </View>

      {/* Strategic Insights */}
      <View className="px-4 flex-row gap-4">
        <View className="flex-1 bg-indigo-500/10 p-4 rounded-2xl border border-indigo-500/20">
          <View className="flex-row items-center gap-2 mb-2">
            <Ionicons name="book" size={14} color="#818cf8" />
            <Text className="text-indigo-400 text-[10px] font-black uppercase tracking-widest">How to Read</Text>
          </View>
          <Text className="text-indigo-300/80 text-xs leading-relaxed">
            A downward slope indicates that delaying this item significantly reduces win chances. Try to build it before the win rate drops below 50%.
          </Text>
        </View>
      </View>

      {/* Hero Picker Modal */}
      <GlassModal visible={isHeroModalOpen} onClose={() => setIsHeroModalOpen(false)}>
        <View className="flex-1 px-4 pt-2">
          <Text className="text-white font-black text-xl mb-4">Select Hero</Text>
          <View className="bg-zinc-800/50 flex-row items-center px-4 py-3 rounded-2xl mb-4">
            <Ionicons name="search" size={20} color="#9ca3af" />
            <TextInput
              className="flex-1 text-white ml-2"
              placeholder="Search hero..."
              placeholderTextColor="#9ca3af"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {filteredHeroes.map(hero => (
              <TouchableOpacity
                key={hero.id}
                className={`flex-row items-center p-3 rounded-xl mb-2 ${selectedHero === hero.id ? 'bg-purple-500/20 border border-purple-500/50' : 'bg-white/5'}`}
                onPress={() => {
                  setSelectedHero(hero.id);
                  setIsHeroModalOpen(false);
                }}
              >
                <Image source={{ uri: getHeroImageUrl(hero.id) }} className="w-10 h-10 rounded-lg" />
                <Text className="text-white font-bold ml-4">{hero.localized_name}</Text>
                {selectedHero === hero.id && <Ionicons name="checkmark-circle" size={20} color="#c084fc" style={{ marginLeft: 'auto' }} />}
              </TouchableOpacity>
            ))}
            <View className="h-10" />
          </ScrollView>
        </View>
      </GlassModal>

      {/* Item Picker Modal */}
      <GlassModal visible={isItemModalOpen} onClose={() => setIsItemModalOpen(false)}>
        <View className="flex-1 px-4 pt-2">
          <Text className="text-white font-black text-xl mb-4">Select Item</Text>
          <View className="bg-zinc-800/50 flex-row items-center px-4 py-3 rounded-2xl mb-4">
            <Ionicons name="search" size={20} color="#9ca3af" />
            <TextInput
              className="flex-1 text-white ml-2"
              placeholder="Search item..."
              placeholderTextColor="#9ca3af"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {filteredItems.map(item => (
              <TouchableOpacity
                key={item.id}
                className={`flex-row items-center p-4 rounded-xl mb-2 ${selectedItem === item.name ? 'bg-purple-500/20 border border-purple-500/50' : 'bg-white/5'}`}
                onPress={() => {
                  setSelectedItem(item.name);
                  setIsItemModalOpen(false);
                }}
              >
                <Text className="text-white font-bold capitalize">{item.name.replace(/_/g, ' ')}</Text>
                {selectedItem === item.name && <Ionicons name="checkmark-circle" size={20} color="#c084fc" style={{ marginLeft: 'auto' }} />}
              </TouchableOpacity>
            ))}
            <View className="h-10" />
          </ScrollView>
        </View>
      </GlassModal>

    </View>
  );
}
