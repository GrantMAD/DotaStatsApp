import { Tabs, Redirect, usePathname, useRouter } from 'expo-router';
import { TouchableOpacity, View, Text, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSupabaseAuth } from '../../src/context/SupabaseAuthContext';
import { useState, createContext, useContext } from 'react';

// Create a simple context to manage the side menu
const MenuContext = createContext({
  setMenuVisible: (visible: boolean) => {},
});

export const useMenu = () => useContext(MenuContext);

export default function TabsLayout() {
  const { session, isLoading, signOut } = useSupabaseAuth();
  const [menuVisible, setMenuVisible] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // If not logged in and trying to access a protected route, redirect to welcome
  if (!isLoading && !session && pathname !== '/search' && pathname !== '/home' && pathname !== '/pro') {
    return <Redirect href="/welcome" />;
  }

  return (
    <MenuContext.Provider value={{ setMenuVisible }}>
      <Tabs
        screenOptions={{
          headerShown: false,
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
            href: '/home',
            tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />,
            tabBarLabel: 'Home'
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            href: null,
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            tabBarIcon: ({ color }) => <Ionicons name="search" size={24} color={color} />,
            tabBarLabel: 'Search'
          }}
        />
        <Tabs.Screen
          name="pro"
          options={{
            tabBarIcon: ({ color }) => <Ionicons name="trophy" size={24} color={color} />,
            tabBarLabel: 'Pro Scene'
          }}
        />
        <Tabs.Screen
          name="friends"
          options={{
            href: null,
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            href: null,
            headerShown: false,
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
            <View className="absolute top-16 left-4 bg-zinc-900 border border-zinc-800 rounded-lg w-56 py-2 shadow-2xl">
              <View className="px-4 py-2 mb-1 border-b border-zinc-800/50">
                <Text className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">Navigation</Text>
              </View>

              <TouchableOpacity
                onPress={() => {
                  setMenuVisible(false);
                  router.push('/(tabs)/profile');
                }}
                className="px-4 py-3 flex-row items-center active:bg-zinc-800"
              >
                <Ionicons name="person-outline" size={20} color="white" />
                <Text className="text-white ml-3 font-medium">My Profile</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setMenuVisible(false);
                  router.push('/(tabs)/friends');
                }}
                className="px-4 py-3 flex-row items-center active:bg-zinc-800"
              >
                <Ionicons name="people-outline" size={20} color="white" />
                <Text className="text-white ml-3 font-medium">Friends</Text>
              </TouchableOpacity>

              <View className="px-4 py-2 mt-2 mb-1 border-b border-zinc-800/50">
                <Text className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">System</Text>
              </View>

              <TouchableOpacity
                onPress={() => {
                  setMenuVisible(false);
                  router.push('/(tabs)/settings');
                }}
                className="px-4 py-3 flex-row items-center active:bg-zinc-800"
              >
                <Ionicons name="settings-outline" size={20} color="white" />
                <Text className="text-white ml-3 font-medium">Settings</Text>
              </TouchableOpacity>

              <View className="h-[1px] bg-zinc-800 mx-2 my-1" />

              <TouchableOpacity
                onPress={() => {
                  setMenuVisible(false);
                  signOut();
                }}
                className="px-4 py-3 flex-row items-center active:bg-zinc-800"
              >
                <Ionicons name="log-out-outline" size={20} color="#ef4444" />
                <Text className="text-red-500 ml-3 font-medium">Logout</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Modal>
      )}
    </MenuContext.Provider>
  );
}
