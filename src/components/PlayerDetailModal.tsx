import React, { useState, useEffect } from 'react';
import {
  View, Text, Modal, ActivityIndicator, TouchableOpacity, Pressable
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { 
  getPlayerProfile, getPlayerWinLoss, getRecentMatches, 
  PlayerProfile, WinLossStats, RecentMatch 
} from '../services/opendota';
import { PlayerOverviewContent } from './PlayerOverviewContent';

interface PlayerDetailModalProps {
  visible: boolean;
  accountId: number | null;
  onClose: () => void;
  onMatchPress: (matchId: number) => void;
}

export default function PlayerDetailModal({
  visible, accountId, onClose, onMatchPress
}: PlayerDetailModalProps) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{ profile: PlayerProfile | null; wl: WinLossStats | null; matches: RecentMatch[] } | null>(null);

  useEffect(() => {
    if (visible && accountId) {
      fetchPlayerData(accountId);
    } else {
      setData(null);
    }
  }, [visible, accountId]);

  const fetchPlayerData = async (id: number) => {
    setLoading(true);
    try {
      const [profile, wl, matches] = await Promise.all([
        getPlayerProfile(id),
        getPlayerWinLoss(id),
        getRecentMatches(id, 10)
      ]);
      setData({ profile, wl, matches });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/60 justify-end" onPress={onClose}>
        <Pressable className="bg-[#1e1e1e] h-[92%] rounded-t-3xl overflow-hidden" onPress={(e) => e.stopPropagation()}>
          {loading ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#8b5cf6" />
              <Text className="text-gray-400 mt-4">Fetching player stats...</Text>
            </View>
          ) : data ? (
            <View className="flex-1">
              {/* Header */}
              <View className="p-4 border-b border-zinc-800 flex-row justify-between items-center bg-[#1e1e1e]">
                 <Text className="text-white font-bold ml-2">Player Details</Text>
                 <TouchableOpacity onPress={onClose} className="p-2">
                   <Ionicons name="close" size={28} color="white" />
                 </TouchableOpacity>
              </View>
              
              <PlayerOverviewContent
                accountId={accountId!}
                profile={data.profile}
                wl={data.wl}
                matches={data.matches}
                onMatchPress={onMatchPress}
                onRefresh={() => fetchPlayerData(accountId!)}
                refreshing={loading}
              />
            </View>
          ) : (
            <View className="flex-1 justify-center items-center">
              <Text className="text-red-500">Failed to load data.</Text>
              <TouchableOpacity onPress={onClose} className="mt-4 bg-zinc-800 px-6 py-2 rounded-lg">
                <Text className="text-white font-bold">Close</Text>
              </TouchableOpacity>
            </View>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
