import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { openDotaApi, HeroStats } from '../../services/opendota';
import { getHeroImageUrl } from '../../services/constants';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInRight, FadeInUp } from 'react-native-reanimated';
import HeroDetailModal from '../HeroDetailModal';

interface AnalyzedHero {
  id: number;
  name: string;
  proContestRate: number;
  pubPickRate: number;
  proWinRate: number;
  pubWinRate: number;
  gap: number;
  winGap: number;
}

export function ProVsPubMeta() {
  const [stats, setStats] = useState<HeroStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHero, setSelectedHero] = useState<HeroStats | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const data = await openDotaApi.getHeroStats();
        setStats(data);
      } catch (error) {
        console.error('Error fetching hero stats for pro vs pub:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const analyzedData = useMemo(() => {
    if (stats.length === 0) return { proFavorites: [], pubStompers: [], skillCap: [] };

    const totalPubPicks = stats.reduce((acc, h) => acc + (h.pub_pick || 0), 0);
    const totalProContest = stats.reduce((acc, h) => acc + (h.pro_pick || 0) + (h.pro_ban || 0), 0);

    const processed: AnalyzedHero[] = stats.map(hero => {
      const proContest = (hero.pro_pick || 0) + (hero.pro_ban || 0);
      const pubPickRate = totalPubPicks > 0 ? (hero.pub_pick / totalPubPicks) * 100 : 0;
      const proContestRate = totalProContest > 0 ? (proContest / totalProContest) * 100 : 0;
      const proWinRate = hero.pro_pick > 0 ? (hero.pro_win / hero.pro_pick) * 100 : 0;
      const pubWinRate = hero.pub_pick > 0 ? (hero.pub_win / hero.pub_pick) * 100 : 0;

      return {
        id: hero.id,
        name: hero.localized_name,
        proContestRate,
        pubPickRate,
        proWinRate,
        pubWinRate,
        gap: proContestRate - pubPickRate,
        winGap: proWinRate - pubWinRate,
      };
    });

    return {
      proFavorites: [...processed]
        .sort((a, b) => b.gap - a.gap)
        .slice(0, 5),
      pubStompers: [...processed]
        .filter(h => h.pubWinRate > 52 && h.proContestRate < 0.5)
        .sort((a, b) => b.pubWinRate - a.pubWinRate)
        .slice(0, 5),
      skillCap: [...processed]
        .filter(h => h.proContestRate > 0.8)
        .sort((a, b) => b.winGap - a.winGap)
        .slice(0, 5)
    };
  }, [stats]);

  const handleHeroPress = (heroId: number) => {
    const hero = stats.find(h => h.id === heroId);
    if (hero) setSelectedHero(hero);
  };

  if (loading) {
    return (
      <View className="py-20 items-center justify-center">
        <ActivityIndicator color="#a855f7" size="large" />
        <Text className="text-gray-500 font-outfit mt-4">Analyzing professional trends...</Text>
      </View>
    );
  }

  return (
    <View className="space-y-6 px-4">
      {/* Intro Header */}
      <Animated.View 
        entering={FadeInUp}
        className="bg-purple-500/10 border-l-4 border-l-purple-500 rounded-2xl p-4 flex-row items-center gap-4"
      >
        <View className="w-12 h-12 rounded-xl bg-purple-500/20 items-center justify-center">
          <Ionicons name="git-compare" size={24} color="#a855f7" />
        </View>
        <View className="flex-1">
          <Text className="text-white font-outfit-black text-sm uppercase">The Professional Gap</Text>
          <Text className="text-gray-400 text-[10px] leading-tight mt-1">
            Comparing Pro contest rates (Pick+Ban) vs. Public picks to identify heroes pros value that pubs ignore.
          </Text>
        </View>
      </Animated.View>

      {/* Pro Favorites */}
      <Section 
        title="Pro Favorites" 
        icon="trophy" 
        iconColor="#f59e0b"
        subtitle="High Pro presence, low Public popularity"
        data={analyzedData.proFavorites}
        onHeroPress={handleHeroPress}
        renderRight={(hero) => (
          <View className="items-end">
            <Text className="text-xs font-outfit-black text-purple-400">+{hero.gap.toFixed(1)}%</Text>
            <Text className="text-[8px] text-gray-500 uppercase">Gap</Text>
          </View>
        )}
      />

      {/* Pub Stompers */}
      <Section 
        title="Pub Stompers" 
        icon="people" 
        iconColor="#818cf8"
        subtitle="High Win Rate in Pubs, ignored by Pros"
        data={analyzedData.pubStompers}
        onHeroPress={handleHeroPress}
        renderRight={(hero) => (
          <View className="items-end">
            <Text className="text-xs font-outfit-black text-emerald-400">IGNR</Text>
            <Text className="text-[8px] text-gray-500 uppercase">By Pros</Text>
          </View>
        )}
      />

      {/* Efficiency Gap */}
      <Section 
        title="Efficiency Gap" 
        icon="trending-up" 
        iconColor="#10b981"
        subtitle="Perform significantly better in Pro games"
        data={analyzedData.skillCap}
        onHeroPress={handleHeroPress}
        renderRight={(hero) => (
          <View className="items-end">
            <View className="flex-row items-center gap-1">
              <Ionicons name="arrow-up" size={10} color="#10b981" />
              <Text className="text-xs font-outfit-black text-emerald-400">{Math.abs(hero.winGap).toFixed(1)}%</Text>
            </View>
            <Text className="text-[8px] text-gray-500 uppercase">Advantage</Text>
          </View>
        )}
      />

      {/* Footer Insight */}
      <View className="bg-zinc-900/40 rounded-2xl p-4 border border-white/5 flex-row items-center gap-3">
        <Ionicons name="bulb-outline" size={18} color="#6b7280" />
        <Text className="text-[10px] text-gray-500 italic flex-1">
          Tip: Heroes in the "Efficiency Gap" often require team coordination that is rarely found in solo queue.
        </Text>
      </View>

      <HeroDetailModal 
        hero={selectedHero}
        visible={!!selectedHero}
        onClose={() => setSelectedHero(null)}
      />
    </View>
  );
}

