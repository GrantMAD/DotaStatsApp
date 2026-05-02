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
import { usePlayerProfile, usePlayerWinLoss } from '../../src/hooks/useOpenDota';
import { useFriends } from '../../src/hooks/useFriends';
import { useRouter } from 'expo-router';
import Skeleton, { PlayerProfileSkeleton } from '../../src/components/Skeleton';
import GlassHeader from '../../src/components/GlassHeader';
import GlassModal from '../../src/components/GlassModal';
import MeshGradient from '../../src/components/MeshGradient';
import NotificationBell from '../../src/components/NotificationBell';
import { useMenu } from './_layout';
import { useModals } from '../../src/context/ModalContext';


export default function ProfileScreen() {
  const router = useRouter();
  const { steamAccountId, session, matchLimit } = useSupabaseAuth();
  const { login, isLoading: steamLoading } = useSteamAuth();
  const { setMenuVisible } = useMenu();
  const { pushModal } = useModals();
  const accountId = steamAccountId ? steamAccountId.toString() : null;

  // Friends & Following Data
  const { friends, following } = useFriends();
  
  // Main Profile Queries
  const { data: profile, isLoading: profileLoading, refetch: refetchProfile } = usePlayerProfile(accountId);
  const { data: wl, isLoading: wlLoading, refetch: refetchWl } = usePlayerWinLoss(accountId);

  const isDataLoading = profileLoading || wlLoading;
  const [isRefreshing, setIsRefreshing] = useState(false);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([
      refetchProfile(),
      refetchWl()
    ]);
    setIsRefreshing(false);
  };

  const handleMatchPress = (matchId: number) => {
    pushModal('match', matchId);
  };

  const handlePlayerPress = (pAccountId: number | null) => {
    if (!pAccountId) return;
    pushModal('player', pAccountId);
  };

  if (isDataLoading && !profile && accountId) {
    return <PlayerProfileSkeleton />;
  }

  return (
    <LinearGradient 
      colors={['#1a1a2e', '#121212']} 
      style={{ flex: 1 }}
    >
      <GlassHeader 
        title="My Profile" 
        leftComponent={
          session ? (
            <TouchableOpacity 
              onPress={() => setMenuVisible(true)}
              style={{ padding: 8, marginLeft: -8 }}
            >
              <Ionicons name="menu" size={28} color="white" />
            </TouchableOpacity>
          ) : undefined
        }
        rightComponent={<NotificationBell />}
      />
      
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
          onMatchPress={handleMatchPress}
          onRefresh={onRefresh}
          refreshing={isRefreshing}
          isCurrentUser={true}
          friendsCount={friends.length}
          followingCount={following.length}
          onStatsPress={() => router.push('/friends')}
          onComparePress={() => router.push('/compare?p1=' + accountId)}
        />
      )}
    </LinearGradient>
  );
}
