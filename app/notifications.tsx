import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useNotifications, AppNotification } from '../src/hooks/useFriends';
import GlassHeader from '../src/components/GlassHeader';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function NotificationsScreen() {
  const router = useRouter();
  const { notifications, markAllAsRead, handleFriendRequest } = useNotifications();

  const renderItem = ({ item, index }: { item: AppNotification; index: number }) => {
    return (
      <Animated.View
        entering={FadeInDown.delay(Math.min(index, 8) * 50).springify()}
        style={{          backgroundColor: '#1E1E2E',
          padding: 16,
          marginHorizontal: 16,
          marginBottom: 12,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: item.is_read ? '#2a2a3e' : '#8b5cf6',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        <View className="flex-row items-center">
          <View 
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12,
              backgroundColor: item.is_read ? '#1a1a2e' : 'rgba(139, 92, 246, 0.15)',
            }}
          >
            <Ionicons 
              name={item.type === 'friend_request' ? 'person-add' : 'notifications'} 
              size={22} 
              color={item.is_read ? '#6b7280' : '#8b5cf6'} 
            />
          </View>
          <View className="flex-1">
            <Text 
              style={{
                color: '#fff',
                fontFamily: 'Outfit_700Bold',
                fontSize: 16,
                marginBottom: 2,
              }}
            >
              {item.message}
            </Text>
            <Text 
              style={{
                color: '#6b7280',
                fontSize: 12,
                fontFamily: 'Outfit_400Regular',
              }}
            >
              {new Date(item.created_at).toLocaleString()}
            </Text>
          </View>
        </View>

        {item.type === 'friend_request' && !item.is_read && (
          <View className="flex-row mt-4 space-x-3">
            <TouchableOpacity 
              onPress={() => handleFriendRequest(item, true)}
              style={{
                flex: 1,
                backgroundColor: '#8b5cf6',
                paddingVertical: 10,
                borderRadius: 10,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#fff', fontFamily: 'Outfit_700Bold' }}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => handleFriendRequest(item, false)}
              style={{
                flex: 1,
                backgroundColor: '#2a2a3e',
                paddingVertical: 10,
                borderRadius: 10,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#fff', fontFamily: 'Outfit_700Bold' }}>Decline</Text>
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>
    );
  };

  return (
    <LinearGradient colors={['#0d0d1a', '#121212']} style={{ flex: 1 }}>
      <GlassHeader 
        onBackPress={() => router.back()}
        rightComponent={
          notifications.some(n => !n.is_read) ? (
            <TouchableOpacity 
              onPress={() => markAllAsRead()} 
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                backgroundColor: '#2a2a3e',
                borderRadius: 8,
              }}
            >
              <Text style={{ color: '#ccc', fontFamily: 'Outfit_600SemiBold', fontSize: 12 }}>Mark all read</Text>
            </TouchableOpacity>
          ) : undefined
        } 
      />
      
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={
          <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 }}>
            <Text style={{ color: '#fff', fontSize: 28, fontFamily: 'Outfit_900Black', marginBottom: 4 }}>
              Notifications
            </Text>
            <Text style={{ color: '#9ca3af', fontSize: 14, fontFamily: 'Outfit_400Regular' }}>
              Stay updated with friend requests and activity alerts.
            </Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 32 }}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center py-20 px-10">
            <View style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: '#1a1a2e',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20,
            }}>
              <Ionicons name="notifications-off-outline" size={48} color="#374151" />
            </View>
            <Text style={{ color: '#9ca3af', textAlign: 'center', fontFamily: 'Outfit_600SemiBold', fontSize: 18 }}>
              No notifications yet
            </Text>
            <Text style={{ color: '#6b7280', textAlign: 'center', marginTop: 8, fontFamily: 'Outfit_400Regular' }}>
              We'll notify you when something important happens.
            </Text>
          </View>
        }
      />
    </LinearGradient>
  );
}
