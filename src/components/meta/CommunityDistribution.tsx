import React, { useState, useEffect } from 'react';
import { View, Text, Dimensions, ActivityIndicator } from 'react-native';
import { openDotaApi } from '../../services/opendota';
import { BarChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';

const screenWidth = Dimensions.get('window').width;

const RANK_NAMES: Record<number, string> = {
  1: 'H',
  2: 'G',
  3: 'C',
  4: 'A',
  5: 'L',
  6: 'An',
  7: 'D',
  8: 'I',
};

export function CommunityDistribution() {
  const [data, setData] = useState<any>(null);
  const [totalPlayers, setTotalPlayers] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);

      try {
        const distribution = await openDotaApi.getDistributions();

        if (distribution && distribution.ranks) {
          const total = distribution.ranks.sum.count;

          setTotalPlayers(total);

          const grouped: Record<number, number> = {};

          distribution.ranks.rows.forEach(row => {
            const majorRank = Math.floor(row.bin / 10);

            if (majorRank >= 1 && majorRank <= 8) {
              grouped[majorRank] =
                (grouped[majorRank] || 0) + row.count;
            }
          });

          const labels = Object.keys(grouped)
            .sort()
            .map(k => RANK_NAMES[parseInt(k)]);

          const values = Object.keys(grouped)
            .sort()
            .map(k =>
              parseFloat(
                (
                  (grouped[parseInt(k)] / total) *
                  100
                ).toFixed(2)
              )
            );

          setData({
            labels,
            datasets: [{ data: values }],
          });
        }
      } catch (error) {
        console.error('Error fetching distributions:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <View className="space-y-6 px-4">
      {/* Metric Cards */}
      <View className="flex-row gap-3">
        <View className="flex-1 bg-zinc-900/40 p-4 rounded-3xl border border-white/5">
          <Text className="text-gray-500 text-[9px] font-outfit-bold uppercase mb-1">
            Sample Size
          </Text>

          <Text className="text-white font-outfit-black text-lg">
            {(totalPlayers / 1000000).toFixed(1)}M
          </Text>
        </View>

        <View className="flex-1 bg-zinc-900/40 p-4 rounded-3xl border border-white/5">
          <Text className="text-gray-500 text-[9px] font-outfit-bold uppercase mb-1">
            Average Rank
          </Text>

          <Text className="text-white font-outfit-black text-lg">
            Archon
          </Text>
        </View>
      </View>

      {/* Chart Card */}
      <View className="bg-zinc-900/40 rounded-[32px] border border-white/5 p-5">
        <View className="flex-row items-center mb-6">
          <View className="bg-blue-500/20 p-2 rounded-xl mr-3">
            <Ionicons
              name="bar-chart"
              size={20}
              color="#3b82f6"
            />
          </View>

          <View>
            <Text className="text-white font-outfit-black text-lg uppercase tracking-tight">
              Community Spread
            </Text>

            <Text className="text-gray-500 text-[10px] font-outfit-semibold uppercase tracking-widest">
              Global Rank Distribution %
            </Text>
          </View>
        </View>

        {loading ? (
          <View className="py-20 items-center justify-center">
            <ActivityIndicator color="#3b82f6" />
          </View>
        ) : data ? (
          <View className="-ml-10">
            <BarChart
              data={data}
              width={screenWidth - 20}
              height={220}
              yAxisLabel=""
              yAxisSuffix="%"
              chartConfig={{
                backgroundColor: 'transparent',
                backgroundGradientFrom: 'transparent',
                backgroundGradientTo: 'transparent',
                decimalPlaces: 0,
                color: (opacity = 1) =>
                  `rgba(59, 130, 246, ${opacity})`,
                labelColor: (opacity = 1) =>
                  `rgba(148, 163, 184, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                barPercentage: 0.7,
                paddingRight: 50,
                propsForBackgroundLines: {
                  strokeDasharray: '3 3',
                  stroke: 'rgba(255, 255, 255, 0.05)',
                },
              }}
              verticalLabelRotation={0}
              fromZero
              showValuesOnTopOfBars
              style={{
                marginVertical: 8,
                borderRadius: 16,
              }}
            />
          </View>
        ) : null}

        <View className="mt-4 p-4 bg-white/5 rounded-2xl border border-white/5 flex-row">
          <View className="bg-blue-500/20 p-2 rounded-lg mr-3 self-start">
            <Ionicons
              name="information-circle"
              size={18}
              color="#3b82f6"
            />
          </View>

          <View className="flex-1">
            <Text className="text-white font-outfit-bold text-xs mb-1">
              Understanding the Bell Curve
            </Text>

            <Text className="text-gray-400 text-[10px] leading-4 font-outfit">
              Most players reside in the Archon and Legend brackets.
              Breaking into Ancient (An) puts you in the top 20% of
              the community.
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}