import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import GlassHeader from '../../src/components/GlassHeader';
import { useSupabaseAuth } from '../../src/context/SupabaseAuthContext';
import { useMenu } from './_layout';
import { supabase } from '../../src/services/supabase';
import Toast from 'react-native-toast-message';

export default function SettingsScreen() {
  const { user, session, steamAccountId, signOut, refreshProfile } = useSupabaseAuth();
  const { setMenuVisible } = useMenu();
  const [loading, setLoading] = useState(false);

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
      
      <View style={{ padding: 20 }}>
        <View style={{ paddingBottom: 16 }}>
          <Text style={{ color: '#fff', fontSize: 28, fontFamily: 'Outfit_900Black', marginBottom: 4 }}>
            Settings
          </Text>
          <Text style={{ color: '#9ca3af', fontSize: 14, fontFamily: 'Outfit_400Regular' }}>
            Manage your account preferences and connected services.
          </Text>
        </View>

        <Text style={{ color: '#888', fontSize: 14, fontWeight: '600', marginBottom: 8, textTransform: 'uppercase', marginTop: 16 }}>
          Account
        </Text>
        <View style={{ backgroundColor: '#1e1e2e', borderRadius: 12, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: '#2a2a3e' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <Ionicons name="mail" size={20} color="#8b5cf6" style={{ marginRight: 12 }} />
            <Text style={{ color: '#fff', fontSize: 16 }}>{user?.email}</Text>
          </View>
          
          <View style={{ height: 1, backgroundColor: '#2a2a3e', marginBottom: 16 }} />
          
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="logo-steam" size={20} color={steamAccountId ? "#22c55e" : "#555"} style={{ marginRight: 12 }} />
              <View>
                <Text style={{ color: '#fff', fontSize: 16 }}>Steam Connection</Text>
                <Text style={{ color: steamAccountId ? '#22c55e' : '#888', fontSize: 12, marginTop: 2 }}>
                  {steamAccountId ? 'Linked' : 'Not Linked'}
                </Text>
              </View>
            </View>
            
            {steamAccountId && (
              <TouchableOpacity 
                onPress={handleUnlinkSteam}
                disabled={loading}
                style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 }}
              >
                {loading ? <ActivityIndicator size="small" color="#ef4444" /> : <Text style={{ color: '#ef4444', fontWeight: '600' }}>Unlink</Text>}
              </TouchableOpacity>
            )}
          </View>
        </View>

        <TouchableOpacity 
          onPress={handleSignOut}
          style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', paddingVertical: 16, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.3)' }}
        >
          <Text style={{ color: '#ef4444', fontSize: 16, fontWeight: '700' }}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}
