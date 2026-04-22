import React, { useState } from 'react';
import { View, Text, TextInput, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../src/services/supabase';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignIn = async () => {
    if (!email || !password) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter both email and password.'
      });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      Toast.show({
        type: 'error',
        text1: 'Sign In Failed',
        text2: error.message
      });
      setLoading(false);
    } else {
      Toast.show({
        type: 'success',
        text1: 'Welcome Back!',
        text2: 'Successfully signed in.'
      });
      router.replace('/(tabs)/home');
    }
  };

  return (
    <LinearGradient colors={['#1a1a2e', '#121212']} style={{ flex: 1, padding: 24, justifyContent: 'center' }}>
      <TouchableOpacity onPress={() => router.back()} style={{ position: 'absolute', top: 50, left: 24 }}>
        <Ionicons name="arrow-back" size={28} color="#fff" />
      </TouchableOpacity>

      <Text style={{ fontSize: 32, color: '#fff', fontWeight: '800', marginBottom: 8 }}>Welcome Back</Text>
      <Text style={{ color: '#888', fontSize: 16, marginBottom: 32 }}>Sign in to continue to DotaApp.</Text>

      <View style={{ marginBottom: 16 }}>
        <Text style={{ color: '#aaa', marginBottom: 8, fontSize: 14, fontWeight: '600' }}>Email Address</Text>
        <TextInput
          style={{ backgroundColor: '#1e1e2e', color: '#fff', padding: 16, borderRadius: 10, borderWidth: 1, borderColor: '#2a2a3e' }}
          placeholder="Enter your email"
          placeholderTextColor="#555"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
      </View>

      <View style={{ marginBottom: 32 }}>
        <Text style={{ color: '#aaa', marginBottom: 8, fontSize: 14, fontWeight: '600' }}>Password</Text>
        <TextInput
          style={{ backgroundColor: '#1e1e2e', color: '#fff', padding: 16, borderRadius: 10, borderWidth: 1, borderColor: '#2a2a3e' }}
          placeholder="Enter your password"
          placeholderTextColor="#555"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
      </View>

      <TouchableOpacity
        onPress={handleSignIn}
        disabled={loading}
        style={{ backgroundColor: '#8b5cf6', padding: 16, borderRadius: 10, alignItems: 'center' }}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>Sign In</Text>}
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => router.replace('/sign-up')} style={{ marginTop: 20, alignItems: 'center' }}>
         <Text style={{ color: '#8b5cf6', fontSize: 14 }}>Don't have an account? Sign Up</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}
