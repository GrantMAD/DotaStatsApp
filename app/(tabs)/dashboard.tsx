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
import { LinearGradient } from 'expo-linear-gradient';
import { useSteamAuth } from '../../src/hooks/useSteamAuth';
import { useSupabaseAuth } from '../../src/context/SupabaseAuthContext';
import { MatchOverviewModal } from '../../src/components/MatchOverviewModal';
import { PlayerOverviewContent } from '../../src/components/PlayerOverviewContent';
import { usePlayerProfile, usePlayerWinLoss, useRecentMatches } from '../../src/hooks/useOpenDota';
import Skeleton, { PlayerProfileSkeleton } from '../../src/components/Skeleton';
import GlassHeader from '../../src/components/GlassHeader';
import GlassModal from '../../src/components/GlassModal';
import MeshGradient from '../../src/components/MeshGradient';


export default function DashboardScreen() {
  const { steamAccountId } = useSupabaseAuth();
  const { login, isLoading: steamLoading } = useSteamAuth();
  const accountId = steamAccountId;
  
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

  if (loading && !profile && accountId) {
    return <PlayerProfileSkeleton />;
  }

  return (
    <LinearGradient 
      colors={['#1a1a2e', '#121212']} 
      style={{ flex: 1 }}
    >
      <GlassHeader title="My Dashboard" />
      
      {!accountId ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Ionicons name="link" size={64} color="#eab308" style={{ marginBottom: 16 }} />
          <Text style={{ color: '#fff', fontSize: 24, fontWeight: '800', marginBottom: 8, textAlign: 'center' }}>
            Link Steam Account
          </Text>
          <Text style={{ color: '#888', fontSize: 16, marginBottom: 32, textAlign: 'center' }}>
            Connect your Steam account to view your Dota 2 statistics and match history.
          </Text>
          <TouchableOpacity 
            onPress={login}
            disabled={steamLoading}
            style={{ 
              backgroundColor: '#8b5cf6', 
              flexDirection: 'row', 
              alignItems: 'center', 
              paddingVertical: 14, 
              paddingHorizontal: 24, 
              borderRadius: 12 
            }}
          >
            {steamLoading ? <ActivityIndicator color="#fff" /> : (
              <>
                <Ionicons name="logo-steam" size={20} color="#fff" style={{ marginRight: 10 }} />
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>Sign in with Steam</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        <PlayerOverviewContent
          accountId={accountId!}
          profile={profile || null}
          wl={wl || null}
          matches={matches}
          onMatchPress={handleMatchPress}
          onRefresh={onRefresh}
          refreshing={isRefreshing}
        />
      )}

      {/* Match Details Modal */}
      <MatchOverviewModal 
        visible={modalVisible} 
        matchId={selectedMatchId} 
        onClose={() => setModalVisible(false)} 
        onPushPlayer={(id) => handlePlayerPress(Number(id))}
      />

      {/* Player Detail Modal */}
      {/* Player Profile Drill-down Modal */}
      <GlassModal
        visible={playerModalVisible}
        onClose={() => setPlayerModalVisible(false)}
      >
            {playerDetailsLoading ? (
              <PlayerProfileSkeleton />
            ) : selectedPlayerProfile ? (
              <View className="flex-1">
                <View className="p-4 border-b border-zinc-800 flex-row justify-between items-center bg-[#1e1e1e]">
                   <Text className="text-white font-outfit-bold ml-2">Player Details</Text>
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
            ) : (
              <View className="flex-1 justify-center items-center"><Text className="text-red-500">Failed to load data.</Text></View>
            )}
      </GlassModal>
    </LinearGradient>
  );
}
