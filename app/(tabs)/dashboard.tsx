import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ActivityIndicator, 
  Modal, 
  Pressable,
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSteamAuth } from '../../src/hooks/useSteamAuth';
import { MatchOverviewModal } from '../../src/components/MatchOverviewModal';
import { PlayerOverviewContent } from '../../src/components/PlayerOverviewContent';
import { usePlayerProfile, usePlayerWinLoss, useRecentMatches } from '../../src/hooks/useOpenDota';

export default function DashboardScreen() {
  const { accountId } = useSteamAuth();
  
  // Main Dashboard Queries
  const { data: profile, isLoading: profileLoading, refetch: refetchProfile } = usePlayerProfile(accountId);
  const { data: wl, isLoading: wlLoading, refetch: refetchWl } = usePlayerWinLoss(accountId);
  const { data: matches = [], isLoading: matchesLoading, refetch: refetchMatches } = useRecentMatches(accountId);

  const loading = profileLoading || wlLoading || matchesLoading;
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Match Details Modal State
  const [selectedMatchId, setSelectedMatchId] = useState<number | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Individual Player Detail State
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);
  const [playerModalVisible, setPlayerModalVisible] = useState(false);

  // Queries for Player Detail Modal
  const { data: selectedPlayerProfile, isLoading: pProfileLoading } = usePlayerProfile(selectedPlayerId);
  const { data: selectedPlayerWL, isLoading: pWLLoading } = usePlayerWinLoss(selectedPlayerId);
  const { data: selectedPlayerMatches = [], isLoading: pMatchesLoading } = useRecentMatches(selectedPlayerId, 5);

  const playerDetailsLoading = pProfileLoading || pWLLoading || pMatchesLoading;

  const onRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([
      refetchProfile(),
      refetchWl(),
      refetchMatches()
    ]);
    setIsRefreshing(false);
  };

  const handleMatchPress = (matchId: number) => {
    setSelectedMatchId(matchId);
    setModalVisible(true);
  };

  const handlePlayerPress = (pAccountId: number | null) => {
    if (!pAccountId) return;
    setSelectedPlayerId(pAccountId);
    setPlayerModalVisible(true);
  };

  if (loading && !profile) {
    return (
      <View className="flex-1 bg-gamingDark justify-center items-center">
        <ActivityIndicator size="large" color="#8b5cf6" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gamingDark">
      <PlayerOverviewContent
        accountId={accountId!}
        profile={profile || null}
        wl={wl || null}
        matches={matches}
        onMatchPress={handleMatchPress}
        onRefresh={onRefresh}
        refreshing={isRefreshing}
      />

      {/* Match Details Modal */}
      <MatchOverviewModal 
        visible={modalVisible} 
        matchId={selectedMatchId} 
        onClose={() => setModalVisible(false)} 
        onPushPlayer={(id) => handlePlayerPress(Number(id))}
      />

      {/* Player Detail Modal */}
      <Modal visible={playerModalVisible} animationType="slide" transparent={true} onRequestClose={() => setPlayerModalVisible(false)}>
        <Pressable className="flex-1 bg-black/80 justify-end" onPress={() => setPlayerModalVisible(false)}>
          <Pressable className="bg-[#1e1e1e] h-[92%] rounded-t-3xl overflow-hidden" onPress={(e) => e.stopPropagation()}>
            {playerDetailsLoading ? (
              <View className="flex-1 justify-center items-center"><ActivityIndicator size="large" color="#8b5cf6" /><Text className="text-gray-400 mt-4">Loading player profile...</Text></View>
            ) : selectedPlayerProfile ? (
              <View className="flex-1">
                <View className="p-4 border-b border-zinc-800 flex-row justify-between items-center bg-[#1e1e1e]">
                   <Text className="text-white font-bold ml-2">Player Details</Text>
                   <TouchableOpacity onPress={() => setPlayerModalVisible(false)} className="p-2">
                     <Ionicons name="close" size={28} color="white" />
                   </TouchableOpacity>
                </View>
                <PlayerOverviewContent
                  accountId={selectedPlayerProfile.profile.account_id.toString()}
                  profile={selectedPlayerProfile}
                  wl={selectedPlayerWL || null}
                  matches={selectedPlayerMatches}
                  onMatchPress={(id) => {
                    setPlayerModalVisible(false);
                    handleMatchPress(id);
                  }}
                />
              </View>
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
