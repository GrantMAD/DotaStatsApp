import React from 'react';
import {
  View, Text, Modal, ActivityIndicator, TouchableOpacity, Pressable
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PlayerOverviewContent } from './PlayerOverviewContent';
import { usePlayerProfile, usePlayerWinLoss, useRecentMatches } from '../hooks/useOpenDota';

interface PlayerDetailModalProps {
  visible: boolean;
  accountId: number | string | null;
  onClose: () => void;
  onMatchPress: (matchId: number) => void;
}

export default function PlayerDetailModal({
  visible, accountId, onClose, onMatchPress
}: PlayerDetailModalProps) {
  const { data: profile, isLoading: profileLoading, refetch: refetchProfile } = usePlayerProfile(visible ? accountId : null);
  const { data: wl, isLoading: wlLoading, refetch: refetchWl } = usePlayerWinLoss(visible ? accountId : null);
  const { data: matches = [], isLoading: matchesLoading, refetch: refetchMatches } = useRecentMatches(visible ? accountId : null, 10);

  const loading = profileLoading || wlLoading || matchesLoading;
  const isPrivate = profile && !profile.last_match_time;

  const onRefresh = async () => {
    await Promise.all([
      refetchProfile(),
      refetchWl(),
      refetchMatches()
    ]);
  };

  if (!visible) return null;

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/60 justify-end" onPress={onClose}>
        <Pressable className="bg-[#1e1e1e] h-[92%] rounded-t-3xl overflow-hidden" onPress={(e) => e.stopPropagation()}>
          {loading && !profile ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#8b5cf6" />
              <Text className="text-gray-400 mt-4">Fetching player stats...</Text>
            </View>
          ) : profile ? (
            <View className="flex-1">
              {/* Header */}
              <View className="p-4 border-b border-zinc-800 flex-row justify-between items-center bg-[#1e1e1e]">
                 <Text className="text-white font-bold ml-2">Player Details</Text>
                 <TouchableOpacity onPress={onClose} className="p-2">
                   <Ionicons name="close" size={28} color="white" />
                 </TouchableOpacity>
              </View>
              
              <PlayerOverviewContent
                accountId={accountId!.toString()}
                profile={profile}
                wl={wl || null}
                matches={matches}
                onMatchPress={onMatchPress}
                onRefresh={onRefresh}
                refreshing={loading}
                isPrivate={!!isPrivate}
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
