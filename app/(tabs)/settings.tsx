import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator, Switch, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import GlassHeader from '../../src/components/GlassHeader';
import GlassModal from '../../src/components/GlassModal';
import { useSupabaseAuth } from '../../src/context/SupabaseAuthContext';
import { useMenu } from './_layout';
import { supabase } from '../../src/services/supabase';
import Toast from 'react-native-toast-message';

interface SettingsItemProps {
  icon: string;
  label: string;
  value?: string | boolean;
  onPress?: (val?: any) => void;
  type?: 'toggle' | 'link' | 'text' | 'danger';
  color?: string;
}

const SettingsItem = ({ icon, label, value, onPress, type = 'link', color = '#8b5cf6' }: SettingsItemProps) => (
  <TouchableOpacity 
    onPress={onPress}
    disabled={!onPress}
    style={{ 
      flexDirection: 'row', 
      alignItems: 'center', 
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: '#2a2a3e'
    }}
  >
    <View style={{ 
      width: 36, 
      height: 36, 
      borderRadius: 10, 
      backgroundColor: type === 'danger' ? 'rgba(239, 68, 68, 0.1)' : `${color}20`, 
      alignItems: 'center', 
      justifyContent: 'center',
      marginRight: 16
    }}>
      <Ionicons name={icon as any} size={20} color={type === 'danger' ? '#ef4444' : color} />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={{ color: type === 'danger' ? '#ef4444' : '#fff', fontSize: 16, fontFamily: 'Outfit_600SemiBold' }}>{label}</Text>
    </View>
    {type === 'toggle' ? (
      <Switch 
        value={value as boolean} 
        onValueChange={(val) => onPress && onPress(val)}
        trackColor={{ false: '#2a2a3e', true: '#8b5cf6' }}
        thumbColor="#fff"
      />
    ) : type === 'text' ? (
      <Text style={{ color: '#888', fontSize: 14, fontFamily: 'Outfit_400Regular' }}>{value}</Text>
    ) : (
      <Ionicons name="chevron-forward" size={18} color="#4b5563" />
    )}
  </TouchableOpacity>
);

const SectionLabel = ({ label }: { label: string }) => (
  <Text style={{ 
    color: '#555', 
    fontSize: 12, 
    fontFamily: 'Outfit_700Bold', 
    marginBottom: 8, 
    textTransform: 'uppercase', 
    marginTop: 24,
    marginLeft: 4,
    letterSpacing: 1
  }}>
    {label}
  </Text>
);

