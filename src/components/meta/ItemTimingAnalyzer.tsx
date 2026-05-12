import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator, Image, TextInput } from 'react-native';
import { useScenariosItemTimings } from '../../hooks/useOpenDota';
import { HEROES, ITEM_IDS, getHeroImageUrl } from '../../services/constants';
import { LineChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import GlassModal from '../GlassModal';

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

  const insights = useMemo(() => {
    if (chartData.length === 0) return null;

    const peakPoint = [...chartData].sort((a, b) => b.winRate - a.winRate)[0];
    const criticalPoint = chartData.find((d, i) => i > 0 && d.winRate < 50 && chartData[i - 1].winRate >= 50);
    const latestPoint = chartData[chartData.length - 1];
    
    const peakToLateDrop = peakPoint.winRate - latestPoint.winRate;
    
    return {
      peakPoint,
      criticalPoint,
      latestPoint,
      peakToLateDrop,
      isHighImpact: peakToLateDrop > 10
    };
  }, [chartData]);

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
          <Text className="text-zinc-500 text-[10px] font-black uppercase mb-2">Hero</Text>
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
          <Text className="text-zinc-500 text-[10px] font-black uppercase mb-2">Item</Text>
          <View className="flex-row items-center justify-between">
            <Text className="text-white font-bold capitalize max-w-[80%]" numberOfLines={1}>{itemName}</Text>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Dashboard Summary Cards */}
      {insights && !isLoading && (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          className="px-4"
          contentContainerStyle={{ gap: 12, paddingRight: 32 }}
        >
          <View className="bg-zinc-900/50 p-4 rounded-2xl border-l-4 border-emerald-500/50 min-w-[140px]">
            <Text className="text-zinc-500 text-[9px] font-black uppercase mb-1">Optimal</Text>
            <Text className="text-white font-black text-lg">Before {insights.peakPoint.time}m</Text>
          </View>
          <View className="bg-zinc-900/50 p-4 rounded-2xl border-l-4 border-amber-500/50 min-w-[140px]">
            <Text className="text-zinc-500 text-[9px] font-black uppercase mb-1">Target</Text>
            <Text className="text-white font-black text-lg">{insights.peakPoint.time}-{insights.criticalPoint?.time || insights.latestPoint.time}m</Text>
          </View>
          <View className="bg-zinc-900/50 p-4 rounded-2xl border-l-4 border-red-500/50 min-w-[140px]">
            <Text className="text-zinc-500 text-[9px] font-black uppercase mb-1">Danger Zone</Text>
            <Text className="text-white font-black text-lg">{insights.criticalPoint?.time || 'N/A'}+ min</Text>
          </View>
          <View className="bg-zinc-900/50 p-4 rounded-2xl border-l-4 border-purple-500/50 min-w-[140px]">
            <Text className="text-zinc-500 text-[9px] font-black uppercase mb-1">Win Swing</Text>
            <Text className="text-white font-black text-lg">-{insights.peakToLateDrop.toFixed(0)}%</Text>
          </View>
        </ScrollView>
      )}

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

          {insights?.criticalPoint && (
            <View className="flex-row items-center gap-1 bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20">
              <Ionicons name="warning" size={12} color="#ef4444" />
              <Text className="text-red-500 text-xs font-bold">{insights.criticalPoint.time}m drop-off</Text>
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
                color: (opacity = 1) => `rgba(168, 85, 247, ${opacity})`, 
                labelColor: (opacity = 1) => `rgba(161, 161, 170, ${opacity})`, 
                propsForDots: {
                  r: "4",
                  strokeWidth: "2",
                  stroke: "#18181b", 
                },
              }}
              bezier
              style={{ paddingRight: 70, paddingLeft: 10, marginVertical: 8, borderRadius: 16 }}
            />
            {/* Visual Zone Labels */}
            <View className="flex-row justify-between px-10 mt-2">
              <View className="flex-row items-center gap-1">
                <View className="w-2 h-2 rounded-full bg-emerald-500" />
                <Text className="text-emerald-500 text-[10px] font-bold uppercase">Optimal</Text>
              </View>
              <View className="flex-row items-center gap-1">
                <View className="w-2 h-2 rounded-full bg-red-500" />
                <Text className="text-red-500 text-[10px] font-bold uppercase">Danger</Text>
              </View>
            </View>
          </View>
        ) : (
          <View className="h-56 items-center justify-center">
            <Ionicons name="information-circle-outline" size={32} color="#52525b" />
            <Text className="text-zinc-500 mt-2 font-medium">Not enough data for this combo</Text>
          </View>
        )}
      </View>

      {/* Strategic Insights */}
      {insights && !isLoading && (
        <View className="px-4">
          <View className="bg-purple-500/10 p-4 rounded-2xl border border-purple-500/20">
            <View className="flex-row items-center gap-2 mb-2">
              <Ionicons name="flash" size={14} color="#c084fc" />
              <Text className="text-purple-400 text-[10px] font-black uppercase tracking-widest">Strategic Meta Tip</Text>
            </View>
            <Text className="text-zinc-300 text-xs leading-relaxed">
              For {heroName}, {itemName} is most effective when completed by <Text className="text-emerald-400 font-bold">{insights.peakPoint.time} minutes</Text>. 
              {insights.criticalPoint 
                ? ` Delaying it beyond ${insights.criticalPoint.time} minutes pushes your win rate into the "Danger Zone" (below 50%).` 
                : ` Even late purchases maintain a decent win rate, but earlier is always better for snowballing.`}
              {insights.isHighImpact && ` This item is high-impact; missing your window results in a significant ${insights.peakToLateDrop.toFixed(0)}% win rate penalty.`}
            </Text>
          </View>
        </View>
      )}

      {/* Picker Modals remain the same... */}
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