interface SectionProps {
  title: string;
  icon: any;
  iconColor: string;
  subtitle: string;
  data: AnalyzedHero[];
  onHeroPress: (id: number) => void;
  renderRight: (hero: AnalyzedHero) => React.ReactNode;
}

function Section({ title, icon, iconColor, subtitle, data, onHeroPress, renderRight }: SectionProps) {
  return (
    <View className="bg-zinc-900/40 rounded-[32px] border border-white/5 overflow-hidden">
      <View className="p-4 border-b border-white/5 flex-row items-center justify-between bg-white/5">
        <View className="flex-row items-center">
          <View className="p-2 rounded-xl mr-3" style={{ backgroundColor: `${iconColor}20` }}>
            <Ionicons name={icon} size={18} color={iconColor} />
          </View>
          <View>
            <Text className="text-white font-outfit-black text-sm uppercase">{title}</Text>
            <Text className="text-gray-500 text-[9px] uppercase tracking-wider">{subtitle}</Text>
          </View>
        </View>
      </View>

      <View className="p-2">
        {data.map((hero, index) => (
          <Animated.View
            key={hero.id}
            entering={FadeInRight.delay(index * 50)}
          >
            <TouchableOpacity 
              onPress={() => onHeroPress(hero.id)}
              className="flex-row items-center p-3 mb-1 bg-white/5 rounded-2xl border border-white/5"
            >
              <View className="w-10 h-10 rounded-lg overflow-hidden border border-white/10 shrink-0">
                <Image
                  source={{ uri: getHeroImageUrl(hero.id) }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              </View>

              <View className="flex-1 ml-3 justify-center">
                <Text className="text-white font-outfit-black text-xs uppercase tracking-tight">
                  {hero.name}
                </Text>
                <View className="flex-row items-center gap-2 mt-0.5">
                  <Text className="text-gray-500 text-[8px] uppercase">
                    {title === 'Pub Stompers' 
                      ? `WR: ${hero.pubWinRate.toFixed(1)}%`
                      : title === 'Efficiency Gap'
                        ? `Pro Win: ${hero.proWinRate.toFixed(1)}%`
                        : `Pro: ${hero.proContestRate.toFixed(1)}% · Pub: ${hero.pubPickRate.toFixed(1)}%`
                    }
                  </Text>
                </View>
              </View>

              {renderRight(hero)}
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>
    </View>
  );
}
