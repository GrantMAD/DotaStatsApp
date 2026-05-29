import React, { useState } from 'react';
import { View, Text, TextInput, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../src/services/supabase';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

export default function ResetPasswordScreen() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleUpdatePassword = async () => {
    if (!password || password.length < 6) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Password must be at least 6 characters.'
      });
      return;
    }

    if (password !== confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Passwords do not match.'
      });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      Toast.show({
        type: 'error',
        text1: 'Update Failed',
        text2: error.message
      });
    } else {
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Password has been updated successfully.'
      });
      router.replace('/(tabs)/home');
    }
    setLoading(false);
  };

  return (
    <LinearGradient colors={['#1a1a2e', '#121212']} style={{ flex: 1, padding: 24, justifyContent: 'center' }}>
      <Text style={{ fontSize: 32, color: '#fff', fontWeight: '800', marginBottom: 8 }}>New Password</Text>
      <Text style={{ color: '#888', fontSize: 16, marginBottom: 32 }}>Enter your new secure password.</Text>

      <View style={{ marginBottom: 16 }}>
        <Text style={{ color: '#aaa', marginBottom: 8, fontSize: 14, fontWeight: '600' }}>New Password</Text>
        <TextInput
          style={{ backgroundColor: '#1e1e2e', color: '#fff', padding: 16, borderRadius: 10, borderWidth: 1, borderColor: '#2a2a3e' }}
          placeholder="At least 6 characters"
          placeholderTextColor="#555"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
      </View>

      <View style={{ marginBottom: 32 }}>
        <Text style={{ color: '#aaa', marginBottom: 8, fontSize: 14, fontWeight: '600' }}>Confirm New Password</Text>
        <TextInput
          style={{ backgroundColor: '#1e1e2e', color: '#fff', padding: 16, borderRadius: 10, borderWidth: 1, borderColor: '#2a2a3e' }}
          placeholder="Confirm password"
          placeholderTextColor="#555"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
      </View>

      <TouchableOpacity
        onPress={handleUpdatePassword}
        disabled={loading}
        style={{ backgroundColor: '#8b5cf6', padding: 16, borderRadius: 10, alignItems: 'center' }}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>Update Password</Text>}
      </TouchableOpacity>
    </LinearGradient>
  );
}
