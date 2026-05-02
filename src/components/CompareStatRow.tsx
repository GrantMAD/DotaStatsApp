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

  return (
    <View className="mb-4">
      <Text className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2 text-center">
        {label}
      </Text>
      <View className="flex-row items-center justify-between px-2">
        <View className={`flex-1 items-center p-3 rounded-xl ${isWinner1 ? 'bg-purple-500/20 border border-purple-500/40' : 'bg-zinc-800/50'}`}>
          <Text className={`text-xl font-black ${isWinner1 ? 'text-purple-400' : 'text-white'}`}>
            {val1}{unit}
          </Text>
          {isWinner1 && (
             <View className="absolute -top-2 -left-1 bg-purple-500 px-1.5 py-0.5 rounded-full">
               <Text className="text-[8px] font-black text-white">LEAD</Text>
             </View>
          )}
        </View>

        <View className="px-4">
          <Text className="text-zinc-600 font-black italic">VS</Text>
        </View>

        <View className={`flex-1 items-center p-3 rounded-xl ${isWinner2 ? 'bg-purple-500/20 border border-purple-500/40' : 'bg-zinc-800/50'}`}>
          <Text className={`text-xl font-black ${isWinner2 ? 'text-purple-400' : 'text-white'}`}>
            {val2}{unit}
          </Text>
          {isWinner2 && (
             <View className="absolute -top-2 -right-1 bg-purple-500 px-1.5 py-0.5 rounded-full">
               <Text className="text-[8px] font-black text-white">LEAD</Text>
             </View>
          )}
        </View>
      </View>
    </View>
  );
}
