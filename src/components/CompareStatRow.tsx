import React from 'react';
import { View, Text } from 'react-native';

interface CompareStatRowProps {
  label: string;
  val1: string | number;
  val2: string | number;
  isHigherBetter?: boolean;
  unit?: string;
}

export default function CompareStatRow({ 
  label, 
  val1, 
  val2, 
  isHigherBetter = true,
  unit = ''
}: CompareStatRowProps) {
  const num1 = typeof val1 === 'number' ? val1 : parseFloat(val1.toString());
  const num2 = typeof val2 === 'number' ? val2 : parseFloat(val2.toString());
  
  const isWinner1 = isHigherBetter ? num1 > num2 : num1 < num2;
  const isWinner2 = isHigherBetter ? num2 > num1 : num2 < num1;
  const isDraw = num1 === num2;

  const total = (num1 + num2) || 1;
  const perc1 = (num1 / total) * 100;
  const perc2 = (num2 / total) * 100;

  const diff = Math.abs(num1 - num2);
  const diffFormatted = Number.isInteger(diff) ? diff : diff.toFixed(1);

  return (
    <View className="mb-6">
      <View className="items-center mb-2">
        <Text className="text-zinc-500 text-[10px] font-black uppercase tracking-[2px]">
          {label}
        </Text>
        {!isDraw && (
          <Text className="text-purple-400/60 text-[8px] font-bold uppercase tracking-tighter">
            {isWinner1 ? "← " : ""}{diffFormatted}{unit} Difference{isWinner2 ? " →" : ""}
          </Text>
        )}
      </View>

      <View className="flex-row items-center h-14">
        {/* Left Player */}
        <View className={`flex-1 h-full rounded-xl overflow-hidden border flex-row items-center justify-end px-3 ${isWinner1 ? 'border-purple-500/30 bg-purple-500/5' : 'border-zinc-800/50 bg-zinc-900/20'}`}>
          {/* Fill */}
          <View 
            className={`absolute right-0 top-0 bottom-0 ${isWinner1 ? 'bg-purple-500/10' : 'bg-zinc-800/10'}`}
            style={{ width: `${perc1}%` }}
          />
          <View className="items-end">
            <View className="flex-row items-center">
              <Text className={`text-xl font-black italic ${isWinner1 ? 'text-purple-400' : isDraw ? 'text-white' : 'text-zinc-600'}`}>
                {val1}{unit}
              </Text>
              {isWinner1 && (
                <View className="ml-1 bg-purple-500 px-1 rounded">
                  <Text className="text-[7px] font-black text-white uppercase">Lead</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Divider */}
        <View className="w-8 items-center justify-center">
          <Text className="text-[8px] font-black italic text-zinc-700">VS</Text>
        </View>

        {/* Right Player */}
        <View className={`flex-1 h-full rounded-xl overflow-hidden border flex-row items-center justify-start px-3 ${isWinner2 ? 'border-purple-500/30 bg-purple-500/5' : 'border-zinc-800/50 bg-zinc-900/20'}`}>
          {/* Fill */}
          <View 
            className={`absolute left-0 top-0 bottom-0 ${isWinner2 ? 'bg-purple-500/10' : 'bg-zinc-800/10'}`}
            style={{ width: `${perc2}%` }}
          />
          <View className="items-start">
            <View className="flex-row items-center">
              {isWinner2 && (
                <View className="mr-1 bg-purple-500 px-1 rounded">
                  <Text className="text-[7px] font-black text-white uppercase">Lead</Text>
                </View>
              )}
              <Text className={`text-xl font-black italic ${isWinner2 ? 'text-purple-400' : isDraw ? 'text-white' : 'text-zinc-600'}`}>
                {val2}{unit}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
