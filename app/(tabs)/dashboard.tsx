import React, { useEffect, useState } from 'react';
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
import { 
  getPlayerProfile, 
  getPlayerWinLoss, 
  getRecentMatches, 
  PlayerProfile, 
  WinLossStats, 
  RecentMatch
} from '../../src/services/opendota';
import { MatchOverviewModal } from '../../src/components/MatchOverviewModal';
import { PlayerOverviewContent } from '../../src/components/PlayerOverviewContent';

export default function DashboardScreen() {
  const { accountId } = useSteamAuth();
  
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [wl, setWl] = useState<WinLossStats | null>(null);
  const [matches, setMatches] = useState<RecentMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Match Details Modal State
  const [selectedMatchId, setSelectedMatchId] = useState<number | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Individual Player Detail State
  const [playerModalVisible, setPlayerModalVisible] = useState(false);
  const [playerDetailsLoading, setPlayerDetailsLoading] = useState(false);
  const [selectedPlayerProfile, setSelectedPlayerProfile] = useState<PlayerProfile | null>(null);
  const [selectedPlayerWL, setSelectedPlayerWL] = useState<WinLossStats | null>(null);
  const [selectedPlayerMatches, setSelectedPlayerMatches] = useState<RecentMatch[]>([]);

  const loadData = async () => {
    if (!accountId) return;
    try {
      const [profData, wlData, matchData] = await Promise.all([
        getPlayerProfile(accountId),
        getPlayerWinLoss(accountId),
        getRecentMatches(accountId)
      ]);
      setProfile(profData);
      setWl(wlData);
      setMatches(matchData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [accountId]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleMatchPress = (matchId: number) => {
    setSelectedMatchId(matchId);
    setModalVisible(true);
  };

  const handlePlayerPress = async (pAccountId: number | null) => {
    if (!pAccountId) return;
    setPlayerModalVisible(true);
    setPlayerDetailsLoading(true);
    try {
      const [pProfile, pWL, pMatches] = await Promise.all([
        getPlayerProfile(pAccountId.toString()),
        getPlayerWinLoss(pAccountId.toString()),
        getRecentMatches(pAccountId.toString(), 5)
      ]);
      setSelectedPlayerProfile(pProfile);
      setSelectedPlayerWL(pWL);
      setSelectedPlayerMatches(pMatches);
    } catch (e) {
      console.error(e);
    } finally {
      setPlayerDetailsLoading(false);
    }
  };

  if (loading) {
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
        profile={profile}
        wl={wl}
        matches={matches}
        onMatchPress={handleMatchPress}
        onRefresh={onRefresh}
        refreshing={refreshing}
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
                  wl={selectedPlayerWL}
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
