import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { usePlayerWordCloud } from '../hooks/useOpenDota';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface WordCloudProps {
  accountId: number;
}

const COLORS = [
  '#A855F7', // Purple
  '#EC4899', // Pink
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#6366F1', // Indigo
];

const STOP_WORDS = new Set(['the', 'and', 'for', 'but', 'not', 'you', 'all', 'any', 'can', 'had']);

export const WordCloud: React.FC<WordCloudProps> = ({ accountId }) => {
  const { data, isLoading, error } = usePlayerWordCloud(accountId);

  const processedWords = useMemo(() => {
    if (!data?.my_word_counts) return [];

    const words = Object.entries(data.my_word_counts)
      .filter(([word]) => word.length > 2 && !STOP_WORDS.has(word.toLowerCase()))
      .sort((a, b) => b[1] - a[1])
      .slice(0, 40);

    if (words.length === 0) return [];

    const maxCount = words[0][1];
    const minCount = words[words.length - 1][1];

    return words.map(([text, count], index) => {
      // Calculate font size - use a more dramatic scale
      // Ratio of current count to the most frequent word
      const ratio = count / maxCount;
      
      // We use a combination of linear and logarithmic for better visual balance
      // so that the most frequent word is clearly the largest (48px) 
      // and others scale down noticeably.
      const size = Math.max(10, Math.min(48, 10 + (ratio * 38)));
      
      return {
        text,
        count,
        size,
        color: COLORS[index % COLORS.length],
        delay: index * 40,
      };
    });
  }, [data]);

  const persona = useMemo(() => {
    if (!data?.my_word_counts) return null;

    const counts = data.my_word_counts;
    const totalWords = Object.values(counts).reduce((a, b) => a + b, 0);

    if (totalWords < 10) return { title: 'The Observer', icon: 'eye-outline', description: 'Rarely speaks in all-chat, prefers to let the play do the talking.' };

    const strategistWords = ['mid', 'top', 'bot', 'push', 'gank', 'ward', 'back', 'b', 'rs', 'rosh'];
    const sportsmanWords = ['gg', 'wp', 'glhf', 'gl', 'hf', 'ty', 'thanks'];
    const socialiteWords = ['haha', 'lol', 'lmao', 'xd', 'rofl'];

    let strategistCount = 0;
    let sportsmanCount = 0;
    let socialiteCount = 0;

    Object.entries(counts).forEach(([word, count]) => {
      const lower = word.toLowerCase();
      if (strategistWords.includes(lower)) strategistCount += count;
      if (sportsmanWords.includes(lower)) sportsmanCount += count;
      if (socialiteWords.includes(lower)) socialiteCount += count;
    });

    if (sportsmanCount > strategistCount && sportsmanCount > socialiteCount) {
      return { title: 'The Sportsman', icon: 'trophy-outline', description: 'Known for fair play and respect towards opponents.' };
    }
    if (strategistCount > sportsmanCount && strategistCount > socialiteCount) {
      return { title: 'The Strategist', icon: 'map-outline', description: 'Constantly coordinating with all-chat or calling objectives.' };
    }
    if (socialiteCount > sportsmanCount && socialiteCount > strategistCount) {
      return { title: 'The Socialite', icon: 'chatbubbles-outline', description: 'Brings humor and a friendly vibe to the battlefield.' };
    }

    return { title: 'The Passionate Competitor', icon: 'flame-outline', description: 'Deeply invested in the game, every word carries weight.' };
  }, [data]);

  if (isLoading) {
    return (
      <View className="p-6 items-center justify-center h-64">
        <Text className="text-gray-400">Analyzing chat history...</Text>
      </View>
    );
  }

  if (processedWords.length === 0) {
    return (
      <BlurView intensity={20} className="m-4 p-6 rounded-3xl overflow-hidden border border-white/10">
        <View className="items-center">
          <Ionicons name="chatbox-ellipses-outline" size={48} color="#6366F1" />
          <Text className="text-white text-lg font-bold mt-4">Quiet Atmosphere</Text>
          <Text className="text-gray-400 text-center mt-2">
            No significant all-chat history found for this player. They might be a silent warrior!
          </Text>
        </View>
      </BlurView>
    );
  }

  return (
    <View className="m-4">
      {/* Persona Card */}
      {persona && (
        <Animated.View entering={FadeInDown.duration(600)} style={{ marginBottom: 32 }}>
          <BlurView intensity={30} className="p-4 rounded-3xl overflow-hidden border border-white/20 bg-white/5">
            <View className="flex-row items-center mb-2">
              <View className="w-10 h-10 rounded-full bg-purple-500/20 items-center justify-center mr-3 border border-purple-500/30">
                <Ionicons name={persona.icon as any} size={20} color="#A855F7" />
              </View>
              <View>
                <Text className="text-purple-400 text-xs font-bold uppercase tracking-wider">Social Persona</Text>
                <Text className="text-white text-lg font-bold">{persona.title}</Text>
              </View>
            </View>
            <Text className="text-gray-300 text-sm leading-relaxed">{persona.description}</Text>
          </BlurView>
        </Animated.View>
      )}

      {/* Word Cloud Container */}
      <BlurView intensity={20} className="rounded-3xl overflow-hidden border border-white/10 bg-black/20" style={{ height: 350, marginTop: 16, paddingTop: 24 }}>
        <View className="flex-1 items-center justify-center relative">
          {processedWords.map((word, index) => {
            // Fermat's spiral (sunflower phyllotaxis packing)
            // This creates a much more uniform circular shape spreading from the center
            const angle = index * 2.39996; // Golden angle in radians
            
            // The radius scaling factor determines how tightly packed the words are.
            // We increase it slightly for larger indexes to give more room for smaller words.
            const radiusScale = 18 + (index * 0.2); 
            const radius = Math.sqrt(index) * radiusScale; 
            
            // Convert polar to cartesian
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;

            return (
              <Animated.View
                key={word.text}
                entering={FadeInDown.delay(word.delay).springify()}
                style={{ position: 'absolute' }}
              >
                <View
                  style={{
                    transform: [
                      { translateX: x },
                      { translateY: y }
                    ],
                  }}
                >
                  <Text
                  style={{
                    fontSize: word.size,
                    color: word.color,
                    fontWeight: word.size > 24 ? 'bold' : '500',
                    opacity: 0.8 + (word.size / 48) * 0.2,
                    textAlign: 'center',
                  }}
                >
                  {word.text}
                </Text>
                </View>
              </Animated.View>
            );
          })}
        </View>
        <View className="pb-4 items-center">
          <Text className="text-gray-500 text-[10px] uppercase tracking-widest">
            Source: All-Chat Match History
          </Text>
        </View>
      </BlurView>
    </View>
  );
};
