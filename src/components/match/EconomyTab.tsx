import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LineChart } from "react-native-chart-kit";
import { MatchDetails } from '../../services/types';
import { ParseInstructions } from './ParseInstructions';

interface EconomyTabProps {
  matchData: MatchDetails;
  parseRequested: boolean;
  isParsing: boolean;
  onRequestParse: () => void;
}

export const EconomyTab: React.FC<EconomyTabProps> = ({
  matchData,
  parseRequested,
  isParsing,
  onRequestParse,
}) => {
  const screenWidth = Dimensions.get('window').width - 64;

  if (!matchData.radiant_gold_adv || !matchData.radiant_xp_adv) {
    return (
      <ParseInstructions
        matchId={matchData.match_id}
        message="Economy trends require parsed match data."
        parseRequested={parseRequested}
        isParsing={isParsing}
        onRequestParse={onRequestParse}
      />
    );
  }

  const finalGold = matchData.radiant_gold_adv[matchData.radiant_gold_adv.length - 1];
  const finalXp = matchData.radiant_xp_adv[matchData.radiant_xp_adv.length - 1];

  return (
    <View>
      {/* Economy Summary Cards */}
      <View className="flex-row gap-3 mb-6">
        <View className="flex-1 bg-[#2a2a2a] p-4 rounded-2xl border border-zinc-800 relative overflow-hidden">
          <View className={`absolute inset-0 opacity-10 ${finalGold >= 0 ? 'bg-win' : 'bg-loss'}`} />
          <View className="relative z-10">
            <Text className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1 italic">
              Net Worth Diff
            </Text>
            <View className="flex-row items-end">
              <Text className={`text-2xl font-black italic tracking-tighter ${finalGold >= 0 ? 'text-win' : 'text-loss'}`}>
                {finalGold >= 0 ? '+' : ''}
                {Math.abs(finalGold) >= 1000 ? `${(finalGold / 1000).toFixed(1)}k` : finalGold}
              </Text>
              <MaterialCommunityIcons
                name="flash"
                size={16}
                color={finalGold >= 0 ? '#10b981' : '#ef4444'}
                className="ml-1 mb-1 opacity-50"
              />
            </View>
          </View>
        </View>

        <View className="flex-1 bg-[#2a2a2a] p-4 rounded-2xl border border-zinc-800 relative overflow-hidden">
          <View className={`absolute inset-0 opacity-10 ${finalXp >= 0 ? 'bg-win' : 'bg-loss'}`} />
          <View className="relative z-10">
            <Text className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1 italic">
              Experience Diff
            </Text>
            <View className="flex-row items-end">
              <Text className={`text-2xl font-black italic tracking-tighter ${finalXp >= 0 ? 'text-win' : 'text-loss'}`}>
                {finalXp >= 0 ? '+' : ''}
                {Math.abs(finalXp) >= 1000 ? `${(finalXp / 1000).toFixed(1)}k` : finalXp}
              </Text>
              <MaterialCommunityIcons
                name="trending-up"
                size={16}
                color={finalXp >= 0 ? '#10b981' : '#ef4444'}
                className="ml-1 mb-1 opacity-50"
              />
            </View>
          </View>
        </View>
      </View>

      <View className="bg-[#2a2a2a] p-4 rounded-2xl border border-zinc-800 mb-4 overflow-hidden relative">
        <View className="absolute top-0 left-0 w-24 h-24 bg-win/5 blur-2xl rounded-full" />
        <View className="absolute bottom-0 right-0 w-24 h-24 bg-loss/5 blur-2xl rounded-full" />

        <Text className="text-gray-500 uppercase tracking-[0.2em] text-[9px] font-black mb-4 text-center">Team Advantage Over Time</Text>
        <LineChart
          data={{
            labels: matchData.radiant_gold_adv.map((_, i) => i % 10 === 0 ? `${i}'` : ''),
            datasets: [
              { data: matchData.radiant_gold_adv, color: (opacity = 1) => `rgba(234, 179, 8, ${opacity})`, strokeWidth: 3 },
              { data: matchData.radiant_xp_adv, color: (opacity = 1) => `rgba(139, 92, 246, ${opacity})`, strokeWidth: 3 }
            ],
            legend: ["Gold", "XP"]
          }}
          width={screenWidth}
          height={240}
          chartConfig={{
            backgroundColor: "#1e1e1e",
            backgroundGradientFrom: "#2a2a2a",
            backgroundGradientTo: "#2a2a2a",
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(156, 163, 175, ${opacity})`,
            propsForDots: { r: "0" },
            propsForBackgroundLines: {
              strokeDasharray: "", // solid background lines
              stroke: "rgba(255, 255, 255, 0.05)"
            }
          }}
          bezier
          style={{ marginVertical: 8, borderRadius: 16 }}
        />
        <View className="flex-row justify-center gap-6 mt-2">
          <View className="flex-row items-center">
            <View className="w-2 h-2 rounded-full bg-yellow-500 mr-2" />
            <Text className="text-[10px] font-bold text-gray-400">NET WORTH</Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-2 h-2 rounded-full bg-purple-500 mr-2" />
            <Text className="text-[10px] font-bold text-gray-400">EXPERIENCE</Text>
          </View>
        </View>
      </View>
    </View>
  );
};