export default function SettingsScreen() {
  const { 
    user, 
    session, 
    steamAccountId, 
    matchLimit, 
    notificationsEnabled,
    updateNotificationPrefs,
    signOut, 
    refreshProfile 
  } = useSupabaseAuth();
  const { setMenuVisible } = useMenu();
  const [loading, setLoading] = useState(false);
  const [limitModalVisible, setLimitModalVisible] = useState(false);

  const handleUnlinkSteam = async () => {
    if (!user) return;
    
    Alert.alert(
      "Unlink Steam Account",
      "Are you sure you want to unlink your Steam account? You will need to link it again to view your stats.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Unlink", 
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              const { error } = await supabase
                .from('users')
                .update({ steam_account_id: null, steam_name: null })
                .eq('id', user.id);
                
              if (error) {
                Toast.show({
                  type: 'error',
                  text1: 'Error',
                  text2: 'Failed to unlink account.'
                });
              } else {
                await refreshProfile();
                Toast.show({
                  type: 'success',
                  text1: 'Success',
                  text2: 'Steam account unlinked successfully.'
                });
              }
            } catch (e) {
              console.error(e);
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleSignOut = async () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Sign Out", 
          style: "destructive",
          onPress: async () => {
            await signOut();
          }
        }
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "This action is permanent and cannot be undone. All your follows, friendships, and data will be deleted.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete My Data", 
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Final Warning",
              "Are you absolutely sure?",
              [
                { text: "Cancel", style: "cancel" },
                { text: "Yes, Delete Everything", style: "destructive", onPress: () => {
                  Toast.show({ type: 'info', text1: 'Account deletion requested' });
                }}
              ]
            );
          }
        }
      ]
    );
  };

  const handleToggleNotifications = async () => {
    const newState = !notificationsEnabled;
    
    setLoading(true);
    try {
      if (newState) {
        // Turning ON: Request permissions and get token
        const { registerForPushNotificationsAsync } = await import('../../src/services/notifications');
        const token = await registerForPushNotificationsAsync();
        
        if (token) {
          await updateNotificationPrefs(true, token);
          Toast.show({
            type: 'success',
            text1: 'Notifications Enabled',
            text2: 'You will now receive push alerts.'
          });
        }
      } else {
        // Turning OFF: Just update the flag
        await updateNotificationPrefs(false);
        Toast.show({
          type: 'info',
          text1: 'Notifications Disabled',
          text2: 'You will no longer receive push alerts.'
        });
      }
    } catch (e: any) {
      console.error(e);
      Toast.show({
        type: 'error',
        text1: 'Update Failed',
        text2: e.message || 'Could not update preferences'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#1a1a2e', '#121212']} style={{ flex: 1 }}>
      <GlassHeader 
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
      />
      
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
        <View style={{ paddingBottom: 16 }}>
          <Text style={{ color: '#fff', fontSize: 32, fontFamily: 'Outfit_900Black', marginBottom: 4 }}>
            Settings
          </Text>
          <Text style={{ color: '#9ca3af', fontSize: 14, fontFamily: 'Outfit_400Regular' }}>
            Manage your account and app preferences.
          </Text>
        </View>

        <SectionLabel label="Account" />
        <View style={{ backgroundColor: '#1e1e2e', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#2a2a3e' }}>
          <SettingsItem 
            icon="mail" 
            label="Email" 
            value={user?.email || 'Not logged in'} 
            type="text" 
          />
          <SettingsItem 
            icon="logo-steam" 
            label="Steam Connection" 
            value={steamAccountId ? 'Linked' : 'Not Linked'}
            color={steamAccountId ? '#22c55e' : '#555'}
            onPress={steamAccountId ? handleUnlinkSteam : undefined}
          />
        </View>

        <SectionLabel label="Preferences" />
        <View style={{ backgroundColor: '#1e1e2e', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#2a2a3e' }}>
          <SettingsItem 
            icon="list" 
            label="Match History Limit" 
            value={`${matchLimit} matches`}
            type="text"
            onPress={() => setLimitModalVisible(true)}
          />
          <SettingsItem 
            icon="notifications" 
            label="Push Notifications" 
            value={notificationsEnabled}
            type="toggle"
            onPress={handleToggleNotifications}
          />
        </View>

        <SectionLabel label="Support" />
        <View style={{ backgroundColor: '#1e1e2e', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#2a2a3e' }}>
          <SettingsItem 
            icon="information-circle" 
            label="App Version" 
            value="v1.0.4-beta"
            type="text"
          />
          <SettingsItem 
            icon="document-text" 
            label="What's New" 
            onPress={() => Alert.alert("Changelog", "• Added Pro Bans expansion\n• Friends list search\n• Improved Settings layout\n• Performance fixes")}
          />
        </View>

        <SectionLabel label="Danger Zone" />
        <View style={{ backgroundColor: '#1e1e2e', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#2a2a3e' }}>
          <SettingsItem 
            icon="log-out" 
            label="Sign Out" 
            onPress={handleSignOut}
          />
          <SettingsItem 
            icon="trash" 
            label="Delete Account" 
            type="danger"
            onPress={handleDeleteAccount}
          />
        </View>
        
        <View style={{ alignItems: 'center', marginTop: 40 }}>
          <Text style={{ color: '#333', fontSize: 10, fontFamily: 'Outfit_700Bold', letterSpacing: 2 }}>
            MADE BY DOTA FANS FOR DOTA FANS
          </Text>
        </View>
      </ScrollView>

      <GlassModal
        visible={limitModalVisible}
        onClose={() => setLimitModalVisible(false)}
      >
        <View style={{ padding: 24 }}>
          <Text style={{ color: '#fff', fontSize: 24, fontFamily: 'Outfit_900Black', marginBottom: 8 }}>
            Match Limit
          </Text>
          <Text style={{ color: '#9ca3af', fontSize: 14, fontFamily: 'Outfit_400Regular', marginBottom: 24 }}>
            Select how many matches to load on your profile.
          </Text>
          
          {[10, 20, 50].map((option) => (
            <TouchableOpacity
              key={option}
              onPress={async () => {
                if (!user) return;
                setLimitModalVisible(false);
                try {
                  const { error } = await supabase
                    .from('users')
                    .update({ match_limit: option })
                    .eq('id', user.id);

                  if (error) throw error;
                  await refreshProfile();
                  Toast.show({ type: 'success', text1: `History limit set to ${option}` });
                } catch (e) {
                  console.error(e);
                  Toast.show({ type: 'error', text1: 'Failed to update preference' });
                }
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 16,
                backgroundColor: matchLimit === option ? '#8b5cf620' : '#1e1e2e',
                borderRadius: 12,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: matchLimit === option ? '#8b5cf6' : '#2a2a3e',
              }}
            >
              <Text style={{ 
                color: matchLimit === option ? '#fff' : '#888', 
                fontSize: 16, 
                fontFamily: 'Outfit_600SemiBold',
                flex: 1
              }}>
                {option} Matches
              </Text>
              {matchLimit === option && (
                <Ionicons name="checkmark-circle" size={24} color="#8b5cf6" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </GlassModal>
    </LinearGradient>
  );
}
