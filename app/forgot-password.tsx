import React, { useState } from 'react';
import { View, Text, TextInput, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../src/services/supabase';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleResetPassword = async () => {
    if (!email) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter your email address.'
      });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'dotaapp://reset-password',
    });

    if (error) {
      Toast.show({
        type: 'error',
        text1: 'Request Failed',
        text2: error.message
      });
    } else {
      Toast.show({
        type: 'success',
        text1: 'Email Sent',
        text2: 'Check your inbox for the password reset link.'
      });
      router.back();
    }
    setLoading(false);
  };

  return (
    <LinearGradient colors={['#1a1a2e', '#121212']} style={{ flex: 1, padding: 24, justifyContent: 'center' }}>
      <TouchableOpacity onPress={() => router.back()} style={{ position: 'absolute', top: 50, left: 24 }}>
        <Ionicons name="arrow-back" size={28} color="#fff" />
      </TouchableOpacity>

      <Text style={{ fontSize: 32, color: '#fff', fontWeight: '800', marginBottom: 8 }}>Reset Password</Text>
      <Text style={{ color: '#888', fontSize: 16, marginBottom: 32 }}>Enter your email to receive a recovery link.</Text>

      <View style={{ marginBottom: 32 }}>
        <Text style={{ color: '#aaa', marginBottom: 8, fontSize: 14, fontWeight: '600' }}>Email Address</Text>
        <TextInput
          style={{ backgroundColor: '#1e1e2e', color: '#fff', padding: 16, borderRadius: 10, borderWidth: 1, borderColor: '#2a2a3e' }}
          placeholder="name@example.com"
          placeholderTextColor="#555"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
      </View>

      <TouchableOpacity
        onPress={handleResetPassword}
        disabled={loading}
        style={{ backgroundColor: '#8b5cf6', padding: 16, borderRadius: 10, alignItems: 'center' }}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>Send Recovery Link</Text>}
      </TouchableOpacity>
    </LinearGradient>
  );
}
