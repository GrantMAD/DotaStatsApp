import React, { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { useSupabaseAuth } from '../src/context/SupabaseAuthContext';
import { View, ActivityIndicator } from 'react-native';

export default function IndexRedirect() {
  const { session, isLoading } = useSupabaseAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' }}>
        <ActivityIndicator size="large" color="#8b5cf6" />
      </View>
    );
  }

  if (session) {
    return <Redirect href="/(tabs)/home" />;
  }

  return <Redirect href="/welcome" />;
}
