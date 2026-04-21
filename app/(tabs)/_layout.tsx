import { Tabs, Redirect, usePathname } from 'expo-router';
import { TouchableOpacity, View, Text, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSteamAuth } from '../../src/hooks/useSteamAuth';
import { useState } from 'react';

export default function TabsLayout() {
  const { logout, accountId, isLoading, login } = useSteamAuth(); // login is now available
  const [menuVisible, setMenuVisible] = useState(false);
  const pathname = usePathname();

  // If not logged in and trying to access a protected route, redirect to home
  if (!isLoading && !accountId && pathname !== '/search' && pathname !== '/home' && pathname !== '/pro') {
    return <Redirect href="/(tabs)/home" />;
  }

  return (
    <>
      <Tabs
        screenOptions={{
          headerStyle: {
            backgroundColor: '#121212',
            borderBottomWidth: 1,
            borderBottomColor: '#333',
          },
          headerTintColor: '#fff',
          tabBarStyle: {
            backgroundColor: '#121212',
            borderTopWidth: 1,
            borderTopColor: '#333',
            height: 70,
          },
          tabBarActiveTintColor: '#8b5cf6',
          tabBarInactiveTintColor: '#666',
          tabBarShowLabel: true,
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
            paddingBottom: 10,
          },
          tabBarIconStyle: {
            marginTop: 5,
          },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            href: '/home', // Always available
            headerTitle: '', // Set headerTitle to empty string to remove heading
            headerLeft: () => accountId ? (
              <TouchableOpacity
                onPress={() => setMenuVisible(true)}
                className="ml-4 p-2"
              >
                <Ionicons name="menu" size={28} color="white" />
              </TouchableOpacity>
            ) : null,
            tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />,
            tabBarLabel: 'Home'
          }}
        />

        <Tabs.Screen
          name="dashboard"
          options={{
            href: accountId ? '/dashboard' : null, // Only show tab if logged in
            headerTitle: '',
            headerLeft: () => (
              <TouchableOpacity
                onPress={() => setMenuVisible(true)}
                className="ml-4 p-2"
              >
                <Ionicons name="menu" size={28} color="white" />
              </TouchableOpacity>
            ),
            tabBarIcon: ({ color }) => <Ionicons name="stats-chart" size={24} color={color} />,
            tabBarLabel: 'Dashboard'
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            headerShown: true,
            headerTitle: '',
            headerLeft: () => accountId ? (
              <TouchableOpacity
                onPress={() => setMenuVisible(true)}
                className="ml-4 p-2"
              >
                <Ionicons name="menu" size={28} color="white" />
              </TouchableOpacity>
            ) : null,
            tabBarIcon: ({ color }) => <Ionicons name="search" size={24} color={color} />,
            tabBarLabel: 'Search'
          }}
        />
        <Tabs.Screen
          name="pro"
          options={{
            headerShown: true,
            headerTitle: '',
            headerLeft: () => accountId ? (
              <TouchableOpacity
                onPress={() => setMenuVisible(true)}
                className="ml-4 p-2"
              >
                <Ionicons name="menu" size={28} color="white" />
              </TouchableOpacity>
            ) : null,
            tabBarIcon: ({ color }) => <Ionicons name="trophy" size={24} color={color} />,
            tabBarLabel: 'Pro Scene'
          }}
        />
      </Tabs>

      {menuVisible && (
        <Modal
          transparent={true}
          visible={menuVisible}
          onRequestClose={() => setMenuVisible(false)}
          animationType="fade"
        >
          <Pressable
            style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}
            onPress={() => setMenuVisible(false)}
          >
            <View className="absolute top-16 left-4 bg-zinc-900 border border-zinc-800 rounded-lg w-48 py-2 shadow-2xl">
              <TouchableOpacity
                onPress={() => {
                  setMenuVisible(false);
                  logout();
                }}
                className="px-4 py-3 flex-row items-center active:bg-zinc-800"
              >
                <Ionicons name="log-out-outline" size={20} color="#ef4444" />
                <Text className="text-red-500 ml-3 font-medium">Logout</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setMenuVisible(false)}
                className="px-4 py-3 border-t border-zinc-800 flex-row items-center active:bg-zinc-800"
              >
                <Ionicons name="settings-outline" size={20} color="white" />
                <Text className="text-white ml-3">Settings</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Modal>
      )}
    </>
  );
}
